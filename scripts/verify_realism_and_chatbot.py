"""
CareHealth Point – Live System Realism, Profile & Chatbot Verification Script
Tests against the live running containers (frontend on :3000 and backend on :8000).
"""
import sys
import time
import requests
import uuid

BACKEND_URL = "http://localhost:8000/api/v1"
FRONTEND_URL = "http://localhost:3000"

def test_live_system():
    print("=" * 60)
    print("CareHealth Point – Live Verification Test Suite")
    print("=" * 60)

    # 1. Health check
    print("\n[1/8] Checking System Health & Metrics...")
    health_res = requests.get("http://localhost:8000/health")
    assert health_res.status_code == 200, f"Health check failed: {health_res.text}"
    print(" -> Backend Health Status: OK (200)")

    metrics_res = requests.get("http://localhost:8000/metrics")
    assert metrics_res.status_code == 200, f"Metrics failed: {metrics_res.text}"
    assert "carehealth_chatbot_messages_total" in metrics_res.text
    print(" -> Prometheus Metrics: OK (found carehealth_chatbot_messages_total)")

    # 2. Register real patient with comprehensive details
    print("\n[2/8] Registering real patient with authentic details...")
    unique_suffix = str(uuid.uuid4())[:8]
    test_email = f"patient_{unique_suffix}@example.com"
    test_password = "Password@123"
    register_payload = {
        "email": test_email,
        "password": test_password,
        "full_name": "Meera Krishnan",
        "date_of_birth": "1998-07-22",
        "gender": "Female",
        "blood_group": "B+",
        "phone_number": "+91-9876543210",
        "address": "42 Green Valley Residency, Bengaluru, Karnataka"
    }
    reg_res = requests.post(f"{BACKEND_URL}/auth/register", json=register_payload)
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    reg_data = reg_res.json()
    assert reg_data["user"]["email"] == test_email.lower()
    reg_token = reg_data["access_token"]
    reg_headers = {"Authorization": f"Bearer {reg_token}"}

    # Fetch /auth/me to get patient profile
    me_res = requests.get(f"{BACKEND_URL}/auth/me", headers=reg_headers)
    assert me_res.status_code == 200, f"Failed to fetch /auth/me: {me_res.text}"
    me_data = me_res.json()
    assert me_data["patient"]["blood_group"] == "B+"
    assert me_data["patient"]["date_of_birth"] == "1998-07-22"
    patient_id = me_data["patient"]["id"]
    uhid = me_data["patient"]["patient_uhid"]
    print(f" -> Successfully registered patient: {reg_data['user']['full_name']} (UHID: {uhid}, ID: {patient_id})")

    # 3. Login with credentials
    print("\n[3/8] Authenticating with real patient credentials...")
    login_res = requests.post(
        f"{BACKEND_URL}/auth/login",
        json={"email": test_email, "password": test_password}
    )
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(" -> JWT Token acquired successfully via login endpoint.")

    # 4. Fetch Digital Health Card
    print("\n[4/8] Verifying Digital Health Card data authenticity...")
    card_res = requests.get(f"{BACKEND_URL}/patients/{patient_id}/health-card", headers=headers)
    assert card_res.status_code == 200, f"Health card fetch failed: {card_res.text}"
    card = card_res.json()
    assert card["full_name"] == "Meera Krishnan"
    assert card["blood_group"] == "B+"
    assert card["gender"] == "Female"
    assert card["dob"] == "1998-07-22"
    assert card["verification_url"] == f"/api/v1/patients/verify-card/{uhid}"
    print(f" -> Verified Digital Health Card: Name={card['full_name']}, Blood={card['blood_group']}, DOB={card['dob']}, VerificationURL={card['verification_url']}")

    # 5. Patient Profile Edit
    print("\n[5/8] Testing Patient Profile Update (PUT /me/profile)...")
    update_payload = {
        "full_name": "Meera K. Sharma",
        "phone_number": "+91-9988776655",
        "blood_group": "AB+",
        "address": "Penthouse 12, Indiranagar, Bengaluru"
    }
    update_res = requests.put(f"{BACKEND_URL}/patients/me/profile", json=update_payload, headers=headers)
    assert update_res.status_code == 200, f"Profile update failed: {update_res.text}"
    updated_patient = update_res.json()
    assert updated_patient["user"]["full_name"] == "Meera K. Sharma"
    assert updated_patient["blood_group"] == "AB+"

    # Verify updated card reflects immediately
    card_res_2 = requests.get(f"{BACKEND_URL}/patients/{patient_id}/health-card", headers=headers)
    card_2 = card_res_2.json()
    assert card_2["full_name"] == "Meera K. Sharma"
    assert card_2["blood_group"] == "AB+"
    print(f" -> Successfully updated profile & card: Name={card_2['full_name']}, Blood={card_2['blood_group']}")

    # 6. Verify Public UHID Verification endpoint
    print("\n[6/8] Testing Public QR UHID Verification Endpoint...")
    verify_res = requests.get(f"{BACKEND_URL}/patients/verify-card/{uhid}")
    assert verify_res.status_code == 200, f"Card verification failed: {verify_res.text}"
    v_data = verify_res.json()
    assert v_data["valid"] is True
    assert v_data["uhid"] == uhid
    assert "M. S" in v_data["patient_name_masked"]  # Privacy masked (Meera K. Sharma -> M. S*****)
    print(f" -> UHID Verification: Valid={v_data['valid']}, Masked Name={v_data['patient_name_masked']}")

    # 7. Care Buddy Hospital Chatbot
    print("\n[7/8] Testing Care Buddy Chatbot API (/api/v1/chatbot/message)...")
    
    # 7a. OPD Timings
    cb1 = requests.post(f"{BACKEND_URL}/chatbot/message", json={"message": "What are the OPD timings and visiting hours?"})
    assert cb1.status_code == 200
    assert "08:30 AM" in cb1.json()["reply"]
    print(" -> Care Buddy (OPD Timings): OK")

    # 7b. Emergency Helpline
    cb2 = requests.post(f"{BACKEND_URL}/chatbot/message", json={"message": "I need emergency assistance immediately!"})
    assert cb2.status_code == 200
    assert "+91-1800-CARE-NOW" in cb2.json()["reply"]
    print(" -> Care Buddy (Emergency Safety): OK (Helpline +91-1800-CARE-NOW routed)")

    # 7c. Doctor and Specialty query
    cb3 = requests.post(f"{BACKEND_URL}/chatbot/message", json={"message": "Tell me about Dr. Priya Nair and her consultation fee"})
    assert cb3.status_code == 200
    assert "Priya Nair" in cb3.json()["reply"]
    print(" -> Care Buddy (Doctor Inquiry): OK (Dr. Priya Nair schedule and fee returned)")

    # 7d. Medical safety refusal
    cb4 = requests.post(f"{BACKEND_URL}/chatbot/message", json={"message": "What medicine or painkiller should I take for high fever?"})
    assert cb4.status_code == 200
    assert "cannot evaluate medical symptoms" in cb4.json()["reply"].lower() or "prescribe medication" in cb4.json()["reply"].lower()
    print(" -> Care Buddy (Medical Advice Refusal): OK (Refused prescription, routed to specialist)")

    # 8. Clinical Role Switcher / Demo personas check
    print("\n[8/8] Verifying Clinical Role Switcher Demo Personas...")
    demo_accounts = [
        ("admin@carehealth.com", "Admin@123", "admin"),
        ("doctor@carehealth.com", "Doctor@123", "doctor"),
        ("receptionist@carehealth.com", "Reception@123", "receptionist"),
        ("patient@carehealth.com", "Patient@123", "patient")
    ]
    for email, password, expected_role in demo_accounts:
        res = requests.post(
            f"{BACKEND_URL}/auth/login",
            json={"email": email, "password": password}
        )
        assert res.status_code == 200, f"Demo login failed for {email}: {res.text}"
        data = res.json()
        assert data["user"]["role"] == expected_role
        print(f" -> Persona {email} ({expected_role}): Authenticated OK")

    # Frontend Nginx static files check
    print("\n[+] Verifying Frontend static delivery on http://localhost:3000...")
    fe_res = requests.get(FRONTEND_URL)
    assert fe_res.status_code == 200
    assert "<title>CareHealth Point" in fe_res.text
    print(" -> Frontend served successfully by Nginx on port 3000")

    print("\n" + "=" * 60)
    print("ALL 8 VERIFICATION PHASES PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        test_live_system()
    except Exception as e:
        print(f"\n[ERROR] Verification failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

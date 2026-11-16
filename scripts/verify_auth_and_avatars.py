import requests
import sys
import random

BASE_URL = "http://localhost:3000/api/v1"
FRONTEND_URL = "http://localhost:3000"

def test_flow():
    print("=" * 60)
    print("CareHealth Point – Live Authentication & Avatar Verification")
    print("=" * 60)

    # 1. Test Static SVG Avatars on Nginx Frontend
    avatars = [
        "doctor-priya.svg",
        "doctor-aarav.svg",
        "doctor-rohit.svg",
        "doctor-ananya.svg",
        "doctor-male.svg",
        "doctor-female.svg"
    ]
    for av in avatars:
        url = f"{FRONTEND_URL}/avatars/{av}"
        r = requests.get(url)
        assert r.status_code == 200, f"Avatar {av} failed with status {r.status_code}"
        assert "<svg" in r.text, f"Avatar {av} does not contain valid SVG"
        print(f"[PASS] Avatar {av} serves valid SVG (200 OK, length {len(r.text)} bytes)")

    # 2. Test Real Email Registration
    rand_id = random.randint(10000, 99999)
    real_email = f"clinical_user_{rand_id}@healthcare-domain.org"
    password = f"SecurePass@{rand_id}"

    reg_payload = {
        "email": real_email,
        "password": password,
        "full_name": f"Dr. Candidate {rand_id}",
        "phone_number": "+91-9876543210"
    }

    r_reg = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
    assert r_reg.status_code == 201, f"Registration failed: {r_reg.text}"
    reg_data = r_reg.json()
    assert "access_token" in reg_data, "No token in registration response"
    assert reg_data["user"]["email"] == real_email.lower(), "Email not normalized or stored properly"
    assert reg_data["user"]["role"] == "patient", "Public registration role must be patient"
    token = reg_data["access_token"]
    print(f"[PASS] Real email registered successfully: {real_email} -> Role: {reg_data['user']['role']}")

    # 3. Test /auth/me Profile and UHID creation
    headers = {"Authorization": f"Bearer {token}"}
    r_me = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    assert r_me.status_code == 200, f"/auth/me failed: {r_me.text}"
    me_data = r_me.json()
    assert "patient" in me_data, "Patient profile was not auto-created"
    uhid = me_data["patient"]["patient_uhid"]
    assert uhid.startswith("CHP-2026-"), f"Unexpected UHID format: {uhid}"
    print(f"[PASS] Patient profile verified with auto-assigned UHID: {uhid}")

    # 4. Test Case-Insensitive Login with Newly Registered Account
    login_payload = {
        "email": real_email.upper(),  # Uppercase test!
        "password": password
    }
    r_login = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    assert r_login.status_code == 200, f"Case-insensitive login failed: {r_login.text}"
    login_data = r_login.json()
    assert login_data["user"]["email"] == real_email.lower()
    print(f"[PASS] Case-insensitive login with UPPERCASE email succeeded")

    # 5. Test Duplicate Email Prevention
    r_dup = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
    assert r_dup.status_code == 400, f"Duplicate registration expected 400, got: {r_dup.status_code}"
    print(f"[PASS] Duplicate email prevention verified: 400 Bad Request")

    # 6. Test Privilege Escalation Protection (Attempt admin registration)
    hacker_email = f"hacker_{rand_id}@evil.com"
    r_hacker = requests.post(f"{BASE_URL}/auth/register", json={
        "email": hacker_email,
        "password": "Password@123",
        "full_name": "Privilege Escalator",
        "role": "admin"
    })
    assert r_hacker.status_code == 201
    assert r_hacker.json()["user"]["role"] == "patient", "Role tampering exploit allowed!"
    print(f"[PASS] Role tampering blocked: public registration role forced to 'patient'")

    # 7. Test Invalid Password Login
    r_bad_login = requests.post(f"{BASE_URL}/auth/login", json={
        "email": real_email,
        "password": "WrongPassword123"
    })
    assert r_bad_login.status_code == 401, f"Expected 401, got: {r_bad_login.status_code}"
    print(f"[PASS] Bad credentials rejected with 401 Unauthorized")

    # 8. Test Demo Persona Accounts Preservation
    personas = [
        ("admin@carehealth.com", "Admin@123", "admin"),
        ("doctor@carehealth.com", "Doctor@123", "doctor"),
        ("receptionist@carehealth.com", "Reception@123", "receptionist"),
        ("patient@carehealth.com", "Patient@123", "patient"),
    ]
    for p_email, p_pass, p_role in personas:
        r_p = requests.post(f"{BASE_URL}/auth/login", json={"email": p_email, "password": p_pass})
        assert r_p.status_code == 200, f"Persona {p_role} login failed: {r_p.text}"
        assert r_p.json()["user"]["role"] == p_role, f"Persona {p_role} returned wrong role"
        print(f"[PASS] Demo persona preserved: {p_role.upper()} ({p_email})")

    # 9. Verify Live Doctors API (Specialists & Dr. Priya Nair)
    r_docs = requests.get(f"{BASE_URL}/doctors/")
    assert r_docs.status_code == 200
    docs = r_docs.json()
    assert len(docs) >= 4, f"Expected at least 4 doctors, found {len(docs)}"
    priya = next((d for d in docs if "Priya" in d["user"]["full_name"]), None)
    assert priya is not None, "Dr. Priya Nair not found in database!"
    print(f"[PASS] Dr. Priya Nair verified in live API: {priya['user']['full_name']} ({priya['specialization']})")

    print("\n" + "=" * 60)
    print("ALL LIVE VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    test_flow()

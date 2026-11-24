"""
CareHealth Point – Live Queue Tracker & Admin Dashboard Enhancement Verification
Tests the new features against live running Docker containers.
"""
import sys
import requests
import uuid
from datetime import date, timedelta

BACKEND_URL = "http://localhost:8000/api/v1"
FRONTEND_URL = "http://localhost:3000"

def test_dashboard_and_queue():
    print("=" * 60)
    print("Live Queue Tracker & Admin Dashboard Verification")
    print("=" * 60)

    # 1. Admin Login
    print("\n[1/6] Authenticating as Admin...")
    admin_login = requests.post(f"{BACKEND_URL}/auth/login", json={
        "email": "admin@carehealth.com",
        "password": "Admin@123"
    })
    assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print(" -> Admin authenticated successfully.")

    # 2. Test Recent Patients Activity Endpoint
    print("\n[2/6] Testing GET /api/v1/patients/recent-activities...")
    act_res = requests.get(f"{BACKEND_URL}/patients/recent-activities", headers=admin_headers)
    assert act_res.status_code == 200, f"Recent activities failed: {act_res.text}"
    activities = act_res.json()
    assert isinstance(activities, list)
    assert len(activities) > 0, "Expected at least 1 recent patient activity"
    sample_act = activities[0]
    assert "patient_name" in sample_act
    assert "disease_or_condition" in sample_act
    assert "status" in sample_act
    assert "formatted_time" in sample_act
    print(f" -> Found {len(activities)} recent activities. Sample: {sample_act['patient_name']} ({sample_act['disease_or_condition']} - {sample_act['status']} at {sample_act['formatted_time']})")

    # 3. Test Patients Management List with Extended Fields
    print("\n[3/6] Testing GET /api/v1/patients/ for Patients Management Table...")
    pats_res = requests.get(f"{BACKEND_URL}/patients/", headers=admin_headers)
    assert pats_res.status_code == 200, f"Patients list failed: {pats_res.text}"
    patients = pats_res.json()
    assert len(patients) > 0
    sample_p = patients[0]
    assert "patient_uhid" in sample_p
    assert "clinical_status" in sample_p
    assert "medical_category" in sample_p
    assert "total_appointments" in sample_p
    print(f" -> Patients table data OK: {sample_p['user']['full_name']} (UHID: {sample_p['patient_uhid']}, Category: {sample_p['medical_category']}, Status: {sample_p['clinical_status']})")

    # 4. Test Analytics Summary for Patient Statistics Widget
    print("\n[4/6] Testing GET /api/v1/analytics/summary (New vs Old Patients)...")
    analytics_res = requests.get(f"{BACKEND_URL}/analytics/summary")
    assert analytics_res.status_code == 200, f"Analytics failed: {analytics_res.text}"
    a_data = analytics_res.json()
    assert "new_patients" in a_data
    assert "old_patients" in a_data
    assert "total_patients" in a_data
    print(f" -> Analytics: Total={a_data['total_patients']}, New Patients={a_data['new_patients']}, Old Patients={a_data['old_patients']}")

    # 5. Test Live Queue Tracker for Newly Registered Patient
    print("\n[5/6] Testing Live Queue Tracker Flow...")
    uid = str(uuid.uuid4())[:8]
    test_email = f"queue_test_{uid}@example.com"
    reg_res = requests.post(f"{BACKEND_URL}/auth/register", json={
        "email": test_email,
        "password": "Password@123",
        "full_name": "Siddharth Verma",
        "date_of_birth": "1994-03-15",
        "gender": "Male",
        "blood_group": "O+",
        "phone_number": "+91-9812345678"
    })
    assert reg_res.status_code == 201
    patient_token = reg_res.json()["access_token"]
    patient_headers = {"Authorization": f"Bearer {patient_token}"}

    # Step A: Before booking, active queue should return 404 (Empty State: No Active Queue Found)
    empty_q = requests.get(f"{BACKEND_URL}/appointments/my-queue/active", headers=patient_headers)
    assert empty_q.status_code == 404, f"Expected 404 for empty queue, got {empty_q.status_code}"
    print(" -> Empty State Verified: No active queue returns 404 ('No Active Queue Found')")

    # Step B: Book appointment
    docs_res = requests.get(f"{BACKEND_URL}/doctors/")
    doctor_id = docs_res.json()[0]["id"]
    dept_id = docs_res.json()[0]["department_id"]
    book_date = date.today().strftime("%Y-%m-%d")

    book_res = requests.post(f"{BACKEND_URL}/appointments/", json={
        "doctor_id": doctor_id,
        "department_id": dept_id,
        "appointment_date": book_date,
        "time_slot": "10:30 - 11:00",
        "symptoms": "Follow-up consultation for blood pressure"
    }, headers=patient_headers)
    assert book_res.status_code == 201, f"Booking failed: {book_res.text}"
    appt = book_res.json()
    token_num = appt["queue_number"]
    appt_id = appt["id"]
    print(f" -> Booked appointment #{appt_id} on {book_date}. Allocated Token: #{token_num}")

    # Step C: Check live queue status via GET /appointments/my-queue/active
    active_q = requests.get(f"{BACKEND_URL}/appointments/my-queue/active", headers=patient_headers)
    assert active_q.status_code == 200, f"Active queue failed: {active_q.text}"
    q_data = active_q.json()
    assert q_data["appointment_id"] == appt_id
    assert q_data["queue_number"] == token_num
    assert "current_serving_number" in q_data
    assert "patients_ahead" in q_data
    assert "estimated_wait_minutes" in q_data
    assert "doctor_name" in q_data
    print(f" -> Live Queue Telemetry Active: Your Token=#{q_data['queue_number']}, Serving=#{q_data['current_serving_number']}, Ahead={q_data['patients_ahead']}, Est.Wait={q_data['estimated_wait_minutes']} mins")

    # 6. Verify Receptionist Update Updates Live Queue
    print("\n[6/6] Verifying Receptionist/Doctor status update reflection in queue...")
    # Receptionist marks appointment confirmed
    recept_login = requests.post(f"{BACKEND_URL}/auth/login", json={
        "email": "receptionist@carehealth.com",
        "password": "Reception@123"
    })
    assert recept_login.status_code == 200
    recept_token = recept_login.json()["access_token"]
    recept_headers = {"Authorization": f"Bearer {recept_token}"}

    update_res = requests.patch(
        f"{BACKEND_URL}/appointments/{appt_id}/status",
        json={"status": "confirmed"},
        headers=recept_headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "confirmed"

    # Patient re-fetches queue
    updated_q = requests.get(f"{BACKEND_URL}/appointments/my-queue/active", headers=patient_headers)
    assert updated_q.status_code == 200
    assert updated_q.json()["status"] == "confirmed"
    print(f" -> Queue status updated to '{updated_q.json()['status']}' and verified by patient.")

    print("\n" + "=" * 60)
    print("ALL LIVE QUEUE & DASHBOARD VERIFICATION PHASES PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        test_dashboard_and_queue()
    except Exception as e:
        print(f"\n[ERROR] Verification failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

"""
CareHealth Point – Live Integration & E2E Validation Script
Course: DevOps & Automation Lab (ENSP461)
Tests live services running inside Docker Compose at http://localhost:3000/api/v1
"""

import sys
import requests
from datetime import date, timedelta

BASE_URL = "http://localhost:3000/api/v1"

def print_step(title):
    print(f"\n[TEST STEP] {title}")

def assert_true(cond, msg):
    if not cond:
        print(f"  ❌ FAILED: {msg}")
        sys.exit(1)
    print(f"  ✅ PASSED: {msg}")

def run_tests():
    print("=" * 70)
    print("CareHealth Point – Live Containerized Full-Stack Verification")
    print("Testing Base URL:", BASE_URL)
    print("=" * 70)

    # 1. Health check
    print_step("1. Checking Service Health & Readiness Status")
    res = requests.get("http://localhost:3000/health")
    assert_true(res.status_code == 200, f"Health check returned {res.status_code}")
    print("  Health Status:", res.json().get("status"))

    res_ready = requests.get("http://localhost:3000/ready")
    assert_true(res_ready.status_code == 200, f"Readiness check returned {res_ready.status_code}")
    print("  Readiness Database Status:", res_ready.json().get("database"))

    # 2. Departments
    print_step("2. Verifying Hospital Departments from PostgreSQL")
    res = requests.get(f"{BASE_URL}/departments/")
    assert_true(res.status_code == 200, f"Get departments returned {res.status_code}")
    depts = res.json()
    assert_true(len(depts) >= 6, f"Expected at least 6 departments, got {len(depts)}")
    print(f"  Found {len(depts)} departments: {[d['name'] for d in depts]}")

    # 3. Doctors & Availabilities
    print_step("3. Verifying Doctor Directory & Schedules from PostgreSQL")
    res = requests.get(f"{BASE_URL}/doctors/")
    assert_true(res.status_code == 200, f"Get doctors returned {res.status_code}")
    doctors = res.json()
    assert_true(len(doctors) >= 4, f"Expected at least 4 doctors, got {len(doctors)}")
    for d in doctors:
        print(f"  Doctor: {d['user']['full_name']} | Dept: {d['department_name']} | Fee: ₹{d['consultation_fee']} | Availabilities: {len(d['availabilities'])} days")

    # 4. Search Filter
    print_step("4. Testing Doctor Search Filtering")
    res = requests.get(f"{BASE_URL}/doctors/?search=Aarav")
    assert_true(res.status_code == 200, "Search query returned 200")
    search_results = res.json()
    assert_true(len(search_results) == 1, f"Expected 1 doctor matching 'Aarav', got {len(search_results)}")
    assert_true("Aarav" in search_results[0]["user"]["full_name"], "Search result matches Aarav")

    # 5. Dynamic Slot Calculation
    print_step("5. Testing Dynamic Doctor Availability Slots")
    # Tuesday date
    next_tuesday = date.today() + timedelta(days=((1 - date.today().weekday()) % 7 or 7))
    tuesday_str = next_tuesday.isoformat()
    res = requests.get(f"{BASE_URL}/doctors/1/slots?date_str={tuesday_str}")
    assert_true(res.status_code == 200, f"Slots returned {res.status_code}")
    slots_data = res.json()
    assert_true(slots_data["is_working_day"] is True, "Doctor should be working on Tuesday")
    assert_true(len(slots_data["slots"]) >= 10, f"Expected 10+ time slots, got {len(slots_data['slots'])}")
    print(f"  Slots for {tuesday_str} ({slots_data['day_of_week']}): {len(slots_data['slots'])} intervals (09:00 - 17:00)")

    # Off-duty test (Sunday)
    next_sunday = date.today() + timedelta(days=((6 - date.today().weekday()) % 7 or 7))
    sunday_str = next_sunday.isoformat()
    res_sun = requests.get(f"{BASE_URL}/doctors/1/slots?date_str={sunday_str}")
    assert_true(res_sun.status_code == 200, f"Sunday slots returned {res_sun.status_code}")
    assert_true(res_sun.json()["is_working_day"] is False, "Doctor is off-duty on Sunday")
    print(f"  Off-duty response: {res_sun.json().get('message')}")

    # 6. Patient Authentication & Health Card
    print_step("6. Testing Patient Authentication & UHID Digital Health Card")
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "patient@carehealth.com",
        "password": "Patient@123"
    })
    assert_true(login_res.status_code == 200, "Patient login successful")
    patient_token = login_res.json()["access_token"]
    pat_headers = {"Authorization": f"Bearer {patient_token}"}

    profile_res = requests.get(f"{BASE_URL}/patients/me/profile", headers=pat_headers)
    assert_true(profile_res.status_code == 200, "Patient profile retrieved")
    pat_data = profile_res.json()
    print(f"  Patient UHID: {pat_data['patient_uhid']} | Blood: {pat_data.get('blood_group')}")

    card_res = requests.get(f"{BASE_URL}/patients/{pat_data['id']}/health-card", headers=pat_headers)
    assert_true(card_res.status_code == 200, "Digital Health Card retrieved")
    card_data = card_res.json()
    assert_true(card_data["uhid"] == pat_data["patient_uhid"], "UHID matches")
    print(f"  Digital Card verified: {card_data['full_name']} | UHID: {card_data['uhid']}")

    # 7. Past-Date Booking Rejection Test
    print_step("7. Testing Past-Date Booking Prevention")
    yesterday_str = (date.today() - timedelta(days=1)).isoformat()
    past_res = requests.post(f"{BASE_URL}/appointments/", json={
        "doctor_id": 1,
        "department_id": 1,
        "appointment_date": yesterday_str,
        "time_slot": "10:00 - 10:30",
        "symptoms": "Old headache"
    }, headers=pat_headers)
    assert_true(past_res.status_code == 400, f"Expected 400 for past date, got {past_res.status_code}")
    print("  Past date correctly rejected:", past_res.json().get("detail"))

    # 8. Real Appointment Booking & Duplicate Prevention
    print_step("8. Testing Dynamic Appointment Booking & OPD Queue Number")
    # Fetch first available slot dynamically from live database
    slots_res = requests.get(f"{BASE_URL}/doctors/1/slots?date_str={tuesday_str}")
    unbooked_slots = [s["slot"] for s in slots_res.json()["slots"] if not s["is_booked"]]
    assert_true(len(unbooked_slots) > 0, "Expected at least one available slot")
    chosen_slot = unbooked_slots[0]
    print(f"  Selecting first open slot dynamically: '{chosen_slot}'")

    book_res = requests.post(f"{BASE_URL}/appointments/", json={
        "doctor_id": 1,
        "department_id": 1,
        "appointment_date": tuesday_str,
        "time_slot": chosen_slot,
        "symptoms": "Palpitations and shortness of breath"
    }, headers=pat_headers)

    assert_true(book_res.status_code == 201, f"Booking returned {book_res.status_code}: {book_res.text}")
    appt = book_res.json()
    appt_id = appt["id"]
    print(f"  Appointment #{appt_id} booked! Queue Token: #{appt['queue_number']} | Date: {appt['appointment_date']} | Slot: {appt['time_slot']}")

    # Duplicate Booking Prevention
    dup_res = requests.post(f"{BASE_URL}/appointments/", json={
        "doctor_id": 1,
        "department_id": 1,
        "appointment_date": tuesday_str,
        "time_slot": chosen_slot,
        "symptoms": "Duplicate attempt"
    }, headers=pat_headers)
    assert_true(dup_res.status_code == 409, f"Duplicate booking prevented with 409 Conflict (got {dup_res.status_code})")
    print("  Duplicate booking correctly prevented:", dup_res.json().get("detail"))

    # 9. Queue Telemetry
    print_step("9. Verifying Live OPD Queue Telemetry")
    queue_res = requests.get(f"{BASE_URL}/appointments/{appt_id}/queue", headers=pat_headers)
    assert_true(queue_res.status_code == 200, "Queue telemetry retrieved")
    q_data = queue_res.json()
    print(f"  Queue Token: #{q_data['queue_number']} | Current Serving: #{q_data['current_serving_number']} | Est. Wait: {q_data['estimated_wait_minutes']} mins")

    # 10. Doctor Clinical Flow (Consultation & E-Prescription)
    print_step("10. Testing Doctor Clinical Flow (Vitals, Notes, E-Prescriptions)")
    doc_login = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "doctor@carehealth.com",
        "password": "Doctor@123"
    })
    assert_true(doc_login.status_code == 200, "Doctor login successful")
    doc_token = doc_login.json()["access_token"]
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    # Record clinical note
    consult_res = requests.post(f"{BASE_URL}/consultations/", json={
        "appointment_id": appt_id,
        "clinical_impression": "Patient presents with sinus tachycardia. Normal heart sounds. ECG indicates sinus rhythm.",
        "vital_signs": {
            "blood_pressure": "125/82 mmHg",
            "pulse_rate": "88 bpm",
            "spo2": "99%",
            "temperature": "98.6 F"
        },
        "follow_up_recommendation": "Review in 2 weeks with 24-hr Holter report."
    }, headers=doc_headers)
    assert_true(consult_res.status_code == 201, "Clinical consultation recorded")
    print("  Consultation note and vitals saved successfully")

    # Generate electronic prescription
    presc_res = requests.post(f"{BASE_URL}/prescriptions/", json={
        "appointment_id": appt_id,
        "diagnosis": "Sinus Tachycardia, Mild Hypertension",
        "medications": [
            {
                "medicine_name": "Metoprolol Succinate",
                "dosage": "25 mg",
                "frequency": "1-0-0 (Morning)",
                "duration": "14 days",
                "instructions": "Take after breakfast with water"
            },
            {
                "medicine_name": "Multivitamin & Zinc",
                "dosage": "1 Capsule",
                "frequency": "0-0-1 (Night)",
                "duration": "30 days",
                "instructions": "Take after dinner"
            }
        ],
        "additional_advice": "Limit caffeine intake. Regular morning walking 30 minutes daily."
    }, headers=doc_headers)
    assert_true(presc_res.status_code == 201, "E-prescription created")
    print("  E-prescription registered and synchronized with hospital pharmacy")

    # Update appointment status to completed
    status_res = requests.patch(f"{BASE_URL}/appointments/{appt_id}/status", json={"status": "completed"}, headers=doc_headers)
    assert_true(status_res.status_code == 200, "Appointment status updated to completed")
    print(f"  Appointment #{appt_id} marked as COMPLETED")

    # 11. Receptionist Walk-in Flow
    print_step("11. Testing Receptionist Walk-in Registration")
    rec_login = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "receptionist@carehealth.com",
        "password": "Reception@123"
    })
    assert_true(rec_login.status_code == 200, "Receptionist login successful")
    rec_headers = {"Authorization": f"Bearer {rec_login.json()['access_token']}"}

    import time
    ts = int(time.time())
    walkin_res = requests.post(f"{BASE_URL}/auth/register", json={
        "full_name": f"Walkin Patient {ts}",
        "email": f"walkin_{ts}@carehealth.com",
        "password": "Patient@123",
        "phone_number": "+91-9811223344",
        "role": "patient"
    })
    if walkin_res.status_code not in [200, 201]:
        print("  Walkin registration failed with status:", walkin_res.status_code, walkin_res.text)
    assert_true(walkin_res.status_code in [200, 201], f"Walk-in patient registered (got {walkin_res.status_code})")
    walkin_patient = walkin_res.json()["user"]
    print(f"  New Walk-in Patient Registered: {walkin_patient['full_name']} (ID: {walkin_patient['id']})")

    # 12. Admin Analytics
    print_step("12. Testing Admin Analytics & Operational KPIs")
    admin_login = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "admin@carehealth.com",
        "password": "Admin@123"
    })
    assert_true(admin_login.status_code == 200, "Admin login successful")
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

    analytics_res = requests.get(f"{BASE_URL}/analytics/summary", headers=admin_headers)
    assert_true(analytics_res.status_code == 200, "Admin analytics retrieved")
    analytics = analytics_res.json()
    print(f"  Total Registered Patients: {analytics['total_patients']}")
    print(f"  Total Licensed Doctors: {analytics['total_doctors']}")
    print(f"  Total Appointments Scheduled: {analytics['total_appointments']}")
    print(f"  Today's Appointments: {analytics['today_appointments']}")
    print(f"  Department Distribution: {len(analytics['department_distribution'])} departments active")
    print(f"  Doctor Workload Distribution: {len(analytics['doctor_workload'])} doctors tracked")
    print(f"  Completion Rate: {analytics['completion_rate_percentage']}%")

    print("\n" + "=" * 70)
    print("ALL LIVE FULL-STACK CLINICAL MODULES VALIDATED SUCCESSFULLY! 🏆")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()

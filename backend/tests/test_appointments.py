import datetime
import pytest

def test_past_date_booking_rejected(client, patient_token):
    headers = {"Authorization": f"Bearer {patient_token}"}
    yesterday = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
    
    res = client.post("/api/v1/appointments/", json={
        "doctor_id": 1,
        "department_id": 1,
        "appointment_date": yesterday,
        "time_slot": "10:00 - 10:30",
        "symptoms": "Old symptoms"
    }, headers=headers)

    assert res.status_code == 400
    assert "past dates" in res.json()["detail"].lower()

def test_dynamic_slots_availability(client):
    today = datetime.date.today().isoformat()
    res = client.get(f"/api/v1/doctors/1/slots?date_str={today}")
    assert res.status_code == 200
    data = res.json()
    assert data["is_working_day"] is True
    assert len(data["slots"]) > 0
    assert "09:00 - 09:30" in [s["slot"] for s in data["slots"]]

def test_book_appointment_and_prevent_duplicates(client, patient_token):
    headers = {"Authorization": f"Bearer {patient_token}"}
    today = datetime.date.today().isoformat()
    slot = "10:00 - 10:30"

    # 1. Book first appointment
    res1 = client.post("/api/v1/appointments/", json={
        "doctor_id": 1,
        "department_id": 1,
        "appointment_date": today,
        "time_slot": slot,
        "symptoms": "Mild fever and headache"
    }, headers=headers)

    assert res1.status_code == 201
    data1 = res1.json()
    assert data1["time_slot"] == slot
    assert data1["queue_number"] >= 1
    appt_id = data1["id"]

    # 2. Attempt duplicate booking for same doctor, date and slot -> MUST FAIL with 409 CONFLICT
    res2 = client.post("/api/v1/appointments/", json={
        "doctor_id": 1,
        "department_id": 1,
        "appointment_date": today,
        "time_slot": slot,
        "symptoms": "Another patient booking"
    }, headers=headers)

    assert res2.status_code == 409
    assert "already booked" in res2.json()["detail"].lower()

    # 3. Check queue status requires authentication
    unauth_queue = client.get(f"/api/v1/appointments/{appt_id}/queue")
    assert unauth_queue.status_code == 401

    # 4. Check queue status with patient token
    queue_res = client.get(f"/api/v1/appointments/{appt_id}/queue", headers=headers)
    assert queue_res.status_code == 200
    queue_data = queue_res.json()
    assert "queue_number" in queue_data
    assert "patients_ahead" in queue_data
    assert "estimated_wait_minutes" in queue_data

    # 5. Cancel appointment
    cancel_res = client.patch(f"/api/v1/appointments/{appt_id}/status", json={"status": "cancelled"}, headers=headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

import datetime

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

    # 3. Check queue status
    queue_res = client.get(f"/api/v1/appointments/{appt_id}/queue")
    assert queue_res.status_code == 200
    queue_data = queue_res.json()
    assert "queue_number" in queue_data
    assert "patients_ahead" in queue_data
    assert "estimated_wait_minutes" in queue_data

    # 4. Cancel appointment
    cancel_res = client.patch(f"/api/v1/appointments/{appt_id}/status", json={"status": "cancelled"}, headers=headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

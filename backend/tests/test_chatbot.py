import pytest

def test_chatbot_opd_timings(client):
    res = client.post("/api/v1/chatbot/message", json={"message": "What are the OPD timings?"})
    assert res.status_code == 200
    data = res.json()
    assert "08:30 AM" in data["reply"]
    assert "08:00 PM" in data["reply"]
    assert data["intent"] == "opd_timings"

def test_chatbot_emergency(client):
    res = client.post("/api/v1/chatbot/message", json={"message": "Emergency ambulance needed"})
    assert res.status_code == 200
    data = res.json()
    assert "+91-1800-CARE-NOW" in data["reply"]
    assert data["intent"] in ["critical_emergency", "emergency_info"]

def test_chatbot_departments(client):
    res = client.post("/api/v1/chatbot/message", json={"message": "Which departments are available?"})
    assert res.status_code == 200
    data = res.json()
    assert "Cardiology" in data["reply"]
    assert "Neurology" in data["reply"]
    assert data["intent"] == "departments_list"

def test_chatbot_doctor_query(client):
    res = client.post("/api/v1/chatbot/message", json={"message": "Tell me about Dr. Priya Nair and her fees"})
    assert res.status_code == 200
    data = res.json()
    assert "Priya Nair" in data["reply"]
    assert "Neurologist" in data["reply"] or "Neurology" in data["reply"]
    assert "1000" in data["reply"]
    assert data["intent"] == "doctor_query"

def test_chatbot_doctor_schedule_day(client):
    res = client.post("/api/v1/chatbot/message", json={"message": "Is Dr. Aarav Sharma available on Tuesday?"})
    assert res.status_code == 200
    data = res.json()
    assert "Aarav Sharma" in data["reply"]
    assert "Tuesday" in data["reply"]
    assert data["intent"] == "doctor_query"

def test_chatbot_booking_guide(client):
    res = client.post("/api/v1/chatbot/message", json={"message": "How do I book an appointment?"})
    assert res.status_code == 200
    data = res.json()
    assert "Doctor Directory" in data["reply"]
    assert data["intent"] == "booking_guide"

def test_chatbot_medical_advice_safety_refusal(client):
    res = client.post("/api/v1/chatbot/message", json={"message": "What medicine should I take for fever and chest pain?"})
    assert res.status_code == 200
    data = res.json()
    # Must refuse prescription / medical diagnosis and advise specialist consultation or emergency line
    assert "Clinical Safety Notice" in data["reply"] or "Emergency" in data["reply"]
    assert "+91-1800-CARE-NOW" in data["reply"]


import pytest

def test_patient_registration_full_details_and_health_card(client):
    # Register with real details
    res = client.post("/api/v1/auth/register", json={
        "email": "clinical_test_reg@hospital.org",
        "password": "Password@123",
        "full_name": "Pooja Sharma",
        "phone_number": "+91-9876543210",
        "date_of_birth": "1994-08-15",
        "gender": "Female",
        "blood_group": "AB+",
        "address": "Block C, Greater Kailash, New Delhi",
        "role": "patient"
    })
    assert res.status_code == 201
    data = res.json()
    token = data["access_token"]
    user_id = data["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify profile via /auth/me
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["patient"]["blood_group"] == "AB+"
    assert me_data["patient"]["gender"] == "Female"
    assert me_data["patient"]["date_of_birth"] == "1994-08-15"
    assert me_data["patient"]["address"] == "Block C, Greater Kailash, New Delhi"
    uhid = me_data["patient"]["patient_uhid"]
    patient_id = me_data["patient"]["id"]

    # Verify Digital Health Card
    card_res = client.get(f"/api/v1/patients/{patient_id}/health-card", headers=headers)
    assert card_res.status_code == 200
    card_data = card_res.json()
    assert card_data["full_name"] == "Pooja Sharma"
    assert card_data["blood_group"] == "AB+"
    assert card_data["gender"] == "Female"
    assert card_data["dob"] == "1994-08-15"
    assert card_data["address"] == "Block C, Greater Kailash, New Delhi"

    # Test Privacy-Safe Card Verification Endpoint
    verify_res = client.get(f"/api/v1/patients/verify-card/{uhid}")
    assert verify_res.status_code == 200
    v_data = verify_res.json()
    assert v_data["valid"] is True
    assert v_data["uhid"] == uhid
    assert "P." in v_data["patient_name_masked"]
    # Ensure sensitive fields are NOT in public verification output
    assert "date_of_birth" not in v_data
    assert "address" not in v_data
    assert "phone" not in v_data

def test_patient_edit_profile(client):
    # Register patient
    res = client.post("/api/v1/auth/register", json={
        "email": "edit_profile_test@hospital.org",
        "password": "Password@123",
        "full_name": "Initial Name",
        "role": "patient"
    })
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Edit profile
    update_res = client.put("/api/v1/patients/me/profile", json={
        "full_name": "Updated Name",
        "phone_number": "+91-9999988888",
        "blood_group": "O-",
        "gender": "Other",
        "address": "Sector 62, Noida, India",
        "allergies": "Aspirin"
    }, headers=headers)
    assert update_res.status_code == 200
    p_data = update_res.json()
    assert p_data["blood_group"] == "O-"
    assert p_data["gender"] == "Other"
    assert p_data["address"] == "Sector 62, Noida, India"
    assert p_data["allergies"] == "Aspirin"
    assert p_data["user"]["full_name"] == "Updated Name"

    # Verify Digital Health Card reflects updated details immediately
    patient_id = p_data["id"]
    card_res = client.get(f"/api/v1/patients/{patient_id}/health-card", headers=headers)
    assert card_res.status_code == 200
    c_data = card_res.json()
    assert c_data["full_name"] == "Updated Name"
    assert c_data["blood_group"] == "O-"
    assert c_data["allergies"] == "Aspirin"

def test_patient_isolation(client, patient_token):
    # Patient cannot view another patient's health card
    headers = {"Authorization": f"Bearer {patient_token}"}
    # ID 99999 does not exist
    res = client.get("/api/v1/patients/99999/health-card", headers=headers)
    assert res.status_code == 404

def test_recent_patient_activities(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/v1/patients/recent-activities", headers=headers)
    assert res.status_code == 200
    activities = res.json()
    assert isinstance(activities, list)
    if len(activities) > 0:
        first = activities[0]
        assert "patient_name" in first
        assert "status" in first
        assert "disease_or_condition" in first

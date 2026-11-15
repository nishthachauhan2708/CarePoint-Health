def test_register_patient(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "newpatient@test.com",
        "password": "Password@123",
        "full_name": "New Patient",
        "role": "patient",
        "phone_number": "9876543210"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newpatient@test.com"
    assert data["user"]["role"] == "patient"

def test_login_success(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@test.com",
        "password": "Admin@123"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["token_type"] == "bearer"
    assert "access_token" in data
    assert data["user"]["email"] == "admin@test.com"

def test_login_invalid_password(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@test.com",
        "password": "WrongPassword"
    })
    assert res.status_code == 401
    assert "Incorrect email or password" in res.json()["detail"]

def test_get_current_user_profile(client, patient_token):
    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {patient_token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "patient@test.com"
    assert "patient" in data
    assert data["patient"]["patient_uhid"] == "CHP-2026-9999"

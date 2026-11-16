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

def test_register_role_escalation_blocked(client):
    """Ensure public registration cannot grant admin or doctor role."""
    res = client.post("/api/v1/auth/register", json={
        "email": "hacker@test.com",
        "password": "Password@123",
        "full_name": "Attempted Admin",
        "role": "admin"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["user"]["role"] == "patient", "Role must be forced to patient"

def test_register_duplicate_email(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "ADMIN@TEST.COM",  # uppercase variant of existing admin
        "password": "Password@123",
        "full_name": "Duplicate Admin Test"
    })
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"].lower()

def test_register_invalid_email_format(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "not-an-email",
        "password": "Password@123",
        "full_name": "Invalid Email"
    })
    assert res.status_code == 422

def test_register_short_password(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "shortpass@test.com",
        "password": "123",
        "full_name": "Short Pass"
    })
    assert res.status_code == 422

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

def test_login_case_insensitive(client):
    """Test login with uppercase email."""
    res = client.post("/api/v1/auth/login", json={
        "email": "ADMIN@TEST.COM",
        "password": "Admin@123"
    })
    assert res.status_code == 200
    data = res.json()
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

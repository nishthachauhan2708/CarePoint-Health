def test_health_and_metrics_endpoints(client):
    # Liveness check
    h_res = client.get("/health")
    assert h_res.status_code == 200
    assert h_res.json()["status"] == "healthy"

    # Prometheus metrics check
    m_res = client.get("/metrics")
    assert m_res.status_code == 200
    assert "carehealth_http_requests_total" in m_res.text

def test_departments_crud(client, admin_token):
    # List departments
    res = client.get("/api/v1/departments/")
    assert res.status_code == 200
    assert len(res.json()) >= 1

    # Create new department as admin
    new_dept_res = client.post("/api/v1/departments/", json={
        "name": "Dermatology",
        "code": "DERM",
        "description": "Skin and hair care clinic",
        "icon": "Sparkles",
        "head_doctor_name": "Dr. Sarah Khan"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert new_dept_res.status_code == 201
    assert new_dept_res.json()["code"] == "DERM"

def test_doctors_list_and_filter(client):
    res = client.get("/api/v1/doctors/?specialization=Cardiology")
    assert res.status_code == 200
    doctors = res.json()
    assert len(doctors) >= 1
    assert "Cardiology" in doctors[0]["specialization"]

def test_digital_health_card(client, patient_token):
    res = client.get("/api/v1/patients/1/health-card", headers={"Authorization": f"Bearer {patient_token}"})
    assert res.status_code == 200
    card = res.json()
    assert card["uhid"] == "CHP-2026-9999"
    assert "full_name" in card
    assert "blood_group" in card

def test_analytics_summary(client):
    res = client.get("/api/v1/analytics/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_patients" in data
    assert "total_doctors" in data
    assert "total_appointments" in data
    assert "daily_trend" in data

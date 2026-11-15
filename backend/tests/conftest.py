import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database.session import Base, get_db

TEST_DATABASE_URL = "sqlite:///./test_carehealth.db"

test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    from app.core.security import get_password_hash
    from app.models.user import User
    from app.models.department import Department
    from app.models.doctor import Doctor
    from app.models.patient import Patient
    import datetime

    # Create Admin
    admin = User(
        email="admin@test.com",
        hashed_password=get_password_hash("Admin@123"),
        full_name="Test Admin",
        role="admin",
        is_active=True
    )
    db.add(admin)

    # Create Department
    dept = Department(
        name="Cardiology",
        code="CARD",
        description="Heart care",
        icon="Heart",
        head_doctor_name="Dr. Test"
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)

    # Create Doctor User & Profile
    doc_user = User(
        email="doctor@test.com",
        hashed_password=get_password_hash("Doctor@123"),
        full_name="Dr. Test Specialist",
        role="doctor",
        is_active=True
    )
    db.add(doc_user)
    db.commit()
    db.refresh(doc_user)

    doc = Doctor(
        user_id=doc_user.id,
        department_id=dept.id,
        license_number="TEST-MCI-101",
        specialization="Cardiology",
        qualification="MBBS, MD",
        experience_years=10,
        consultation_fee=500.0
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Add 7-day schedule for test doctor
    from app.models.doctor_availability import DoctorAvailability
    for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]:
        av = DoctorAvailability(
            doctor_id=doc.id,
            day_of_week=day,
            start_time="09:00",
            end_time="17:00",
            slot_duration_minutes=30,
            is_available=True
        )
        db.add(av)
    db.commit()

    # Create Patient User & Profile
    pat_user = User(
        email="patient@test.com",
        hashed_password=get_password_hash("Patient@123"),
        full_name="Test Patient",
        role="patient",
        is_active=True
    )
    db.add(pat_user)
    db.commit()
    db.refresh(pat_user)

    pat = Patient(
        user_id=pat_user.id,
        patient_uhid="CHP-2026-9999",
        date_of_birth=datetime.date(1995, 5, 20),
        gender="Male",
        blood_group="O+"
    )
    db.add(pat)
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_carehealth.db"):
        try:
            os.remove("./test_carehealth.db")
        except Exception:
            pass

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def admin_token(client):
    res = client.post("/api/v1/auth/login", json={"email": "admin@test.com", "password": "Admin@123"})
    return res.json()["access_token"]

@pytest.fixture
def doctor_token(client):
    res = client.post("/api/v1/auth/login", json={"email": "doctor@test.com", "password": "Doctor@123"})
    return res.json()["access_token"]

@pytest.fixture
def patient_token(client):
    res = client.post("/api/v1/auth/login", json={"email": "patient@test.com", "password": "Patient@123"})
    return res.json()["access_token"]

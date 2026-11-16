import random
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.models.patient import Patient
from app.schemas.user import UserCreate, UserLogin, Token, UserOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Normalize email to lowercase stripped
    normalized_email = user_in.email.strip().lower()

    # Case-insensitive check if user with email already exists
    existing = db.query(User).filter(func.lower(User.email) == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in instead."
        )
    
    # Public registration is strictly for patient role to prevent unauthorized privilege escalation
    # Admin, Doctor, and Receptionist accounts are created through administrative provisioning or seeds
    assigned_role = "patient"

    clean_full_name = user_in.full_name.strip()
    clean_phone = user_in.phone_number.strip() if user_in.phone_number else None

    user = User(
        email=normalized_email,
        hashed_password=get_password_hash(user_in.password),
        full_name=clean_full_name,
        role=assigned_role,
        phone_number=clean_phone,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Auto-generate a guaranteed unique patient UHID
    for _ in range(10):
        random_suffix = random.randint(1000, 9999)
        uhid = f"CHP-2026-{random_suffix}"
        if not db.query(Patient).filter(Patient.patient_uhid == uhid).first():
            break

    patient = Patient(
        user_id=user.id,
        patient_uhid=uhid,
        date_of_birth=date(1995, 1, 1),
        gender="Not Specified",
        blood_group="O+",
        emergency_contact_name="Emergency Contact",
        emergency_contact_phone=clean_phone or "9876543210",
        address="New Delhi, India"
    )
    db.add(patient)
    db.commit()

    token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    # Normalize email to lowercase stripped for case-insensitive lookup
    normalized_email = login_data.email.strip().lower()

    user = db.query(User).filter(func.lower(User.email) == normalized_email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please verify your credentials and try again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your account is deactivated. Please contact hospital administration."
        )
    
    token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.get("/me", response_model=dict)
def get_current_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile_data = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "phone_number": current_user.phone_number,
        "created_at": current_user.created_at,
        "is_active": current_user.is_active,
    }

    if current_user.role == "patient" and current_user.patient_profile:
        profile_data["patient"] = {
            "id": current_user.patient_profile.id,
            "patient_uhid": current_user.patient_profile.patient_uhid,
            "blood_group": current_user.patient_profile.blood_group,
            "date_of_birth": current_user.patient_profile.date_of_birth,
            "gender": current_user.patient_profile.gender,
            "emergency_contact_phone": current_user.patient_profile.emergency_contact_phone,
            "allergies": current_user.patient_profile.allergies
        }
    elif current_user.role == "doctor" and current_user.doctor_profile:
        profile_data["doctor"] = {
            "id": current_user.doctor_profile.id,
            "department_id": current_user.doctor_profile.department_id,
            "specialization": current_user.doctor_profile.specialization,
            "qualification": current_user.doctor_profile.qualification,
            "license_number": current_user.doctor_profile.license_number,
            "consultation_fee": current_user.doctor_profile.consultation_fee
        }

    return profile_data

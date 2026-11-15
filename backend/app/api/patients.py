import random
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.patient import Patient
from app.models.user import User
from app.models.appointment import Appointment
from app.schemas.patient import PatientCreate, PatientUpdate, PatientOut, DigitalHealthCard
from app.schemas.user import UserOut
from app.api.deps import require_roles, get_current_user

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/", response_model=List[PatientOut])
def get_patients(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _user=Depends(require_roles(["admin", "receptionist", "doctor"]))
):
    query = db.query(Patient)
    patients = query.all()
    results = []
    for p in patients:
        if search:
            name_match = p.user and search.lower() in p.user.full_name.lower()
            uhid_match = search.lower() in p.patient_uhid.lower()
            phone_match = p.user and p.user.phone_number and search in p.user.phone_number
            if not (name_match or uhid_match or phone_match):
                continue
        
        p_out = PatientOut(
            id=p.id,
            user_id=p.user_id,
            patient_uhid=p.patient_uhid,
            date_of_birth=p.date_of_birth,
            gender=p.gender,
            blood_group=p.blood_group,
            emergency_contact_name=p.emergency_contact_name,
            emergency_contact_phone=p.emergency_contact_phone,
            address=p.address,
            allergies=p.allergies,
            chronic_conditions=p.chronic_conditions,
            user=UserOut.from_orm(p.user) if p.user else None
        )
        results.append(p_out)
    return results

@router.get("/me/profile", response_model=PatientOut)
def get_my_patient_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=400, detail="Only patient role has a patient profile")
    
    p = current_user.patient_profile
    if not p:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    return PatientOut(
        id=p.id,
        user_id=p.user_id,
        patient_uhid=p.patient_uhid,
        date_of_birth=p.date_of_birth,
        gender=p.gender,
        blood_group=p.blood_group,
        emergency_contact_name=p.emergency_contact_name,
        emergency_contact_phone=p.emergency_contact_phone,
        address=p.address,
        allergies=p.allergies,
        chronic_conditions=p.chronic_conditions,
        user=UserOut.from_orm(p.user) if p.user else None
    )

@router.get("/{id}", response_model=PatientOut)
def get_patient(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Patient).filter(Patient.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Patients can only view themselves; staff can view any
    if current_user.role == "patient" and p.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return PatientOut(
        id=p.id,
        user_id=p.user_id,
        patient_uhid=p.patient_uhid,
        date_of_birth=p.date_of_birth,
        gender=p.gender,
        blood_group=p.blood_group,
        emergency_contact_name=p.emergency_contact_name,
        emergency_contact_phone=p.emergency_contact_phone,
        address=p.address,
        allergies=p.allergies,
        chronic_conditions=p.chronic_conditions,
        user=UserOut.from_orm(p.user) if p.user else None
    )

@router.get("/{id}/health-card", response_model=DigitalHealthCard)
def get_digital_health_card(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Patient).filter(Patient.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if current_user.role == "patient" and p.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    visit_count = db.query(Appointment).filter(Appointment.patient_id == id).count()
    
    return DigitalHealthCard(
        uhid=p.patient_uhid,
        full_name=p.user.full_name if p.user else "Anonymous",
        email=p.user.email if p.user else "",
        phone=p.user.phone_number if p.user else None,
        blood_group=p.blood_group,
        gender=p.gender,
        dob=p.date_of_birth,
        allergies=p.allergies or "None recorded",
        emergency_contact=p.emergency_contact_name or "Hospital Help Desk",
        emergency_phone=p.emergency_contact_phone or "+91-1800-CARE-NOW",
        total_visits=visit_count
    )

@router.put("/{id}", response_model=PatientOut)
def update_patient(
    id: int,
    p_in: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    p = db.query(Patient).filter(Patient.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if current_user.role == "patient" and p.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if p_in.date_of_birth is not None:
        p.date_of_birth = p_in.date_of_birth
    if p_in.gender is not None:
        p.gender = p_in.gender
    if p_in.blood_group is not None:
        p.blood_group = p_in.blood_group
    if p_in.emergency_contact_name is not None:
        p.emergency_contact_name = p_in.emergency_contact_name
    if p_in.emergency_contact_phone is not None:
        p.emergency_contact_phone = p_in.emergency_contact_phone
    if p_in.address is not None:
        p.address = p_in.address
    if p_in.allergies is not None:
        p.allergies = p_in.allergies
    if p_in.chronic_conditions is not None:
        p.chronic_conditions = p_in.chronic_conditions

    db.commit()
    db.refresh(p)
    return PatientOut(
        id=p.id,
        user_id=p.user_id,
        patient_uhid=p.patient_uhid,
        date_of_birth=p.date_of_birth,
        gender=p.gender,
        blood_group=p.blood_group,
        emergency_contact_name=p.emergency_contact_name,
        emergency_contact_phone=p.emergency_contact_phone,
        address=p.address,
        allergies=p.allergies,
        chronic_conditions=p.chronic_conditions,
        user=UserOut.from_orm(p.user) if p.user else None
    )

import random
from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.patient import Patient
from app.models.user import User
from app.models.appointment import Appointment
from app.schemas.patient import PatientCreate, PatientUpdate, PatientOut, DigitalHealthCard, CardVerificationOut
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
            user=UserOut.model_validate(p.user) if p.user else None
        )
        results.append(p_out)
    return results

@router.get("/verify-card/{uhid}", response_model=CardVerificationOut)
def verify_digital_health_card(uhid: str, db: Session = Depends(get_db)):
    """
    Public, privacy-safe QR code verification endpoint.
    Confirms card validity and issue status without exposing full DOB, phone, address, or medical history.
    """
    p = db.query(Patient).filter(Patient.patient_uhid == uhid.strip()).first()
    if not p:
        raise HTTPException(
            status_code=404,
            detail="The specified Digital Health Card UHID was not found in CareHealth Point hospital registry."
        )

    # Mask patient name for privacy (e.g. 'Nishtha Chauhan' -> 'N. C*******')
    raw_name = p.user.full_name if p.user else "Patient"
    parts = raw_name.split()
    if len(parts) > 1:
        masked_name = f"{parts[0][0]}. " + parts[-1][0] + "*" * (len(parts[-1]) - 1)
    else:
        masked_name = raw_name[0] + "*" * (len(raw_name) - 1)

    return CardVerificationOut(
        valid=True,
        uhid=p.patient_uhid,
        patient_name_masked=masked_name,
        blood_group=p.blood_group,
        issued_by="CareHealth Point Multispecialty Hospital",
        status="Active Verified Clinical Record",
        verification_timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    )

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
        user=UserOut.model_validate(p.user) if p.user else None
    )

@router.put("/me/profile", response_model=PatientOut)
def update_my_patient_profile(
    p_in: PatientUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Authenticated patient updates their own profile details.
    Safely updates both User entity and Patient clinical profile.
    """
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can update patient profile")
    
    p = current_user.patient_profile
    if not p:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # Update User attributes if provided
    if p_in.full_name is not None and p_in.full_name.strip():
        current_user.full_name = p_in.full_name.strip()
    if p_in.phone_number is not None:
        current_user.phone_number = p_in.phone_number.strip() if p_in.phone_number.strip() else None

    # Update Patient attributes
    if p_in.date_of_birth is not None:
        p.date_of_birth = p_in.date_of_birth
    if p_in.gender is not None:
        p.gender = p_in.gender.strip() if p_in.gender.strip() else None
    if p_in.blood_group is not None:
        p.blood_group = p_in.blood_group.strip() if p_in.blood_group.strip() else None
    if p_in.emergency_contact_name is not None:
        p.emergency_contact_name = p_in.emergency_contact_name.strip() if p_in.emergency_contact_name.strip() else None
    if p_in.emergency_contact_phone is not None:
        p.emergency_contact_phone = p_in.emergency_contact_phone.strip() if p_in.emergency_contact_phone.strip() else None
    if p_in.address is not None:
        p.address = p_in.address.strip() if p_in.address.strip() else None
    if p_in.allergies is not None:
        p.allergies = p_in.allergies.strip() if p_in.allergies.strip() else None
    if p_in.chronic_conditions is not None:
        p.chronic_conditions = p_in.chronic_conditions.strip() if p_in.chronic_conditions.strip() else None

    db.commit()
    db.refresh(current_user)
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
        user=UserOut.model_validate(p.user) if p.user else None
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
        user=UserOut.model_validate(p.user) if p.user else None
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
        full_name=p.user.full_name if p.user else "Patient",
        email=p.user.email if p.user else "",
        phone=p.user.phone_number if p.user else None,
        blood_group=p.blood_group,
        gender=p.gender,
        dob=p.date_of_birth,
        address=p.address,
        allergies=p.allergies,
        emergency_contact=p.emergency_contact_name,
        emergency_phone=p.emergency_contact_phone,
        total_visits=visit_count,
        verification_url=f"/api/v1/patients/verify-card/{p.patient_uhid}"
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

    if p_in.full_name is not None and p_in.full_name.strip() and p.user:
        p.user.full_name = p_in.full_name.strip()
    if p_in.phone_number is not None and p.user:
        p.user.phone_number = p_in.phone_number.strip() if p_in.phone_number.strip() else None

    if p_in.date_of_birth is not None:
        p.date_of_birth = p_in.date_of_birth
    if p_in.gender is not None:
        p.gender = p_in.gender.strip() if p_in.gender.strip() else None
    if p_in.blood_group is not None:
        p.blood_group = p_in.blood_group.strip() if p_in.blood_group.strip() else None
    if p_in.emergency_contact_name is not None:
        p.emergency_contact_name = p_in.emergency_contact_name.strip() if p_in.emergency_contact_name.strip() else None
    if p_in.emergency_contact_phone is not None:
        p.emergency_contact_phone = p_in.emergency_contact_phone.strip() if p_in.emergency_contact_phone.strip() else None
    if p_in.address is not None:
        p.address = p_in.address.strip() if p_in.address.strip() else None
    if p_in.allergies is not None:
        p.allergies = p_in.allergies.strip() if p_in.allergies.strip() else None
    if p_in.chronic_conditions is not None:
        p.chronic_conditions = p_in.chronic_conditions.strip() if p_in.chronic_conditions.strip() else None

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
        user=UserOut.model_validate(p.user) if p.user else None
    )

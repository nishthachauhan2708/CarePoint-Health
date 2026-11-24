import random
from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.patient import Patient
from app.models.user import User
from app.models.appointment import Appointment
from app.schemas.patient import PatientCreate, PatientUpdate, PatientOut, DigitalHealthCard, CardVerificationOut, RecentPatientActivityOut
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
    today = date.today()
    for p in patients:
        if search:
            name_match = p.user and search.lower() in p.user.full_name.lower()
            uhid_match = search.lower() in p.patient_uhid.lower()
            phone_match = p.user and p.user.phone_number and search in p.user.phone_number
            if not (name_match or uhid_match or phone_match):
                continue

        calculated_age = None
        if p.date_of_birth:
            calculated_age = today.year - p.date_of_birth.year - ((today.month, today.day) < (p.date_of_birth.month, p.date_of_birth.day))

        # Check appointments for clinical status & admission date
        appts = db.query(Appointment).filter(Appointment.patient_id == p.id).order_by(Appointment.appointment_date.desc()).all()
        total_appts = len(appts)
        latest_appt = appts[0] if appts else None
        
        clinical_status = "New Patient"
        med_category = p.chronic_conditions if p.chronic_conditions else "General"
        admit_date = None

        if latest_appt:
            admit_date = latest_appt.appointment_date
            if latest_appt.department and latest_appt.department.name:
                med_category = latest_appt.department.name
            elif latest_appt.symptoms:
                med_category = latest_appt.symptoms.split(",")[0].strip()

            if latest_appt.status == "completed":
                clinical_status = "Discharged"
            elif latest_appt.status in ["confirmed", "pending"]:
                clinical_status = "In Treatment"
            elif latest_appt.status == "cancelled":
                clinical_status = "Transferred"
        
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
            age=calculated_age,
            registered_at=p.user.created_at if p.user else None,
            admission_date=admit_date or (p.user.created_at.date() if p.user and p.user.created_at else None),
            medical_category=med_category,
            clinical_status=clinical_status,
            total_appointments=total_appts,
            user=UserOut.model_validate(p.user) if p.user else None
        )
        results.append(p_out)
    return results

@router.get("/recent-activities", response_model=List[RecentPatientActivityOut])
def get_recent_patient_activities(
    db: Session = Depends(get_db),
    _user=Depends(require_roles(["admin", "receptionist", "doctor"]))
):
    """
    Returns authentic chronological stream of patient activity across the hospital:
    - Recent patient registrations
    - Recent appointment bookings & consultations
    - Patient admissions & treatment status updates
    """
    activities: List[RecentPatientActivityOut] = []
    today = date.today()

    # 1. Recent appointments
    recent_appts = db.query(Appointment).order_by(Appointment.created_at.desc()).limit(15).all()
    for a in recent_appts:
        if not a.patient or not a.patient.user:
            continue
        p = a.patient
        u = p.user
        age = None
        if p.date_of_birth:
            age = today.year - p.date_of_birth.year - ((today.month, today.day) < (p.date_of_birth.month, p.date_of_birth.day))

        # Disease / Category
        condition = a.symptoms if a.symptoms else (a.department.name if a.department else "Outpatient Consult")
        condition = condition.split(",")[0].strip() if condition else "General Medicine"

        doc_name = a.doctor.user.full_name if a.doctor and a.doctor.user else "Physician"
        
        status_map = {
            "completed": "Recovered",
            "confirmed": "In Treatment",
            "pending": "New Patient",
            "cancelled": "Cancelled"
        }
        status_label = status_map.get(a.status, "In Treatment")
        desc = f"Consultation with Dr. {doc_name.replace('Dr. ', '')}"
        if a.status == "completed":
            desc = f"Consultation completed with Dr. {doc_name.replace('Dr. ', '')}"

        ts = a.created_at or datetime.utcnow()
        time_str = ts.strftime("%b %d, %Y %H:%M")
        avatar = f"/avatars/{'doctor-female.svg' if p.gender == 'Female' else 'doctor-male.svg'}"

        activities.append(
            RecentPatientActivityOut(
                id=f"appt-{a.id}",
                patient_id=p.id,
                patient_name=u.full_name,
                uhid=p.patient_uhid,
                avatar_url=avatar,
                age=age,
                gender=p.gender,
                disease_or_condition=condition,
                activity_description=desc,
                status=status_label,
                timestamp=ts,
                formatted_time=time_str
            )
        )

    # 2. Recent Patient Registrations
    recent_patients = db.query(Patient).join(User).order_by(User.created_at.desc()).limit(10).all()
    for p in recent_patients:
        u = p.user
        if not u:
            continue
        if any(act.patient_id == p.id for act in activities):
            continue

        age = None
        if p.date_of_birth:
            age = today.year - p.date_of_birth.year - ((today.month, today.day) < (p.date_of_birth.month, p.date_of_birth.day))

        ts = u.created_at or datetime.utcnow()
        time_str = ts.strftime("%b %d, %Y %H:%M")
        avatar = f"/avatars/{'doctor-female.svg' if p.gender == 'Female' else 'doctor-male.svg'}"
        condition = p.chronic_conditions or p.allergies or "General Medicine"

        activities.append(
            RecentPatientActivityOut(
                id=f"reg-{p.id}",
                patient_id=p.id,
                patient_name=u.full_name,
                uhid=p.patient_uhid,
                avatar_url=avatar,
                age=age,
                gender=p.gender,
                disease_or_condition=condition,
                activity_description="Registered new patient profile & generated UHID",
                status="New Patient",
                timestamp=ts,
                formatted_time=time_str
            )
        )

    activities.sort(key=lambda x: x.timestamp, reverse=True)
    return activities[:15]

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

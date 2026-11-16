from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.doctor import Doctor
from app.models.department import Department
from app.models.user import User
from app.models.doctor_availability import DoctorAvailability
from app.models.appointment import Appointment
from app.schemas.doctor import DoctorCreate, DoctorUpdate, DoctorOut, AvailabilityCreate, AvailabilityOut
from app.schemas.user import UserOut
from app.api.deps import require_roles, get_current_user

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("/", response_model=List[DoctorOut])
def get_doctors(
    department_id: Optional[int] = None,
    specialization: Optional[str] = None,
    min_experience: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Doctor)
    if department_id:
        query = query.filter(Doctor.department_id == department_id)
    if specialization:
        query = query.filter(Doctor.specialization.ilike(f"%{specialization}%"))
    if min_experience:
        query = query.filter(Doctor.experience_years >= min_experience)
    
    doctors = query.all()
    results = []
    for doc in doctors:
        # If text search is specified, match against doctor's user full_name or specialization
        if search:
            match_name = doc.user and search.lower() in doc.user.full_name.lower()
            match_spec = search.lower() in doc.specialization.lower()
            if not (match_name or match_spec):
                continue

        avail_out = [
            AvailabilityOut(
                id=a.id,
                doctor_id=a.doctor_id,
                day_of_week=a.day_of_week,
                start_time=a.start_time,
                end_time=a.end_time,
                slot_duration_minutes=a.slot_duration_minutes,
                is_available=a.is_available
            )
            for a in doc.availabilities
        ]
        
        doc_out = DoctorOut(
            id=doc.id,
            user_id=doc.user_id,
            department_id=doc.department_id,
            license_number=doc.license_number,
            specialization=doc.specialization,
            qualification=doc.qualification,
            experience_years=doc.experience_years,
            consultation_fee=doc.consultation_fee,
            biography=doc.biography,
            department_name=doc.department.name if doc.department else "General",
            user=UserOut.from_orm(doc.user) if doc.user else None,
            availabilities=avail_out
        )
        results.append(doc_out)
    return results

@router.get("/{id}", response_model=DoctorOut)
def get_doctor(id: int, db: Session = Depends(get_db)):
    doc = db.query(Doctor).filter(Doctor.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    avail_out = [
        AvailabilityOut(
            id=a.id,
            doctor_id=a.doctor_id,
            day_of_week=a.day_of_week,
            start_time=a.start_time,
            end_time=a.end_time,
            slot_duration_minutes=a.slot_duration_minutes,
            is_available=a.is_available
        )
        for a in doc.availabilities
    ]
    
    return DoctorOut(
        id=doc.id,
        user_id=doc.user_id,
        department_id=doc.department_id,
        license_number=doc.license_number,
        specialization=doc.specialization,
        qualification=doc.qualification,
        experience_years=doc.experience_years,
        consultation_fee=doc.consultation_fee,
        biography=doc.biography,
        department_name=doc.department.name if doc.department else "General",
        user=UserOut.from_orm(doc.user) if doc.user else None,
        availabilities=avail_out
    )

@router.get("/{id}/slots")
def get_available_slots(id: int, date_str: str = Query(..., description="Format YYYY-MM-DD"), db: Session = Depends(get_db)):
    doc = db.query(Doctor).filter(Doctor.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    try:
        appt_date = date.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Expected YYYY-MM-DD")
    
    day_name = appt_date.strftime("%A")
    avail = db.query(DoctorAvailability).filter(
        DoctorAvailability.doctor_id == id,
        DoctorAvailability.day_of_week == day_name,
        DoctorAvailability.is_available == True
    ).first()

    if not avail:
        doc_name = doc.user.full_name if doc.user else "Doctor"
        formatted_name = doc_name if doc_name.startswith("Dr.") else f"Dr. {doc_name}"
        return {
            "doctor_id": id,
            "date": date_str,
            "day_of_week": day_name,
            "is_working_day": False,
            "message": f"{formatted_name} is not scheduled for OPD consultations on {day_name}s.",
            "slots": []
        }

    # Generate dynamic slots from working hours and slot duration
    from datetime import datetime, timedelta
    try:
        start_dt = datetime.strptime(avail.start_time, "%H:%M")
        end_dt = datetime.strptime(avail.end_time, "%H:%M")
    except ValueError:
        start_dt = datetime.strptime("09:00", "%H:%M")
        end_dt = datetime.strptime("17:00", "%H:%M")

    step_minutes = avail.slot_duration_minutes if avail.slot_duration_minutes > 0 else 30
    step = timedelta(minutes=step_minutes)

    generated_slots = []
    curr = start_dt
    while curr + step <= end_dt:
        next_dt = curr + step
        generated_slots.append(f"{curr.strftime('%H:%M')} - {next_dt.strftime('%H:%M')}")
        curr = next_dt

    # Query booked appointments for this doctor on that date (excluding cancelled)
    booked = db.query(Appointment.time_slot).filter(
        Appointment.doctor_id == id,
        Appointment.appointment_date == appt_date,
        Appointment.status != "cancelled"
    ).all()
    booked_slots = {b[0] for b in booked}

    slot_availability = [
        {"slot": s, "is_booked": s in booked_slots}
        for s in generated_slots
    ]

    return {
        "doctor_id": id,
        "date": date_str,
        "day_of_week": day_name,
        "is_working_day": True,
        "slots": slot_availability
    }

@router.post("/", response_model=DoctorOut, status_code=status.HTTP_201_CREATED)
def create_doctor(
    doc_in: DoctorCreate,
    db: Session = Depends(get_db),
    _user=Depends(require_roles(["admin"]))
):
    dept = db.query(Department).filter(Department.id == doc_in.department_id).first()
    if not dept:
        raise HTTPException(status_code=400, detail="Department does not exist")
    
    user = db.query(User).filter(User.id == doc_in.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User account not found")
    
    existing_license = db.query(Doctor).filter(Doctor.license_number == doc_in.license_number).first()
    if existing_license:
        raise HTTPException(status_code=400, detail="Doctor with this license number already exists")

    user.role = "doctor"
    doctor = Doctor(
        user_id=doc_in.user_id,
        department_id=doc_in.department_id,
        license_number=doc_in.license_number,
        specialization=doc_in.specialization,
        qualification=doc_in.qualification,
        experience_years=doc_in.experience_years,
        consultation_fee=doc_in.consultation_fee,
        biography=doc_in.biography
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    # Add default schedule: Monday - Friday 09:00 - 17:00
    for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]:
        avail = DoctorAvailability(
            doctor_id=doctor.id,
            day_of_week=day,
            start_time="09:00",
            end_time="17:00",
            is_available=True
        )
        db.add(avail)
    db.commit()

    return get_doctor(doctor.id, db)

@router.post("/{id}/availability", response_model=List[AvailabilityOut])
def set_doctor_availability(
    id: int,
    avail_list: List[AvailabilityCreate],
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin", "doctor"]))
):
    doc = db.query(Doctor).filter(Doctor.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    if current_user.role == "doctor" and doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot alter another doctor's schedule")

    # Clear previous availabilities
    db.query(DoctorAvailability).filter(DoctorAvailability.doctor_id == id).delete()
    
    created_items = []
    for item in avail_list:
        a = DoctorAvailability(
            doctor_id=id,
            day_of_week=item.day_of_week,
            start_time=item.start_time,
            end_time=item.end_time,
            slot_duration_minutes=item.slot_duration_minutes,
            is_available=item.is_available
        )
        db.add(a)
        created_items.append(a)
    
    db.commit()
    return [
        AvailabilityOut(
            id=a.id,
            doctor_id=a.doctor_id,
            day_of_week=a.day_of_week,
            start_time=a.start_time,
            end_time=a.end_time,
            slot_duration_minutes=a.slot_duration_minutes,
            is_available=a.is_available
        )
        for a in created_items
    ]

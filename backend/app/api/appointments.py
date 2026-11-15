from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.doctor_availability import DoctorAvailability
from app.models.department import Department
from app.models.user import User
from app.models.notification import Notification
from app.schemas.appointment import AppointmentCreate, AppointmentStatusUpdate, AppointmentOut, QueueStatus
from app.api.deps import require_roles, get_current_user

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("/", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def book_appointment(
    appt_in: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Determine target patient_id
    if current_user.role == "patient":
        if not current_user.patient_profile:
            raise HTTPException(status_code=400, detail="User does not have an active patient record")
        patient_id = current_user.patient_profile.id
    else:
        # Admin or Receptionist booking on behalf of patient
        if not appt_in.patient_id:
            raise HTTPException(status_code=400, detail="patient_id is required when booking as staff")
        patient_id = appt_in.patient_id

    # Verify doctor and department exist
    doc = db.query(Doctor).filter(Doctor.id == appt_in.doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    dept = db.query(Department).filter(Department.id == appt_in.department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    # Prevent booking appointments for past dates
    if appt_in.appointment_date < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book appointments for past dates. Please select today or a future date."
        )

    # Verify doctor is working on this day of the week
    day_name = appt_in.appointment_date.strftime("%A")
    avail = db.query(DoctorAvailability).filter(
        DoctorAvailability.doctor_id == appt_in.doctor_id,
        DoctorAvailability.day_of_week == day_name,
        DoctorAvailability.is_available == True
    ).first()
    if not avail:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dr. {doc.user.full_name if doc.user else 'Doctor'} is not scheduled for consultations on {day_name}s."
        )

    # Prevent duplicate bookings: check if slot is already occupied
    existing = db.query(Appointment).filter(
        Appointment.doctor_id == appt_in.doctor_id,
        Appointment.appointment_date == appt_in.appointment_date,
        Appointment.time_slot == appt_in.time_slot,
        Appointment.status != "cancelled"
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"This time slot '{appt_in.time_slot}' with Dr. {doc.user.full_name if doc.user else 'Doctor'} on {appt_in.appointment_date} is already booked. Please choose another time slot."
        )

    # Calculate queue number for this doctor on this day
    last_queue = db.query(func.max(Appointment.queue_number)).filter(
        Appointment.doctor_id == appt_in.doctor_id,
        Appointment.appointment_date == appt_in.appointment_date
    ).scalar()
    next_queue_number = (last_queue or 0) + 1

    appt = Appointment(
        patient_id=patient_id,
        doctor_id=appt_in.doctor_id,
        department_id=appt_in.department_id,
        appointment_date=appt_in.appointment_date,
        time_slot=appt_in.time_slot,
        queue_number=next_queue_number,
        status="confirmed" if current_user.role in ["admin", "receptionist"] else "pending",
        symptoms=appt_in.symptoms
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)

    # Create notification for patient
    patient_user = db.query(Patient).filter(Patient.id == patient_id).first()
    if patient_user and patient_user.user_id:
        notif = Notification(
            user_id=patient_user.user_id,
            title="Appointment Scheduled",
            message=f"Appointment #{appt.id} confirmed with Dr. {doc.user.full_name if doc.user else ''} on {appt.appointment_date} ({appt.time_slot}). Queue Number: #{next_queue_number}.",
            type="appointment_booked"
        )
        db.add(notif)
        db.commit()

    return AppointmentOut(
        id=appt.id,
        patient_id=appt.patient_id,
        doctor_id=appt.doctor_id,
        department_id=appt.department_id,
        appointment_date=appt.appointment_date,
        time_slot=appt.time_slot,
        queue_number=appt.queue_number,
        status=appt.status,
        symptoms=appt.symptoms,
        created_at=appt.created_at,
        patient_name=appt.patient.user.full_name if appt.patient and appt.patient.user else "Patient",
        patient_uhid=appt.patient.patient_uhid if appt.patient else "",
        doctor_name=doc.user.full_name if doc.user else "Doctor",
        doctor_specialization=doc.specialization,
        department_name=dept.name
    )

@router.get("/", response_model=List[AppointmentOut])
def get_appointments(
    date_filter: Optional[date] = None,
    status_filter: Optional[str] = None,
    doctor_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Appointment)

    # Role scoping
    if current_user.role == "patient":
        if not current_user.patient_profile:
            return []
        query = query.filter(Appointment.patient_id == current_user.patient_profile.id)
    elif current_user.role == "doctor":
        if not current_user.doctor_profile:
            return []
        query = query.filter(Appointment.doctor_id == current_user.doctor_profile.id)
    else:
        # Receptionist or Admin can filter arbitrarily
        if doctor_id:
            query = query.filter(Appointment.doctor_id == doctor_id)
        if patient_id:
            query = query.filter(Appointment.patient_id == patient_id)

    if date_filter:
        query = query.filter(Appointment.appointment_date == date_filter)
    if status_filter:
        query = query.filter(Appointment.status == status_filter)

    appointments = query.order_by(Appointment.appointment_date.desc(), Appointment.id.desc()).all()
    results = []
    for a in appointments:
        results.append(
            AppointmentOut(
                id=a.id,
                patient_id=a.patient_id,
                doctor_id=a.doctor_id,
                department_id=a.department_id,
                appointment_date=a.appointment_date,
                time_slot=a.time_slot,
                queue_number=a.queue_number,
                status=a.status,
                symptoms=a.symptoms,
                created_at=a.created_at,
                patient_name=a.patient.user.full_name if a.patient and a.patient.user else "Unknown Patient",
                patient_uhid=a.patient.patient_uhid if a.patient else "",
                doctor_name=a.doctor.user.full_name if a.doctor and a.doctor.user else "Doctor",
                doctor_specialization=a.doctor.specialization if a.doctor else "",
                department_name=a.department.name if a.department else "General"
            )
        )
    return results

@router.get("/{id}", response_model=AppointmentOut)
def get_appointment(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    a = db.query(Appointment).filter(Appointment.id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if current_user.role == "patient" and a.patient.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user.role == "doctor" and a.doctor.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return AppointmentOut(
        id=a.id,
        patient_id=a.patient_id,
        doctor_id=a.doctor_id,
        department_id=a.department_id,
        appointment_date=a.appointment_date,
        time_slot=a.time_slot,
        queue_number=a.queue_number,
        status=a.status,
        symptoms=a.symptoms,
        created_at=a.created_at,
        patient_name=a.patient.user.full_name if a.patient and a.patient.user else "Unknown Patient",
        patient_uhid=a.patient.patient_uhid if a.patient else "",
        doctor_name=a.doctor.user.full_name if a.doctor and a.doctor.user else "Doctor",
        doctor_specialization=a.doctor.specialization if a.doctor else "",
        department_name=a.department.name if a.department else "General"
    )

@router.patch("/{id}/status", response_model=AppointmentOut)
def update_appointment_status(
    id: int,
    status_update: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    a = db.query(Appointment).filter(Appointment.id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    valid_statuses = ["pending", "confirmed", "completed", "cancelled"]
    new_status = status_update.status.lower()
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Choose from: {valid_statuses}")

    # Patient can only cancel their own appointment
    if current_user.role == "patient":
        if a.patient.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        if new_status != "cancelled":
            raise HTTPException(status_code=403, detail="Patients may only cancel appointments")

    # Doctor can only update their own appointments
    if current_user.role == "doctor":
        if not a.doctor or a.doctor.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Doctors may only update appointments assigned to them")

    a.status = new_status
    db.commit()
    db.refresh(a)

    # Notify patient
    if a.patient and a.patient.user_id:
        notif = Notification(
            user_id=a.patient.user_id,
            title="Appointment Status Updated",
            message=f"Your appointment #{a.id} on {a.appointment_date} status has been changed to '{new_status.capitalize()}'.",
            type="status_updated"
        )
        db.add(notif)
        db.commit()

    return AppointmentOut(
        id=a.id,
        patient_id=a.patient_id,
        doctor_id=a.doctor_id,
        department_id=a.department_id,
        appointment_date=a.appointment_date,
        time_slot=a.time_slot,
        queue_number=a.queue_number,
        status=a.status,
        symptoms=a.symptoms,
        created_at=a.created_at,
        patient_name=a.patient.user.full_name if a.patient and a.patient.user else "Unknown Patient",
        patient_uhid=a.patient.patient_uhid if a.patient else "",
        doctor_name=a.doctor.user.full_name if a.doctor and a.doctor.user else "Doctor",
        doctor_specialization=a.doctor.specialization if a.doctor else "",
        department_name=a.department.name if a.department else "General"
    )

@router.get("/{id}/queue", response_model=QueueStatus)
def get_appointment_queue_status(
    id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    a = db.query(Appointment).filter(Appointment.id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Access control: patient or doctor assigned to this appointment, or admin/receptionist
    if current_user.role == "patient" and (not a.patient or a.patient.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user.role == "doctor" and (not a.doctor or a.doctor.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")

    # Find appointments ahead of this one for the same doctor and date that are not completed or cancelled
    completed_or_serving = db.query(func.count(Appointment.id)).filter(
        Appointment.doctor_id == a.doctor_id,
        Appointment.appointment_date == a.appointment_date,
        Appointment.status == "completed"
    ).scalar() or 0

    current_serving = max(1, completed_or_serving + 1)
    patients_ahead = max(0, a.queue_number - current_serving)
    # Estimate wait: roughly 15 minutes per patient ahead
    estimated_wait = patients_ahead * 15

    return QueueStatus(
        appointment_id=a.id,
        queue_number=a.queue_number,
        current_serving_number=current_serving,
        patients_ahead=patients_ahead,
        estimated_wait_minutes=estimated_wait,
        status=a.status,
        doctor_name=a.doctor.user.full_name if a.doctor and a.doctor.user else "Doctor",
        department_name=a.department.name if a.department else "OPD",
        time_slot=a.time_slot
    )

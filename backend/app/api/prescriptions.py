import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.prescription import Prescription
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.user import User
from app.models.notification import Notification
from app.schemas.prescription import PrescriptionCreate, PrescriptionOut, MedicationItem
from app.api.deps import require_roles, get_current_user

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

@router.post("/", response_model=PrescriptionOut, status_code=status.HTTP_201_CREATED)
def create_prescription(
    presc_in: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["doctor", "admin"]))
):
    appt = db.query(Appointment).filter(Appointment.id == presc_in.appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # If user is doctor, ensure they own this appointment (or admin)
    if current_user.role == "doctor" and appt.doctor.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Doctor can only issue prescription for their own patients")

    # Check if prescription already exists for this appointment
    existing = db.query(Prescription).filter(Prescription.appointment_id == appt.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Prescription has already been generated for this appointment")

    # Convert medications list to JSON string
    meds_json = json.dumps([m.dict() for m in presc_in.medications])

    prescription = Prescription(
        appointment_id=appt.id,
        patient_id=appt.patient_id,
        doctor_id=appt.doctor_id,
        diagnosis=presc_in.diagnosis,
        medications=meds_json,
        additional_advice=presc_in.additional_advice
    )
    db.add(prescription)
    
    # Automatically mark appointment as completed
    appt.status = "completed"
    
    # Notify patient
    if appt.patient and appt.patient.user_id:
        notif = Notification(
            user_id=appt.patient.user_id,
            title="Prescription Available",
            message=f"Dr. {appt.doctor.user.full_name if appt.doctor.user else 'Doctor'} has published your prescription for appointment #{appt.id}.",
            type="prescription_ready"
        )
        db.add(notif)

    db.commit()
    db.refresh(prescription)

    med_list = [MedicationItem(**m) for m in json.loads(prescription.medications)]
    return PrescriptionOut(
        id=prescription.id,
        appointment_id=prescription.appointment_id,
        patient_id=prescription.patient_id,
        doctor_id=prescription.doctor_id,
        diagnosis=prescription.diagnosis,
        medications=med_list,
        additional_advice=prescription.additional_advice,
        created_at=prescription.created_at,
        doctor_name=appt.doctor.user.full_name if appt.doctor and appt.doctor.user else "Doctor",
        patient_name=appt.patient.user.full_name if appt.patient and appt.patient.user else "Patient",
        patient_uhid=appt.patient.patient_uhid if appt.patient else ""
    )

@router.get("/appointment/{appointment_id}", response_model=PrescriptionOut)
def get_prescription_by_appointment(appointment_id: int, db: Session = Depends(get_db)):
    p = db.query(Prescription).filter(Prescription.appointment_id == appointment_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Prescription not found for this appointment")

    med_list = [MedicationItem(**m) for m in json.loads(p.medications)]
    return PrescriptionOut(
        id=p.id,
        appointment_id=p.appointment_id,
        patient_id=p.patient_id,
        doctor_id=p.doctor_id,
        diagnosis=p.diagnosis,
        medications=med_list,
        additional_advice=p.additional_advice,
        created_at=p.created_at,
        doctor_name=p.doctor.user.full_name if p.doctor and p.doctor.user else "Doctor",
        patient_name=p.patient.user.full_name if p.patient and p.patient.user else "Patient",
        patient_uhid=p.patient.patient_uhid if p.patient else ""
    )

@router.get("/patient/{patient_id}", response_model=List[PrescriptionOut])
def get_prescriptions_for_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if current_user.role == "patient" and patient.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    prescriptions = db.query(Prescription).filter(Prescription.patient_id == patient_id).order_by(Prescription.id.desc()).all()
    results = []
    for p in prescriptions:
        med_list = [MedicationItem(**m) for m in json.loads(p.medications)]
        results.append(
            PrescriptionOut(
                id=p.id,
                appointment_id=p.appointment_id,
                patient_id=p.patient_id,
                doctor_id=p.doctor_id,
                diagnosis=p.diagnosis,
                medications=med_list,
                additional_advice=p.additional_advice,
                created_at=p.created_at,
                doctor_name=p.doctor.user.full_name if p.doctor and p.doctor.user else "Doctor",
                patient_name=p.patient.user.full_name if p.patient and p.patient.user else "Patient",
                patient_uhid=p.patient.patient_uhid if p.patient else ""
            )
        )
    return results

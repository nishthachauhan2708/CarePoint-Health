import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.consultation import ConsultationNote
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.user import User
from app.schemas.consultation import ConsultationCreate, ConsultationOut
from app.api.deps import require_roles, get_current_user

router = APIRouter(prefix="/consultations", tags=["Consultations"])

@router.post("/", response_model=ConsultationOut, status_code=status.HTTP_201_CREATED)
def record_consultation(
    cons_in: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["doctor", "admin"]))
):
    appt = db.query(Appointment).filter(Appointment.id == cons_in.appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if current_user.role == "doctor" and appt.doctor.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Doctor can only write consultation notes for their assigned patient")

    existing = db.query(ConsultationNote).filter(ConsultationNote.appointment_id == appt.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Consultation note already exists for this appointment")

    vitals_dict = cons_in.vital_signs.dict() if cons_in.vital_signs else {}

    note = ConsultationNote(
        appointment_id=appt.id,
        doctor_id=appt.doctor_id,
        patient_id=appt.patient_id,
        clinical_impression=cons_in.clinical_impression,
        vital_signs=json.dumps(vitals_dict),
        follow_up_recommendation=cons_in.follow_up_recommendation
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    return ConsultationOut(
        id=note.id,
        appointment_id=note.appointment_id,
        doctor_id=note.doctor_id,
        patient_id=note.patient_id,
        clinical_impression=note.clinical_impression,
        vital_signs=json.loads(note.vital_signs) if note.vital_signs else {},
        follow_up_recommendation=note.follow_up_recommendation,
        created_at=note.created_at,
        doctor_name=appt.doctor.user.full_name if appt.doctor and appt.doctor.user else "Doctor",
        patient_name=appt.patient.user.full_name if appt.patient and appt.patient.user else "Patient"
    )

@router.get("/appointment/{appointment_id}", response_model=ConsultationOut)
def get_consultation_by_appointment(appointment_id: int, db: Session = Depends(get_db)):
    note = db.query(ConsultationNote).filter(ConsultationNote.appointment_id == appointment_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Consultation note not found for this appointment")
    
    return ConsultationOut(
        id=note.id,
        appointment_id=note.appointment_id,
        doctor_id=note.doctor_id,
        patient_id=note.patient_id,
        clinical_impression=note.clinical_impression,
        vital_signs=json.loads(note.vital_signs) if note.vital_signs else {},
        follow_up_recommendation=note.follow_up_recommendation,
        created_at=note.created_at,
        doctor_name=note.doctor.user.full_name if note.doctor and note.doctor.user else "Doctor",
        patient_name=note.patient.user.full_name if note.patient and note.patient.user else "Patient"
    )

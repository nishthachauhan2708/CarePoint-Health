from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel

class AppointmentBase(BaseModel):
    doctor_id: int
    department_id: int
    appointment_date: date
    time_slot: str
    symptoms: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    patient_id: Optional[int] = None  # Inferred if booked by patient, or specified by receptionist/admin

class AppointmentStatusUpdate(BaseModel):
    status: str  # pending, confirmed, completed, cancelled

class AppointmentOut(AppointmentBase):
    id: int
    patient_id: int
    queue_number: int
    status: str
    created_at: Optional[datetime] = None
    patient_name: Optional[str] = None
    patient_uhid: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_specialization: Optional[str] = None
    department_name: Optional[str] = None

    class Config:
        from_attributes = True

class QueueStatus(BaseModel):
    appointment_id: int
    queue_number: int
    current_serving_number: int
    patients_ahead: int
    estimated_wait_minutes: int
    status: str
    doctor_name: str
    department_name: str
    time_slot: str

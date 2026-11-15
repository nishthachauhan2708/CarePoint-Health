from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class VitalSigns(BaseModel):
    blood_pressure: Optional[str] = "120/80 mmHg"
    pulse_rate: Optional[str] = "72 bpm"
    temperature: Optional[str] = "98.4 F"
    spo2: Optional[str] = "99%"
    weight: Optional[str] = "68 kg"

class ConsultationCreate(BaseModel):
    appointment_id: int
    clinical_impression: str
    vital_signs: Optional[VitalSigns] = None
    follow_up_recommendation: Optional[str] = None

class ConsultationOut(BaseModel):
    id: int
    appointment_id: int
    doctor_id: int
    patient_id: int
    clinical_impression: str
    vital_signs: Optional[Dict[str, Any]] = None
    follow_up_recommendation: Optional[str] = None
    created_at: Optional[datetime] = None
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None

    class Config:
        from_attributes = True

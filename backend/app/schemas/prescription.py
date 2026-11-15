from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class MedicationItem(BaseModel):
    medicine_name: str
    dosage: str          # e.g., "500mg"
    frequency: str       # e.g., "1-0-1 (Twice a day)"
    duration: str        # e.g., "5 days"
    instructions: str    # e.g., "After food"

class PrescriptionCreate(BaseModel):
    appointment_id: int
    diagnosis: str
    medications: List[MedicationItem]
    additional_advice: Optional[str] = None

class PrescriptionOut(BaseModel):
    id: int
    appointment_id: int
    patient_id: int
    doctor_id: int
    diagnosis: str
    medications: List[MedicationItem]
    additional_advice: Optional[str] = None
    created_at: Optional[datetime] = None
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    patient_uhid: Optional[str] = None

    class Config:
        from_attributes = True

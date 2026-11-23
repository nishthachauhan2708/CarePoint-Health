from typing import Optional
from datetime import date
from pydantic import BaseModel
from app.schemas.user import UserOut

class PatientBase(BaseModel):
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    address: Optional[str] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None

class PatientCreate(PatientBase):
    user_id: Optional[int] = None

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    address: Optional[str] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None

class PatientOut(PatientBase):
    id: int
    user_id: int
    patient_uhid: str
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

class DigitalHealthCard(BaseModel):
    uhid: str
    full_name: str
    email: str
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[date] = None
    address: Optional[str] = None
    allergies: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    total_visits: int = 0
    verification_url: Optional[str] = None

class CardVerificationOut(BaseModel):
    valid: bool
    uhid: str
    patient_name_masked: str
    blood_group: Optional[str] = None
    issued_by: str = "CareHealth Point Multispecialty Hospital"
    status: str = "Active Verified Clinical Record"
    verification_timestamp: str

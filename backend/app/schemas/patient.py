from typing import Optional
from datetime import date
from pydantic import BaseModel
from app.schemas.user import UserOut

class PatientBase(BaseModel):
    date_of_birth: date
    gender: str
    blood_group: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    address: Optional[str] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None

class PatientCreate(PatientBase):
    user_id: Optional[int] = None

class PatientUpdate(BaseModel):
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
    phone: Optional[str]
    blood_group: Optional[str]
    gender: str
    dob: date
    allergies: Optional[str]
    emergency_contact: Optional[str]
    emergency_phone: Optional[str]
    total_visits: int

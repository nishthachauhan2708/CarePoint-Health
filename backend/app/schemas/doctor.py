from typing import Optional, List
from pydantic import BaseModel
from app.schemas.user import UserOut

class AvailabilityBase(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str
    slot_duration_minutes: int = 30
    is_available: bool = True

class AvailabilityCreate(AvailabilityBase):
    pass

class AvailabilityOut(AvailabilityBase):
    id: int
    doctor_id: int

    class Config:
        from_attributes = True

class DoctorBase(BaseModel):
    license_number: str
    specialization: str
    qualification: str
    experience_years: int
    consultation_fee: float
    biography: Optional[str] = None
    department_id: int

class DoctorCreate(DoctorBase):
    user_id: Optional[int] = None

class DoctorUpdate(BaseModel):
    department_id: Optional[int] = None
    license_number: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    biography: Optional[str] = None

class DoctorOut(DoctorBase):
    id: int
    user_id: int
    user: Optional[UserOut] = None
    department_name: Optional[str] = None
    availabilities: Optional[List[AvailabilityOut]] = []

    class Config:
        from_attributes = True

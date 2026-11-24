from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationOut(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DailyAppointmentStat(BaseModel):
    date: str
    count: int

class DepartmentDistribution(BaseModel):
    department: str
    count: int

class DoctorWorkload(BaseModel):
    doctor_name: str
    department: str
    appointment_count: int

class HospitalAnalytics(BaseModel):
    total_patients: int
    new_patients: int = 0
    old_patients: int = 0
    total_doctors: int
    total_departments: int
    total_appointments: int
    today_appointments: int
    completion_rate_percentage: float
    active_in_queue: int
    daily_trend: List[DailyAppointmentStat]
    department_distribution: List[DepartmentDistribution]
    doctor_workload: List[DoctorWorkload]

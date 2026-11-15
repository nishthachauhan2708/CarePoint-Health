from typing import Optional
from pydantic import BaseModel

class DepartmentBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    icon: Optional[str] = None
    head_doctor_name: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    head_doctor_name: Optional[str] = None

class DepartmentOut(DepartmentBase):
    id: int
    doctor_count: Optional[int] = 0

    class Config:
        from_attributes = True

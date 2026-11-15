from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.department import Department
from app.models.doctor import Doctor
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentOut
from app.api.deps import require_roles

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("/", response_model=List[DepartmentOut])
def get_departments(db: Session = Depends(get_db)):
    departments = db.query(Department).all()
    result = []
    for d in departments:
        doc_count = db.query(func.count(Doctor.id)).filter(Doctor.department_id == d.id).scalar()
        item = DepartmentOut(
            id=d.id,
            name=d.name,
            code=d.code,
            description=d.description,
            icon=d.icon,
            head_doctor_name=d.head_doctor_name,
            doctor_count=doc_count or 0
        )
        result.append(item)
    return result

@router.get("/{id}", response_model=DepartmentOut)
def get_department(id: int, db: Session = Depends(get_db)):
    d = db.query(Department).filter(Department.id == id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Department not found")
    doc_count = db.query(func.count(Doctor.id)).filter(Doctor.department_id == d.id).scalar()
    return DepartmentOut(
        id=d.id,
        name=d.name,
        code=d.code,
        description=d.description,
        icon=d.icon,
        head_doctor_name=d.head_doctor_name,
        doctor_count=doc_count or 0
    )

@router.post("/", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_department(
    dept_in: DepartmentCreate,
    db: Session = Depends(get_db),
    _user=Depends(require_roles(["admin"]))
):
    existing = db.query(Department).filter(Department.name == dept_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department name already exists")
    
    dept = Department(
        name=dept_in.name,
        code=dept_in.code.upper(),
        description=dept_in.description,
        icon=dept_in.icon,
        head_doctor_name=dept_in.head_doctor_name
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return DepartmentOut(
        id=dept.id,
        name=dept.name,
        code=dept.code,
        description=dept.description,
        icon=dept.icon,
        head_doctor_name=dept.head_doctor_name,
        doctor_count=0
    )

@router.put("/{id}", response_model=DepartmentOut)
def update_department(
    id: int,
    dept_in: DepartmentUpdate,
    db: Session = Depends(get_db),
    _user=Depends(require_roles(["admin"]))
):
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    if dept_in.name is not None:
        dept.name = dept_in.name
    if dept_in.code is not None:
        dept.code = dept_in.code.upper()
    if dept_in.description is not None:
        dept.description = dept_in.description
    if dept_in.icon is not None:
        dept.icon = dept_in.icon
    if dept_in.head_doctor_name is not None:
        dept.head_doctor_name = dept_in.head_doctor_name

    db.commit()
    db.refresh(dept)
    doc_count = db.query(func.count(Doctor.id)).filter(Doctor.department_id == dept.id).scalar()
    return DepartmentOut(
        id=dept.id,
        name=dept.name,
        code=dept.code,
        description=dept.description,
        icon=dept.icon,
        head_doctor_name=dept.head_doctor_name,
        doctor_count=doc_count or 0
    )

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
    id: int,
    db: Session = Depends(get_db),
    _user=Depends(require_roles(["admin"]))
):
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    doc_count = db.query(func.count(Doctor.id)).filter(Doctor.department_id == dept.id).scalar()
    if doc_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete department with active doctors assigned")

    db.delete(dept)
    db.commit()
    return None

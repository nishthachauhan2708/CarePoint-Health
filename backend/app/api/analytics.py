from datetime import date, datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.department import Department
from app.models.appointment import Appointment
from app.schemas.analytics import HospitalAnalytics, DailyAppointmentStat, DepartmentDistribution, DoctorWorkload
from app.api.deps import require_roles

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary", response_model=HospitalAnalytics)
def get_hospital_analytics(db: Session = Depends(get_db)):
    total_patients = db.query(Patient).count()
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_patients = db.query(Patient).join(User).filter(User.created_at >= thirty_days_ago).count()
    old_patients = max(0, total_patients - new_patients)

    total_doctors = db.query(Doctor).count()
    total_departments = db.query(Department).count()
    total_appointments = db.query(Appointment).count()
    
    today = date.today()
    today_appointments = db.query(Appointment).filter(Appointment.appointment_date == today).count()
    
    completed_appointments = db.query(Appointment).filter(Appointment.status == "completed").count()
    completion_rate = (completed_appointments / total_appointments * 100) if total_appointments > 0 else 0.0

    active_in_queue = db.query(Appointment).filter(
        Appointment.status.in_(["pending", "confirmed"])
    ).count()

    # Past 7 days trend
    daily_trend: List[DailyAppointmentStat] = []
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        count = db.query(Appointment).filter(Appointment.appointment_date == target_date).count()
        daily_trend.append(
            DailyAppointmentStat(
                date=target_date.strftime("%a (%d %b)"),
                count=count
            )
        )

    # Department distribution
    dept_dist: List[DepartmentDistribution] = []
    departments = db.query(Department).all()
    for d in departments:
        count = db.query(Appointment).filter(Appointment.department_id == d.id).count()
        dept_dist.append(DepartmentDistribution(department=d.name, count=count))

    # Doctor workload
    workloads: List[DoctorWorkload] = []
    doctors = db.query(Doctor).limit(6).all()
    for doc in doctors:
        count = db.query(Appointment).filter(Appointment.doctor_id == doc.id).count()
        doc_name = f"Dr. {doc.user.full_name}" if doc.user else "Doctor"
        dept_name = doc.department.name if doc.department else "General"
        workloads.append(DoctorWorkload(doctor_name=doc_name, department=dept_name, appointment_count=count))

    return HospitalAnalytics(
        total_patients=total_patients,
        new_patients=new_patients,
        old_patients=old_patients,
        total_doctors=total_doctors,
        total_departments=total_departments,
        total_appointments=total_appointments,
        today_appointments=today_appointments,
        completion_rate_percentage=round(completion_rate, 1),
        active_in_queue=active_in_queue,
        daily_trend=daily_trend,
        department_distribution=dept_dist,
        doctor_workload=workloads
    )

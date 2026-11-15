from app.schemas.user import UserBase, UserCreate, UserLogin, UserUpdate, UserOut, Token, TokenPayload
from app.schemas.department import DepartmentBase, DepartmentCreate, DepartmentUpdate, DepartmentOut
from app.schemas.doctor import DoctorBase, DoctorCreate, DoctorUpdate, DoctorOut, AvailabilityBase, AvailabilityCreate, AvailabilityOut
from app.schemas.patient import PatientBase, PatientCreate, PatientUpdate, PatientOut, DigitalHealthCard
from app.schemas.appointment import AppointmentBase, AppointmentCreate, AppointmentStatusUpdate, AppointmentOut, QueueStatus
from app.schemas.prescription import MedicationItem, PrescriptionCreate, PrescriptionOut
from app.schemas.consultation import VitalSigns, ConsultationCreate, ConsultationOut
from app.schemas.analytics import NotificationBase, NotificationCreate, NotificationOut, HospitalAnalytics, DailyAppointmentStat, DepartmentDistribution, DoctorWorkload

__all__ = [
    "UserBase", "UserCreate", "UserLogin", "UserUpdate", "UserOut", "Token", "TokenPayload",
    "DepartmentBase", "DepartmentCreate", "DepartmentUpdate", "DepartmentOut",
    "DoctorBase", "DoctorCreate", "DoctorUpdate", "DoctorOut", "AvailabilityBase", "AvailabilityCreate", "AvailabilityOut",
    "PatientBase", "PatientCreate", "PatientUpdate", "PatientOut", "DigitalHealthCard",
    "AppointmentBase", "AppointmentCreate", "AppointmentStatusUpdate", "AppointmentOut", "QueueStatus",
    "MedicationItem", "PrescriptionCreate", "PrescriptionOut",
    "VitalSigns", "ConsultationCreate", "ConsultationOut",
    "NotificationBase", "NotificationCreate", "NotificationOut",
    "HospitalAnalytics", "DailyAppointmentStat", "DepartmentDistribution", "DoctorWorkload"
]

from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="RESTRICT"), nullable=False)
    license_number = Column(String(50), unique=True, nullable=False)
    specialization = Column(String(150), nullable=False)
    qualification = Column(String(150), nullable=False)
    experience_years = Column(Integer, nullable=False, default=1)
    consultation_fee = Column(Float, nullable=False, default=500.0)
    biography = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    department = relationship("Department", back_populates="doctors")
    availabilities = relationship("DoctorAvailability", back_populates="doctor", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")
    consultations = relationship("ConsultationNote", back_populates="doctor")

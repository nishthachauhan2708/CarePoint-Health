from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.session import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="RESTRICT"), nullable=False)
    appointment_date = Column(Date, nullable=False, index=True)
    time_slot = Column(String(30), nullable=False)  # e.g. "09:30 - 10:00"
    queue_number = Column(Integer, nullable=False, default=1)
    status = Column(String(20), nullable=False, default="pending")  # pending, confirmed, completed, cancelled
    symptoms = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Constraints to prevent duplicate bookings for the same doctor at the same slot
    __table_args__ = (
        UniqueConstraint("doctor_id", "appointment_date", "time_slot", name="uq_doctor_date_slot"),
    )

    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    department = relationship("Department", back_populates="appointments")
    prescription = relationship("Prescription", back_populates="appointment", uselist=False, cascade="all, delete-orphan")
    consultation = relationship("ConsultationNote", back_populates="appointment", uselist=False, cascade="all, delete-orphan")

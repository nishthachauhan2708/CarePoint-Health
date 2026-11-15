from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.session import Base

class ConsultationNote(Base):
    __tablename__ = "consultation_notes"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), unique=True, nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    clinical_impression = Column(Text, nullable=False)
    vital_signs = Column(Text, nullable=True)  # JSON-encoded dict of vitals (bp, pulse, temp, spo2)
    follow_up_recommendation = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    appointment = relationship("Appointment", back_populates="consultation")
    doctor = relationship("Doctor", back_populates="consultations")
    patient = relationship("Patient", back_populates="consultations")

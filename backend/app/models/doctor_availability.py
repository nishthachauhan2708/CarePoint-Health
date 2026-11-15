from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Time
from sqlalchemy.orm import relationship
from app.database.session import Base

class DoctorAvailability(Base):
    __tablename__ = "doctor_availabilities"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(String(15), nullable=False)  # Monday, Tuesday, etc.
    start_time = Column(String(10), nullable=False)   # e.g. "09:00"
    end_time = Column(String(10), nullable=False)     # e.g. "17:00"
    slot_duration_minutes = Column(Integer, default=30)
    is_available = Column(Boolean, default=True)

    # Relationships
    doctor = relationship("Doctor", back_populates="availabilities")

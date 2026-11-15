from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    code = Column(String(10), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    head_doctor_name = Column(String(150), nullable=True)

    # Relationships
    doctors = relationship("Doctor", back_populates="department")
    appointments = relationship("Appointment", back_populates="department")

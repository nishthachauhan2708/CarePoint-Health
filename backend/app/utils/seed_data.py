import json
from datetime import date, timedelta
from app.database.session import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.department import Department
from app.models.doctor import Doctor
from app.models.doctor_availability import DoctorAvailability
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.prescription import Prescription
from app.models.consultation import ConsultationNote
from app.models.notification import Notification

def seed():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).filter(User.email == "admin@carehealth.com").first():
        print("Database is already seeded with demonstration data.")
        db.close()
        return

    print("Seeding medical departments...")
    departments_data = [
        {
            "name": "Cardiology",
            "code": "CARD",
            "description": "Comprehensive cardiac diagnostics, interventional cardiology, and preventative heart care.",
            "icon": "Heart",
            "head_doctor_name": "Dr. Aarav Sharma"
        },
        {
            "name": "Neurology",
            "code": "NEUR",
            "description": "Advanced care for brain, spinal cord, stroke management, and neuromuscular disorders.",
            "icon": "Brain",
            "head_doctor_name": "Dr. Priya Nair"
        },
        {
            "name": "Orthopedics",
            "code": "ORTH",
            "description": "Joint replacements, sports medicine, spine surgeries, and trauma reconstruction.",
            "icon": "Bone",
            "head_doctor_name": "Dr. Rohit Verma"
        },
        {
            "name": "Pediatrics",
            "code": "PED",
            "description": "Compassionate pediatric care, infant wellness, vaccinations, and adolescent medicine.",
            "icon": "Baby",
            "head_doctor_name": "Dr. Ananya Sen"
        },
        {
            "name": "Oncology",
            "code": "ONCO",
            "description": "Multidisciplinary tumor boards, medical chemotherapy, radiation and surgical oncology.",
            "icon": "Activity",
            "head_doctor_name": "Dr. Rajesh Kulkarni"
        },
        {
            "name": "Internal Medicine",
            "code": "MED",
            "description": "Primary healthcare, chronic disease management, diabetes, and metabolic wellness.",
            "icon": "Stethoscope",
            "head_doctor_name": "Dr. Sunita Patel"
        }
    ]

    dept_objs = {}
    for d in departments_data:
        dept = Department(**d)
        db.add(dept)
        db.commit()
        db.refresh(dept)
        dept_objs[d["code"]] = dept

    print("Seeding core demo accounts (Admin, Receptionist)...")
    admin_user = User(
        email="admin@carehealth.com",
        hashed_password=get_password_hash("Admin@123"),
        full_name="Dr. Alok Verma (Chief Medical Administrator)",
        role="admin",
        phone_number="+91-9876540001",
        is_active=True
    )
    db.add(admin_user)

    receptionist_user = User(
        email="receptionist@carehealth.com",
        hashed_password=get_password_hash("Reception@123"),
        full_name="Suman Gupta (Front Desk Lead)",
        role="receptionist",
        phone_number="+91-9876540002",
        is_active=True
    )
    db.add(receptionist_user)
    db.commit()

    print("Seeding specialist doctors...")
    doctors_info = [
        {
            "email": "doctor@carehealth.com",
            "name": "Dr. Aarav Sharma",
            "dept_code": "CARD",
            "license": "MCI-2015-84920",
            "spec": "Interventional Cardiologist",
            "qual": "MBBS, MD (Medicine), DM (Cardiology)",
            "exp": 14,
            "fee": 900.0,
            "bio": "Specialist in coronary interventions, angioplasty, and preventative cardiology with over 14 years clinical experience."
        },
        {
            "email": "priya.nair@carehealth.com",
            "name": "Dr. Priya Nair",
            "dept_code": "NEUR",
            "license": "MCI-2017-39211",
            "spec": "Senior Neurologist",
            "qual": "MBBS, MD, DM (Neurology - AIIMS)",
            "exp": 11,
            "fee": 1000.0,
            "bio": "Expert in acute stroke management, epilepsy management, migraine disorders, and neuromuscular rehabilitation."
        },
        {
            "email": "rohit.verma@carehealth.com",
            "name": "Dr. Rohit Verma",
            "dept_code": "ORTH",
            "license": "MCI-2012-19402",
            "spec": "Orthopedic Surgeon",
            "qual": "MBBS, MS (Orthopedics), M.Ch (UK)",
            "exp": 16,
            "fee": 850.0,
            "bio": "Specialized in robotic total knee and hip replacements, arthroscopy, and sports injury reconstruction."
        },
        {
            "email": "ananya.sen@carehealth.com",
            "name": "Dr. Ananya Sen",
            "dept_code": "PED",
            "license": "MCI-2019-74829",
            "spec": "Consultant Pediatrician",
            "qual": "MBBS, DCH, MD (Pediatrics)",
            "exp": 8,
            "fee": 650.0,
            "bio": "Dedicated to child developmental wellness, pediatric asthma, neonatology, and adolescent nutrition."
        }
    ]

    doctor_objs = []
    for doc in doctors_info:
        u = User(
            email=doc["email"],
            hashed_password=get_password_hash("Doctor@123"),
            full_name=doc["name"],
            role="doctor",
            phone_number="+91-98765400" + str(10 + len(doctor_objs)),
            is_active=True
        )
        db.add(u)
        db.commit()
        db.refresh(u)

        d_model = Doctor(
            user_id=u.id,
            department_id=dept_objs[doc["dept_code"]].id,
            license_number=doc["license"],
            specialization=doc["spec"],
            qualification=doc["qual"],
            experience_years=doc["exp"],
            consultation_fee=doc["fee"],
            biography=doc["bio"]
        )
        db.add(d_model)
        db.commit()
        db.refresh(d_model)
        doctor_objs.append(d_model)

        # Add weekly schedule Mon-Fri 09:00 - 17:00
        for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]:
            av = DoctorAvailability(
                doctor_id=d_model.id,
                day_of_week=day,
                start_time="09:00",
                end_time="17:00",
                slot_duration_minutes=30,
                is_available=True
            )
            db.add(av)
        db.commit()

    print("Seeding patients...")
    patients_info = [
        {
            "email": "patient@carehealth.com",
            "name": "Rohan Mehra",
            "uhid": "CHP-2026-1001",
            "dob": date(1993, 6, 14),
            "gender": "Male",
            "blood": "B+",
            "allergies": "Penicillin",
            "chronic": "Mild Hypertension"
        },
        {
            "email": "neha.kapoor@carehealth.com",
            "name": "Neha Kapoor",
            "uhid": "CHP-2026-1002",
            "dob": date(1997, 11, 23),
            "gender": "Female",
            "blood": "O+",
            "allergies": "None",
            "chronic": "None"
        },
        {
            "email": "vikram.singh@carehealth.com",
            "name": "Vikram Singh",
            "uhid": "CHP-2026-1003",
            "dob": date(1982, 3, 10),
            "gender": "Male",
            "blood": "A+",
            "allergies": "Sulfa drugs",
            "chronic": "Type 2 Diabetes"
        }
    ]

    patient_objs = []
    for p in patients_info:
        u = User(
            email=p["email"],
            hashed_password=get_password_hash("Patient@123"),
            full_name=p["name"],
            role="patient",
            phone_number="+91-98765400" + str(30 + len(patient_objs)),
            is_active=True
        )
        db.add(u)
        db.commit()
        db.refresh(u)

        pat_model = Patient(
            user_id=u.id,
            patient_uhid=p["uhid"],
            date_of_birth=p["dob"],
            gender=p["gender"],
            blood_group=p["blood"],
            emergency_contact_name="Family Member",
            emergency_contact_phone="+91-9876549999",
            address="124 Lotus Boulevard, Sector 100, New Delhi, India",
            allergies=p["allergies"],
            chronic_conditions=p["chronic"]
        )
        db.add(pat_model)
        db.commit()
        db.refresh(pat_model)
        patient_objs.append(pat_model)

    print("Seeding appointments...")
    today = date.today()
    slots = ["09:30 - 10:00", "10:00 - 10:30", "11:30 - 12:00", "14:00 - 14:30"]
    
    # 1. Today's confirmed appointment for demo patient with Dr. Aarav Sharma
    appt1 = Appointment(
        patient_id=patient_objs[0].id,
        doctor_id=doctor_objs[0].id,
        department_id=dept_objs["CARD"].id,
        appointment_date=today,
        time_slot="10:00 - 10:30",
        queue_number=1,
        status="confirmed",
        symptoms="Occasional chest tightness after climbing stairs, palpitations."
    )
    db.add(appt1)

    # 2. Today's pending appointment for Neha Kapoor with Dr. Priya Nair
    appt2 = Appointment(
        patient_id=patient_objs[1].id,
        doctor_id=doctor_objs[1].id,
        department_id=dept_objs["NEUR"].id,
        appointment_date=today,
        time_slot="11:30 - 12:00",
        queue_number=1,
        status="pending",
        symptoms="Frequent throbbing migraine headaches with light sensitivity."
    )
    db.add(appt2)

    # 3. Yesterday's completed appointment with Dr. Aarav Sharma (has consultation notes + prescription!)
    yesterday = today - timedelta(days=1)
    appt3 = Appointment(
        patient_id=patient_objs[0].id,
        doctor_id=doctor_objs[0].id,
        department_id=dept_objs["CARD"].id,
        appointment_date=yesterday,
        time_slot="09:30 - 10:00",
        queue_number=1,
        status="completed",
        symptoms="Annual cardiovascular routine screening."
    )
    db.add(appt3)
    db.commit()
    db.refresh(appt3)

    # Add Consultation Note for appt3
    vitals = {
        "blood_pressure": "128/84 mmHg",
        "pulse_rate": "74 bpm",
        "temperature": "98.4 F",
        "spo2": "99%",
        "weight": "72 kg"
    }
    cons = ConsultationNote(
        appointment_id=appt3.id,
        doctor_id=appt3.doctor_id,
        patient_id=appt3.patient_id,
        clinical_impression="Borderline stage 1 hypertension, healthy S1-S2, clear lung fields.",
        vital_signs=json.dumps(vitals),
        follow_up_recommendation="Review with fasting lipid profile and ECG in 2 weeks."
    )
    db.add(cons)

    # Add Prescription for appt3
    medications_data = [
        {
            "medicine_name": "Telmisartan",
            "dosage": "40mg",
            "frequency": "1-0-0 (Morning once daily)",
            "duration": "30 days",
            "instructions": "Take after breakfast with water"
        },
        {
            "medicine_name": "Atorvastatin",
            "dosage": "10mg",
            "frequency": "0-0-1 (Night once daily)",
            "duration": "30 days",
            "instructions": "Take at bedtime"
        }
    ]
    presc = Prescription(
        appointment_id=appt3.id,
        patient_id=appt3.patient_id,
        doctor_id=appt3.doctor_id,
        diagnosis="Essential Hypertension & Hyperlipidemia Management",
        medications=json.dumps(medications_data),
        additional_advice="Maintain low sodium intake (< 2g/day), 30 minutes brisk walking 5 days/week."
    )
    db.add(presc)

    # Add Notifications
    n1 = Notification(
        user_id=patient_objs[0].user_id,
        title="Welcome to CareHealth Point",
        message="Your Digital Health Card has been issued. Your UHID is CHP-2026-1001.",
        type="info"
    )
    n2 = Notification(
        user_id=patient_objs[0].user_id,
        title="Upcoming Appointment Today",
        message="You have an appointment confirmed with Dr. Aarav Sharma at 10:00 AM.",
        type="appointment_booked"
    )
    db.add(n1)
    db.add(n2)
    db.commit()

    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed()

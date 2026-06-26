import os
from datetime import datetime, date, timedelta
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.services.queue_service import QueueService

app = create_app()

SPECIALTIES = [
    "Cardiology", "Pediatrics", "Dermatology", "Orthopedics", "Neurology",
    "General Medicine", "Ophthalmology", "Psychiatry", "Gynecology", "ENT"
]

DOCTOR_NAMES = [
    "Dr. Alice Smith", "Dr. Bob Johnson", "Dr. Charlie Williams", "Dr. Diana Brown",
    "Dr. Evan Davis", "Dr. Fiona Miller", "Dr. George Wilson", "Dr. Hannah Moore",
    "Dr. Ian Taylor", "Dr. Julia Anderson"
]

ROOMS = [f"Room {100 + i}" for i in range(1, 11)]

TIME_SLOTS = [
    "09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00",
    "11:00 - 11:30", "11:30 - 12:00", "14:00 - 14:30", "14:30 - 15:00",
    "15:00 - 15:30", "15:30 - 16:00"
]

STATUSES = ["completed", "absent", "serving", "scheduled", "cancelled"]

def seed_database():
    with app.app_context():
        print("Recreating database tables...")
        # Optional: Drop all tables if you want a clean slate
        # db.drop_all()
        db.create_all()
        
        # Check if users already exist
        if User.query.first():
            print("Database already contains data. Skipping seeding.")
            return

        print("Seeding Users and Doctors...")
        doctors_list = []
        
        # 1. Seed 10 Doctors
        for i in range(10):
            email = f"doctor{i+1}@careflow.com"
            name = DOCTOR_NAMES[i]
            
            user = User(
                email=email,
                full_name=name,
                role='doctor'
            )
            user.set_password("password123")
            db.session.add(user)
            db.session.flush() # get user id
            
            doctor = Doctor(
                user_id=user.id,
                specialty=SPECIALTIES[i],
                room_number=ROOMS[i]
            )
            db.session.add(doctor)
            doctors_list.append(doctor)
            
        print("Seeding 50 Patients...")
        patients_list = []
        
        # 2. Seed 50 Patients
        for i in range(1, 51):
            email = f"patient{i}@careflow.com"
            name = f"Patient {i}"
            
            user = User(
                email=email,
                full_name=name,
                role='patient'
            )
            user.set_password("password123")
            db.session.add(user)
            patients_list.append(user)
            
        db.session.commit()
        print(f"Successfully seeded 10 doctors and 50 patients.")

        # 3. Seed Appointments
        # Let's seed for yesterday, today, and tomorrow
        today_date = date.today()
        yesterday_date = today_date - timedelta(days=1)
        tomorrow_date = today_date + timedelta(days=1)
        
        dates = [yesterday_date, today_date, tomorrow_date]
        
        print("Seeding appointments...")
        appointment_count = 0
        
        # Let's make some appointments for yesterday (mostly completed/absent/cancelled)
        # Doctor 1 & 2 have a full list
        for d_idx, doctor in enumerate(doctors_list[:4]):
            for slot_idx, slot in enumerate(TIME_SLOTS[:6]):
                # select a patient based on some simple formula to keep it unique
                patient = patients_list[(d_idx * 10 + slot_idx) % 50]
                
                # Yesterday's appointments: completed or absent
                status = "completed" if slot_idx % 4 != 0 else "absent"
                
                appt = Appointment(
                    patient_id=patient.id,
                    doctor_id=doctor.id,
                    appointment_date=yesterday_date,
                    time_slot=slot,
                    queue_number=slot_idx + 1,
                    status=status
                )
                db.session.add(appt)
                appointment_count += 1

        # Today's appointments (a mix of completed, serving, scheduled, absent)
        # Doctor 1 has 5 patients
        # Doctor 2 has 4 patients
        # Doctor 3 has 3 patients
        for d_idx, doctor in enumerate(doctors_list[:5]):
            # Number of appointments today varies per doctor
            num_appts = 5 - d_idx
            for slot_idx in range(num_appts):
                slot = TIME_SLOTS[slot_idx]
                patient = patients_list[(d_idx * 5 + slot_idx + 15) % 50]
                
                # Determine today's status mix
                if slot_idx == 0:
                    status = "completed"
                elif slot_idx == 1:
                    status = "serving"
                elif slot_idx == 2:
                    status = "absent"
                else:
                    status = "scheduled"
                    
                appt = Appointment(
                    patient_id=patient.id,
                    doctor_id=doctor.id,
                    appointment_date=today_date,
                    time_slot=slot,
                    queue_number=slot_idx + 1,
                    status=status
                )
                db.session.add(appt)
                appointment_count += 1

        # Tomorrow's appointments (all scheduled)
        for d_idx, doctor in enumerate(doctors_list[:6]):
            num_appts = 3
            for slot_idx in range(num_appts):
                slot = TIME_SLOTS[slot_idx + 2] # start a bit later
                patient = patients_list[(d_idx * 3 + slot_idx + 30) % 50]
                
                appt = Appointment(
                    patient_id=patient.id,
                    doctor_id=doctor.id,
                    appointment_date=tomorrow_date,
                    time_slot=slot,
                    queue_number=slot_idx + 1,
                    status="scheduled"
                )
                db.session.add(appt)
                appointment_count += 1

        db.session.commit()
        print(f"Successfully seeded {appointment_count} appointments across yesterday, today, and tomorrow.")

if __name__ == "__main__":
    seed_database()

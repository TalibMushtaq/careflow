from app.extensions import db
from app.models.appointment import Appointment
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

class QueueService:
    @staticmethod
    def get_next_queue_number(doctor_id, appointment_date):
        """
        Calculate the next queue number for a specific doctor on a specific date.
        Queue numbers reset daily for each doctor.
        """
        # Query for the maximum queue number for the doctor on this date
        max_queue = db.session.query(func.max(Appointment.queue_number))\
            .filter(
                Appointment.doctor_id == doctor_id,
                Appointment.appointment_date == appointment_date
            ).scalar()
        
        return (max_queue or 0) + 1

    @staticmethod
    def create_appointment(patient_id, doctor_id, appointment_date, time_slot):
        """
        Safely create a new appointment, calculate queue number, and prevent duplicate bookings.
        """
        try:
            # First, check if the patient already has an appointment for the same doctor, date, and time slot
            # (or if anyone does, which is caught by the unique constraint, but we check first)
            existing = Appointment.query.filter_by(
                doctor_id=doctor_id,
                appointment_date=appointment_date,
                time_slot=time_slot
            ).first()
            
            if existing:
                return None, "This doctor is already booked for this date and time slot."
            
            # Retrieve queue number
            queue_num = QueueService.get_next_queue_number(doctor_id, appointment_date)
            
            # Create new appointment
            appointment = Appointment(
                patient_id=patient_id,
                doctor_id=doctor_id,
                appointment_date=appointment_date,
                time_slot=time_slot,
                queue_number=queue_num,
                status='scheduled'
            )
            
            db.session.add(appointment)
            db.session.commit()
            return appointment, None
            
        except IntegrityError:
            db.session.rollback()
            return None, "This slot has already been booked by another patient."
        except Exception as e:
            db.session.rollback()
            return None, str(e)

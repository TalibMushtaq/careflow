from datetime import datetime
from app.extensions import db

class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id', ondelete='CASCADE'), nullable=False)
    appointment_date = db.Column(db.Date, nullable=False)
    time_slot = db.Column(db.String(30), nullable=False)
    queue_number = db.Column(db.Integer, nullable=False)
    status = db.Column(
        db.Enum('scheduled', 'serving', 'completed', 'absent', 'cancelled', name='appointment_status'),
        default='scheduled',
        nullable=False
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = db.relationship('User', back_populates='patient_appointments', foreign_keys=[patient_id])
    doctor = db.relationship('Doctor', back_populates='appointments')

    # Add a unique constraint to prevent duplicate bookings for the same doctor, date, and time slot
    __table_args__ = (
        db.UniqueConstraint('doctor_id', 'appointment_date', 'time_slot', name='_doctor_date_slot_uc'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.full_name if self.patient else None,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.user.full_name if self.doctor and self.doctor.user else None,
            'specialty': self.doctor.specialty if self.doctor else None,
            'room_number': self.doctor.room_number if self.doctor else None,
            'appointment_date': self.appointment_date.strftime('%Y-%m-%d') if self.appointment_date else None,
            'time_slot': self.time_slot,
            'queue_number': self.queue_number,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

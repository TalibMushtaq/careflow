from flask import Blueprint, request
from app.extensions import db
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.user import User
from app.schemas.appointment import (
    AppointmentBookSchema, 
    AppointmentStatusUpdateSchema, 
    AppointmentResponseSchema
)
from app.services.queue_service import QueueService
from app.utils.helpers import api_response, role_required
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from marshmallow import ValidationError
from datetime import datetime, date

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/book', methods=['POST'])
@jwt_required()
@role_required('patient')
def book_appointment():
    """
    Book an appointment. Patient role only.
    """
    patient_id = int(get_jwt_identity())
    schema = AppointmentBookSchema()
    
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as err:
        errors = [f"{field}: {', '.join(msgs)}" for field, msgs in err.messages.items()]
        return api_response(False, message=errors[0], status_code=400)
        
    doctor_id = data['doctor_id']
    appt_date = data['appointment_date']
    time_slot = data['time_slot']
    
    # Check if doctor exists
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return api_response(False, message="Doctor not found", status_code=404)
        
    # Prevent booking in the past
    if appt_date < date.today():
        return api_response(False, message="Cannot book appointments in the past", status_code=400)
        
    # Create the appointment with safety checks and automatic queue numbering
    appointment, err_msg = QueueService.create_appointment(
        patient_id=patient_id,
        doctor_id=doctor_id,
        appointment_date=appt_date,
        time_slot=time_slot
    )
    
    if err_msg:
        return api_response(False, message=err_msg, status_code=400)
        
    return api_response(
        True, 
        message="Appointment booked successfully", 
        data={"queue_number": appointment.queue_number, "id": appointment.id}, 
        status_code=201
    )

@appointments_bp.route('/me', methods=['GET'])
@jwt_required()
@role_required('patient')
def get_my_appointments():
    """
    Get all appointments for the logged-in patient.
    """
    patient_id = int(get_jwt_identity())
    
    appointments = Appointment.query.filter_by(patient_id=patient_id)\
        .order_by(Appointment.appointment_date.desc(), Appointment.queue_number.asc())\
        .all()
        
    schema = AppointmentResponseSchema(many=True)
    serialized = schema.dump([a.to_dict() for a in appointments])
    
    return api_response(True, data=serialized, status_code=200)

@appointments_bp.route('/doctor/today', methods=['GET'])
@jwt_required()
@role_required('doctor')
def get_doctor_today_appointments():
    """
    Get all appointments for the logged-in doctor for today (or a specified date).
    Ordered by queue number.
    """
    user_id = int(get_jwt_identity())
    
    # Get doctor profile
    doctor = Doctor.query.filter_by(user_id=user_id).first()
    if not doctor:
        return api_response(False, message="Doctor profile not found", status_code=404)
        
    # Optional date override for testing or viewing other days
    target_date_str = request.args.get('date')
    if target_date_str:
        try:
            target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
        except ValueError:
            return api_response(False, message="Invalid date format, use YYYY-MM-DD", status_code=400)
    else:
        target_date = date.today()
        
    appointments = Appointment.query.filter_by(
        doctor_id=doctor.id,
        appointment_date=target_date
    ).order_by(Appointment.queue_number.asc()).all()
    
    schema = AppointmentResponseSchema(many=True)
    serialized = schema.dump([a.to_dict() for a in appointments])
    
    return api_response(True, data=serialized, status_code=200)

@appointments_bp.route('/<int:appointment_id>/status', methods=['PATCH'])
@jwt_required()
def update_appointment_status(appointment_id):
    """
    Update appointment status.
    Doctors can change status to: 'serving', 'completed', 'absent'.
    Patients can cancel their own appointment ONLY if it is currently 'scheduled'.
    """
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    role = claims.get('role')
    
    schema = AppointmentStatusUpdateSchema()
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as err:
        errors = [f"{field}: {', '.join(msgs)}" for field, msgs in err.messages.items()]
        return api_response(False, message=errors[0], status_code=400)
        
    new_status = data['status']
    appointment = Appointment.query.get(appointment_id)
    
    if not appointment:
        return api_response(False, message="Appointment not found", status_code=404)
        
    if role == 'patient':
        # Patient is only allowed to cancel their own scheduled appointment
        if appointment.patient_id != user_id:
            return api_response(False, message="Forbidden: not your appointment", status_code=403)
            
        if new_status != 'cancelled':
            return api_response(False, message="Patients can only cancel appointments", status_code=400)
            
        if appointment.status != 'scheduled':
            return api_response(False, message="Only scheduled appointments can be cancelled", status_code=400)
            
        appointment.status = 'cancelled'
        
    elif role == 'doctor':
        # Doctor can update status
        # Get doctor profile to make sure the doctor owns this appointment
        doctor = Doctor.query.filter_by(user_id=user_id).first()
        if not doctor or appointment.doctor_id != doctor.id:
            return api_response(False, message="Forbidden: not your patient", status_code=403)
            
        if new_status == 'cancelled':
            return api_response(False, message="Doctors cannot set status to cancelled", status_code=400)
            
        appointment.status = new_status
        
    else:
        return api_response(False, message="Unauthorized role", status_code=403)
        
    try:
        db.session.commit()
        return api_response(True, message=f"Appointment status updated to {new_status}", data=appointment.to_dict(), status_code=200)
    except Exception as e:
        db.session.rollback()
        return api_response(False, message=f"Failed to update status: {str(e)}", status_code=500)

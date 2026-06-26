from flask import Blueprint, request
from app.models.doctor import Doctor
from app.models.user import User
from app.schemas.doctor import DoctorResponseSchema
from app.utils.helpers import api_response

doctors_bp = Blueprint('doctors', __name__)

@doctors_bp.route('', methods=['GET'])
def get_doctors():
    """
    Get all doctors, optionally filtering by search (name or specialty) or specialty.
    """
    search_query = request.args.get('search', '').strip()
    specialty_query = request.args.get('specialty', '').strip()
    
    query = Doctor.query.join(User, Doctor.user_id == User.id)
    
    if specialty_query:
        query = query.filter(Doctor.specialty.ilike(f"%{specialty_query}%"))
        
    if search_query:
        query = query.filter(
            (Doctor.specialty.ilike(f"%{search_query}%")) |
            (User.full_name.ilike(f"%{search_query}%"))
        )
        
    doctors = query.all()
    schema = DoctorResponseSchema(many=True)
    serialized = schema.dump([d.to_dict() for d in doctors])
    
    return api_response(True, data=serialized, status_code=200)

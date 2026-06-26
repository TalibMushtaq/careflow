from flask import Blueprint, request
from app.extensions import db
from app.models.user import User
from app.models.doctor import Doctor
from app.schemas.user import UserRegisterSchema, UserLoginSchema
from app.utils.helpers import api_response
from flask_jwt_extended import create_access_token
from marshmallow import ValidationError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    schema = UserRegisterSchema()
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as err:
        # Return first validation error message
        errors = [f"{field}: {', '.join(msgs)}" for field, msgs in err.messages.items()]
        return api_response(False, message=errors[0], status_code=400)
    
    # Check if email exists
    if User.query.filter_by(email=data['email']).first():
        return api_response(False, message="Email is already registered", status_code=400)
        
    try:
        new_user = User(
            email=data['email'],
            full_name=data['name'],
            role=data['role']
        )
        new_user.set_password(data['password'])
        db.session.add(new_user)
        db.session.flush()  # to get new_user.id
        
        # If doctor role is chosen, handle the specialty & room number
        if data['role'] == 'doctor':
            specialty = data.get('specialty')
            room_number = data.get('room_number')
            
            if not specialty or not room_number:
                db.session.rollback()
                return api_response(False, message="Doctors require specialty and room_number", status_code=400)
                
            new_doctor = Doctor(
                user_id=new_user.id,
                specialty=specialty,
                room_number=room_number
            )
            db.session.add(new_doctor)
            
        db.session.commit()
        return api_response(True, message="User registered successfully", data=new_user.to_dict(), status_code=201)
        
    except Exception as e:
        db.session.rollback()
        return api_response(False, message=f"Registration failed: {str(e)}", status_code=500)

@auth_bp.route('/login', methods=['POST'])
def login():
    schema = UserLoginSchema()
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as err:
        errors = [f"{field}: {', '.join(msgs)}" for field, msgs in err.messages.items()]
        return api_response(False, message=errors[0], status_code=400)
        
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return api_response(False, message="Invalid email or password", status_code=401)
        
    # Find doctor_id if user is a doctor
    doctor_id = None
    if user.role == 'doctor' and user.doctor_profile:
        doctor_id = user.doctor_profile.id
        
    # Create token with additional claims
    access_token = create_access_token(
        identity=str(user.id), 
        additional_claims={"role": user.role, "email": user.email}
    )
    
    # Store token in session_token (per DB schema)
    user.session_token = access_token
    db.session.commit()
    
    user_data = user.to_dict()
    if doctor_id:
        user_data['doctor_id'] = doctor_id
        
    return api_response(True, message="Login successful", data={
        "token": access_token,
        "user": user_data
    }, status_code=200)

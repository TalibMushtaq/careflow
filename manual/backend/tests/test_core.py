import pytest
from datetime import date, timedelta
from app import create_app
from app.extensions import db
from app.config import TestConfig
from app.models.user import User
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.services.queue_service import QueueService

@pytest.fixture
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_user_creation_and_auth(app):
    """Test user registration, password hashing, and login validation."""
    with app.app_context():
        user = User(email="test@example.com", full_name="Test User", role="patient")
        user.set_password("mypassword")
        db.session.add(user)
        db.session.commit()
        
        # Verify database save
        db_user = User.query.filter_by(email="test@example.com").first()
        assert db_user is not None
        assert db_user.full_name == "Test User"
        assert db_user.check_password("mypassword") is True
        assert db_user.check_password("wrongpassword") is False
        assert db_user.password_hash != "mypassword"

def test_queue_increment_and_reset(app):
    """Test that queue numbers increment sequentially and reset daily/per doctor."""
    with app.app_context():
        # Setup doctors
        u1 = User(email="doc1@test.com", full_name="Doc One", role="doctor")
        u1.set_password("p")
        u2 = User(email="doc2@test.com", full_name="Doc Two", role="doctor")
        u2.set_password("p")
        db.session.add_all([u1, u2])
        db.session.flush()
        
        d1 = Doctor(user_id=u1.id, specialty="Cardiology", room_number="101")
        d2 = Doctor(user_id=u2.id, specialty="Pediatrics", room_number="102")
        db.session.add_all([d1, d2])
        db.session.flush()
        
        # Setup patients
        p1 = User(email="pat1@test.com", full_name="Patient One", role="patient")
        p1.set_password("p")
        p2 = User(email="pat2@test.com", full_name="Patient Two", role="patient")
        p2.set_password("p")
        db.session.add_all([p1, p2])
        db.session.commit()
        
        today = date.today()
        tomorrow = today + timedelta(days=1)
        
        # 1. Book first appointment for Doctor 1 today
        appt1, err = QueueService.create_appointment(p1.id, d1.id, today, "09:00 - 09:30")
        assert err is None
        assert appt1.queue_number == 1
        
        # 2. Book second appointment for Doctor 1 today -> should be queue 2
        appt2, err = QueueService.create_appointment(p2.id, d1.id, today, "09:30 - 10:00")
        assert err is None
        assert appt2.queue_number == 2
        
        # 3. Book appointment for Doctor 2 today -> should start at 1 (different doctor)
        appt3, err = QueueService.create_appointment(p1.id, d2.id, today, "09:00 - 09:30")
        assert err is None
        assert appt3.queue_number == 1
        
        # 4. Book appointment for Doctor 1 tomorrow -> should start at 1 (different date)
        appt4, err = QueueService.create_appointment(p1.id, d1.id, tomorrow, "09:00 - 09:30")
        assert err is None
        assert appt4.queue_number == 1

def test_prevent_duplicate_booking(app):
    """Test that duplicate bookings for same doctor, date, and slot are rejected."""
    with app.app_context():
        # Setup doctor
        u1 = User(email="doc1@test.com", full_name="Doc One", role="doctor")
        u1.set_password("p")
        db.session.add(u1)
        db.session.flush()
        d1 = Doctor(user_id=u1.id, specialty="Cardiology", room_number="101")
        db.session.add(d1)
        
        # Patients
        p1 = User(email="pat1@test.com", full_name="Patient One", role="patient")
        p1.set_password("p")
        p2 = User(email="pat2@test.com", full_name="Patient Two", role="patient")
        p2.set_password("p")
        db.session.add_all([p1, p2])
        db.session.commit()

        
        today = date.today()
        
        # Book slot
        appt1, err = QueueService.create_appointment(p1.id, d1.id, today, "09:00 - 09:30")
        assert err is None
        assert appt1 is not None
        
        # Attempt duplicate booking for same doctor, date, slot
        appt2, err2 = QueueService.create_appointment(p2.id, d1.id, today, "09:00 - 09:30")
        assert appt2 is None
        assert "already booked" in err2.lower()

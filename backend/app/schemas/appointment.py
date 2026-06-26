from marshmallow import Schema, fields, validate

class AppointmentBookSchema(Schema):
    doctor_id = fields.Int(required=True)
    appointment_date = fields.Date(required=True, format='%Y-%m-%d')
    time_slot = fields.Str(required=True, validate=validate.Length(min=1, max=30))

class AppointmentStatusUpdateSchema(Schema):
    status = fields.Str(required=True, validate=validate.OneOf(['serving', 'completed', 'absent', 'cancelled']))

class AppointmentResponseSchema(Schema):
    id = fields.Int()
    patient_id = fields.Int()
    patient_name = fields.Str()
    doctor_id = fields.Int()
    doctor_name = fields.Str()
    specialty = fields.Str()
    room_number = fields.Str()
    appointment_date = fields.Date()
    time_slot = fields.Str()
    queue_number = fields.Int()
    status = fields.Str()
    created_at = fields.DateTime()

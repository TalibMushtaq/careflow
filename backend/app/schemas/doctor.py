from marshmallow import Schema, fields

class DoctorResponseSchema(Schema):
    id = fields.Int()
    name = fields.Str()
    email = fields.Email()
    specialty = fields.Str()
    room_number = fields.Str()
    created_at = fields.DateTime()

from marshmallow import Schema, fields, validate, post_load

class UserRegisterSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6, max=100))
    role = fields.Str(required=True, validate=validate.OneOf(['patient', 'doctor']))
    
    # Optional fields for doctor registration
    specialty = fields.Str(validate=validate.Length(min=2, max=150))
    room_number = fields.Str(validate=validate.Length(min=1, max=20))

class UserLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

class UserResponseSchema(Schema):
    id = fields.Int()
    email = fields.Email()
    full_name = fields.Str(dump_only=True)
    role = fields.Str()
    created_at = fields.DateTime()

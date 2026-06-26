from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def role_required(allowed_roles):
    """
    Decorator to restrict route access by user roles.
    allowed_roles can be a string (e.g. 'patient') or a list/tuple of strings.
    """
    if isinstance(allowed_roles, str):
        allowed_roles = [allowed_roles]
        
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role")
            
            if user_role not in allowed_roles:
                return jsonify({
                    "success": False,
                    "message": f"Access forbidden: requires role in {allowed_roles}"
                }), 403
                
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def api_response(success, message=None, data=None, status_code=200):
    """
    Standard JSON response formatter for the API.
    """
    response = {"success": success}
    if message is not None:
        response["message"] = message
    if data is not None:
        response["data"] = data
        
    return jsonify(response), status_code

from flask import Flask, jsonify
from app.config import Config
from app.extensions import db, migrate, jwt, cors, ma
from app.utils.helpers import api_response

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    ma.init_app(app)
    
    # Import Blueprints
    from app.routes.auth import auth_bp
    from app.routes.doctors import doctors_bp
    from app.routes.appointments import appointments_bp
    
    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(doctors_bp, url_prefix='/api/v1/doctors')
    app.register_blueprint(appointments_bp, url_prefix='/api/v1/appointments')
    
    # Global JWT error handlers
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return api_response(False, message="Invalid token provided.", status_code=401)
        
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return api_response(False, message="Token has expired.", status_code=401)
        
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return api_response(False, message="Authorization header missing.", status_code=401)
        
    # Global Error Handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return api_response(False, message="Resource not found.", status_code=404)
        
    @app.errorhandler(500)
    def internal_error(error):
        return api_response(False, message="Internal server error.", status_code=500)
        
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "service": "CareFlow Backend"}), 200

    return app

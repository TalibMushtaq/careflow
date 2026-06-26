from app import create_app
from app.extensions import db
import os

app = create_app()

# Auto-create database tables if they do not exist
with app.app_context():
    db.create_all()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

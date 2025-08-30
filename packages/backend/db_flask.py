"""
Flask-SQLAlchemy database setup
"""

from flask_sqlalchemy import SQLAlchemy

# Flask-SQLAlchemy instance
db = SQLAlchemy()

# For backward compatibility
db_session = db.session

from flask import Blueprint, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from ..database import db

security_bp = Blueprint("security", __name__)


# CORS設定
def init_cors(app):
    CORS(app, resources={r"/api/*": {"origins": "*"}})


# Rate Limiting設定
limiter = Limiter(key_func=get_remote_address)


def init_limiter(app):
    limiter.init_app(app)


@security_bp.route("/health", methods=["GET"])
@limiter.limit("10 per minute")
def health_check():
    return jsonify({"status": "ok"}), 200

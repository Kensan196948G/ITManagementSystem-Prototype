from flask import Blueprint, jsonify, request

from ..database import db
from ..models.change import ChangeRequest
from ..models.incident import Incident
from ..models.problem import Problem
from ..models.user import User

api_bp = Blueprint("api", __name__)


# インシデント一覧取得API
@api_bp.route("/incidents", methods=["GET"])
def get_incidents():
    incidents = Incident.query.all()
    result = [incident.to_dict() for incident in incidents]
    return jsonify(result), 200


# インシデント作成API
@api_bp.route("/incidents", methods=["POST"])
def create_incident():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400
    incident = Incident(
        title=data.get("title"),
        description=data.get("description"),
        status=data.get("status", "New"),
    )
    db.session.add(incident)
    db.session.commit()
    return jsonify(incident.to_dict()), 201


# 問題一覧取得API
@api_bp.route("/problems", methods=["GET"])
def get_problems():
    problems = Problem.query.all()
    result = [problem.to_dict() for problem in problems]
    return jsonify(result), 200


# 変更リクエスト一覧取得API
@api_bp.route("/changes", methods=["GET"])
def get_changes():
    changes = ChangeRequest.query.all()
    result = [change.to_dict() for change in changes]
    return jsonify(result), 200


# ユーザー一覧取得API
@api_bp.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    result = [user.to_dict() for user in users]
    return jsonify(result), 200


# ユーザー認証API（JWTトークン発行）
@api_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"message": "Could not verify"}), 401
    user = User.query.filter_by(username=data["username"]).first()
    if not user or not user.check_password(data["password"]):
        return jsonify({"message": "Invalid credentials"}), 401
    # JWTトークン発行はauth.pyのlogin関数に委譲する想定
    return jsonify({"message": "Login endpoint - use /auth/login"}), 200

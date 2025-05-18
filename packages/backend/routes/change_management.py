from flask import Blueprint, request, jsonify
from ..database import db
from ..models.change import ChangeRequest

change_bp = Blueprint('change', __name__)

@change_bp.route('/changes', methods=['GET'])
def get_changes():
    changes = ChangeRequest.query.all()
    result = [change.to_dict() for change in changes]
    return jsonify(result), 200

@change_bp.route('/changes', methods=['POST'])
def create_change():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400
    change = ChangeRequest(
        title=data.get('title'),
        description=data.get('description'),
        status=data.get('status', 'New')
    )
    db.session.add(change)
    db.session.commit()
    return jsonify(change.to_dict()), 201
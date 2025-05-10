from flask import Blueprint
from flask_jwt_extended import jwt_required

security_bp = Blueprint('security', __name__)

@security_bp.route('/status')
@jwt_required()  # 🔒 Security Update: JWT認証を必須化
def security_status():
    return {'status': 'secure'}
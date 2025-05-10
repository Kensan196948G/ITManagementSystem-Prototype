from flask import Blueprint, jsonify
from datetime import datetime

system_bp = Blueprint('system', __name__)

@system_bp.route('/api/system')
def system_root():
    """システムAPIのルートエンドポイント"""
    return jsonify({
        "status": "success",
        "data": {
            "service": "IT Management System API",
            "version": "1.2.0",
            "available_endpoints": [
                "/api/system/status",
                "/api/skysea/clients"
            ]
        }
    }), 200

@system_bp.route('/api/system/status')
def system_status():
    """システムステータスエンドポイント"""
    return jsonify({
        "status": "success",
        "data": {
            "system_status": "operational",
            "components": [
                {"name": "database", "status": "online"},
                {"name": "api-gateway", "status": "online"},
                {"name": "logging", "status": "online"}
            ]
        }
    }), 200

@system_bp.route('/api/skysea/clients')
def skysea_clients():
    """SkySea Client Viewのクライアントステータス取得"""
    # 仮のデータ - 実際にはSkySea APIやDBから取得する
    return jsonify({
        "status": "success",
        "data": {
            "total_clients": 150,
            "updated_clients": 148,
            "last_updated": datetime.now().isoformat()
        }
    }), 200
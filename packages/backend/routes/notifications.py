from flask import Blueprint, abort, jsonify, request

from packages.backend.database import db_session
from packages.backend.models import Notification

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.route("/notifications", methods=["GET"])
def list_notifications():
    """
    通知一覧取得
    """
    notifications = db_session.query(Notification).all()
    result = []
    for notification in notifications:
        result.append(
            {
                "id": notification.id,
                "title": notification.title,
                "message": notification.message,
                "user_id": notification.user_id,
                "created_at": notification.created_at.isoformat(),
                "read": notification.read,
            }
        )
    return jsonify(result)


@notifications_bp.route("/notifications", methods=["POST"])
def create_notification():
    """
    通知作成
    """
    data = request.get_json(force=True)
    if data is None:
        abort(400, description="リクエストボディが空です。")
    title = data.get("title")
    message = data.get("message")
    user_id = data.get("user_id")

    if not title or not message or not user_id:
        return jsonify({"error": "タイトル、メッセージ、ユーザーIDは必須です。"}), 400

    notification = Notification(
        title=title, message=message, user_id=user_id, read=False
    )
    db_session.add(notification)
    db_session.commit()

    return (
        jsonify(
            {"message": "通知を作成しました。", "notification_id": notification.id}
        ),
        201,
    )


@notifications_bp.route("/notifications/<int:notification_id>", methods=["PUT"])
def update_notification(notification_id):
    """
    通知更新（例: 既読フラグ）
    """
    notification = db_session.query(Notification).get(notification_id)
    if not notification:
        return jsonify({"error": "通知が見つかりません。"}), 404

    data = request.get_json(force=True)
    if data is None:
        abort(400, description="リクエストボディが空です。")
    notification.read = data.get("read", notification.read)

    db_session.commit()

    return jsonify({"message": "通知を更新しました。"})


@notifications_bp.route("/notifications/<int:notification_id>", methods=["DELETE"])
def delete_notification(notification_id):
    """
    通知削除
    """
    notification = db_session.query(Notification).get(notification_id)
    if not notification:
        return jsonify({"error": "通知が見つかりません。"}), 404

    db_session.delete(notification)
    db_session.commit()

    return jsonify({"message": "通知を削除しました。"})

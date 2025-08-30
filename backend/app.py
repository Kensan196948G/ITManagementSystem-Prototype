from datetime import datetime

from flask import Flask, abort, jsonify, request
from flask_jwt_extended import JWTManager, get_jwt_identity, jwt_required
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from marshmallow import Schema, ValidationError, fields, validate

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///tickets.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "your_jwt_secret_key"  # 既存のJWT設定に合わせてください

db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)


# チケットモデル
class Ticket(db.Model):
    __tablename__ = "tickets"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), nullable=False, default="open")
    priority = db.Column(db.String(50), nullable=False, default="medium")
    assignee = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


# バリデーションスキーマ
class TicketSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    description = fields.Str(allow_none=True)
    status = fields.Str(
        validate=validate.OneOf(["open", "in_progress", "resolved", "closed"])
    )
    priority = fields.Str(validate=validate.OneOf(["low", "medium", "high", "urgent"]))
    assignee = fields.Str(allow_none=True)


ticket_schema = TicketSchema()
tickets_schema = TicketSchema(many=True)


# エラーハンドラー
@app.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({"error": e.messages}), 400


# チケット一覧取得
@app.route("/api/tickets", methods=["GET"])
@jwt_required()
def get_tickets():
    tickets = Ticket.query.all()
    return jsonify(tickets_schema.dump(tickets)), 200


# チケット詳細取得
@app.route("/api/tickets/<int:ticket_id>", methods=["GET"])
@jwt_required()
def get_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    return jsonify(ticket_schema.dump(ticket)), 200


# チケット作成
@app.route("/api/tickets", methods=["POST"])
@jwt_required()
def create_ticket():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400
    try:
        data = ticket_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    ticket = Ticket(
        title=data["title"],
        description=data.get("description"),
        status=data.get("status", "open"),
        priority=data.get("priority", "medium"),
        assignee=data.get("assignee"),
    )
    db.session.add(ticket)
    db.session.commit()
    return jsonify(ticket_schema.dump(ticket)), 201


# チケット更新
@app.route("/api/tickets/<int:ticket_id>", methods=["PUT"])
@jwt_required()
def update_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400
    try:
        data = ticket_schema.load(json_data, partial=True)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    if "title" in data:
        ticket.title = data["title"]
    if "description" in data:
        ticket.description = data["description"]
    if "status" in data:
        ticket.status = data["status"]
    if "priority" in data:
        ticket.priority = data["priority"]
    if "assignee" in data:
        ticket.assignee = data["assignee"]

    db.session.commit()
    return jsonify(ticket_schema.dump(ticket)), 200


# チケット削除
@app.route("/api/tickets/<int:ticket_id>", methods=["DELETE"])
@jwt_required()
def delete_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    db.session.delete(ticket)
    db.session.commit()
    return jsonify({"message": "Ticket deleted"}), 200


# 通知モデル
class Notification(db.Model):
    __tablename__ = "notifications"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False)  # 通知対象ユーザーID
    message = db.Column(db.String(500), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# 通知スキーマ
class NotificationSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Str(required=True)
    message = fields.Str(required=True, validate=validate.Length(min=1, max=500))
    is_read = fields.Bool()
    created_at = fields.DateTime()


notification_schema = NotificationSchema()
notifications_schema = NotificationSchema(many=True)


# 通知一覧取得API
@app.route("/api/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    current_user = get_jwt_identity()
    notifications = (
        Notification.query.filter_by(user_id=current_user)
        .order_by(Notification.created_at.desc())
        .all()
    )
    return jsonify(notifications_schema.dump(notifications)), 200


# 通知既読API（オプション）
@app.route("/api/notifications/<int:notification_id>/read", methods=["POST"])
@jwt_required()
def mark_notification_read(notification_id):
    current_user = get_jwt_identity()
    notification = Notification.query.filter_by(
        id=notification_id, user_id=current_user
    ).first_or_404()
    notification.is_read = True
    db.session.commit()
    return jsonify(notification_schema.dump(notification)), 200


if __name__ == "__main__":
    app.run(debug=True)

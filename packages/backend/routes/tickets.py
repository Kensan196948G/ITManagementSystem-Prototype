from flask import Blueprint, jsonify, request

from packages.backend.database import db_session
from packages.backend.models import Ticket

tickets_bp = Blueprint("tickets", __name__)


@tickets_bp.route("/tickets", methods=["GET"])
def list_tickets():
    """
    チケット一覧取得
    """
    tickets = db_session.query(Ticket).all()
    result = []
    for ticket in tickets:
        result.append(
            {
                "id": ticket.id,
                "title": ticket.title,
                "description": ticket.description,
                "status": ticket.status,
                "created_at": ticket.created_at.isoformat(),
                "updated_at": (
                    ticket.updated_at.isoformat() if ticket.updated_at else None
                ),
                "assigned_to": ticket.assigned_to,
            }
        )
    return jsonify(result)


@tickets_bp.route("/tickets", methods=["POST"])
def create_ticket():
    """
    チケット作成
    """
    data = request.json
    title = data.get("title")
    description = data.get("description")
    assigned_to = data.get("assigned_to")

    if not title:
        return jsonify({"error": "タイトルは必須です。"}), 400

    ticket = Ticket(
        title=title, description=description, status="open", assigned_to=assigned_to
    )
    db_session.add(ticket)
    db_session.commit()

    return jsonify({"message": "チケットを作成しました。", "ticket_id": ticket.id}), 201


@tickets_bp.route("/tickets/<int:ticket_id>", methods=["GET"])
def get_ticket(ticket_id):
    """
    チケット詳細取得
    """
    ticket = db_session.query(Ticket).get(ticket_id)
    if not ticket:
        return jsonify({"error": "チケットが見つかりません。"}), 404

    return jsonify(
        {
            "id": ticket.id,
            "title": ticket.title,
            "description": ticket.description,
            "status": ticket.status,
            "created_at": ticket.created_at.isoformat(),
            "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None,
            "assigned_to": ticket.assigned_to,
        }
    )


@tickets_bp.route("/tickets/<int:ticket_id>", methods=["PUT"])
def update_ticket(ticket_id):
    """
    チケット更新
    """
    ticket = db_session.query(Ticket).get(ticket_id)
    if not ticket:
        return jsonify({"error": "チケットが見つかりません。"}), 404

    data = request.json
    ticket.title = data.get("title", ticket.title)
    ticket.description = data.get("description", ticket.description)
    ticket.status = data.get("status", ticket.status)
    ticket.assigned_to = data.get("assigned_to", ticket.assigned_to)

    db_session.commit()

    return jsonify({"message": "チケットを更新しました。"})


@tickets_bp.route("/tickets/<int:ticket_id>", methods=["DELETE"])
def delete_ticket(ticket_id):
    """
    チケット削除
    """
    ticket = db_session.query(Ticket).get(ticket_id)
    if not ticket:
        return jsonify({"error": "チケットが見つかりません。"}), 404

    db_session.delete(ticket)
    db_session.commit()

    return jsonify({"message": "チケットを削除しました。"})

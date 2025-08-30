import os  # ファイルアップロード用
from datetime import datetime

from flask import Blueprint, jsonify, request

from backend.models import db
from backend.models.incident import (
    Attachment,
    Comment,
    Incident,
    IncidentPriority,
    IncidentStatus,
)
from backend.models.user import User  # Userモデルをインポート

# Blueprintの作成
incidents_bp = Blueprint("incidents_bp", __name__, url_prefix="/api/incidents")

# ファイルアップロード設定
UPLOAD_FOLDER = os.path.join(
    os.getcwd(), "uploads", "incidents"
)  # プロジェクトルートからの相対パス
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# --- ヘルパー関数 ---
def get_current_user_id():
    """
    ダミーの関数。実際の認証システムからユーザーIDを取得するように置き換える必要があります。
    """
    # 仮でUserテーブルの最初のユーザーを返す。存在しない場合はNone。
    user = User.query.first()
    return user.id if user else None


# --- APIエンドポイント ---


@incidents_bp.route("", methods=["GET"])
def get_incidents():
    """インシデント一覧を取得 (フィルタリング、ページネーション対応)"""
    # TODO: 認証が必要 (例: ログインユーザーのみアクセス可)

    # クエリパラメータの取得
    status_filter = request.args.get("status")
    priority_filter = request.args.get("priority")
    assignee_filter = request.args.get(
        "assignee"
    )  # assigneeのusernameでフィルタリングする場合
    keyword_filter = request.args.get("keyword")
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)

    query = Incident.query

    # フィルタリング
    if status_filter:
        status_obj = IncidentStatus.query.filter_by(name=status_filter).first()
        if status_obj:
            query = query.filter(Incident.status_id == status_obj.id)
    if priority_filter:
        priority_obj = IncidentPriority.query.filter_by(name=priority_filter).first()
        if priority_obj:
            query = query.filter(Incident.priority_id == priority_obj.id)
    if assignee_filter:
        # Userテーブルからassignee_filter (username) に一致するユーザーを検索
        assignee_user = User.query.filter_by(username=assignee_filter).first()
        if assignee_user:
            query = query.filter(Incident.assignee_id == assignee_user.id)
    if keyword_filter:
        keyword_like = f"%{keyword_filter}%"
        query = query.filter(
            db.or_(
                Incident.title.ilike(keyword_like),
                Incident.description.ilike(keyword_like),
            )
        )

    # ページネーション
    paginated_incidents = query.order_by(Incident.created_at.desc()).paginate(
        page=page, per_page=limit, error_out=False
    )
    incidents_data = [incident.to_dict() for incident in paginated_incidents.items]

    return (
        jsonify(
            {
                "incidents": incidents_data,
                "total": paginated_incidents.total,
                "pages": paginated_incidents.pages,
                "current_page": paginated_incidents.page,
            }
        ),
        200,
    )


@incidents_bp.route("", methods=["POST"])
def create_incident():
    """新規インシデントを作成"""
    # TODO: 認証が必要 (例: ログインユーザーのみ作成可)
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    title = data.get("title")
    description = data.get("description")
    priority_name = data.get("priority")  # "高", "中", "低" など
    assignee_username = data.get("assignee")  # 任意

    if not title or not description or not priority_name:
        return (
            jsonify({"error": "Missing required fields: title, description, priority"}),
            400,
        )

    # reporter_id は現在のログインユーザーIDから取得する（ここではダミー関数を使用）
    reporter_id = get_current_user_id()
    if not reporter_id:
        # 実際のシステムでは認証エラーとして処理
        return jsonify({"error": "Reporter user not found or not authenticated"}), 400

    # 優先度IDの取得
    priority_obj = IncidentPriority.query.filter_by(name=priority_name).first()
    if not priority_obj:
        return jsonify({"error": f"Invalid priority name: {priority_name}"}), 400

    # デフォルトステータスを "新規" またはそれに相当するものに設定
    # ここでは '新規' ステータスが事前にDBに存在することを想定
    status_obj = IncidentStatus.query.filter_by(
        name="新規"
    ).first()  # "新規" は実際のステータス名に合わせる
    if not status_obj:
        # 見つからない場合はエラー、またはデフォルトステータスを作成する処理
        return (
            jsonify(
                {
                    "error": "Default status '新規' not found. Please ensure it exists in IncidentStatus table."
                }
            ),
            500,
        )

    assignee_id = None
    if assignee_username:
        assignee_user = User.query.filter_by(username=assignee_username).first()
        if assignee_user:
            assignee_id = assignee_user.id
        else:
            return (
                jsonify({"error": f"Assignee user '{assignee_username}' not found"}),
                404,
            )

    try:
        new_incident = Incident(
            title=title,
            description=description,
            priority_id=priority_obj.id,
            status_id=status_obj.id,  # 新規作成時はデフォルトステータス
            reporter_id=reporter_id,
            assignee_id=assignee_id,
        )
        db.session.add(new_incident)
        db.session.commit()

        # attachments の処理は別途 /attachments エンドポイントで行う想定
        # このレスポンスは基本情報のみ
        return jsonify(new_incident.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create incident", "details": str(e)}), 500


@incidents_bp.route("/<int:incident_id>", methods=["GET"])
def get_incident_detail(incident_id):
    """特定のインシデント詳細を取得"""
    # TODO: 認証が必要
    incident = Incident.query.get_or_404(incident_id)
    return jsonify(incident.to_dict(include_details=True)), 200


@incidents_bp.route("/<int:incident_id>", methods=["PUT"])
def update_incident(incident_id):
    """特定のインシデント情報を更新"""
    # TODO: 認証・認可が必要 (例: 担当者または管理職のみ更新可)
    incident = Incident.query.get_or_404(incident_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    if "title" in data:
        incident.title = data["title"]
    if "description" in data:
        incident.description = data["description"]

    if "status" in data:  # ステータス名で更新
        status_obj = IncidentStatus.query.filter_by(name=data["status"]).first()
        if status_obj:
            incident.status_id = status_obj.id
        else:
            return jsonify({"error": f"Invalid status name: {data['status']}"}), 400

    if "priority" in data:  # 優先度名で更新
        priority_obj = IncidentPriority.query.filter_by(name=data["priority"]).first()
        if priority_obj:
            incident.priority_id = priority_obj.id
        else:
            return jsonify({"error": f"Invalid priority name: {data['priority']}"}), 400

    if "assignee" in data:  # 担当者をusernameで更新
        assignee_username = data["assignee"]
        if assignee_username is None:  # 担当者解除
            incident.assignee_id = None
        else:
            assignee_user = User.query.filter_by(username=assignee_username).first()
            if assignee_user:
                incident.assignee_id = assignee_user.id
            else:
                return (
                    jsonify(
                        {"error": f"Assignee user '{assignee_username}' not found"}
                    ),
                    404,
                )

    incident.updated_at = datetime.utcnow()

    try:
        db.session.commit()
        return jsonify(incident.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update incident", "details": str(e)}), 500


@incidents_bp.route("/<int:incident_id>", methods=["DELETE"])
def delete_incident(incident_id):
    """特定のインシデントを削除"""
    # TODO: 認証・認可が必要 (例: 管理職のみ削除可)
    # 論理削除か物理削除かは要件による。ここでは物理削除。
    incident = Incident.query.get_or_404(incident_id)
    try:
        # 関連するコメントと添付ファイルもカスケード削除される想定（モデル定義による）
        db.session.delete(incident)
        db.session.commit()
        return jsonify({"message": "Incident deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete incident", "details": str(e)}), 500


@incidents_bp.route("/<int:incident_id>/comments", methods=["GET"])
def get_incident_comments(incident_id):
    """特定のインシデントのコメント一覧を取得"""
    # TODO: 認証が必要
    incident = Incident.query.get_or_404(incident_id)
    comments_data = [
        comment.to_dict()
        for comment in incident.comments.order_by(Comment.created_at.asc()).all()
    ]
    return jsonify(comments_data), 200


@incidents_bp.route("/<int:incident_id>/comments", methods=["POST"])
def add_incident_comment(incident_id):
    """特定のインシデントにコメントを追加"""
    # TODO: 認証が必要 (コメント作成者IDを特定するため)
    incident = Incident.query.get_or_404(incident_id)
    data = request.get_json()
    if not data or "content" not in data:
        return jsonify({"error": "Missing 'content' in request body"}), 400

    content = data["content"]
    # user_id は現在のログインユーザーIDから取得する（ここではダミー関数を使用）
    user_id = get_current_user_id()
    if not user_id:
        return (
            jsonify({"error": "User not found or not authenticated for commenting"}),
            400,
        )

    try:
        new_comment = Comment(incident_id=incident.id, user_id=user_id, content=content)
        db.session.add(new_comment)
        db.session.commit()
        return jsonify(new_comment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to add comment", "details": str(e)}), 500


@incidents_bp.route("/<int:incident_id>/attachments", methods=["POST"])
def add_incident_attachment(incident_id):
    """特定のインシデントにファイルを添付"""
    # TODO: 認証が必要
    incident = Incident.query.get_or_404(incident_id)

    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file:
        # ファイル名を安全にする（例: werkzeug.utils.secure_filename を使用）
        from werkzeug.utils import secure_filename

        filename = secure_filename(file.filename)

        # インシデントIDごとのサブディレクトリを作成
        incident_upload_path = os.path.join(UPLOAD_FOLDER, str(incident_id))
        if not os.path.exists(incident_upload_path):
            os.makedirs(incident_upload_path)

        filepath = os.path.join(incident_upload_path, filename)

        # ファイルサイズの取得
        file.seek(0, os.SEEK_END)
        filesize = file.tell()
        file.seek(0)  # ポインタを先頭に戻す

        try:
            file.save(filepath)

            # uploaded_by_id は現在のログインユーザーIDから取得
            uploaded_by_id = get_current_user_id()
            if not uploaded_by_id:
                return (
                    jsonify(
                        {"error": "User not found or not authenticated for uploading"}
                    ),
                    400,
                )

            new_attachment = Attachment(
                incident_id=incident.id,
                filename=filename,
                filepath=filepath,  # 保存パスをDBに記録
                filesize=filesize,
                uploaded_by_id=uploaded_by_id,
            )
            db.session.add(new_attachment)
            db.session.commit()
            return jsonify(new_attachment.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            # ファイル保存に失敗した場合、保存されたファイルを削除するクリーンアップ処理も検討
            if os.path.exists(filepath):
                os.remove(filepath)
            return (
                jsonify({"error": "Failed to upload attachment", "details": str(e)}),
                500,
            )

    return jsonify({"error": "File upload failed for unknown reasons"}), 500


@incidents_bp.route("/statuses", methods=["GET"])
def get_incident_statuses():
    """インシデントステータス一覧取得"""
    # TODO: 認証は不要かもしれないが、用途に応じて検討
    statuses = IncidentStatus.query.order_by(IncidentStatus.id).all()
    return jsonify([status.to_dict() for status in statuses]), 200


@incidents_bp.route("/priorities", methods=["GET"])
def get_incident_priorities():
    """インシデント優先度一覧取得"""
    # TODO: 認証は不要かもしれないが、用途に応じて検討
    priorities = IncidentPriority.query.order_by(IncidentPriority.id).all()
    return jsonify([priority.to_dict() for priority in priorities]), 200

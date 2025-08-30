from flask import Blueprint

workflow_bp = Blueprint("workflow", __name__)


@workflow_bp.route("/")
def workflow_status():
    return {"status": "workflow operational"}

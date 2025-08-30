from flask import Blueprint

reports_bp = Blueprint("reports", __name__)


@reports_bp.route("/")
def get_reports():
    return {"message": "Reports endpoint"}

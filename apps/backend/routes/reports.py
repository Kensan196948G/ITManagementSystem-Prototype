from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from typing import Optional
from packages.backend.schemas.report import ReportCreateSchema, ReportUpdateSchema, ReportResponseSchema
from packages.backend.models.report import Report
from packages.backend.database import SessionLocal

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@reports_bp.route('/', methods=['GET'])
def list_reports():
    db = SessionLocal()
    try:
        reports = db.query(Report).all()
        response = [ReportResponseSchema.from_orm(report).dict() for report in reports]
    finally:
        db.close()
    return jsonify(response), 200

@reports_bp.route('/<int:report_id>', methods=['GET'])
def get_report(report_id: int):
    db = SessionLocal()
    try:
        report = db.query(Report).get(report_id)
        if not report:
            return jsonify({"error": "Report not found"}), 404
        response = ReportResponseSchema.from_orm(report).dict()
    finally:
        db.close()
    return jsonify(response), 200

@reports_bp.route('/', methods=['POST'])
def create_report():
    try:
        data = ReportCreateSchema.parse_obj(request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    db = SessionLocal()
    try:
        report = Report(**data.dict())
        db.add(report)
        db.commit()
        db.refresh(report)
    finally:
        db.close()

    response = ReportResponseSchema.from_orm(report).dict()
    return jsonify(response), 201

@reports_bp.route('/<int:report_id>', methods=['PUT'])
def update_report(report_id: int):
    db = SessionLocal()
    try:
        report = db.query(Report).get(report_id)
        if not report:
            return jsonify({"error": "Report not found"}), 404

        try:
            data = ReportUpdateSchema.parse_obj(request.json)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        for key, value in data.dict(exclude_unset=True).items():
            setattr(report, key, value)
        db.commit()
        db.refresh(report)
    finally:
        db.close()

    response = ReportResponseSchema.from_orm(report).dict()
    return jsonify(response), 200

@reports_bp.route('/<int:report_id>', methods=['DELETE'])
def delete_report(report_id: int):
    db = SessionLocal()
    try:
        report = db.query(Report).get(report_id)
        if not report:
            return jsonify({"error": "Report not found"}), 404

        db.delete(report)
        db.commit()
    finally:
        db.close()

    return jsonify({"message": "Report deleted"}), 200
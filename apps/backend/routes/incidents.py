from typing import List, Optional

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, ValidationError

from packages.backend.database import SessionLocal
from packages.backend.models.incident import Incident
from packages.backend.schemas.incident import (
    IncidentCreateSchema,
    IncidentResponseSchema,
    IncidentUpdateSchema,
)

incidents_bp = Blueprint("incidents", __name__, url_prefix="/api/incidents")


@incidents_bp.route("/", methods=["GET"])
def list_incidents():
    incidents = Incident.query.all()
    response = [
        IncidentResponseSchema.from_orm(incident).dict() for incident in incidents
    ]
    return jsonify(response), 200


@incidents_bp.route("/<int:incident_id>", methods=["GET"])
def get_incident(incident_id: int):
    incident = Incident.query.get(incident_id)
    if not incident:
        return jsonify({"error": "Incident not found"}), 404
    response = IncidentResponseSchema.from_orm(incident).dict()
    return jsonify(response), 200


@incidents_bp.route("/", methods=["POST"])
def create_incident():
    try:
        data = IncidentCreateSchema.parse_obj(request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    db = SessionLocal()
    try:
        incident = Incident(**data.dict())
        db.add(incident)
        db.commit()
        db.refresh(incident)
    finally:
        db.close()

    response = IncidentResponseSchema.from_orm(incident).dict()
    return jsonify(response), 201


@incidents_bp.route("/<int:incident_id>", methods=["PUT"])
def update_incident(incident_id: int):
    db = SessionLocal()
    try:
        incident = db.query(Incident).get(incident_id)
        if not incident:
            return jsonify({"error": "Incident not found"}), 404

        try:
            data = IncidentUpdateSchema.parse_obj(request.json)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        for key, value in data.dict(exclude_unset=True).items():
            setattr(incident, key, value)
        db.commit()
        db.refresh(incident)
    finally:
        db.close()

    response = IncidentResponseSchema.from_orm(incident).dict()
    return jsonify(response), 200


@incidents_bp.route("/<int:incident_id>", methods=["DELETE"])
def delete_incident(incident_id: int):
    db = SessionLocal()
    try:
        incident = db.query(Incident).get(incident_id)
        if not incident:
            return jsonify({"error": "Incident not found"}), 404

        db.delete(incident)
        db.commit()
    finally:
        db.close()

    return jsonify({"message": "Incident deleted"}), 200

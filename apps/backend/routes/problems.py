from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from typing import Optional
from packages.backend.schemas.problem import ProblemCreateSchema, ProblemUpdateSchema, ProblemResponseSchema
from packages.backend.models.problem import Problem
from packages.backend.database import SessionLocal

problems_bp = Blueprint('problems', __name__, url_prefix='/api/problems')

@problems_bp.route('/', methods=['GET'])
def list_problems():
    db = SessionLocal()
    try:
        problems = db.query(Problem).all()
        response = [ProblemResponseSchema.from_orm(problem).dict() for problem in problems]
    finally:
        db.close()
    return jsonify(response), 200

@problems_bp.route('/<int:problem_id>', methods=['GET'])
def get_problem(problem_id: int):
    db = SessionLocal()
    try:
        problem = db.query(Problem).get(problem_id)
        if not problem:
            return jsonify({"error": "Problem not found"}), 404
        response = ProblemResponseSchema.from_orm(problem).dict()
    finally:
        db.close()
    return jsonify(response), 200

@problems_bp.route('/', methods=['POST'])
def create_problem():
    try:
        data = ProblemCreateSchema.parse_obj(request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    db = SessionLocal()
    try:
        problem = Problem(**data.dict())
        db.add(problem)
        db.commit()
        db.refresh(problem)
    finally:
        db.close()

    response = ProblemResponseSchema.from_orm(problem).dict()
    return jsonify(response), 201

@problems_bp.route('/<int:problem_id>', methods=['PUT'])
def update_problem(problem_id: int):
    db = SessionLocal()
    try:
        problem = db.query(Problem).get(problem_id)
        if not problem:
            return jsonify({"error": "Problem not found"}), 404

        try:
            data = ProblemUpdateSchema.parse_obj(request.json)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        for key, value in data.dict(exclude_unset=True).items():
            setattr(problem, key, value)
        db.commit()
        db.refresh(problem)
    finally:
        db.close()

    response = ProblemResponseSchema.from_orm(problem).dict()
    return jsonify(response), 200

@problems_bp.route('/<int:problem_id>', methods=['DELETE'])
def delete_problem(problem_id: int):
    db = SessionLocal()
    try:
        problem = db.query(Problem).get(problem_id)
        if not problem:
            return jsonify({"error": "Problem not found"}), 404

        db.delete(problem)
        db.commit()
    finally:
        db.close()

    return jsonify({"message": "Problem deleted"}), 200
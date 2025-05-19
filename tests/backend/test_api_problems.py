import pytest
from flask import json
from apps.backend.routes.problems import problems_bp
from packages.backend.database import db_session  # 修正ポイント: SessionLocal -> db_session
from packages.backend.models.problem import Problem

@pytest.fixture
def client(app):
    return app.test_client()

def test_list_problems(client):
    response = client.get('/api/problems/')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_get_problem_success(client):
    db = db_session  # 修正ポイント: SessionLocal() -> db_session
    problem = Problem(title="Test Problem", description="Test description")
    db.add(problem)
    db.commit()
    db.refresh(problem)
    db.close()

    response = client.get(f'/api/problems/{problem.id}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['id'] == problem.id

def test_get_problem_not_found(client):
    response = client.get('/api/problems/999999')
    assert response.status_code == 404

def test_create_problem_success(client):
    payload = {
        "title": "New Problem",
        "description": "New description"
    }
    response = client.post('/api/problems/', json=payload)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['title'] == payload['title']

def test_create_problem_validation_error(client):
    payload = {
        "title": "",  # バリデーションエラー想定
    }
    response = client.post('/api/problems/', json=payload)
    assert response.status_code == 400

def test_update_problem_success(client):
    db = db_session  # 修正ポイント: SessionLocal() -> db_session
    problem = Problem(title="Update Problem", description="Update description")
    db.add(problem)
    db.commit()
    db.refresh(problem)
    db.close()

    payload = {
        "title": "Updated Title"
    }
    response = client.put(f'/api/problems/{problem.id}', json=payload)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == payload['title']

def test_update_problem_not_found(client):
    payload = {
        "title": "Updated Title"
    }
    response = client.put('/api/problems/999999', json=payload)
    assert response.status_code == 404

def test_update_problem_validation_error(client):
    db = db_session  # 修正ポイント: SessionLocal() -> db_session
    problem = Problem(title="Update Problem", description="Update description")
    db.add(problem)
    db.commit()
    db.refresh(problem)
    db.close()

    payload = {
        "title": ""  # バリデーションエラー想定
    }
    response = client.put(f'/api/problems/{problem.id}', json=payload)
    assert response.status_code == 400

def test_delete_problem_success(client):
    db = db_session  # 修正ポイント: SessionLocal() -> db_session
    problem = Problem(title="Delete Problem", description="Delete description")
    db.add(problem)
    db.commit()
    db.refresh(problem)
    db.close()

    response = client.delete(f'/api/problems/{problem.id}')
    assert response.status_code == 200

def test_delete_problem_not_found(client):
    response = client.delete('/api/problems/999999')
    assert response.status_code == 404
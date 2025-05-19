import pytest
from flask import json
from apps.backend.routes.incidents import incidents_bp
from packages.backend.database import db_session  # 修正ポイント: SessionLocal -> db_session
from packages.backend.models.incident import Incident

@pytest.fixture
def client(app):
    return app.test_client()

def test_list_incidents(client):
    response = client.get('/api/incidents/')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_get_incident_success(client):
    # 事前にDBにインシデントを作成しておく必要あり
    db = db_session  # 修正ポイント: SessionLocal() -> db_session
    incident = Incident(title="Test Incident", description="Test description")
    db.add(incident)
    db.commit()
    db.refresh(incident)
    db.close()

    response = client.get(f'/api/incidents/{incident.id}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['id'] == incident.id

def test_get_incident_not_found(client):
    response = client.get('/api/incidents/999999')
    assert response.status_code == 404

def test_create_incident_success(client):
    payload = {
        "title": "New Incident",
        "description": "New description"
    }
    response = client.post('/api/incidents/', json=payload)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['title'] == payload['title']

def test_create_incident_validation_error(client):
    payload = {
        "title": "",  # 空のタイトルはバリデーションエラー想定
    }
    response = client.post('/api/incidents/', json=payload)
    assert response.status_code == 400

def test_update_incident_success(client):
    db = db_session  # 修正ポイント: SessionLocal() -> db_session
    incident = Incident(title="Update Incident", description="Update description")
    db.add(incident)
    db.commit()
    db.refresh(incident)
    db.close()

    payload = {
        "title": "Updated Title"
    }
    response = client.put(f'/api/incidents/{incident.id}', json=payload)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == payload['title']

def test_update_incident_not_found(client):
    payload = {
        "title": "Updated Title"
    }
    response = client.put('/api/incidents/999999', json=payload)
    assert response.status_code == 404

def test_update_incident_validation_error(client):
    db = db_session  # 修正ポイント: SessionLocal() -> db_session
    incident = Incident(title="Update Incident", description="Update description")
    db.add(incident)
    db.commit()
    db.refresh(incident)
    db.close()

    payload = {
        "title": ""  # バリデーションエラー想定
    }
    response = client.put(f'/api/incidents/{incident.id}', json=payload)
    assert response.status_code == 400

def test_delete_incident_success(client):
    db = db_session  # 修正ポイント: SessionLocal() -> db_session
    incident = Incident(title="Delete Incident", description="Delete description")
    db.add(incident)
    db.commit()
    db.refresh(incident)
    db.close()

    response = client.delete(f'/api/incidents/{incident.id}')
    assert response.status_code == 200

def test_delete_incident_not_found(client):
    response = client.delete('/api/incidents/999999')
    assert response.status_code == 404
import pytest
from flask import Flask

from packages.backend.auth import auth_bp
from packages.backend.database import db
from packages.backend.models.user import User


@pytest.fixture
def app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "testsecret"
    app.register_blueprint(auth_bp)
    app.config["TESTING"] = True

    with app.app_context():
        db.create_all()
        user = User(username="testuser", email="test@example.com")
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()

    yield app


@pytest.fixture
def client(app):
    return app.test_client()


def test_login_success(client):
    response = client.post(
        "/login", json={"username": "testuser", "password": "password123"}
    )
    assert response.status_code == 200
    assert "token" in response.get_json()


def test_login_failure(client):
    response = client.post(
        "/login", json={"username": "testuser", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.get_json()["message"] == "Invalid credentials"

import pytest
from packages.backend.database import db, db_session  # 修正ポイント: インポートパスに packages.backend を追加
from packages.backend.models import User  # 修正ポイント: インポートパスに packages.backend を追加
from packages.backend.routes.auth import auth_bp  # 修正ポイント: インポートパスに packages.backend を追加
from flask import Flask
import bcrypt

@pytest.fixture
def app():
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test_secret'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    db.init_app(app)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    with app.app_context():
        db.create_all()
        # テストユーザー作成
        user = User(username='testuser', email='test@example.com')
        user.set_password('testpassword')
        db_session.add(user)
        db_session.commit()

    yield app

@pytest.fixture
def client(app):
    return app.test_client()

def test_login_success(client):
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpassword'
    })
    assert response.status_code == 200
    json_data = response.get_json()
    assert 'user' in json_data
    assert json_data['user']['username'] == 'testuser'

def test_login_failure(client):
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'wrongpassword'
    })
    assert response.status_code == 401
    json_data = response.get_json()
    assert 'error' in json_data

def test_logout(client):
    # ログインしてからログアウト
    client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpassword'
    })
    response = client.post('/api/auth/logout')
    assert response.status_code == 200
    json_data = response.get_json()
    assert 'message' in json_data

def test_get_current_user(client):
    client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpassword'
    })
    response = client.get('/api/auth/me')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['username'] == 'testuser'
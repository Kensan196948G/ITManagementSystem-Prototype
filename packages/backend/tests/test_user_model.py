import pytest

from packages.backend.models.user import User


def test_password_hashing():
    user = User(username="testuser", email="test@example.com")
    user.set_password("password123")
    assert user.check_password("password123")
    assert not user.check_password("wrongpassword")

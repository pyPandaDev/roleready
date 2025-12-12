"""
Pytest configuration and fixtures for RoleReady API tests
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Import the FastAPI app
import sys
sys.path.insert(0, '..')
from main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app"""
    return TestClient(app)


@pytest.fixture
def mock_firebase_token():
    """Mock a valid Firebase token verification"""
    return {
        "uid": "test-user-123",
        "email": "test@example.com",
        "name": "Test User"
    }


@pytest.fixture
def auth_headers():
    """Headers with a mock bearer token"""
    return {"Authorization": "Bearer mock-firebase-token"}


@pytest.fixture
def mock_verify_token(mock_firebase_token):
    """Patch Firebase token verification to return mock user"""
    with patch('routes.auth.verify_firebase_token', return_value=mock_firebase_token):
        yield mock_firebase_token


@pytest.fixture
def mock_firestore():
    """Mock Firestore database operations"""
    mock_db = MagicMock()
    mock_collection = MagicMock()
    mock_doc = MagicMock()
    
    mock_db.collection.return_value = mock_collection
    mock_collection.document.return_value = mock_doc
    mock_doc.get.return_value = MagicMock(exists=True, to_dict=lambda: {"uid": "test-user-123"})
    
    with patch('routes.auth.get_db', return_value=mock_db):
        with patch('routes.user_data.get_db', return_value=mock_db):
            yield mock_db

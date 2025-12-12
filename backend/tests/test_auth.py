"""
Tests for authentication endpoints
"""

import pytest
from unittest.mock import patch, MagicMock


class TestAuthEndpoints:
    """Test suite for authentication endpoints"""
    
    def test_register_requires_auth(self, client):
        """Test that register endpoint requires authentication"""
        response = client.post(
            "/api/auth/register",
            json={
                "uid": "test-user-123",
                "email": "test@example.com",
                "display_name": "Test User"
            }
        )
        
        # Should return 422 (missing auth header) or 401 (invalid token)
        assert response.status_code in [401, 422]
    
    def test_get_me_requires_auth(self, client):
        """Test that /me endpoint requires authentication"""
        response = client.get("/api/auth/me")
        
        assert response.status_code == 422  # Missing required header
    
    def test_get_me_with_invalid_token(self, client):
        """Test /me endpoint with invalid token format"""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "InvalidFormat"}
        )
        
        assert response.status_code == 401
        assert "Invalid authorization header" in response.json()["detail"]
    
    def test_get_me_with_mock_auth(self, client, mock_verify_token, mock_firestore):
        """Test /me endpoint with mocked authentication"""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer valid-mock-token"}
        )
        
        assert response.status_code == 200
    
    def test_register_with_mock_auth(self, client, mock_verify_token, mock_firestore):
        """Test register endpoint with mocked authentication"""
        response = client.post(
            "/api/auth/register",
            headers={"Authorization": "Bearer valid-mock-token"},
            json={
                "uid": "test-user-123",  # Must match mock token uid
                "email": "test@example.com",
                "display_name": "Test User"
            }
        )
        
        assert response.status_code == 200
        assert response.json()["message"] == "User registered successfully"
    
    def test_register_uid_mismatch(self, client, mock_verify_token, mock_firestore):
        """Test register fails when UID doesn't match token"""
        response = client.post(
            "/api/auth/register",
            headers={"Authorization": "Bearer valid-mock-token"},
            json={
                "uid": "different-user-456",  # Different from mock token
                "email": "test@example.com",
                "display_name": "Test User"
            }
        )
        
        assert response.status_code == 403
        assert "Cannot register for a different user" in response.json()["detail"]

"""
Tests for health check endpoints
"""

import pytest


class TestHealthEndpoints:
    """Test suite for health check endpoints"""
    
    def test_root_endpoint(self, client):
        """Test the root endpoint returns healthy status"""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["version"] == "1.0.0"
        assert "RoleReady API is running" in data["message"]
    
    def test_health_check_endpoint(self, client):
        """Test the /api/health endpoint"""
        response = client.get("/api/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["version"] == "1.0.0"

"""
Tests for AI endpoints - authentication and rate limiting
"""

import pytest


class TestAIEndpointsAuth:
    """Test suite for AI endpoints authentication"""
    
    def test_analyze_resume_requires_auth(self, client):
        """Test that analyze-resume requires authentication"""
        response = client.post(
            "/api/ai/analyze-resume",
            json={
                "targetRole": "Software Engineer",
                "resumeText": "Sample resume content"
            }
        )
        
        # Should return 422 (missing auth header) or 401
        assert response.status_code in [401, 422]
    
    def test_salary_insights_requires_auth(self, client):
        """Test that salary-insights requires authentication"""
        response = client.post(
            "/api/ai/salary-insights",
            json={
                "role": "Software Engineer",
                "location": "India"
            }
        )
        
        assert response.status_code in [401, 422]
    
    def test_career_coach_requires_auth(self, client):
        """Test that career-coach requires authentication"""
        response = client.post(
            "/api/ai/career-coach",
            json={
                "message": "How do I improve my resume?",
                "conversationHistory": []
            }
        )
        
        assert response.status_code in [401, 422]
    
    def test_cold_email_requires_auth(self, client):
        """Test that cold-email requires authentication"""
        response = client.post(
            "/api/ai/cold-email",
            json={
                "companyName": "Google",
                "jobRole": "Software Engineer"
            }
        )
        
        assert response.status_code in [401, 422]
    
    def test_cover_letter_requires_auth(self, client):
        """Test that cover-letter requires authentication"""
        response = client.post(
            "/api/ai/cover-letter",
            json={
                "companyName": "Google",
                "jobDescription": "Looking for a software engineer"
            }
        )
        
        assert response.status_code in [401, 422]
    
    def test_portfolio_requires_auth(self, client):
        """Test that portfolio requires authentication"""
        response = client.post(
            "/api/ai/portfolio",
            json={
                "style": "minimal"
            }
        )
        
        assert response.status_code in [401, 422]
    
    def test_interview_questions_requires_auth(self, client):
        """Test that interview questions requires authentication"""
        response = client.post(
            "/api/ai/interview/questions",
            json={
                "role": "Software Engineer",
                "experienceLevel": "mid"
            }
        )
        
        assert response.status_code in [401, 422]
    
    def test_mock_interview_requires_auth(self, client):
        """Test that mock-interview endpoints require authentication"""
        # Test question endpoint
        response = client.post(
            "/api/ai/mock-interview/question",
            json={
                "role": "Software Engineer",
                "resumeText": "Sample resume",
                "conversationHistory": [],
                "currentPhase": "intro"
            }
        )
        assert response.status_code in [401, 422]
        
        # Test evaluate endpoint
        response = client.post(
            "/api/ai/mock-interview/evaluate",
            json={
                "role": "Software Engineer",
                "resumeText": "Sample resume",
                "conversationHistory": []
            }
        )
        assert response.status_code in [401, 422]


class TestAIEndpointsValidation:
    """Test suite for AI endpoints input validation"""
    
    def test_analyze_resume_missing_target_role(self, client, auth_headers, mock_verify_token):
        """Test that analyze-resume requires targetRole"""
        response = client.post(
            "/api/ai/analyze-resume",
            headers=auth_headers,
            json={"resumeText": "Sample resume"}
        )
        
        # Should return 422 for validation error
        assert response.status_code == 422
    
    def test_salary_insights_missing_fields(self, client, auth_headers, mock_verify_token):
        """Test that salary-insights requires role and location"""
        response = client.post(
            "/api/ai/salary-insights",
            headers=auth_headers,
            json={"role": "Developer"}  # Missing location
        )
        
        assert response.status_code == 422

"""
Gemini AI Service for RoleReady Backend
Handles all AI-powered features using Google's Gemini API

This module re-exports all functions from the modular service files
for backward compatibility. The actual implementations are in:
- ai_common.py: Shared utilities (get_model, clean_json_response)
- resume_service.py: Resume analysis and optimization
- interview_service.py: Interview questions and evaluation
- career_service.py: Career coach and roadmap
- portfolio_service.py: Portfolio generation and skill gap analysis
- writing_service.py: Cover letter and cold email generation
"""

# Re-export common utilities
from services.ai_common import (
    get_model,
    clean_json_response,
    logger,
    GEMINI_API_KEY,
    MODEL_NAME
)

# Re-export resume functions
from services.resume_service import (
    analyze_resume,
    optimize_resume,
    analyze_resume_with_jd
)

# Re-export interview functions
from services.interview_service import (
    generate_interview_questions,
    evaluate_interview_answers,
    get_role_categories,
    generate_fallback_questions,
    generate_mock_interview_question,
    evaluate_mock_interview_answer,
    ROLE_CATEGORIES
)

# Re-export career functions
from services.career_service import (
    career_coach_chat,
    generate_career_roadmap,
    get_salary_insights
)

# Re-export portfolio functions
from services.portfolio_service import (
    generate_portfolio,
    analyze_skill_gap
)

# Re-export writing functions
from services.writing_service import (
    generate_cover_letter,
    generate_cold_email
)

# All public symbols for backward compatibility
__all__ = [
    # Common
    "get_model",
    "clean_json_response",
    "logger",
    "GEMINI_API_KEY",
    "MODEL_NAME",
    # Resume
    "analyze_resume",
    "optimize_resume",
    "analyze_resume_with_jd",
    # Interview
    "generate_interview_questions",
    "evaluate_interview_answers",
    "get_role_categories",
    "generate_fallback_questions",
    "generate_mock_interview_question",
    "evaluate_mock_interview_answer",
    "ROLE_CATEGORIES",
    # Career
    "career_coach_chat",
    "generate_career_roadmap",
    "get_salary_insights",
    # Portfolio
    "generate_portfolio",
    "analyze_skill_gap",
    # Writing
    "generate_cover_letter",
    "generate_cold_email"
]

"""
AI Routes for RoleReady Backend
All Gemini AI-powered endpoints - Now secured with authentication and rate limiting
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging

from services import gemini_service
from routes.auth import get_current_user
from slowapi import Limiter
from slowapi.util import get_remote_address

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Rate limiter instance
limiter = Limiter(key_func=get_remote_address)


# ============= REQUEST MODELS =============

class AnalyzeResumeRequest(BaseModel):
    resumeText: Optional[str] = None
    resumeFile: Optional[Dict[str, str]] = None  # {mimeType, data}
    targetRole: str
    jobDescription: Optional[str] = None
    experienceLevel: Optional[str] = None


class OptimizeResumeRequest(BaseModel):
    profile: Dict[str, Any]


class InterviewQuestionsRequest(BaseModel):
    role: str
    experienceLevel: str



class CareerCoachRequest(BaseModel):
    message: str
    conversationHistory: List[Dict[str, str]] = []


class PortfolioRequest(BaseModel):
    resumeText: str = ""
    resumeBase64: str = ""
    resumeMimeType: str = ""
    style: str = "minimal"


class SkillGapRequest(BaseModel):
    resumeText: str = ""
    resumeFile: Optional[Dict[str, str]] = None  # {mimeType, data}
    dreamRole: str


class CareerRoadmapRequest(BaseModel):
    careerGoal: str
    currentRole: str = ""
    yearsExperience: int = 0


class EvaluateInterviewRequest(BaseModel):
    role: str
    questionsWithAnswers: List[Dict[str, str]]  # [{question, userAnswer, difficulty}]


# ============= HELPER FUNCTION =============

def handle_ai_error(e: Exception, operation: str):
    """Sanitized error handler - doesn't expose internal details"""
    logger.error(f"{operation} failed: {str(e)}")
    raise HTTPException(
        status_code=500, 
        detail=f"An error occurred while {operation}. Please try again."
    )


# ============= SECURED ENDPOINTS =============

@router.post("/analyze-resume")
@limiter.limit("10/minute")
async def analyze_resume(
    request: Request,
    data: AnalyzeResumeRequest, 
    current_user: dict = Depends(get_current_user)
):
    """Analyze a resume against a target role - Requires authentication"""
    try:
        resume_text = data.resumeText
        resume_base64 = None
        resume_mime_type = None
        
        if data.resumeFile:
            resume_base64 = data.resumeFile.get("data")
            resume_mime_type = data.resumeFile.get("mimeType")
        
        result = await gemini_service.analyze_resume(
            resume_text=resume_text,
            resume_base64=resume_base64,
            resume_mime_type=resume_mime_type,
            target_role=data.targetRole,
            job_description=data.jobDescription,
            experience_level=data.experienceLevel
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        handle_ai_error(e, "analyzing resume")


class AnalyzeWithJDRequest(BaseModel):
    resumeText: Optional[str] = None
    resumeFile: Optional[Dict[str, str]] = None
    jobDescription: str


@router.post("/analyze-with-jd")
@limiter.limit("10/minute")
async def analyze_resume_with_jd(
    request: Request,
    data: AnalyzeWithJDRequest,
    current_user: dict = Depends(get_current_user)
):
    """Analyze resume against a specific job description - comprehensive JD matching"""
    try:
        resume_text = data.resumeText
        resume_base64 = None
        resume_mime_type = None
        
        if data.resumeFile:
            resume_base64 = data.resumeFile.get("data")
            resume_mime_type = data.resumeFile.get("mimeType")
        
        result = await gemini_service.analyze_resume_with_jd(
            resume_text=resume_text,
            resume_base64=resume_base64,
            resume_mime_type=resume_mime_type,
            job_description=data.jobDescription
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        handle_ai_error(e, "analyzing resume against job description")


@router.post("/optimize-resume")
@limiter.limit("10/minute")
async def optimize_resume(
    request: Request,
    data: OptimizeResumeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Optimize resume content for ATS - Requires authentication"""
    try:
        result = await gemini_service.optimize_resume(data.profile)
        return result
    except HTTPException:
        raise
    except Exception as e:
        handle_ai_error(e, "optimizing resume")


@router.post("/interview/questions")
@limiter.limit("20/minute")
async def get_interview_questions(
    request: Request,
    data: InterviewQuestionsRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate interview questions for a role - Requires authentication"""
    try:
        result = await gemini_service.generate_interview_questions(
            role=data.role,
            experience_level=data.experienceLevel
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        handle_ai_error(e, "generating interview questions")



@router.post("/career-coach")
@limiter.limit("30/minute")
async def career_coach(
    request: Request,
    data: CareerCoachRequest,
    current_user: dict = Depends(get_current_user)
):
    """AI Career Coach chat - Requires authentication"""
    try:
        result = await gemini_service.career_coach_chat(
            message=data.message,
            conversation_history=data.conversationHistory
        )
        return {"response": result}
    except HTTPException:
        raise
    except Exception as e:
        handle_ai_error(e, "processing career coach request")


@router.post("/portfolio")
@limiter.limit("5/minute")
async def generate_portfolio(
    request: Request,
    data: PortfolioRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate a portfolio website from resume - Requires authentication"""
    try:
        result = await gemini_service.generate_portfolio(
            resume_text=data.resumeText,
            resume_base64=data.resumeBase64,
            resume_mime_type=data.resumeMimeType,
            style=data.style
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        handle_ai_error(e, "generating portfolio")


@router.post("/skill-gap")
@limiter.limit("10/minute")
async def analyze_skill_gap(
    request: Request,
    data: SkillGapRequest,
    current_user: dict = Depends(get_current_user)
):
    """Analyze skill gaps between resume and dream role - Requires authentication"""
    try:
        resume_text = data.resumeText
        resume_base64 = None
        resume_mime_type = None
        
        if data.resumeFile:
            resume_base64 = data.resumeFile.get("data")
            resume_mime_type = data.resumeFile.get("mimeType")
        
        result = await gemini_service.analyze_skill_gap(
            resume_text=resume_text,
            resume_base64=resume_base64,
            resume_mime_type=resume_mime_type,
            dream_role=data.dreamRole
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        handle_ai_error(e, "analyzing skill gap")


@router.post("/career-roadmap")
@limiter.limit("10/minute")
async def generate_career_roadmap(
    request: Request,
    data: CareerRoadmapRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate an interactive career roadmap - Requires authentication"""
    try:
        result = await gemini_service.generate_career_roadmap(
            career_goal=data.careerGoal,
            current_role=data.currentRole,
            years_experience=data.yearsExperience
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        handle_ai_error(e, "generating career roadmap")


@router.post("/evaluate-interview")
@limiter.limit("5/minute")
async def evaluate_interview_answers(
    request: Request,
    data: EvaluateInterviewRequest,
    current_user: dict = Depends(get_current_user)
):
    """Evaluate user's interview answers - Requires authentication"""
    try:
        result = await gemini_service.evaluate_interview_answers(
            role=data.role,
            questions_with_answers=data.questionsWithAnswers
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        handle_ai_error(e, "evaluating interview answers")

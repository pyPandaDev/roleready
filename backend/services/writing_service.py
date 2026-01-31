"""
Writing Service
Handles AI generation of cover letters and cold emails
"""

import json
import logging
from typing import Optional, Dict, Any
from services.ai_common import get_model, clean_json_response

logger = logging.getLogger(__name__)


async def generate_cover_letter(
    company_name: str,
    job_description: str,
    resume_text: str = "",
    job_role: str = ""
) -> Dict[str, str]:
    """Generate a tailored cover letter."""
    model = get_model()

    prompt = f"""You are an expert Career Coach and Professional Copywriter. Write a compelling, professional cover letter.

TARGET COMPANY: {company_name}
TARGET ROLE: {job_role or "Inferred from JD"}

JOB DESCRIPTION:
{job_description}

CANDIDATE'S RESUME:
{resume_text or "[No resume provided - write a template]"}

INSTRUCTIONS:
1. Write a modern, engaging cover letter (NOT generic/robotic)
2. Highlight specific matches between resume skills and JD requirements
3. Show genuine enthusiasm for {company_name}
4. Use a professional but conversational tone
5. Keep it concise (max 300 words)
6. Structure: Hook -> Value Proposition -> Call to Action

Return JSON format:
{{
    "subject": "Compelling subject line",
    "content": "Full cover letter text..."
}}"""

    try:
        response = model.generate_content(prompt)
        result_text = clean_json_response(response.text.strip())
        return json.loads(result_text)
    except Exception as e:
        logger.error(f"Cover letter generation failed: {str(e)}")
        raise Exception(f"Cover letter generation failed: {str(e)}")


async def generate_cold_email(
    company_name: str,
    job_role: str,
    resume_text: str = "",
    recipient_name: str = ""
) -> Dict[str, Any]:
    """Generate a cold outreach email."""
    model = get_model()

    prompt = f"""You are an expert at networking and cold outreach. Write a short, effective cold email to a recruiter or hiring manager.

RECIPIENT: {recipient_name or "Hiring Manager"} at {company_name}
ROLE: {job_role}

CANDIDATE'S RESUME:
{resume_text or "[No resume provided]"}

INSTRUCTIONS:
1. Write a high-converting cold email (max 150 words)
2. Focus on VALUE sent to the company
3. Be respectful of time but confident
4. Include a clear, low-friction call to action (CTA)
5. Generate 3 variations: Direct, Value-First, and Connection-Based

Return JSON format:
{{
    "variations": [
        {{
            "type": "Direct Approach",
            "subject": "Subject line",
            "body": "Email body..."
        }},
        {{
            "type": "Value-First",
            "subject": "Subject line",
            "body": "Email body..."
        }},
        {{
            "type": "Creative/Bold",
            "subject": "Subject line",
            "body": "Email body..."
        }}
    ]
}}"""

    try:
        response = model.generate_content(prompt)
        result_text = clean_json_response(response.text.strip())
        return json.loads(result_text)
    except Exception as e:
        logger.error(f"Cold email generation failed: {str(e)}")
        raise Exception(f"Cold email generation failed: {str(e)}")

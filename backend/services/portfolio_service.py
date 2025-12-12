"""
Portfolio Service
Handles portfolio generation and skill gap analysis
"""

import json
import logging
from typing import Optional, Dict, Any
from services.ai_common import get_model, clean_json_response

logger = logging.getLogger(__name__)


async def generate_portfolio(
    resume_text: str = "",
    resume_base64: str = "",
    resume_mime_type: str = "",
    style: str = "minimal"
) -> Dict[str, Any]:
    """Generate a portfolio from resume."""
    model = get_model()
    
    extract_prompt = f"""Extract portfolio data from this resume. Return JSON:
{{"name": "Name", "title": "Title", "tagline": "Tagline", "about": "Summary", "skills": ["s1"], "experience": [{{"company": "c", "role": "r", "duration": "d", "highlights": ["h1"]}}], "projects": [{{"name": "n", "description": "d", "tech": ["t1"]}}], "contact": {{"email": "e"}}}}

Resume: {resume_text}"""
    
    try:
        data_response = model.generate_content(extract_prompt)
        data_text = clean_json_response(data_response.text.strip())
        portfolio_data = json.loads(data_text)
        
        html_prompt = f"""Generate a {style} portfolio HTML for: {json.dumps(portfolio_data)}
Include inline CSS, responsive design, modern styling. Return ONLY HTML."""
        
        html_response = model.generate_content(html_prompt)
        html = html_response.text or ""
        if html.startswith("```html"):
            html = html[7:]
        if html.startswith("```"):
            html = html[3:]
        if html.endswith("```"):
            html = html[:-3]
        
        return {"portfolioData": portfolio_data, "html": html.strip()}
    except Exception as e:
        logger.error(f"Portfolio generation failed: {str(e)}")
        raise Exception(f"Portfolio generation failed: {str(e)}")


async def analyze_skill_gap(
    resume_text: Optional[str] = None,
    resume_base64: Optional[str] = None,
    resume_mime_type: Optional[str] = None,
    dream_role: str = ""
) -> Dict[str, Any]:
    """Analyze skill gaps between resume and dream role."""
    model = get_model()
    
    prompt = f"""You are a SENIOR CAREER ANALYST with expertise in skill mapping and career development. Analyze this resume against the dream role of "{dream_role}".

## CRITICAL INSTRUCTIONS FOR SKILL EXTRACTION:

1. **GROUP RELATED SKILLS INTO CATEGORIES** - Do NOT list every individual item:
   - BAD: "Random Forest, XGBoost, Decision Trees, Logistic Regression, SVM, KNN..."
   - GOOD: "Supervised ML Algorithms (Classification & Regression)"
   - BAD: "Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn..."
   - GOOD: "Python Data Science Stack"

2. **LIMIT SKILLS YOU HAVE**: Maximum 10-12 most relevant skill categories
3. **LIMIT SKILLS MISSING**: Maximum 8-10 most critical gaps
4. **FOCUS ON SKILL AREAS**: Programming Languages, ML/AI, Cloud, Data Engineering, etc.

## YOUR TASK:
1. Extract TOP 10-12 skill CATEGORIES from the resume (not individual libraries/tools)
2. Identify 8-10 skill GAPS critical for "{dream_role}"
3. Compare and provide actionable insights

## Return ONLY valid JSON with this EXACT structure:
{{
    "dreamRole": "{dream_role}",
    "matchPercentage": <0-100 how ready they are>,
    "skillsYouHave": [
        {{"skill": "<SKILL CATEGORY, not individual tool>", "level": "Beginner|Intermediate|Advanced|Expert", "relevance": "High|Medium|Low"}}
    ],
    "skillsMissing": [
        {{"skill": "<SKILL CATEGORY needed>", "priority": "Critical|Important|Nice-to-have", "timeToLearn": "<e.g. 2-4 weeks>", "reason": "<why needed>"}}
    ],
    "resumeOnTrack": <true if resume shows relevant progression, false otherwise>,
    "resumeFeedback": "<2-3 sentence assessment of whether resume shows right direction>",
    "strengthsForRole": ["<strength 1>", "<strength 2>"],
    "biggestGaps": ["<gap 1 with specific detail>", "<gap 2>"],
    "actionPlan": [
        {{"action": "<specific action>", "timeline": "<e.g. This week>", "priority": 1}},
        {{"action": "<action 2>", "timeline": "<timeline>", "priority": 2}}
    ],
    "recommendedResources": [
        {{"resource": "<course/book/project name>", "type": "Course|Book|Project|Certification", "platform": "<Coursera|Udemy|YouTube|etc>", "focus": "<skill it teaches>", "url": "<actual URL to the resource>"}}
    ]
}}

IMPORTANT: Keep skillsYouHave between 8-12 items and skillsMissing between 5-10 items. Group similar skills together!

Resume Content:
{resume_text or "[Resume will be analyzed from uploaded file]"}"""
    
    try:
        logger.info(f"Analyzing skill gap for role: {dream_role}")
        
        if resume_base64 and resume_mime_type:
            import base64
            file_bytes = base64.b64decode(resume_base64)
            contents = [
                {"mime_type": resume_mime_type, "data": file_bytes},
                prompt
            ]
            response = model.generate_content(contents)
        else:
            response = model.generate_content(prompt)
        
        result_text = clean_json_response(response.text.strip())
        return json.loads(result_text)
    except Exception as e:
        logger.error(f"Skill gap analysis failed: {str(e)}")
        raise Exception(f"Skill gap analysis failed: {str(e)}")

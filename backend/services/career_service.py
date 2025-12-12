"""
Career Service
Handles career coaching chat and career roadmap generation
"""

import json
import logging
from typing import Dict, List, Any
from services.ai_common import get_model, clean_json_response

logger = logging.getLogger(__name__)


async def career_coach_chat(message: str, conversation_history: List[Dict[str, str]]) -> str:
    """AI Career Coach chat - CAREER-FOCUSED ONLY with concise, actionable responses."""
    from services.search_service import get_career_search_context
    
    model = get_model()
    
    # Get web search context if query needs latest info
    search_context = await get_career_search_context(message)
    
    conversation_str = "\n".join([f"{m['role']}: {m['content']}" for m in conversation_history[-8:]])
    
    prompt = f"""You are RoleReady's AI Career Coach - a focused, efficient career advisor.

## STRICT RULES:

### 1. CAREER-ONLY TOPICS:
You ONLY discuss career-related topics:
✅ Job search, interviews, resumes, LinkedIn
✅ Salary negotiation, career growth, promotions
✅ Skill development, certifications, learning paths
✅ Industry insights, job market trends
✅ Career transitions, work-life balance advice
✅ Networking, personal branding

❌ For ANY non-career topic, respond ONLY with:
"I'm your career coach, so I focus exclusively on career-related questions! 🎯 Ask me about job search, interviews, skills, salary, or career growth and I'll be happy to help."

### 2. RESPONSE LENGTH - KEEP IT SHORT:
- Simple questions → 2-4 sentences
- Moderate questions → 1 paragraph + 3-5 bullet points MAX
- Complex questions → 2 short paragraphs + up to 7 bullets MAX
- NEVER write walls of text
- NEVER give 10+ bullet points unless explicitly asked for a comprehensive list

### 3. RESPONSE STYLE:
- Be direct and actionable - no fluff
- Use bullet points for lists (not asterisks)
- Bold **key terms** only when needed
- 1-2 emojis max per response
- End with a clear next step or question

### 4. FORMATTING:
- Use numbered lists for steps: 1. 2. 3.
- Use bullet points for options: • 
- Headers only for complex topics
- Keep paragraphs under 3 sentences
{search_context}
## CONVERSATION CONTEXT:
{conversation_str}

## USER MESSAGE:
{message}

## YOUR RESPONSE:
Remember: Be CONCISE but helpful. Quality over quantity. If web search results are provided above, use them to give accurate, current information."""
    
    try:
        response = model.generate_content(prompt)
        return response.text or "I'm having trouble processing that. Could you rephrase?"
    except Exception as e:
        logger.error(f"Career coach chat failed: {str(e)}")
        raise Exception(f"Career coach chat failed: {str(e)}")


async def generate_career_roadmap(
    career_goal: str,
    current_role: str = "",
    years_experience: int = 0
) -> Dict[str, Any]:
    """Generate an interactive career roadmap with milestones."""
    model = get_model()
    
    current_context = f"Currently: {current_role} with {years_experience} years experience" if current_role else "Starting fresh"
    
    prompt = f"""You are a PRACTICAL CAREER COACH who creates REALISTIC, achievable career roadmaps with FREE learning resources.

## USER'S GOAL: {career_goal}
## CURRENT STATE: {current_context}

## CRITICAL TIME GUIDELINES:
- Total roadmap: 9-15 months MAXIMUM (NOT 2+ years!)
- Each phase: 2-4 months max
- Assume user dedicates 2-3 hours daily to learning
- Be AGGRESSIVE but REALISTIC - people can learn fast with focused effort

## Return ONLY valid JSON with this EXACT structure:
{{
    "goal": "{career_goal}",
    "currentState": "{current_context}",
    "estimatedTime": "<9-15 months>",
    "phases": [
        {{
            "id": "phase-1",
            "name": "<Phase name>",
            "description": "<What this phase achieves>",
            "duration": "<2-4 months max>",
            "milestones": [
                {{
                    "task": "<Specific, actionable task>",
                    "completed": false
                }}
            ],
            "skills": ["<skill 1>", "<skill 2>"],
            "resources": [
                {{"name": "<Exact course/video name>", "type": "Course|Video|Project|Book", "url": "<FULL working URL>"}}
            ]
        }}
    ]
}}

## CRITICAL RESOURCE REQUIREMENTS:
You MUST only include FREE resources with REAL, VERIFIED URLs from these platforms:

### FREE Platforms to use:
- **freeCodeCamp**: https://www.freecodecamp.org/learn/...
- **Khan Academy**: https://www.khanacademy.org/...
- **Kaggle Learn**: https://www.kaggle.com/learn/...
- **Coursera (Audit mode)**: https://www.coursera.org/learn/... (mention "audit for free")
- **edX (Audit mode)**: https://www.edx.org/learn/...
- **YouTube Channels**: 
  - 3Blue1Brown: https://www.youtube.com/c/3blue1brown
  - Sentdex: https://www.youtube.com/c/sentdex
  - Corey Schafer: https://www.youtube.com/c/Coreyms
  - Tech With Tim: https://www.youtube.com/c/TechWithTim
  - StatQuest: https://www.youtube.com/c/joshstarmer
  - The Coding Train: https://www.youtube.com/c/TheCodingTrain
- **MIT OpenCourseWare**: https://ocw.mit.edu/...
- **Google Developers**: https://developers.google.com/...
- **MDN Web Docs**: https://developer.mozilla.org/...
- **The Odin Project**: https://www.theodinproject.com/...
- **LeetCode**: https://leetcode.com/
- **HackerRank**: https://www.hackerrank.com/

### DO NOT use:
- Udemy (paid)
- Pluralsight (paid)
- LinkedIn Learning (paid)
- Made-up/placeholder URLs
- Generic URLs without full path

## IMPORTANT GUIDELINES:
- Create 3-4 phases ONLY
- Each phase: 2-4 milestones max
- Each phase: 2-3 resources ONLY with VALID URLs
- Focus on 80/20 principle - essential skills only
- Milestones should be completable in 2-4 weeks each

Make this ACHIEVABLE and MOTIVATING."""
    
    try:
        logger.info(f"Generating career roadmap for goal: {career_goal}")
        response = model.generate_content(prompt)
        result_text = clean_json_response(response.text.strip())
        return json.loads(result_text)
    except Exception as e:
        logger.error(f"Career roadmap generation failed: {str(e)}")
        raise Exception(f"Career roadmap generation failed: {str(e)}")

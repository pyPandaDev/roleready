"""
Resume Analysis and Optimization Service
Handles resume analysis, ATS scoring, and resume optimization
"""

import json
import logging
from typing import Optional, Dict, Any
from services.ai_common import get_model, clean_json_response

logger = logging.getLogger(__name__)


async def analyze_resume(
    resume_text: Optional[str] = None,
    resume_base64: Optional[str] = None,
    resume_mime_type: Optional[str] = None,
    target_role: str = "",
    job_description: Optional[str] = None,
    experience_level: Optional[str] = None
) -> Dict[str, Any]:
    """Analyze a resume against a target role with strict professional standards."""
    model = get_model()
    
    experience_context = f"Experience Level: {experience_level}" if experience_level else "Experience Level: Infer from the resume content."
    jd_context = f"Job Description: {job_description}" if job_description else "Job Description: Not provided."
    
    prompt = f"""You are a REALISTIC ATS Analyst with enterprise-level experience. Your scoring must reflect how actual recruiters + enterprise-level ATS systems evaluate resumes.

Analyze this resume for: {target_role}
{experience_context}
{jd_context}

## INDUSTRY-GRADE ATS SCORING SYSTEM

You are an enterprise-level Applicant Tracking System (ATS) used by Fortune 500 companies.
Score resumes OBJECTIVELY based on actual content quality, exactly like Workday, Greenhouse, or Lever ATS systems.

### SCORING CRITERIA (Total: 100 points)

**1. FORMAT & PARSEABILITY (15 points)**
- ATS-friendly format (no tables, images, complex layouts): 0-8 points
- Clear section headers and structure: 0-7 points

**2. KEYWORD MATCH (25 points)**
- Relevant technical skills for {target_role}: 0-12 points
- Industry-standard terminology usage: 0-8 points
- Domain-specific keywords: 0-5 points

**3. CONTENT QUALITY (25 points)**
- Clear, action-oriented bullet points: 0-10 points
- Specificity and detail in descriptions: 0-8 points
- Professional language and clarity: 0-7 points

**4. EXPERIENCE RELEVANCE (20 points)**
- Direct relevance to {target_role}: 0-12 points
- Transferable skills demonstrated: 0-8 points

**5. IMPACT & ACHIEVEMENTS (15 points)**
- Quantifiable results (metrics, numbers, percentages): 0-10 points
- Demonstrated impact and outcomes: 0-5 points

### OBJECTIVE SCORING RULES:

1. **Score the resume as-is** - Do not add/subtract points based on experience level
2. **A strong fresher resume can score 75-85** if it has relevant projects, skills, and clear descriptions
3. **A weak senior resume can score 45-55** if it lacks specificity and relevance
4. **Quantification is valuable but not mandatory** - Clear impact statements work too
5. **Judge based on actual content**, not assumptions about the candidate's background

### SCORE INTERPRETATION (Industry Standard):

- **90-100**: Exceptional - Top 5% of applicants
- **80-89**: Excellent - Strong match, interview recommended
- **70-79**: Good - Solid candidate, worth reviewing
- **60-69**: Fair - Has potential, may need development
- **50-59**: Below Average - Significant gaps
- **Below 50**: Poor - Major improvements needed

### IMPORTANT GUIDELINES:

1. **Experience Context**: A well-written student resume with strong projects CAN score higher than a poorly-written senior resume
2. **Bullet Improvements**: Focus on structure (Action Verb + Task + Result), use descriptive language, NO placeholders
3. **Be Honest**: If a resume is genuinely strong, give 80+. If weak, give 50-. Don't artificially normalize
4. **No Artificial Caps**: Score purely on quality - the best resume gets the highest score regardless of experience level

Calculate each section independently, sum the total, and provide the ACTUAL score.

Return ONLY valid JSON:
{{
    "atsScore": <fair score 0-100 based on factors above>,
    "match_score": <same as atsScore>,
    "sub_scores": {{
        "format_score": <0-100>,
        "content_score": <0-100>,
        "keyword_score": <0-100>,
        "impact_score": <0-100>,
        "role_match_score": <0-100>
    }},
    "verdict": "<Interview Ready|Good Foundation|Average|Needs Work|Major Revision>",
    "summary": "<2-3 sentence REALISTIC assessment - what is strong, what is missing, specific next steps>",
    "strengths": ["<specific strength with example from resume>", "<strength2>", "<strength3>"],
    "gaps": ["<improvement area 1>", "<area 2>", "<area 3>"],
    "hiring_odds": {{
        "startup_fit": "Low|Medium|High", 
        "big_tech_fit": "Low|Medium|High", 
        "consultancy_fit": "Low|Medium|High", 
        "reasoning": "<honest but encouraging assessment>"
    }},
    "job_search_strategy": {{
        "suggested_titles": ["<realistic title based on experience>"], 
        "target_company_types": ["<type1>"], 
        "location_strategy": "<Remote|Hybrid|Onsite>", 
        "quick_action_plan": "<one specific immediate action>"
    }},
    "missing_skills": {{
        "critical": ["<must have for {target_role}>"],
        "technical": ["<tech skill>"], 
        "tools": ["<tool>"], 
        "soft_skills": [], 
        "domain": []
    }},
    "improved_bullets": [
        {{"original": "<exact bullet from resume>", "improved": "<rewritten with action verb + descriptive impact, NO placeholders or fake numbers>", "why": "<what structure improvement was made>"}}
    ],
    "learning_roadmap": {{
        "two_weeks": ["<quick win>"], 
        "one_to_three_months": ["<skill to develop>"], 
        "three_to_six_months": ["<bigger goal>"]
    }},
    "recruiter_view": {{
        "first_impression": "<what stands out in 6 seconds>",
        "missing_elements": "<what recruiters expect but don't see>",
        "perceived_level": "<Junior|Mid-Level|Senior based on content>",
        "trust_factors": "<what builds or reduces confidence>"
    }},
    "expected_after_improvement": {{
        "ats_score": <current + realistic 10-15 points max>,
        "keyword_match": <realistic improvement percentage>
    }},
    "interview_readiness": "<Ready|Needs Prep|Not Ready>"
}}

CRITICAL INSTRUCTIONS:
1. Return ONLY the JSON above - NO additional text, explanations, or markdown
2. Score objectively based on the 5 criteria above - calculate actual points earned
3. Do NOT artificially inflate or deflate scores based on experience level
4. A well-crafted resume deserves a high score regardless of years of experience
5. Be honest and fair - let the actual content quality determine the score"""
    
    try:
        logger.info(f"Calling Gemini API for resume analysis...")
        
        # If PDF/file is provided, use multimodal approach
        if resume_base64 and resume_mime_type:
            import base64
            file_bytes = base64.b64decode(resume_base64)
            
            # Create content parts for multimodal request
            contents = [
                {
                    "mime_type": resume_mime_type,
                    "data": file_bytes
                },
                prompt
            ]
            response = model.generate_content(contents)
        else:
            # Text-only resume
            full_prompt = f"{prompt}\n\nResume:\n{resume_text or '[No resume text provided]'}"
            response = model.generate_content(full_prompt)
        
        result_text = clean_json_response(response.text.strip())
        logger.info(f"Got response, parsing JSON...")
        return json.loads(result_text)
    except Exception as e:
        logger.error(f"Resume analysis failed: {str(e)}")
        raise Exception(f"Resume analysis failed: {str(e)}")


async def optimize_resume(profile: Dict[str, Any]) -> Dict[str, Any]:
    """Optimize resume content for ATS."""
    model = get_model()
    
    prompt = f"""You are an expert Resume Writer. Optimize this resume JSON for ATS.
Return the EXACT same JSON structure with improved content.

Input: {json.dumps(profile)}"""
    
    try:
        response = model.generate_content(prompt)
        result_text = clean_json_response(response.text.strip())
        return json.loads(result_text)
    except Exception as e:
        logger.error(f"Resume optimization failed: {str(e)}")
        raise Exception(f"Resume optimization failed: {str(e)}")


async def analyze_resume_with_jd(
    resume_text: Optional[str] = None,
    resume_base64: Optional[str] = None,
    resume_mime_type: Optional[str] = None,
    job_description: str = ""
) -> Dict[str, Any]:
    """
    Analyze resume against a specific job description with comprehensive matching.
    Industry-standard JD matching analysis.
    """
    model = get_model()
    
    prompt = f"""You are an EXPERT RECRUITER and ATS SPECIALIST analyzing a resume against a specific job description.

## JOB DESCRIPTION:
{job_description}

## YOUR TASK:
Perform a comprehensive, industry-standard analysis comparing this resume to the job description above.
Extract key requirements from the JD and match them against the resume content.

## ANALYSIS FRAMEWORK:

### 1. JD REQUIREMENT EXTRACTION
First, identify from the job description:
- Required skills (must-have)
- Preferred/nice-to-have skills
- Required experience level
- Required education/certifications
- Key responsibilities
- Tools/technologies mentioned
- Soft skills mentioned

### 2. RESUME MATCHING
Then check the resume for:
- Which requirements are met
- Which are partially met
- Which are completely missing
- Additional strengths not in JD

### 3. SCORING (Industry ATS Standard)
- Skills Match: How many required skills present? (0-100)
- Experience Match: Does experience align? (0-100)
- Keyword Density: How many JD keywords in resume? (0-100)
- Overall Fit: Holistic match percentage (0-100)

Return ONLY valid JSON with this EXACT structure:
{{
    "overallScore": <0-100 overall fit percentage>,
    "verdict": "<Perfect Match|Strong Match|Good Fit|Partial Match|Weak Match|Not Suitable>",
    
    "executiveSummary": "<2-3 sentences: Is this candidate a good fit? Key strengths and gaps>",
    
    "jdAnalysis": {{
        "extractedTitle": "<job title from JD>",
        "experienceRequired": "<years of experience required>",
        "keyResponsibilities": ["<responsibility 1>", "<responsibility 2>"],
        "requiredSkills": ["<skill 1>", "<skill 2>"],
        "preferredSkills": ["<skill 1>", "<skill 2>"],
        "toolsTechnologies": ["<tool 1>", "<tool 2>"],
        "softSkills": ["<soft skill 1>", "<soft skill 2>"],
        "educationRequired": "<education requirement>",
        "certifications": ["<cert 1>"]
    }},
    
    "matchAnalysis": {{
        "skillsMatch": {{
            "score": <0-100>,
            "matched": ["<skill found in both>"],
            "missing": ["<required skill NOT in resume>"],
            "partial": ["<skill mentioned but not strong>"]
        }},
        "experienceMatch": {{
            "score": <0-100>,
            "resumeLevel": "<Junior|Mid|Senior based on resume>",
            "jdLevel": "<what JD requires>",
            "gaps": "<what experience is missing>",
            "strengths": "<what experience aligns well>"
        }},
        "keywordMatch": {{
            "score": <0-100>,
            "foundKeywords": ["<keyword found>"],
            "missingKeywords": ["<important keyword missing>"],
            "density": "<Low|Medium|High keyword density>"
        }},
        "responsibilityMatch": {{
            "score": <0-100>,
            "aligned": ["<responsibility candidate can do>"],
            "uncertain": ["<responsibility not clearly shown>"],
            "notDemonstrated": ["<responsibility not shown at all>"]
        }}
    }},
    
    "subScores": {{
        "skillsScore": <0-100>,
        "experienceScore": <0-100>,
        "keywordScore": <0-100>,
        "educationScore": <0-100>,
        "overallRelevance": <0-100>
    }},
    
    "strengths": [
        {{"point": "<specific strength>", "evidence": "<proof from resume>", "relevance": "<how it helps for this job>"}}
    ],
    
    "gaps": [
        {{"requirement": "<what JD wants>", "status": "<Missing|Weak|Partial>", "impact": "<High|Medium|Low>", "suggestion": "<how to address>"}}
    ],
    
    "optimizationSuggestions": {{
        "addKeywords": ["<keyword to add>"],
        "highlightMore": ["<existing skill to emphasize more>"],
        "bulletImprovements": [
            {{"current": "<current bullet or section>", "improved": "<better version tailored for this JD>", "reason": "<why this helps>"}}
        ],
        "sectionsToAdd": ["<section that would strengthen application>"],
        "removeOrDeemphasize": ["<irrelevant section to minimize>"]
    }},
    
    "interviewReadiness": {{
        "ready": <true|false>,
        "confidenceLevel": "<High|Medium|Low>",
        "likelyQuestions": ["<question recruiter might ask based on gaps>"],
        "talkingPoints": ["<strength to emphasize in interview>"]
    }},
    
    "competitiveAnalysis": {{
        "strongerThanAverage": ["<areas where candidate stands out>"],
        "weakerThanAverage": ["<areas where typical candidates are stronger>"],
        "differentiators": ["<unique selling points>"],
        "redFlags": ["<potential concerns for recruiter>"]
    }},
    
    "actionPlan": {{
        "beforeApplying": ["<quick fix to do now>"],
        "shortTerm": ["<improvement for next 2 weeks>"],
        "longTerm": ["<skill to develop over months>"]
    }},
    
    "finalRecommendation": {{
        "shouldApply": <true|false>,
        "reasoning": "<honest assessment of chances>",
        "alternativeRoles": ["<similar roles that might be better fit>"]
    }}
}}

CRITICAL INSTRUCTIONS:
1. Be SPECIFIC - reference actual content from both JD and resume
2. Be HONEST - if there are major gaps, say so clearly
3. Be ACTIONABLE - every suggestion should be implementable
4. Score based on ACTUAL match, not potential
5. If resume content is not provided, analyze based on empty resume assumption"""

    try:
        logger.info("Performing JD-based resume analysis...")
        
        if resume_base64 and resume_mime_type:
            import base64
            file_bytes = base64.b64decode(resume_base64)
            contents = [
                {
                    "mime_type": resume_mime_type,
                    "data": file_bytes
                },
                prompt
            ]
            response = model.generate_content(contents)
        else:
            full_prompt = f"{prompt}\n\nRESUME CONTENT:\n{resume_text or '[No resume provided]'}"
            response = model.generate_content(full_prompt)
        
        result_text = clean_json_response(response.text.strip())
        logger.info("JD analysis complete")
        return json.loads(result_text)
    except Exception as e:
        logger.error(f"JD-based analysis failed: {str(e)}")
        raise Exception(f"JD-based analysis failed: {str(e)}")


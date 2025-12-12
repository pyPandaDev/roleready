"""
User Data Routes - CRUD operations for user-generated content.
Handles resumes, analyses, cover letters, interviews, portfolios, and emails.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime
from firebase_admin import firestore
from config.firebase import get_db
from routes.auth import get_current_user

router = APIRouter()

# ============ Pydantic Models ============

class ResumeCreate(BaseModel):
    title: str
    content: Dict[str, Any]  # Resume JSON data

class ResumeResponse(BaseModel):
    id: str
    title: str
    content: Dict[str, Any]
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class AnalysisCreate(BaseModel):
    targetRole: str
    result: Dict[str, Any]  # Full analysis result
    resumeSnapshot: Optional[str] = None

class JDAnalysisCreate(BaseModel):
    jobTitle: str
    jobDescription: str
    result: Dict[str, Any]
    resumeSnapshot: Optional[str] = None

class CoverLetterCreate(BaseModel):
    jobTitle: str
    company: str
    content: str

class InterviewCreate(BaseModel):
    role: str
    questions: List[Dict[str, Any]]
    score: Optional[int] = None
    feedback: Optional[str] = None

class PortfolioCreate(BaseModel):
    name: str
    htmlContent: str

class EmailCreate(BaseModel):
    recipient: str
    company: str
    subject: str
    body: str


# ============ RESUMES ============

@router.get("/resumes")
async def list_resumes(current_user: dict = Depends(get_current_user)):
    """List all saved resumes for the current user."""
    try:
        db = get_db()
        resumes_ref = db.collection("users").document(current_user["uid"]).collection("resumes")
        docs = resumes_ref.order_by("createdAt", direction=firestore.Query.DESCENDING).stream()
        
        resumes = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            resumes.append(data)
        
        return {"resumes": resumes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resumes")
async def save_resume(resume: ResumeCreate, current_user: dict = Depends(get_current_user)):
    """Save a new resume."""
    try:
        db = get_db()
        resumes_ref = db.collection("users").document(current_user["uid"]).collection("resumes")
        
        doc_data = {
            "title": resume.title,
            "content": resume.content,
            "createdAt": firestore.SERVER_TIMESTAMP,
            "updatedAt": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = resumes_ref.add(doc_data)
        return {"message": "Resume saved", "id": doc_ref[1].id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/resumes/{resume_id}")
async def get_resume(resume_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific resume."""
    try:
        db = get_db()
        doc_ref = db.collection("users").document(current_user["uid"]).collection("resumes").document(resume_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        data = doc.to_dict()
        data["id"] = doc.id
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/resumes/{resume_id}")
async def delete_resume(resume_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a resume."""
    try:
        db = get_db()
        doc_ref = db.collection("users").document(current_user["uid"]).collection("resumes").document(resume_id)
        doc_ref.delete()
        return {"message": "Resume deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ ANALYSES ============

@router.get("/analyses")
async def list_analyses(current_user: dict = Depends(get_current_user)):
    """List all saved analyses for the current user."""
    try:
        db = get_db()
        analyses_ref = db.collection("users").document(current_user["uid"]).collection("analyses")
        docs = analyses_ref.order_by("createdAt", direction=firestore.Query.DESCENDING).stream()
        
        analyses = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            analyses.append(data)
        
        return {"analyses": analyses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyses")
async def save_analysis(analysis: AnalysisCreate, current_user: dict = Depends(get_current_user)):
    """Save an analysis result."""
    try:
        db = get_db()
        analyses_ref = db.collection("users").document(current_user["uid"]).collection("analyses")
        
        doc_data = {
            "targetRole": analysis.targetRole,
            "result": analysis.result,
            "resumeSnapshot": analysis.resumeSnapshot,
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = analyses_ref.add(doc_data)
        return {"message": "Analysis saved", "id": doc_ref[1].id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/analyses/{analysis_id}")
async def delete_analysis(analysis_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an analysis."""
    try:
        db = get_db()
        doc_ref = db.collection("users").document(current_user["uid"]).collection("analyses").document(analysis_id)
        doc_ref.delete()
        return {"message": "Analysis deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ JD ANALYSES (Job Description Match) ============

@router.get("/jd-analyses")
async def list_jd_analyses(current_user: dict = Depends(get_current_user)):
    """List all JD match analyses for the current user."""
    try:
        db = get_db()
        analyses_ref = db.collection("users").document(current_user["uid"]).collection("jd_analyses")
        docs = analyses_ref.order_by("createdAt", direction=firestore.Query.DESCENDING).stream()
        
        analyses = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            analyses.append(data)
        
        return {"analyses": analyses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/jd-analyses")
async def save_jd_analysis(analysis: JDAnalysisCreate, current_user: dict = Depends(get_current_user)):
    """Save a JD match analysis result."""
    try:
        db = get_db()
        analyses_ref = db.collection("users").document(current_user["uid"]).collection("jd_analyses")
        
        doc_data = {
            "jobTitle": analysis.jobTitle,
            "jobDescription": analysis.jobDescription[:500] if analysis.jobDescription else "",  # Store truncated JD
            "result": analysis.result,
            "resumeSnapshot": analysis.resumeSnapshot,
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = analyses_ref.add(doc_data)
        return {"message": "JD Analysis saved", "id": doc_ref[1].id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/jd-analyses/{analysis_id}")
async def delete_jd_analysis(analysis_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a JD analysis."""
    try:
        db = get_db()
        doc_ref = db.collection("users").document(current_user["uid"]).collection("jd_analyses").document(analysis_id)
        doc_ref.delete()
        return {"message": "JD Analysis deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ COVER LETTERS ============

@router.get("/cover-letters")
async def list_cover_letters(current_user: dict = Depends(get_current_user)):
    """List all saved cover letters."""
    try:
        db = get_db()
        letters_ref = db.collection("users").document(current_user["uid"]).collection("cover_letters")
        docs = letters_ref.order_by("createdAt", direction=firestore.Query.DESCENDING).stream()
        
        letters = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            letters.append(data)
        
        return {"coverLetters": letters}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cover-letters")
async def save_cover_letter(letter: CoverLetterCreate, current_user: dict = Depends(get_current_user)):
    """Save a cover letter."""
    try:
        db = get_db()
        letters_ref = db.collection("users").document(current_user["uid"]).collection("cover_letters")
        
        doc_data = {
            "jobTitle": letter.jobTitle,
            "company": letter.company,
            "content": letter.content,
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = letters_ref.add(doc_data)
        return {"message": "Cover letter saved", "id": doc_ref[1].id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ INTERVIEWS ============

@router.get("/interviews")
async def list_interviews(current_user: dict = Depends(get_current_user)):
    """List all saved interview sessions."""
    try:
        db = get_db()
        interviews_ref = db.collection("users").document(current_user["uid"]).collection("interviews")
        docs = interviews_ref.order_by("createdAt", direction=firestore.Query.DESCENDING).stream()
        
        interviews = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            interviews.append(data)
        
        return {"interviews": interviews}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/interviews")
async def save_interview(interview: InterviewCreate, current_user: dict = Depends(get_current_user)):
    """Save an interview session."""
    try:
        db = get_db()
        interviews_ref = db.collection("users").document(current_user["uid"]).collection("interviews")
        
        doc_data = {
            "role": interview.role,
            "questions": interview.questions,
            "score": interview.score,
            "feedback": interview.feedback,
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = interviews_ref.add(doc_data)
        return {"message": "Interview saved", "id": doc_ref[1].id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ PORTFOLIOS ============

@router.get("/portfolios")
async def list_portfolios(current_user: dict = Depends(get_current_user)):
    """List all saved portfolios."""
    try:
        db = get_db()
        portfolios_ref = db.collection("users").document(current_user["uid"]).collection("portfolios")
        docs = portfolios_ref.order_by("createdAt", direction=firestore.Query.DESCENDING).stream()
        
        portfolios = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            portfolios.append(data)
        
        return {"portfolios": portfolios}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/portfolios")
async def save_portfolio(portfolio: PortfolioCreate, current_user: dict = Depends(get_current_user)):
    """Save a portfolio."""
    try:
        db = get_db()
        portfolios_ref = db.collection("users").document(current_user["uid"]).collection("portfolios")
        
        doc_data = {
            "name": portfolio.name,
            "htmlContent": portfolio.htmlContent,
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = portfolios_ref.add(doc_data)
        return {"message": "Portfolio saved", "id": doc_ref[1].id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ EMAILS ============

@router.get("/emails")
async def list_emails(current_user: dict = Depends(get_current_user)):
    """List all saved cold emails."""
    try:
        db = get_db()
        emails_ref = db.collection("users").document(current_user["uid"]).collection("emails")
        docs = emails_ref.order_by("createdAt", direction=firestore.Query.DESCENDING).stream()
        
        emails = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            emails.append(data)
        
        return {"emails": emails}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/emails")
async def save_email(email: EmailCreate, current_user: dict = Depends(get_current_user)):
    """Save a cold email."""
    try:
        db = get_db()
        emails_ref = db.collection("users").document(current_user["uid"]).collection("emails")
        
        doc_data = {
            "recipient": email.recipient,
            "company": email.company,
            "subject": email.subject,
            "body": email.body,
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = emails_ref.add(doc_data)
        return {"message": "Email saved", "id": doc_ref[1].id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ INTERVIEW PROGRESS ============

class InterviewProgressCreate(BaseModel):
    role: str
    experienceLevel: str
    completedQuestions: List[str]  # List of "categoryIdx-questionId" keys
    answers: Dict[str, str]  # "categoryIdx-questionId" -> answer text
    evaluation: Optional[Dict[str, Any]] = None

@router.get("/interview-progress")
async def get_interview_progress(current_user: dict = Depends(get_current_user)):
    """Get saved interview progress for the current user."""
    try:
        db = get_db()
        doc_ref = db.collection("users").document(current_user["uid"]).collection("interview_progress").document("current")
        doc = doc_ref.get()
        
        if doc.exists:
            return doc.to_dict()
        return {"role": "", "experienceLevel": "", "completedQuestions": [], "answers": {}, "evaluation": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/interview-progress")
async def save_interview_progress(progress: InterviewProgressCreate, current_user: dict = Depends(get_current_user)):
    """Save interview progress."""
    try:
        db = get_db()
        doc_ref = db.collection("users").document(current_user["uid"]).collection("interview_progress").document("current")
        
        doc_data = {
            "role": progress.role,
            "experienceLevel": progress.experienceLevel,
            "completedQuestions": progress.completedQuestions,
            "answers": progress.answers,
            "evaluation": progress.evaluation,
            "updatedAt": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref.set(doc_data)
        return {"message": "Progress saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/interview-progress")
async def clear_interview_progress(current_user: dict = Depends(get_current_user)):
    """Clear interview progress."""
    try:
        db = get_db()
        doc_ref = db.collection("users").document(current_user["uid"]).collection("interview_progress").document("current")
        doc_ref.delete()
        return {"message": "Progress cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ COACH CONVERSATIONS ============

class CoachMessageCreate(BaseModel):
    messages: List[Dict[str, str]]  # [{role: "user"|"assistant", content: "..."}]
    title: Optional[str] = None

@router.get("/coach-conversations")
async def list_coach_conversations(current_user: dict = Depends(get_current_user)):
    """List all coach conversations."""
    try:
        db = get_db()
        convos_ref = db.collection("users").document(current_user["uid"]).collection("coach_conversations")
        docs = convos_ref.order_by("updatedAt", direction=firestore.Query.DESCENDING).limit(10).stream()
        
        conversations = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            conversations.append(data)
        
        return {"conversations": conversations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/coach-conversations/current")
async def get_current_coach_conversation(current_user: dict = Depends(get_current_user)):
    """Get the most recent conversation or create empty one."""
    try:
        db = get_db()
        doc_ref = db.collection("users").document(current_user["uid"]).collection("coach_conversations").document("current")
        doc = doc_ref.get()
        
        if doc.exists:
            return doc.to_dict()
        return {"messages": [], "title": "New Conversation"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/coach-conversations/current")
async def save_current_coach_conversation(convo: CoachMessageCreate, current_user: dict = Depends(get_current_user)):
    """Save current conversation."""
    try:
        db = get_db()
        doc_ref = db.collection("users").document(current_user["uid"]).collection("coach_conversations").document("current")
        
        # Auto-generate title from first user message if not provided
        title = convo.title
        if not title and len(convo.messages) > 1:
            for msg in convo.messages:
                if msg.get("role") == "user":
                    title = msg.get("content", "")[:50] + "..."
                    break
        
        doc_data = {
            "messages": convo.messages,
            "title": title or "New Conversation",
            "updatedAt": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref.set(doc_data)
        return {"message": "Conversation saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/coach-conversations/new")
async def start_new_coach_conversation(current_user: dict = Depends(get_current_user)):
    """Archive current conversation and start new."""
    try:
        db = get_db()
        current_ref = db.collection("users").document(current_user["uid"]).collection("coach_conversations").document("current")
        current_doc = current_ref.get()
        
        # Save current conversation to archive if it has messages
        if current_doc.exists:
            data = current_doc.to_dict()
            if data.get("messages") and len(data["messages"]) > 1:
                archive_ref = db.collection("users").document(current_user["uid"]).collection("coach_conversations")
                data["archivedAt"] = firestore.SERVER_TIMESTAMP
                archive_ref.add(data)
        
        # Clear current
        current_ref.delete()
        return {"message": "New conversation started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/coach-conversations/{conversation_id}")
async def delete_coach_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a specific coach conversation."""
    try:
        db = get_db()
        
        # Handle "current" specially
        if conversation_id == "current":
            doc_ref = db.collection("users").document(current_user["uid"]).collection("coach_conversations").document("current")
        else:
            doc_ref = db.collection("users").document(current_user["uid"]).collection("coach_conversations").document(conversation_id)
        
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Conversation not found")
            
        doc_ref.delete()
        return {"message": "Conversation deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/coach-conversations/{conversation_id}/load")
async def load_coach_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Load a past conversation as the current one."""
    try:
        db = get_db()
        
        # Get the conversation to load
        source_ref = db.collection("users").document(current_user["uid"]).collection("coach_conversations").document(conversation_id)
        source_doc = source_ref.get()
        
        if not source_doc.exists:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Set it as current
        current_ref = db.collection("users").document(current_user["uid"]).collection("coach_conversations").document("current")
        source_data = source_doc.to_dict()
        source_data["updatedAt"] = firestore.SERVER_TIMESTAMP
        current_ref.set(source_data)
        
        return {"message": "Conversation loaded", "id": conversation_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ SKILL GAP ANALYSES ============

class SkillAnalysisCreate(BaseModel):
    dreamRole: str
    matchPercentage: int
    skillsYouHave: List[Dict[str, Any]]
    skillsMissing: List[Dict[str, Any]]
    actionPlan: List[Dict[str, Any]]
    recommendedResources: List[Dict[str, Any]]

@router.get("/skill-analyses")
async def list_skill_analyses(current_user: dict = Depends(get_current_user)):
    """List all saved skill gap analyses."""
    try:
        db = get_db()
        analyses_ref = db.collection("users").document(current_user["uid"]).collection("skill_analyses")
        docs = analyses_ref.order_by("createdAt", direction=firestore.Query.DESCENDING).limit(10).stream()
        
        analyses = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            analyses.append(data)
        
        return {"analyses": analyses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/skill-analyses")
async def save_skill_analysis(analysis: SkillAnalysisCreate, current_user: dict = Depends(get_current_user)):
    """Save a skill gap analysis."""
    try:
        db = get_db()
        analyses_ref = db.collection("users").document(current_user["uid"]).collection("skill_analyses")
        
        doc_data = {
            "dreamRole": analysis.dreamRole,
            "matchPercentage": analysis.matchPercentage,
            "skillsYouHave": analysis.skillsYouHave,
            "skillsMissing": analysis.skillsMissing,
            "actionPlan": analysis.actionPlan,
            "recommendedResources": analysis.recommendedResources,
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = analyses_ref.add(doc_data)
        return {"message": "Analysis saved", "id": doc_ref[1].id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ CAREER ROADMAPS ============

class RoadmapCreate(BaseModel):
    goal: str
    estimatedTime: str
    phases: List[Dict[str, Any]]
    completedItems: List[str] = []  # List of "phaseIdx-milestoneIdx" keys

class RoadmapUpdate(BaseModel):
    completedItems: List[str]  # Updated completed items list

@router.get("/roadmaps")
async def list_roadmaps(current_user: dict = Depends(get_current_user)):
    """List all saved career roadmaps."""
    try:
        db = get_db()
        roadmaps_ref = db.collection("users").document(current_user["uid"]).collection("roadmaps")
        docs = roadmaps_ref.order_by("createdAt", direction=firestore.Query.DESCENDING).stream()
        
        roadmaps = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            roadmaps.append(data)
        
        return {"roadmaps": roadmaps}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/roadmaps")
async def save_roadmap(roadmap: RoadmapCreate, current_user: dict = Depends(get_current_user)):
    """Save a new career roadmap."""
    try:
        db = get_db()
        roadmaps_ref = db.collection("users").document(current_user["uid"]).collection("roadmaps")
        
        doc_data = {
            "goal": roadmap.goal,
            "estimatedTime": roadmap.estimatedTime,
            "phases": roadmap.phases,
            "completedItems": roadmap.completedItems,
            "createdAt": firestore.SERVER_TIMESTAMP,
            "updatedAt": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = roadmaps_ref.add(doc_data)
        return {"message": "Roadmap saved", "id": doc_ref[1].id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/roadmaps/{roadmap_id}")
async def get_roadmap(roadmap_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific roadmap."""
    try:
        db = get_db()
        doc_ref = db.collection("users").document(current_user["uid"]).collection("roadmaps").document(roadmap_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        
        data = doc.to_dict()
        data["id"] = doc.id
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/roadmaps/{roadmap_id}")
async def update_roadmap(roadmap_id: str, update: RoadmapUpdate, current_user: dict = Depends(get_current_user)):
    """Update roadmap progress (completed items)."""
    try:
        db = get_db()
        doc_ref = db.collection("users").document(current_user["uid"]).collection("roadmaps").document(roadmap_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        
        doc_ref.update({
            "completedItems": update.completedItems,
            "updatedAt": firestore.SERVER_TIMESTAMP
        })
        
        return {"message": "Roadmap updated"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/roadmaps/{roadmap_id}")
async def delete_roadmap(roadmap_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a roadmap."""
    try:
        db = get_db()
        doc_ref = db.collection("users").document(current_user["uid"]).collection("roadmaps").document(roadmap_id)
        doc_ref.delete()
        return {"message": "Roadmap deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


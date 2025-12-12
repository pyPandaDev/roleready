"""
Admin Routes - Management endpoints for administrators.
Handles user management, statistics, and admin authentication.
"""

from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from dotenv import load_dotenv
import jwt
import os
import logging
from config.firebase import get_db
from firebase_admin import auth as firebase_auth

# Load environment variables
load_dotenv()

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Admin credentials from environment (REQUIRED - no fallbacks for security)
ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "")
ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "")
JWT_SECRET: str = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM: str = "HS256"
TOKEN_EXPIRY_HOURS: int = 24

# Validate required environment variables on startup
_required_vars = {"ADMIN_EMAIL": ADMIN_EMAIL, "ADMIN_PASSWORD": ADMIN_PASSWORD, "JWT_SECRET": JWT_SECRET}
_missing_vars = [k for k, v in _required_vars.items() if not v]
if _missing_vars:
    logger.warning(f"⚠️ Missing required environment variables: {', '.join(_missing_vars)}. Admin panel will not work!")

# ============ Models ============

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class AdminLoginResponse(BaseModel):
    token: str
    email: str
    expires_at: str

# ============ Auth Helpers ============

def create_admin_token(email: str) -> tuple[str, datetime]:
    """
    Create a JWT token for admin session.
    
    Args:
        email: Admin email address
        
    Returns:
        Tuple of (token string, expiration datetime)
    """
    expires = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS)
    payload = {
        "email": email,
        "role": "admin",
        "exp": expires,
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token, expires

async def verify_admin_token(authorization: str = Header(..., alias="Authorization")):
    """Verify admin JWT token from Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split("Bearer ")[1]
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not an admin token")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ Admin Login ============

@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(request: AdminLoginRequest):
    """Authenticate admin with email and password."""
    if request.email != ADMIN_EMAIL or request.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    token, expires = create_admin_token(request.email)
    
    return {
        "token": token,
        "email": request.email,
        "expires_at": expires.isoformat()
    }

# ============ Statistics ============

# Simple in-memory cache for admin stats
_stats_cache: Dict[str, Any] = {"data": None, "expires_at": None}
CACHE_TTL_SECONDS: int = 60  # Cache for 1 minute

@router.get("/stats")
async def get_admin_stats(admin: dict = Depends(verify_admin_token)):
    """
    Get application-wide statistics.
    
    Uses in-memory caching for faster response times.
    Cache TTL: 60 seconds.
    """
    global _stats_cache
    
    # Check cache
    if _stats_cache["data"] and _stats_cache["expires_at"]:
        if datetime.utcnow() < _stats_cache["expires_at"]:
            return _stats_cache["data"]
    
    try:
        db = get_db()
        users_ref = db.collection("users")
        users_docs = list(users_ref.stream())
        
        stats = {
            "total_users": len(users_docs),
            "total_resumes": 0,
            "total_analyses": 0,
            "total_jd_analyses": 0,
            "total_interviews": 0,
            "total_portfolios": 0,
            "users_by_plan": {"free": 0, "pro": 0, "enterprise": 0}
        }
        
        for user_doc in users_docs:
            user_data = user_doc.to_dict()
            plan = user_data.get("plan", "free")
            if plan in stats["users_by_plan"]:
                stats["users_by_plan"][plan] += 1
            
            # Count subcollections
            user_ref = users_ref.document(user_doc.id)
            
            resumes = list(user_ref.collection("resumes").stream())
            stats["total_resumes"] += len(resumes)
            
            analyses = list(user_ref.collection("analyses").stream())
            stats["total_analyses"] += len(analyses)
            
            jd_analyses = list(user_ref.collection("jd_analyses").stream())
            stats["total_jd_analyses"] += len(jd_analyses)
            
            interviews = list(user_ref.collection("interviews").stream())
            stats["total_interviews"] += len(interviews)
            
            portfolios = list(user_ref.collection("portfolios").stream())
            stats["total_portfolios"] += len(portfolios)
        
        # Update cache
        _stats_cache["data"] = stats
        _stats_cache["expires_at"] = datetime.utcnow() + timedelta(seconds=CACHE_TTL_SECONDS)
        
        return stats
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")

# ============ Users Management ============

@router.get("/users")
async def list_all_users(
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    admin: dict = Depends(verify_admin_token)
):
    """List all users with optional search and pagination."""
    try:
        db = get_db()
        users_ref = db.collection("users")
        users_docs = list(users_ref.stream())
        
        all_users = []
        for doc in users_docs:
            user_data = doc.to_dict()
            user_data["uid"] = doc.id
            
            # Convert timestamps to strings
            if user_data.get("created_at"):
                try:
                    user_data["created_at"] = user_data["created_at"].isoformat() if hasattr(user_data["created_at"], 'isoformat') else str(user_data["created_at"])
                except (AttributeError, TypeError, ValueError):
                    user_data["created_at"] = None
            
            # Filter by search if provided
            if search:
                search_lower = search.lower()
                email = (user_data.get("email") or "").lower()
                name = (user_data.get("display_name") or "").lower()
                if search_lower not in email and search_lower not in name:
                    continue
            
            all_users.append(user_data)
        
        # Pagination
        total = len(all_users)
        start = (page - 1) * limit
        end = start + limit
        paginated_users = all_users[start:end]
        
        return {
            "users": paginated_users, 
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")

@router.get("/users/{uid}")
async def get_user_details(
    uid: str,
    admin: dict = Depends(verify_admin_token)
):
    """Get detailed user data including all subcollections."""
    try:
        db = get_db()
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = user_doc.to_dict()
        user_data["uid"] = uid
        
        # Get all subcollections
        def get_collection_data(collection_name: str) -> List[Dict]:
            docs = list(user_ref.collection(collection_name).stream())
            items = []
            for doc in docs:
                item = doc.to_dict()
                item["id"] = doc.id
                # Handle timestamps
                for key in ["createdAt", "created_at", "updatedAt"]:
                    if item.get(key) and hasattr(item[key], 'isoformat'):
                        item[key] = item[key].isoformat()
                items.append(item)
            return items
        
        user_data["resumes"] = get_collection_data("resumes")
        user_data["analyses"] = get_collection_data("analyses")
        user_data["jd_analyses"] = get_collection_data("jd_analyses")
        user_data["interviews"] = get_collection_data("interviews")
        user_data["portfolios"] = get_collection_data("portfolios")
        
        # Get Firebase Auth data
        try:
            firebase_user = firebase_auth.get_user(uid)
            user_data["firebase_info"] = {
                "email_verified": firebase_user.email_verified,
                "disabled": firebase_user.disabled,
                "creation_time": firebase_user.user_metadata.creation_timestamp,
                "last_sign_in": firebase_user.user_metadata.last_sign_in_timestamp
            }
        except (firebase_auth.UserNotFoundError, ValueError, Exception) as e:
            logger.debug(f"Could not fetch Firebase auth info for {uid}: {e}")
            user_data["firebase_info"] = None
        
        return user_data
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")

@router.delete("/users/{uid}")
async def delete_user(
    uid: str,
    admin: dict = Depends(verify_admin_token)
):
    """Delete a user and all their data."""
    try:
        db = get_db()
        user_ref = db.collection("users").document(uid)
        
        # Check if user exists
        if not user_ref.get().exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Delete all subcollections
        subcollections = ["resumes", "analyses", "interviews", "cover_letters", "portfolios", "emails"]
        for coll_name in subcollections:
            docs = list(user_ref.collection(coll_name).stream())
            for doc in docs:
                doc.reference.delete()
        
        # Delete user document
        user_ref.delete()
        
        # Optionally delete from Firebase Auth
        try:
            firebase_auth.delete_user(uid)
        except Exception as e:
            # Log but don't fail if Firebase Auth deletion fails
            print(f"Warning: Could not delete user from Firebase Auth: {e}")
        
        return {"message": "User deleted successfully", "uid": uid}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")


# ============ Update User Plan ============

class UpdatePlanRequest(BaseModel):
    plan: str

@router.put("/users/{uid}/plan")
async def update_user_plan(
    uid: str,
    request: UpdatePlanRequest,
    admin: dict = Depends(verify_admin_token)
):
    """Update a user's subscription plan."""
    valid_plans = ["free", "pro", "enterprise"]
    
    if request.plan not in valid_plans:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid plan. Must be one of: {', '.join(valid_plans)}"
        )
    
    try:
        db = get_db()
        user_ref = db.collection("users").document(uid)
        
        # Check if user exists
        user_doc = user_ref.get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update plan
        user_ref.update({
            "plan": request.plan,
            "plan_updated_at": datetime.utcnow()
        })
        
        # Invalidate stats cache
        global _stats_cache
        _stats_cache = {"data": None, "expires_at": None}
        
        return {
            "message": "Plan updated successfully",
            "uid": uid,
            "new_plan": request.plan
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update plan: {str(e)}")


from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from firebase_admin import firestore
from config.firebase import verify_firebase_token, get_user_by_uid, get_db

router = APIRouter()

class UserCreate(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None

class UserResponse(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: Optional[str] = None

# Dependency to get current user from token
async def get_current_user(authorization: str = Header(...)):
    """Extract and verify Firebase token from Authorization header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split("Bearer ")[1]
    user = verify_firebase_token(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user

@router.post("/register")
async def register_user(user: UserCreate, current_user: dict = Depends(get_current_user)):
    """Register/sync user after Firebase Auth signup - Requires authentication."""
    try:
        # Security: Verify that the authenticated user matches the registration UID
        if current_user["uid"] != user.uid:
            raise HTTPException(status_code=403, detail="Cannot register for a different user")
        
        db = get_db()
        user_ref = db.collection("users").document(user.uid)
        
        user_data = {
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name,
            "photo_url": user.photo_url,
            "created_at": firestore.SERVER_TIMESTAMP,
            "plan": "free",
            "usage": {
                "analyses": 0,
                "resumes": 0,
                "interviews": 0,
            }
        }
        
        user_ref.set(user_data)
        return {"message": "User registered successfully", "uid": user.uid}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to register user")

@router.get("/me")
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user's profile."""
    try:
        db = get_db()
        user_ref = db.collection("users").document(current_user["uid"])
        user_doc = user_ref.get()
        
        if user_doc.exists:
            return user_doc.to_dict()
        else:
            # Create user if doesn't exist
            user_data = {
                "uid": current_user["uid"],
                "email": current_user.get("email"),
                "display_name": current_user.get("name"),
                "photo_url": current_user.get("picture"),
                "plan": "free",
            }
            user_ref.set(user_data)
            return user_data
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch user profile")

@router.put("/me")
async def update_user_profile(
    update_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update current user's profile."""
    try:
        db = get_db()
        user_ref = db.collection("users").document(current_user["uid"])
        
        # Only allow certain fields to be updated
        allowed_fields = ["display_name", "photo_url", "preferences"]
        filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        user_ref.update(filtered_data)
        return {"message": "Profile updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update profile")

import firebase_admin
from firebase_admin import credentials, auth, firestore
from firebase_admin.auth import InvalidIdTokenError, ExpiredIdTokenError, RevokedIdTokenError, UserNotFoundError
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK with service account credentials."""
    
    # Check if already initialized
    if len(firebase_admin._apps) > 0:
        return firestore.client()
    
    # Try to use service account file first
    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    
    if service_account_path and os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
    else:
        # Use environment variables
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": os.getenv("FIREBASE_PROJECT_ID"),
            "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
            "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n"),
            "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
            "client_id": os.getenv("FIREBASE_CLIENT_ID"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        })
    
    firebase_admin.initialize_app(cred)
    return firestore.client()

# Get Firestore client
db = None

def get_db():
    """Get Firestore database client."""
    global db
    if db is None:
        db = initialize_firebase()
    return db

def verify_firebase_token(id_token: str):
    """Verify Firebase ID token and return user info."""
    try:
        # Ensure Firebase is initialized before verifying tokens
        initialize_firebase()
        # Add clock_skew_seconds to handle slight time differences between client/server
        decoded_token = auth.verify_id_token(id_token, clock_skew_seconds=60)
        return decoded_token
    except (InvalidIdTokenError, ExpiredIdTokenError, RevokedIdTokenError) as e:
        logger.warning(f"Token verification failed: {type(e).__name__}")
        return None
    except Exception as e:
        logger.error(f"Unexpected token verification error: {type(e).__name__}")
        return None

def get_user_by_uid(uid: str):
    """Get Firebase user by UID."""
    try:
        user = auth.get_user(uid)
        return {
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name,
            "photo_url": user.photo_url,
            "email_verified": user.email_verified,
        }
    except UserNotFoundError:
        logger.debug(f"User not found: {uid}")
        return None
    except Exception as e:
        logger.error(f"Error getting user {uid}: {type(e).__name__}")
        return None

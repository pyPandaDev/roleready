from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app
app = FastAPI(
    title="RoleReady API",
    description="Backend API for RoleReady - AI-powered career toolkit",
    version="1.0.0"
)

# Attach limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware for frontend
# Production: Set FRONTEND_URL env variable to your production domain (e.g., https://roleready.vercel.app)
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8000",
]
# Add production URL if configured
production_url = os.getenv("FRONTEND_URL", "")
if production_url and production_url not in allowed_origins:
    allowed_origins.append(production_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request size limit middleware (10MB max)
MAX_REQUEST_SIZE = 10 * 1024 * 1024  # 10MB

@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_REQUEST_SIZE:
        return JSONResponse(
            status_code=413,
            content={"detail": "Request too large. Maximum size is 10MB."}
        )
    return await call_next(request)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    # Prevent XSS attacks
    response.headers["X-Content-Type-Options"] = "nosniff"
    # Prevent clickjacking
    response.headers["X-Frame-Options"] = "DENY"
    # Enable XSS filter in older browsers
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # Strict transport security (HTTPS only in production)
    if os.getenv("DEBUG", "False").lower() == "false":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    # Prevent MIME type sniffing
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Health check endpoints
@app.get("/")
async def root():
    return {
        "message": "🚀 RoleReady API is running!",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}

# Import and include routers
from routes.auth import router as auth_router
from routes.ai import router as ai_router
from routes.user_data import router as user_data_router
from routes.admin import router as admin_router

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI Services"])
app.include_router(user_data_router, prefix="/api/data", tags=["User Data"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)


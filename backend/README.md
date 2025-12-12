# RoleReady Backend API

AI-powered career toolkit backend built with FastAPI, Firebase, and Google Gemini AI.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Firebase project with Firestore enabled
- Google Gemini API key

### Installation

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

### Configuration

Edit `.env` with your credentials:

```env
# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Server
PORT=8000
DEBUG=False
FRONTEND_URL=http://localhost:3000

# Admin Panel
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_64_char_secret
```

### Run Development Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API available at: `http://localhost:8000`  
API Docs: `http://localhost:8000/docs`

## 📚 API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root health check |
| GET | `/api/health` | API health status |

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user | ✅ |
| GET | `/api/auth/me` | Get profile | ✅ |
| PUT | `/api/auth/me` | Update profile | ✅ |

### AI Services (Rate Limited)
| Method | Endpoint | Limit | Description |
|--------|----------|-------|-------------|
| POST | `/api/ai/analyze-resume` | 10/min | Analyze resume |
| POST | `/api/ai/analyze-with-jd` | 10/min | Analyze with JD |
| POST | `/api/ai/optimize-resume` | 10/min | Optimize resume |
| POST | `/api/ai/interview/questions` | 20/min | Generate questions |
| POST | `/api/ai/evaluate-interview` | 5/min | Evaluate answers |
| POST | `/api/ai/career-coach` | 30/min | Career advice chat |
| POST | `/api/ai/portfolio` | 5/min | Generate portfolio |
| POST | `/api/ai/skill-gap` | 10/min | Skill gap analysis |
| POST | `/api/ai/career-roadmap` | 10/min | Career roadmap |

### User Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/data/resumes` | User resumes |
| GET/POST | `/api/data/analyses` | Resume analyses |
| GET/POST | `/api/data/interviews` | Interview prep |
| GET/POST | `/api/data/portfolios` | Portfolios |

### Admin Panel
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/admin/login` | Admin login | - |
| GET | `/api/admin/stats` | Dashboard stats | Admin |
| GET | `/api/admin/users` | List users | Admin |
| GET | `/api/admin/users/{uid}` | User details | Admin |
| DELETE | `/api/admin/users/{uid}` | Delete user | Admin |
| PUT | `/api/admin/users/{uid}/plan` | Update plan | Admin |

## 🔐 Security Features

- ✅ Firebase token authentication
- ✅ JWT-based admin authentication
- ✅ Rate limiting (SlowAPI)
- ✅ Request size limit (10MB)
- ✅ Security headers (XSS, HSTS, etc.)
- ✅ CORS configuration
- ✅ Sanitized error messages

## 📂 Project Structure

```
backend/
├── main.py                  # FastAPI app entry point
├── requirements.txt         # Python dependencies
├── .env.example            # Environment template
│
├── config/
│   ├── firebase.py         # Firebase initialization
│   └── settings.py         # App settings (Pydantic)
│
├── routes/
│   ├── auth.py             # Authentication endpoints
│   ├── ai.py               # AI service endpoints
│   ├── user_data.py        # User data CRUD
│   └── admin.py            # Admin panel endpoints
│
├── services/
│   ├── gemini_service.py   # Main service exports
│   ├── ai_common.py        # Shared AI utilities
│   ├── resume_service.py   # Resume analysis
│   ├── interview_service.py # Interview features
│   ├── career_service.py   # Career coach & roadmap
│   └── portfolio_service.py # Portfolio & skill gap
│
└── tests/
    ├── conftest.py         # Pytest fixtures
    ├── test_health.py      # Health endpoint tests
    ├── test_auth.py        # Auth tests
    └── test_ai_endpoints.py # AI endpoint tests
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_health.py -v

# Run tests matching a pattern
pytest -k "test_auth" -v
```

## 🚀 Deployment

### Render (Recommended)

1. Create new Web Service
2. Connect GitHub repo
3. Settings:
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables
5. Deploy

### Railway

1. Create new project from GitHub
2. Railway will auto-detect Python
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to Firebase JSON | ✅ |
| `GEMINI_API_KEY` | Gemini API key | ✅ |
| `PORT` | Server port (default: 8000) | ❌ |
| `DEBUG` | Debug mode (default: False) | ❌ |
| `FRONTEND_URL` | Frontend URL for CORS | ✅ |
| `ADMIN_EMAIL` | Admin login email | ✅ |
| `ADMIN_PASSWORD` | Admin login password | ✅ |
| `JWT_SECRET` | JWT signing secret (64+ chars) | ✅ |

## 📄 License

MIT

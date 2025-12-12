# 🚀 RoleReady - AI-Powered Career Toolkit

RoleReady is a comprehensive AI-powered career development platform that helps job seekers and professionals with resume analysis, interview preparation, portfolio generation, and career guidance.

![RoleReady](https://img.shields.io/badge/RoleReady-AI%20Career%20Toolkit-gradient?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-teal?style=flat-square&logo=fastapi)

## ✨ Features (7 Tools)

| Feature | Description |
|---------|-------------|
| **Resume Analyzer** | AI-powered resume scoring with actionable feedback |
| **Resume Builder** | Create ATS-optimized resumes with 6 professional templates |
| **Interview Prep** | Practice with real interview questions from top companies |
| **AI Career Coach** | Get personalized career advice through AI chat |
| **Portfolio Generator** | Generate a professional portfolio from your resume |
| **Skill Gap Analyzer** | Identify skills needed for your dream role |
| **Career Roadmap** | Get a personalized career development plan |

## 🏗️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development
- **Firebase Auth** for authentication
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **FastAPI** (Python) for API
- **Firebase Admin SDK** for auth verification
- **Google Gemini AI** for AI features
- **Firestore** for database
- **SlowAPI** for rate limiting

## 📂 Project Structure

```
roleready/
├── frontend/                 # React frontend
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page components
│   ├── services/            # API services
│   ├── styles/              # CSS stylesheets
│   ├── context/             # React context providers
│   └── firebase/            # Firebase config
│
├── backend/                  # FastAPI backend
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── config/              # Configuration
│   └── tests/               # API tests
│
├── .env.example             # Environment template
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.10+ (for backend)
- **Firebase Project** with Firestore enabled
- **Google Gemini API Key**

### 1️⃣ Clone & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/roleready.git
cd roleready

# Copy environment file
cp .env.example .env
```

### 2️⃣ Configure Environment

Edit `.env` file with your credentials:

```env
# Firebase (from Firebase Console)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config

# Backend
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-64-char-secret-key
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=your-secure-password
```

### 3️⃣ Start Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

### 4️⃣ Start Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## 🔐 Security Features

- ✅ Firebase Authentication
- ✅ JWT-based admin authentication
- ✅ Rate limiting on all AI endpoints
- ✅ Request size limiting (10MB max)
- ✅ Security headers (XSS, Clickjacking, HSTS)
- ✅ Sanitized error messages
- ✅ CORS configuration

## 📊 API Rate Limits

| Endpoint | Limit |
|----------|-------|
| Resume Analysis | 10/minute |
| Interview Questions | 20/minute |
| Career Coach | 30/minute |
| Portfolio Generation | 5/minute |
| Answer Evaluation | 5/minute |

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov=.  # With coverage
```

## 🚀 Deployment

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repo to Render/Railway
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect repo to Vercel/Netlify
3. Set `VITE_API_URL` to your backend URL
4. Deploy

## 📝 Environment Variables

See `.env.example` for all required environment variables.

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | ✅ |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `JWT_SECRET` | Admin JWT secret (64+ chars) | ✅ |
| `ADMIN_EMAIL` | Admin panel email | ✅ |
| `ADMIN_PASSWORD` | Admin panel password | ✅ |

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Made with ❤️ for job seekers everywhere

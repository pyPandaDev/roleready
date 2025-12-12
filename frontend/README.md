# RoleReady Frontend

React-based frontend for the RoleReady AI-powered career toolkit.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

App will be available at: `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## ⚙️ Environment Variables

Create `.env.local` file in the frontend directory:

```env
# Firebase Configuration (Required)
# Get these from Firebase Console > Project Settings
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Backend API URL
# Local: http://localhost:8000
# Production: https://your-backend-url.com
VITE_API_URL=http://localhost:8000
```

## 📂 Project Structure

```
frontend/
├── components/              # Reusable UI components
│   ├── Navbar.tsx          # Navigation bar
│   ├── AppHeader.tsx       # App header with user menu
│   ├── InputSection.tsx    # Resume input form
│   └── resume-builder/     # Resume builder components
│       └── templates/      # Resume templates (6 designs)
│
├── pages/                   # Page components
│   ├── LandingPage.tsx     # Public landing page
│   ├── HomePage.tsx        # User dashboard
│   ├── Dashboard.tsx       # Resume analysis results
│   ├── ResumeBuilder.tsx   # Resume builder tool
│   ├── InterviewPrep.tsx   # Interview preparation
│   ├── CareerCoachPage.tsx # AI career coach chat
│   ├── PortfolioGenerator.tsx  # Portfolio generator
│   ├── SkillGapAnalyzer.tsx    # Skill gap analysis
│   ├── CareerRoadmap.tsx   # Career roadmap generator
│   ├── LoginPage.tsx       # User login
│   ├── SignupPage.tsx      # User registration
│   ├── AdminLoginPage.tsx  # Admin login
│   └── AdminDashboard.tsx  # Admin panel
│
├── services/                # API services
│   ├── geminiService.ts    # AI API calls
│   └── dataService.ts      # User data API calls
│
├── context/                 # React context providers
│   ├── AuthContext.tsx     # Authentication state
│   └── ToastContext.tsx    # Toast notifications
│
├── styles/                  # CSS stylesheets
│   ├── global.css          # Global styles
│   ├── components/         # Component styles
│   └── pages/              # Page-specific styles
│
├── firebase/                # Firebase configuration
│   └── client.ts           # Firebase client init
│
├── App.tsx                  # Main app component
├── types.ts                 # TypeScript types
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript config
```

## 🎨 Features

| Feature | Description |
|---------|-------------|
| **Resume Analyzer** | Upload and analyze resume with AI |
| **Resume Builder** | Build professional resumes with templates |
| **Interview Prep** | Practice with curated questions |
| **Career Coach** | ChatGPT-style career advisor |
| **Portfolio Generator** | Generate portfolio from resume |
| **Skill Gap Analyzer** | Find missing skills for target role |
| **Career Roadmap** | Get personalized career plan |

## 🔑 Authentication

The app uses Firebase Authentication:
- Email/Password login
- Google Sign-in
- Protected routes for authenticated users

## 📱 Responsive Design

The app is fully responsive:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🧪 Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - All `VITE_*` variables
4. Deploy

### Netlify

1. Push code to GitHub
2. Import project in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set environment variables
6. Deploy

## 📝 Notes

- All `VITE_*` environment variables are exposed to the client
- Never put sensitive keys in frontend `.env` files
- Firebase config is safe to expose (protected by Firebase rules)

## 📄 License

MIT

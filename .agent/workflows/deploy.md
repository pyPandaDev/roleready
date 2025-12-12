---
description: Deploy RoleReady to Vercel (frontend) + Koyeb (backend)
---

# RoleReady Deployment Guide

## Prerequisites
- GitHub repo with code pushed
- Vercel account (free): https://vercel.com
- Koyeb account (free): https://koyeb.com
- Firebase credentials ready

---

## Step 1: Deploy Backend to Koyeb

### 1.1 Create Koyeb Account
1. Go to https://app.koyeb.com
2. Sign up with GitHub (recommended)

### 1.2 Create New Service
1. Click **"Create Service"**
2. Select **"GitHub"** as source
3. Connect your GitHub account if not already
4. Select your repo: `roleready` (or your repo name)
5. **Important**: Set the build context to `backend/`

### 1.3 Configure Build Settings
```
Build Type: Dockerfile
Dockerfile path: backend/Dockerfile
Working directory: backend
```

### 1.4 Set Environment Variables
Add these in Koyeb dashboard:
```
GEMINI_API_KEY=your_gemini_api_key
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your_random_secret_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_key_id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...your_key...\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

### 1.5 Deploy
1. Set instance to **Free (Nano)**
2. Port: **8000**
3. Click **Deploy**
4. Wait 2-3 minutes for build
5. Copy your backend URL: `https://your-app-name.koyeb.app`

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Import Project
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your `roleready` repo
4. Set **Root Directory** to `frontend`

### 2.2 Configure Build Settings
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 2.3 Set Environment Variables
```
VITE_API_URL=https://your-app-name.koyeb.app
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2.4 Deploy
1. Click **Deploy**
2. Wait 1-2 minutes
3. Your app is live at: `https://your-project.vercel.app`

---

## Step 3: Update Firebase (Important!)

### 3.1 Add Authorized Domains
1. Go to Firebase Console → Authentication → Settings
2. Add your domains:
   - `your-project.vercel.app`
   - `your-app-name.koyeb.app`

### 3.2 Update CORS (if needed)
Backend allows all origins by default, but verify in `main.py`

---

## Step 4: Test Your Deployment

1. Open `https://your-project.vercel.app`
2. Try logging in with Google
3. Test Resume Analyzer
4. Check Admin panel

---

## Troubleshooting

### Backend not responding?
- Check Koyeb logs in dashboard
- Verify environment variables are set correctly
- Make sure FIREBASE_PRIVATE_KEY has `\n` for newlines

### CORS errors?
- Verify backend URL in frontend env vars
- Check that domains are added to Firebase

### Login not working?
- Add Vercel domain to Firebase authorized domains
- Check browser console for errors

---

## URLs Summary
```
Frontend: https://your-project.vercel.app
Backend:  https://your-app-name.koyeb.app
API Docs: https://your-app-name.koyeb.app/docs
```

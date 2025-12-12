// Firebase configuration for frontend
// Replace with your Firebase project config

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Check if Firebase is properly configured
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

// Initialize Firebase only if configured
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} else {
    console.warn('Firebase not configured. Auth features will be disabled.');
}

export { auth, db };

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
    if (!auth) {
        console.warn('Firebase auth not configured');
        throw new Error('Firebase auth not configured');
    }
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
    }
};

export const logout = async () => {
    if (!auth) {
        console.warn('Firebase auth not configured');
        return;
    }
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

export const getCurrentUser = (): User | null => {
    return auth?.currentUser ?? null;
};

export const onAuthChange = (callback: (user: User | null) => void) => {
    if (!auth) {
        // Call callback with null user immediately if auth not configured
        callback(null);
        return () => { }; // Return empty unsubscribe function
    }
    return onAuthStateChanged(auth, callback);
};

// Get ID token for API calls
export const getIdToken = async (): Promise<string | null> => {
    const user = auth?.currentUser;
    if (user) {
        return await user.getIdToken();
    }
    return null;
};

export default app;

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    getIdToken
} from 'firebase/auth';
import { auth } from '../firebase/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
    loginWithEmail: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Optional: Sync with backend immediately on load or relying on token in requests
                // await syncUser(currentUser);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const syncUser = async (user: User) => {
        try {
            const token = await getIdToken(user);
            await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    display_name: user.displayName,
                    photo_url: user.photoURL
                })
            });
        } catch (error) {
            console.error("Backend Sync Error:", error);
        }
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await syncUser(result.user);
    };

    const registerWithEmail = async (name: string, email: string, pass: string) => {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(result.user, { displayName: name });
        await syncUser(result.user);
    };

    const loginWithEmail = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
        // Sync runs in onAuthStateChanged or we can run explicitly, run explicit for safety
        if (auth.currentUser) await syncUser(auth.currentUser);
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, registerWithEmail, loginWithEmail, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

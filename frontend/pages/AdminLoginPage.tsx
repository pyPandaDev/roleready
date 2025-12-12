import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import { adminLogin, isAdminLoggedIn } from '../services/adminService';
import { PageProps } from '../types';
import '../styles/pages/_admin.css';

const AdminLoginPage: React.FC<PageProps> = ({ setView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Redirect if already logged in
        if (isAdminLoggedIn()) {
            setView('admin-dashboard');
        }
    }, [setView]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await adminLogin(email, password);
            setView('admin-dashboard');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Invalid credentials';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page admin-login">
            {/* Animated Background */}
            <div className="admin-login-bg">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            {/* Grid Pattern */}
            <div className="admin-login-grid" />

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="admin-login-card"
            >
                {/* Shield Icon */}
                <motion.div
                    className="admin-shield"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
                >
                    <Shield />
                </motion.div>

                {/* Title */}
                <motion.h1
                    className="admin-login-title"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                >
                    Admin Portal
                </motion.h1>
                <motion.p
                    className="admin-login-subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                >
                    RoleReady Management Console
                </motion.p>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="admin-error"
                    >
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </motion.div>
                )}

                {/* Login Form */}
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                >
                    <div className="admin-form-group">
                        <label className="admin-label">Admin Email</label>
                        <div className="admin-input-wrapper">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@roleready.com"
                                required
                                className="admin-input"
                            />
                            <Mail className="admin-input-icon" size={18} />
                        </div>
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-label">Password</label>
                        <div className="admin-input-wrapper">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="admin-input"
                            />
                            <Lock className="admin-input-icon" size={18} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="admin-btn-primary"
                    >
                        {loading ? (
                            <>
                                <span className="admin-spinner" />
                                Authenticating...
                            </>
                        ) : (
                            <>
                                <Shield size={18} />
                                Access Admin Panel
                            </>
                        )}
                    </button>
                </motion.form>

                {/* Back Link */}
                <button
                    onClick={() => setView('home')}
                    className="admin-back-link"
                >
                    ← Back to RoleReady
                </button>

                {/* Security Notice */}
                <div className="admin-security-notice">
                    <Lock size={12} />
                    <span>Secure admin access. All actions are logged.</span>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLoginPage;

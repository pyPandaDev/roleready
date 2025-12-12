import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, LogOut, Users, FileText, Briefcase,
    BarChart3, Search, Trash2, X, ChevronRight,
    Eye, Globe, AlertTriangle, LucideIcon
} from 'lucide-react';
import {
    getAdminStats, getUsers, getUserDetails, deleteUser,
    clearAdminToken, isAdminLoggedIn, updateUserPlan
} from '../services/adminService';
import { PageProps } from '../types';
import '../styles/pages/_admin.css';

// Proper interfaces for admin data
interface AdminStats {
    total_users: number;
    total_resumes: number;
    total_analyses: number;
    total_jd_analyses: number;
    total_interviews: number;
    total_portfolios: number;
    users_by_plan: {
        free: number;
        pro: number;
        enterprise: number;
    };
}

interface AdminUser {
    uid: string;
    email: string;
    display_name?: string;
    photo_url?: string;
    plan?: string;
    created_at?: string;
    resumes?: Array<{ title?: string; name?: string }>;
    analyses?: Array<{ targetRole?: string }>;
    jd_analyses?: Array<{ jobTitle?: string }>;
    interviews?: Array<{ role?: string }>;
    portfolios?: Array<{ name?: string }>;
    [key: string]: unknown;
}

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: number | undefined;
    color: string;
    bgColor: string;
    delay?: number;
}

const AdminDashboard: React.FC<PageProps> = ({ setView }) => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!isAdminLoggedIn()) {
            setView('admin-login');
            return;
        }
        loadData();
    }, [setView]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsData, usersData] = await Promise.all([
                getAdminStats(),
                getUsers()
            ]);
            setStats(statsData);
            setUsers(usersData.users);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (errorMessage === 'Session expired') {
                setView('admin-login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            const data = await getUsers(searchQuery);
            setUsers(data.users);
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const handleViewUser = async (uid: string) => {
        try {
            setActionLoading(true);
            const data = await getUserDetails(uid);
            setSelectedUser(data);
        } catch (error) {
            console.error('Failed to load user:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (uid: string) => {
        try {
            setActionLoading(true);
            await deleteUser(uid);
            setUsers(users.filter(u => u.uid !== uid));
            setShowDeleteConfirm(null);
            if (stats) {
                setStats({ ...stats, total_users: stats.total_users - 1 });
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogout = () => {
        clearAdminToken();
        setView('home');
    };

    const handlePlanChange = async (uid: string, newPlan: string) => {
        try {
            setActionLoading(true);
            await updateUserPlan(uid, newPlan);
            // Update local state
            setUsers(users.map(u => u.uid === uid ? { ...u, plan: newPlan } : u));
            if (selectedUser && selectedUser.uid === uid) {
                setSelectedUser({ ...selectedUser, plan: newPlan });
            }
            // Refresh stats to update plan counts
            const statsData = await getAdminStats();
            setStats(statsData);
        } catch (error) {
            console.error('Failed to update plan:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, bgColor, delay = 0 }) => (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1, duration: 0.4 }}
            className="admin-stat-card"
            style={{ '--card-accent': color } as React.CSSProperties}
        >
            <div className="admin-stat-icon" style={{ background: bgColor, color }}>
                <Icon />
            </div>
            <p className="admin-stat-label">{label}</p>
            <p className="admin-stat-value">{value?.toLocaleString() || 0}</p>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="admin-page admin-loading">
                <div className="admin-loading-spinner" />
                <p className="admin-loading-text">Loading admin panel...</p>
            </div>
        );
    }

    return (
        <div className="admin-page admin-dashboard">
            {/* Header */}
            <header className="admin-header">
                <div className="admin-header-inner">
                    <div className="admin-header-left">
                        <div className="admin-logo">
                            <Shield />
                        </div>
                        <div className="admin-title-block">
                            <h1>RoleReady Admin</h1>
                            <p>Management Console</p>
                        </div>
                        <div className="admin-status">
                            <span className="admin-status-dot" />
                            Live
                        </div>
                    </div>
                    <button onClick={handleLogout} className="admin-logout-btn">
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </header>

            <main className="admin-content">
                {/* Stats Grid */}
                <section style={{ marginBottom: '2rem' }}>
                    <div className="admin-section-header">
                        <h2 className="admin-section-title">Platform Statistics</h2>
                    </div>
                    <div className="admin-stats-grid">
                        <StatCard
                            icon={Users}
                            label="Total Users"
                            value={stats?.total_users}
                            color="#3b82f6"
                            bgColor="rgba(59, 130, 246, 0.15)"
                            delay={0}
                        />
                        <StatCard
                            icon={FileText}
                            label="Resumes"
                            value={stats?.total_resumes}
                            color="#10b981"
                            bgColor="rgba(16, 185, 129, 0.15)"
                            delay={1}
                        />
                        <StatCard
                            icon={BarChart3}
                            label="Analyses"
                            value={stats?.total_analyses}
                            color="#a855f7"
                            bgColor="rgba(168, 85, 247, 0.15)"
                            delay={2}
                        />
                        <StatCard
                            icon={Briefcase}
                            label="Interviews"
                            value={stats?.total_interviews}
                            color="#f59e0b"
                            bgColor="rgba(245, 158, 11, 0.15)"
                            delay={3}
                        />
                        <StatCard
                            icon={FileText}
                            label="JD Analyses"
                            value={stats?.total_jd_analyses}
                            color="#ec4899"
                            bgColor="rgba(236, 72, 153, 0.15)"
                            delay={4}
                        />
                        <StatCard
                            icon={Globe}
                            label="Portfolios"
                            value={stats?.total_portfolios}
                            color="#14b8a6"
                            bgColor="rgba(20, 184, 166, 0.15)"
                            delay={5}
                        />
                    </div>

                    {/* Plan Distribution */}
                    <motion.div
                        className="admin-plan-grid"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                    >
                        <div className="admin-plan-card">
                            <p className="admin-plan-value" style={{ color: '#94a3b8' }}>
                                {stats?.users_by_plan?.free || 0}
                            </p>
                            <p className="admin-plan-label">Free Plan</p>
                        </div>
                        <div className="admin-plan-card">
                            <p className="admin-plan-value" style={{ color: '#3b82f6' }}>
                                {stats?.users_by_plan?.pro || 0}
                            </p>
                            <p className="admin-plan-label">Pro Plan</p>
                        </div>
                        <div className="admin-plan-card">
                            <p className="admin-plan-value" style={{ color: '#f59e0b' }}>
                                {stats?.users_by_plan?.enterprise || 0}
                            </p>
                            <p className="admin-plan-label">Enterprise</p>
                        </div>
                    </motion.div>
                </section>

                {/* Users Section */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                >
                    <div className="admin-section-header">
                        <h2 className="admin-section-title">Users</h2>
                        <div className="admin-search-bar">
                            <div className="admin-search-wrapper">
                                <Search className="admin-search-icon" size={16} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search by email or name..."
                                    className="admin-search-input"
                                />
                            </div>
                            <button onClick={handleSearch} className="admin-search-btn">
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Plan</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.uid}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <div className="admin-user-avatar">
                                                    {user.photo_url ? (
                                                        <img src={user.photo_url} alt="" />
                                                    ) : (
                                                        (user.display_name || user.email || '?')[0].toUpperCase()
                                                    )}
                                                </div>
                                                <span className="admin-user-name">
                                                    {user.display_name || 'No name'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="admin-user-email">{user.email}</td>
                                        <td>
                                            <span className={`admin-plan-badge ${user.plan || 'free'}`}>
                                                {user.plan || 'free'}
                                            </span>
                                        </td>
                                        <td className="admin-date">
                                            {user.created_at
                                                ? new Date(user.created_at).toLocaleDateString()
                                                : '-'}
                                        </td>
                                        <td>
                                            <div className="admin-actions">
                                                <button
                                                    onClick={() => handleViewUser(user.uid)}
                                                    className="admin-action-btn"
                                                    title="View Details"
                                                >
                                                    <Eye />
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(user.uid)}
                                                    className="admin-action-btn danger"
                                                    title="Delete User"
                                                >
                                                    <Trash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && (
                            <div className="admin-empty-state">
                                No users found
                            </div>
                        )}
                    </div>
                </motion.section>
            </main>

            {/* User Details Drawer */}
            <AnimatePresence>
                {selectedUser && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="admin-modal-overlay"
                            onClick={() => setSelectedUser(null)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="admin-drawer"
                        >
                            {/* Drawer Header */}
                            <div className="admin-drawer-header">
                                <div className="admin-drawer-user">
                                    <div className="admin-drawer-avatar">
                                        {selectedUser.photo_url ? (
                                            <img src={selectedUser.photo_url} alt="" />
                                        ) : (
                                            (selectedUser.display_name || selectedUser.email || '?')[0].toUpperCase()
                                        )}
                                    </div>
                                    <div className="admin-drawer-info">
                                        <h3>{selectedUser.display_name || 'No name'}</h3>
                                        <p>{selectedUser.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="admin-drawer-close"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Drawer Body */}
                            <div className="admin-drawer-body">
                                {/* User Info */}
                                <div className="admin-info-grid">
                                    <div className="admin-info-card">
                                        <p className="admin-info-label">Plan</p>
                                        <select
                                            value={selectedUser.plan || 'free'}
                                            onChange={(e) => handlePlanChange(selectedUser.uid, e.target.value)}
                                            disabled={actionLoading}
                                            className="admin-plan-select"
                                        >
                                            <option value="free">Free</option>
                                            <option value="pro">Pro</option>
                                            <option value="enterprise">Enterprise</option>
                                        </select>
                                    </div>
                                    <div className="admin-info-card">
                                        <p className="admin-info-label">UID</p>
                                        <p className="admin-info-value mono">{selectedUser.uid}</p>
                                    </div>
                                </div>

                                {/* Collections */}
                                {[
                                    { key: 'resumes', label: 'Resumes', icon: FileText },
                                    { key: 'analyses', label: 'Resume Analyses', icon: BarChart3 },
                                    { key: 'jd_analyses', label: 'JD Analyses', icon: FileText },
                                    { key: 'interviews', label: 'Interviews', icon: Briefcase },
                                    { key: 'portfolios', label: 'Portfolios', icon: Globe },
                                ].map(({ key, label, icon: Icon }) => (
                                    <div key={key} className="admin-collection">
                                        <div className="admin-collection-header">
                                            <span className="admin-collection-title">
                                                <Icon />
                                                {label}
                                            </span>
                                            <span className="admin-collection-count">
                                                {(selectedUser[key as keyof AdminUser] as Array<unknown>)?.length || 0} items
                                            </span>
                                        </div>
                                        {((selectedUser[key as keyof AdminUser] as Array<unknown>)?.length ?? 0) > 0 && (
                                            <div className="admin-collection-items">
                                                {(selectedUser[key as keyof AdminUser] as Array<Record<string, string>>).slice(0, 5).map((item, i: number) => (
                                                    <div key={i} className="admin-collection-item">
                                                        <ChevronRight />
                                                        {item.title || item.name || item.targetRole || item.role || item.jobTitle || item.subject || 'Untitled'}
                                                    </div>
                                                ))}
                                                {(selectedUser[key as keyof AdminUser] as Array<unknown>).length > 5 && (
                                                    <p className="admin-collection-more">
                                                        + {(selectedUser[key as keyof AdminUser] as Array<unknown>).length - 5} more
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="admin-modal-overlay"
                        onClick={() => setShowDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="admin-confirm-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="admin-confirm-header">
                                <div className="admin-confirm-icon">
                                    <AlertTriangle />
                                </div>
                                <div>
                                    <h3 className="admin-confirm-title">Delete User</h3>
                                    <p className="admin-confirm-subtitle">This action cannot be undone</p>
                                </div>
                            </div>
                            <p className="admin-confirm-text">
                                Are you sure you want to delete this user? All their data including
                                resumes, analyses, and interviews will be permanently removed.
                            </p>
                            <div className="admin-confirm-actions">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="admin-btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(showDeleteConfirm)}
                                    disabled={actionLoading}
                                    className="admin-btn-danger"
                                >
                                    {actionLoading ? (
                                        <span className="admin-spinner" />
                                    ) : (
                                        <>
                                            <Trash2 size={16} />
                                            Delete User
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LayoutDashboard, CreditCard, Moon, Sun, Settings, LogOut, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface AppHeaderProps {
    setView: (view: string) => void;
    darkMode: boolean;
    setDarkMode: (mode: boolean) => void;
    currentView?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ setView, darkMode, setDarkMode, currentView }) => {
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between"
        >
            {/* Logo & Name - LEFT */}
            <button
                onClick={() => setView('home')}
                className="flex items-center gap-3 group"
            >
                <div className="w-11 h-11 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                    <span className="text-white dark:text-black font-black text-lg">R</span>
                </div>
                <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    RoleReady
                </span>
            </button>

            {/* Profile Dropdown - RIGHT */}
            {user && (
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 bg-white dark:bg-zinc-800 rounded-full border-2 border-slate-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow-md"
                    >
                        {/* Avatar with gradient - visible in both themes */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <ChevronDown className={cn(
                            "w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform",
                            isProfileOpen && "rotate-180"
                        )} />
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsProfileOpen(false)}
                                />

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-2 z-50"
                                >
                                    {/* Profile Info */}
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 mb-2">
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-base font-bold">
                                                {user.email?.[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">{user.email}</p>
                                                <p className="text-xs text-slate-500">{(user as any).plan || 'Free Plan'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Navigation */}
                                    <div className="space-y-1 mb-2">
                                        <button
                                            onClick={() => { setView('home'); setIsProfileOpen(false); }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors",
                                                currentView === 'home'
                                                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium"
                                                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                                            )}
                                        >
                                            <Home className="w-4 h-4" /> Dashboard
                                        </button>
                                        <button
                                            onClick={() => { setView('pricing'); setIsProfileOpen(false); }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors",
                                                currentView === 'pricing'
                                                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium"
                                                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                                            )}
                                        >
                                            <CreditCard className="w-4 h-4" /> Pricing
                                        </button>
                                    </div>

                                    {/* Theme Toggle */}
                                    <div className="border-t border-slate-100 dark:border-zinc-800 pt-2 mb-2">
                                        <button
                                            onClick={toggleDarkMode}
                                            className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                        >
                                            <span className="flex items-center gap-3">
                                                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                                {darkMode ? 'Light Mode' : 'Dark Mode'}
                                            </span>
                                            <div className={cn(
                                                "w-10 h-5 rounded-full relative transition-colors",
                                                darkMode ? "bg-indigo-500" : "bg-slate-300"
                                            )}>
                                                <div className={cn(
                                                    "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                                                    darkMode ? "left-5" : "left-0.5"
                                                )} />
                                            </div>
                                        </button>
                                    </div>

                                    {/* Settings & Logout */}
                                    <div className="border-t border-slate-100 dark:border-zinc-800 pt-2 space-y-1">
                                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                                            <Settings className="w-4 h-4" /> Settings
                                        </button>
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.header>
    );
};

export default AppHeader;

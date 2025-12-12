import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Menu, X, ChevronDown, LogOut, Settings, CreditCard, LayoutDashboard, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
    darkMode: boolean;
    setDarkMode: (mode: boolean) => void;
    setView: (view: any) => void;
    view: string;
    result?: any;
    onExportPDF?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode, setView, view, result, onExportPDF }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const { user, logout } = useAuth();

    // Auto-close menus on view change
    React.useEffect(() => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
    }, [view]);

    const navItems = [
        { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'pricing', label: 'Pricing', icon: CreditCard },
    ];

    const toggleDarkMode = () => setDarkMode(!darkMode);

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-6 left-0 right-0 z-50 px-4 pointer-events-none"
        >
            <div className="max-w-6xl mx-auto pointer-events-auto">
                <div className="flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-black/70 backdrop-blur-xl rounded-full border border-slate-200/50 dark:border-white/10 shadow-xl shadow-black/5 ring-1 ring-black/5">

                    {/* Logo */}
                    <button
                        onClick={() => setView('landing')}
                        className="flex items-center gap-2 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center group-hover:scale-105 transition-transform">
                            <span className="text-white dark:text-black font-bold text-sm">R</span>
                        </div>
                        <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:opacity-80 transition-opacity">
                            RoleReady
                        </span>
                    </button>

                    {/* Desktop Navigation - Clean: Only Profile Dropdown */}
                    <div className="hidden md:flex items-center gap-2">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 pl-2 pr-1 py-1 bg-white dark:bg-zinc-800 rounded-full border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white dark:ring-zinc-900">
                                        {user.email?.[0].toUpperCase()}
                                    </div>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isProfileOpen && "rotate-180")} />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="absolute right-0 top-full mt-4 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 p-2 overflow-hidden"
                                        >
                                            {/* Profile Info */}
                                            <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 mb-2">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.email}</p>
                                                <p className="text-xs text-slate-500 capitalize">{(user as any).plan || 'Free Plan'}</p>
                                            </div>

                                            {/* Navigation Items */}
                                            <div className="space-y-1 mb-2">
                                                {navItems.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => { setView(item.id); setIsProfileOpen(false); }}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
                                                            view === item.id
                                                                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium"
                                                                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                                                        )}
                                                    >
                                                        <item.icon className="w-4 h-4" />
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Theme Toggle */}
                                            <div className="border-t border-slate-100 dark:border-zinc-800 pt-2 mb-2">
                                                <button
                                                    onClick={toggleDarkMode}
                                                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                                >
                                                    <span className="flex items-center gap-3">
                                                        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                                                    </span>
                                                    <div className={cn(
                                                        "w-9 h-5 rounded-full relative transition-colors",
                                                        darkMode ? "bg-indigo-500" : "bg-slate-200 dark:bg-zinc-700"
                                                    )}>
                                                        <div className={cn(
                                                            "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all",
                                                            darkMode ? "left-4" : "left-0.5"
                                                        )} />
                                                    </div>
                                                </button>
                                            </div>

                                            {/* Settings & Logout */}
                                            <div className="border-t border-slate-100 dark:border-zinc-800 pt-2 space-y-1">
                                                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                                    <Settings className="w-4 h-4" /> Settings
                                                </button>
                                                <button
                                                    onClick={logout}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" /> Sign Out
                                                </button>
                                            </div>

                                            {/* Export Button when on analyze page */}
                                            {result && view === 'analyze' && onExportPDF && (
                                                <div className="border-t border-slate-100 dark:border-zinc-800 pt-2 mt-2">
                                                    <button
                                                        onClick={onExportPDF}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors font-medium"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Export PDF
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setView('login')}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => setView('signup')}
                                    className="px-5 py-2.5 text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10"
                                >
                                    Get Started
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-x-4 top-24 pointer-events-auto md:hidden"
                    >
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-zinc-800">
                            {user ? (
                                <div className="space-y-2">
                                    <div className="px-4 py-2 bg-slate-50 dark:bg-zinc-800/50 rounded-xl mb-4">
                                        <div className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</div>
                                        <div className="text-xs text-slate-500">Free Plan</div>
                                    </div>
                                    {navItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setView(item.id)}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-left"
                                        >
                                            <item.icon className="w-5 h-5 text-slate-400" />
                                            <span className="font-medium text-slate-700 dark:text-zinc-200">{item.label}</span>
                                        </button>
                                    ))}
                                    <div className="h-px bg-slate-100 dark:bg-zinc-800 my-2" />
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 transition-colors text-left"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-medium">Sign Out</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 p-2">
                                    <button
                                        onClick={() => setView('login')}
                                        className="w-full py-4 rounded-xl text-slate-600 dark:text-zinc-400 font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => setView('signup')}
                                        className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold shadow-lg"
                                    >
                                        Sign Up Free
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;

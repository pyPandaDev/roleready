import React from 'react';
import {
    FileSearch, PenTool, Mic2, Sparkles, ArrowRight, Zap, Globe, Map,
    TrendingUp, Target, Users, Star, ChevronRight
} from 'lucide-react';

interface HomePageProps {
    setView: (view: 'landing' | 'home' | 'analyze' | 'builder' | 'pricing' | 'interview' | 'portfolio' | 'coach' | 'skillgap' | 'roadmap') => void;
    darkMode?: boolean;
    setDarkMode?: (mode: boolean) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setView }) => {
    return (
        <div className="notion-home">
            {/* Welcome Header */}
            <div className="notion-welcome">
                <div className="welcome-emoji">👋</div>
                <div>
                    <h1 className="welcome-title">Your Career Command Center</h1>
                    <p className="welcome-subtitle">Everything you need to land your dream role, in one place.</p>
                </div>
            </div>

            {/* Main Bento Grid */}
            <div className="notion-grid">

                {/* Hero Card - Resume Analyzer */}
                <div className="notion-card notion-hero" onClick={() => setView('analyze')}>
                    <div className="notion-hero-inner">
                        <div className="hero-left">
                            <div className="notion-emoji-lg">🎯</div>
                            <div className="notion-badge notion-badge-green">
                                <Zap size={12} /> Most Popular
                            </div>
                            <h2 className="notion-hero-title">Resume Analyzer</h2>
                            <p className="notion-hero-desc">
                                Get a ruthless 360° critique, ATS compatibility score, and personalized improvement roadmap.
                            </p>
                            <div className="hero-stats">
                                <div className="stat-item">
                                    <Sparkles size={14} />
                                    <span>AI-Powered</span>
                                </div>
                                <div className="stat-item">
                                    <TrendingUp size={14} />
                                    <span>ATS Ready</span>
                                </div>
                            </div>
                        </div>
                        <button className="notion-cta-btn">
                            Analyze Resume <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Resume Builder */}
                <div className="notion-card notion-tall" onClick={() => setView('builder')}>
                    <div className="notion-emoji">📝</div>
                    <div className="notion-badge notion-badge-blue">New</div>
                    <h3 className="notion-card-title">Resume Builder</h3>
                    <p className="notion-card-desc">
                        Create a FAANG-ready resume with AI assistance. Multiple templates included.
                    </p>
                    <div className="notion-card-footer">
                        <span className="notion-link">Start building <ChevronRight size={14} /></span>
                    </div>
                </div>

                {/* Interview Prep */}
                <div className="notion-card" onClick={() => setView('interview')}>
                    <div className="notion-emoji">🎤</div>
                    <div className="notion-badge notion-badge-purple">Popular</div>
                    <h3 className="notion-card-title">Interview Prep</h3>
                    <p className="notion-card-desc">
                        Practice with AI-powered mock interviews tailored to your role.
                    </p>
                </div>

                {/* Skill Gap Analyzer */}
                <div className="notion-card" onClick={() => setView('skillgap')}>
                    <div className="notion-emoji">📊</div>
                    <div className="notion-badge notion-badge-pink">Beta</div>
                    <h3 className="notion-card-title">Skill Gap Analyzer</h3>
                    <p className="notion-card-desc">
                        Identify missing skills and get a personalized learning path.
                    </p>
                </div>

                {/* AI Career Coach */}
                <div className="notion-card" onClick={() => setView('coach')}>
                    <div className="notion-emoji">✨</div>
                    <div className="notion-badge notion-badge-orange">AI</div>
                    <h3 className="notion-card-title">AI Career Coach</h3>
                    <p className="notion-card-desc">
                        Get personalized career advice and strategic guidance.
                    </p>
                </div>

                {/* Portfolio Generator */}
                <div className="notion-card" onClick={() => setView('portfolio')}>
                    <div className="notion-emoji">🌐</div>
                    <div className="notion-badge notion-badge-teal">New</div>
                    <h3 className="notion-card-title">Portfolio Generator</h3>
                    <p className="notion-card-desc">
                        Turn your resume into a stunning portfolio website instantly.
                    </p>
                </div>

                {/* Career Roadmap - Full Width */}
                <div className="notion-card notion-wide" onClick={() => setView('roadmap')}>
                    <div className="notion-wide-content">
                        <div className="notion-emoji">🗺️</div>
                        <div className="notion-wide-text">
                            <h3 className="notion-card-title">Career Roadmap</h3>
                            <p className="notion-card-desc">AI-powered personalized career growth plan with milestones & learning paths.</p>
                        </div>
                        <button className="notion-outline-btn">
                            <Map size={16} /> Plan My Career
                        </button>
                    </div>
                </div>

            </div>

            {/* Feature Highlights */}
            <div className="notion-stats-bar">
                <div className="notion-stat">
                    <span className="stat-number">🤖</span>
                    <span className="stat-label">AI-Powered</span>
                </div>
                <div className="notion-stat">
                    <span className="stat-number">7</span>
                    <span className="stat-label">Career Tools</span>
                </div>
                <div className="notion-stat">
                    <span className="stat-number">🆓</span>
                    <span className="stat-label">Free to Start</span>
                </div>
                <div className="notion-stat">
                    <span className="stat-number">⚡</span>
                    <span className="stat-label">Instant Results</span>
                </div>
            </div>
        </div>
    );
};

export default HomePage;

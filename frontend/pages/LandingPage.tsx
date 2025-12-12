import React, { useState } from 'react';
import { ArrowRight, Sparkles, FileText, Zap, Target, TrendingUp, CheckCircle, Menu, X } from 'lucide-react';
import { PageProps } from '../types';

interface LandingPageProps {
    setView: (view: any) => void;
    handleFillSample: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setView, handleFillSample }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="landing-page">
            {/* Header */}
            <header className="landing-header">
                <div className="header-container">
                    <button onClick={() => setView('landing')} className="logo-link">
                        <div className="logo-icon-modern">R</div>
                        <span className="logo-text">RoleReady</span>
                    </button>

                    <div className="header-actions">
                        <button onClick={() => setView('login')} className="btn btn-outline">Login</button>
                        <button onClick={() => setView('signup')} className="btn btn-primary">Get Started</button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="btn btn-outline"
                            style={{ padding: '0.5rem', display: 'none' }} // Visible on mobile via CSS if needed
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
                {/* Simple Mobile Menu */}
                {mobileMenuOpen && (
                    <div style={{
                        position: 'absolute', top: '80px', left: 0, right: 0,
                        backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)',
                        padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem'
                    }}>
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#pricing" className="nav-link">Pricing</a>
                        <button onClick={() => setView('login')} className="btn btn-outline text-center">Login</button>
                        <button onClick={() => setView('signup')} className="btn btn-primary text-center">Get Started</button>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Career growth, <br />
                        <span className="hero-title-highlight">on autopilot.</span>
                    </h1>

                    <p className="hero-description">
                        The all-in-one AI platform that builds your resume, optimizes for ATS, and preps you for interviews.
                        No generic advice. Just results.
                    </p>

                    <div className="hero-buttons">
                        <button onClick={() => setView('signup')} className="btn-hero-primary">
                            Start Building Free <ArrowRight size={20} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '5px' }} />
                        </button>

                        <button onClick={handleFillSample} className="btn-hero-secondary">
                            View Demo <Zap size={16} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="section-header">
                    <h2 className="section-title">Power-packed features.<br /><span style={{ color: 'var(--color-text-muted)' }}>Zero fluff.</span></h2>
                </div>

                <div className="features-grid">
                    <div className="bento-card bento-card-large">
                        <div className="icon-box" style={{ color: 'var(--color-primary)' }}>
                            <FileText size={24} />
                        </div>
                        <h3 className="card-title">Resume AI Architect</h3>
                        <p className="card-desc">Analyzes every bullet point, keyword, and structure to build a resume that actually parses.</p>
                    </div>

                    <div className="bento-card" style={{ backgroundColor: '#0f172a', color: 'white' }}>
                        <div className="icon-box" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fbbf24' }}>
                            <Zap size={24} />
                        </div>
                        <h3 className="card-title">Instant ATS Check</h3>
                        <p className="card-desc" style={{ color: '#94a3b8' }}>Real-time simulation of top applicant tracking systems.</p>
                    </div>

                    <div className="bento-card">
                        <div className="icon-box" style={{ color: '#9333ea' }}>
                            <Target size={24} />
                        </div>
                        <h3 className="card-title">Interview Simulator</h3>
                        <p className="card-desc">Voice-enabled AI mock interviews tailored to your target role.</p>
                    </div>

                    <div className="bento-card">
                        <div className="icon-box" style={{ color: '#db2777' }}>
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="card-title">Market Insights</h3>
                        <p className="card-desc">Real-time salary data and skill gap analysis for your industry.</p>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-section">
                <div className="section-header">
                    <h2 className="section-title">Simple, transparent pricing</h2>
                    <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)' }}>Start free and upgrade when you're ready.</p>
                </div>

                <div className="pricing-grid">
                    {/* Free */}
                    <div className="pricing-card">
                        <h3 className="card-title">Free</h3>
                        <div className="price">$0<span>/month</span></div>
                        <p className="card-desc" style={{ marginBottom: '2rem' }}>Perfect for getting started</p>

                        <ul className="feature-list">
                            <li className="feature-item"><CheckCircle size={16} /> 3 Resume analyses/month</li>
                            <li className="feature-item"><CheckCircle size={16} /> Basic ATS score</li>
                            <li className="feature-item"><CheckCircle size={16} /> Skills gap analysis</li>
                        </ul>

                        <button onClick={() => setView('signup')} className="btn btn-outline w-full" style={{ width: '100%' }}>Get Started Free</button>
                    </div>

                    {/* Pro */}
                    <div className="pricing-card featured">
                        <h3 className="card-title">Pro</h3>
                        <div className="price">$5<span>/month</span></div>
                        <p className="card-desc" style={{ marginBottom: '2rem', color: 'rgba(255,255,255,0.7)' }}>For active job seekers</p>

                        <ul className="feature-list">
                            <li className="feature-item"><CheckCircle size={16} /> Unlimited analyses</li>
                            <li className="feature-item"><CheckCircle size={16} /> Advanced ATS optimization</li>
                            <li className="feature-item"><CheckCircle size={16} /> AI-powered improvements</li>
                            <li className="feature-item"><CheckCircle size={16} /> Priority support</li>
                        </ul>

                        <button onClick={() => setView('signup')} className="btn btn-primary w-full" style={{ width: '100%', backgroundColor: 'white', color: 'black' }}>Start 7-Day Trial</button>
                    </div>

                    {/* Enterprise */}
                    <div className="pricing-card">
                        <h3 className="card-title">Enterprise</h3>
                        <div className="price">Let's Talk<span></span></div>
                        <p className="card-desc" style={{ marginBottom: '2rem' }}>Custom pricing for teams</p>

                        <ul className="feature-list">
                            <li className="feature-item"><CheckCircle size={16} /> Everything in Pro</li>
                            <li className="feature-item"><CheckCircle size={16} /> Team dashboard</li>
                            <li className="feature-item"><CheckCircle size={16} /> API access</li>
                        </ul>

                        <button onClick={() => setView('signup')} className="btn btn-outline w-full" style={{ width: '100%' }}>Contact Sales</button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div className="logo-icon" style={{ width: '24px', height: '24px', fontSize: '0.875rem' }}>R</div>
                    <span style={{ fontWeight: 'bold' }}>RoleReady</span>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>&copy; 2025 RoleReady Inc.</p>
            </footer>
        </div>
    );
};

export default LandingPage;

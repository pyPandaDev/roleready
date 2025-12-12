import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface PricingPageProps {
    setView: (view: 'landing' | 'home' | 'analyze' | 'builder' | 'pricing') => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ setView }) => {
    const toast = useToast();

    const handleFreePlan = () => {
        setView('home');
    };

    const handleProPlan = () => {
        toast.info('Pro plan coming soon! You\'ll be redirected to checkout.');
    };

    const handleEnterprise = () => {
        toast.info('Contact us at enterprise@roleready.com for custom pricing.');
    };

    return (
        <section className="pricing-section">
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
                        <li className="feature-item"><CheckCircle size={16} /> 1 Resume template</li>
                        <li className="feature-item"><CheckCircle size={16} /> Community support</li>
                    </ul>

                    <button onClick={handleFreePlan} className="btn btn-outline w-full" style={{ width: '100%' }}>Get Started Free</button>
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
                        <li className="feature-item"><CheckCircle size={16} /> All resume templates</li>
                        <li className="feature-item"><CheckCircle size={16} /> Learning roadmap</li>
                        <li className="feature-item"><CheckCircle size={16} /> Priority support</li>
                    </ul>

                    <button onClick={handleProPlan} className="btn btn-primary w-full" style={{ width: '100%', backgroundColor: 'white', color: 'black' }}>Start 7-Day Trial</button>
                </div>

                {/* Enterprise */}
                <div className="pricing-card">
                    <h3 className="card-title">Enterprise</h3>
                    <div className="price">Let's Talk<span></span></div>
                    <p className="card-desc" style={{ marginBottom: '2rem' }}>Custom pricing for teams</p>

                    <ul className="feature-list">
                        <li className="feature-item"><CheckCircle size={16} /> Everything in Pro</li>
                        <li className="feature-item"><CheckCircle size={16} /> Team dashboard</li>
                        <li className="feature-item"><CheckCircle size={16} /> Bulk resume processing</li>
                        <li className="feature-item"><CheckCircle size={16} /> API access</li>
                        <li className="feature-item"><CheckCircle size={16} /> Dedicated support</li>
                    </ul>

                    <button onClick={handleEnterprise} className="btn btn-outline w-full" style={{ width: '100%' }}>Contact Sales</button>
                </div>
            </div>

            <p style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                All plans include a 7-day free trial. No credit card required to start.
            </p>
        </section>
    );
};

export default PricingPage;

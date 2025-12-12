import React, { useState, useRef } from 'react';
import {
    Target, FileUp, TrendingUp, BookOpen, CheckCircle,
    Circle, Loader2, Sparkles, ExternalLink, Clock
} from 'lucide-react';
import { analyzeSkillGap } from '../services/geminiService';
import { useToast } from '../context/ToastContext';

interface SkillGapAnalyzerProps {
    setView: (view: string) => void;
}

interface SkillGapResult {
    matchPercentage: number;
    skillsYouHave: { skill: string; level: string }[];
    skillsMissing: { skill: string; priority: string; timeToLearn: string }[];
    actionPlan: { phase: string; duration: string; tasks: string[] }[];
    recommendedResources: { name: string; type: string; url?: string }[];
}

const SkillGapAnalyzer: React.FC<SkillGapAnalyzerProps> = ({ setView }) => {
    const [dreamRole, setDreamRole] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<SkillGapResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        setResumeText(text);
        toast.success('Resume loaded!');
    };

    const handleAnalyze = async () => {
        if (!dreamRole.trim() || !resumeText.trim()) {
            toast.warning('Please fill in both fields');
            return;
        }

        setIsAnalyzing(true);
        try {
            const result = await analyzeSkillGap(resumeText, dreamRole);
            setResults(result);
            toast.success('Analysis complete!');
        } catch (error) {
            console.error(error);
            toast.error('Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'var(--color-error)';
            case 'medium': return 'var(--color-warning)';
            default: return 'var(--color-success)';
        }
    };

    return (
        <div className="coach-container">
            <div className="coach-main" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div className="coach-header">
                    <div className="coach-title-row">
                        <div className="coach-icon" style={{ background: 'var(--color-warning)' }}>
                            <Target size={24} />
                        </div>
                        <div>
                            <h1 className="coach-title">Skill Gap Analyzer</h1>
                            <p className="coach-subtitle">Identify skills needed for your dream role</p>
                        </div>
                    </div>
                </div>

                {!results ? (
                    <div className="tool-setup-section">
                        {/* Dream Role Input */}
                        <div className="input-card">
                            <h3>🎯 Your Dream Role</h3>
                            <input
                                type="text"
                                value={dreamRole}
                                onChange={(e) => setDreamRole(e.target.value)}
                                placeholder="e.g., Senior Data Scientist at Google"
                                className="role-input"
                            />
                        </div>

                        {/* Resume Input */}
                        <div className="input-card">
                            <h3>📄 Your Resume</h3>
                            <textarea
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                placeholder="Paste your resume text here..."
                                className="resume-textarea"
                                rows={8}
                            />
                            <div className="upload-row">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".txt"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    className="btn-secondary"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <FileUp size={16} /> Upload File
                                </button>
                            </div>
                        </div>

                        {/* Analyze Button */}
                        <button
                            className="btn-primary btn-large"
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !dreamRole.trim() || !resumeText.trim()}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 size={20} className="spin" /> Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} /> Analyze Skill Gap
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="skillgap-results">
                        {/* Back Button */}
                        <button className="btn-secondary mb-4" onClick={() => setResults(null)}>
                            ← Analyze Another Role
                        </button>

                        {/* Match Score */}
                        <div className="match-score-card">
                            <div className="score-circle" style={{
                                background: `conic-gradient(var(--color-primary) ${results.matchPercentage}%, var(--color-border) 0)`
                            }}>
                                <div className="score-inner">
                                    <span className="score-value">{results.matchPercentage}%</span>
                                    <span className="score-label">Match</span>
                                </div>
                            </div>
                            <div className="score-meta">
                                <h3>Profile Match for {dreamRole}</h3>
                                <p>Based on your current skills and experience</p>
                            </div>
                        </div>

                        {/* Skills Grid */}
                        <div className="skills-grid">
                            {/* Skills You Have */}
                            <div className="skills-card have">
                                <h3><CheckCircle size={20} /> Skills You Have</h3>
                                <div className="skills-list">
                                    {results.skillsYouHave.map((s, i) => (
                                        <div key={i} className="skill-tag have">
                                            <span>{s.skill}</span>
                                            <span className="skill-level">{s.level}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Skills to Learn */}
                            <div className="skills-card need">
                                <h3><TrendingUp size={20} /> Skills to Learn</h3>
                                <div className="skills-list">
                                    {results.skillsMissing.map((s, i) => (
                                        <div key={i} className="skill-tag need">
                                            <span>{s.skill}</span>
                                            <span className="skill-priority" style={{ color: getPriorityColor(s.priority) }}>
                                                {s.priority}
                                            </span>
                                            <span className="skill-time">
                                                <Clock size={12} /> {s.timeToLearn}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Plan */}
                        <div className="action-plan-card">
                            <h3>📋 Learning Roadmap</h3>
                            <div className="phases-timeline">
                                {results.actionPlan.map((phase, i) => (
                                    <div key={i} className="phase-item">
                                        <div className="phase-marker">
                                            <Circle size={16} />
                                        </div>
                                        <div className="phase-content">
                                            <h4>{phase.phase}</h4>
                                            <span className="phase-duration">{phase.duration}</span>
                                            <ul>
                                                {phase.tasks.map((task, j) => (
                                                    <li key={j}>{task}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resources */}
                        <div className="resources-card">
                            <h3><BookOpen size={20} /> Recommended Resources</h3>
                            <div className="resources-grid">
                                {results.recommendedResources.map((r, i) => (
                                    <div key={i} className="resource-item">
                                        <span className="resource-type">{r.type}</span>
                                        <p>{r.name}</p>
                                        {r.url && (
                                            <a href={r.url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink size={14} /> View
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillGapAnalyzer;

import React, { useState } from 'react';
import {
    Target, CheckCircle2, XCircle, AlertCircle, ArrowLeft,
    TrendingUp, Lightbulb, Briefcase, Award,
    ChevronDown, ChevronUp, FileText, Zap, Users, Star, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JDAnalysisDashboardProps {
    result: any;
    setResult: (result: any) => void;
    resultRef: React.RefObject<HTMLDivElement | null>;
}

const JDAnalysisDashboard: React.FC<JDAnalysisDashboardProps> = ({ result, setResult, resultRef }) => {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(['skills', 'gaps', 'optimization', 'strengths', 'actionplan'])
    );

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    // Get overall score from multiple possible fields
    const overallScore = result.overallScore || result.overall_score ||
        result.subScores?.overallRelevance || result.matchAnalysis?.skillsMatch?.score || 68;

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getScoreClass = (score: number) => {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        return 'needs-work';
    };

    const getVerdictColor = (verdict: string) => {
        const v = verdict?.toLowerCase() || '';
        if (v.includes('perfect') || v.includes('strong')) return 'verdict-excellent';
        if (v.includes('good')) return 'verdict-good';
        if (v.includes('partial')) return 'verdict-partial';
        return 'verdict-weak';
    };

    const getStatusIcon = (status: string) => {
        if (status === 'Missing') return <XCircle size={16} className="text-red-500" />;
        if (status === 'Weak' || status === 'Partial') return <AlertCircle size={16} className="text-amber-500" />;
        return <CheckCircle2 size={16} className="text-emerald-500" />;
    };

    const getImpactClass = (impact: string) => {
        if (impact === 'High') return 'impact-high';
        if (impact === 'Medium') return 'impact-medium';
        return 'impact-low';
    };

    return (
        <div className="jd-dashboard" ref={resultRef}>
            {/* Header */}
            <div className="jd-header">
                <button onClick={() => setResult(null)} className="back-btn">
                    <ArrowLeft size={18} />
                    <span>New Analysis</span>
                </button>
            </div>

            {/* Main Score Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="jd-hero-card"
            >
                <div className="hero-left">
                    {/* Big Score Circle with SVG Ring */}
                    <div className="score-ring-container">
                        <svg className="score-ring" viewBox="0 0 120 120">
                            <circle
                                className="score-ring-bg"
                                cx="60" cy="60" r="52"
                                fill="none"
                                strokeWidth="8"
                            />
                            <circle
                                className="score-ring-progress"
                                cx="60" cy="60" r="52"
                                fill="none"
                                strokeWidth="8"
                                strokeLinecap="round"
                                style={{
                                    stroke: getScoreColor(overallScore),
                                    strokeDasharray: `${(overallScore / 100) * 327} 327`,
                                    transform: 'rotate(-90deg)',
                                    transformOrigin: 'center'
                                }}
                            />
                        </svg>
                        <div className="score-ring-content">
                            <span className={`score-number ${getScoreClass(overallScore)}`}>
                                {overallScore}%
                            </span>
                            <span className="score-text">Match</span>
                        </div>
                    </div>
                </div>

                <div className="hero-right">
                    <span className={`verdict-pill ${getVerdictColor(result.verdict)}`}>
                        {result.verdict || 'Good Fit'}
                    </span>
                    <h1 className="job-title-main">
                        {result.jdAnalysis?.extractedTitle || 'Job Position'}
                    </h1>
                    <p className="executive-summary-text">
                        {result.executiveSummary || 'Analysis complete. Review the detailed breakdown below.'}
                    </p>
                </div>
            </motion.div>

            {/* Sub Scores Row */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="sub-scores-row"
            >
                {Object.entries(result.subScores || {}).map(([key, value]) => {
                    const score = value as number;
                    const label = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())
                        .replace('Score', '');
                    return (
                        <div key={key} className="sub-score-item">
                            <div className="sub-score-top">
                                <span className="sub-score-name">{label}</span>
                                <span className={`sub-score-num ${getScoreClass(score)}`}>
                                    {score}%
                                </span>
                            </div>
                            <div className="sub-score-track">
                                <div
                                    className={`sub-score-bar ${getScoreClass(score)}`}
                                    style={{ width: `${score}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </motion.div>

            {/* Skills Match Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="jd-card"
            >
                <div className="card-header" onClick={() => toggleSection('skills')}>
                    <div className="card-title">
                        <Target size={20} className="card-icon" />
                        <h2>Skills Match Analysis</h2>
                    </div>
                    {expandedSections.has('skills') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>

                <AnimatePresence>
                    {expandedSections.has('skills') && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="card-body"
                        >
                            <div className="skills-grid">
                                {/* Matched */}
                                <div className="skill-group matched">
                                    <div className="skill-group-header">
                                        <CheckCircle2 size={18} />
                                        <h3>Matched Skills ({result.matchAnalysis?.skillsMatch?.matched?.length || 0})</h3>
                                    </div>
                                    <div className="skill-tags">
                                        {result.matchAnalysis?.skillsMatch?.matched?.map((skill: string, idx: number) => (
                                            <span key={idx} className="skill-tag matched">{skill}</span>
                                        )) || <span className="empty-state">No data</span>}
                                    </div>
                                </div>

                                {/* Missing */}
                                <div className="skill-group missing">
                                    <div className="skill-group-header">
                                        <XCircle size={18} />
                                        <h3>Missing Skills ({result.matchAnalysis?.skillsMatch?.missing?.length || 0})</h3>
                                    </div>
                                    <div className="skill-tags">
                                        {result.matchAnalysis?.skillsMatch?.missing?.map((skill: string, idx: number) => (
                                            <span key={idx} className="skill-tag missing">{skill}</span>
                                        )) || <span className="empty-state">No data</span>}
                                    </div>
                                </div>

                                {/* Partial */}
                                <div className="skill-group partial">
                                    <div className="skill-group-header">
                                        <AlertCircle size={18} />
                                        <h3>Needs Improvement ({result.matchAnalysis?.skillsMatch?.partial?.length || 0})</h3>
                                    </div>
                                    <div className="skill-tags">
                                        {result.matchAnalysis?.skillsMatch?.partial?.map((skill: string, idx: number) => (
                                            <span key={idx} className="skill-tag partial">{skill}</span>
                                        )) || <span className="empty-state">No data</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Keywords */}
                            {result.matchAnalysis?.keywordMatch && (
                                <div className="keywords-section">
                                    <div className="keywords-header">
                                        <Zap size={18} />
                                        <h3>Keyword Analysis</h3>
                                        <span className={`density-badge ${result.matchAnalysis.keywordMatch.density?.toLowerCase()}`}>
                                            {result.matchAnalysis.keywordMatch.density} Density
                                        </span>
                                    </div>
                                    <div className="keywords-grid">
                                        <div className="keyword-col">
                                            <label>✓ Found Keywords</label>
                                            <div className="keyword-tags">
                                                {result.matchAnalysis.keywordMatch.foundKeywords?.slice(0, 6).map((kw: string, idx: number) => (
                                                    <span key={idx} className="keyword-tag found">{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="keyword-col">
                                            <label>✗ Missing Keywords</label>
                                            <div className="keyword-tags">
                                                {result.matchAnalysis.keywordMatch.missingKeywords?.slice(0, 6).map((kw: string, idx: number) => (
                                                    <span key={idx} className="keyword-tag missing">{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.section>

            {/* Gaps & Action Items */}
            {result.gaps?.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="jd-card"
                >
                    <div className="card-header" onClick={() => toggleSection('gaps')}>
                        <div className="card-title">
                            <AlertCircle size={20} className="card-icon warning" />
                            <h2>Gap Analysis & Fixes</h2>
                            <span className="count-badge">{result.gaps.length}</span>
                        </div>
                        {expandedSections.has('gaps') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>

                    <AnimatePresence>
                        {expandedSections.has('gaps') && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="card-body"
                            >
                                <div className="gaps-grid">
                                    {result.gaps.map((gap: any, idx: number) => (
                                        <div key={idx} className={`gap-card ${getImpactClass(gap.impact)}`}>
                                            <div className="gap-top">
                                                {getStatusIcon(gap.status)}
                                                <span className="gap-title">{gap.requirement}</span>
                                                <span className={`impact-pill ${getImpactClass(gap.impact)}`}>
                                                    {gap.impact}
                                                </span>
                                            </div>
                                            <p className="gap-fix">💡 {gap.suggestion}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.section>
            )}

            {/* Optimization Suggestions */}
            {(result.optimizationSuggestions?.addKeywords?.length > 0 ||
                result.optimizationSuggestions?.bulletImprovements?.length > 0) && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="jd-card"
                    >
                        <div className="card-header" onClick={() => toggleSection('optimization')}>
                            <div className="card-title">
                                <Lightbulb size={20} className="card-icon primary" />
                                <h2>Resume Optimization</h2>
                            </div>
                            {expandedSections.has('optimization') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>

                        <AnimatePresence>
                            {expandedSections.has('optimization') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="card-body"
                                >
                                    {/* Keywords to Add */}
                                    {result.optimizationSuggestions?.addKeywords?.length > 0 && (
                                        <div className="opt-block">
                                            <h4><Zap size={16} /> Add These Keywords to Your Resume</h4>
                                            <div className="keyword-tags add">
                                                {result.optimizationSuggestions.addKeywords.map((kw: string, idx: number) => (
                                                    <span key={idx} className="keyword-tag add">+ {kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Bullet Improvements */}
                                    {result.optimizationSuggestions?.bulletImprovements?.length > 0 && (
                                        <div className="opt-block">
                                            <h4><FileText size={16} /> Rewrite These Bullets</h4>
                                            <div className="bullets-list">
                                                {result.optimizationSuggestions.bulletImprovements.map((item: any, idx: number) => (
                                                    <div key={idx} className="bullet-card">
                                                        <div className="bullet-before">
                                                            <span className="bullet-label">❌ Before:</span>
                                                            <p>{item.current}</p>
                                                        </div>
                                                        <div className="bullet-after">
                                                            <span className="bullet-label">✅ After:</span>
                                                            <p>{item.improved}</p>
                                                        </div>
                                                        <span className="bullet-why">Why: {item.reason}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.section>
                )}

            {/* Strengths */}
            {result.strengths?.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="jd-card"
                >
                    <div className="card-header" onClick={() => toggleSection('strengths')}>
                        <div className="card-title">
                            <Award size={20} className="card-icon success" />
                            <h2>Your Strengths</h2>
                            <span className="count-badge success">{result.strengths.length}</span>
                        </div>
                        {expandedSections.has('strengths') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>

                    <AnimatePresence>
                        {expandedSections.has('strengths') && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="card-body"
                            >
                                <div className="strengths-grid">
                                    {result.strengths.map((s: any, idx: number) => (
                                        <div key={idx} className="strength-card">
                                            <div className="strength-top">
                                                <CheckCircle2 size={18} className="text-emerald-500" />
                                                <span className="strength-title">{s.point}</span>
                                            </div>
                                            <p className="strength-evidence">{s.evidence}</p>
                                            <p className="strength-relevance">→ {s.relevance}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.section>
            )}

            {/* Action Plan */}
            {result.actionPlan && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="jd-card"
                >
                    <div className="card-header" onClick={() => toggleSection('actionplan')}>
                        <div className="card-title">
                            <TrendingUp size={20} className="card-icon" />
                            <h2>Action Plan</h2>
                        </div>
                        {expandedSections.has('actionplan') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>

                    <AnimatePresence>
                        {expandedSections.has('actionplan') && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="card-body"
                            >
                                <div className="action-grid">
                                    <div className="action-col urgent">
                                        <div className="action-header">
                                            <span className="action-badge urgent">🔥 Before Applying</span>
                                        </div>
                                        <ul>
                                            {result.actionPlan.beforeApplying?.map((a: string, i: number) => (
                                                <li key={i}>{a}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="action-col short">
                                        <div className="action-header">
                                            <span className="action-badge short">📅 Next 2 Weeks</span>
                                        </div>
                                        <ul>
                                            {result.actionPlan.shortTerm?.map((a: string, i: number) => (
                                                <li key={i}>{a}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="action-col long">
                                        <div className="action-header">
                                            <span className="action-badge long">🎯 Long Term</span>
                                        </div>
                                        <ul>
                                            {result.actionPlan.longTerm?.map((a: string, i: number) => (
                                                <li key={i}>{a}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.section>
            )}

            {/* Final Verdict */}
            {result.finalRecommendation && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className={`final-verdict ${result.finalRecommendation.shouldApply ? 'apply' : 'improve'}`}
                >
                    <div className="verdict-icon">
                        {result.finalRecommendation.shouldApply ? (
                            <CheckCircle2 size={32} />
                        ) : (
                            <AlertCircle size={32} />
                        )}
                    </div>
                    <div className="verdict-content">
                        <h3>
                            {result.finalRecommendation.shouldApply
                                ? '✅ Go Ahead and Apply!'
                                : '⚠️ Improve Resume First'}
                        </h3>
                        <p>{result.finalRecommendation.reasoning}</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default JDAnalysisDashboard;

import React, { useState, useEffect, useCallback } from 'react';
import { PageProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic2, Zap, RefreshCw, Code, Brain, GitBranch,
    Lightbulb, Database, BarChart3, Server, Layout, Users, Book,
    Palette, Cloud, Boxes, ChartLine, Briefcase, Network, Component,
    FunctionSquare, CheckCircle2, Circle, Building2, Filter, ArrowLeft,
    MessageSquare, Award, Target
} from 'lucide-react';
import { generateInterviewQuestions } from '../services/geminiService';
import { getInterviewProgress, saveInterviewProgress } from '../services/dataService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Question {
    id: number;
    question: string;
    difficulty: 'easy' | 'medium' | 'hard';
    company?: string;
    topic?: string;
}

interface Category {
    name: string;
    icon: string;
    questions: Question[];
}

interface InterviewData {
    role: string;
    experience_level: string;
    total_questions: number;
    estimated_time: string;
    categories: Category[];
}

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
    'code': <Code className="w-5 h-5" />,
    'brain': <Brain className="w-5 h-5" />,
    'git-branch': <GitBranch className="w-5 h-5" />,
    'lightbulb': <Lightbulb className="w-5 h-5" />,
    'database': <Database className="w-5 h-5" />,
    'chart-bar': <BarChart3 className="w-5 h-5" />,
    'chart-line': <ChartLine className="w-5 h-5" />,
    'server': <Server className="w-5 h-5" />,
    'layout': <Layout className="w-5 h-5" />,
    'users': <Users className="w-5 h-5" />,
    'book': <Book className="w-5 h-5" />,
    'palette': <Palette className="w-5 h-5" />,
    'cloud': <Cloud className="w-5 h-5" />,
    'boxes': <Boxes className="w-5 h-5" />,
    'briefcase': <Briefcase className="w-5 h-5" />,
    'network': <Network className="w-5 h-5" />,
    'component': <Component className="w-5 h-5" />,
    'function-square': <FunctionSquare className="w-5 h-5" />,
};

const InterviewPrep: React.FC<PageProps> = ({ setView }) => {
    const [role, setRole] = useState('');
    const [level, setLevel] = useState('Mid-Level');
    const [isLoading, setIsLoading] = useState(false);
    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
    const [activeCategory, setActiveCategory] = useState(0);
    const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [evaluation, setEvaluation] = useState<any>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [progressLoaded, setProgressLoaded] = useState(false);
    const toast = useToast();
    const { user } = useAuth();

    // Load saved progress on mount
    useEffect(() => {
        if (!user || progressLoaded) return;

        const loadProgress = async () => {
            try {
                const progress = await getInterviewProgress();
                if (progress.role && progress.completedQuestions.length > 0) {
                    setRole(progress.role);
                    setLevel(progress.experienceLevel || 'Mid-Level');
                    setCompletedQuestions(new Set(progress.completedQuestions));
                    setAnswers(progress.answers || {});
                    setEvaluation(progress.evaluation);
                }
            } catch (e) {
                // Progress not found - user starting fresh
            } finally {
                setProgressLoaded(true);
            }
        };
        loadProgress();
    }, [user, progressLoaded]);

    // Auto-save progress when it changes
    const saveProgress = useCallback(async () => {
        if (!user || !interviewData || completedQuestions.size === 0) return;

        setIsSaving(true);
        try {
            await saveInterviewProgress({
                role: interviewData.role,
                experienceLevel: interviewData.experience_level,
                completedQuestions: Array.from(completedQuestions),
                answers,
                evaluation
            });
        } catch (e) {
            console.error('Failed to save progress:', e);
        } finally {
            setIsSaving(false);
        }
    }, [user, interviewData, completedQuestions, answers, evaluation]);

    // Debounced auto-save
    useEffect(() => {
        if (!interviewData || completedQuestions.size === 0) return;

        const timeout = setTimeout(() => {
            saveProgress();
        }, 2000);

        return () => clearTimeout(timeout);
    }, [completedQuestions, answers, saveProgress, interviewData]);

    const handleGenerate = async () => {
        if (!role.trim()) return;
        setIsLoading(true);
        setInterviewData(null);
        setActiveCategory(0);
        setCompletedQuestions(new Set());
        setAnswers({});
        setEvaluation(null);
        try {
            const data = await generateInterviewQuestions(role, level);
            setInterviewData(data as InterviewData);
        } catch (e) {
            console.error(e);
            toast.error("Failed to generate questions. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleCompleted = (categoryIdx: number, questionId: number) => {
        const key = `${categoryIdx}-${questionId}`;
        setCompletedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const getProgress = (categoryIdx: number) => {
        if (!interviewData) return { completed: 0, total: 0 };
        const questions = interviewData.categories[categoryIdx]?.questions || [];
        const completed = questions.filter((_, qIdx) =>
            completedQuestions.has(`${categoryIdx}-${questions[qIdx].id}`)
        ).length;
        return { completed, total: questions.length };
    };

    const updateAnswer = (questionKey: string, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionKey]: answer
        }));
    };

    const handleSubmitEvaluation = async () => {
        if (!interviewData || Object.keys(answers).length === 0) {
            toast.warning("Please answer at least one question before submitting.");
            return;
        }

        setIsEvaluating(true);
        try {
            const currentUser = auth.currentUser;
            const token = currentUser ? await currentUser.getIdToken() : null;

            const questionsWithAnswers = [];
            for (const [catIdx, category] of interviewData.categories.entries()) {
                for (const question of category.questions) {
                    const key = `${catIdx}-${question.id}`;
                    if (answers[key]) {
                        questionsWithAnswers.push({
                            question: question.question,
                            userAnswer: answers[key],
                            difficulty: question.difficulty
                        });
                    }
                }
            }

            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE}/api/ai/evaluate-interview`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    role: interviewData.role,
                    questionsWithAnswers
                })
            });

            if (!response.ok) throw new Error('Evaluation failed');
            const data = await response.json();
            setEvaluation(data);
            toast.success("Evaluation complete!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to evaluate answers. Please try again.");
        } finally {
            setIsEvaluating(false);
        }
    };

    const fixQuotes = (text: string) => {
        return text.replace(/'/g, "'").replace(/"/g, '"');
    };

    const filteredQuestions = interviewData?.categories[activeCategory]?.questions.filter(
        q => difficultyFilter === 'all' || q.difficulty === difficultyFilter
    ) || [];

    const getDifficultyClass = (difficulty: string) => {
        if (difficulty === 'easy') return 'difficulty-easy';
        if (difficulty === 'medium') return 'difficulty-medium';
        return 'difficulty-hard';
    };

    // Input Form View
    if (!interviewData) {
        return (
            <div className="interview-prep-page">
                <div className="interview-container">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="interview-hero"
                    >
                        <div className="hero-icon">
                            <Mic2 size={36} />
                        </div>
                        <h1 className="hero-title">
                            Ace Your Next <span className="gradient-text">Interview</span>
                        </h1>
                        <p className="hero-subtitle">
                            Practice with <strong>real interview questions</strong> from top companies.
                            <br />Get AI-powered feedback on your answers.
                        </p>
                    </motion.div>

                    {/* Feature Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="feature-cards"
                    >
                        <div className="feature-card purple">
                            <div className="feature-icon">
                                <Building2 size={22} />
                            </div>
                            <h3>Real Questions</h3>
                            <p>From FAANG & top startups</p>
                        </div>
                        <div className="feature-card pink">
                            <div className="feature-icon">
                                <Boxes size={22} />
                            </div>
                            <h3>By Category</h3>
                            <p>DSA, System Design, Behavioral</p>
                        </div>
                        <div className="feature-card indigo">
                            <div className="feature-icon">
                                <Brain size={22} />
                            </div>
                            <h3>AI Evaluation</h3>
                            <p>Get scored with feedback</p>
                        </div>
                    </motion.div>

                    {/* Input Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="interview-form-card"
                    >
                        <div className="form-group">
                            <label className="form-label">
                                <Target size={16} />
                                Target Role
                            </label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="e.g. Senior Data Scientist, Frontend Developer, ML Engineer"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Award size={16} />
                                Experience Level
                            </label>
                            <div className="level-selector">
                                {['Junior (0-2y)', 'Mid-Level (3-5y)', 'Senior (5-8y)', 'Staff/Principal (8y+)'].map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => setLevel(lvl)}
                                        className={`level-btn ${level === lvl ? 'active' : ''}`}
                                    >
                                        {lvl.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !role.trim()}
                            className="generate-btn"
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw size={20} className="spin" />
                                    Generating Questions...
                                </>
                            ) : (
                                <>
                                    <Zap size={20} />
                                    Generate Interview Questions
                                </>
                            )}
                        </button>

                        <div className="form-features">
                            <span><MessageSquare size={14} /> 15-20 questions</span>
                            <span><BarChart3 size={14} /> Multiple difficulty levels</span>
                            <span><CheckCircle2 size={14} /> Track progress</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Questions View
    return (
        <div className="interview-prep-page questions-view">
            {/* Header Bar */}
            <div className="interview-header">
                <div className="header-left">
                    <button onClick={() => setInterviewData(null)} className="back-btn">
                        <ArrowLeft size={18} />
                        <span>New Session</span>
                    </button>
                    <div className="session-info">
                        <span className="role-badge">{interviewData.role}</span>
                        <span className="level-badge">{interviewData.experience_level}</span>
                    </div>
                </div>
                <div className="header-right">
                    {/* Progress */}
                    <div className="progress-pill">
                        <CheckCircle2 size={16} />
                        <span>{completedQuestions.size} / {interviewData.total_questions}</span>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${(completedQuestions.size / interviewData.total_questions) * 100}%` }}
                            />
                        </div>
                    </div>
                    {/* Save Status */}
                    <div className={`save-status ${isSaving ? 'saving' : completedQuestions.size > 0 ? 'saved' : ''}`}>
                        <Cloud size={14} />
                        {isSaving ? 'Saving...' : completedQuestions.size > 0 ? 'Saved' : 'Auto-save'}
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="interview-layout">
                {/* Sidebar */}
                <aside className="category-sidebar">
                    <div className="sidebar-header">
                        <span className="sidebar-label">Categories</span>
                    </div>
                    <div className="category-list">
                        {interviewData.categories.map((cat, idx) => {
                            const progress = getProgress(idx);
                            const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
                            const isActive = activeCategory === idx;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setActiveCategory(idx)}
                                    className={`category-btn ${isActive ? 'active' : ''}`}
                                >
                                    <div className="category-icon">
                                        {iconMap[cat.icon] || <Code size={18} />}
                                    </div>
                                    <div className="category-info">
                                        <span className="category-name">{cat.name}</span>
                                        <span className="category-count">{cat.questions.length} questions</span>
                                    </div>
                                    <div className="category-progress">
                                        <div className="mini-bar">
                                            <div className="mini-fill" style={{ width: `${progressPercent}%` }} />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Sidebar Footer */}
                    <div className="sidebar-footer">
                        <div className="stats-box">
                            <div className="stat">
                                <span className="stat-value">{completedQuestions.size}</span>
                                <span className="stat-label">Completed</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{Object.keys(answers).length}</span>
                                <span className="stat-label">Answered</span>
                            </div>
                        </div>

                        {!evaluation && Object.keys(answers).length > 0 && (
                            <button
                                onClick={handleSubmitEvaluation}
                                disabled={isEvaluating}
                                className="submit-btn"
                            >
                                {isEvaluating ? (
                                    <>
                                        <RefreshCw size={16} className="spin" />
                                        Evaluating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={16} />
                                        Submit for Review
                                    </>
                                )}
                            </button>
                        )}

                        {evaluation && (
                            <div className="evaluation-summary">
                                <div className="eval-header">Results</div>
                                <div className="eval-stats">
                                    <div className="eval-stat correct">
                                        <span>{evaluation.summary?.correct || 0}</span>
                                        Correct
                                    </div>
                                    <div className="eval-stat partial">
                                        <span>{evaluation.summary?.partial || 0}</span>
                                        Partial
                                    </div>
                                    <div className="eval-stat wrong">
                                        <span>{evaluation.summary?.wrong || 0}</span>
                                        Wrong
                                    </div>
                                </div>
                                <div className="eval-score">
                                    <span>Avg Score</span>
                                    <strong>{evaluation.summary?.averageScore || 0}/10</strong>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Questions Panel */}
                <main className="questions-panel">
                    {/* Filter Bar */}
                    <div className="filter-bar">
                        <h2 className="panel-title">{interviewData.categories[activeCategory]?.name}</h2>
                        <div className="difficulty-filters">
                            <Filter size={16} />
                            {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDifficultyFilter(d)}
                                    className={`filter-btn ${difficultyFilter === d ? 'active' : ''} ${d !== 'all' ? d : ''}`}
                                >
                                    {d.charAt(0).toUpperCase() + d.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="questions-list">
                        <AnimatePresence mode="popLayout">
                            {filteredQuestions.map((q, idx) => {
                                const questionKey = `${activeCategory}-${q.id}`;
                                const isCompleted = completedQuestions.has(questionKey);
                                const hasAnswer = !!answers[questionKey];

                                return (
                                    <motion.div
                                        key={questionKey}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={`question-card ${isCompleted ? 'completed' : ''}`}
                                    >
                                        <div className="question-header">
                                            <button
                                                onClick={() => toggleCompleted(activeCategory, q.id)}
                                                className="completion-btn"
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle2 size={22} className="check-done" />
                                                ) : (
                                                    <Circle size={22} className="check-empty" />
                                                )}
                                            </button>
                                            <div className="question-meta">
                                                <span className={`difficulty-badge ${getDifficultyClass(q.difficulty)}`}>
                                                    {q.difficulty}
                                                </span>
                                                {q.company && (
                                                    <span className="company-badge">
                                                        <Building2 size={12} />
                                                        {q.company}
                                                    </span>
                                                )}
                                                {q.topic && (
                                                    <span className="topic-badge">{q.topic}</span>
                                                )}
                                            </div>
                                            <span className="question-id">#{q.id}</span>
                                        </div>

                                        <h3 className={`question-text ${isCompleted ? 'done' : ''}`}>
                                            {fixQuotes(q.question)}
                                        </h3>

                                        {/* Answer Input */}
                                        {!evaluation && (
                                            <textarea
                                                value={answers[questionKey] || ''}
                                                onChange={(e) => updateAnswer(questionKey, e.target.value)}
                                                placeholder="Type your answer here..."
                                                className="answer-input"
                                                rows={4}
                                            />
                                        )}

                                        {/* Evaluation Feedback */}
                                        {evaluation && evaluation.results && (
                                            <>
                                                {evaluation.results.map((res: any, resIdx: number) => {
                                                    if (res.question === q.question && answers[questionKey]) {
                                                        const evalClass = res.evaluation === 'Correct' ? 'correct'
                                                            : res.evaluation === 'Partially Correct' ? 'partial' : 'wrong';
                                                        return (
                                                            <div key={resIdx} className={`evaluation-result ${evalClass}`}>
                                                                <div className="eval-result-header">
                                                                    <span className={`eval-badge ${evalClass}`}>
                                                                        {res.evaluation}
                                                                    </span>
                                                                    <span className="eval-score-badge">
                                                                        Score: {res.score}/10
                                                                    </span>
                                                                </div>
                                                                <p className="your-answer">
                                                                    <strong>Your Answer:</strong> {res.userAnswer}
                                                                </p>
                                                                <p className="feedback">
                                                                    <strong>Feedback:</strong> {res.feedback}
                                                                </p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default InterviewPrep;

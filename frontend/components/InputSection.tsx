import React, { useState, useRef, useEffect } from 'react';
import { FileText, Upload, Image, Sparkles, Loader2, FileUp, X, CheckCircle2, History, ChevronDown, Trash2, Clock, Briefcase, Target } from 'lucide-react';
import { getAnalyses, deleteAnalysis, getJDAnalyses, deleteJDAnalysis } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { AnalysisResult } from '../types';

interface SavedAnalysis {
    id: string;
    targetRole?: string;
    jobTitle?: string;
    result: any;  // Can be AnalysisResult or JD analysis result
    createdAt: string;
    resumeSnapshot?: string;
}

interface InputSectionProps {
    inputType: 'upload' | 'text';
    setInputType: (type: 'upload' | 'text') => void;
    targetRole: string;
    setTargetRole: (role: string) => void;
    resumeFile: { name: string; data: string; mimeType: string } | null;
    setResumeFile: (file: { name: string; data: string; mimeType: string } | null) => void;
    resumeText: string;
    setResumeText: (text: string) => void;
    error: string | null;
    setError: (error: string | null) => void;
    isLoading: boolean;
    handleAnalyze: () => void;
    onSelectAnalysis?: (result: AnalysisResult, role: string) => void;
    analysisMode?: 'role' | 'jd';
    setAnalysisMode?: (mode: 'role' | 'jd') => void;
    jobDescription?: string;
    setJobDescription?: (jd: string) => void;
    handleJDAnalyze?: () => void;
    onSelectJDAnalysis?: (result: any) => void;
}

const InputSection: React.FC<InputSectionProps> = ({
    inputType,
    setInputType,
    targetRole,
    setTargetRole,
    resumeFile,
    setResumeFile,
    resumeText,
    setResumeText,
    error,
    setError,
    isLoading,
    handleAnalyze,
    onSelectAnalysis,
    analysisMode = 'role',
    setAnalysisMode,
    jobDescription = '',
    setJobDescription,
    handleJDAnalyze,
    onSelectJDAnalysis,
}) => {
    const { user } = useAuth();
    const [dragActive, setDragActive] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
    const [jdAnalyses, setJdAnalyses] = useState<SavedAnalysis[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const historyRef = useRef<HTMLDivElement>(null);

    // Close history dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
                setShowHistory(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (user && showHistory) {
            loadHistory();
        }
    }, [user, showHistory]);

    const loadHistory = async () => {
        if (!user) return;
        setLoadingHistory(true);
        try {
            const [roleData, jdData] = await Promise.all([
                getAnalyses(),
                getJDAnalyses()
            ]);
            setAnalyses(roleData.analyses || []);
            setJdAnalyses(jdData.analyses || []);
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleDeleteAnalysis = async (id: string, isJD: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            if (isJD) {
                await deleteJDAnalysis(id);
                setJdAnalyses(prev => prev.filter(a => a.id !== id));
            } else {
                await deleteAnalysis(id);
                setAnalyses(prev => prev.filter(a => a.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    const handleSelectAnalysis = (analysis: SavedAnalysis, isJD: boolean) => {
        if (isJD && onSelectJDAnalysis) {
            onSelectJDAnalysis(analysis.result);
        } else if (!isJD && onSelectAnalysis) {
            onSelectAnalysis(analysis.result, analysis.targetRole || '');
        }
        setShowHistory(false);
    };

    const handleFileUpload = async (file: File) => {
        if (!file) return;
        setError(null);

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = (e.target?.result as string)?.split(',')[1];
                if (base64) {
                    setResumeFile({
                        name: file.name,
                        data: base64,
                        mimeType: file.type
                    });
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('File processing error:', err);
            setError('Failed to process file. Please try again.');
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setResumeFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const canAnalyzeRole = inputType === 'upload'
        ? !!resumeFile && !!targetRole.trim()
        : !!resumeText.trim() && !!targetRole.trim();

    const canAnalyzeJD = inputType === 'upload'
        ? !!resumeFile && !!jobDescription.trim()
        : !!resumeText.trim() && !!jobDescription.trim();

    const canAnalyze = analysisMode === 'jd' ? canAnalyzeJD : canAnalyzeRole;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const totalHistoryCount = analyses.length + jdAnalyses.length;

    return (
        <div className="resume-analyzer-container">
            {/* Hero Header with History */}
            <div className="analyzer-hero">
                <div className="analyzer-icon">
                    <FileText size={32} />
                </div>
                <h1 className="analyzer-title">Resume Analyzer</h1>
                <p className="analyzer-subtitle">
                    Get AI-powered insights to optimize your resume
                </p>

                {/* History Dropdown - Positioned nicely */}
                {user && (
                    <div className="history-dropdown-wrapper" ref={historyRef}>
                        <button
                            className={`history-dropdown-trigger ${showHistory ? 'active' : ''}`}
                            onClick={() => setShowHistory(!showHistory)}
                        >
                            <History size={18} />
                            <span>My Analyses</span>
                            <span className="history-badge">{totalHistoryCount}</span>
                            <ChevronDown size={16} className={`chevron ${showHistory ? 'open' : ''}`} />
                        </button>

                        {showHistory && (
                            <div className="history-dropdown">
                                {loadingHistory ? (
                                    <div className="history-loading">
                                        <Loader2 size={20} className="spin" />
                                        Loading...
                                    </div>
                                ) : totalHistoryCount === 0 ? (
                                    <div className="history-empty">
                                        <p>No saved analyses yet</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Role Analyses */}
                                        {analyses.length > 0 && (
                                            <div className="history-group">
                                                <div className="history-group-header">
                                                    <Target size={14} />
                                                    Role Analyses
                                                </div>
                                                {analyses.slice(0, 5).map((a) => (
                                                    <div
                                                        key={a.id}
                                                        className="history-item"
                                                        onClick={() => handleSelectAnalysis(a, false)}
                                                    >
                                                        <div className="history-item-info">
                                                            <span className="history-item-title">{a.targetRole}</span>
                                                            <span className="history-item-meta">
                                                                {a.result?.atsScore || a.result?.match_score}% • {formatDate(a.createdAt)}
                                                            </span>
                                                        </div>
                                                        <button
                                                            className="history-item-delete"
                                                            onClick={(e) => handleDeleteAnalysis(a.id, false, e)}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* JD Analyses */}
                                        {jdAnalyses.length > 0 && (
                                            <div className="history-group">
                                                <div className="history-group-header">
                                                    <Briefcase size={14} />
                                                    JD Matches
                                                </div>
                                                {jdAnalyses.slice(0, 5).map((a) => (
                                                    <div
                                                        key={a.id}
                                                        className="history-item"
                                                        onClick={() => handleSelectAnalysis(a, true)}
                                                    >
                                                        <div className="history-item-info">
                                                            <span className="history-item-title">{a.jobTitle || 'Job Position'}</span>
                                                            <span className="history-item-meta">
                                                                {a.result?.overallScore || '--'}% • {formatDate(a.createdAt)}
                                                            </span>
                                                        </div>
                                                        <button
                                                            className="history-item-delete"
                                                            onClick={(e) => handleDeleteAnalysis(a.id, true, e)}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Analysis Mode Toggle */}
            {setAnalysisMode && (
                <div className="analysis-mode-toggle">
                    <button
                        className={`mode-btn ${analysisMode === 'role' ? 'active' : ''}`}
                        onClick={() => setAnalysisMode('role')}
                    >
                        <Target size={18} />
                        Target Role Analysis
                    </button>
                    <button
                        className={`mode-btn ${analysisMode === 'jd' ? 'active' : ''}`}
                        onClick={() => setAnalysisMode('jd')}
                    >
                        <Briefcase size={18} />
                        Job Description Match
                    </button>
                </div>
            )}

            {/* Main Card */}
            <div className="analyzer-card">
                {/* Input Method Tabs */}
                <div className="input-tabs">
                    <button
                        className={`tab-btn ${inputType === 'text' ? 'active' : ''}`}
                        onClick={() => setInputType('text')}
                    >
                        <FileText size={18} />
                        Paste Text
                    </button>
                    <button
                        className={`tab-btn ${inputType === 'upload' ? 'active' : ''}`}
                        onClick={() => setInputType('upload')}
                    >
                        <Upload size={18} />
                        Upload File
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        <X size={16} />
                        {error}
                    </div>
                )}

                {/* Paste Text Section */}
                {inputType === 'text' && (
                    <div className="paste-section">
                        <label className="input-label">📄 Resume Content</label>
                        <textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Paste your resume text here...

Include your:
• Work experience
• Skills & technologies
• Education
• Projects & achievements"
                            className="resume-textarea"
                            rows={10}
                        />
                        {resumeText.length > 0 && (
                            <p className="char-count">{resumeText.length} characters</p>
                        )}
                    </div>
                )}

                {/* Upload File Section */}
                {inputType === 'upload' && (
                    <div className="upload-section">
                        <label className="input-label">📁 Upload Resume</label>

                        {!resumeFile ? (
                            <div
                                className={`dropzone ${dragActive ? 'active' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.txt,.png,.jpg,.jpeg,.docx"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <div className="dropzone-content">
                                    <div className="dropzone-icon">
                                        <FileUp size={36} />
                                    </div>
                                    <p className="dropzone-title">Drag & drop your resume</p>
                                    <p className="dropzone-subtitle">or click to browse</p>
                                    <div className="file-types">
                                        <span className="file-type">PDF</span>
                                        <span className="file-type">DOCX</span>
                                        <span className="file-type">TXT</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="uploaded-file">
                                <div className="file-info">
                                    <div className={`file-icon ${resumeFile.mimeType.includes('pdf') ? 'pdf' : 'text'}`}>
                                        <FileText size={24} />
                                    </div>
                                    <div className="file-details">
                                        <p className="file-name">{resumeFile.name}</p>
                                        <p className="file-ready">✓ Ready</p>
                                    </div>
                                    <button className="remove-file" onClick={removeFile}>
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Conditional: Target Role OR Job Description */}
                {analysisMode === 'role' ? (
                    <div className="role-section">
                        <label className="input-label">🎯 Target Role</label>
                        <input
                            type="text"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="e.g., Senior Data Scientist at Google"
                            className="role-input"
                        />
                    </div>
                ) : (
                    <div className="jd-section">
                        <label className="input-label">📋 Job Description</label>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription && setJobDescription(e.target.value)}
                            placeholder="Paste the full job description here..."
                            className="jd-textarea"
                            rows={8}
                        />
                        {jobDescription.length > 0 && (
                            <p className="char-count">{jobDescription.length} characters</p>
                        )}
                    </div>
                )}

                {/* Analyze Button */}
                <button
                    onClick={analysisMode === 'jd' && handleJDAnalyze ? handleJDAnalyze : handleAnalyze}
                    disabled={isLoading || !canAnalyze}
                    className="analyze-btn"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={20} className="spin" />
                            {analysisMode === 'jd' ? 'Matching...' : 'Analyzing...'}
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            {analysisMode === 'jd' ? 'Match with JD' : 'Analyze Resume'}
                        </>
                    )}
                </button>

                {/* Features */}
                <div className="analyzer-features">
                    {analysisMode === 'role' ? (
                        <>
                            <div className="feature"><span>📊</span> ATS Score</div>
                            <div className="feature"><span>💡</span> Improvements</div>
                            <div className="feature"><span>🎯</span> Skill Gaps</div>
                        </>
                    ) : (
                        <>
                            <div className="feature"><span>🎯</span> Match Score</div>
                            <div className="feature"><span>✅</span> Skills Match</div>
                            <div className="feature"><span>📝</span> Optimization</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InputSection;

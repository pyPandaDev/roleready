import React, { useState, useRef } from 'react';
import {
    Globe, FileUp, Palette, Code, Eye, Download, Loader2,
    Sparkles, ExternalLink, Copy, Check
} from 'lucide-react';
import { generatePortfolio } from '../services/geminiService';
import { useToast } from '../context/ToastContext';

interface PortfolioGeneratorProps {
    setView: (view: string) => void;
}

const STYLES = [
    { id: 'minimal', name: 'Minimal', icon: Eye, desc: 'Clean & simple' },
    { id: 'developer', name: 'Developer', icon: Code, desc: 'Tech-focused' },
    { id: 'creative', name: 'Creative', icon: Palette, desc: 'Bold & colorful' },
];

const PortfolioGenerator: React.FC<PortfolioGeneratorProps> = ({ setView }) => {
    const [resumeText, setResumeText] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('minimal');
    const [isGenerating, setIsGenerating] = useState(false);
    const [portfolioHtml, setPortfolioHtml] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type === 'application/pdf') {
            toast.info('PDF upload - paste text for now');
        } else {
            const text = await file.text();
            setResumeText(text);
            toast.success('File loaded!');
        }
    };

    const handleGenerate = async () => {
        if (!resumeText.trim()) {
            toast.warning('Please paste your resume first');
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generatePortfolio(resumeText, selectedStyle);
            setPortfolioHtml(result.html);
            toast.success('Portfolio generated!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate portfolio');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!portfolioHtml) return;
        const blob = new Blob([portfolioHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio.html';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Downloaded!');
    };

    const handleCopy = () => {
        if (!portfolioHtml) return;
        navigator.clipboard.writeText(portfolioHtml);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Copied to clipboard!');
    };

    return (
        <div className="coach-container">
            <div className="coach-main" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div className="coach-header">
                    <div className="coach-title-row">
                        <div className="coach-icon">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h1 className="coach-title">Portfolio Generator</h1>
                            <p className="coach-subtitle">Transform your resume into a stunning website</p>
                        </div>
                    </div>
                </div>

                {!portfolioHtml ? (
                    <div className="tool-setup-section">
                        {/* Resume Input */}
                        <div className="input-card">
                            <h3>📄 Paste Your Resume</h3>
                            <textarea
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                placeholder="Paste your resume text here..."
                                className="resume-textarea"
                                rows={10}
                            />
                            <div className="upload-row">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".txt,.pdf"
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

                        {/* Style Selection */}
                        <div className="input-card">
                            <h3>🎨 Choose Style</h3>
                            <div className="style-options">
                                {STYLES.map((style) => (
                                    <div
                                        key={style.id}
                                        className={`style-option ${selectedStyle === style.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedStyle(style.id)}
                                    >
                                        <style.icon size={24} />
                                        <span className="style-name">{style.name}</span>
                                        <span className="style-desc">{style.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            className="btn-primary btn-large"
                            onClick={handleGenerate}
                            disabled={isGenerating || !resumeText.trim()}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={20} className="spin" /> Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} /> Generate Portfolio
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="portfolio-result">
                        {/* Actions Bar */}
                        <div className="result-actions">
                            <button className="btn-secondary" onClick={() => setPortfolioHtml(null)}>
                                ← Back
                            </button>
                            <div className="action-buttons">
                                <button className="btn-secondary" onClick={handleCopy}>
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    {copied ? 'Copied!' : 'Copy HTML'}
                                </button>
                                <button className="btn-primary" onClick={handleDownload}>
                                    <Download size={16} /> Download
                                </button>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="portfolio-preview-container">
                            <iframe
                                srcDoc={portfolioHtml}
                                className="portfolio-iframe"
                                title="Portfolio Preview"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortfolioGenerator;

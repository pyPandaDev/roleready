import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    User, Briefcase, GraduationCap, Code2, FolderGit2, Download,
    ChevronLeft, Plus, Trash2, Printer, Import, FilePlus,
    Award, Globe, Heart, Layers, ArrowUp, ArrowDown, Type, Settings2,
    Layout, GripVertical, Eye, Trophy, Sparkles, Wand2, Loader2, Check, X,
    ArrowRight, CheckCircle2, Circle, Github, Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeProfile } from '../types';
import { cn } from '../lib/utils';
import { optimizeResumeContent } from '../services/geminiService';

// Import from modular components
import {
    SectionType,
    FontType,
    ResumeBuilderProps,
    Templates,
    printStyles,
    sampleResume,
    sectionIcons,
    defaultSectionOrder,
    AutoResizeTextarea
} from '../components/resume-builder';

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ setView, initialData }) => {
    const [activeTab, setActiveTab] = useState<SectionType>('personal');
    const [resumeData, setResumeData] = useState<ResumeProfile>(sampleResume);
    const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof Templates>('standard');
    const [font, setFont] = useState<FontType>('sans');
    const [scale, setScale] = useState(0.8);
    const [sectionOrder, setSectionOrder] = useState<SectionType[]>(defaultSectionOrder);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Page preview ref
    const resumePreviewRef = useRef<HTMLDivElement>(null);

    // Inject print styles
    useEffect(() => {
        const styleId = 'resume-print-styles';
        if (!document.getElementById(styleId)) {
            const styleTag = document.createElement('style');
            styleTag.id = styleId;
            styleTag.innerHTML = printStyles;
            document.head.appendChild(styleTag);
        }
        return () => {
            const existingStyle = document.getElementById(styleId);
            if (existingStyle) existingStyle.remove();
        };
    }, []);

    // Get active template
    const ActiveTemplate = Templates[selectedTemplate];

    // ATS Score calculation
    const atsScore = useMemo(() => {
        let score = 0;
        if (resumeData.personal.fullName) score += 10;
        if (resumeData.personal.email) score += 10;
        if (resumeData.personal.phone) score += 5;
        if (resumeData.personal.summary && resumeData.personal.summary.length > 50) score += 15;
        if (resumeData.experience.length > 0) score += 20;
        if (resumeData.education.length > 0) score += 15;
        if (resumeData.skills.length > 0) score += 15;
        if (resumeData.projects.length > 0) score += 10;
        return Math.min(score, 100);
    }, [resumeData]);

    // Handle PDF Export
    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const element = resumePreviewRef.current;
            if (!element) {
                setIsExporting(false);
                return;
            }

            const clone = element.cloneNode(true) as HTMLElement;
            clone.style.position = 'absolute';
            clone.style.left = '-9999px';
            clone.style.top = '0';
            clone.style.width = '8.5in';
            clone.style.height = '11in';
            clone.style.transform = 'none';
            clone.style.overflow = 'visible';
            clone.style.fontFamily = getComputedStyle(element).fontFamily;
            clone.style.letterSpacing = '0';
            clone.style.wordSpacing = 'normal';

            document.body.appendChild(clone);
            await document.fonts.ready;
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(clone, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                imageTimeout: 0,
                onclone: (clonedDoc) => {
                    const allText = clonedDoc.querySelectorAll('*');
                    allText.forEach((el) => {
                        const htmlEl = el as HTMLElement;
                        if (htmlEl.style) {
                            htmlEl.style.letterSpacing = 'normal';
                            htmlEl.style.wordSpacing = 'normal';
                        }
                    });
                }
            });

            document.body.removeChild(clone);
            const imgData = canvas.toDataURL('image/png', 1.0);

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'letter',
                compress: true
            });

            pdf.addImage(imgData, 'PNG', 0, 0, 8.5, 11, undefined, 'FAST');

            const fileName = resumeData.personal.fullName
                ? `${resumeData.personal.fullName.replace(/\s+/g, '_')}_Resume.pdf`
                : 'Resume.pdf';
            pdf.save(fileName);
        } catch (error) {
            console.error('PDF export failed:', error);
            window.print();
        }
        setIsExporting(false);
    };

    // Handle AI optimize
    const handleOptimize = async () => {
        setIsOptimizing(true);
        try {
            const result = await optimizeResumeContent(resumeData);
            if (result) {
                setResumeData(result);
            }
        } catch (error) {
            console.error('Optimization failed:', error);
        }
        setIsOptimizing(false);
    };

    // Move section
    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...sectionOrder];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < newOrder.length) {
            [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
            setSectionOrder(newOrder);
        }
    };

    // Check section completion
    const isSectionComplete = (section: SectionType): boolean => {
        if (section === 'personal') return !!(resumeData.personal.fullName && resumeData.personal.email);
        // @ts-ignore
        return resumeData[section]?.length > 0;
    };

    return (
        <div className="fixed inset-0 top-0 left-0 bg-slate-50 dark:bg-zinc-950 z-[60] flex flex-col h-screen">
            {/* OPTIMIZATION OVERLAY */}
            <AnimatePresence>
                {isOptimizing && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] bg-white/90 dark:bg-black/90 backdrop-blur-md flex flex-col items-center justify-center"
                    >
                        <div className="absolute top-8 right-8">
                            <button onClick={() => setIsOptimizing(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-full text-slate-500 dark:text-zinc-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="relative">
                            <Sparkles className="w-20 h-20 text-teal-500 animate-spin absolute top-0 left-0 blur-xl opacity-50" />
                            <Wand2 className="w-24 h-24 text-teal-600 dark:text-teal-400 relative z-10 animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-8 mb-2">AI Magic in Progress</h2>
                        <p className="text-slate-600 dark:text-zinc-400 text-lg text-center max-w-md">Polishing grammar, enhancing impact, and formatting...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Bar */}
            <header className="h-16 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500"><ChevronLeft className="w-5 h-5" /></button>
                    <span className="font-bold text-slate-900 dark:text-white">Resume Studio</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
                    <select
                        className="bg-transparent text-xs font-bold px-2 outline-none dark:text-white cursor-pointer"
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value as any)}
                    >
                        <option value="standard">Standard</option>
                        <option value="harvard">Harvard</option>
                        <option value="modern">Modern</option>
                        <option value="compact">Compact</option>
                        <option value="professional">Professional</option>
                        <option value="technical">Technical</option>
                    </select>
                    <div className="w-px h-4 bg-slate-300 dark:bg-zinc-600"></div>
                    <button onClick={() => setFont('sans')} className={cn("p-1.5 rounded", font === 'sans' ? 'bg-white dark:bg-zinc-600 shadow' : '')}><Type className="w-4 h-4" /></button>
                    <button onClick={() => setFont('serif')} className={cn("p-1.5 rounded font-serif", font === 'serif' ? 'bg-white dark:bg-zinc-600 shadow' : '')}>T</button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg text-sm font-bold hover:shadow-lg hover:shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isOptimizing ? 'Optimizing...' : 'AI Optimize'}
                    </button>
                    <button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold hover:opacity-90 transition disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isExporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Navigation & ATS Score */}
                <nav className="w-72 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col shrink-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        {/* Personal Section */}
                        <div className="p-4 border-b border-slate-100 dark:border-zinc-800">
                            <h3 className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Your Info</h3>
                            <motion.button
                                onClick={() => setActiveTab('personal')}
                                className={cn(
                                    "w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all",
                                    activeTab === 'personal'
                                        ? "bg-gradient-to-r from-teal-50 to-teal-100/50 dark:from-teal-900/30 dark:to-teal-800/20 text-teal-700 dark:text-teal-400 shadow-sm"
                                        : "text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                                )}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                    activeTab === 'personal' ? "bg-teal-500 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
                                )}>
                                    {sectionIcons.personal}
                                </span>
                                <span className="flex-1">Personal Details</span>
                                {isSectionComplete('personal') && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                )}
                            </motion.button>
                        </div>

                        {/* Other Sections */}
                        <div className="p-3 space-y-1">
                            <h3 className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-2 mb-2">Resume Sections</h3>
                            {sectionOrder.map((section, index) => (
                                <div key={section} className="flex items-center gap-1 group">
                                    <motion.button
                                        onClick={() => setActiveTab(section)}
                                        className={cn(
                                            "flex-1 text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-all",
                                            activeTab === section
                                                ? "bg-gradient-to-r from-teal-50 to-teal-100/50 dark:from-teal-900/30 dark:to-teal-800/20 text-teal-700 dark:text-teal-400 shadow-sm"
                                                : "text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                                        )}
                                        whileHover={{ x: 2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className={cn(
                                            "w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-xs",
                                            activeTab === section ? "bg-teal-500 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
                                        )}>
                                            {sectionIcons[section]}
                                        </span>
                                        <span className="flex-1 capitalize">{section}</span>
                                        {isSectionComplete(section) ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-slate-200 dark:text-zinc-700" />
                                        )}
                                    </motion.button>
                                    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => moveSection(index, 'up')} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded"><ArrowUp className="w-3 h-3 text-slate-400" /></button>
                                        <button onClick={() => moveSection(index, 'down')} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded"><ArrowDown className="w-3 h-3 text-slate-400" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live ATS Score */}
                    <div className="p-5 border-t border-slate-200 dark:border-zinc-800 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950/80 dark:to-zinc-900">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold uppercase text-slate-500 dark:text-zinc-400 tracking-wide">ATS Score</span>
                            <span className={cn(
                                "text-2xl font-black",
                                atsScore >= 80 ? "text-emerald-500" : atsScore >= 60 ? "text-amber-500" : "text-rose-500"
                            )}>{atsScore}</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                className={cn(
                                    "h-full rounded-full",
                                    atsScore >= 80 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : atsScore >= 60 ? "bg-gradient-to-r from-amber-500 to-amber-400" : "bg-gradient-to-r from-rose-500 to-rose-400"
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${atsScore}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2">
                            {atsScore >= 80 ? "Excellent! Your resume is ATS-ready." : atsScore >= 60 ? "Good progress! Add more details." : "Keep going! Fill in more sections."}
                        </p>
                    </div>
                </nav>

                {/* Middle Panel - Editor */}
                <div className="w-[450px] bg-slate-50 dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 flex flex-col overflow-y-auto shrink-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 capitalize flex items-center gap-2">
                            {activeTab} <span className="text-slate-300 text-sm font-normal">Editor</span>
                        </h2>

                        {activeTab === 'personal' && (
                            <div className="space-y-4 animate-fade-in-up">
                                {['fullName', 'email', 'phone', 'location', 'linkedin', 'github', 'website'].map((field) => (
                                    <div key={field}>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{field}</label>
                                        <input
                                            type="text"
                                            // @ts-ignore
                                            value={resumeData.personal[field]}
                                            // @ts-ignore
                                            onChange={(e) => setResumeData({ ...resumeData, personal: { ...resumeData.personal, [field]: e.target.value } })}
                                            className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:border-teal-500 outline-none text-slate-900 dark:text-white"
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Professional Summary</label>
                                    <AutoResizeTextarea
                                        value={resumeData.personal.summary}
                                        onChange={(e: any) => setResumeData({ ...resumeData, personal: { ...resumeData.personal, summary: e.target.value } })}
                                        className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:border-teal-500 outline-none text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}

                        {/* GENERIC LIST EDITOR */}
                        {['experience', 'education', 'projects', 'certifications', 'languages', 'volunteering', 'awards'].includes(activeTab) && (
                            <div className="space-y-6">
                                {/* @ts-ignore */}
                                {resumeData[activeTab].map((item: any, index: number) => (
                                    <div key={item.id} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 relative group shadow-sm hover:border-teal-500/50 transition-colors">
                                        <button onClick={() => {
                                            // @ts-ignore
                                            const newList = [...resumeData[activeTab]];
                                            newList.splice(index, 1);
                                            // @ts-ignore
                                            setResumeData({ ...resumeData, [activeTab]: newList });
                                        }} className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>

                                        <div className="space-y-3">
                                            {activeTab === 'experience' && (
                                                <>
                                                    <input placeholder="Company" value={item.company} onChange={(e) => {
                                                        const n = [...resumeData.experience]; n[index].company = e.target.value; setResumeData({ ...resumeData, experience: n });
                                                    }} className="w-full font-bold bg-transparent border-b border-slate-100 dark:border-zinc-800 focus:border-teal-500 outline-none pb-1 text-slate-900 dark:text-white" />
                                                    <input placeholder="Role" value={item.role} onChange={(e) => {
                                                        const n = [...resumeData.experience]; n[index].role = e.target.value; setResumeData({ ...resumeData, experience: n });
                                                    }} className="w-full text-sm bg-transparent border-b border-slate-100 dark:border-zinc-800 focus:border-teal-500 outline-none pb-1 text-slate-900 dark:text-white" />
                                                    <input placeholder="Location (e.g. Remote, San Francisco, CA)" value={item.location || ''} onChange={(e) => {
                                                        const n = [...resumeData.experience]; n[index].location = e.target.value; setResumeData({ ...resumeData, experience: n });
                                                    }} className="w-full text-sm bg-transparent border-b border-slate-100 dark:border-zinc-800 focus:border-teal-500 outline-none pb-1 text-slate-600 dark:text-slate-300" />
                                                    <div className="flex gap-2">
                                                        <input placeholder="Start Date" value={item.startDate} onChange={(e) => { const n = [...resumeData.experience]; n[index].startDate = e.target.value; setResumeData({ ...resumeData, experience: n }); }} className="w-1/2 text-xs border-b border-slate-100 dark:border-zinc-800 outline-none pb-1 bg-transparent text-slate-600 dark:text-slate-300" />
                                                        <input placeholder="End Date" value={item.endDate} onChange={(e) => { const n = [...resumeData.experience]; n[index].endDate = e.target.value; setResumeData({ ...resumeData, experience: n }); }} className="w-1/2 text-xs border-b border-slate-100 dark:border-zinc-800 outline-none pb-1 bg-transparent text-slate-600 dark:text-slate-300" />
                                                    </div>
                                                    <AutoResizeTextarea placeholder="Description (use bullet points with - or •)" value={item.description} onChange={(e: any) => { const n = [...resumeData.experience]; n[index].description = e.target.value; setResumeData({ ...resumeData, experience: n }); }} className="w-full text-sm bg-slate-50 dark:bg-zinc-950 p-2 rounded focus:border-teal-500 outline-none text-slate-800 dark:text-slate-200" />
                                                </>
                                            )}
                                            {activeTab === 'projects' && (
                                                <>
                                                    <input placeholder="Project Name" value={item.name} onChange={(e) => {
                                                        const n = [...resumeData.projects]; n[index].name = e.target.value; setResumeData({ ...resumeData, projects: n });
                                                    }} className="w-full font-bold bg-transparent border-b border-slate-100 dark:border-zinc-800 focus:border-teal-500 outline-none pb-1 text-slate-900 dark:text-white" />
                                                    <input placeholder="Tech Stack" value={item.technologies} onChange={(e) => {
                                                        const n = [...resumeData.projects]; n[index].technologies = e.target.value; setResumeData({ ...resumeData, projects: n });
                                                    }} className="w-full text-xs bg-transparent border-b border-slate-100 dark:border-zinc-800 focus:border-teal-500 outline-none pb-1 text-slate-600 dark:text-slate-300" />
                                                    <AutoResizeTextarea placeholder="Description" value={item.description} onChange={(e: any) => { const n = [...resumeData.projects]; n[index].description = e.target.value; setResumeData({ ...resumeData, projects: n }); }} className="w-full text-sm bg-slate-50 dark:bg-zinc-950 p-2 rounded focus:border-teal-500 outline-none text-slate-800 dark:text-slate-200" />
                                                </>
                                            )}
                                            {activeTab === 'education' && (
                                                <>
                                                    <input placeholder="Institution" value={item.institution} onChange={(e) => { const n = [...resumeData.education]; n[index].institution = e.target.value; setResumeData({ ...resumeData, education: n }) }} className="w-full font-bold border-b border-slate-100 dark:border-zinc-800 outline-none pb-1 bg-transparent text-slate-900 dark:text-white" />
                                                    <input placeholder="Degree" value={item.degree} onChange={(e) => { const n = [...resumeData.education]; n[index].degree = e.target.value; setResumeData({ ...resumeData, education: n }) }} className="w-full text-sm border-b border-slate-100 dark:border-zinc-800 outline-none pb-1 bg-transparent text-slate-600 dark:text-slate-300" />
                                                    <div className="flex gap-2"><input placeholder="Start" value={item.startDate} onChange={(e) => { const n = [...resumeData.education]; n[index].startDate = e.target.value; setResumeData({ ...resumeData, education: n }) }} className="w-1/2 text-xs border-b border-slate-100 dark:border-zinc-800 outline-none bg-transparent text-slate-500 dark:text-slate-400" /> <input placeholder="End" value={item.endDate} onChange={(e) => { const n = [...resumeData.education]; n[index].endDate = e.target.value; setResumeData({ ...resumeData, education: n }) }} className="w-1/2 text-xs border-b border-slate-100 dark:border-zinc-800 outline-none bg-transparent text-slate-500 dark:text-slate-400" /></div>
                                                </>
                                            )}
                                            {activeTab === 'certifications' && (
                                                <>
                                                    <input placeholder="Certification Name" value={item.name} onChange={(e) => { const n = [...resumeData.certifications]; n[index].name = e.target.value; setResumeData({ ...resumeData, certifications: n }); }} className="w-full font-bold bg-transparent border-b border-slate-100 dark:border-zinc-800 outline-none pb-1 text-slate-900 dark:text-white" />
                                                    <input placeholder="Issuer" value={item.issuer} onChange={(e) => { const n = [...resumeData.certifications]; n[index].issuer = e.target.value; setResumeData({ ...resumeData, certifications: n }); }} className="w-full text-sm bg-transparent border-b border-slate-100 dark:border-zinc-800 outline-none pb-1 text-slate-600 dark:text-slate-300" />
                                                    <input placeholder="Date" value={item.date} onChange={(e) => { const n = [...resumeData.certifications]; n[index].date = e.target.value; setResumeData({ ...resumeData, certifications: n }); }} className="w-full text-xs bg-transparent border-b border-slate-100 dark:border-zinc-800 outline-none pb-1 text-slate-500 dark:text-slate-400" />
                                                </>
                                            )}
                                            {activeTab === 'languages' && (
                                                <>
                                                    <input placeholder="Language" value={item.language} onChange={(e) => { const n = [...resumeData.languages]; n[index].language = e.target.value; setResumeData({ ...resumeData, languages: n }); }} className="w-full font-bold bg-transparent border-b border-slate-100 dark:border-zinc-800 outline-none pb-1 text-slate-900 dark:text-white" />
                                                    <input placeholder="Proficiency" value={item.proficiency} onChange={(e) => { const n = [...resumeData.languages]; n[index].proficiency = e.target.value; setResumeData({ ...resumeData, languages: n }); }} className="w-full text-sm bg-transparent border-b border-slate-100 dark:border-zinc-800 outline-none pb-1 text-slate-600 dark:text-slate-300" />
                                                </>
                                            )}
                                            {activeTab === 'awards' && (
                                                <>
                                                    <input placeholder="Award Title" value={item.title} onChange={(e) => { const n = [...resumeData.awards]; n[index].title = e.target.value; setResumeData({ ...resumeData, awards: n }); }} className="w-full font-bold bg-transparent border-b border-slate-100 dark:border-zinc-800 focus:border-teal-500 outline-none pb-1 text-slate-900 dark:text-white" />
                                                    <input placeholder="Issuer" value={item.issuer} onChange={(e) => { const n = [...resumeData.awards]; n[index].issuer = e.target.value; setResumeData({ ...resumeData, awards: n }); }} className="w-full text-sm bg-transparent border-b border-slate-100 dark:border-zinc-800 outline-none pb-1 text-slate-600 dark:text-slate-300" />
                                                    <input placeholder="Date" value={item.date} onChange={(e) => { const n = [...resumeData.awards]; n[index].date = e.target.value; setResumeData({ ...resumeData, awards: n }); }} className="w-full text-xs bg-transparent border-b border-slate-100 dark:border-zinc-800 outline-none pb-1 text-slate-500 dark:text-slate-400" />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        // @ts-ignore
                                        const newItem = activeTab === 'projects' ? { id: Date.now(), name: '', description: '', link: '', technologies: '' }
                                            : activeTab === 'certifications' ? { id: Date.now(), name: '', issuer: '', date: '', link: '' }
                                                : activeTab === 'awards' ? { id: Date.now(), title: '', issuer: '', date: '', description: '' }
                                                    : activeTab === 'languages' ? { id: Date.now(), language: '', proficiency: '' }
                                                        : activeTab === 'education' ? { id: Date.now(), institution: '', degree: '', startDate: '', endDate: '', location: '', gpa: '' }
                                                            : { id: Date.now(), company: '', role: '', startDate: '', endDate: '', description: '', location: '' };
                                        // @ts-ignore
                                        setResumeData({ ...resumeData, [activeTab]: [...resumeData[activeTab], newItem] })
                                    }}
                                    className="w-full py-3 border-2 border-dashed rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors border-slate-200 dark:border-zinc-800 text-slate-400 hover:border-teal-500 hover:text-teal-500"
                                >
                                    <Plus className="w-4 h-4" /> Add Item
                                </button>
                            </div>
                        )}

                        {activeTab === 'skills' && (
                            <div className="space-y-6">
                                {resumeData.skills.map((skill, index) => (
                                    <div key={skill.id} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 relative group">
                                        <button onClick={() => { const n = [...resumeData.skills]; n.splice(index, 1); setResumeData({ ...resumeData, skills: n }) }} className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                                        <input placeholder="Category" value={skill.category} onChange={(e) => { const n = [...resumeData.skills]; n[index].category = e.target.value; setResumeData({ ...resumeData, skills: n }) }} className="w-full font-bold bg-transparent border-b border-slate-100 dark:border-zinc-800 outline-none pb-1 mb-2 text-slate-900 dark:text-white" />
                                        <AutoResizeTextarea placeholder="Skills (comma separated)" value={skill.items} onChange={(e: any) => { const n = [...resumeData.skills]; n[index].items = e.target.value; setResumeData({ ...resumeData, skills: n }) }} className="w-full text-sm bg-slate-50 dark:bg-zinc-950 p-2 rounded focus:border-teal-500 outline-none text-slate-800 dark:text-slate-200" />
                                    </div>
                                ))}
                                <button
                                    onClick={() => setResumeData({ ...resumeData, skills: [...resumeData.skills, { id: Date.now().toString(), category: '', items: '' }] })}
                                    className="w-full py-3 border-dashed border-2 rounded-xl flex justify-center items-center gap-2 text-sm font-bold transition-colors border-slate-200 dark:border-zinc-800 text-slate-400 hover:border-teal-500 hover:text-teal-500"
                                >
                                    <Plus className="w-4 h-4" /> Add Category
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Live Preview */}
                <div className="flex-1 bg-slate-200 dark:bg-zinc-900/50 p-8 overflow-y-auto flex flex-col items-center">
                    <div
                        id="resume-preview-area"
                        className="origin-top transform transition-transform duration-300"
                        style={{ transform: `scale(${scale})` }}
                    >
                        <div
                            ref={resumePreviewRef}
                            className="resume-page"
                            style={{ width: '8.5in', height: '11in', overflow: 'hidden', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                        >
                            <ActiveTemplate data={resumeData} order={sectionOrder} font={font} scale={1} />
                        </div>
                    </div>

                    {/* Zoom Controls */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-8 right-8 flex items-center gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl px-2 py-2 rounded-2xl shadow-2xl shadow-black/10 border border-slate-200/50 dark:border-zinc-700/50 z-50"
                    >
                        <motion.button
                            onClick={() => setScale(s => Math.max(0.4, s - 0.1))}
                            className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            −
                        </motion.button>
                        <div className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-lg min-w-[60px] text-center">
                            <span className="text-sm font-bold text-slate-700 dark:text-white">{Math.round(scale * 100)}%</span>
                        </div>
                        <motion.button
                            onClick={() => setScale(s => Math.min(1.5, s + 0.1))}
                            className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            +
                        </motion.button>
                        <div className="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1" />
                        <motion.button
                            onClick={() => setScale(0.8)}
                            className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Reset
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;

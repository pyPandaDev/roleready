import React, { useState, useEffect } from 'react';
import {
    Loader2, Sparkles, ExternalLink, BookOpen, Video, FileText,
    Code, CheckCircle, Target, Clock, Zap, ArrowRight, GraduationCap,
    Save, FolderOpen, Trash2, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCareerRoadmap, listRoadmaps, saveRoadmap, getRoadmap, updateRoadmapProgress, deleteRoadmap } from '../services/geminiService';
import { useToast } from '../context/ToastContext';

interface CareerRoadmapProps {
    setView: (view: string) => void;
}

interface Resource {
    name: string;
    type: string;
    url?: string;
}

interface Phase {
    name: string;
    duration: string;
    description?: string;
    milestones: { task: string; completed: boolean }[];
    skills: string[];
    resources: Resource[];
}

interface RoadmapResult {
    goal: string;
    estimatedTime: string;
    phases: Phase[];
}

interface SavedRoadmapItem {
    id: string;
    goal: string;
    estimatedTime: string;
    phases: Phase[];
    completedItems: string[];
    createdAt?: string;
}

const CareerRoadmap: React.FC<CareerRoadmapProps> = ({ setView }) => {
    const [careerGoal, setCareerGoal] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [roadmap, setRoadmap] = useState<RoadmapResult | null>(null);
    const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
    const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
    const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmapItem[]>([]);
    const [currentRoadmapId, setCurrentRoadmapId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [showSavedList, setShowSavedList] = useState(false);
    const toast = useToast();

    useEffect(() => {
        loadSavedRoadmaps();
    }, []);

    const loadSavedRoadmaps = async () => {
        setIsLoadingList(true);
        try {
            const result = await listRoadmaps();
            setSavedRoadmaps(result.roadmaps || []);
        } catch (error) {
            console.error('Failed to load saved roadmaps:', error);
        } finally {
            setIsLoadingList(false);
        }
    };

    const handleGenerate = async () => {
        if (!careerGoal.trim()) {
            toast.warning('Please enter your career goal');
            return;
        }
        setIsGenerating(true);
        try {
            const result = await generateCareerRoadmap(careerGoal, '', 0);
            setRoadmap(result);
            setSelectedPhase(0);
            setCompletedItems(new Set());
            setCurrentRoadmapId(null);
            toast.success('Your roadmap is ready!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate roadmap');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!roadmap) return;
        setIsSaving(true);
        try {
            if (currentRoadmapId) {
                await updateRoadmapProgress(currentRoadmapId, Array.from(completedItems));
                toast.success('Progress updated!');
            } else {
                const result = await saveRoadmap({
                    goal: roadmap.goal,
                    estimatedTime: roadmap.estimatedTime,
                    phases: roadmap.phases,
                    completedItems: Array.from(completedItems),
                });
                setCurrentRoadmapId(result.id);
                toast.success('Roadmap saved!');
            }
            loadSavedRoadmaps();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save roadmap');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLoad = async (id: string) => {
        try {
            const data = await getRoadmap(id);
            setRoadmap({
                goal: data.goal,
                estimatedTime: data.estimatedTime,
                phases: data.phases,
            });
            setCompletedItems(new Set(data.completedItems || []));
            setCurrentRoadmapId(id);
            setSelectedPhase(0);
            setShowSavedList(false);
            toast.success('Roadmap loaded!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to load roadmap');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this roadmap?')) return;
        try {
            await deleteRoadmap(id);
            toast.success('Roadmap deleted');
            loadSavedRoadmaps();
            if (currentRoadmapId === id) {
                setRoadmap(null);
                setCurrentRoadmapId(null);
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const toggleComplete = async (phaseIdx: number, milestoneIdx: number) => {
        const key = `${phaseIdx}-${milestoneIdx}`;
        const newSet = new Set(completedItems);
        if (newSet.has(key)) newSet.delete(key);
        else newSet.add(key);
        setCompletedItems(newSet);

        if (currentRoadmapId) {
            try {
                await updateRoadmapProgress(currentRoadmapId, Array.from(newSet));
            } catch (error) {
                console.error('Failed to save progress:', error);
            }
        }
    };

    const getPhaseProgress = (phaseIdx: number) => {
        if (!roadmap) return 0;
        const phase = roadmap.phases[phaseIdx];
        if (!phase.milestones?.length) return 0;
        let completed = 0;
        phase.milestones.forEach((_, mIdx) => {
            if (completedItems.has(`${phaseIdx}-${mIdx}`)) completed++;
        });
        return Math.round((completed / phase.milestones.length) * 100);
    };

    const getResourceIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'video': return <Video size={14} />;
            case 'course': return <GraduationCap size={14} />;
            case 'project': return <Code size={14} />;
            default: return <FileText size={14} />;
        }
    };

    const phaseColors = [
        { bg: 'from-violet-600 to-indigo-600', light: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
        { bg: 'from-emerald-600 to-teal-600', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
        { bg: 'from-amber-600 to-orange-600', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
        { bg: 'from-rose-600 to-pink-600', light: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="relative z-10">
                {/* Header */}
                <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        {/* My Roadmaps Dropdown - Left Side */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSavedList(!showSavedList)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <FolderOpen size={16} />
                                My Roadmaps
                                {savedRoadmaps.length > 0 && (
                                    <span className="bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded-full">
                                        {savedRoadmaps.length}
                                    </span>
                                )}
                                <ChevronDown size={14} />
                            </button>

                            {showSavedList && (
                                <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                                    {isLoadingList ? (
                                        <div className="py-4 text-center text-slate-400">Loading...</div>
                                    ) : savedRoadmaps.length === 0 ? (
                                        <div className="py-4 text-center text-slate-400 text-sm">No saved roadmaps</div>
                                    ) : (
                                        savedRoadmaps.map((rm) => {
                                            const totalMilestones = rm.phases?.reduce((acc, p) => acc + (p.milestones?.length || 0), 0) || 0;
                                            const completedCount = rm.completedItems?.length || 0;
                                            const progressPercent = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

                                            return (
                                                <div
                                                    key={rm.id}
                                                    onClick={() => handleLoad(rm.id)}
                                                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer group ${currentRoadmapId === rm.id ? 'bg-indigo-50' : ''}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-slate-900 truncate">{rm.goal}</div>
                                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                                <span>{rm.estimatedTime}</span>
                                                                <span>•</span>
                                                                <span className={progressPercent === 100 ? 'text-emerald-600 font-medium' : ''}>
                                                                    {progressPercent}% complete
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => handleDelete(rm.id, e)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 hover:text-red-500 rounded transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                            style={{ width: `${progressPercent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2">
                            {roadmap && (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {currentRoadmapId ? 'Saved ✓' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => { setRoadmap(null); setSelectedPhase(null); setCompletedItems(new Set()); setCurrentRoadmapId(null); }}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        + New
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {!roadmap ? (
                    /* INPUT SCREEN */
                    <div className="max-w-2xl mx-auto px-6 py-16">
                        <div className="text-center mb-12">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30"
                            >
                                <Target size={36} />
                            </motion.div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-3">
                                Where Do You Want To Be?
                            </h2>
                            <p className="text-slate-500 text-lg">
                                Tell us your dream role and we'll create a personalized learning roadmap
                            </p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8"
                        >
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Target Role
                                </label>
                                <input
                                    type="text"
                                    value={careerGoal}
                                    onChange={(e) => setCareerGoal(e.target.value)}
                                    placeholder="e.g., Data Scientist, Backend Developer, ML Engineer"
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-lg"
                                />
                            </div>

                            <motion.button
                                onClick={handleGenerate}
                                disabled={isGenerating || !careerGoal.trim()}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={22} className="animate-spin" />
                                        <span>Crafting Your Roadmap...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={22} />
                                        <span>Generate Roadmap</span>
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </div>
                ) : (
                    /* ROADMAP DISPLAY */
                    <div className="flex min-h-[calc(100vh-73px)]">
                        {/* LEFT: Timeline */}
                        <div className="w-80 bg-white border-r border-slate-200 p-6 overflow-y-auto">
                            <div className="mb-8 p-4 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                                <div className="flex items-center gap-2 text-indigo-200 text-xs font-medium mb-2">
                                    <Target size={12} />
                                    GOAL
                                </div>
                                <h3 className="font-bold text-lg leading-tight mb-2">{roadmap.goal}</h3>
                                <div className="flex items-center gap-1.5 text-indigo-200 text-sm">
                                    <Clock size={14} />
                                    {roadmap.estimatedTime}
                                </div>
                                {currentRoadmapId && (
                                    <div className="mt-3 pt-3 border-t border-indigo-400/30 text-xs text-indigo-200 flex items-center gap-1">
                                        <CheckCircle size={12} />
                                        Progress auto-saved
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                {roadmap.phases.map((phase, idx) => {
                                    const colors = phaseColors[idx % phaseColors.length];
                                    const progress = getPhaseProgress(idx);
                                    const isSelected = selectedPhase === idx;

                                    return (
                                        <motion.button
                                            key={idx}
                                            onClick={() => setSelectedPhase(idx)}
                                            className={`w-full text-left p-4 rounded-xl transition-all ${isSelected
                                                    ? `${colors.light} ${colors.border} border-2 shadow-sm`
                                                    : 'hover:bg-slate-50 border-2 border-transparent'
                                                }`}
                                            whileHover={{ x: 4 }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`font-semibold text-sm leading-tight mb-1 ${isSelected ? colors.text : 'text-slate-700'}`}>
                                                        {phase.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-slate-400">{phase.duration}</span>
                                                        {progress > 0 && (
                                                            <span className={`text-xs font-medium ${colors.text}`}>{progress}%</span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full bg-gradient-to-r ${colors.bg} transition-all`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* RIGHT: Phase Details */}
                        <div className="flex-1 p-8 overflow-y-auto">
                            <AnimatePresence mode="wait">
                                {selectedPhase !== null && roadmap.phases[selectedPhase] && (
                                    <motion.div
                                        key={selectedPhase}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="max-w-3xl"
                                    >
                                        {(() => {
                                            const phase = roadmap.phases[selectedPhase];
                                            const colors = phaseColors[selectedPhase % phaseColors.length];
                                            const progress = getPhaseProgress(selectedPhase);

                                            return (
                                                <>
                                                    <div className="mb-8">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${colors.bg}`}>
                                                                Phase {selectedPhase + 1}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{phase.duration}</span>
                                                        </div>
                                                        <h2 className="text-3xl font-bold text-slate-900 mb-4">{phase.name}</h2>

                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    className={`h-full bg-gradient-to-r ${colors.bg}`}
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${progress}%` }}
                                                                />
                                                            </div>
                                                            <span className={`text-sm font-bold ${colors.text}`}>{progress}%</span>
                                                        </div>
                                                    </div>

                                                    {/* Milestones */}
                                                    <div className="mb-8">
                                                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                            <CheckCircle size={16} />
                                                            Milestones
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {phase.milestones?.map((milestone, mIdx) => {
                                                                const isComplete = completedItems.has(`${selectedPhase}-${mIdx}`);
                                                                return (
                                                                    <motion.div
                                                                        key={mIdx}
                                                                        onClick={() => toggleComplete(selectedPhase, mIdx)}
                                                                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${isComplete
                                                                                ? 'bg-emerald-50 border-emerald-200'
                                                                                : 'bg-white border-slate-200 hover:border-slate-300'
                                                                            }`}
                                                                        whileHover={{ scale: 1.01 }}
                                                                        whileTap={{ scale: 0.99 }}
                                                                    >
                                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isComplete
                                                                                ? 'bg-emerald-500 text-white'
                                                                                : 'border-2 border-slate-300'
                                                                            }`}>
                                                                            {isComplete && <CheckCircle size={14} />}
                                                                        </div>
                                                                        <span className={`text-sm leading-relaxed ${isComplete ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>
                                                                            {milestone.task}
                                                                        </span>
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Skills */}
                                                    {phase.skills?.length > 0 && (
                                                        <div className="mb-8">
                                                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                <Zap size={16} />
                                                                Key Skills
                                                            </h3>
                                                            <div className="flex flex-wrap gap-2">
                                                                {phase.skills.map((skill, sIdx) => (
                                                                    <span
                                                                        key={sIdx}
                                                                        className={`px-4 py-2 rounded-lg text-sm font-medium ${colors.light} ${colors.text} border ${colors.border}`}
                                                                    >
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Resources */}
                                                    {phase.resources?.length > 0 && (
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                <BookOpen size={16} />
                                                                Learning Resources
                                                            </h3>
                                                            <div className="grid gap-3">
                                                                {phase.resources.map((resource, rIdx) => (
                                                                    <a
                                                                        key={rIdx}
                                                                        href={resource.url || '#'}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                                                                    >
                                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${resource.type?.toLowerCase() === 'video' ? 'bg-red-100 text-red-600' :
                                                                                resource.type?.toLowerCase() === 'course' ? 'bg-blue-100 text-blue-600' :
                                                                                    resource.type?.toLowerCase() === 'project' ? 'bg-emerald-100 text-emerald-600' :
                                                                                        'bg-amber-100 text-amber-600'
                                                                            }`}>
                                                                            {getResourceIcon(resource.type)}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                                                {resource.name}
                                                                            </div>
                                                                            <div className="text-xs text-slate-400 capitalize">{resource.type}</div>
                                                                        </div>
                                                                        <ExternalLink size={16} className="text-slate-300 group-hover:text-indigo-500" />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedPhase < roadmap.phases.length - 1 && (
                                                        <div className="mt-8 pt-8 border-t border-slate-100">
                                                            <button
                                                                onClick={() => setSelectedPhase(selectedPhase + 1)}
                                                                className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                                            >
                                                                Continue to Phase {selectedPhase + 2}
                                                                <ArrowRight size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CareerRoadmap;

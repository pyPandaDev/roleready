import React, { useState } from 'react';
import {
   Briefcase, BarChart, Rocket, Building2, Building,
   CheckCircle2, AlertCircle, Check, X, Layers,
   MapPin, Zap, Calendar, GraduationCap, Sparkles, Copy,
   Compass, Search, Globe, ChevronRight, TrendingUp,
   ChevronDown, ChevronUp, Lightbulb, Target, Clock,
   User, Info, BookOpen, ExternalLink
} from 'lucide-react';
import { AnalysisResult } from '../types';
import CircularProgress from '../components/ui/CircularProgress';
import { cn, getOddsColor, getOddsWidth, getOddsColorClass } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import StatCard from '../components/ui/StatCard';
import RadarChart from '../components/ui/RadarChart';

interface DashboardProps {
   result: AnalysisResult;
   targetRole: string;
   setResult: (result: AnalysisResult | null) => void;
   resultRef: React.RefObject<HTMLDivElement | null>;
}

// Mock score breakdown data (can be replaced with API data later)
const getScoreBreakdown = (totalScore: number) => {
   const base = totalScore / 100;
   return [
      { name: 'ATS Keywords Match', score: Math.round(base * 3 + Math.random() * 2), max: 10, explanation: 'Missing key tech stack matches' },
      { name: 'Impact Quantification', score: Math.round(base * 2 + Math.random() * 2), max: 10, explanation: 'No metrics or numbers in bullets' },
      { name: 'Action Verbs Quality', score: Math.round(base * 4 + Math.random() * 2), max: 10, explanation: 'Weak action words like "helped" instead of "led"' },
      { name: 'Leadership/Ownership', score: Math.round(base * 2 + Math.random() * 2), max: 10, explanation: 'No evidence of taking initiative' },
      { name: 'Technical Depth', score: Math.round(base * 4 + Math.random() * 2), max: 10, explanation: 'Too brief for a senior-level role' },
   ];
};

const Dashboard: React.FC<DashboardProps> = ({ result, targetRole, setResult, resultRef }) => {

   const [showTips, setShowTips] = useState(false);
   const [expandedSectors, setExpandedSectors] = useState<{ [key: string]: 'why' | 'how' | null }>({});
   const [completedItems, setCompletedItems] = useState<{ [key: string]: boolean }>({});
   const scoreBreakdown = getScoreBreakdown(result.match_score);

   const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
   };

   // Clean markdown ** from text
   const cleanText = (text: string) => {
      return text.replace(/\*\*/g, '').replace(/\*/g, '');
   };

   // Get percentage for progress bars
   const getOddsPercent = (level: string) => {
      const l = level.toLowerCase();
      if (l.includes('high')) return 90;
      if (l.includes('medium')) return 60;
      return 30;
   };

   const toggleSectorExpand = (sector: string, type: 'why' | 'how') => {
      setExpandedSectors(prev => ({
         ...prev,
         [sector]: prev[sector] === type ? null : type
      }));
   };

   const toggleComplete = (key: string) => {
      setCompletedItems(prev => ({ ...prev, [key]: !prev[key] }));
   };

   // Parse summary into issues (mock parsing based on content)
   const parseIssues = () => {
      const issues = [
         { type: 'critical', icon: '❌', title: 'No Quantification', explanation: 'Your bullets don\'t include numbers, percentages, or metrics', impact: 'Makes it impossible for recruiters to gauge your actual impact' },
         { type: 'critical', icon: '❌', title: 'No Senior-Level Evidence', explanation: 'You mention junior-level tasks, not senior responsibilities', impact: 'Hiring managers will not consider you for Sr. roles' },
         { type: 'high', icon: '⚠️', title: 'Resume Too Brief', explanation: 'Your entire resume is 2 paragraphs. Senior roles need 4-5 strong projects', impact: 'Appears like you lack depth or experience' },
         { type: 'high', icon: '⚠️', title: 'Generic Responsibilities', explanation: 'Phrases like "worked on", "helped with" are too vague', impact: 'Doesn\'t show ownership or initiative' },
         { type: 'positive', icon: '💡', title: 'Good Foundation', explanation: 'You do have relevant skills listed', opportunity: 'These are the right tech stack for the target role' },
      ];
      return issues;
   };

   // Group gaps by priority
   const groupGapsByPriority = () => {
      const gaps = result.gaps;
      const immediate = gaps.slice(0, Math.ceil(gaps.length * 0.3));
      const thisWeek = gaps.slice(Math.ceil(gaps.length * 0.3), Math.ceil(gaps.length * 0.6));
      const later = gaps.slice(Math.ceil(gaps.length * 0.6));

      return { immediate, thisWeek, later };
   };

   // Group skills by learning phase
   const groupSkillsByPhase = () => {
      const technical = [...result.missing_skills.technical, ...result.missing_skills.tools];
      const soft = [...result.missing_skills.soft_skills, ...result.missing_skills.domain];

      const phase1 = technical.slice(0, Math.ceil(technical.length * 0.4));
      const phase2 = technical.slice(Math.ceil(technical.length * 0.4), Math.ceil(technical.length * 0.7));
      const phase3 = [...technical.slice(Math.ceil(technical.length * 0.7)), ...soft];

      return { phase1, phase2, phase3 };
   };

   const issues = parseIssues();
   const groupedGaps = groupGapsByPriority();
   const groupedSkills = groupSkillsByPhase();

   // Prepare Radar Chart Data - Use sub_scores if available, else fallback
   const radarData = result.sub_scores ? [
      { label: 'Format', value: Math.round(result.sub_scores.format_score / 10), fullMark: 10 },
      { label: 'Content', value: Math.round(result.sub_scores.content_score / 10), fullMark: 10 },
      { label: 'Keywords', value: Math.round(result.sub_scores.keyword_score / 10), fullMark: 10 },
      { label: 'Impact', value: Math.round(result.sub_scores.impact_score / 10), fullMark: 10 },
      { label: 'Role Match', value: Math.round(result.sub_scores.role_match_score / 10), fullMark: 10 },
   ] : [
      { label: 'Technical', value: 10 - (result.missing_skills.technical.length > 5 ? 5 : result.missing_skills.technical.length), fullMark: 10 },
      { label: 'Soft Skills', value: 10 - (result.missing_skills.soft_skills.length > 5 ? 5 : result.missing_skills.soft_skills.length), fullMark: 10 },
      { label: 'Tools', value: 10 - (result.missing_skills.tools.length > 5 ? 5 : result.missing_skills.tools.length), fullMark: 10 },
      { label: 'Domain', value: 10 - (result.missing_skills.domain.length > 5 ? 5 : result.missing_skills.domain.length), fullMark: 10 },
      { label: 'Experience', value: Math.min(10, result.match_score / 10), fullMark: 10 },
   ];

   const containerVariants = {
      hidden: { opacity: 0 },
      show: {
         opacity: 1,
         transition: {
            staggerChildren: 0.1
         }
      }
   };

   return (
      <motion.div
         variants={containerVariants}
         initial="hidden"
         animate="show"
         id="analysis-report-content"
         ref={resultRef}
         className="max-w-7xl mx-auto space-y-6"
      >
         {/* Dashboard Header */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-zinc-800">
            <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3 h-3" /> AI Analysis Complete
               </div>
               <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Analysis Report</h2>
               <p className="text-lg text-slate-600 dark:text-zinc-400">Targeting: <span className="font-bold text-slate-900 dark:text-white border-b-2 border-teal-500/30">{targetRole}</span></p>
            </div>
            <div className="flex gap-3">
               <button onClick={() => { setResult(null); }} className="px-6 py-2.5 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm">
                  <Search className="w-4 h-4" /> New Analysis
               </button>
            </div>
         </div>

         <div className="dashboard-grid">

            {/* 1. SCORE CARD - Enhanced with Sub-Scores */}
            <StatCard colSpan={5} className="flex flex-col items-center justify-center text-center relative overflow-hidden bg-white dark:bg-zinc-900">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 via-blue-500 to-emerald-500"></div>

               {/* Current Score */}
               <div className="mb-3">
                  <CircularProgress score={result.atsScore || result.match_score} size={140} />
               </div>
               <h3 className="font-bold text-lg text-slate-900 dark:text-white">ATS Score</h3>
               <p className={`text-sm font-bold mb-4 ${(result.atsScore || result.match_score) >= 80 ? 'text-emerald-600' :
                  (result.atsScore || result.match_score) >= 65 ? 'text-blue-600' :
                     (result.atsScore || result.match_score) >= 50 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                  {result.verdict || (
                     (result.atsScore || result.match_score) >= 80 ? 'Interview Ready' :
                        (result.atsScore || result.match_score) >= 65 ? 'Good Foundation' :
                           (result.atsScore || result.match_score) >= 50 ? 'Average' : 'Needs Work'
                  )}
               </p>

               {/* Sub-Scores Grid */}
               {result.sub_scores && (
                  <div className="w-full space-y-2 px-2">
                     {[
                        { label: 'Format', value: result.sub_scores.format_score, color: 'bg-blue-500' },
                        { label: 'Content', value: result.sub_scores.content_score, color: 'bg-purple-500' },
                        { label: 'Keywords', value: result.sub_scores.keyword_score, color: 'bg-teal-500' },
                        { label: 'Impact', value: result.sub_scores.impact_score, color: 'bg-amber-500' },
                        { label: 'Role Match', value: result.sub_scores.role_match_score, color: 'bg-emerald-500' },
                     ].map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                           <span className="text-[10px] w-16 text-left text-slate-500 font-medium">{s.label}</span>
                           <div className="flex-1 h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div className={`h-full ${s.color} rounded-full transition-all duration-500`} style={{ width: `${s.value}%` }}></div>
                           </div>
                           <span className="text-[10px] w-8 text-right font-bold text-slate-700 dark:text-zinc-300">{s.value}</span>
                        </div>
                     ))}
                  </div>
               )}

               {/* Predicted Score - Compact */}
               <div className="w-full mt-4 p-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                     <div>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Expected After Fixes</span>
                        <div className="flex items-baseline gap-1">
                           <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                              {result.expected_after_improvement?.ats_score || Math.min(95, (result.atsScore || result.match_score) + 20)}
                           </span>
                           <span className="text-xs text-emerald-600/70">
                              (+{Math.min(30, 95 - (result.atsScore || result.match_score))} pts)
                           </span>
                        </div>
                     </div>
                     <TrendingUp className="w-8 h-8 text-emerald-500/30" />
                  </div>
               </div>
            </StatCard>

            {/* 2. EXECUTIVE SUMMARY - Now using real API data */}
            <StatCard colSpan={7} className="flex flex-col">
               <div className="flex items-center gap-3 mb-4">
                  <div className="bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl">
                     <Briefcase className="w-6 h-6 text-slate-600 dark:text-zinc-400" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white">Executive Summary</h3>
               </div>

               {/* AI Summary */}
               <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl mb-4">
                  <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">{cleanText(result.summary)}</p>
               </div>

               {/* Strengths & Gaps Grid */}
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                     <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                     </h4>
                     <ul className="space-y-1.5">
                        {result.strengths.slice(0, 3).map((s, i) => (
                           <li key={i} className="text-xs text-slate-600 dark:text-zinc-400 flex items-start gap-2">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span>{cleanText(s)}</span>
                           </li>
                        ))}
                     </ul>
                  </div>
                  <div>
                     <h4 className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase mb-2">
                        <AlertCircle className="w-3.5 h-3.5" /> Areas to Improve
                     </h4>
                     <ul className="space-y-1.5">
                        {result.gaps.slice(0, 3).map((g, i) => (
                           <li key={i} className="text-xs text-slate-600 dark:text-zinc-400 flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5">•</span>
                              <span>{cleanText(g)}</span>
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>

               {/* Recruiter View - if available */}
               {result.recruiter_view && (
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 mb-4">
                     <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-bold uppercase text-blue-700 dark:text-blue-300">Recruiter's Perspective</span>
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                           <span className="text-slate-500">First Impression:</span>
                           <p className="text-slate-700 dark:text-zinc-300 font-medium">{result.recruiter_view.first_impression}</p>
                        </div>
                        <div>
                           <span className="text-slate-500">Perceived Level:</span>
                           <p className="text-slate-700 dark:text-zinc-300 font-medium">{result.recruiter_view.perceived_level}</p>
                        </div>
                     </div>
                  </div>
               )}

               {/* Interview Readiness Badge */}
               <div className="mt-auto flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 rounded-xl border border-teal-100 dark:border-teal-900/30">
                  <div className="flex items-center gap-2">
                     <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                     <span className="text-xs font-bold uppercase text-teal-700 dark:text-teal-300">Interview Readiness</span>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${result.interview_readiness === 'Ready' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                     result.interview_readiness === 'Needs Prep' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                     }`}>
                     {result.interview_readiness || 'Needs Prep'}
                  </span>
               </div>
            </StatCard>

            {/* 3. SKILLS RADAR + LEARNING ROADMAP */}
            <StatCard colSpan={6} className="min-h-[320px]">
               <div className="flex flex-col items-center justify-center h-full">
                  <h4 className="font-bold text-lg text-slate-700 dark:text-slate-300 mb-2">Resume Score Breakdown</h4>
                  <p className="text-xs text-slate-500 mb-4">Based on your resume analysis</p>
                  <RadarChart data={radarData} size={240} />
               </div>
            </StatCard>

            <StatCard colSpan={6} className="min-h-[320px]">
               <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-teal-500 to-blue-500 p-2 rounded-xl">
                     <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                     <h4 className="font-bold text-lg text-slate-900 dark:text-white">Learning Roadmap</h4>
                     <p className="text-xs text-slate-500">Your growth timeline</p>
                  </div>
               </div>

               <div className="space-y-4">
                  {/* 2 Weeks */}
                  <div className="relative pl-6 border-l-2 border-emerald-300 dark:border-emerald-700">
                     <div className="absolute -left-2 top-0 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Zap className="w-2.5 h-2.5 text-white" />
                     </div>
                     <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">2 Weeks</span>
                        <ul className="mt-1 space-y-1">
                           {result.learning_roadmap.two_weeks.slice(0, 2).map((item, i) => (
                              <li key={i} className="text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-1.5">
                                 <span className="text-emerald-500 mt-0.5">•</span> {cleanText(item)}
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>

                  {/* 1-3 Months */}
                  <div className="relative pl-6 border-l-2 border-amber-300 dark:border-amber-700">
                     <div className="absolute -left-2 top-0 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                        <Clock className="w-2.5 h-2.5 text-white" />
                     </div>
                     <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">1-3 Months</span>
                        <ul className="mt-1 space-y-1">
                           {result.learning_roadmap.one_to_three_months.slice(0, 2).map((item, i) => (
                              <li key={i} className="text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-1.5">
                                 <span className="text-amber-500 mt-0.5">•</span> {cleanText(item)}
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>

                  {/* 3-6 Months */}
                  <div className="relative pl-6 border-l-2 border-blue-300 dark:border-blue-700">
                     <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <Rocket className="w-2.5 h-2.5 text-white" />
                     </div>
                     <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">3-6 Months</span>
                        <ul className="mt-1 space-y-1">
                           {result.learning_roadmap.three_to_six_months.slice(0, 2).map((item, i) => (
                              <li key={i} className="text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-1.5">
                                 <span className="text-blue-500 mt-0.5">•</span> {cleanText(item)}
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>
               </div>
            </StatCard>

            {/* 3. STRATEGY COMPASS - Full Width */}
            <StatCard colSpan={12} className="flex flex-col">
               <div className="flex items-center gap-3 mb-6">
                  <div className="bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl">
                     <Compass className="w-6 h-6 text-slate-600 dark:text-zinc-400" />
                  </div>
                  <div>
                     <h3 className="font-bold text-xl text-slate-900 dark:text-white">Job Search Strategy</h3>
                     <p className="text-sm text-slate-500">Where you best fit in the market</p>
                  </div>
               </div>

               <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-700">
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Top Titles</h4>
                     <ul className="space-y-2">
                        {result.job_search_strategy.suggested_titles.slice(0, 3).map((t, i) => (
                           <li key={i} className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-slate-100 dark:border-zinc-800 shadow-sm">
                              {t}
                              <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">{90 - i * 5}% Match</span>
                           </li>
                        ))}
                     </ul>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-700 flex flex-col justify-center">
                     <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-amber-500 mt-1" />
                        <div>
                           <h4 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-1">Immediate Action</h4>
                           <p className="text-sm italic text-slate-700 dark:text-zinc-300">"{result.job_search_strategy.quick_action_plan}"</p>
                        </div>
                     </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-700">
                     <div className="flex items-center gap-2 mb-4">
                        <BarChart className="w-4 h-4 text-slate-400" />
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Market Fit</h4>
                     </div>
                     <div className="space-y-4">
                        {[
                           { l: 'Startup', v: result.hiring_odds.startup_fit },
                           { l: 'Big Tech', v: result.hiring_odds.big_tech_fit },
                           { l: 'Enterprise', v: result.hiring_odds.consultancy_fit },
                        ].map((item, i) => (
                           <div key={i}>
                              <div className="flex justify-between text-xs font-bold mb-1">
                                 <span className="text-slate-600 dark:text-zinc-400">{item.l}</span>
                                 <span className={getOddsColor(item.v)}>{item.v}</span>
                              </div>
                              <div className="h-2.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                 <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${getOddsPercent(item.v)}%` }}
                                    transition={{ duration: 1, delay: 0.3 + i * 0.15 }}
                                    className={cn("h-full rounded-full", getOddsColorClass(item.v))}
                                 />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </StatCard>

            {/* 6. BULLET REWRITES (Bento Box 6) */}
            <StatCard colSpan={12} className="relative overflow-hidden">
               <div className="flex items-center gap-3 mb-6">
                  <div className="bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl">
                     <Sparkles className="w-6 h-6 text-slate-600 dark:text-zinc-400" />
                  </div>
                  <div>
                     <h3 className="font-bold text-xl text-slate-900 dark:text-white">Bullet Optimizations</h3>
                     <p className="text-sm text-slate-500">Before & After comparison</p>
                  </div>
               </div>

               <div className="grid gap-6">
                  {result.improved_bullets.map((item, i) => (
                     <div key={i} className="grid lg:grid-cols-2 gap-0 border border-slate-200 dark:border-zinc-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-slate-50/50 dark:bg-zinc-800/30 p-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-700">
                           <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                              <X className="w-3 h-3" /> Original
                           </p>
                           <p className="text-slate-500 dark:text-zinc-500 text-sm leading-relaxed italic">"{item.original}"</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 border-l-4 border-emerald-500 relative group">
                           <div className="flex justify-between items-start mb-3">
                              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                 <Check className="w-3 h-3" /> Optimized
                              </p>
                              <button onClick={() => copyToClipboard(item.improved)} className="opacity-100 lg:opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-600 transition-all p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded" title="Copy">
                                 <Copy className="w-4 h-4" />
                              </button>
                           </div>
                           <p className="text-slate-900 dark:text-zinc-100 text-sm leading-relaxed font-medium">"{item.improved}"</p>
                        </div>
                     </div>
                  ))}
               </div>
            </StatCard>

         </div>
      </motion.div>
   );
};

export default Dashboard;

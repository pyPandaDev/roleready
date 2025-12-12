import React, { useState, useRef, useEffect } from 'react';
import { analyzeResume, analyzeResumeWithJD } from './services/geminiService';
import { saveAnalysis, saveJDAnalysis } from './services/dataService';
import { AnalysisResult } from './types';

// Sample data - previously in constants.ts
const SAMPLE_RESUME = `John Doe - Software Engineer
Experience: 3 years at Tech Corp
Skills: JavaScript, React, Node.js, Python
Education: BS Computer Science`;

const SAMPLE_TARGET_ROLE = "Senior Software Engineer";
import Navbar from './components/Navbar';
import AppHeader from './components/AppHeader';
import LandingPage from './pages/LandingPage';
import InputSection from './components/InputSection';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import ResumeBuilder from './pages/ResumeBuilder';
import PricingPage from './pages/PricingPage';
import InterviewPrep from './pages/InterviewPrep';
import PortfolioGenerator from './pages/PortfolioGenerator';
import CareerCoachPage from './pages/CareerCoachPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SkillGapAnalyzer from './pages/SkillGapAnalyzer';
import CareerRoadmap from './pages/CareerRoadmap';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import JDAnalysisDashboard from './pages/JDAnalysisDashboard';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';

type ViewType = 'landing' | 'home' | 'analyze' | 'builder' | 'pricing' | 'interview' | 'portfolio' | 'coach' | 'login' | 'signup' | 'skillgap' | 'roadmap' | 'admin-login' | 'admin-dashboard';

const App: React.FC = () => {
  // --- Auth ---
  const { user, loading } = useAuth();
  const toast = useToast();

  // --- Theme State ---
  const [darkMode, setDarkMode] = useState(false);

  // --- View State (synced with URL hash) ---
  const getInitialView = (): ViewType => {
    const hash = window.location.hash.replace('#', '');
    const validViews: ViewType[] = ['landing', 'home', 'analyze', 'builder', 'pricing', 'interview', 'portfolio', 'coach', 'login', 'signup', 'skillgap', 'roadmap', 'admin-login', 'admin-dashboard'];
    if (validViews.includes(hash as ViewType)) {
      return hash as ViewType;
    }
    return 'landing';
  };

  const [view, setViewInternal] = useState<ViewType>(getInitialView());

  // Wrapper to update view AND browser history
  const setView = (newView: ViewType) => {
    if (newView !== view) {
      window.history.pushState({ view: newView }, '', `#${newView}`);
      setViewInternal(newView);
    }
  };

  // --- Browser Back/Forward Button Support ---
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.view) {
        setViewInternal(event.state.view);
      } else {
        // Fallback to hash
        const hash = window.location.hash.replace('#', '') as ViewType;
        setViewInternal(hash || 'landing');
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Set initial state
    if (!window.history.state?.view) {
      window.history.replaceState({ view }, '', `#${view}`);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- Auth-Based Redirects ---
  useEffect(() => {
    if (loading) return; // Wait for auth to load

    // Skip auth redirects for admin pages
    if (view === 'admin-login' || view === 'admin-dashboard') return;

    // If user is logged in and on landing/login/signup, redirect to home
    if (user && (view === 'landing' || view === 'login' || view === 'signup')) {
      setView('home');
    }

    // If user is NOT logged in and tries to access protected pages, redirect to landing
    const protectedViews: ViewType[] = ['home', 'analyze', 'builder', 'interview', 'portfolio', 'coach', 'skillgap', 'roadmap'];
    if (!user && protectedViews.includes(view)) {
      setView('landing');
    }
  }, [user, loading, view]);

  // --- App State ---
  const [inputType, setInputType] = useState<'upload' | 'text'>('upload');
  const [resumeFile, setResumeFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // JD Analysis Mode
  const [analysisMode, setAnalysisMode] = useState<'role' | 'jd'>('role');
  const [jobDescription, setJobDescription] = useState("");
  const [jdResult, setJdResult] = useState<any>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  // --- Theme Effect ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- Handlers ---
  const handleFillSample = () => {
    setView('analyze');
    setInputType('text');
    setResumeText(SAMPLE_RESUME);
    setTargetRole(SAMPLE_TARGET_ROLE);
    setError(null);
  };

  const handleAnalyze = async () => {
    const hasResume = inputType === 'upload' ? !!resumeFile : !!resumeText.trim();

    if (!hasResume || !targetRole.trim()) {
      setError("Please provide your resume and a target role.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeResume({
        resumeText: inputType === 'text' ? resumeText : undefined,
        resumeFile: inputType === 'upload' && resumeFile ? { mimeType: resumeFile.mimeType, data: resumeFile.data } : undefined,
        targetRole,
      });
      setResult(data);

      // Auto-save analysis to database if user is logged in
      if (user) {
        try {
          await saveAnalysis(targetRole, data, inputType === 'text' ? resumeText : resumeFile?.name);
        } catch (saveErr) {
          console.error('Failed to save analysis:', saveErr);
        }
      }

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Something went wrong during analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // JD Analysis Handler
  const handleJDAnalyze = async () => {
    const hasResume = inputType === 'upload' ? !!resumeFile : !!resumeText.trim();

    if (!hasResume || !jobDescription.trim()) {
      setError("Please provide your resume and job description.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setJdResult(null);

    try {
      const resumeFileData = inputType === 'upload' && resumeFile
        ? { mimeType: resumeFile.mimeType, data: resumeFile.data }
        : null;
      const data = await analyzeResumeWithJD(
        inputType === 'text' ? resumeText : null,
        resumeFileData,
        jobDescription
      );
      setJdResult(data);

      // Auto-save JD analysis if user is logged in
      if (user) {
        try {
          const jobTitle = data.jdAnalysis?.extractedTitle || 'Job Position';
          await saveJDAnalysis(jobTitle, jobDescription, data, inputType === 'text' ? resumeText : resumeFile?.name);
        } catch (saveErr) {
          console.error('Failed to save JD analysis:', saveErr);
        }
      }

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    } catch (err: any) {
      setError(err.message || "Something went wrong during JD analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    const element = document.getElementById('analysis-report-content');
    if (!element) return;

    // @ts-ignore
    if (typeof html2pdf === 'undefined') {
      toast.error("PDF export library not loaded. Please try again.");
      return;
    }

    const wasDark = document.documentElement.classList.contains('dark');
    if (wasDark) {
      document.documentElement.classList.remove('dark');
    }

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Resume_Analysis_${targetRole.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    html2pdf().set(opt).from(element).save().then(() => {
      if (wasDark) {
        document.documentElement.classList.add('dark');
      }
    });
  };

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-content">
        {/* Show AppHeader on all authenticated pages except landing/login/signup/admin */}
        {user && view !== 'login' && view !== 'signup' && view !== 'admin-login' && view !== 'admin-dashboard' && view !== 'landing' && view !== 'builder' && (
          <AppHeader
            setView={setView as any}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            currentView={view}
          />
        )}

        {view === 'builder' ? (
          <main className="main-content">
            <ResumeBuilder setView={setView as any} initialData={resumeText} />
          </main>
        ) : view === 'login' ? (
          <main className="main-content">
            <LoginPage setView={setView} />
          </main>
        ) : view === 'signup' ? (
          <main className="main-content">
            <SignupPage setView={setView} />
          </main>
        ) : view === 'admin-login' ? (
          <main className="main-content">
            <AdminLoginPage setView={setView} />
          </main>
        ) : view === 'admin-dashboard' ? (
          <main className="main-content">
            <AdminDashboard setView={setView} />
          </main>
        ) : view === 'interview' ? (
          <main className="main-content pt-header">
            <InterviewPrep setView={setView as any} />
          </main>
        ) : view === 'home' ? (
          <main className="main-content pb-footer">
            <HomePage setView={setView as any} darkMode={darkMode} setDarkMode={setDarkMode} />
          </main>
        ) : (
          <main
            className={`main-content ${user && view !== 'landing' ? "pb-footer" : "pt-header pb-footer"}`}
          >
            {view === 'landing' && (
              <LandingPage
                setView={setView as any}
                handleFillSample={handleFillSample}
              />
            )}

            {view === 'analyze' && (
              <div className="container full-width-xl">
                {!result && !jdResult ? (
                  <InputSection
                    inputType={inputType}
                    setInputType={setInputType}
                    targetRole={targetRole}
                    setTargetRole={setTargetRole}
                    resumeFile={resumeFile}
                    setResumeFile={setResumeFile}
                    resumeText={resumeText}
                    setResumeText={setResumeText}
                    error={error}
                    setError={setError}
                    isLoading={isLoading}
                    handleAnalyze={handleAnalyze}
                    onSelectAnalysis={(savedResult, savedRole) => {
                      setTargetRole(savedRole);
                      setResult(savedResult);
                    }}
                    analysisMode={analysisMode}
                    setAnalysisMode={setAnalysisMode}
                    jobDescription={jobDescription}
                    setJobDescription={setJobDescription}
                    handleJDAnalyze={handleJDAnalyze}
                    onSelectJDAnalysis={(savedResult) => {
                      setJdResult(savedResult);
                    }}
                  />
                ) : jdResult ? (
                  <JDAnalysisDashboard
                    result={jdResult}
                    setResult={setJdResult}
                    resultRef={resultRef}
                  />
                ) : (
                  <Dashboard
                    result={result}
                    targetRole={targetRole}
                    setResult={setResult}
                    resultRef={resultRef}
                  />
                )}
              </div>
            )}

            {view === 'pricing' && (
              <PricingPage setView={setView as any} />
            )}

            {view === 'portfolio' && (
              <PortfolioGenerator setView={setView as any} />
            )}

            {view === 'coach' && (
              <CareerCoachPage setView={setView as any} />
            )}

            {view === 'skillgap' && (
              <SkillGapAnalyzer setView={setView as any} />
            )}

            {view === 'roadmap' && (
              <CareerRoadmap setView={setView as any} />
            )}
          </main>
        )}
      </div>
    </div>
  );
};

export default App;

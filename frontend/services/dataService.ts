/**
 * Data Service - Authenticated API calls for user data persistence
 * Uses Firebase auth token for all requests
 */

import { auth } from '../firebase/client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Get Firebase auth token for authenticated requests
 */
async function getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
}

/**
 * Authenticated API request helper
 */
async function authRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
): Promise<T> {
    const token = await getAuthToken();

    if (!token) {
        throw new Error('User not authenticated');
    }

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const config: RequestInit = {
        method,
        headers,
    };

    if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || 'API request failed');
    }

    return response.json();
}

// ============ RESUMES ============

export const saveResume = async (title: string, content: any) => {
    return authRequest('/api/data/resumes', 'POST', { title, content });
};

export const getResumes = async () => {
    return authRequest<{ resumes: any[] }>('/api/data/resumes', 'GET');
};

export const getResume = async (id: string) => {
    return authRequest(`/api/data/resumes/${id}`, 'GET');
};

export const deleteResume = async (id: string) => {
    return authRequest(`/api/data/resumes/${id}`, 'DELETE');
};

// ============ ANALYSES ============

export const saveAnalysis = async (targetRole: string, result: any, resumeSnapshot?: string) => {
    return authRequest('/api/data/analyses', 'POST', { targetRole, result, resumeSnapshot });
};

export const getAnalyses = async () => {
    return authRequest<{ analyses: any[] }>('/api/data/analyses', 'GET');
};

export const deleteAnalysis = async (id: string) => {
    return authRequest(`/api/data/analyses/${id}`, 'DELETE');
};

// ============ JD ANALYSES (Job Description Match) ============

export const saveJDAnalysis = async (jobTitle: string, jobDescription: string, result: any, resumeSnapshot?: string) => {
    return authRequest('/api/data/jd-analyses', 'POST', { jobTitle, jobDescription, result, resumeSnapshot });
};

export const getJDAnalyses = async () => {
    return authRequest<{ analyses: any[] }>('/api/data/jd-analyses', 'GET');
};

export const deleteJDAnalysis = async (id: string) => {
    return authRequest(`/api/data/jd-analyses/${id}`, 'DELETE');
};

// ============ COVER LETTERS ============

export const saveCoverLetter = async (jobTitle: string, company: string, content: string) => {
    return authRequest('/api/data/cover-letters', 'POST', { jobTitle, company, content });
};

export const getCoverLetters = async () => {
    return authRequest<{ coverLetters: any[] }>('/api/data/cover-letters', 'GET');
};

// ============ INTERVIEWS ============

export const saveInterview = async (role: string, questions: any[], score?: number, feedback?: string) => {
    return authRequest('/api/data/interviews', 'POST', { role, questions, score, feedback });
};

export const getInterviews = async () => {
    return authRequest<{ interviews: any[] }>('/api/data/interviews', 'GET');
};

// ============ PORTFOLIOS ============

export const savePortfolio = async (name: string, htmlContent: string) => {
    return authRequest('/api/data/portfolios', 'POST', { name, htmlContent });
};

export const getPortfolios = async () => {
    return authRequest<{ portfolios: any[] }>('/api/data/portfolios', 'GET');
};

// ============ EMAILS ============

export const saveEmail = async (recipient: string, company: string, subject: string, body: string) => {
    return authRequest('/api/data/emails', 'POST', { recipient, company, subject, body });
};

export const getEmails = async () => {
    return authRequest<{ emails: any[] }>('/api/data/emails', 'GET');
};

// ============ INTERVIEW PROGRESS ============

export interface InterviewProgress {
    role: string;
    experienceLevel: string;
    completedQuestions: string[];
    answers: Record<string, string>;
    evaluation: any | null;
}

export const getInterviewProgress = async (): Promise<InterviewProgress> => {
    return authRequest<InterviewProgress>('/api/data/interview-progress', 'GET');
};

export const saveInterviewProgress = async (progress: InterviewProgress) => {
    return authRequest('/api/data/interview-progress', 'POST', progress);
};

export const clearInterviewProgress = async () => {
    return authRequest('/api/data/interview-progress', 'DELETE');
};

// ============ COACH CONVERSATIONS ============

export interface CoachConversation {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    title?: string;
}

export const getCurrentCoachConversation = async (): Promise<CoachConversation> => {
    return authRequest<CoachConversation>('/api/data/coach-conversations/current', 'GET');
};

export const saveCoachConversation = async (convo: CoachConversation) => {
    return authRequest('/api/data/coach-conversations/current', 'POST', convo);
};

export const startNewCoachConversation = async () => {
    return authRequest('/api/data/coach-conversations/new', 'POST');
};

export const getAllCoachConversations = async () => {
    const result = await authRequest<{ conversations: any[] }>('/api/data/coach-conversations', 'GET');
    return result.conversations || [];
};

export const deleteCoachConversation = async (id: string) => {
    return authRequest(`/api/data/coach-conversations/${id}`, 'DELETE');
};

export const loadCoachConversation = async (id: string) => {
    return authRequest(`/api/data/coach-conversations/${id}/load`, 'POST');
};

export const listCoachConversations = async () => {
    return authRequest<{ conversations: any[] }>('/api/data/coach-conversations', 'GET');
};

// ============ SKILL GAP ANALYSES ============

export interface SkillAnalysis {
    dreamRole: string;
    matchPercentage: number;
    skillsYouHave: any[];
    skillsMissing: any[];
    actionPlan: any[];
    recommendedResources: any[];
}

export const getSkillAnalyses = async () => {
    return authRequest<{ analyses: any[] }>('/api/data/skill-analyses', 'GET');
};

export const saveSkillAnalysis = async (analysis: SkillAnalysis) => {
    return authRequest('/api/data/skill-analyses', 'POST', analysis);
};

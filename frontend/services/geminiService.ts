/**
 * API Service for RoleReady Frontend
 * All AI calls now go through backend API with authentication
 */

import { AnalysisRequest, AnalysisResult, ResumeProfile, InterviewQuestion, SalaryData, MockInterviewSummary } from "../types";
import { auth } from '../firebase/client';

// Backend API URL
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
 * Helper function to make authenticated API requests
 */
async function apiRequest<T>(endpoint: string, data: any): Promise<T> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth token if user is logged in
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'API request failed');
  }

  return response.json();
}

/**
 * Analyze a resume against a target role
 */
export const analyzeResume = async (request: AnalysisRequest): Promise<AnalysisResult> => {
  return apiRequest<AnalysisResult>('/api/ai/analyze-resume', request);
};

/**
 * Analyze resume against a specific job description
 * Comprehensive JD matching with detailed gap analysis
 */
export const analyzeResumeWithJD = async (
  resumeText: string | null,
  resumeFile: { data: string; mimeType: string } | null,
  jobDescription: string
): Promise<any> => {
  return apiRequest('/api/ai/analyze-with-jd', {
    resumeText,
    resumeFile,
    jobDescription
  });
};

/**
 * Optimize resume content for ATS
 */
export const optimizeResumeContent = async (currentProfile: ResumeProfile): Promise<ResumeProfile> => {
  return apiRequest<ResumeProfile>('/api/ai/optimize-resume', { profile: currentProfile });
};

/**
 * Generate interview questions for a role (comprehensive with categories)
 */
export const generateInterviewQuestions = async (role: string, experienceLevel: string): Promise<any> => {
  return apiRequest<any>('/api/ai/interview/questions', { role, experienceLevel });
};

/**
 * Get salary insights for a role in a location
 */
export const getSalaryInsights = async (role: string, location: string): Promise<SalaryData> => {
  return apiRequest<SalaryData>('/api/ai/salary-insights', { role, location });
};

/**
 * Get the next question in a mock interview
 */
export const getNextInterviewQuestion = async (
  role: string,
  resumeText: string,
  conversationHistory: { role: string; content: string }[],
  currentPhase: string,
  roundType: string = 'full'
): Promise<{ question: string; nextPhase: string; isComplete: boolean }> => {
  return apiRequest('/api/ai/mock-interview/question', {
    role,
    resumeText,
    conversationHistory,
    currentPhase,
    roundType,
  });
};

/**
 * Evaluate a completed mock interview
 */
export const evaluateMockInterview = async (
  role: string,
  resumeText: string,
  conversationHistory: { role: string; content: string }[]
): Promise<MockInterviewSummary> => {
  return apiRequest<MockInterviewSummary>('/api/ai/mock-interview/evaluate', {
    role,
    resumeText,
    conversationHistory,
  });
};

/**
 * Generate portfolio from resume
 */
export const generatePortfolio = async (
  resumeText: string,
  style: string = 'minimal'
): Promise<{ html: string; data: any }> => {
  return apiRequest('/api/ai/portfolio', { resumeText, style });
};

/**
 * Analyze skill gap for a dream role
 */
export const analyzeSkillGap = async (
  resumeText: string,
  dreamRole: string
): Promise<{
  matchPercentage: number;
  skillsYouHave: { skill: string; level: string }[];
  skillsMissing: { skill: string; priority: string; timeToLearn: string }[];
  actionPlan: { phase: string; duration: string; tasks: string[] }[];
  recommendedResources: { name: string; type: string; url?: string }[];
}> => {
  return apiRequest('/api/ai/skill-gap', { resumeText, dreamRole });
};

/**
 * Generate career roadmap
 */
export const generateCareerRoadmap = async (
  careerGoal: string,
  currentRole: string = '',
  yearsExperience: number = 0
): Promise<{
  goal: string;
  estimatedTime: string;
  phases: {
    name: string;
    duration: string;
    milestones: { task: string; completed: boolean }[];
    skills: string[];
    resources: { name: string; type: string }[];
  }[];
}> => {
  return apiRequest('/api/ai/career-roadmap', { careerGoal, currentRole, yearsExperience });
};

// ============ ROADMAP CRUD FUNCTIONS ============

interface SavedRoadmap {
  id: string;
  goal: string;
  estimatedTime: string;
  phases: any[];
  completedItems: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * List all saved roadmaps for current user
 */
export const listRoadmaps = async (): Promise<{ roadmaps: SavedRoadmap[] }> => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}/api/data/roadmaps`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to load roadmaps');
  return response.json();
};

/**
 * Save a new roadmap
 */
export const saveRoadmap = async (roadmap: {
  goal: string;
  estimatedTime: string;
  phases: any[];
  completedItems?: string[];
}): Promise<{ message: string; id: string }> => {
  return apiRequest('/api/data/roadmaps', {
    ...roadmap,
    completedItems: roadmap.completedItems || [],
  });
};

/**
 * Get a specific roadmap by ID
 */
export const getRoadmap = async (roadmapId: string): Promise<SavedRoadmap> => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}/api/data/roadmaps/${roadmapId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to load roadmap');
  return response.json();
};

/**
 * Update roadmap progress (completed items)
 */
export const updateRoadmapProgress = async (
  roadmapId: string,
  completedItems: string[]
): Promise<{ message: string }> => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}/api/data/roadmaps/${roadmapId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ completedItems }),
  });
  if (!response.ok) throw new Error('Failed to update roadmap');
  return response.json();
};

/**
 * Delete a roadmap
 */
export const deleteRoadmap = async (roadmapId: string): Promise<{ message: string }> => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}/api/data/roadmaps/${roadmapId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to delete roadmap');
  return response.json();
};

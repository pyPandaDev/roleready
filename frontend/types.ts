
// --- APP NAVIGATION TYPES ---

export type ViewType = 'landing' | 'home' | 'analyze' | 'builder' | 'pricing' | 'interview' | 'salary' | 'mock' | 'portfolio' | 'coach' | 'email' | 'cover' | 'login' | 'signup' | 'skillgap' | 'roadmap' | 'admin-login' | 'admin-dashboard';

export interface PageProps {
  setView: (view: ViewType) => void;
}

// --- COMMON ERROR TYPE ---
export interface AppError {
  message: string;
  code?: string;
}

// --- EXPERIENCE LEVEL ---

export enum ExperienceLevel {
  Student = "Student",
  Fresher = "Fresher (0 years)",
  Junior = "Junior (0-2 years)",
  MidLevel = "Mid-Level (3-5 years)",
  Senior = "Senior (5+ years)",
}

export interface MissingSkills {
  technical: string[];
  tools: string[];
  soft_skills: string[];
  domain: string[];
}

export interface ImprovedBullet {
  original: string;
  improved: string;
}

export interface LearningRoadmap {
  two_weeks: string[];
  one_to_three_months: string[];
  three_to_six_months: string[];
}

export interface HiringOdds {
  startup_fit: string; // e.g., "High", "Medium", "Low"
  big_tech_fit: string; // e.g., "High", "Medium", "Low"
  consultancy_fit: string; // e.g., "High", "Medium", "Low"
  reasoning: string;
}

export interface JobStrategy {
  suggested_titles: string[];
  location_strategy: string; // Remote vs Onsite vs Hybrid recommendation
  target_company_types: string[]; // e.g. "Series B Startup", "Fintech MNC"
  quick_action_plan: string; // 1 sentence immediate next step
}

export interface Deduction {
  issue: string;
  points: number;
  fix: string;
}

export interface SubScores {
  format_score: number;
  content_score: number;
  keyword_score: number;
  impact_score: number;
  role_match_score: number;
}

export interface RecruiterView {
  first_impression: string;
  missing_elements: string;
  perceived_level: string;
  trust_factors: string;
}

export interface ExpectedImprovement {
  ats_score: number;
  keyword_match: number;
}

export interface ProjectScore {
  project: string;
  score: number;
  feedback: string;
}

export interface AnalysisResult {
  match_score: number;
  atsScore?: number;
  verdict?: string; // "Excellent" | "Good" | "Average" | "Below Average" | "Needs Work"
  sub_scores?: SubScores;
  keyword_match_percentage?: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  missing_keywords?: string[];
  deductions_applied?: Deduction[]; // Legacy support
  hiring_odds: HiringOdds;
  missing_skills: MissingSkills & { critical?: string[] };
  improved_bullets: ImprovedBullet[];
  learning_roadmap: LearningRoadmap;
  job_search_strategy: JobStrategy;
  project_scores?: ProjectScore[];
  recruiter_view?: RecruiterView;
  expected_after_improvement?: ExpectedImprovement;
  red_flags?: string[];
  interview_readiness?: string; // "Ready" | "Needs Prep" | "Not Ready"
}

export interface AnalysisRequest {
  resumeText?: string;
  resumeFile?: {
    mimeType: string;
    data: string; // base64 encoded string
  };
  targetRole: string;
  jobDescription?: string;
  experienceLevel?: string;
}

// --- RESUME BUILDER TYPES ---

export interface ResumeProfile {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
    summary: string;
  };
  experience: {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    current: boolean;
    location: string;
    description: string;
  }[];
  education: {
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    current: boolean;
    location: string;
  }[];
  skills: {
    id: string;
    category: string;
    items: string;
  }[];
  projects: {
    id: string;
    name: string;
    description: string;
    link: string;
    technologies: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    date: string;
    link: string;
  }[];
  languages: {
    id: string;
    language: string;
    proficiency: string;
  }[];
  volunteering: {
    id: string;
    organization: string;
    role: string;
    date: string;
    description: string;
  }[];
  awards: {
    id: string;
    title: string;
    issuer: string;
    date: string;
    description: string;
  }[];
}

// --- NEW FEATURES ---

export interface InterviewQuestion {
  question: string;
  type: 'behavioral' | 'technical' | 'situational';
  context: string; // Why this question is asked
  sample_answer: string; // A STAR method answer or technical explanation
  key_points_to_hit: string[];
}

export interface SalaryData {
  role: string;
  location: string;
  currency: string;
  ranges: {
    min: string;
    median: string;
    max: string;
  };
  experience_breakdown: {
    intern: string;
    fresher: string;
    junior: string;
    mid: string;
    senior: string;
    lead: string;
  };
  salary_growth: {
    year_1_to_2: string;
    year_3_to_5: string;
    year_5_plus: string;
  };
  minimum_acceptable: string;
  hiring_market: {
    current_demand: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
    job_openings_trend: 'Declining' | 'Stable' | 'Growing' | 'Booming';
    competition_level: 'Low' | 'Medium' | 'High' | 'Very High';
    hiring_outlook: string;
  };
  industry_comparison: {
    startups: string;
    mnc: string;
    consulting: string;
    product_companies: string;
  };
  market_demand: 'Low' | 'Medium' | 'High' | 'Very High';
  top_paying_companies: string[];
  skills_affecting_salary: {
    skill: string;
    premium: string;
  }[];
  cost_of_living_context: string;
  negotiation_tips?: {
    title: string;
    tip: string;
    impact: 'High' | 'Medium' | 'Low';
  }[];
}

// --- MOCK INTERVIEW ---

export interface MockInterviewMessage {
  role: 'interviewer' | 'user';
  content: string;
  phase?: 'intro' | 'company' | 'resume' | 'technical' | 'closing' | 'summary';
}

export interface MockInterviewSummary {
  overall_score: number;
  hire_probability: string;
  strengths: string[];
  improvements: string[];
  phase_feedback: {
    phase: string;
    rating: 'Excellent' | 'Good' | 'Average' | 'Needs Work';
    comment: string;
  }[];
  final_verdict: string;
}

// --- SKILL GAP ANALYZER ---

export interface SkillGapResult {
  dreamRole: string;
  matchPercentage: number;
  skillsYouHave: {
    skill: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    relevance: 'High' | 'Medium' | 'Low';
  }[];
  skillsMissing: {
    skill: string;
    priority: 'Critical' | 'Important' | 'Nice-to-have';
    timeToLearn: string;
    reason: string;
  }[];
  resumeOnTrack: boolean;
  resumeFeedback: string;
  strengthsForRole: string[];
  biggestGaps: string[];
  actionPlan: {
    action: string;
    timeline: string;
    priority: number;
  }[];
  recommendedResources: {
    resource: string;
    type: 'Course' | 'Book' | 'Project' | 'Certification';
    platform: string;
    focus: string;
    url?: string;
  }[];
}

// --- CAREER ROADMAP ---

export interface RoadmapResource {
  name: string;
  url: string;
  type: 'Course' | 'Book' | 'Project' | 'Tutorial';
  free: boolean;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  timeEstimate: string;
  skills: string[];
  deliverables: string[];
  resources: RoadmapResource[];
  completed: boolean;
}

export interface RoadmapPhase {
  id: string;
  name: string;
  description: string;
  duration: string;
  milestones: RoadmapMilestone[];
}

export interface CareerRoadmapResult {
  goal: string;
  currentState: string;
  totalTimeEstimate: string;
  phases: RoadmapPhase[];
  keyMetrics: {
    metric: string;
    target: string;
    why: string;
  }[];
  potentialChallenges: string[];
  successIndicators: string[];
}


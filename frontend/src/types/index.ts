export type ApplicationStatus =
  | 'saved'
  | 'preparing'
  | 'manually_applied'
  | 'resume_tailored'
  | 'applied'
  | 'viewed'
  | 'recruiter_viewed'
  | 'shortlisted'
  | 'assessment'
  | 'interview_round_1'
  | 'interview_round_2'
  | 'hr_round'
  | 'offered'
  | 'rejected'
  | 'joined'
  | 'withdrawn';

export interface Application {
  _id: string;
  company: string;
  title: string;
  status: ApplicationStatus;
  matchScore?: number;
  followUpDate?: string;
  appliedDate?: string;
  resumeVersionUsed?: string;
  portalSource?: string;
  recruiterContact?: string;
  notes?: string;
  timeline?: Array<{ status: ApplicationStatus; note: string; date: string; source?: string; nextAction?: string }>;
  responses?: Array<{ subject: string; shortReply: string; detailedReply: string; shortChannelReply: string; warnings: string[] }>;
  updatedAt: string;
}

export interface ApplicationStats {
  saved: number;
  applied: number;
  screening?: number;
  interviews: number;
  offers: number;
  rejected?: number;
  joined?: number;
  total?: number;
}

export interface AnalyticsSummary {
  total: number;
  responseRate?: number;
  interviewRate: number;
  offerRate: number;
  avgMatchScore: number;
  bestResumeVersion?: string;
  bestJobSource?: string;
  recentCompanies: string[];
}

export interface WorkflowResult {
  kind: string;
  title: string;
  summary: string;
  items: string[];
  draft?: string;
  fallback: boolean;
}

export interface AdminEvent {
  _id: string;
  level: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface AdminOverview {
  users: number;
  jobs: number;
  applications: number;
  events: AdminEvent[];
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  recoveryEmail?: string;
  profile?: {
    skills?: string[];
    experienceLevel?: string;
    resumeBaseText?: string;
    preferredRoles?: string[];
    expectedSalary?: number;
  };
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  url?: string;
  source?: string;
  salaryMin?: number;
  salaryMax?: number;
  remote?: boolean;
  skills?: string[];
  createdAt?: string;
}

export interface ScoreBreakdown {
  finalScore: number;
  jobFitScore: number;
  atsMatchScore: number;
  skillMatchScore: number;
  experienceFitScore: number;
  locationFitScore: number;
  salaryFitScore: number;
  companyQualityScore: number;
  scamRiskScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  applyPriority: 'Apply Now' | 'Tailor First' | 'Improve Skills First' | 'Skip';
  aiRecommendation: string;
}

export interface RecommendedJob {
  job: Job;
  score: ScoreBreakdown;
}

export interface ResumeVersion {
  title: string;
  content: string;
  atsScore: number;
  keywords: string[];
  createdAt?: string;
}

export interface Resume {
  _id: string;
  title: string;
  parsedText: string;
  fileName?: string;
  mimeType?: string;
  sections?: {
    summary?: string;
    skills?: string[];
    experience?: string;
    education?: string;
    projects?: string;
  };
  atsScore: number;
  versions: ResumeVersion[];
  createdAt?: string;
}

export interface DailyDigest {
  jobsFound: number;
  highMatchJobs: number;
  topJobs?: Array<{ _id: string; title: string; company: string; location?: string }>;
  urgentApplyJobs?: string[];
  remoteJobs?: number;
  missingSkills?: string[];
  resumeImprovements?: string[];
  notifications?: Array<{ type: string; title: string; body: string }>;
  followUps: number;
  interviews: number;
  mission: string[];
}

export interface Portfolio {
  _id: string;
  username: string;
  headline: string;
  summary: string;
  skills: string[];
  projects: Array<{ name: string; description: string; url?: string }>;
  published: boolean;
}

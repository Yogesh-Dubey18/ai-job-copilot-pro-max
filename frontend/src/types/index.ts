export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'joined';

export interface Application {
  _id: string;
  company: string;
  title: string;
  status: ApplicationStatus;
  matchScore?: number;
  followUpDate?: string;
  appliedDate?: string;
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
  interviewRate: number;
  offerRate: number;
  avgMatchScore: number;
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
  applyPriority: 'Apply Now' | 'Tailor Resume First' | 'Improve Skills First' | 'Skip';
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
  atsScore: number;
  versions: ResumeVersion[];
  createdAt?: string;
}

export interface DailyDigest {
  jobsFound: number;
  highMatchJobs: number;
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

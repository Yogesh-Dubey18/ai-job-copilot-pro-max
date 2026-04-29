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

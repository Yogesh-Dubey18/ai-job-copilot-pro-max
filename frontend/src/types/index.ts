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
  interviews: number;
  offers: number;
}

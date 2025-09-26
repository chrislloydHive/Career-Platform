export type JobSource = 'linkedin' | 'indeed' | 'google_jobs';

export type SalaryPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type JobType = 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship';

export interface Salary {
  min?: number;
  max?: number;
  currency: string;
  period: SalaryPeriod;
}

export interface RawJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: Salary;
  description: string;
  url: string;
  source: JobSource;
  jobType?: JobType;
  postedDate: Date;
  scrapedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ScoredJob extends RawJob {
  score: number;
  scoreBreakdown: ScoreBreakdown;
  rank?: number;
  metadata?: Record<string, unknown>;
}

export interface ScoreBreakdown {
  location: {
    score: number;
    weight: number;
    weighted: number;
  };
  titleRelevance: {
    score: number;
    weight: number;
    weighted: number;
  };
  salary: {
    score: number;
    weight: number;
    weighted: number;
  };
  sourceQuality: {
    score: number;
    weight: number;
    weighted: number;
  };
  total: number;
}

export interface JobValidationError {
  field: keyof RawJob;
  message: string;
  value?: unknown;
}

export interface JobValidationResult {
  valid: boolean;
  errors: JobValidationError[];
  job?: RawJob;
}
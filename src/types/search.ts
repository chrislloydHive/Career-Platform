import { JobSource, JobType, RawJob, ScoredJob } from './job';

export interface SearchCriteria {
  query: string;
  location?: string;
  preferredLocations?: string[];
  sources?: JobSource[];
  jobTypes?: JobType[];
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  keywords?: string[];
  excludeKeywords?: string[];
  postedWithinDays?: number;
  maxResults?: number;
  // Advanced filters
  experienceLevel?: 'all' | 'entry' | 'mid' | 'senior' | 'executive';
  industry?: string;
  employmentType?: 'all' | 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship';
  freshnessFilter?: 'all' | 'today' | 'week' | 'month' | 'quarter';
  additionalKeywords?: string;
}

export interface ScraperConfig {
  searchQuery: string;
  location: string;
  jobType?: JobType;
  maxResults?: number;
  postedWithinDays?: number;
}

export interface ScraperResult {
  source: JobSource;
  jobs: RawJob[];
  scrapedCount: number;
  successCount: number;
  failedCount: number;
  errors: ScraperError[];
  scrapedAt: Date;
  durationMs: number;
}

export interface SearchResult {
  jobs: ScoredJob[];
  totalCount: number;
  sources: Record<JobSource, number>;
  searchCriteria: SearchCriteria;
  scrapedAt: Date;
  metadata: {
    highestScore: number;
    lowestScore: number;
    averageScore: number;
    processingTimeMs: number;
  };
}

export interface ScraperError {
  source: JobSource;
  message: string;
  code?: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}
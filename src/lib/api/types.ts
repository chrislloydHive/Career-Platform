import { ScoredJob, JobSource, ScraperError } from '@/types';

export interface SearchJobsRequest {
  query: string;
  location?: string;
  preferredLocations?: string[];
  sources?: JobSource[];
  jobTypes?: string[];
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  keywords?: string[];
  excludeKeywords?: string[];
  postedWithinDays?: number;
  maxResults?: number;
  timeoutMs?: number;
}

export interface SearchJobsResponseMetadata {
  totalJobsFound: number;
  uniqueJobs: number;
  duplicatesRemoved: number;
  successfulSources: JobSource[];
  failedSources: JobSource[];
  partialResults: boolean;
  searchDurationMs: number;
  totalDurationMs: number;
  averageScore: number;
  scoreDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface SearchJobsResponseData {
  jobs: ScoredJob[];
  metadata: SearchJobsResponseMetadata;
  warnings?: string[];
  errors?: ScraperError[];
}

export interface SearchJobsSuccessResponse {
  success: true;
  data: SearchJobsResponseData;
  timestamp: string;
}

export interface SearchJobsErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export type SearchJobsResponse = SearchJobsSuccessResponse | SearchJobsErrorResponse;
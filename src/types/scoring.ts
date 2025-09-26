import { RawJob, ScoredJob } from './job';
import { SearchCriteria } from './search';

export interface ScoringWeights {
  location: number;
  titleRelevance: number;
  salary: number;
  sourceQuality: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  location: 0.30,
  titleRelevance: 0.30,
  salary: 0.20,
  sourceQuality: 0.20,
};

export interface ScoringConfig {
  weights: ScoringWeights;
  criteria: ScoringCriteria;
}

export interface ScoringCriteria {
  preferredLocations: string[];
  relevantTitleKeywords: string[];
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  sourcePreferences?: Record<string, number>;
}

export interface ScoringResult {
  scoredJobs: ScoredJob[];
  totalScored: number;
  averageScore: number;
  scoreDistribution: {
    min: number;
    max: number;
    median: number;
    standardDeviation: number;
  };
}

export interface ScoreComponent {
  name: keyof ScoringWeights;
  rawScore: number;
  weight: number;
  weightedScore: number;
  details?: string;
}

export interface IScoringStrategy {
  score(job: RawJob, criteria: ScoringCriteria): number;
  getDetails(job: RawJob, criteria: ScoringCriteria): string;
}

export interface IScorer {
  scoreJob(job: RawJob): ScoredJob;
  scoreJobs(jobs: RawJob[]): ScoredJob[];
  updateWeights(weights: Partial<ScoringWeights>): void;
  updateCriteria(criteria: Partial<ScoringCriteria>): void;
}

export function createScoringCriteriaFromSearch(search: SearchCriteria): ScoringCriteria {
  return {
    preferredLocations: search.preferredLocations || (search.location ? [search.location] : []),
    relevantTitleKeywords: search.keywords || [],
    minSalary: search.salary?.min,
    maxSalary: search.salary?.max,
    currency: search.salary?.currency,
  };
}
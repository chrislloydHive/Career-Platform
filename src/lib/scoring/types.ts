import { RawJob, ScoringCriteria } from '@/types';

export interface ScoringStrategy {
  name: string;
  score(job: RawJob, criteria: ScoringCriteria): ScoringStrategyResult;
}

export interface ScoringStrategyResult {
  score: number;
  confidence: number;
  reasons: string[];
  details: Record<string, unknown>;
}

export interface EnhancedScoreBreakdown {
  location: {
    score: number;
    weight: number;
    weighted: number;
    confidence: number;
    reasons: string[];
  };
  titleRelevance: {
    score: number;
    weight: number;
    weighted: number;
    confidence: number;
    reasons: string[];
  };
  salary: {
    score: number;
    weight: number;
    weighted: number;
    confidence: number;
    reasons: string[];
  };
  sourceQuality: {
    score: number;
    weight: number;
    weighted: number;
    confidence: number;
    reasons: string[];
  };
  total: number;
  overallConfidence: number;
  topReasons: string[];
}

export interface LocationMatchType {
  type: 'exact' | 'remote' | 'same-city' | 'same-state' | 'same-country' | 'different' | 'unknown';
  score: number;
  confidence: number;
}
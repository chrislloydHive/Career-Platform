export { JobScorer, scoreJobs } from './job-scorer';
export { LocationScoringStrategy } from './location-strategy';
export { TitleRelevanceScoringStrategy } from './title-strategy';
export { SalaryScoringStrategy } from './salary-strategy';
export { SourceQualityScoringStrategy } from './source-strategy';
export type {
  ScoringStrategy,
  ScoringStrategyResult,
  EnhancedScoreBreakdown,
  LocationMatchType,
} from './types';
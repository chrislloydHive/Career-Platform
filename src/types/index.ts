export type {
  JobSource,
  SalaryPeriod,
  JobType,
  Salary,
  RawJob,
  ScoredJob,
  ScoreBreakdown,
  JobValidationError,
  JobValidationResult,
} from './job';

export type {
  SearchCriteria,
  ScraperConfig,
  ScraperResult,
  SearchResult,
  ScraperError,
} from './search';

export type {
  ScoringWeights,
  ScoringConfig,
  ScoringCriteria,
  ScoringResult,
  ScoreComponent,
  IScoringStrategy,
  IScorer,
} from './scoring';

export { DEFAULT_SCORING_WEIGHTS, createScoringCriteriaFromSearch } from './scoring';

export {
  ErrorCode,
  type AppError,
  type ScraperErrorDetails,
  type ValidationErrorDetails,
  type ApiErrorResponse,
  type ApiSuccessResponse,
  type ApiResponse,
  JobSearchError,
  ScraperError as ScraperErrorClass,
  ValidationError as ValidationErrorClass,
  createErrorResponse,
  createSuccessResponse,
} from './errors';

export {
  isJobSource,
  isSalaryPeriod,
  isJobType,
  isSalary,
  isRawJob,
  isScoredJob,
  isSearchCriteria,
  validateRawJob,
  validateScoringWeights,
  assertRawJob,
  assertScoringWeights,
} from './guards';
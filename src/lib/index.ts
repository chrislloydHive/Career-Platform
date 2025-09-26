export {
  JobSearchEngine,
  searchJobs,
  type SearchProgress,
  type SearchEngineResult,
  type SearchEngineConfig,
} from './job-search-engine';

export {
  BaseScraper,
  type IScraper,
  LinkedInScraper,
  IndeedScraper,
} from './scrapers';

export {
  normalizeSalary,
  normalizeLocation,
  generateJobId,
  normalizeJobTitle,
  normalizeCompanyName,
  extractKeywords,
  truncateDescription,
} from './utils/normalize';

export {
  JobScorer,
  scoreJobs,
  LocationScoringStrategy,
  TitleRelevanceScoringStrategy,
  SalaryScoringStrategy,
  SourceQualityScoringStrategy,
  type ScoringStrategy,
  type ScoringStrategyResult,
  type EnhancedScoreBreakdown,
  type LocationMatchType,
} from './scoring';

export {
  exportToExcel,
  exportToCSV,
  exportToJSON,
  formatDate,
  formatSalary,
  formatFieldValue,
  generateFilename,
  DEFAULT_EXPORT_FIELDS,
  FIELD_LABELS,
  type ExportFormat,
  type ExportField,
  type ExportOptions,
  type ExportData,
} from './export';

export {
  getUserFriendlyError,
  retryWithBackoff,
  type UserFriendlyError,
  type RetryConfig,
} from './feedback';

export {
  saveSearchToHistory,
  getSearchHistory,
  clearSearchHistory,
  removeSearchFromHistory,
  formatSearchSummary,
  getRecentSearches,
  type SearchHistoryItem,
} from './storage';
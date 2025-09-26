import { RawJob, ScoredJob, JobSource, SalaryPeriod, JobType, Salary, JobValidationResult, JobValidationError } from './job';
import { SearchCriteria } from './search';
import { ScoringWeights } from './scoring';
import { ValidationError } from './errors';

export function isJobSource(value: unknown): value is JobSource {
  return typeof value === 'string' && ['linkedin', 'indeed'].includes(value);
}

export function isSalaryPeriod(value: unknown): value is SalaryPeriod {
  return typeof value === 'string' && ['hourly', 'daily', 'weekly', 'monthly', 'yearly'].includes(value);
}

export function isJobType(value: unknown): value is JobType {
  return typeof value === 'string' && ['full-time', 'part-time', 'contract', 'temporary', 'internship'].includes(value);
}

export function isSalary(value: unknown): value is Salary {
  if (typeof value !== 'object' || value === null) return false;
  const salary = value as Partial<Salary>;

  return (
    typeof salary.currency === 'string' &&
    isSalaryPeriod(salary.period) &&
    (salary.min === undefined || typeof salary.min === 'number') &&
    (salary.max === undefined || typeof salary.max === 'number')
  );
}

export function isRawJob(value: unknown): value is RawJob {
  if (typeof value !== 'object' || value === null) return false;
  const job = value as Partial<RawJob>;

  return (
    typeof job.id === 'string' &&
    typeof job.title === 'string' &&
    typeof job.company === 'string' &&
    typeof job.location === 'string' &&
    typeof job.description === 'string' &&
    typeof job.url === 'string' &&
    isJobSource(job.source) &&
    job.postedDate instanceof Date &&
    job.scrapedAt instanceof Date &&
    (job.salary === undefined || isSalary(job.salary)) &&
    (job.jobType === undefined || isJobType(job.jobType))
  );
}

export function isScoredJob(value: unknown): value is ScoredJob {
  if (!isRawJob(value)) return false;
  const job = value as Partial<ScoredJob>;

  return (
    typeof job.score === 'number' &&
    typeof job.scoreBreakdown === 'object' &&
    job.scoreBreakdown !== null
  );
}

export function isSearchCriteria(value: unknown): value is SearchCriteria {
  if (typeof value !== 'object' || value === null) return false;
  const criteria = value as Partial<SearchCriteria>;

  return typeof criteria.query === 'string';
}

export function validateRawJob(value: unknown): JobValidationResult {
  const errors: JobValidationError[] = [];

  if (typeof value !== 'object' || value === null) {
    return { valid: false, errors: [{ field: 'id', message: 'Job must be an object' }] };
  }

  const job = value as Partial<RawJob>;

  if (!job.id || typeof job.id !== 'string') {
    errors.push({ field: 'id', message: 'Job ID is required and must be a string', value: job.id });
  }

  if (!job.title || typeof job.title !== 'string') {
    errors.push({ field: 'title', message: 'Job title is required and must be a string', value: job.title });
  }

  if (!job.company || typeof job.company !== 'string') {
    errors.push({ field: 'company', message: 'Company name is required and must be a string', value: job.company });
  }

  if (!job.location || typeof job.location !== 'string') {
    errors.push({ field: 'location', message: 'Location is required and must be a string', value: job.location });
  }

  if (!job.description || typeof job.description !== 'string') {
    errors.push({ field: 'description', message: 'Description is required and must be a string', value: job.description });
  }

  if (!job.url || typeof job.url !== 'string') {
    errors.push({ field: 'url', message: 'URL is required and must be a string', value: job.url });
  } else {
    try {
      new URL(job.url);
    } catch {
      errors.push({ field: 'url', message: 'URL must be a valid URL', value: job.url });
    }
  }

  if (!isJobSource(job.source)) {
    errors.push({ field: 'source', message: 'Source must be a valid JobSource', value: job.source });
  }

  if (!(job.postedDate instanceof Date)) {
    errors.push({ field: 'postedDate', message: 'Posted date must be a Date object', value: job.postedDate });
  }

  if (!(job.scrapedAt instanceof Date)) {
    errors.push({ field: 'scrapedAt', message: 'Scraped at must be a Date object', value: job.scrapedAt });
  }

  if (job.salary !== undefined && !isSalary(job.salary)) {
    errors.push({ field: 'salary', message: 'Salary must be a valid Salary object', value: job.salary });
  }

  if (job.jobType !== undefined && !isJobType(job.jobType)) {
    errors.push({ field: 'jobType', message: 'Job type must be a valid JobType', value: job.jobType });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [], job: job as RawJob };
}

export function validateScoringWeights(weights: unknown): weights is ScoringWeights {
  if (typeof weights !== 'object' || weights === null) return false;
  const w = weights as Partial<ScoringWeights>;

  const hasAllWeights =
    typeof w.location === 'number' &&
    typeof w.titleRelevance === 'number' &&
    typeof w.salary === 'number' &&
    typeof w.sourceQuality === 'number';

  if (!hasAllWeights) return false;

  const total = w.location! + w.titleRelevance! + w.salary! + w.sourceQuality!;
  return Math.abs(total - 1.0) < 0.001;
}

export function assertRawJob(value: unknown): asserts value is RawJob {
  const result = validateRawJob(value);
  if (!result.valid) {
    throw new ValidationError(
      result.errors[0].field,
      result.errors[0].message,
      result.errors[0].value,
      { errors: result.errors }
    );
  }
}

export function assertScoringWeights(value: unknown): asserts value is ScoringWeights {
  if (!validateScoringWeights(value)) {
    throw new ValidationError(
      'weights',
      'Scoring weights must sum to 1.0',
      value
    );
  }
}
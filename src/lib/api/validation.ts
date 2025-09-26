import { SearchCriteria, JobSource, JobType } from '@/types';

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  errors: string[];
}

export function validateSearchCriteria(body: unknown): ValidationResult<SearchCriteria> {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      errors: ['Request body must be an object'],
    };
  }

  const data = body as Partial<SearchCriteria>;

  if (!data.query || typeof data.query !== 'string' || data.query.trim().length === 0) {
    errors.push('query is required and must be a non-empty string');
  }

  if (data.location !== undefined && typeof data.location !== 'string') {
    errors.push('location must be a string');
  }

  if (data.preferredLocations !== undefined) {
    if (!Array.isArray(data.preferredLocations)) {
      errors.push('preferredLocations must be an array');
    } else if (!data.preferredLocations.every(loc => typeof loc === 'string')) {
      errors.push('preferredLocations must be an array of strings');
    }
  }

  if (data.sources !== undefined) {
    if (!Array.isArray(data.sources)) {
      errors.push('sources must be an array');
    } else {
      const validSources: JobSource[] = ['google_jobs', 'linkedin', 'indeed'];
      const invalidSources = data.sources.filter(s => !validSources.includes(s as JobSource));
      if (invalidSources.length > 0) {
        errors.push(`Invalid sources: ${invalidSources.join(', ')}. Valid sources are: ${validSources.join(', ')}`);
      }
    }
  }

  if (data.jobTypes !== undefined) {
    if (!Array.isArray(data.jobTypes)) {
      errors.push('jobTypes must be an array');
    } else {
      const validTypes: JobType[] = ['full-time', 'part-time', 'contract', 'temporary', 'internship'];
      const invalidTypes = data.jobTypes.filter(t => !validTypes.includes(t as JobType));
      if (invalidTypes.length > 0) {
        errors.push(`Invalid jobTypes: ${invalidTypes.join(', ')}. Valid types are: ${validTypes.join(', ')}`);
      }
    }
  }

  if (data.salary !== undefined) {
    if (typeof data.salary !== 'object' || data.salary === null) {
      errors.push('salary must be an object');
    } else {
      if (data.salary.min !== undefined && typeof data.salary.min !== 'number') {
        errors.push('salary.min must be a number');
      }
      if (data.salary.max !== undefined && typeof data.salary.max !== 'number') {
        errors.push('salary.max must be a number');
      }
      if (data.salary.min !== undefined && data.salary.max !== undefined && data.salary.min > data.salary.max) {
        errors.push('salary.min cannot be greater than salary.max');
      }
      if (data.salary.currency !== undefined && typeof data.salary.currency !== 'string') {
        errors.push('salary.currency must be a string');
      }
    }
  }

  if (data.keywords !== undefined) {
    if (!Array.isArray(data.keywords)) {
      errors.push('keywords must be an array');
    } else if (!data.keywords.every(kw => typeof kw === 'string')) {
      errors.push('keywords must be an array of strings');
    }
  }

  if (data.excludeKeywords !== undefined) {
    if (!Array.isArray(data.excludeKeywords)) {
      errors.push('excludeKeywords must be an array');
    } else if (!data.excludeKeywords.every(kw => typeof kw === 'string')) {
      errors.push('excludeKeywords must be an array of strings');
    }
  }

  if (data.postedWithinDays !== undefined) {
    if (typeof data.postedWithinDays !== 'number' || data.postedWithinDays < 1 || data.postedWithinDays > 365) {
      errors.push('postedWithinDays must be a number between 1 and 365');
    }
  }

  if (data.maxResults !== undefined) {
    if (typeof data.maxResults !== 'number' || data.maxResults < 1 || data.maxResults > 100) {
      errors.push('maxResults must be a number between 1 and 100');
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  const validatedData: SearchCriteria = {
    query: data.query!.trim(),
    location: data.location?.trim(),
    preferredLocations: data.preferredLocations,
    sources: data.sources,
    jobTypes: data.jobTypes,
    salary: data.salary,
    keywords: data.keywords,
    excludeKeywords: data.excludeKeywords,
    postedWithinDays: data.postedWithinDays,
    maxResults: data.maxResults || 25,
  };

  return {
    valid: true,
    data: validatedData,
    errors: [],
  };
}
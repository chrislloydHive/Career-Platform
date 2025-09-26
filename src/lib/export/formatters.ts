import { ScoredJob } from '@/types';
import { ExportField, ExportOptions, ExportFormat } from './types';

export function formatDate(date: Date, format: 'short' | 'long' | 'iso' = 'short'): string {
  switch (format) {
    case 'short':
      return date.toLocaleDateString();
    case 'long':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'iso':
      return date.toISOString().split('T')[0];
    default:
      return date.toLocaleDateString();
  }
}

export function formatSalary(job: ScoredJob): string {
  if (!job.salary) return 'Not specified';

  const { min, max, currency, period } = job.salary;
  const periodMap = {
    hourly: '/hr',
    daily: '/day',
    weekly: '/wk',
    monthly: '/mo',
    yearly: '/yr',
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k`;
    }
    return amount.toString();
  };

  if (min && max && min !== max) {
    return `${currency} ${formatAmount(min)} - ${formatAmount(max)}${periodMap[period]}`;
  } else if (min) {
    return `${currency} ${formatAmount(min)}+${periodMap[period]}`;
  } else if (max) {
    return `Up to ${currency} ${formatAmount(max)}${periodMap[period]}`;
  }

  return 'Not specified';
}

export function formatScoreBreakdown(job: ScoredJob): string {
  const { scoreBreakdown } = job;
  return [
    `Location: ${scoreBreakdown.location.weighted.toFixed(1)}`,
    `Title: ${scoreBreakdown.titleRelevance.weighted.toFixed(1)}`,
    `Salary: ${scoreBreakdown.salary.weighted.toFixed(1)}`,
    `Source: ${scoreBreakdown.sourceQuality.weighted.toFixed(1)}`,
  ].join(' | ');
}

export function getMatchReasons(job: ScoredJob): string {
  const enhanced = job.metadata?.enhancedScoreBreakdown;
  if (!enhanced || !enhanced.topReasons) {
    return 'N/A';
  }

  return enhanced.topReasons.join('; ');
}

export function formatFieldValue(
  job: ScoredJob,
  field: ExportField,
  options: ExportOptions,
  rank?: number
): string {
  const dateFormat = options.dateFormat || 'short';

  switch (field) {
    case 'rank':
      return rank ? rank.toString() : '';
    case 'title':
      return job.title;
    case 'company':
      return job.company;
    case 'location':
      return job.location;
    case 'salary':
      return formatSalary(job);
    case 'score':
      return job.score.toFixed(1);
    case 'scoreBreakdown':
      return formatScoreBreakdown(job);
    case 'source':
      return job.source.charAt(0).toUpperCase() + job.source.slice(1);
    case 'postedDate':
      return formatDate(job.postedDate, dateFormat);
    case 'scrapedAt':
      return formatDate(job.scrapedAt, dateFormat);
    case 'url':
      return job.url;
    case 'description':
      return job.description;
    case 'jobType':
      return job.jobType || 'Not specified';
    case 'matchReasons':
      return getMatchReasons(job);
    case 'applicationStatus':
      return '';
    case 'applicationDate':
      return '';
    case 'notes':
      return '';
    default:
      return '';
  }
}

export function generateFilename(format: ExportFormat, customName?: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const basename = customName || `job-search-results-${timestamp}`;

  const extensions = {
    csv: 'csv',
    excel: 'xlsx',
    json: 'json',
  };

  return `${basename}.${extensions[format]}`;
}
import { ScoredJob } from '@/types';

export type ExportFormat = 'csv' | 'excel' | 'json';

export type ExportField =
  | 'rank'
  | 'title'
  | 'company'
  | 'location'
  | 'salary'
  | 'score'
  | 'scoreBreakdown'
  | 'source'
  | 'postedDate'
  | 'scrapedAt'
  | 'url'
  | 'description'
  | 'jobType'
  | 'matchReasons'
  | 'applicationStatus'
  | 'applicationDate'
  | 'notes';

export interface ExportOptions {
  format: ExportFormat;
  fields: ExportField[];
  dateFormat?: 'short' | 'long' | 'iso';
  includeScoreBreakdown?: boolean;
  includeMatchReasons?: boolean;
  includeApplicationTracking?: boolean;
  filename?: string;
}

export interface ExportData {
  jobs: ScoredJob[];
  exportDate: Date;
  searchCriteria?: string;
  totalJobs: number;
}

export const DEFAULT_EXPORT_FIELDS: ExportField[] = [
  'rank',
  'title',
  'company',
  'location',
  'salary',
  'score',
  'source',
  'postedDate',
  'url',
];

export const FIELD_LABELS: Record<ExportField, string> = {
  rank: 'Rank',
  title: 'Job Title',
  company: 'Company',
  location: 'Location',
  salary: 'Salary',
  score: 'Match Score',
  scoreBreakdown: 'Score Details',
  source: 'Source',
  postedDate: 'Posted Date',
  scrapedAt: 'Scraped Date',
  url: 'Job URL',
  description: 'Description',
  jobType: 'Job Type',
  matchReasons: 'Match Reasons',
  applicationStatus: 'Application Status',
  applicationDate: 'Application Date',
  notes: 'Notes',
};
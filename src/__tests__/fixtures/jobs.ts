import { RawJob, ScoredJob, JobSource } from '@/types';

export const mockRawJob: RawJob = {
  id: 'test-job-1',
  title: 'Senior Software Engineer',
  company: 'Tech Corp',
  location: 'San Francisco, CA',
  salary: {
    min: 150000,
    max: 200000,
    currency: 'USD',
    period: 'yearly',
  },
  description: 'We are looking for a Senior Software Engineer with 5+ years of experience in React, TypeScript, and Node.js. You will be responsible for building scalable web applications and leading a team of developers.',
  url: 'https://example.com/job/1',
  source: 'linkedin' as JobSource,
  jobType: 'full-time',
  postedDate: new Date('2025-01-15'),
  scrapedAt: new Date('2025-01-20'),
  metadata: {},
};

export const mockRawJobLinkedIn: RawJob = {
  ...mockRawJob,
  id: 'linkedin-job-1',
  source: 'linkedin' as JobSource,
};

export const mockRawJobIndeed: RawJob = {
  ...mockRawJob,
  id: 'indeed-job-1',
  title: 'Full Stack Developer',
  company: 'StartupXYZ',
  location: 'Remote',
  salary: {
    min: 120000,
    max: 160000,
    currency: 'USD',
    period: 'yearly',
  },
  source: 'indeed' as JobSource,
};

export const mockScoredJob: ScoredJob = {
  ...mockRawJob,
  score: 85,
  scoreBreakdown: {
    location: {
      score: 95,
      weight: 0.30,
      weighted: 28.5,
    },
    titleRelevance: {
      score: 88,
      weight: 0.30,
      weighted: 26.4,
    },
    salary: {
      score: 75,
      weight: 0.20,
      weighted: 15.0,
    },
    sourceQuality: {
      score: 90,
      weight: 0.20,
      weighted: 18.0,
    },
    total: 85,
  },
  rank: 1,
  metadata: {
    enhancedScoreBreakdown: {
      location: {
        score: 95,
        weight: 0.30,
        weighted: 28.5,
        confidence: 0.9,
        reasons: ['Exact location match: San Francisco, CA'],
      },
      titleRelevance: {
        score: 88,
        weight: 0.30,
        weighted: 26.4,
        confidence: 0.85,
        reasons: ['Strong keyword match', 'Senior level alignment'],
      },
      salary: {
        score: 75,
        weight: 0.20,
        weighted: 15.0,
        confidence: 0.8,
        reasons: ['Salary within desired range'],
      },
      sourceQuality: {
        score: 90,
        weight: 0.20,
        weighted: 18.0,
        confidence: 1.0,
        reasons: ['Reputable job source', 'Detailed job posting'],
      },
      total: 85,
      overallConfidence: 0.86,
      topReasons: [
        'Exact location match: San Francisco, CA',
        'Strong keyword match',
        'Reputable job source',
        'Salary within desired range',
        'Senior level alignment',
      ],
    },
  },
};

export const mockJobList: ScoredJob[] = [
  mockScoredJob,
  {
    ...mockScoredJob,
    id: 'test-job-2',
    title: 'Software Engineer',
    score: 78,
    rank: 2,
    scoreBreakdown: {
      ...mockScoredJob.scoreBreakdown,
      total: 78,
    },
  },
  {
    ...mockScoredJob,
    id: 'test-job-3',
    title: 'Frontend Developer',
    company: 'Web Agency',
    score: 72,
    rank: 3,
    scoreBreakdown: {
      ...mockScoredJob.scoreBreakdown,
      total: 72,
    },
  },
];

export const mockSearchCriteria = {
  query: 'software engineer',
  location: 'San Francisco',
  preferredLocations: ['San Francisco', 'Remote'],
  sources: ['linkedin', 'indeed'] as JobSource[],
  salary: {
    min: 120000,
    max: 180000,
    currency: 'USD',
  },
  maxResults: 25,
};
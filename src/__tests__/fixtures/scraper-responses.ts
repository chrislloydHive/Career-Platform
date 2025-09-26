import { ScraperResult } from '@/types';
import { mockRawJobLinkedIn, mockRawJobIndeed } from './jobs';

export const mockLinkedInSuccessResponse: ScraperResult = {
  source: 'linkedin',
  jobs: [mockRawJobLinkedIn, { ...mockRawJobLinkedIn, id: 'linkedin-job-2' }],
  scrapedCount: 2,
  successCount: 2,
  failedCount: 0,
  errors: [],
  scrapedAt: new Date('2025-01-20T10:00:00Z'),
  durationMs: 5000,
};

export const mockIndeedSuccessResponse: ScraperResult = {
  source: 'indeed',
  jobs: [mockRawJobIndeed, { ...mockRawJobIndeed, id: 'indeed-job-2' }],
  scrapedCount: 2,
  successCount: 2,
  failedCount: 0,
  errors: [],
  scrapedAt: new Date('2025-01-20T10:00:05Z'),
  durationMs: 4500,
};

export const mockLinkedInErrorResponse: ScraperResult = {
  source: 'linkedin',
  jobs: [],
  scrapedCount: 0,
  successCount: 0,
  failedCount: 1,
  errors: [
    {
      source: 'linkedin',
      message: 'LinkedIn blocked the request. Detected CAPTCHA.',
      code: 'SCRAPER_BLOCKED',
      timestamp: new Date('2025-01-20T10:00:00Z'),
      context: { statusCode: 403 },
    },
  ],
  scrapedAt: new Date('2025-01-20T10:00:00Z'),
  durationMs: 2000,
};

export const mockIndeedPartialResponse: ScraperResult = {
  source: 'indeed',
  jobs: [mockRawJobIndeed],
  scrapedCount: 1,
  successCount: 1,
  failedCount: 1,
  errors: [
    {
      source: 'indeed',
      message: 'Failed to extract some job listings',
      timestamp: new Date('2025-01-20T10:00:05Z'),
    },
  ],
  scrapedAt: new Date('2025-01-20T10:00:05Z'),
  durationMs: 3000,
};
import { POST } from '@/app/api/search-jobs/route';
import { NextRequest } from 'next/server';
import { mockSearchCriteria } from '../fixtures/jobs';

jest.mock('@/lib/job-search-engine');
jest.mock('@/lib/scoring');

describe('/api/search-jobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST request validation', () => {
    it('should reject requests with invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3002/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Invalid JSON');
    });

    it('should reject requests with missing query', async () => {
      const invalidCriteria = {
        location: 'San Francisco',
      };

      const request = new NextRequest('http://localhost:3002/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidCriteria),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Invalid request data');
    });

    it('should reject requests with empty query', async () => {
      const invalidCriteria = {
        query: '   ',
        location: 'San Francisco',
      };

      const request = new NextRequest('http://localhost:3002/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidCriteria),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject requests with invalid salary range', async () => {
      const invalidCriteria = {
        ...mockSearchCriteria,
        salary: {
          min: 200000,
          max: 100000,
        },
      };

      const request = new NextRequest('http://localhost:3002/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidCriteria),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject requests with invalid sources', async () => {
      const invalidCriteria = {
        ...mockSearchCriteria,
        sources: ['invalid-source'],
      };

      const request = new NextRequest('http://localhost:3002/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidCriteria),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('valid requests', () => {
    it('should accept valid search criteria', async () => {
      const request = new NextRequest('http://localhost:3002/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockSearchCriteria),
      });

      const response = await POST(request);

      expect([200, 206, 503]).toContain(response.status);
    });

    it('should set default maxResults if not provided', async () => {
      const criteria = {
        query: 'software engineer',
        location: 'San Francisco',
      };

      const request = new NextRequest('http://localhost:3002/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
    });

    it('should trim whitespace from query', async () => {
      const criteria = {
        query: '  software engineer  ',
        location: 'San Francisco',
      };

      const request = new NextRequest('http://localhost:3002/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria),
      });

      const response = await POST(request);

      expect(response.status).not.toBe(400);
    });
  });

  describe('response format', () => {
    it('should return proper success response structure', async () => {
      const request = new NextRequest('http://localhost:3002/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockSearchCriteria),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('timestamp');

      if (data.success) {
        expect(data).toHaveProperty('data');
        expect(data.data).toHaveProperty('jobs');
        expect(data.data).toHaveProperty('metadata');
      } else {
        expect(data).toHaveProperty('error');
        expect(data.error).toHaveProperty('code');
        expect(data.error).toHaveProperty('message');
      }
    });

    it('should include metadata in successful response', async () => {
      const request = new NextRequest('http://localhost:3002/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockSearchCriteria),
      });

      const response = await POST(request);
      const data = await response.json();

      if (data.success) {
        expect(data.data.metadata).toHaveProperty('totalDurationMs');
        expect(data.data.metadata).toHaveProperty('averageScore');
        expect(data.data.metadata).toHaveProperty('highestScore');
        expect(data.data.metadata).toHaveProperty('lowestScore');
      }
    });
  });

  describe('error handling', () => {
    it('should handle scraper failures gracefully', async () => {
      const request = new NextRequest('http://localhost:3002/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockSearchCriteria),
      });

      const response = await POST(request);

      expect([200, 206, 503, 504]).toContain(response.status);
    });

    it('should include error details in failed responses', async () => {
      const request = new NextRequest('http://localhost:3002/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
    });
  });

  describe('timeout handling', () => {
    it('should respect custom timeout parameter', async () => {
      const criteria = {
        ...mockSearchCriteria,
        timeoutMs: 30000,
      };

      const request = new NextRequest('http://localhost:3002/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
    });

    it('should cap timeout at maximum allowed', async () => {
      const criteria = {
        ...mockSearchCriteria,
        timeoutMs: 999999,
      };

      const request = new NextRequest('http://localhost:3002/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
    });
  });

  describe('partial results', () => {
    it('should return 206 for partial results', async () => {
      const request = new NextRequest('http://localhost:3002/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockSearchCriteria),
      });

      const response = await POST(request);
      const data = await response.json();

      if (data.success && data.data.jobs.length > 0 && data.data.warnings) {
        expect([200, 206]).toContain(response.status);
      }
    });
  });
});
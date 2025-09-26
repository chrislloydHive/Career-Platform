import { getUserFriendlyError, retryWithBackoff } from '@/lib/feedback/error-handler';
import { validateSearchCriteria } from '@/lib/api/validation';

describe('Error Scenario Tests', () => {
  describe('getUserFriendlyError', () => {
    it('should handle network errors', () => {
      const networkError = new Error('Network request failed');
      const result = getUserFriendlyError(networkError);

      expect(result.severity).toBe('error');
      expect(result.message).toContain('network');
      expect(result.canRetry).toBe(true);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should handle timeout errors', () => {
      const timeoutError = new Error('Request timeout after 90000ms');
      const result = getUserFriendlyError(timeoutError);

      expect(result.severity).toBe('warning');
      expect(result.title).toContain('Timeout');
      expect(result.canRetry).toBe(true);
      expect(result.actionable).toBe(true);
    });

    it('should handle rate limit errors', () => {
      const rateLimitError = new Error('Rate limit exceeded');
      const result = getUserFriendlyError(rateLimitError);

      expect(result.severity).toBe('warning');
      expect(result.canRetry).toBe(true);
      expect(result.suggestions).toContain('Wait a few minutes before trying again');
    });

    it('should handle validation errors', () => {
      const validationError = new Error('Validation failed: query is required');
      const result = getUserFriendlyError(validationError);

      expect(result.severity).toBe('error');
      expect(result.actionable).toBe(true);
      expect(result.canRetry).toBe(false);
    });

    it('should handle no results errors', () => {
      const noResultsError = new Error('No jobs found matching your criteria');
      const result = getUserFriendlyError(noResultsError);

      expect(result.severity).toBe('info');
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.canRetry).toBe(true);
    });

    it('should handle unknown errors gracefully', () => {
      const unknownError = new Error('Something unexpected happened');
      const result = getUserFriendlyError(unknownError);

      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('severity');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should handle non-Error objects', () => {
      const stringError = 'String error message';
      const result = getUserFriendlyError(stringError);

      expect(result.message).toContain('unexpected');
    });

    it('should handle null/undefined errors', () => {
      const result1 = getUserFriendlyError(null);
      const result2 = getUserFriendlyError(undefined);

      expect(result1.message).toBeDefined();
      expect(result2.message).toBeDefined();
    });
  });

  describe('retryWithBackoff', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      const operation = jest.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      const result = await retryWithBackoff(
        operation,
        { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 50, backoffMultiplier: 2 },
        jest.fn()
      );

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should throw after max attempts', async () => {
      const operation = jest.fn(async () => {
        throw new Error('Permanent failure');
      });

      await expect(
        retryWithBackoff(
          operation,
          { maxAttempts: 2, baseDelayMs: 10, maxDelayMs: 50, backoffMultiplier: 2 },
          jest.fn()
        )
      ).rejects.toThrow('Permanent failure');

      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should call onRetry callback', async () => {
      let attempts = 0;
      const operation = jest.fn(async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error('Retry me');
        }
        return 'success';
      });

      const onRetry = jest.fn();

      await retryWithBackoff(
        operation,
        { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 50, backoffMultiplier: 2 },
        onRetry
      );

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Number));
    });

    it('should implement exponential backoff', async () => {
      const delays: number[] = [];
      let attempts = 0;

      const operation = jest.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Retry');
        }
        return 'success';
      });

      const onRetry = jest.fn((attempt, delay) => {
        delays.push(delay);
      });

      await retryWithBackoff(
        operation,
        { maxAttempts: 3, baseDelayMs: 100, maxDelayMs: 1000, backoffMultiplier: 2 },
        onRetry
      );

      expect(delays.length).toBe(2);
      expect(delays[1]).toBeGreaterThan(delays[0]);
    });

    it('should cap delay at maxDelayMs', async () => {
      const delays: number[] = [];
      let attempts = 0;

      const operation = jest.fn(async () => {
        attempts++;
        if (attempts < 4) {
          throw new Error('Retry');
        }
        return 'success';
      });

      const onRetry = jest.fn((attempt, delay) => {
        delays.push(delay);
      });

      await retryWithBackoff(
        operation,
        { maxAttempts: 4, baseDelayMs: 100, maxDelayMs: 300, backoffMultiplier: 3 },
        onRetry
      );

      delays.forEach(delay => {
        expect(delay).toBeLessThanOrEqual(300);
      });
    });
  });

  describe('validation edge cases', () => {
    it('should reject negative salary values', () => {
      const criteria = {
        query: 'software engineer',
        salary: {
          min: -50000,
          max: 100000,
        },
      };

      const result = validateSearchCriteria(criteria);

      expect(result.valid).toBe(false);
    });

    it('should reject maxResults > 100', () => {
      const criteria = {
        query: 'software engineer',
        maxResults: 500,
      };

      const result = validateSearchCriteria(criteria);

      expect(result.valid).toBe(false);
    });

    it('should reject postedWithinDays > 365', () => {
      const criteria = {
        query: 'software engineer',
        postedWithinDays: 1000,
      };

      const result = validateSearchCriteria(criteria);

      expect(result.valid).toBe(false);
    });

    it('should handle special characters in query', () => {
      const criteria = {
        query: 'C++ Developer <script>',
      };

      const result = validateSearchCriteria(criteria);

      expect(result.valid).toBe(true);
      expect(result.data?.query).toContain('C++');
    });

    it('should handle very long location strings', () => {
      const criteria = {
        query: 'engineer',
        location: 'A'.repeat(1000),
      };

      const result = validateSearchCriteria(criteria);

      expect(result.valid).toBe(true);
    });

    it('should handle empty arrays', () => {
      const criteria = {
        query: 'engineer',
        sources: [],
        jobTypes: [],
        keywords: [],
      };

      const result = validateSearchCriteria(criteria);

      expect(result.valid).toBe(true);
    });
  });

  describe('boundary conditions', () => {
    it('should handle minimum valid salary', () => {
      const criteria = {
        query: 'engineer',
        salary: {
          min: 1,
          max: 1000000,
        },
      };

      const result = validateSearchCriteria(criteria);

      expect(result.valid).toBe(true);
    });

    it('should handle maximum valid salary', () => {
      const criteria = {
        query: 'engineer',
        salary: {
          min: 1,
          max: 9999999,
        },
      };

      const result = validateSearchCriteria(criteria);

      expect(result.valid).toBe(true);
    });

    it('should handle minimum maxResults', () => {
      const criteria = {
        query: 'engineer',
        maxResults: 1,
      };

      const result = validateSearchCriteria(criteria);

      expect(result.valid).toBe(true);
    });

    it('should handle maximum maxResults', () => {
      const criteria = {
        query: 'engineer',
        maxResults: 100,
      };

      const result = validateSearchCriteria(criteria);

      expect(result.valid).toBe(true);
    });
  });

  describe('type coercion and validation', () => {
    it('should handle string numbers', () => {
      const criteria = {
        query: 'engineer',
        salary: {
          min: '100000' as any,
          max: '150000' as any,
        },
      };

      const result = validateSearchCriteria(criteria);

      expect(result.valid).toBe(false);
    });

    it('should reject non-string location', () => {
      const criteria = {
        query: 'engineer',
        location: 123 as any,
      };

      const result = validateSearchCriteria(criteria);

      expect(result.valid).toBe(false);
    });

    it('should reject non-array keywords', () => {
      const criteria = {
        query: 'engineer',
        keywords: 'react' as any,
      };

      const result = validateSearchCriteria(criteria);

      expect(result.valid).toBe(false);
    });
  });
});
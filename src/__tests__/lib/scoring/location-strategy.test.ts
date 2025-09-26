import { LocationScoringStrategy } from '@/lib/scoring/location-strategy';
import { mockRawJob } from '../../fixtures/jobs';
import { ScoringCriteria } from '@/types';

describe('LocationScoringStrategy', () => {
  let strategy: LocationScoringStrategy;

  beforeEach(() => {
    strategy = new LocationScoringStrategy();
  });

  describe('exact location match', () => {
    it('should return perfect score for exact location match', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        location: 'San Francisco, CA',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        location: 'San Francisco, CA',
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBe(100);
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.reasons).toContain('Exact location match');
    });
  });

  describe('remote jobs', () => {
    it('should give high score for remote jobs', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        location: 'San Francisco, CA',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        location: 'Remote',
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBe(100);
      expect(result.confidence).toBe(1.0);
      expect(result.reasons[0]).toContain('Remote');
    });

    it('should detect various remote location formats', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        location: 'New York',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const remoteVariants = ['Remote', 'Work from home', 'WFH', 'Anywhere'];

      remoteVariants.forEach(location => {
        const job = { ...mockRawJob, location };
        const result = strategy.score(job, criteria);
        expect(result.score).toBe(100);
      });
    });
  });

  describe('same city match', () => {
    it('should give high score for same city', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        location: 'San Francisco',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        location: 'San Francisco, California',
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.reasons[0]).toContain('same city');
    });
  });

  describe('same state match', () => {
    it('should give moderate score for same state', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        location: 'San Francisco, CA',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        location: 'Los Angeles, CA',
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.score).toBeLessThan(85);
      expect(result.reasons[0]).toContain('same state');
    });
  });

  describe('different location', () => {
    it('should give low score for different location', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        location: 'San Francisco, CA',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        location: 'New York, NY',
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeLessThan(50);
      expect(result.reasons[0]).toContain('Different location');
    });
  });

  describe('no location preference', () => {
    it('should return default score when no location specified', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const result = strategy.score(mockRawJob, criteria);

      expect(result.score).toBe(50);
      expect(result.confidence).toBe(0.5);
    });
  });

  describe('fuzzy matching', () => {
    it('should handle typos and variations', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        location: 'San Fransisco',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        location: 'San Francisco',
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeGreaterThan(80);
    });
  });
});
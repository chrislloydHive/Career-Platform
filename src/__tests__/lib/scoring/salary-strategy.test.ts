import { SalaryScoringStrategy } from '@/lib/scoring/salary-strategy';
import { mockRawJob } from '../../fixtures/jobs';
import { ScoringCriteria } from '@/types';

describe('SalaryScoringStrategy', () => {
  let strategy: SalaryScoringStrategy;

  beforeEach(() => {
    strategy = new SalaryScoringStrategy();
  });

  describe('perfect salary alignment', () => {
    it('should return perfect score when salary is within range', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        salary: {
          min: 140000,
          max: 180000,
        },
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        salary: {
          min: 150000,
          max: 170000,
          currency: 'USD',
          period: 'yearly' as const,
        },
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBe(100);
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.reasons).toContain('Perfect salary alignment');
    });
  });

  describe('above expected salary', () => {
    it('should give high score when salary is above expected', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        salary: {
          min: 100000,
          max: 150000,
        },
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        salary: {
          min: 160000,
          max: 200000,
          currency: 'USD',
          period: 'yearly' as const,
        },
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.reasons).toContain('Above expected salary');
    });
  });

  describe('below expected salary', () => {
    it('should give lower score when salary is below expected', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        salary: {
          min: 150000,
          max: 200000,
        },
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        salary: {
          min: 100000,
          max: 130000,
          currency: 'USD',
          period: 'yearly' as const,
        },
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeLessThan(70);
      expect(result.reasons).toContain('Below expected salary');
    });
  });

  describe('partial overlap', () => {
    it('should give moderate score for partial salary overlap', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        salary: {
          min: 120000,
          max: 160000,
        },
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        salary: {
          min: 140000,
          max: 180000,
          currency: 'USD',
          period: 'yearly' as const,
        },
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeGreaterThan(60);
      expect(result.score).toBeLessThan(100);
      expect(result.reasons).toContain('Partial salary overlap');
    });
  });

  describe('missing salary data', () => {
    it('should return default score when job has no salary', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        salary: {
          min: 120000,
          max: 180000,
        },
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        salary: undefined,
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBe(50);
      expect(result.confidence).toBe(0.3);
      expect(result.reasons).toContain('No salary information');
    });

    it('should return default score when criteria has no salary', () => {
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

  describe('salary period normalization', () => {
    it('should normalize hourly to yearly', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        salary: {
          min: 120000,
          max: 160000,
        },
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        salary: {
          min: 60,
          max: 80,
          currency: 'USD',
          period: 'hourly' as const,
        },
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeGreaterThan(50);
    });

    it('should normalize monthly to yearly', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        salary: {
          min: 120000,
          max: 160000,
        },
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        salary: {
          min: 10000,
          max: 13000,
          currency: 'USD',
          period: 'monthly' as const,
        },
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeGreaterThan(50);
    });
  });

  describe('confidence scoring', () => {
    it('should have high confidence when both ranges are specific', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        salary: {
          min: 140000,
          max: 160000,
        },
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        salary: {
          min: 145000,
          max: 155000,
          currency: 'USD',
          period: 'yearly' as const,
        },
      };

      const result = strategy.score(job, criteria);

      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should have lower confidence for wide salary ranges', () => {
      const criteria: ScoringCriteria = {
        query: 'software engineer',
        salary: {
          min: 100000,
          max: 200000,
        },
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        salary: {
          min: 120000,
          max: 180000,
          currency: 'USD',
          period: 'yearly' as const,
        },
      };

      const result = strategy.score(job, criteria);

      expect(result.confidence).toBeLessThan(0.9);
    });
  });
});
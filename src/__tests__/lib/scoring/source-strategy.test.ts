import { SourceQualityScoringStrategy } from '@/lib/scoring/source-strategy';
import { mockRawJob } from '../../fixtures/jobs';
import { ScoringCriteria } from '@/types';

describe('SourceQualityScoringStrategy', () => {
  let strategy: SourceQualityScoringStrategy;

  beforeEach(() => {
    strategy = new SourceQualityScoringStrategy();
  });

  const baseCriteria: ScoringCriteria = {
    query: 'software engineer',
    scoringWeights: {
      location: 0.30,
      titleRelevance: 0.30,
      salary: 0.20,
      sourceQuality: 0.20,
    },
  };

  describe('source base scores', () => {
    it('should give LinkedIn high base score', () => {
      const job = {
        ...mockRawJob,
        source: 'linkedin' as const,
      };

      const result = strategy.score(job, baseCriteria);

      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.reasons).toContain('Reputable job source');
    });

    it('should give Indeed good base score', () => {
      const job = {
        ...mockRawJob,
        source: 'indeed' as const,
      };

      const result = strategy.score(job, baseCriteria);

      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.reasons).toContain('Reputable job source');
    });
  });

  describe('salary information bonus', () => {
    it('should add bonus for jobs with salary information', () => {
      const jobWithSalary = {
        ...mockRawJob,
        salary: {
          min: 120000,
          max: 160000,
          currency: 'USD',
          period: 'yearly' as const,
        },
      };

      const jobWithoutSalary = {
        ...mockRawJob,
        salary: undefined,
      };

      const resultWith = strategy.score(jobWithSalary, baseCriteria);
      const resultWithout = strategy.score(jobWithoutSalary, baseCriteria);

      expect(resultWith.score).toBeGreaterThan(resultWithout.score);
      expect(resultWith.reasons).toContain('Includes salary information');
    });
  });

  describe('description quality bonus', () => {
    it('should add bonus for detailed descriptions', () => {
      const jobDetailed = {
        ...mockRawJob,
        description: 'This is a very detailed job description with lots of information about the role, responsibilities, requirements, and company culture. We are looking for someone with strong technical skills and excellent communication abilities.',
      };

      const jobBrief = {
        ...mockRawJob,
        description: 'Looking for engineer.',
      };

      const resultDetailed = strategy.score(jobDetailed, baseCriteria);
      const resultBrief = strategy.score(jobBrief, baseCriteria);

      expect(resultDetailed.score).toBeGreaterThan(resultBrief.score);
      expect(resultDetailed.reasons).toContain('Detailed job description');
    });
  });

  describe('recency bonus', () => {
    it('should add bonus for recently posted jobs', () => {
      const recentJob = {
        ...mockRawJob,
        postedDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      };

      const oldJob = {
        ...mockRawJob,
        postedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      };

      const resultRecent = strategy.score(recentJob, baseCriteria);
      const resultOld = strategy.score(oldJob, baseCriteria);

      expect(resultRecent.score).toBeGreaterThan(resultOld.score);
      expect(resultRecent.reasons).toContain('Recently posted');
    });

    it('should penalize very old jobs', () => {
      const veryOldJob = {
        ...mockRawJob,
        postedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      };

      const recentJob = {
        ...mockRawJob,
        postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      };

      const resultOld = strategy.score(veryOldJob, baseCriteria);
      const resultRecent = strategy.score(recentJob, baseCriteria);

      expect(resultOld.score).toBeLessThan(resultRecent.score);
      expect(resultOld.reasons).toContain('Job posting is old');
    });
  });

  describe('combined bonuses', () => {
    it('should accumulate multiple bonuses', () => {
      const premiumJob = {
        ...mockRawJob,
        source: 'linkedin' as const,
        salary: {
          min: 140000,
          max: 180000,
          currency: 'USD',
          period: 'yearly' as const,
        },
        description: 'Comprehensive job description with detailed information about the role, team, and company culture. We value diversity and inclusion.',
        postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      };

      const basicJob = {
        ...mockRawJob,
        source: 'indeed' as const,
        salary: undefined,
        description: 'Software engineer needed.',
        postedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      };

      const resultPremium = strategy.score(premiumJob, baseCriteria);
      const resultBasic = strategy.score(basicJob, baseCriteria);

      expect(resultPremium.score).toBeGreaterThan(resultBasic.score);
      expect(resultPremium.score).toBeGreaterThan(90);
      expect(resultBasic.score).toBeLessThan(85);
    });
  });

  describe('confidence levels', () => {
    it('should have high confidence for quality indicators', () => {
      const qualityJob = {
        ...mockRawJob,
        salary: {
          min: 140000,
          max: 180000,
          currency: 'USD',
          period: 'yearly' as const,
        },
        description: 'Detailed description with requirements and benefits.',
        postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      };

      const result = strategy.score(qualityJob, baseCriteria);

      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should have lower confidence for minimal data', () => {
      const minimalJob = {
        ...mockRawJob,
        salary: undefined,
        description: 'Job.',
      };

      const result = strategy.score(minimalJob, baseCriteria);

      expect(result.confidence).toBeLessThan(0.8);
    });
  });

  describe('score bounds', () => {
    it('should never exceed 100', () => {
      const maximalJob = {
        ...mockRawJob,
        source: 'linkedin' as const,
        salary: {
          min: 200000,
          max: 250000,
          currency: 'USD',
          period: 'yearly' as const,
        },
        description: 'Extremely detailed job description with comprehensive information about every aspect of the role.',
        postedDate: new Date(),
      };

      const result = strategy.score(maximalJob, baseCriteria);

      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should not go below reasonable minimum', () => {
      const poorJob = {
        ...mockRawJob,
        description: '',
        salary: undefined,
        postedDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      };

      const result = strategy.score(poorJob, baseCriteria);

      expect(result.score).toBeGreaterThan(40);
    });
  });
});
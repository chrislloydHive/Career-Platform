import { TitleRelevanceScoringStrategy } from '@/lib/scoring/title-strategy';
import { mockRawJob } from '../../fixtures/jobs';
import { ScoringCriteria } from '@/types';

describe('TitleRelevanceScoringStrategy', () => {
  let strategy: TitleRelevanceScoringStrategy;

  beforeEach(() => {
    strategy = new TitleRelevanceScoringStrategy();
  });

  describe('exact keyword match', () => {
    it('should return high score for exact title match', () => {
      const criteria: ScoringCriteria = {
        query: 'Senior Software Engineer',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        title: 'Senior Software Engineer',
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeGreaterThan(85);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should be case insensitive', () => {
      const criteria: ScoringCriteria = {
        query: 'SOFTWARE ENGINEER',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        title: 'software engineer',
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeGreaterThan(70);
    });
  });

  describe('role synonyms', () => {
    it('should recognize engineer and developer as synonyms', () => {
      const criteria: ScoringCriteria = {
        query: 'Software Engineer',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        title: 'Software Developer',
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeGreaterThan(60);
      expect(result.reasons).toContain('Role synonym match');
    });

    it('should recognize multiple synonym pairs', () => {
      const synonymPairs = [
        ['frontend engineer', 'frontend developer'],
        ['backend engineer', 'backend developer'],
        ['fullstack engineer', 'fullstack developer'],
      ];

      synonymPairs.forEach(([query, title]) => {
        const criteria: ScoringCriteria = {
          query,
          scoringWeights: {
            location: 0.30,
            titleRelevance: 0.30,
            salary: 0.20,
            sourceQuality: 0.20,
          },
        };

        const job = { ...mockRawJob, title };
        const result = strategy.score(job, criteria);
        expect(result.score).toBeGreaterThan(60);
      });
    });
  });

  describe('seniority level matching', () => {
    it('should match exact seniority levels', () => {
      const criteria: ScoringCriteria = {
        query: 'Senior Software Engineer',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        title: 'Senior Frontend Engineer',
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeGreaterThan(70);
      expect(result.reasons).toContain('Seniority level match');
    });

    it('should penalize mismatched seniority levels', () => {
      const criteria: ScoringCriteria = {
        query: 'Senior Software Engineer',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        title: 'Junior Software Engineer',
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeLessThan(70);
    });

    it('should recognize various seniority levels', () => {
      const levels = [
        'Intern',
        'Junior',
        'Mid-level',
        'Senior',
        'Staff',
        'Principal',
        'Lead',
      ];

      levels.forEach(level => {
        const criteria: ScoringCriteria = {
          query: `${level} Engineer`,
          scoringWeights: {
            location: 0.30,
            titleRelevance: 0.30,
            salary: 0.20,
            sourceQuality: 0.20,
          },
        };

        const job = { ...mockRawJob, title: `${level} Developer` };
        const result = strategy.score(job, criteria);
        expect(result.score).toBeGreaterThan(50);
      });
    });
  });

  describe('keyword extraction', () => {
    it('should extract and match key technologies', () => {
      const criteria: ScoringCriteria = {
        query: 'React TypeScript Engineer',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        title: 'Senior React & TypeScript Developer',
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeGreaterThan(75);
      expect(result.reasons).toContain('Strong keyword match');
    });

    it('should handle partial keyword matches', () => {
      const criteria: ScoringCriteria = {
        query: 'JavaScript Developer',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        title: 'Frontend Developer',
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeGreaterThan(40);
      expect(result.score).toBeLessThan(75);
    });
  });

  describe('edge cases', () => {
    it('should handle empty query', () => {
      const criteria: ScoringCriteria = {
        query: '',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const result = strategy.score(mockRawJob, criteria);

      expect(result.score).toBe(0);
      expect(result.confidence).toBe(0);
    });

    it('should handle special characters', () => {
      const criteria: ScoringCriteria = {
        query: 'C++ Developer',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        title: 'C++ Software Engineer',
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeGreaterThan(70);
    });

    it('should handle very long titles', () => {
      const criteria: ScoringCriteria = {
        query: 'Software Engineer',
        scoringWeights: {
          location: 0.30,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.20,
        },
      };

      const job = {
        ...mockRawJob,
        title: 'Senior Software Engineer II - Full Stack Development - Remote Opportunity - Cloud Infrastructure Team',
      };

      const result = strategy.score(job, criteria);

      expect(result.score).toBeGreaterThan(60);
    });
  });
});
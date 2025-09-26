import { JobScorer } from '@/lib/scoring/job-scorer';
import { mockRawJob, mockSearchCriteria } from '../../fixtures/jobs';
import { DEFAULT_SCORING_WEIGHTS } from '@/types';

describe('JobScorer', () => {
  let scorer: JobScorer;

  beforeEach(() => {
    scorer = new JobScorer();
  });

  describe('scoreJob', () => {
    it('should return a scored job with all components', () => {
      const criteria = {
        ...mockSearchCriteria,
        scoringWeights: DEFAULT_SCORING_WEIGHTS,
      };

      const result = scorer.scoreJob(mockRawJob, criteria);

      expect(result).toHaveProperty('id', mockRawJob.id);
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('scoreBreakdown');
      expect(result.scoreBreakdown).toHaveProperty('location');
      expect(result.scoreBreakdown).toHaveProperty('titleRelevance');
      expect(result.scoreBreakdown).toHaveProperty('salary');
      expect(result.scoreBreakdown).toHaveProperty('sourceQuality');
      expect(result.scoreBreakdown).toHaveProperty('total');
    });

    it('should calculate weighted scores correctly', () => {
      const criteria = {
        query: 'software engineer',
        location: 'San Francisco',
        scoringWeights: {
          location: 0.40,
          titleRelevance: 0.30,
          salary: 0.20,
          sourceQuality: 0.10,
        },
      };

      const result = scorer.scoreJob(mockRawJob, criteria);

      const { scoreBreakdown } = result;
      const calculatedTotal =
        scoreBreakdown.location.weighted +
        scoreBreakdown.titleRelevance.weighted +
        scoreBreakdown.salary.weighted +
        scoreBreakdown.sourceQuality.weighted;

      expect(Math.abs(scoreBreakdown.total - calculatedTotal)).toBeLessThan(0.01);
    });

    it('should respect custom scoring weights', () => {
      const criteria = {
        query: 'software engineer',
        scoringWeights: {
          location: 0.10,
          titleRelevance: 0.50,
          salary: 0.10,
          sourceQuality: 0.30,
        },
      };

      const result = scorer.scoreJob(mockRawJob, criteria);

      expect(result.scoreBreakdown.location.weight).toBe(0.10);
      expect(result.scoreBreakdown.titleRelevance.weight).toBe(0.50);
      expect(result.scoreBreakdown.salary.weight).toBe(0.10);
      expect(result.scoreBreakdown.sourceQuality.weight).toBe(0.30);
    });
  });

  describe('scoreJobs', () => {
    it('should score and rank multiple jobs', () => {
      const criteria = {
        ...mockSearchCriteria,
        scoringWeights: DEFAULT_SCORING_WEIGHTS,
      };

      const jobs = [
        mockRawJob,
        { ...mockRawJob, id: 'job-2', title: 'Junior Developer' },
        { ...mockRawJob, id: 'job-3', title: 'Senior Software Engineer' },
      ];

      const result = scorer.scoreJobs(jobs, criteria);

      expect(result.length).toBe(3);
      expect(result[0].rank).toBe(1);
      expect(result[1].rank).toBe(2);
      expect(result[2].rank).toBe(3);
      expect(result[0].score).toBeGreaterThanOrEqual(result[1].score);
      expect(result[1].score).toBeGreaterThanOrEqual(result[2].score);
    });

    it('should handle empty job array', () => {
      const criteria = {
        ...mockSearchCriteria,
        scoringWeights: DEFAULT_SCORING_WEIGHTS,
      };

      const result = scorer.scoreJobs([], criteria);

      expect(result).toEqual([]);
    });

    it('should include enhanced score breakdown with metadata', () => {
      const criteria = {
        ...mockSearchCriteria,
        scoringWeights: DEFAULT_SCORING_WEIGHTS,
      };

      const result = scorer.scoreJobs([mockRawJob], criteria);

      expect(result[0].metadata).toBeDefined();
      expect(result[0].metadata?.enhancedScoreBreakdown).toBeDefined();
      const enhanced = result[0].metadata?.enhancedScoreBreakdown;
      expect(enhanced?.topReasons).toBeDefined();
      expect(enhanced?.overallConfidence).toBeDefined();
      expect(Array.isArray(enhanced?.topReasons)).toBe(true);
    });

    it('should select top 5 match reasons', () => {
      const criteria = {
        ...mockSearchCriteria,
        scoringWeights: DEFAULT_SCORING_WEIGHTS,
      };

      const result = scorer.scoreJobs([mockRawJob], criteria);
      const topReasons = result[0].metadata?.enhancedScoreBreakdown?.topReasons;

      expect(topReasons).toBeDefined();
      expect(topReasons!.length).toBeLessThanOrEqual(5);
    });
  });

  describe('score bounds', () => {
    it('should keep total score between 0 and 100', () => {
      const criteria = {
        query: 'completely unrelated job title xyz',
        location: 'Antarctica',
        scoringWeights: DEFAULT_SCORING_WEIGHTS,
      };

      const result = scorer.scoreJob(mockRawJob, criteria);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle perfect matches', () => {
      const criteria = {
        query: mockRawJob.title,
        location: mockRawJob.location,
        salary: {
          min: mockRawJob.salary!.min,
          max: mockRawJob.salary!.max,
        },
        scoringWeights: DEFAULT_SCORING_WEIGHTS,
      };

      const result = scorer.scoreJob(mockRawJob, criteria);

      expect(result.score).toBeGreaterThan(85);
    });
  });

  describe('edge cases', () => {
    it('should handle jobs with missing data', () => {
      const incompleteJob = {
        ...mockRawJob,
        salary: undefined,
        description: '',
      };

      const criteria = {
        ...mockSearchCriteria,
        scoringWeights: DEFAULT_SCORING_WEIGHTS,
      };

      const result = scorer.scoreJob(incompleteJob, criteria);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
    });

    it('should handle criteria with missing preferences', () => {
      const minimalCriteria = {
        query: 'software engineer',
        scoringWeights: DEFAULT_SCORING_WEIGHTS,
      };

      const result = scorer.scoreJob(mockRawJob, minimalCriteria);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
    });

    it('should handle zero weights gracefully', () => {
      const criteria = {
        query: 'software engineer',
        scoringWeights: {
          location: 0,
          titleRelevance: 1.0,
          salary: 0,
          sourceQuality: 0,
        },
      };

      const result = scorer.scoreJob(mockRawJob, criteria);

      expect(result.scoreBreakdown.location.weighted).toBe(0);
      expect(result.scoreBreakdown.titleRelevance.weighted).toBeGreaterThan(0);
      expect(result).toBeDefined();
    });
  });

  describe('consistency', () => {
    it('should return same score for identical inputs', () => {
      const criteria = {
        ...mockSearchCriteria,
        scoringWeights: DEFAULT_SCORING_WEIGHTS,
      };

      const result1 = scorer.scoreJob(mockRawJob, criteria);
      const result2 = scorer.scoreJob(mockRawJob, criteria);

      expect(result1.score).toBe(result2.score);
      expect(result1.scoreBreakdown).toEqual(result2.scoreBreakdown);
    });

    it('should maintain relative ordering across multiple runs', () => {
      const criteria = {
        ...mockSearchCriteria,
        scoringWeights: DEFAULT_SCORING_WEIGHTS,
      };

      const jobs = [
        { ...mockRawJob, id: '1', title: 'Senior Software Engineer' },
        { ...mockRawJob, id: '2', title: 'Junior Developer' },
        { ...mockRawJob, id: '3', title: 'Software Engineer' },
      ];

      const result1 = scorer.scoreJobs(jobs, criteria);
      const result2 = scorer.scoreJobs(jobs, criteria);

      expect(result1.map(j => j.id)).toEqual(result2.map(j => j.id));
    });
  });
});
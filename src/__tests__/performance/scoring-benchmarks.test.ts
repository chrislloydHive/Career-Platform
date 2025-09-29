import { JobScorer } from '@/lib/scoring/job-scorer';
import { mockRawJob, mockSearchCriteria } from '../fixtures/jobs';
import { DEFAULT_SCORING_WEIGHTS } from '@/types';

describe('Scoring Performance Benchmarks', () => {
  let scorer: JobScorer;

  beforeEach(() => {
    scorer = new JobScorer();
  });

  const criteria = {
    ...mockSearchCriteria,
    scoringWeights: DEFAULT_SCORING_WEIGHTS,
  };

  describe('single job scoring', () => {
    it('should score a single job in under 10ms', () => {
      const startTime = performance.now();
      scorer.scoreJob(mockRawJob, criteria);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(10);
    });
  });

  describe('batch scoring performance', () => {
    it('should score 10 jobs in under 50ms', () => {
      const jobs = Array(10).fill(null).map((_, i) => ({
        ...mockRawJob,
        id: `job-${i}`,
      }));

      const startTime = performance.now();
      scorer.scoreJobs(jobs, criteria);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50);
    });

    it('should score 50 jobs in under 250ms', () => {
      const jobs = Array(50).fill(null).map((_, i) => ({
        ...mockRawJob,
        id: `job-${i}`,
        title: `Software Engineer ${i}`,
      }));

      const startTime = performance.now();
      scorer.scoreJobs(jobs, criteria);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(250);
    });

    it('should score 100 jobs in under 500ms', () => {
      const jobs = Array(100).fill(null).map((_, i) => ({
        ...mockRawJob,
        id: `job-${i}`,
        title: `${i % 10 === 0 ? 'Senior' : 'Junior'} Software Engineer`,
        location: i % 3 === 0 ? 'San Francisco' : 'Remote',
      }));

      const startTime = performance.now();
      scorer.scoreJobs(jobs, criteria);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(500);
    });
  });

  describe('memory usage', () => {
    it('should not consume excessive memory for large batches', () => {
      const jobs = Array(100).fill(null).map((_, i) => ({
        ...mockRawJob,
        id: `job-${i}`,
      }));

      const initialMemory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;
      scorer.scoreJobs(jobs, criteria);
      const finalMemory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;

      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('scalability', () => {
    it('should maintain linear time complexity', () => {
      const sizes = [10, 20, 40];
      const times: number[] = [];

      sizes.forEach(size => {
        const jobs = Array(size).fill(null).map((_, i) => ({
          ...mockRawJob,
          id: `job-${i}`,
        }));

        const startTime = performance.now();
        scorer.scoreJobs(jobs, criteria);
        const endTime = performance.now();

        times.push(endTime - startTime);
      });

      const ratio1 = times[1] / times[0];
      const ratio2 = times[2] / times[1];

      expect(ratio1).toBeLessThan(3);
      expect(ratio2).toBeLessThan(3);
    });
  });

  describe('worst case scenarios', () => {
    it('should handle jobs with very long descriptions efficiently', () => {
      const longDescriptionJob = {
        ...mockRawJob,
        description: 'A'.repeat(10000),
      };

      const startTime = performance.now();
      scorer.scoreJob(longDescriptionJob, criteria);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(15);
    });

    it('should handle jobs with very long titles efficiently', () => {
      const longTitleJob = {
        ...mockRawJob,
        title: 'Senior Software Engineer ' + 'Position '.repeat(50),
      };

      const startTime = performance.now();
      scorer.scoreJob(longTitleJob, criteria);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(15);
    });

    it('should handle complex search criteria efficiently', () => {
      const complexCriteria = {
        query: 'Senior Full Stack Software Engineer with React TypeScript Node.js',
        location: 'San Francisco Bay Area',
        preferredLocations: ['San Francisco', 'Palo Alto', 'Mountain View', 'Sunnyvale'],
        salary: { min: 120000, max: 180000 },
        keywords: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
        scoringWeights: DEFAULT_SCORING_WEIGHTS,
      };

      const startTime = performance.now();
      scorer.scoreJob(mockRawJob, complexCriteria);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(15);
    });
  });

  describe('caching and optimization', () => {
    it('should benefit from repeated scoring with same criteria', () => {
      const jobs = Array(20).fill(null).map((_, i) => ({
        ...mockRawJob,
        id: `job-${i}`,
      }));

      const startTime1 = performance.now();
      scorer.scoreJobs(jobs, criteria);
      const endTime1 = performance.now();

      const startTime2 = performance.now();
      scorer.scoreJobs(jobs, criteria);
      const endTime2 = performance.now();

      const time1 = endTime1 - startTime1;
      const time2 = endTime2 - startTime2;

      expect(time2).toBeLessThanOrEqual(time1 * 1.5);
    });
  });
});
import { RawJob, ScoredJob, ScoringWeights, ScoringCriteria, DEFAULT_SCORING_WEIGHTS } from '@/types';
import { EnhancedScoreBreakdown } from './types';
import { LocationScoringStrategy } from './location-strategy';
import { TitleRelevanceScoringStrategy } from './title-strategy';
import { SalaryScoringStrategy } from './salary-strategy';
import { SourceQualityScoringStrategy } from './source-strategy';

export class JobScorer {
  private locationStrategy: LocationScoringStrategy;
  private titleStrategy: TitleRelevanceScoringStrategy;
  private salaryStrategy: SalaryScoringStrategy;
  private sourceStrategy: SourceQualityScoringStrategy;

  constructor(
    private weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS,
    private criteria: ScoringCriteria
  ) {
    this.locationStrategy = new LocationScoringStrategy();
    this.titleStrategy = new TitleRelevanceScoringStrategy();
    this.salaryStrategy = new SalaryScoringStrategy();
    this.sourceStrategy = new SourceQualityScoringStrategy();
  }

  scoreJob(job: RawJob): ScoredJob {
    const locationResult = this.locationStrategy.score(job, this.criteria);
    const titleResult = this.titleStrategy.score(job, this.criteria);
    const salaryResult = this.salaryStrategy.score(job, this.criteria);
    const sourceResult = this.sourceStrategy.score(job, this.criteria);

    const locationWeighted = (locationResult.score / 100) * this.weights.location * 100;
    const titleWeighted = (titleResult.score / 100) * this.weights.titleRelevance * 100;
    const salaryWeighted = (salaryResult.score / 100) * this.weights.salary * 100;
    const sourceWeighted = (sourceResult.score / 100) * this.weights.sourceQuality * 100;

    const totalScore = locationWeighted + titleWeighted + salaryWeighted + sourceWeighted;

    const overallConfidence = (
      locationResult.confidence * this.weights.location +
      titleResult.confidence * this.weights.titleRelevance +
      salaryResult.confidence * this.weights.salary +
      sourceResult.confidence * this.weights.sourceQuality
    );

    const allReasons = [
      ...locationResult.reasons,
      ...titleResult.reasons,
      ...salaryResult.reasons,
      ...sourceResult.reasons,
    ];

    const topReasons = this.selectTopReasons(allReasons, [
      { results: locationResult, weight: this.weights.location },
      { results: titleResult, weight: this.weights.titleRelevance },
      { results: salaryResult, weight: this.weights.salary },
      { results: sourceResult, weight: this.weights.sourceQuality },
    ]);

    const enhancedBreakdown: EnhancedScoreBreakdown = {
      location: {
        score: locationResult.score,
        weight: this.weights.location,
        weighted: locationWeighted,
        confidence: locationResult.confidence,
        reasons: locationResult.reasons,
      },
      titleRelevance: {
        score: titleResult.score,
        weight: this.weights.titleRelevance,
        weighted: titleWeighted,
        confidence: titleResult.confidence,
        reasons: titleResult.reasons,
      },
      salary: {
        score: salaryResult.score,
        weight: this.weights.salary,
        weighted: salaryWeighted,
        confidence: salaryResult.confidence,
        reasons: salaryResult.reasons,
      },
      sourceQuality: {
        score: sourceResult.score,
        weight: this.weights.sourceQuality,
        weighted: sourceWeighted,
        confidence: sourceResult.confidence,
        reasons: sourceResult.reasons,
      },
      total: totalScore,
      overallConfidence,
      topReasons,
    };

    const simpleBreakdown = {
      location: {
        score: locationResult.score,
        weight: this.weights.location,
        weighted: locationWeighted,
      },
      titleRelevance: {
        score: titleResult.score,
        weight: this.weights.titleRelevance,
        weighted: titleWeighted,
      },
      salary: {
        score: salaryResult.score,
        weight: this.weights.salary,
        weighted: salaryWeighted,
      },
      sourceQuality: {
        score: sourceResult.score,
        weight: this.weights.sourceQuality,
        weighted: sourceWeighted,
      },
      total: totalScore,
    };

    return {
      ...job,
      score: totalScore,
      scoreBreakdown: simpleBreakdown,
      metadata: {
        ...job.metadata,
        enhancedScoreBreakdown: enhancedBreakdown,
      },
    };
  }

  scoreJobs(jobs: RawJob[]): ScoredJob[] {
    if (jobs.length === 0) {
      return [];
    }

    const batchSize = 50;
    const scoredJobs: ScoredJob[] = [];

    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      const batchScored = batch.map(job => this.scoreJob(job));
      scoredJobs.push(...batchScored);
    }

    return scoredJobs
      .sort((a, b) => b.score - a.score)
      .map((job, index) => ({
        ...job,
        rank: index + 1,
      }));
  }

  updateWeights(weights: Partial<ScoringWeights>): void {
    this.weights = { ...this.weights, ...weights };

    const total = Object.values(this.weights).reduce((sum, w) => sum + w, 0);
    if (Math.abs(total - 1.0) > 0.001) {
      throw new Error(`Weights must sum to 1.0, got ${total}`);
    }
  }

  updateCriteria(criteria: Partial<ScoringCriteria>): void {
    this.criteria = { ...this.criteria, ...criteria };
  }

  getWeights(): ScoringWeights {
    return { ...this.weights };
  }

  getCriteria(): ScoringCriteria {
    return { ...this.criteria };
  }

  private selectTopReasons(
    allReasons: string[],
    results: Array<{ results: { score: number; confidence: number; reasons: string[] }; weight: number }>
  ): string[] {
    const scoredReasons = results.flatMap(({ results: r, weight }) =>
      r.reasons.map(reason => ({
        reason,
        importance: (r.score / 100) * r.confidence * weight,
      }))
    );

    scoredReasons.sort((a, b) => b.importance - a.importance);

    const top = scoredReasons.slice(0, 5).map(sr => sr.reason);

    return [...new Set(top)];
  }
}

export function scoreJobs(
  jobs: RawJob[],
  criteria: ScoringCriteria,
  weights?: ScoringWeights
): ScoredJob[] {
  const scorer = new JobScorer(weights, criteria);
  return scorer.scoreJobs(jobs);
}
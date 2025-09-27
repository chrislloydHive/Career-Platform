import { RawJob, ScoringCriteria, JobSource } from '@/types';
import { ScoringStrategy, ScoringStrategyResult } from './types';

export class SourceQualityScoringStrategy implements ScoringStrategy {
  name = 'sourceQuality';

  private sourceRatings: Record<JobSource, {
    baseScore: number;
    reliability: number;
    jobQuality: number;
    description: string;
  }> = {
    'linkedin': {
      baseScore: 90,
      reliability: 0.95,
      jobQuality: 0.92,
      description: 'Professional network with verified companies',
    },
    'indeed': {
      baseScore: 85,
      reliability: 0.90,
      jobQuality: 0.88,
      description: 'Large job board with diverse listings',
    },
    'google_jobs': {
      baseScore: 88,
      reliability: 0.93,
      jobQuality: 0.90,
      description: 'Aggregated from multiple sources',
    },
    'company_scraper': {
      baseScore: 95,
      reliability: 0.98,
      jobQuality: 0.95,
      description: 'Direct from company career pages',
    },
  };

  score(job: RawJob, criteria: ScoringCriteria): ScoringStrategyResult {
    const sourceRating = this.sourceRatings[job.source];

    if (!sourceRating) {
      return {
        score: 50,
        confidence: 0.5,
        reasons: ['Unknown job source'],
        details: { source: job.source },
      };
    }

    const reasons: string[] = [];
    let bonusPoints = 0;

    reasons.push(`Source: ${job.source.charAt(0).toUpperCase() + job.source.slice(1)} - ${sourceRating.description}`);

    if (job.salary) {
      bonusPoints += 5;
      reasons.push('Salary information provided (+5 points)');
    }

    if (job.description && job.description.length > 200) {
      bonusPoints += 3;
      reasons.push('Detailed job description (+3 points)');
    }

    const jobAge = this.getJobAgeDays(job.postedDate);
    if (jobAge <= 7) {
      bonusPoints += 5;
      reasons.push('Recently posted (within 7 days) (+5 points)');
    } else if (jobAge <= 14) {
      bonusPoints += 3;
      reasons.push('Posted within 2 weeks (+3 points)');
    } else if (jobAge > 30) {
      bonusPoints -= 5;
      reasons.push('Older posting (30+ days) (-5 points)');
    }

    if (job.company && job.company !== 'Unknown Company' && job.company.length > 2) {
      bonusPoints += 2;
      reasons.push('Valid company information (+2 points)');
    }

    if (criteria.sourcePreferences && criteria.sourcePreferences[job.source]) {
      const userBonus = criteria.sourcePreferences[job.source];
      bonusPoints += userBonus;
      reasons.push(`User preference bonus for ${job.source} (+${userBonus} points)`);
    }

    const finalScore = Math.min(100, Math.max(0, sourceRating.baseScore + bonusPoints));

    const confidence = sourceRating.reliability;

    return {
      score: finalScore,
      confidence,
      reasons,
      details: {
        source: job.source,
        baseScore: sourceRating.baseScore,
        bonusPoints,
        reliability: sourceRating.reliability,
        jobQuality: sourceRating.jobQuality,
        jobAgeDays: jobAge,
      },
    };
  }

  private getJobAgeDays(postedDate: Date): number {
    const now = new Date();
    const diffMs = now.getTime() - postedDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  getSourceRating(source: JobSource): number {
    return this.sourceRatings[source]?.baseScore || 50;
  }

  updateSourceRating(
    source: JobSource,
    rating: Partial<typeof this.sourceRatings[JobSource]>
  ): void {
    if (this.sourceRatings[source]) {
      this.sourceRatings[source] = {
        ...this.sourceRatings[source],
        ...rating,
      };
    }
  }
}
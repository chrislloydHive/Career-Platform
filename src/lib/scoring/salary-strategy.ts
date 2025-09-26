import { RawJob, ScoringCriteria } from '@/types';
import { ScoringStrategy, ScoringStrategyResult } from './types';

export class SalaryScoringStrategy implements ScoringStrategy {
  name = 'salary';

  score(job: RawJob, criteria: ScoringCriteria): ScoringStrategyResult {
    const reasons: string[] = [];

    if (!criteria.minSalary && !criteria.maxSalary) {
      return {
        score: 50,
        confidence: 0.3,
        reasons: ['No salary preferences specified'],
        details: {},
      };
    }

    if (!job.salary) {
      return {
        score: 40,
        confidence: 0.4,
        reasons: ['Salary not disclosed'],
        details: { hasJobSalary: false },
      };
    }

    const normalizedJobSalary = this.normalizeSalaryToYearly(job.salary);
    const normalizedMinPreferred = criteria.minSalary
      ? this.normalizeSalaryToYearly({ min: criteria.minSalary, max: criteria.minSalary, currency: criteria.currency || 'USD', period: 'yearly' })
      : null;
    const normalizedMaxPreferred = criteria.maxSalary
      ? this.normalizeSalaryToYearly({ min: criteria.maxSalary, max: criteria.maxSalary, currency: criteria.currency || 'USD', period: 'yearly' })
      : null;

    if (!normalizedJobSalary.min && !normalizedJobSalary.max) {
      return {
        score: 40,
        confidence: 0.4,
        reasons: ['Could not parse salary information'],
        details: { parseError: true },
      };
    }

    const alignment = this.calculateAlignment(
      normalizedJobSalary,
      normalizedMinPreferred,
      normalizedMaxPreferred
    );

    if (alignment.type === 'perfect') {
      reasons.push(`Salary within target range: ${this.formatSalary(normalizedJobSalary)}`);
    } else if (alignment.type === 'above') {
      reasons.push(`Salary above target: ${this.formatSalary(normalizedJobSalary)}`);
    } else if (alignment.type === 'below') {
      reasons.push(`Salary below target: ${this.formatSalary(normalizedJobSalary)}`);
    } else if (alignment.type === 'partial') {
      reasons.push(`Salary partially matches: ${this.formatSalary(normalizedJobSalary)}`);
    } else if (alignment.type === 'competitive') {
      reasons.push(`Competitive salary: ${this.formatSalary(normalizedJobSalary)}`);
    }

    if (alignment.percentDifference) {
      if (alignment.percentDifference > 20) {
        reasons.push(`${alignment.percentDifference.toFixed(0)}% ${alignment.type === 'above' ? 'above' : 'below'} target`);
      }
    }

    return {
      score: alignment.score,
      confidence: alignment.confidence,
      reasons,
      details: {
        jobSalary: normalizedJobSalary,
        preferredMin: normalizedMinPreferred,
        preferredMax: normalizedMaxPreferred,
        alignmentType: alignment.type,
        percentDifference: alignment.percentDifference,
      },
    };
  }

  private normalizeSalaryToYearly(salary: {
    min?: number;
    max?: number;
    currency: string;
    period: string;
  }): { min?: number; max?: number; currency: string } {
    const multipliers: Record<string, number> = {
      'hourly': 2080,
      'daily': 260,
      'weekly': 52,
      'monthly': 12,
      'yearly': 1,
    };

    const multiplier = multipliers[salary.period] || 1;

    return {
      min: salary.min ? salary.min * multiplier : undefined,
      max: salary.max ? salary.max * multiplier : undefined,
      currency: salary.currency,
    };
  }

  private calculateAlignment(
    jobSalary: { min?: number; max?: number },
    preferredMin: { min?: number; max?: number } | null,
    preferredMax: { min?: number; max?: number } | null
  ): {
    type: 'perfect' | 'above' | 'below' | 'partial' | 'competitive' | 'unknown';
    score: number;
    confidence: number;
    percentDifference?: number;
  } {
    const jobMin = jobSalary.min || jobSalary.max || 0;
    const jobMax = jobSalary.max || jobSalary.min || 0;
    const jobMid = (jobMin + jobMax) / 2;

    const prefMin = preferredMin?.min || 0;
    const prefMax = preferredMax?.max || Infinity;

    if (!prefMin && !prefMax) {
      return { type: 'unknown', score: 50, confidence: 0.3 };
    }

    if (jobMid >= prefMin && jobMid <= prefMax) {
      const rangeSize = prefMax - prefMin;
      const position = (jobMid - prefMin) / rangeSize;

      let score = 100;
      if (position > 0.7) {
        score = 100;
      } else if (position > 0.5) {
        score = 95;
      } else if (position > 0.3) {
        score = 90;
      } else {
        score = 85;
      }

      return {
        type: 'perfect',
        score,
        confidence: 1.0,
      };
    }

    if (jobMid > prefMax) {
      const difference = ((jobMid - prefMax) / prefMax) * 100;
      const score = Math.min(100, 90 + difference * 0.5);

      return {
        type: 'above',
        score: Math.min(100, score),
        confidence: 0.95,
        percentDifference: difference,
      };
    }

    if (jobMid < prefMin) {
      const difference = ((prefMin - jobMid) / prefMin) * 100;

      let score = 100 - difference;

      if (difference < 10) {
        score = 80;
      } else if (difference < 20) {
        score = 60;
      } else if (difference < 30) {
        score = 40;
      } else {
        score = 20;
      }

      return {
        type: 'below',
        score: Math.max(0, score),
        confidence: 0.9,
        percentDifference: difference,
      };
    }

    if ((jobMin >= prefMin && jobMin <= prefMax) || (jobMax >= prefMin && jobMax <= prefMax)) {
      return {
        type: 'partial',
        score: 75,
        confidence: 0.85,
      };
    }

    return {
      type: 'competitive',
      score: 60,
      confidence: 0.7,
    };
  }

  private formatSalary(salary: { min?: number; max?: number; currency: string }): string {
    const format = (num: number) => `${salary.currency} ${(num / 1000).toFixed(0)}k`;

    if (salary.min && salary.max && salary.min !== salary.max) {
      return `${format(salary.min)} - ${format(salary.max)}`;
    } else if (salary.min) {
      return `${format(salary.min)}+`;
    } else if (salary.max) {
      return `up to ${format(salary.max)}`;
    }

    return 'Not specified';
  }
}
import { RawJob, ScoringCriteria } from '@/types';
import { ScoringStrategy, ScoringStrategyResult, LocationMatchType } from './types';

export class LocationScoringStrategy implements ScoringStrategy {
  name = 'location';

  score(job: RawJob, criteria: ScoringCriteria): ScoringStrategyResult {
    const preferredLocations = criteria.preferredLocations || [];
    const jobLocation = job.location.toLowerCase().trim();

    if (preferredLocations.length === 0) {
      return {
        score: 50,
        confidence: 0.3,
        reasons: ['No location preferences specified'],
        details: { matchType: 'unknown' },
      };
    }

    const matches = preferredLocations.map(preferred =>
      this.matchLocation(jobLocation, preferred.toLowerCase().trim())
    );

    const bestMatch = matches.reduce((best, current) =>
      current.score > best.score ? current : best
    );

    const reasons = this.generateReasons(jobLocation, bestMatch);

    return {
      score: bestMatch.score,
      confidence: bestMatch.confidence,
      reasons,
      details: {
        matchType: bestMatch.type,
        jobLocation,
        preferredLocations,
      },
    };
  }

  private matchLocation(jobLocation: string, preferred: string): LocationMatchType {
    if (this.isRemote(jobLocation)) {
      return {
        type: 'remote',
        score: 100,
        confidence: 1.0,
      };
    }

    if (this.isRemote(preferred)) {
      if (this.isRemote(jobLocation)) {
        return { type: 'exact', score: 100, confidence: 1.0 };
      } else {
        return { type: 'different', score: 30, confidence: 0.6 };
      }
    }

    if (this.isExactMatch(jobLocation, preferred)) {
      return {
        type: 'exact',
        score: 100,
        confidence: 1.0,
      };
    }

    const jobParts = this.parseLocation(jobLocation);
    const prefParts = this.parseLocation(preferred);

    if (jobParts.city && prefParts.city && this.fuzzyMatch(jobParts.city, prefParts.city)) {
      return {
        type: 'same-city',
        score: 95,
        confidence: 0.95,
      };
    }

    if (jobParts.state && prefParts.state && this.fuzzyMatch(jobParts.state, prefParts.state)) {
      return {
        type: 'same-state',
        score: 70,
        confidence: 0.8,
      };
    }

    if (jobParts.country && prefParts.country && this.fuzzyMatch(jobParts.country, prefParts.country)) {
      return {
        type: 'same-country',
        score: 40,
        confidence: 0.6,
      };
    }

    return {
      type: 'different',
      score: 20,
      confidence: 0.7,
    };
  }

  private isRemote(location: string): boolean {
    const remoteKeywords = [
      'remote',
      'work from home',
      'wfh',
      'anywhere',
      'distributed',
      'virtual',
    ];

    return remoteKeywords.some(keyword => location.includes(keyword));
  }

  private isExactMatch(location1: string, location2: string): boolean {
    const cleaned1 = this.cleanLocation(location1);
    const cleaned2 = this.cleanLocation(location2);
    return cleaned1 === cleaned2;
  }

  private cleanLocation(location: string): string {
    return location
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private parseLocation(location: string): {
    city?: string;
    state?: string;
    country?: string;
  } {
    const parts = location.split(',').map(p => p.trim());

    if (parts.length === 0) return {};

    if (parts.length === 1) {
      return { city: parts[0] };
    }

    if (parts.length === 2) {
      return {
        city: parts[0],
        state: this.normalizeState(parts[1]),
      };
    }

    return {
      city: parts[0],
      state: this.normalizeState(parts[1]),
      country: parts[2],
    };
  }

  private normalizeState(state: string): string {
    const stateAbbreviations: Record<string, string> = {
      'california': 'ca', 'ca': 'ca',
      'new york': 'ny', 'ny': 'ny',
      'texas': 'tx', 'tx': 'tx',
      'florida': 'fl', 'fl': 'fl',
      'illinois': 'il', 'il': 'il',
      'pennsylvania': 'pa', 'pa': 'pa',
      'ohio': 'oh', 'oh': 'oh',
      'georgia': 'ga', 'ga': 'ga',
      'north carolina': 'nc', 'nc': 'nc',
      'michigan': 'mi', 'mi': 'mi',
      'massachusetts': 'ma', 'ma': 'ma',
      'washington': 'wa', 'wa': 'wa',
      'colorado': 'co', 'co': 'co',
      'oregon': 'or', 'or': 'or',
      'arizona': 'az', 'az': 'az',
    };

    const normalized = state.toLowerCase().trim();
    return stateAbbreviations[normalized] || normalized;
  }

  private fuzzyMatch(str1: string, str2: string, threshold: number = 0.8): boolean {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return true;
    if (s1.includes(s2) || s2.includes(s1)) return true;

    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    const similarity = 1 - distance / maxLength;

    return similarity >= threshold;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + 1
          );
        }
      }
    }

    return dp[m][n];
  }

  private generateReasons(jobLocation: string, match: LocationMatchType): string[] {
    const reasons: string[] = [];

    switch (match.type) {
      case 'exact':
        reasons.push(`Exact location match: ${jobLocation}`);
        break;
      case 'remote':
        reasons.push('Remote position (preferred)');
        break;
      case 'same-city':
        reasons.push('Same city as preferred location');
        break;
      case 'same-state':
        reasons.push('Same state as preferred location');
        break;
      case 'same-country':
        reasons.push('Same country as preferred location');
        break;
      case 'different':
        reasons.push('Different location from preferences');
        break;
      case 'unknown':
        reasons.push('Location match unclear');
        break;
    }

    if (match.confidence < 0.7) {
      reasons.push('Low confidence in location match');
    }

    return reasons;
  }
}
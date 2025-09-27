import { DiscoveredInsight } from '../adaptive-questions/adaptive-engine';
import { UserProfile } from '@/types/user-profile';

export interface SearchTerm {
  term: string;
  source: string;
  confidence: number;
  category: 'role' | 'skill' | 'value' | 'industry' | 'work-style';
}

export interface SearchFilter {
  type: 'remote' | 'location' | 'experience-level' | 'company-size' | 'industry';
  value: string;
  reason: string;
  basedOnInsight: string;
}

export interface DiscoveryDrivenSearch {
  searchTerms: SearchTerm[];
  filters: SearchFilter[];
  explanation: string;
  insightsSummary: string[];
}

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  description: string;
  requirements: string[];
  discoveryMatches: DiscoveryMatch[];
  overallMatch: number;
}

export interface DiscoveryMatch {
  insight: string;
  matchStrength: 'strong' | 'moderate' | 'potential';
  explanation: string;
  jobEvidence: string;
}

export class DiscoveryDrivenJobSearch {
  private searchTerms: SearchTerm[] = [];
  private filters: SearchFilter[] = [];

  constructor(
    private insights: DiscoveredInsight[],
    private userProfile?: UserProfile
  ) {
    this.generateSearchTerms();
    this.generateFilters();
  }

  private generateSearchTerms() {
    for (const insight of this.insights) {
      const terms = this.extractSearchTerms(insight);
      this.searchTerms.push(...terms);
    }

    this.searchTerms = this.deduplicateAndRank(this.searchTerms);
  }

  private extractSearchTerms(insight: DiscoveredInsight): SearchTerm[] {
    const terms: SearchTerm[] = [];
    const insightLower = insight.insight.toLowerCase();

    if (insightLower.includes('autonomous') || insightLower.includes('independent')) {
      terms.push({
        term: 'product manager',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'role',
      });
      terms.push({
        term: 'self-directed',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'work-style',
      });
      terms.push({
        term: 'ownership',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'work-style',
      });
    }

    if (insightLower.includes('collaborative') || insightLower.includes('team')) {
      terms.push({
        term: 'cross-functional',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'work-style',
      });
      terms.push({
        term: 'team environment',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'work-style',
      });
    }

    if (insightLower.includes('communication') || insightLower.includes('relationship')) {
      terms.push({
        term: 'customer success',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'role',
      });
      terms.push({
        term: 'account manager',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'role',
      });
      terms.push({
        term: 'stakeholder management',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'skill',
      });
    }

    if (insightLower.includes('creative') || insightLower.includes('design')) {
      terms.push({
        term: 'UX designer',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'role',
      });
      terms.push({
        term: 'content strategist',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'role',
      });
      terms.push({
        term: 'creative problem solving',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'skill',
      });
    }

    if (insightLower.includes('health') || insightLower.includes('wellness')) {
      terms.push({
        term: 'healthcare',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'industry',
      });
      terms.push({
        term: 'digital health',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'industry',
      });
      terms.push({
        term: 'health tech',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'industry',
      });
      terms.push({
        term: 'patient',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'value',
      });
    }

    if (insightLower.includes('data') || insightLower.includes('analytical')) {
      terms.push({
        term: 'data analyst',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'role',
      });
      terms.push({
        term: 'analytics',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'skill',
      });
      terms.push({
        term: 'insights',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'skill',
      });
    }

    if (insightLower.includes('learning') || insightLower.includes('growth')) {
      terms.push({
        term: 'professional development',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'value',
      });
      terms.push({
        term: 'learning opportunities',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'value',
      });
    }

    if (insightLower.includes('marketing')) {
      terms.push({
        term: 'marketing manager',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'role',
      });
      terms.push({
        term: 'growth marketing',
        source: insight.insight,
        confidence: insight.confidence,
        category: 'role',
      });
    }

    return terms;
  }

  private generateFilters() {
    for (const insight of this.insights) {
      const filters = this.extractFilters(insight);
      this.filters.push(...filters);
    }

    this.filters = this.deduplicateFilters(this.filters);
  }

  private extractFilters(insight: DiscoveredInsight): SearchFilter[] {
    const filters: SearchFilter[] = [];
    const insightLower = insight.insight.toLowerCase();

    if (insightLower.includes('remote') || insightLower.includes('flexible')) {
      filters.push({
        type: 'remote',
        value: 'remote',
        reason: 'Prefers remote or flexible work arrangements',
        basedOnInsight: insight.insight,
      });
    }

    if (this.userProfile) {
      const hasHealthExp = this.userProfile.experience.some(e =>
        e.company.toLowerCase().includes('health') ||
        e.title.toLowerCase().includes('health')
      );

      if (hasHealthExp || insightLower.includes('health')) {
        filters.push({
          type: 'industry',
          value: 'Healthcare',
          reason: 'Strong background and interest in healthcare',
          basedOnInsight: insight.insight,
        });
      }

      const spokaneExp = this.userProfile.experience.some(e =>
        e.location?.toLowerCase().includes('spokane')
      );

      if (spokaneExp) {
        filters.push({
          type: 'location',
          value: 'Spokane, WA',
          reason: 'Current location preference',
          basedOnInsight: 'Based on work history',
        });
        filters.push({
          type: 'location',
          value: 'Seattle, WA',
          reason: 'Nearby major market with more opportunities',
          basedOnInsight: 'Based on geographic context',
        });
      }

      const yearsExp = new Date().getFullYear() - (this.userProfile.education[0]?.graduationYear || 2022);
      if (yearsExp <= 3) {
        filters.push({
          type: 'experience-level',
          value: 'Entry Level',
          reason: 'Recent graduate with 2 years experience',
          basedOnInsight: 'Based on career stage',
        });
        filters.push({
          type: 'experience-level',
          value: 'Associate',
          reason: 'Ready for mid-level opportunities',
          basedOnInsight: 'Based on career progression',
        });
      }
    }

    if (insightLower.includes('startup') || insightLower.includes('fast-paced')) {
      filters.push({
        type: 'company-size',
        value: 'Small (1-50)',
        reason: 'Thrives in startup environments',
        basedOnInsight: insight.insight,
      });
    }

    return filters;
  }

  private deduplicateAndRank(terms: SearchTerm[]): SearchTerm[] {
    const termMap = new Map<string, SearchTerm>();

    for (const term of terms) {
      const existing = termMap.get(term.term);
      if (!existing || term.confidence > existing.confidence) {
        termMap.set(term.term, term);
      }
    }

    return Array.from(termMap.values())
      .sort((a, b) => b.confidence - a.confidence);
  }

  private deduplicateFilters(filters: SearchFilter[]): SearchFilter[] {
    const filterMap = new Map<string, SearchFilter>();

    for (const filter of filters) {
      const key = `${filter.type}-${filter.value}`;
      if (!filterMap.has(key)) {
        filterMap.set(key, filter);
      }
    }

    return Array.from(filterMap.values());
  }

  getSearch(): DiscoveryDrivenSearch {
    const insightsSummary = this.insights
      .filter(i => i.confidence >= 0.7)
      .slice(0, 5)
      .map(i => i.insight);

    const explanation = this.generateExplanation();

    return {
      searchTerms: this.searchTerms.slice(0, 10),
      filters: this.filters,
      explanation,
      insightsSummary,
    };
  }

  private generateExplanation(): string {
    const topTerms = this.searchTerms.slice(0, 3).map(t => t.term);
    const roleTerms = this.searchTerms.filter(t => t.category === 'role').slice(0, 2);

    let explanation = `Based on your self-discovery, we're searching for roles`;

    if (roleTerms.length > 0) {
      explanation += ` like ${roleTerms.map(t => t.term).join(' and ')}`;
    }

    const healthTerm = this.searchTerms.find(t => t.category === 'industry' && t.term.includes('health'));
    if (healthTerm) {
      explanation += ` in the ${healthTerm.term} industry`;
    }

    const workStyleTerms = this.searchTerms
      .filter(t => t.category === 'work-style')
      .slice(0, 2);

    if (workStyleTerms.length > 0) {
      explanation += `, emphasizing ${workStyleTerms.map(t => t.term).join(' and ')}`;
    }

    const remoteFilter = this.filters.find(f => f.type === 'remote');
    if (remoteFilter) {
      explanation += ', with remote work options';
    }

    explanation += '.';

    return explanation;
  }

  matchJobToInsights(job: {
    title: string;
    company: string;
    description: string;
    requirements: string[];
    remote: boolean;
    location: string;
  }): JobMatch {
    const matches: DiscoveryMatch[] = [];
    let totalMatchScore = 0;

    const jobText = `${job.title} ${job.description} ${job.requirements.join(' ')}`.toLowerCase();

    for (const insight of this.insights) {
      const match = this.matchInsightToJob(insight, jobText, job);
      if (match) {
        matches.push(match);
        totalMatchScore += match.matchStrength === 'strong' ? 30 : match.matchStrength === 'moderate' ? 15 : 5;
      }
    }

    const overallMatch = Math.min(totalMatchScore, 100);

    return {
      id: `${job.company}-${job.title}`.replace(/\s+/g, '-').toLowerCase(),
      title: job.title,
      company: job.company,
      location: job.location,
      remote: job.remote,
      description: job.description,
      requirements: job.requirements,
      discoveryMatches: matches.sort((a, b) => {
        const strengthOrder = { strong: 3, moderate: 2, potential: 1 };
        return strengthOrder[b.matchStrength] - strengthOrder[a.matchStrength];
      }),
      overallMatch,
    };
  }

  private matchInsightToJob(
    insight: DiscoveredInsight,
    jobText: string,
    job: { remote: boolean }
  ): DiscoveryMatch | null {
    const insightLower = insight.insight.toLowerCase();

    if (insightLower.includes('autonomous') || insightLower.includes('independent')) {
      if (jobText.includes('ownership') || jobText.includes('self-directed') || jobText.includes('autonomy')) {
        return {
          insight: insight.insight,
          matchStrength: 'strong',
          explanation: 'Role emphasizes ownership and autonomy',
          jobEvidence: this.extractEvidence(jobText, ['ownership', 'self-directed', 'autonomy', 'independent']),
        };
      }
    }

    if (insightLower.includes('collaborative') || insightLower.includes('team')) {
      if (jobText.includes('cross-functional') || jobText.includes('collaborate') || jobText.includes('team')) {
        return {
          insight: insight.insight,
          matchStrength: 'strong',
          explanation: 'Strong emphasis on collaboration and teamwork',
          jobEvidence: this.extractEvidence(jobText, ['cross-functional', 'collaborate', 'team', 'partnership']),
        };
      }
    }

    if (insightLower.includes('health') || insightLower.includes('wellness')) {
      if (jobText.includes('health') || jobText.includes('patient') || jobText.includes('medical')) {
        return {
          insight: insight.insight,
          matchStrength: 'strong',
          explanation: 'Healthcare mission aligns with your values',
          jobEvidence: this.extractEvidence(jobText, ['health', 'patient', 'wellness', 'care']),
        };
      }
    }

    if (insightLower.includes('remote') || insightLower.includes('flexible')) {
      if (job.remote || jobText.includes('remote')) {
        return {
          insight: insight.insight,
          matchStrength: 'strong',
          explanation: 'Offers remote work flexibility',
          jobEvidence: job.remote ? 'Remote position' : 'Mentions remote work options',
        };
      }
    }

    if (insightLower.includes('creative') || insightLower.includes('design')) {
      if (jobText.includes('design') || jobText.includes('creative') || jobText.includes('ux')) {
        return {
          insight: insight.insight,
          matchStrength: 'moderate',
          explanation: 'Involves creative work',
          jobEvidence: this.extractEvidence(jobText, ['design', 'creative', 'ux', 'visual']),
        };
      }
    }

    if (insightLower.includes('communication') || insightLower.includes('relationship')) {
      if (jobText.includes('customer') || jobText.includes('stakeholder') || jobText.includes('communication')) {
        return {
          insight: insight.insight,
          matchStrength: 'moderate',
          explanation: 'Requires strong communication skills',
          jobEvidence: this.extractEvidence(jobText, ['customer', 'stakeholder', 'communication', 'relationship']),
        };
      }
    }

    return null;
  }

  private extractEvidence(text: string, keywords: string[]): string {
    const sentences = text.split(/[.!?]+/);

    for (const sentence of sentences) {
      for (const keyword of keywords) {
        if (sentence.toLowerCase().includes(keyword)) {
          const trimmed = sentence.trim();
          if (trimmed.length > 150) {
            return trimmed.substring(0, 147) + '...';
          }
          return trimmed;
        }
      }
    }

    return `Mentions: ${keywords.filter(k => text.includes(k)).join(', ')}`;
  }
}
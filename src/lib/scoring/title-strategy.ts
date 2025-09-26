import { RawJob, ScoringCriteria } from '@/types';
import { ScoringStrategy, ScoringStrategyResult } from './types';

export class TitleRelevanceScoringStrategy implements ScoringStrategy {
  name = 'titleRelevance';

  private roleSynonyms: Record<string, string[]> = {
    'engineer': ['developer', 'programmer', 'coder', 'engineer'],
    'developer': ['engineer', 'programmer', 'coder', 'developer'],
    'manager': ['lead', 'director', 'head', 'manager', 'supervisor'],
    'designer': ['ux', 'ui', 'design', 'designer', 'creative'],
    'analyst': ['analyst', 'analytics', 'data scientist'],
    'scientist': ['researcher', 'scientist', 'research engineer'],
    'architect': ['architect', 'principal', 'staff'],
    'consultant': ['consultant', 'advisor', 'specialist'],
  };

  private seniorityLevels: Record<string, number> = {
    'intern': 1,
    'junior': 2,
    'mid': 3,
    'senior': 4,
    'staff': 5,
    'principal': 6,
    'lead': 5,
    'manager': 5,
    'director': 6,
    'vp': 7,
    'head': 6,
  };

  score(job: RawJob, criteria: ScoringCriteria): ScoringStrategyResult {
    const keywords = criteria.relevantTitleKeywords || [];
    const jobTitle = job.title.toLowerCase().trim();

    if (keywords.length === 0) {
      return {
        score: 50,
        confidence: 0.3,
        reasons: ['No title keywords specified'],
        details: { jobTitle },
      };
    }

    const keywordMatches = this.scoreKeywordMatches(jobTitle, keywords);
    const roleMatches = this.scoreRoleMatches(jobTitle, keywords);
    const seniorityAlignment = this.scoreSeniorityAlignment(jobTitle, keywords);

    const combinedScore = (
      keywordMatches.score * 0.5 +
      roleMatches.score * 0.3 +
      seniorityAlignment.score * 0.2
    );

    const reasons = [
      ...keywordMatches.reasons,
      ...roleMatches.reasons,
      ...seniorityAlignment.reasons,
    ];

    const confidence = (
      keywordMatches.confidence * 0.5 +
      roleMatches.confidence * 0.3 +
      seniorityAlignment.confidence * 0.2
    );

    return {
      score: Math.min(100, combinedScore),
      confidence,
      reasons,
      details: {
        jobTitle,
        keywordScore: keywordMatches.score,
        roleScore: roleMatches.score,
        seniorityScore: seniorityAlignment.score,
        matchedKeywords: keywordMatches.matched,
        matchedRoles: roleMatches.matched,
      },
    };
  }

  private scoreKeywordMatches(
    jobTitle: string,
    keywords: string[]
  ): { score: number; confidence: number; reasons: string[]; matched: string[] } {
    const matched: string[] = [];
    const reasons: string[] = [];

    let exactMatches = 0;
    let partialMatches = 0;

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase().trim();

      if (jobTitle === keywordLower) {
        matched.push(keyword);
        exactMatches++;
        reasons.push(`Exact title match: "${keyword}"`);
      } else if (jobTitle.includes(keywordLower)) {
        matched.push(keyword);
        exactMatches++;
        reasons.push(`Contains keyword: "${keyword}"`);
      } else if (this.fuzzyMatch(jobTitle, keywordLower, 0.7)) {
        matched.push(keyword);
        partialMatches++;
        reasons.push(`Similar to keyword: "${keyword}"`);
      }
    }

    const matchRate = matched.length / keywords.length;
    const baseScore = (exactMatches * 100 + partialMatches * 60) / keywords.length;
    const score = Math.min(100, baseScore);

    const confidence = matchRate > 0.7 ? 1.0 : matchRate > 0.4 ? 0.8 : 0.5;

    if (matched.length === 0) {
      reasons.push('No keyword matches found');
    }

    return { score, confidence, reasons, matched };
  }

  private scoreRoleMatches(
    jobTitle: string,
    keywords: string[]
  ): { score: number; confidence: number; reasons: string[]; matched: string[] } {
    const matched: string[] = [];
    const reasons: string[] = [];

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();

      for (const [role, synonyms] of Object.entries(this.roleSynonyms)) {
        if (synonyms.some(syn => keywordLower.includes(syn))) {
          const jobHasSynonym = synonyms.some(syn => jobTitle.includes(syn));

          if (jobHasSynonym) {
            matched.push(role);
            reasons.push(`Role match: ${role} (synonym of "${keyword}")`);
            break;
          }
        }
      }
    }

    const score = matched.length > 0 ? 80 : 30;
    const confidence = matched.length > 0 ? 0.85 : 0.6;

    return { score, confidence, reasons, matched };
  }

  private scoreSeniorityAlignment(
    jobTitle: string,
    keywords: string[]
  ): { score: number; confidence: number; reasons: string[] } {
    const jobSeniority = this.extractSeniority(jobTitle);
    const preferredSeniority = this.extractSeniority(keywords.join(' '));

    const reasons: string[] = [];

    if (!jobSeniority && !preferredSeniority) {
      return {
        score: 50,
        confidence: 0.4,
        reasons: ['No seniority level detected'],
      };
    }

    if (!jobSeniority || !preferredSeniority) {
      return {
        score: 60,
        confidence: 0.5,
        reasons: ['Seniority level unclear'],
      };
    }

    const difference = Math.abs(jobSeniority.level - preferredSeniority.level);

    let score = 100;
    if (difference === 0) {
      reasons.push(`Exact seniority match: ${jobSeniority.name}`);
      score = 100;
    } else if (difference === 1) {
      reasons.push(`Close seniority: ${jobSeniority.name} vs ${preferredSeniority.name}`);
      score = 80;
    } else if (difference === 2) {
      reasons.push(`Different seniority: ${jobSeniority.name} vs ${preferredSeniority.name}`);
      score = 50;
    } else {
      reasons.push(`Significant seniority gap: ${jobSeniority.name} vs ${preferredSeniority.name}`);
      score = 30;
    }

    return {
      score,
      confidence: 0.9,
      reasons,
    };
  }

  private extractSeniority(text: string): { name: string; level: number } | null {
    const lowerText = text.toLowerCase();

    for (const [name, level] of Object.entries(this.seniorityLevels)) {
      if (lowerText.includes(name)) {
        return { name, level };
      }
    }

    return null;
  }

  private fuzzyMatch(str1: string, str2: string, threshold: number = 0.8): boolean {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return true;
    if (s1.includes(s2) || s2.includes(s1)) return true;

    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);

    const commonWords = words1.filter(w => words2.includes(w));
    const similarity = (commonWords.length * 2) / (words1.length + words2.length);

    return similarity >= threshold;
  }
}
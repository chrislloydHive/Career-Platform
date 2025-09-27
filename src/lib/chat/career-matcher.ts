import { QueryIntent, CareerSuggestion } from '@/types/chat';
import { JobCategory } from '@/types/career';
import { careerResearchService } from '@/lib/career-research';

export class ChatCareerMatcher {
  async findMatchingCareers(intent: QueryIntent): Promise<CareerSuggestion[]> {
    const allCareers = careerResearchService.getAllCareers();
    const scoredCareers: CareerSuggestion[] = [];

    for (const career of allCareers) {
      const score = this.scoreCareer(career, intent);

      if (score.relevanceScore > 0) {
        scoredCareers.push(score);
      }
    }

    return scoredCareers
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
  }

  private scoreCareer(career: JobCategory, intent: QueryIntent): CareerSuggestion {
    let score = 0;
    const matchedKeywords: string[] = [];
    const reasons: string[] = [];

    if (intent.filters.categories) {
      for (const category of intent.filters.categories) {
        if (this.categoryMatches(career.category, category)) {
          score += 30;
          matchedKeywords.push(category);
          reasons.push(`Matches ${category} field`);
          break;
        }
      }
    }

    if (intent.filters.skills) {
      const skillMatches = this.countSkillMatches(career, intent.filters.skills);
      score += skillMatches * 10;
      if (skillMatches > 0) {
        matchedKeywords.push(...intent.filters.skills);
        reasons.push(`Requires ${skillMatches} matching skill(s)`);
      }
    }

    if (intent.filters.interests) {
      const interestMatches = this.countInterestMatches(career, intent.filters.interests);
      score += interestMatches * 15;
      if (interestMatches > 0) {
        reasons.push(`Aligns with your interests`);
      }
    }

    if (intent.constraints?.remote) {
      if (career.workEnvironment?.remote) {
        score += 20;
        reasons.push('Available remotely');
      } else {
        score -= 10;
      }
    }

    if (intent.constraints?.salary && career.salaryRanges && career.salaryRanges.length > 0) {
      const salaryMatch = this.checkSalaryMatch(career.salaryRanges[0], intent.constraints.salary);
      if (salaryMatch) {
        score += 10;
        reasons.push('Meets salary expectations');
      }
    }

    if (intent.keywords.length > 0) {
      const keywordMatches = this.countKeywordMatches(career, intent.keywords);
      score += keywordMatches * 5;
    }

    const reasoning = reasons.length > 0
      ? reasons.join('; ')
      : 'General match to your query';

    return {
      career,
      relevanceScore: Math.min(100, score),
      reasoning,
      matchedKeywords: [...new Set(matchedKeywords)],
    };
  }

  private categoryMatches(careerCategory: string, searchCategory: string): boolean {
    const categoryMap: Record<string, string[]> = {
      marketing: ['Marketing', 'Content', 'Social Media'],
      healthcare: ['Healthcare', 'Medical', 'Nursing', 'Clinical'],
      technology: ['Technology', 'Software', 'IT', 'Data'],
      finance: ['Finance', 'Accounting', 'Banking'],
      design: ['Design', 'Creative', 'UX/UI'],
      wellness: ['Wellness', 'Fitness', 'Nutrition'],
    };

    const categories = categoryMap[searchCategory.toLowerCase()] || [];
    return categories.some(cat =>
      careerCategory.toLowerCase().includes(cat.toLowerCase())
    );
  }

  private countSkillMatches(career: JobCategory, skills: string[]): number {
    let matches = 0;
    const careerSkills = career.requiredSkills.map(s => s.skill);
    const careerSkillsLower = careerSkills.map(s => s.toLowerCase());

    const skillKeywords: Record<string, string[]> = {
      analytical: ['analysis', 'data', 'research', 'analytical', 'metrics'],
      creative: ['creative', 'design', 'innovation', 'artistic'],
      leadership: ['leadership', 'management', 'team', 'coordination'],
      training: ['training', 'teaching', 'education', 'coaching'],
      technical: ['technical', 'software', 'programming', 'technology'],
    };

    for (const skill of skills) {
      const keywords = skillKeywords[skill.toLowerCase()] || [skill];
      for (const keyword of keywords) {
        if (careerSkillsLower.some(s => s.includes(keyword))) {
          matches++;
          break;
        }
      }
    }

    return matches;
  }

  private countInterestMatches(career: JobCategory, interests: string[]): number {
    let matches = 0;
    const dailyTaskText = career.dailyTasks.map(t => t.task).join(' ');
    const description = `${career.description} ${dailyTaskText}`.toLowerCase();

    const interestKeywords: Record<string, string[]> = {
      people: ['people', 'team', 'collaboration', 'communication', 'clients', 'patients'],
      remote: ['remote', 'flexible', 'home', 'virtual'],
      helping: ['help', 'support', 'care', 'service', 'assist'],
      independent: ['independent', 'autonomous', 'self-directed'],
    };

    for (const interest of interests) {
      const keywords = interestKeywords[interest.toLowerCase()] || [interest];
      for (const keyword of keywords) {
        if (description.includes(keyword)) {
          matches++;
          break;
        }
      }
    }

    return matches;
  }

  private checkSalaryMatch(
    salaryRange: { min: number; max: number },
    salaryConstraint: { min?: number; max?: number }
  ): boolean {
    const careerMin = salaryRange.min;
    const careerMax = salaryRange.max;

    if (salaryConstraint.min && careerMax < salaryConstraint.min) {
      return false;
    }

    if (salaryConstraint.max && careerMin > salaryConstraint.max) {
      return false;
    }

    return true;
  }

  private countKeywordMatches(career: JobCategory, keywords: string[]): number {
    let matches = 0;
    const dailyTaskText = career.dailyTasks.map(t => t.task).join(' ');
    const skillText = career.requiredSkills.map(s => s.skill).join(' ');
    const searchableText = `
      ${career.title}
      ${career.description}
      ${dailyTaskText}
      ${skillText}
    `.toLowerCase();

    for (const keyword of keywords) {
      if (searchableText.includes(keyword.toLowerCase())) {
        matches++;
      }
    }

    return matches;
  }
}

export const careerMatcher = new ChatCareerMatcher();
import { QueryIntent } from '@/types/chat';

export class NaturalLanguageQueryProcessor {
  private readonly keywordMappings: Record<string, string[]> = {
    marketing: ['marketing', 'advertising', 'branding', 'social media', 'content', 'seo'],
    healthcare: ['healthcare', 'medical', 'health', 'nursing', 'clinical', 'patient', 'hospital'],
    technology: ['tech', 'software', 'coding', 'programming', 'it', 'computer', 'digital'],
    finance: ['finance', 'accounting', 'banking', 'investment', 'money', 'financial'],
    design: ['design', 'creative', 'ux', 'ui', 'graphic', 'visual', 'art'],
    wellness: ['wellness', 'fitness', 'yoga', 'nutrition', 'mental health', 'therapy'],
    remote: ['remote', 'work from home', 'wfh', 'anywhere', 'virtual', 'distributed'],
    people: ['people', 'help', 'service', 'care', 'support', 'community', 'social'],
    analytical: ['analytical', 'data', 'analysis', 'research', 'insights', 'metrics'],
    creative: ['creative', 'innovation', 'artistic', 'imagination', 'original'],
    leadership: ['leadership', 'management', 'lead', 'manage', 'supervise', 'team'],
    training: ['training', 'teaching', 'education', 'coaching', 'mentoring', 'instruction'],
  };

  private readonly intentPatterns = {
    career_search: [
      /what (jobs|careers|roles|positions)/i,
      /show me (jobs|careers|roles)/i,
      /find (jobs|careers|roles)/i,
      /looking for/i,
      /interested in/i,
      /want to work/i,
    ],
    comparison: [
      /compare/i,
      /difference between/i,
      /versus|vs/i,
      /better|worse/i,
    ],
    information: [
      /what (is|are)/i,
      /how (much|many)/i,
      /tell me about/i,
      /explain/i,
      /describe/i,
    ],
    exploration: [
      /explore/i,
      /discover/i,
      /options/i,
      /possibilities/i,
      /could i/i,
    ],
  };

  processQuery(queryText: string): QueryIntent {
    const normalized = queryText.toLowerCase();

    const type = this.detectIntentType(normalized);
    const keywords = this.extractKeywords(normalized);
    const filters = this.extractFilters(normalized, keywords);
    const constraints = this.extractConstraints(normalized);

    return {
      type,
      keywords,
      filters,
      constraints,
    };
  }

  private detectIntentType(text: string): QueryIntent['type'] {
    for (const [intentType, patterns] of Object.entries(this.intentPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return intentType as QueryIntent['type'];
        }
      }
    }
    return 'career_search';
  }

  private extractKeywords(text: string): string[] {
    const keywords: string[] = [];

    for (const [category, terms] of Object.entries(this.keywordMappings)) {
      for (const term of terms) {
        if (text.includes(term)) {
          keywords.push(category);
          break;
        }
      }
    }

    return [...new Set(keywords)];
  }

  private extractFilters(text: string, keywords: string[]): QueryIntent['filters'] {
    const filters: QueryIntent['filters'] = {};

    const categoryKeywords = keywords.filter(k =>
      ['marketing', 'healthcare', 'technology', 'finance', 'design', 'wellness'].includes(k)
    );
    if (categoryKeywords.length > 0) {
      filters.categories = categoryKeywords;
    }

    const skillKeywords = keywords.filter(k =>
      ['analytical', 'creative', 'leadership', 'training'].includes(k)
    );
    if (skillKeywords.length > 0) {
      filters.skills = skillKeywords;
    }

    const interestKeywords = keywords.filter(k =>
      ['people', 'remote'].includes(k)
    );
    if (interestKeywords.length > 0) {
      filters.interests = interestKeywords;
    }

    if (keywords.includes('remote') || /\b(remote|work from home|wfh)\b/i.test(text)) {
      filters.workEnvironment = ['remote'];
    }

    return filters;
  }

  private extractConstraints(text: string): QueryIntent['constraints'] {
    const constraints: QueryIntent['constraints'] = {};

    if (/\b(remote|work from home|wfh|anywhere)\b/i.test(text)) {
      constraints.remote = true;
    }

    const salaryMatch = text.match(/\$?\d+[k]?/gi);
    if (salaryMatch) {
      const amounts = salaryMatch.map(s => {
        const num = parseInt(s.replace(/[$k]/gi, ''));
        return s.toLowerCase().includes('k') ? num * 1000 : num;
      });

      if (amounts.length === 1) {
        constraints.salary = { min: amounts[0] };
      } else if (amounts.length >= 2) {
        constraints.salary = { min: Math.min(...amounts), max: Math.max(...amounts) };
      }
    }

    const educationTerms = {
      'high school': 'high-school',
      'bachelors': 'bachelors',
      'masters': 'masters',
      'phd': 'phd',
      'degree': 'bachelors',
    };

    for (const [term, value] of Object.entries(educationTerms)) {
      if (text.includes(term)) {
        constraints.education = value;
        break;
      }
    }

    return constraints;
  }

  generateFollowUpQuestions(intent: QueryIntent, foundCareers: number): string[] {
    const questions: string[] = [];

    if (intent.filters.categories && intent.filters.categories.length === 1) {
      questions.push(`Are you interested in other fields beyond ${intent.filters.categories[0]}?`);
    }

    if (intent.filters.categories && intent.filters.categories.length > 1) {
      questions.push(`Would you prefer to focus more on ${intent.filters.categories[0]} or ${intent.filters.categories[1]}?`);
    }

    if (!intent.constraints?.remote && foundCareers > 5) {
      questions.push('Would you consider remote work opportunities?');
    }

    if (!intent.filters.skills || intent.filters.skills.length === 0) {
      questions.push('What are your strongest skills?');
    }

    if (foundCareers === 0) {
      questions.push('Could you tell me more about your background and interests?');
      questions.push('What type of work environment do you prefer?');
    } else if (foundCareers > 10) {
      questions.push('Would you like me to narrow down these options?');
      questions.push('What matters most to you: salary, work-life balance, or growth opportunities?');
    }

    return questions.slice(0, 3);
  }

  generateResponseMessage(intent: QueryIntent, suggestionsCount: number): string {
    if (suggestionsCount === 0) {
      return `I couldn't find careers matching "${intent.keywords.join(', ')}". Could you provide more details about what you're looking for?`;
    }

    const keywordText = intent.keywords.length > 0
      ? ` combining ${intent.keywords.join(' and ')}`
      : '';

    if (suggestionsCount === 1) {
      return `I found 1 career${keywordText} that matches your interests.`;
    }

    if (suggestionsCount <= 5) {
      return `I found ${suggestionsCount} careers${keywordText} that could be a great fit for you.`;
    }

    return `I found ${suggestionsCount} careers${keywordText}. Here are the top matches based on your query.`;
  }
}

export const queryProcessor = new NaturalLanguageQueryProcessor();
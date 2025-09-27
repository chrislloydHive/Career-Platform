import { JobCategory } from '@/types/career';

export interface CareerWebSearchResult {
  title: string;
  snippet: string;
  url: string;
  source: string;
  date?: string;
  relevanceScore: number;
}

export interface MarketDataInsight {
  category: 'salary' | 'demand' | 'skills' | 'trends' | 'lifestyle' | 'emerging';
  title: string;
  content: string;
  source: string;
  url?: string;
  lastUpdated?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface HybridCareerData {
  databaseCareer: JobCategory | null;
  webInsights: MarketDataInsight[];
  searchResults: CareerWebSearchResult[];
  isEmerging: boolean;
  lastSearched: Date;
}

export interface CareerSearchQuery {
  roleName: string;
  location?: string;
  focusAreas?: Array<'salary' | 'requirements' | 'daytoday' | 'trends' | 'skills'>;
  includeEmerging?: boolean;
}

export class CareerWebSearchService {
  private readonly searchEndpoint = '/api/career-web-search';

  async searchCareerData(query: CareerSearchQuery): Promise<HybridCareerData> {
    try {
      const response = await fetch(this.searchEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Career web search error:', error);
      throw error;
    }
  }

  async getMarketTrends(roleName: string): Promise<MarketDataInsight[]> {
    const searchQueries = [
      `${roleName} job market trends 2025`,
      `${roleName} hiring demand statistics`,
      `${roleName} career outlook`,
    ];

    const insights: MarketDataInsight[] = [];

    for (const query of searchQueries) {
      try {
        const results = await this.performWebSearch(query, 3);
        const parsedInsights = this.parseResultsForTrends(results, roleName);
        insights.push(...parsedInsights);
      } catch (error) {
        console.error(`Failed to get trends for query: ${query}`, error);
      }
    }

    return this.deduplicateInsights(insights);
  }

  async getCurrentSalaryData(roleName: string, location?: string): Promise<MarketDataInsight[]> {
    const locationQuery = location ? ` in ${location}` : '';
    const searchQueries = [
      `${roleName} salary${locationQuery} 2025`,
      `${roleName} average pay${locationQuery}`,
      `${roleName} compensation range${locationQuery}`,
    ];

    const insights: MarketDataInsight[] = [];

    for (const query of searchQueries) {
      try {
        const results = await this.performWebSearch(query, 3);
        const parsedInsights = this.parseResultsForSalary(results, roleName);
        insights.push(...parsedInsights);
      } catch (error) {
        console.error(`Failed to get salary data for query: ${query}`, error);
      }
    }

    return this.deduplicateInsights(insights);
  }

  async getDayInLifeInfo(roleName: string): Promise<MarketDataInsight[]> {
    const searchQueries = [
      `day in the life of ${roleName}`,
      `${roleName} daily responsibilities`,
      `what does ${roleName} do every day`,
    ];

    const insights: MarketDataInsight[] = [];

    for (const query of searchQueries) {
      try {
        const results = await this.performWebSearch(query, 5);
        const parsedInsights = this.parseResultsForLifestyle(results, roleName);
        insights.push(...parsedInsights);
      } catch (error) {
        console.error(`Failed to get day-in-life info for query: ${query}`, error);
      }
    }

    return this.deduplicateInsights(insights);
  }

  async getSkillsAndRequirements(roleName: string): Promise<MarketDataInsight[]> {
    const searchQueries = [
      `${roleName} required skills 2025`,
      `${roleName} job requirements`,
      `how to become ${roleName}`,
    ];

    const insights: MarketDataInsight[] = [];

    for (const query of searchQueries) {
      try {
        const results = await this.performWebSearch(query, 3);
        const parsedInsights = this.parseResultsForSkills(results, roleName);
        insights.push(...parsedInsights);
      } catch (error) {
        console.error(`Failed to get skills info for query: ${query}`, error);
      }
    }

    return this.deduplicateInsights(insights);
  }

  async discoverEmergingRoles(category: string): Promise<CareerWebSearchResult[]> {
    const searchQueries = [
      `emerging ${category} jobs 2025`,
      `new ${category} career opportunities`,
      `future of ${category} careers`,
    ];

    const allResults: CareerWebSearchResult[] = [];

    for (const query of searchQueries) {
      try {
        const results = await this.performWebSearch(query, 5);
        allResults.push(...results);
      } catch (error) {
        console.error(`Failed to discover emerging roles for query: ${query}`, error);
      }
    }

    return this.deduplicateSearchResults(allResults);
  }

  private async performWebSearch(query: string, maxResults: number = 5): Promise<CareerWebSearchResult[]> {
    try {
      const response = await fetch('/api/web-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, maxResults }),
      });

      if (!response.ok) {
        throw new Error(`Web search failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Web search error:', error);
      return [];
    }
  }

  private parseResultsForTrends(results: CareerWebSearchResult[], roleName: string): MarketDataInsight[] {
    return results.map(result => ({
      category: 'trends' as const,
      title: `Market Trend: ${result.title}`,
      content: result.snippet,
      source: result.source,
      url: result.url,
      confidence: this.calculateConfidence(result, ['trend', 'outlook', 'growth', 'demand']),
    }));
  }

  private parseResultsForSalary(results: CareerWebSearchResult[], roleName: string): MarketDataInsight[] {
    return results.map(result => ({
      category: 'salary' as const,
      title: `Salary Data: ${result.title}`,
      content: result.snippet,
      source: result.source,
      url: result.url,
      confidence: this.calculateConfidence(result, ['salary', 'compensation', 'pay', '$']),
    }));
  }

  private parseResultsForLifestyle(results: CareerWebSearchResult[], roleName: string): MarketDataInsight[] {
    return results.map(result => ({
      category: 'lifestyle' as const,
      title: `Day-in-Life: ${result.title}`,
      content: result.snippet,
      source: result.source,
      url: result.url,
      confidence: this.calculateConfidence(result, ['day', 'daily', 'routine', 'responsibilities']),
    }));
  }

  private parseResultsForSkills(results: CareerWebSearchResult[], roleName: string): MarketDataInsight[] {
    return results.map(result => ({
      category: 'skills' as const,
      title: `Skills & Requirements: ${result.title}`,
      content: result.snippet,
      source: result.source,
      url: result.url,
      confidence: this.calculateConfidence(result, ['skills', 'requirements', 'qualifications', 'education']),
    }));
  }

  private calculateConfidence(result: CareerWebSearchResult, keywords: string[]): 'high' | 'medium' | 'low' {
    const text = (result.title + ' ' + result.snippet).toLowerCase();
    const matchCount = keywords.filter(keyword => text.includes(keyword.toLowerCase())).length;

    const trustedSources = ['linkedin', 'glassdoor', 'indeed', 'bls.gov', 'bureau of labor'];
    const isTrusted = trustedSources.some(source => result.source.toLowerCase().includes(source));

    if (isTrusted && matchCount >= 2) return 'high';
    if (matchCount >= 2 || isTrusted) return 'medium';
    return 'low';
  }

  private deduplicateInsights(insights: MarketDataInsight[]): MarketDataInsight[] {
    const seen = new Set<string>();
    return insights.filter(insight => {
      const key = `${insight.title}-${insight.content.substring(0, 50)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private deduplicateSearchResults(results: CareerWebSearchResult[]): CareerWebSearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      if (seen.has(result.url)) return false;
      seen.add(result.url);
      return true;
    });
  }

  async getComprehensiveCareerInsights(
    roleName: string,
    location?: string
  ): Promise<{
    trends: MarketDataInsight[];
    salary: MarketDataInsight[];
    lifestyle: MarketDataInsight[];
    skills: MarketDataInsight[];
  }> {
    const [trends, salary, lifestyle, skills] = await Promise.all([
      this.getMarketTrends(roleName),
      this.getCurrentSalaryData(roleName, location),
      this.getDayInLifeInfo(roleName),
      this.getSkillsAndRequirements(roleName),
    ]);

    return { trends, salary, lifestyle, skills };
  }
}

export const careerWebSearchService = new CareerWebSearchService();
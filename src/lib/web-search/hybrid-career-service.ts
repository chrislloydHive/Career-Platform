import { JobCategory } from '@/types/career';
import { careerResearchService } from '@/lib/career-research';
import { careerWebSearchService, HybridCareerData, MarketDataInsight } from './career-search-service';

export interface EnhancedCareerData {
  career: JobCategory;
  liveInsights: MarketDataInsight[];
  enrichmentScore: number;
  dataFreshness: 'current' | 'recent' | 'outdated';
}

export interface CareerDiscoveryResult {
  existingCareers: EnhancedCareerData[];
  emergingRoles: {
    title: string;
    description: string;
    sources: string[];
    confidence: 'high' | 'medium' | 'low';
  }[];
  searchQuery: string;
  timestamp: Date;
}

export class HybridCareerService {
  async getEnhancedCareerData(careerId: string): Promise<EnhancedCareerData | null> {
    const career = careerResearchService.getCareerById(careerId);
    if (!career) return null;

    const liveInsights = await careerWebSearchService.getComprehensiveCareerInsights(
      career.title,
      undefined
    );

    const allInsights = [
      ...liveInsights.trends,
      ...liveInsights.salary,
      ...liveInsights.lifestyle,
      ...liveInsights.skills,
    ];

    const enrichmentScore = this.calculateEnrichmentScore(career, allInsights);
    const dataFreshness = this.assessDataFreshness(career, allInsights);

    return {
      career,
      liveInsights: allInsights,
      enrichmentScore,
      dataFreshness,
    };
  }

  async searchCareers(query: string, includeWebData: boolean = true): Promise<CareerDiscoveryResult> {
    const normalizedQuery = query.toLowerCase();

    const databaseResults = careerResearchService.searchCareers({
      keywords: [normalizedQuery],
    });

    if (!includeWebData) {
      return {
        existingCareers: databaseResults.map(career => ({
          career,
          liveInsights: [],
          enrichmentScore: 0,
          dataFreshness: 'outdated' as const,
        })),
        emergingRoles: [],
        searchQuery: query,
        timestamp: new Date(),
      };
    }

    const enrichedCareers = await Promise.all(
      databaseResults.slice(0, 5).map(async (career) => {
        const liveInsights = await careerWebSearchService.getComprehensiveCareerInsights(
          career.title,
          undefined
        );

        const allInsights = [
          ...liveInsights.trends,
          ...liveInsights.salary,
          ...liveInsights.lifestyle,
          ...liveInsights.skills,
        ];

        return {
          career,
          liveInsights: allInsights,
          enrichmentScore: this.calculateEnrichmentScore(career, allInsights),
          dataFreshness: this.assessDataFreshness(career, allInsights),
        };
      })
    );

    const emergingResults = await careerWebSearchService.discoverEmergingRoles(query);

    const emergingRoles = emergingResults.map(result => ({
      title: result.title,
      description: result.snippet,
      sources: [result.source],
      confidence: result.relevanceScore > 0.8 ? 'high' as const :
                  result.relevanceScore > 0.6 ? 'medium' as const : 'low' as const,
    }));

    return {
      existingCareers: enrichedCareers,
      emergingRoles,
      searchQuery: query,
      timestamp: new Date(),
    };
  }

  async getCareerByNameWithWebData(roleName: string): Promise<HybridCareerData> {
    const hybridData = await careerWebSearchService.searchCareerData({
      roleName,
      focusAreas: ['salary', 'requirements', 'daytoday', 'trends', 'skills'],
      includeEmerging: true,
    });

    return hybridData;
  }

  async compareCareerWithMarketData(
    career: JobCategory,
    location?: string
  ): Promise<{
    career: JobCategory;
    marketComparison: {
      salaryDifference: string;
      skillsGap: string[];
      trendAlignment: 'aligned' | 'outdated' | 'ahead';
    };
    recommendations: string[];
  }> {
    const webInsights = await careerWebSearchService.getComprehensiveCareerInsights(
      career.title,
      location
    );

    const salaryInsights = webInsights.salary;
    const skillsInsights = webInsights.skills;
    const trendInsights = webInsights.trends;

    const salaryDifference = this.compareSalaries(career, salaryInsights);
    const skillsGap = this.identifySkillsGap(career, skillsInsights);
    const trendAlignment = this.assessTrendAlignment(career, trendInsights);

    const recommendations = this.generateRecommendations(
      career,
      salaryDifference,
      skillsGap,
      trendAlignment
    );

    return {
      career,
      marketComparison: {
        salaryDifference,
        skillsGap,
        trendAlignment,
      },
      recommendations,
    };
  }

  private calculateEnrichmentScore(career: JobCategory, insights: MarketDataInsight[]): number {
    const highConfidenceCount = insights.filter(i => i.confidence === 'high').length;
    const mediumConfidenceCount = insights.filter(i => i.confidence === 'medium').length;

    const score = (highConfidenceCount * 10 + mediumConfidenceCount * 5) / Math.max(insights.length, 1);
    return Math.min(100, score * 10);
  }

  private assessDataFreshness(
    career: JobCategory,
    insights: MarketDataInsight[]
  ): 'current' | 'recent' | 'outdated' {
    const recentInsights = insights.filter(insight => {
      if (!insight.lastUpdated) return false;
      const date = new Date(insight.lastUpdated);
      const monthsAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsAgo < 6;
    });

    if (recentInsights.length >= insights.length * 0.7) return 'current';
    if (recentInsights.length >= insights.length * 0.3) return 'recent';
    return 'outdated';
  }

  private compareSalaries(career: JobCategory, salaryInsights: MarketDataInsight[]): string {
    const dbMedianSalary = career.salaryRanges[0]?.median || 0;

    if (dbMedianSalary === 0) {
      return 'Database salary data not available. Check web insights for current market rates.';
    }

    return `Database shows median of $${dbMedianSalary.toLocaleString()}. Web data suggests similar ranges with variation by location and experience.`;
  }

  private identifySkillsGap(career: JobCategory, skillsInsights: MarketDataInsight[]): string[] {
    const gaps: string[] = [];

    const hasModernTechSkills = career.requiredSkills.some(skill =>
      ['AI', 'machine learning', 'cloud', 'automation'].some(modern =>
        skill.skill.toLowerCase().includes(modern.toLowerCase())
      )
    );

    if (!hasModernTechSkills) {
      gaps.push('Modern technology skills (AI, Cloud, Automation)');
    }

    const hasSoftSkills = career.requiredSkills.some(skill =>
      skill.category === 'soft'
    );

    if (!hasSoftSkills) {
      gaps.push('Soft skills emphasis (Communication, Leadership, Collaboration)');
    }

    return gaps;
  }

  private assessTrendAlignment(
    career: JobCategory,
    trendInsights: MarketDataInsight[]
  ): 'aligned' | 'outdated' | 'ahead' {
    const growthKeywords = ['growing', 'increasing', 'high demand', 'expanding'];
    const declineKeywords = ['declining', 'decreasing', 'low demand', 'shrinking'];

    const trendText = trendInsights.map(i => i.content.toLowerCase()).join(' ');

    const hasGrowth = growthKeywords.some(keyword => trendText.includes(keyword));
    const hasDecline = declineKeywords.some(keyword => trendText.includes(keyword));

    if (hasGrowth && !hasDecline) return 'aligned';
    if (hasDecline) return 'outdated';
    return 'ahead';
  }

  private generateRecommendations(
    career: JobCategory,
    salaryDifference: string,
    skillsGap: string[],
    trendAlignment: 'aligned' | 'outdated' | 'ahead'
  ): string[] {
    const recommendations: string[] = [];

    if (skillsGap.length > 0) {
      recommendations.push(
        `Consider developing skills in: ${skillsGap.join(', ')}`
      );
    }

    if (trendAlignment === 'aligned') {
      recommendations.push(
        'This career aligns well with current market trends. Continue building expertise.'
      );
    } else if (trendAlignment === 'outdated') {
      recommendations.push(
        'Market trends suggest evolving this role. Look into related emerging positions.'
      );
    }

    recommendations.push(
      'Review web insights regularly to stay current with industry changes.'
    );

    recommendations.push(
      'Network with professionals in this field to learn about real-world experiences.'
    );

    return recommendations;
  }
}

export const hybridCareerService = new HybridCareerService();
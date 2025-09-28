import { DiscoveredInsight } from '../adaptive-questions/adaptive-engine';
import { QuestionResponse } from '../adaptive-questions/adaptive-engine';
import { UserProfile } from '@/types/user-profile';
import { JobCategory } from '@/types/career';

export interface CareerFitScore {
  careerTitle: string;
  careerCategory: string;
  currentScore: number;
  previousScore: number;
  change: number;
  trend: 'rising' | 'falling' | 'stable' | 'new';
  matchFactors: MatchFactor[];
  recentBoost?: ScoreChange;
}

export interface MatchFactor {
  factor: string;
  contribution: number;
  strength: 'strong' | 'moderate' | 'weak';
  basedOn: string[];
}

export interface ScoreChange {
  reason: string;
  magnitude: number;
  insightsTrigger: string[];
  timestamp: Date;
}

export interface LiveCareerUpdate {
  careerTitle: string;
  newScore: number;
  oldScore: number;
  change: number;
  message: string;
  timestamp: Date;
  isSignificant: boolean;
}

export class RealtimeCareerMatcher {
  private careerScores: Map<string, CareerFitScore> = new Map();
  private scoreHistory: Map<string, number[]> = new Map();
  private recentUpdates: LiveCareerUpdate[] = [];

  constructor(
    private responses: Record<string, QuestionResponse>,
    private insights: DiscoveredInsight[],
    private userProfile?: UserProfile,
    private userCareers?: JobCategory[]
  ) {
    this.calculateInitialScores();
  }

  private calculateInitialScores() {
    const careers = this.getAllCareers();

    for (const career of careers) {
      const score = this.calculateCareerScore(career);
      this.careerScores.set(career.title, {
        careerTitle: career.title,
        careerCategory: career.category,
        currentScore: score.score,
        previousScore: score.score,
        change: 0,
        trend: 'stable',
        matchFactors: score.factors,
      });
      this.scoreHistory.set(career.title, [score.score]);
    }
  }

  updateScores(newInsights: DiscoveredInsight[], newResponses?: Record<string, QuestionResponse>): LiveCareerUpdate[] {
    this.insights = newInsights;
    if (newResponses) {
      this.responses = newResponses;
    }

    const updates: LiveCareerUpdate[] = [];

    for (const [title, career] of this.careerScores.entries()) {
      const oldScore = career.currentScore;
      const newScoreData = this.calculateCareerScore({
        title: career.careerTitle,
        category: career.careerCategory,
      });

      career.previousScore = oldScore;
      career.currentScore = newScoreData.score;
      career.change = newScoreData.score - oldScore;
      career.matchFactors = newScoreData.factors;

      const history = this.scoreHistory.get(title) || [];
      history.push(newScoreData.score);
      this.scoreHistory.set(title, history);

      career.trend = this.calculateTrend(history);

      if (Math.abs(career.change) >= 5) {
        const update = this.generateUpdate(career, newInsights);
        updates.push(update);
        career.recentBoost = {
          reason: update.message,
          magnitude: career.change,
          insightsTrigger: newInsights.map(i => i.insight),
          timestamp: new Date(),
        };
      }
    }

    this.recentUpdates = updates;
    return updates.filter(u => u.isSignificant);
  }

  private calculateCareerScore(career: { title: string; category: string }): {
    score: number;
    factors: MatchFactor[];
  } {
    const factors: MatchFactor[] = [];
    let totalScore = 0;

    const areaScores = this.calculateAreaBasedMatches(career);
    areaScores.forEach(areaScore => {
      if (areaScore.score > 0) {
        factors.push(areaScore.factor);
        totalScore += areaScore.score;
      }
    });

    const dataCompleteness = this.calculateDataCompleteness();
    let confidenceMultiplier = 1.0;

    if (dataCompleteness < 0.3) confidenceMultiplier = 0.6;
    else if (dataCompleteness < 0.5) confidenceMultiplier = 0.75;
    else if (dataCompleteness < 0.7) confidenceMultiplier = 0.85;
    else if (dataCompleteness < 0.9) confidenceMultiplier = 0.95;

    const finalScore = totalScore * confidenceMultiplier;

    return {
      score: Math.min(finalScore, 95),
      factors: factors.sort((a, b) => b.contribution - a.contribution),
    };
  }

  private calculateDataCompleteness(): number {
    const totalPossibleResponses = 49;
    const actualResponses = Object.keys(this.responses).length;
    const insightCount = this.insights.length;

    const responseCompleteness = actualResponses / totalPossibleResponses;
    const insightCompleteness = Math.min(insightCount / 10, 1.0);

    return (responseCompleteness * 0.7) + (insightCompleteness * 0.3);
  }

  getDataCompletenessPercentage(): number {
    return Math.round(this.calculateDataCompleteness() * 100);
  }

  private calculateAreaBasedMatches(career: { title: string; category: string }): Array<{
    score: number;
    factor: MatchFactor;
  }> {
    const results: Array<{ score: number; factor: MatchFactor }> = [];

    const areaInsights: Record<string, string[]> = {
      'work-style': ['Work Style'],
      'people-interaction': ['People & Collaboration'],
      'problem-solving': ['Problem Solving'],
      'creativity': ['Creative Thinking'],
      'structure-flexibility': ['Structure & Flexibility'],
      'values': ['Core Values'],
      'environment': ['Work Environment'],
      'learning-growth': ['Learning & Growth']
    };

    const questionPrefixToArea: Record<string, string> = {
      'ws': 'work-style',
      'cd': 'people-interaction',
      'pi': 'people-interaction',
      'ps': 'problem-solving',
      'cr': 'creativity',
      'sf': 'structure-flexibility',
      'val': 'values',
      'env': 'environment',
      'lg': 'learning-growth'
    };

    Object.entries(areaInsights).forEach(([area, labels]) => {
      const areaInsightsList = this.insights.filter(i => i.area === area);
      const areaResponses = Object.entries(this.responses).filter(([qId]) => {
        const prefix = qId.split('-')[0];
        return questionPrefixToArea[prefix] === area;
      });

      const hasData = areaInsightsList.length > 0 || areaResponses.length > 0;

      if (hasData) {
        let avgConfidence = 0.7;
        let basedOn: string[] = [];

        if (areaInsightsList.length > 0) {
          avgConfidence = areaInsightsList.reduce((sum, i) => sum + i.confidence, 0) / areaInsightsList.length;
          basedOn = areaInsightsList.map(i => i.insight);
        } else if (areaResponses.length > 0) {
          avgConfidence = 0.5 + (areaResponses.length * 0.05);
          basedOn = [`${areaResponses.length} responses in this area`];
        }

        const careerRelevance = this.calculateCareerRelevanceForArea(career, area, areaInsightsList);
        const responseBoost = Math.min(areaResponses.length * 0.5, 3);
        const score = (avgConfidence * careerRelevance * 15) + responseBoost;

        if (score > 2) {
          results.push({
            score,
            factor: {
              factor: labels[0],
              contribution: score,
              strength: score > 12 ? 'strong' : score > 6 ? 'moderate' : 'weak',
              basedOn
            }
          });
        }
      }
    });

    return results;
  }

  private calculateCareerRelevanceForArea(
    career: { title: string; category: string },
    area: string,
    insights: DiscoveredInsight[]
  ): number {
    const title = career.title.toLowerCase();
    const category = career.category.toLowerCase();

    switch (area) {
      case 'work-style':
        if (title.includes('freelance') || title.includes('remote')) return 1.2;
        return 1.0;

      case 'people-interaction':
        if (title.includes('manager') || title.includes('success') || title.includes('sales') || title.includes('marketing') || title.includes('coordinator')) return 1.3;
        return 1.0;

      case 'problem-solving':
        if (title.includes('analyst') || title.includes('consultant') || title.includes('architect') || title.includes('engineer')) return 1.3;
        return 1.0;

      case 'creativity':
        if (title.includes('design') || title.includes('creative') || title.includes('content') || category.includes('design')) return 1.3;
        return 0.8;

      case 'structure-flexibility':
        if (title.includes('freelance') || title.includes('consultant') || title.includes('entrepreneur')) return 1.2;
        if (title.includes('coordinator') || title.includes('operations')) return 0.9;
        return 1.0;

      case 'values':
        const hasHealthcare = title.includes('health') || category.includes('health');
        const hasSocial = insights.some(i => i.insight.toLowerCase().includes('impact') || i.insight.toLowerCase().includes('help'));
        if (hasHealthcare && hasSocial) return 1.3;
        return 1.0;

      case 'environment':
        if (title.includes('remote') || title.includes('hybrid')) return 1.1;
        return 1.0;

      case 'learning-growth':
        if (title.includes('specialist') || title.includes('coordinator') || title.includes('trainer') || title.includes('developer')) return 1.2;
        return 1.0;

      default:
        return 1.0;
    }
  }

  private calculateAutonomyMatch(career: { title: string; category: string }): {
    score: number;
    factor: MatchFactor;
  } {
    const autonomyInsights = this.insights.filter(i =>
      i.insight.toLowerCase().includes('autonomous') ||
      i.insight.toLowerCase().includes('independent') ||
      i.insight.toLowerCase().includes('ownership')
    );

    if (autonomyInsights.length === 0) return { score: 0, factor: this.emptyFactor() };

    const avgConfidence = autonomyInsights.reduce((sum, i) => sum + i.confidence, 0) / autonomyInsights.length;

    const highAutonomyCareers = ['Product Manager', 'Consultant', 'Entrepreneur', 'Designer', 'Data Analyst'];
    const careerMatch = highAutonomyCareers.some(c => career.title.includes(c)) ? 1 : 0.5;

    const score = avgConfidence * careerMatch * 20;

    return {
      score,
      factor: {
        factor: 'Autonomy & Ownership',
        contribution: score,
        strength: score > 15 ? 'strong' : score > 8 ? 'moderate' : 'weak',
        basedOn: autonomyInsights.map(i => i.insight),
      },
    };
  }

  private calculateCommunicationMatch(career: { title: string; category: string }): {
    score: number;
    factor: MatchFactor;
  } {
    const communicationInsights = this.insights.filter(i =>
      i.insight.toLowerCase().includes('communication') ||
      i.insight.toLowerCase().includes('relationship') ||
      i.insight.toLowerCase().includes('people') ||
      i.insight.toLowerCase().includes('customer')
    );

    if (communicationInsights.length === 0) return { score: 0, factor: this.emptyFactor() };

    const avgConfidence = communicationInsights.reduce((sum, i) => sum + i.confidence, 0) / communicationInsights.length;

    const highCommunicationCareers = ['Customer Success', 'Account Manager', 'Sales', 'Marketing', 'Community'];
    const careerMatch = highCommunicationCareers.some(c => career.title.includes(c)) ? 1 : 0.5;

    const score = avgConfidence * careerMatch * 20;

    return {
      score,
      factor: {
        factor: 'Communication & Relationships',
        contribution: score,
        strength: score > 15 ? 'strong' : score > 8 ? 'moderate' : 'weak',
        basedOn: communicationInsights.map(i => i.insight),
      },
    };
  }

  private calculateCreativeMatch(career: { title: string; category: string }): {
    score: number;
    factor: MatchFactor;
  } {
    const creativeInsights = this.insights.filter(i =>
      i.insight.toLowerCase().includes('creative') ||
      i.insight.toLowerCase().includes('design') ||
      i.insight.toLowerCase().includes('visual') ||
      i.insight.toLowerCase().includes('content')
    );

    if (creativeInsights.length === 0) return { score: 0, factor: this.emptyFactor() };

    const avgConfidence = creativeInsights.reduce((sum, i) => sum + i.confidence, 0) / creativeInsights.length;

    const highCreativeCareers = ['Designer', 'Content', 'Marketing', 'Brand', 'Creative'];
    const careerMatch = highCreativeCareers.some(c => career.title.includes(c)) ? 1 : 0.5;

    const score = avgConfidence * careerMatch * 20;

    return {
      score,
      factor: {
        factor: 'Creative Expression',
        contribution: score,
        strength: score > 15 ? 'strong' : score > 8 ? 'moderate' : 'weak',
        basedOn: creativeInsights.map(i => i.insight),
      },
    };
  }

  private calculateHealthMatch(career: { title: string; category: string }): {
    score: number;
    factor: MatchFactor;
  } {
    const healthInsights = this.insights.filter(i =>
      i.insight.toLowerCase().includes('health') ||
      i.insight.toLowerCase().includes('wellness') ||
      i.insight.toLowerCase().includes('patient') ||
      i.insight.toLowerCase().includes('care')
    );

    if (healthInsights.length === 0) return { score: 0, factor: this.emptyFactor() };

    const avgConfidence = healthInsights.reduce((sum, i) => sum + i.confidence, 0) / healthInsights.length;

    const healthCareers = ['Health', 'Medical', 'Wellness', 'Patient', 'Clinical', 'Healthcare'];
    const careerMatch = healthCareers.some(c => career.title.includes(c)) ? 1.2 : 0.3;

    const score = avgConfidence * careerMatch * 25;

    return {
      score,
      factor: {
        factor: 'Health & Wellness Mission',
        contribution: score,
        strength: score > 18 ? 'strong' : score > 10 ? 'moderate' : 'weak',
        basedOn: healthInsights.map(i => i.insight),
      },
    };
  }

  private calculateAnalyticalMatch(career: { title: string; category: string }): {
    score: number;
    factor: MatchFactor;
  } {
    const analyticalInsights = this.insights.filter(i =>
      i.insight.toLowerCase().includes('analytical') ||
      i.insight.toLowerCase().includes('data') ||
      i.insight.toLowerCase().includes('research') ||
      i.insight.toLowerCase().includes('problem')
    );

    if (analyticalInsights.length === 0) return { score: 0, factor: this.emptyFactor() };

    const avgConfidence = analyticalInsights.reduce((sum, i) => sum + i.confidence, 0) / analyticalInsights.length;

    const analyticalCareers = ['Analyst', 'Data', 'Research', 'Strategy', 'Operations'];
    const careerMatch = analyticalCareers.some(c => career.title.includes(c)) ? 1 : 0.5;

    const score = avgConfidence * careerMatch * 20;

    return {
      score,
      factor: {
        factor: 'Analytical Thinking',
        contribution: score,
        strength: score > 15 ? 'strong' : score > 8 ? 'moderate' : 'weak',
        basedOn: analyticalInsights.map(i => i.insight),
      },
    };
  }

  private calculateLearningMatch(career: { title: string; category: string }): {
    score: number;
    factor: MatchFactor;
  } {
    const learningInsights = this.insights.filter(i =>
      i.insight.toLowerCase().includes('learning') ||
      i.insight.toLowerCase().includes('growth') ||
      i.insight.toLowerCase().includes('development') ||
      i.insight.toLowerCase().includes('curiosity')
    );

    if (learningInsights.length === 0) return { score: 0, factor: this.emptyFactor() };

    const avgConfidence = learningInsights.reduce((sum, i) => sum + i.confidence, 0) / learningInsights.length;

    const score = avgConfidence * 15;

    return {
      score,
      factor: {
        factor: 'Continuous Learning',
        contribution: score,
        strength: score > 12 ? 'strong' : score > 6 ? 'moderate' : 'weak',
        basedOn: learningInsights.map(i => i.insight),
      },
    };
  }

  private calculateFlexibilityMatch(career: { title: string; category: string }): {
    score: number;
    factor: MatchFactor;
  } {
    const flexibilityInsights = this.insights.filter(i =>
      i.insight.toLowerCase().includes('remote') ||
      i.insight.toLowerCase().includes('flexible') ||
      i.insight.toLowerCase().includes('work-life')
    );

    if (flexibilityInsights.length === 0) return { score: 0, factor: this.emptyFactor() };

    const avgConfidence = flexibilityInsights.reduce((sum, i) => sum + i.confidence, 0) / flexibilityInsights.length;

    const score = avgConfidence * 10;

    return {
      score,
      factor: {
        factor: 'Flexibility & Remote Work',
        contribution: score,
        strength: score > 8 ? 'strong' : score > 4 ? 'moderate' : 'weak',
        basedOn: flexibilityInsights.map(i => i.insight),
      },
    };
  }

  private emptyFactor(): MatchFactor {
    return {
      factor: '',
      contribution: 0,
      strength: 'weak',
      basedOn: [],
    };
  }

  private calculateTrend(history: number[]): CareerFitScore['trend'] {
    if (history.length < 2) return 'new';
    if (history.length < 3) return 'stable';

    const recent = history.slice(-3);
    const trend = recent[2] - recent[0];

    if (trend > 5) return 'rising';
    if (trend < -5) return 'falling';
    return 'stable';
  }

  private generateUpdate(career: CareerFitScore, newInsights: DiscoveredInsight[]): LiveCareerUpdate {
    const change = career.change;
    const topFactor = career.matchFactors[0];

    let message = '';
    if (change > 10) {
      message = `Your interest in ${career.careerTitle} just jumped to ${Math.round(career.currentScore)}%! `;
      if (topFactor && newInsights.length > 0) {
        message += `${topFactor.factor} is your strongest match.`;
      }
    } else if (change > 5) {
      message = `${career.careerTitle} fit increased to ${Math.round(career.currentScore)}%. `;
      if (topFactor) {
        message += `Strong alignment with ${topFactor.factor.toLowerCase()}.`;
      }
    } else if (change < -10) {
      message = `${career.careerTitle} fit decreased to ${Math.round(career.currentScore)}%.`;
    } else if (change < -5) {
      message = `${career.careerTitle} dropped slightly to ${Math.round(career.currentScore)}%.`;
    } else {
      message = `${career.careerTitle}: ${Math.round(career.currentScore)}%`;
    }

    return {
      careerTitle: career.careerTitle,
      newScore: career.currentScore,
      oldScore: career.previousScore,
      change,
      message,
      timestamp: new Date(),
      isSignificant: Math.abs(change) >= 8,
    };
  }

  getTopCareers(limit: number = 5): CareerFitScore[] {
    return Array.from(this.careerScores.values())
      .sort((a, b) => b.currentScore - a.currentScore)
      .slice(0, limit);
  }

  getRisingCareers(limit: number = 3): CareerFitScore[] {
    return Array.from(this.careerScores.values())
      .filter(c => c.trend === 'rising')
      .sort((a, b) => b.change - a.change)
      .slice(0, limit);
  }

  getRecentUpdates(): LiveCareerUpdate[] {
    return this.recentUpdates.slice(-5);
  }

  getAllCareers(): { title: string; category: string }[] {
    if (this.userCareers && this.userCareers.length > 0) {
      return this.userCareers.map(career => ({
        title: career.title,
        category: this.mapCategoryToDisplayName(career.category)
      }));
    }

    const defaultCareers = [
      { title: 'Digital Health Product Manager', category: 'Product' },
      { title: 'Healthcare Data Analyst', category: 'Data & Analytics' },
      { title: 'Patient Success Manager', category: 'Healthcare Operations' },
      { title: 'Health Program Coordinator', category: 'Healthcare Operations' },
      { title: 'Wellness Marketing Manager', category: 'Marketing' },
      { title: 'UX Designer - Health Tech', category: 'Design' },
      { title: 'Customer Success Manager', category: 'Customer Success' },
      { title: 'Content Strategist', category: 'Marketing' },
      { title: 'Operations Analyst', category: 'Operations' },
      { title: 'Learning & Development Specialist', category: 'HR & Training' },
      { title: 'Healthcare Consultant', category: 'Consulting' },
      { title: 'Community Health Manager', category: 'Healthcare Operations' },
    ];

    if (this.userProfile) {
      const aiGeneratedCareers = this.generateCareersFromProfile();
      return [...aiGeneratedCareers, ...defaultCareers].slice(0, 12);
    }

    return defaultCareers;
  }

  private mapCategoryToDisplayName(category: string): string {
    const categoryMap: Record<string, string> = {
      'tech': 'Technology',
      'healthcare': 'Healthcare',
      'marketing': 'Marketing',
      'finance': 'Finance',
      'business': 'Business',
      'design': 'Design',
      'education': 'Education',
      'wellness': 'Wellness'
    };
    return categoryMap[category] || category;
  }

  private generateCareersFromProfile(): { title: string; category: string }[] {
    if (!this.userProfile) return [];

    const careers: { title: string; category: string }[] = [];
    const skills = this.userProfile.skills || [];
    const interests = this.userProfile.interests || [];
    const preferredIndustries = this.userProfile.preferredIndustries || [];

    if (skills.some(s => s.toLowerCase().includes('data') || s.toLowerCase().includes('analyt'))) {
      careers.push({ title: 'Data Analyst', category: 'Data & Analytics' });
      careers.push({ title: 'Business Intelligence Analyst', category: 'Data & Analytics' });
    }

    if (skills.some(s => s.toLowerCase().includes('product') || s.toLowerCase().includes('management'))) {
      careers.push({ title: 'Product Manager', category: 'Product' });
      careers.push({ title: 'Technical Product Manager', category: 'Product' });
    }

    if (skills.some(s => s.toLowerCase().includes('design') || s.toLowerCase().includes('ux'))) {
      careers.push({ title: 'UX Designer', category: 'Design' });
      careers.push({ title: 'Product Designer', category: 'Design' });
    }

    if (interests.some(i => i.toLowerCase().includes('market') || i.toLowerCase().includes('brand'))) {
      careers.push({ title: 'Marketing Manager', category: 'Marketing' });
      careers.push({ title: 'Content Strategist', category: 'Marketing' });
    }

    if (preferredIndustries.some(i => i.toLowerCase().includes('health') || i.toLowerCase().includes('medical'))) {
      careers.push({ title: 'Healthcare Product Manager', category: 'Healthcare' });
      careers.push({ title: 'Health Program Coordinator', category: 'Healthcare' });
    }

    if (preferredIndustries.some(i => i.toLowerCase().includes('tech') || i.toLowerCase().includes('software'))) {
      careers.push({ title: 'Software Engineer', category: 'Technology' });
      careers.push({ title: 'Solutions Architect', category: 'Technology' });
    }

    if (interests.some(i => i.toLowerCase().includes('teach') || i.toLowerCase().includes('train'))) {
      careers.push({ title: 'Learning & Development Specialist', category: 'Education' });
      careers.push({ title: 'Corporate Trainer', category: 'Education' });
    }

    if (this.insights.some(ins => ins.insight.toLowerCase().includes('autonomous') || ins.insight.toLowerCase().includes('independent'))) {
      careers.push({ title: 'Consultant', category: 'Consulting' });
      careers.push({ title: 'Freelance Specialist', category: 'Consulting' });
    }

    if (this.insights.some(ins => ins.insight.toLowerCase().includes('people') || ins.insight.toLowerCase().includes('relationship'))) {
      careers.push({ title: 'Customer Success Manager', category: 'Customer Success' });
      careers.push({ title: 'Account Manager', category: 'Sales' });
    }

    return careers.filter((career, index, self) =>
      index === self.findIndex((c) => c.title === career.title)
    );
  }

  getCareerScore(title: string): CareerFitScore | undefined {
    return this.careerScores.get(title);
  }
}
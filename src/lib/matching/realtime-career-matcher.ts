import { DiscoveredInsight } from '../adaptive-questions/adaptive-engine';
import { QuestionResponse } from '../adaptive-questions/adaptive-engine';
import { UserProfile } from '@/types/user-profile';

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
    private userProfile?: UserProfile
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

  updateScores(newInsights: DiscoveredInsight[]): LiveCareerUpdate[] {
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

    const autonomyScore = this.calculateAutonomyMatch(career);
    if (autonomyScore.score > 0) {
      factors.push(autonomyScore.factor);
      totalScore += autonomyScore.score;
    }

    const communicationScore = this.calculateCommunicationMatch(career);
    if (communicationScore.score > 0) {
      factors.push(communicationScore.factor);
      totalScore += communicationScore.score;
    }

    const creativeScore = this.calculateCreativeMatch(career);
    if (creativeScore.score > 0) {
      factors.push(creativeScore.factor);
      totalScore += creativeScore.score;
    }

    const healthScore = this.calculateHealthMatch(career);
    if (healthScore.score > 0) {
      factors.push(healthScore.factor);
      totalScore += healthScore.score;
    }

    const analyticalScore = this.calculateAnalyticalMatch(career);
    if (analyticalScore.score > 0) {
      factors.push(analyticalScore.factor);
      totalScore += analyticalScore.score;
    }

    const learningScore = this.calculateLearningMatch(career);
    if (learningScore.score > 0) {
      factors.push(learningScore.factor);
      totalScore += learningScore.score;
    }

    const flexibilityScore = this.calculateFlexibilityMatch(career);
    if (flexibilityScore.score > 0) {
      factors.push(flexibilityScore.factor);
      totalScore += flexibilityScore.score;
    }

    return {
      score: Math.min(totalScore, 100),
      factors: factors.sort((a, b) => b.contribution - a.contribution),
    };
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
    return [
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
  }

  getCareerScore(title: string): CareerFitScore | undefined {
    return this.careerScores.get(title);
  }
}
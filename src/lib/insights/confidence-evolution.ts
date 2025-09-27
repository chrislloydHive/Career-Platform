import { QuestionResponse } from '../adaptive-questions/adaptive-engine';
import { DiscoveredInsight } from '../adaptive-questions/adaptive-engine';

export interface ConfidenceSnapshot {
  timestamp: Date;
  confidence: number;
  questionCount: number;
  triggeringQuestion?: string;
  reason?: string;
}

export interface InsightEvolution {
  insightId: string;
  insightText: string;
  initialConfidence: number;
  currentConfidence: number;
  confidenceHistory: ConfidenceSnapshot[];
  trend: 'strengthening' | 'weakening' | 'stable' | 'fluctuating';
  trendStrength: number;
  validated: boolean;
  firstDiscoveredAt: Date;
  lastUpdatedAt: Date;
}

export interface ConfidencePattern {
  type: 'strengthening' | 'evolving' | 'validated' | 'changing';
  pattern: string;
  insights: string[];
  confidence: number;
  evidence: string[];
  implication: string;
}

export interface EvolutionSummary {
  totalInsights: number;
  strengtheningPatterns: number;
  evolvingPreferences: number;
  validatedHunches: number;
  changingPriorities: number;
  overallStability: number;
  selfDiscoveryProgress: number;
}

export class ConfidenceEvolutionEngine {
  private evolutions: Map<string, InsightEvolution> = new Map();
  private patterns: ConfidencePattern[] = [];

  constructor(
    private responses: Record<string, QuestionResponse>,
    private insights: DiscoveredInsight[]
  ) {
    this.buildEvolutionHistory();
    this.detectConfidencePatterns();
  }

  private buildEvolutionHistory() {
    const insightsByText = new Map<string, DiscoveredInsight[]>();

    for (const insight of this.insights) {
      const existing = insightsByText.get(insight.insight) || [];
      existing.push(insight);
      insightsByText.set(insight.insight, existing);
    }

    for (const [insightText, insightVersions] of insightsByText.entries()) {
      insightVersions.sort((a, b) => {
        const aCount = a.basedOn.length;
        const bCount = b.basedOn.length;
        return aCount - bCount;
      });

      const initial = insightVersions[0];
      const current = insightVersions[insightVersions.length - 1];

      const confidenceHistory: ConfidenceSnapshot[] = insightVersions.map((version, index) => ({
        timestamp: new Date(Date.now() - (insightVersions.length - index) * 60000),
        confidence: version.confidence,
        questionCount: version.basedOn.length,
        reason: this.inferConfidenceChangeReason(version, insightVersions[index - 1])
      }));

      const trend = this.calculateTrend(confidenceHistory);
      const trendStrength = this.calculateTrendStrength(confidenceHistory);

      const evolution: InsightEvolution = {
        insightId: this.generateInsightId(insightText),
        insightText,
        initialConfidence: initial.confidence,
        currentConfidence: current.confidence,
        confidenceHistory,
        trend,
        trendStrength,
        validated: current.confidence >= 0.8 && trend === 'strengthening',
        firstDiscoveredAt: confidenceHistory[0].timestamp,
        lastUpdatedAt: confidenceHistory[confidenceHistory.length - 1].timestamp,
      };

      this.evolutions.set(evolution.insightId, evolution);
    }
  }

  private generateInsightId(insightText: string): string {
    return insightText.substring(0, 30).replace(/\s+/g, '-').toLowerCase();
  }

  private inferConfidenceChangeReason(
    current: DiscoveredInsight,
    previous?: DiscoveredInsight
  ): string {
    if (!previous) {
      return 'Initial discovery';
    }

    const confidenceDelta = current.confidence - previous.confidence;

    if (confidenceDelta > 0.1) {
      return 'Confidence increased: consistent pattern across responses';
    } else if (confidenceDelta < -0.1) {
      return 'Confidence decreased: contradictory evidence found';
    } else if (current.basedOn.length > previous.basedOn.length) {
      return 'More supporting evidence gathered';
    } else {
      return 'Confidence stable';
    }
  }

  private calculateTrend(history: ConfidenceSnapshot[]): InsightEvolution['trend'] {
    if (history.length < 2) return 'stable';

    const confidences = history.map(h => h.confidence);
    const changes = [];

    for (let i = 1; i < confidences.length; i++) {
      changes.push(confidences[i] - confidences[i - 1]);
    }

    const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
    const variance = changes.reduce((sum, c) => sum + Math.pow(c - avgChange, 2), 0) / changes.length;

    if (variance > 0.01) {
      return 'fluctuating';
    } else if (avgChange > 0.05) {
      return 'strengthening';
    } else if (avgChange < -0.05) {
      return 'weakening';
    } else {
      return 'stable';
    }
  }

  private calculateTrendStrength(history: ConfidenceSnapshot[]): number {
    if (history.length < 2) return 0;

    const first = history[0].confidence;
    const last = history[history.length - 1].confidence;

    return Math.abs(last - first);
  }

  private detectConfidencePatterns() {
    const strengthening = this.detectStrengtheningPatterns();
    const evolving = this.detectEvolvingPreferences();
    const validated = this.detectValidatedHunches();
    const changing = this.detectChangingPriorities();

    this.patterns = [
      ...strengthening,
      ...evolving,
      ...validated,
      ...changing,
    ];
  }

  private detectStrengtheningPatterns(): ConfidencePattern[] {
    const patterns: ConfidencePattern[] = [];

    const strengtheningEvolutions = Array.from(this.evolutions.values())
      .filter(e => e.trend === 'strengthening' && e.trendStrength >= 0.15);

    if (strengtheningEvolutions.length === 0) return patterns;

    const byArea = new Map<string, InsightEvolution[]>();
    for (const evolution of strengtheningEvolutions) {
      const insight = this.insights.find(i => i.insight === evolution.insightText);
      if (!insight) continue;

      const area = insight.area;
      const existing = byArea.get(area) || [];
      existing.push(evolution);
      byArea.set(area, existing);
    }

    for (const [area, evolutions] of byArea.entries()) {
      if (evolutions.length >= 2) {
        patterns.push({
          type: 'strengthening',
          pattern: `Strong consistency in ${area.replace('-', ' ')}`,
          insights: evolutions.map(e => e.insightText),
          confidence: 0.9,
          evidence: [
            `${evolutions.length} insights showing strengthening confidence`,
            `Average confidence increase: ${Math.round(evolutions.reduce((sum, e) => sum + e.trendStrength, 0) / evolutions.length * 100)}%`,
            'Consistent pattern across multiple questions',
          ],
          implication: `You're gaining clarity about your ${area.replace('-', ' ')} preferences through consistent self-reflection.`,
        });
      }
    }

    return patterns;
  }

  private detectEvolvingPreferences(): ConfidencePattern[] {
    const patterns: ConfidencePattern[] = [];

    const fluctuatingEvolutions = Array.from(this.evolutions.values())
      .filter(e => e.trend === 'fluctuating' && e.confidenceHistory.length >= 3);

    if (fluctuatingEvolutions.length === 0) return patterns;

    for (const evolution of fluctuatingEvolutions) {
      const recentConfidence = evolution.confidenceHistory.slice(-2);
      const isStabilizing = Math.abs(recentConfidence[1].confidence - recentConfidence[0].confidence) < 0.05;

      if (isStabilizing && evolution.currentConfidence >= 0.6) {
        patterns.push({
          type: 'evolving',
          pattern: `Evolving understanding`,
          insights: [evolution.insightText],
          confidence: evolution.currentConfidence,
          evidence: [
            'Initial uncertainty followed by stabilization',
            `Confidence history: ${evolution.confidenceHistory.map(h => Math.round(h.confidence * 100) + '%').join(' → ')}`,
            'Your perspective refined through exploration',
          ],
          implication: 'This preference is becoming clearer as you explore different aspects of your career interests.',
        });
      }
    }

    return patterns;
  }

  private detectValidatedHunches(): ConfidencePattern[] {
    const patterns: ConfidencePattern[] = [];

    const validatedEvolutions = Array.from(this.evolutions.values())
      .filter(e => e.validated && e.initialConfidence < 0.6 && e.currentConfidence >= 0.8);

    if (validatedEvolutions.length === 0) return patterns;

    for (const evolution of validatedEvolutions) {
      patterns.push({
        type: 'validated',
        pattern: `Validated hunch`,
        insights: [evolution.insightText],
        confidence: evolution.currentConfidence,
        evidence: [
          `Started at ${Math.round(evolution.initialConfidence * 100)}% confidence`,
          `Now at ${Math.round(evolution.currentConfidence * 100)}% confidence`,
          'Multiple responses confirmed initial intuition',
        ],
        implication: 'Your initial instinct was correct and has been validated through multiple questions.',
      });
    }

    return patterns;
  }

  private detectChangingPriorities(): ConfidencePattern[] {
    const patterns: ConfidencePattern[] = [];

    const weakeningEvolutions = Array.from(this.evolutions.values())
      .filter(e => e.trend === 'weakening' && e.trendStrength >= 0.2);

    if (weakeningEvolutions.length === 0) return patterns;

    for (const evolution of weakeningEvolutions) {
      patterns.push({
        type: 'changing',
        pattern: `Shifting priority`,
        insights: [evolution.insightText],
        confidence: 0.85,
        evidence: [
          `Confidence decreased from ${Math.round(evolution.initialConfidence * 100)}% to ${Math.round(evolution.currentConfidence * 100)}%`,
          'More recent responses suggest different preferences',
          'Your priorities are evolving',
        ],
        implication: 'This preference may have seemed important initially but other factors are taking priority as you learn more about yourself.',
      });
    }

    return patterns;
  }

  getEvolutionSummary(): EvolutionSummary {
    const allEvolutions = Array.from(this.evolutions.values());

    const strengtheningCount = allEvolutions.filter(e => e.trend === 'strengthening').length;
    const fluctuatingCount = allEvolutions.filter(e => e.trend === 'fluctuating').length;
    const validatedCount = allEvolutions.filter(e => e.validated).length;
    const weakeningCount = allEvolutions.filter(e => e.trend === 'weakening').length;

    const avgTrendStrength = allEvolutions.length > 0
      ? allEvolutions.reduce((sum, e) => sum + e.trendStrength, 0) / allEvolutions.length
      : 0;

    const overallStability = 1 - Math.min(avgTrendStrength * 2, 1);

    const avgConfidence = allEvolutions.length > 0
      ? allEvolutions.reduce((sum, e) => sum + e.currentConfidence, 0) / allEvolutions.length
      : 0;

    const selfDiscoveryProgress = Math.min(
      (Object.keys(this.responses).length / 20) * 0.4 +
      avgConfidence * 0.3 +
      (validatedCount / Math.max(allEvolutions.length, 1)) * 0.3,
      1
    );

    return {
      totalInsights: allEvolutions.length,
      strengtheningPatterns: strengtheningCount,
      evolvingPreferences: fluctuatingCount,
      validatedHunches: validatedCount,
      changingPriorities: weakeningCount,
      overallStability,
      selfDiscoveryProgress,
    };
  }

  getEvolutions(): InsightEvolution[] {
    return Array.from(this.evolutions.values())
      .sort((a, b) => b.trendStrength - a.trendStrength);
  }

  getPatterns(): ConfidencePattern[] {
    return this.patterns.sort((a, b) => b.confidence - a.confidence);
  }

  getEvolutionById(id: string): InsightEvolution | undefined {
    return this.evolutions.get(id);
  }

  getEvolutionsByTrend(trend: InsightEvolution['trend']): InsightEvolution[] {
    return Array.from(this.evolutions.values())
      .filter(e => e.trend === trend)
      .sort((a, b) => b.trendStrength - a.trendStrength);
  }

  updateConfidence(insightText: string, newConfidence: number, reason?: string) {
    const evolution = Array.from(this.evolutions.values())
      .find(e => e.insightText === insightText);

    if (!evolution) return;

    const snapshot: ConfidenceSnapshot = {
      timestamp: new Date(),
      confidence: newConfidence,
      questionCount: Object.keys(this.responses).length,
      reason: reason || 'Confidence updated',
    };

    evolution.confidenceHistory.push(snapshot);
    evolution.currentConfidence = newConfidence;
    evolution.lastUpdatedAt = snapshot.timestamp;
    evolution.trend = this.calculateTrend(evolution.confidenceHistory);
    evolution.trendStrength = this.calculateTrendStrength(evolution.confidenceHistory);
    evolution.validated = newConfidence >= 0.8 && evolution.trend === 'strengthening';

    this.detectConfidencePatterns();
  }
}
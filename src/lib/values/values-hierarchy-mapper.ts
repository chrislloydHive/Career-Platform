import { QuestionResponse } from '../adaptive-questions/adaptive-engine';
import { DiscoveredInsight } from '../adaptive-questions/adaptive-engine';
import { AdaptiveQuestion } from '../adaptive-questions/question-banks';

export interface ValueDimension {
  value: string;
  priority: number;
  confidence: number;
  evidence: string[];
  tradeOffWins: number;
  tradeOffLosses: number;
}

export interface ValueTradeOff {
  scenario: string;
  optionA: {
    value: string;
    description: string;
  };
  optionB: {
    value: string;
    description: string;
  };
  chosenOption?: 'A' | 'B';
  difficulty: 'easy' | 'moderate' | 'hard';
  implication: string;
}

export interface ValueConflict {
  value1: string;
  value2: string;
  conflictType: 'inherent' | 'situational' | 'developmental';
  description: string;
  resolution: string;
  resolutionConfidence: number;
}

export interface ValuesHierarchy {
  coreTier: ValueDimension[];
  importantTier: ValueDimension[];
  flexibleTier: ValueDimension[];
  tradeOffs: ValueTradeOff[];
  conflicts: ValueConflict[];
  systemSummary: string;
}

export class ValuesHierarchyMapper {
  private valueDimensions: Map<string, ValueDimension> = new Map();
  private tradeOffs: ValueTradeOff[] = [];
  private resolvedTradeOffs: Map<string, 'A' | 'B'> = new Map();

  constructor(
    private responses: Record<string, QuestionResponse>,
    private insights: DiscoveredInsight[]
  ) {
    this.identifyValueDimensions();
    this.generateTradeOffScenarios();
  }

  private identifyValueDimensions() {
    const commonValues = [
      'autonomy',
      'collaboration',
      'impact',
      'growth',
      'stability',
      'flexibility',
      'compensation',
      'recognition',
      'creativity',
      'structure',
      'work-life-balance',
      'mission',
    ];

    for (const value of commonValues) {
      const dimension = this.analyzeValue(value);
      if (dimension.confidence > 0.3) {
        this.valueDimensions.set(value, dimension);
      }
    }

    this.rankByPriority();
  }

  private analyzeValue(value: string): ValueDimension {
    const relevantInsights = this.insights.filter(i =>
      i.insight.toLowerCase().includes(value.toLowerCase()) ||
      this.isRelatedToValue(i.insight, value)
    );

    const relevantResponses = Object.values(this.responses).filter(r =>
      this.responseRelatedToValue(r, value)
    );

    const confidence = relevantInsights.length > 0 || relevantResponses.length > 0
      ? Math.min((relevantInsights.length * 0.2 + relevantResponses.length * 0.15), 1)
      : 0;

    const evidence = [
      ...relevantInsights.map(i => i.insight),
      ...relevantResponses.map(r => `Response: ${r.questionId}`),
    ];

    return {
      value,
      priority: 5,
      confidence,
      evidence,
      tradeOffWins: 0,
      tradeOffLosses: 0,
    };
  }

  private isRelatedToValue(insight: string, value: string): boolean {
    const relations: Record<string, string[]> = {
      autonomy: ['independent', 'ownership', 'self-directed'],
      collaboration: ['team', 'together', 'partnership'],
      impact: ['meaningful', 'difference', 'mission', 'purpose'],
      growth: ['learning', 'development', 'skill', 'advancement'],
      stability: ['secure', 'predictable', 'established'],
      flexibility: ['remote', 'adaptable', 'balance'],
      compensation: ['salary', 'pay', 'financial'],
      recognition: ['appreciated', 'acknowledged', 'valued'],
      creativity: ['creative', 'innovative', 'design'],
      structure: ['organized', 'process', 'clarity'],
      'work-life-balance': ['balance', 'personal', 'family'],
      mission: ['health', 'wellness', 'purpose', 'meaningful'],
    };

    const keywords = relations[value] || [];
    return keywords.some(kw => insight.toLowerCase().includes(kw));
  }

  private responseRelatedToValue(response: QuestionResponse, value: string): boolean {
    const responseStr = String(response.response).toLowerCase();
    const questionId = response.questionId.toLowerCase();

    return responseStr.includes(value) || questionId.includes(value);
  }

  private rankByPriority() {
    const dimensions = Array.from(this.valueDimensions.values());

    dimensions.sort((a, b) => {
      const scoreA = a.confidence * 0.7 + (a.tradeOffWins / Math.max(a.tradeOffWins + a.tradeOffLosses, 1)) * 0.3;
      const scoreB = b.confidence * 0.7 + (b.tradeOffWins / Math.max(b.tradeOffWins + b.tradeOffLosses, 1)) * 0.3;
      return scoreB - scoreA;
    });

    dimensions.forEach((dim, index) => {
      dim.priority = dimensions.length - index;
    });
  }

  private generateTradeOffScenarios() {
    const highConfidenceValues = Array.from(this.valueDimensions.values())
      .filter(v => v.confidence > 0.5)
      .sort((a, b) => b.confidence - a.confidence);

    if (highConfidenceValues.length >= 2) {
      this.tradeOffs.push(
        this.createTradeOff(
          highConfidenceValues[0].value,
          highConfidenceValues[1].value,
          'moderate'
        )
      );
    }

    const commonPairs = [
      { a: 'autonomy', b: 'collaboration' },
      { a: 'compensation', b: 'mission' },
      { a: 'growth', b: 'stability' },
      { a: 'flexibility', b: 'structure' },
      { a: 'impact', b: 'work-life-balance' },
      { a: 'creativity', b: 'stability' },
    ];

    for (const pair of commonPairs) {
      const valueA = this.valueDimensions.get(pair.a);
      const valueB = this.valueDimensions.get(pair.b);

      if (valueA && valueB && valueA.confidence > 0.4 && valueB.confidence > 0.4) {
        this.tradeOffs.push(this.createTradeOff(pair.a, pair.b, 'hard'));
      }
    }
  }

  private createTradeOff(valueA: string, valueB: string, difficulty: ValueTradeOff['difficulty']): ValueTradeOff {
    const scenarios: Record<string, Record<string, { description: string; implication: string }>> = {
      autonomy: {
        collaboration: {
          description: 'A role where you own projects end-to-end with minimal input from others',
          implication: 'Choosing autonomy suggests you prioritize independent work over team synergy',
        },
      },
      collaboration: {
        autonomy: {
          description: 'A role with deep team collaboration but less individual ownership',
          implication: 'Choosing collaboration suggests you value team dynamics over solo control',
        },
      },
      compensation: {
        mission: {
          description: 'A higher-paying role at a company whose mission you find less meaningful',
          implication: 'Choosing compensation suggests financial security takes precedence over purpose',
        },
      },
      mission: {
        compensation: {
          description: 'A mission-driven role with meaningful impact but lower compensation',
          implication: 'Choosing mission suggests purpose and impact matter more than maximizing earnings',
        },
      },
      growth: {
        stability: {
          description: 'A fast-growth role with rapid learning but uncertain trajectory',
          implication: 'Choosing growth suggests you prioritize development over predictability',
        },
      },
      stability: {
        growth: {
          description: 'A stable, established role with clear progression but slower learning',
          implication: 'Choosing stability suggests you value security over rapid skill acquisition',
        },
      },
      flexibility: {
        structure: {
          description: 'Maximum flexibility and autonomy but ambiguous expectations',
          implication: 'Choosing flexibility suggests you thrive with independence despite uncertainty',
        },
      },
      structure: {
        flexibility: {
          description: 'Clear processes and structure but less adaptability',
          implication: 'Choosing structure suggests you prefer clarity and organization over flexibility',
        },
      },
      impact: {
        'work-life-balance': {
          description: 'High-impact role with significant influence but demanding hours',
          implication: 'Choosing impact suggests you prioritize making a difference over personal time',
        },
      },
      'work-life-balance': {
        impact: {
          description: 'Sustainable work-life balance but limited scope of impact',
          implication: 'Choosing balance suggests personal wellbeing is your top priority',
        },
      },
    };

    const optionAData = scenarios[valueA]?.[valueB] || {
      description: `Prioritize ${valueA}`,
      implication: `${valueA} is more important to you`,
    };

    const optionBData = scenarios[valueB]?.[valueA] || {
      description: `Prioritize ${valueB}`,
      implication: `${valueB} is more important to you`,
    };

    return {
      scenario: `If you had to choose between ${valueA} and ${valueB}, which would you pick?`,
      optionA: {
        value: valueA,
        description: optionAData.description,
      },
      optionB: {
        value: valueB,
        description: optionBData.description,
      },
      difficulty,
      implication: 'Your choice reveals your value priorities',
    };
  }

  recordTradeOffChoice(tradeOffIndex: number, choice: 'A' | 'B') {
    const tradeOff = this.tradeOffs[tradeOffIndex];
    if (!tradeOff) return;

    tradeOff.chosenOption = choice;

    const chosenValue = choice === 'A' ? tradeOff.optionA.value : tradeOff.optionB.value;
    const rejectedValue = choice === 'A' ? tradeOff.optionB.value : tradeOff.optionA.value;

    const chosen = this.valueDimensions.get(chosenValue);
    const rejected = this.valueDimensions.get(rejectedValue);

    if (chosen) {
      chosen.tradeOffWins++;
    }
    if (rejected) {
      rejected.tradeOffLosses++;
    }

    this.resolvedTradeOffs.set(`${tradeOff.optionA.value}-${tradeOff.optionB.value}`, choice);

    this.rankByPriority();
  }

  buildHierarchy(): ValuesHierarchy {
    this.rankByPriority();

    const sortedValues = Array.from(this.valueDimensions.values())
      .sort((a, b) => b.priority - a.priority);

    const coreTier = sortedValues.slice(0, 3).filter(v => v.confidence > 0.6);
    const importantTier = sortedValues.slice(3, 7).filter(v => v.confidence > 0.4);
    const flexibleTier = sortedValues.slice(7).filter(v => v.confidence > 0.3);

    const conflicts = this.detectValueConflicts(sortedValues);

    return {
      coreTier,
      importantTier,
      flexibleTier,
      tradeOffs: this.tradeOffs,
      conflicts,
      systemSummary: this.generateSystemSummary(coreTier, conflicts),
    };
  }

  private detectValueConflicts(values: ValueDimension[]): ValueConflict[] {
    const conflicts: ValueConflict[] = [];

    const conflictPairs: Array<{
      v1: string;
      v2: string;
      type: ValueConflict['conflictType'];
      description: string;
    }> = [
      {
        v1: 'autonomy',
        v2: 'collaboration',
        type: 'inherent',
        description: 'Tension between independent work and team collaboration',
      },
      {
        v1: 'growth',
        v2: 'stability',
        type: 'inherent',
        description: 'Fast growth often requires accepting instability',
      },
      {
        v1: 'flexibility',
        v2: 'structure',
        type: 'inherent',
        description: 'Maximum flexibility conflicts with clear structure',
      },
      {
        v1: 'impact',
        v2: 'work-life-balance',
        type: 'situational',
        description: 'High impact roles often demand more time',
      },
      {
        v1: 'compensation',
        v2: 'mission',
        type: 'situational',
        description: 'Mission-driven roles may offer lower compensation',
      },
    ];

    for (const pair of conflictPairs) {
      const v1 = values.find(v => v.value === pair.v1);
      const v2 = values.find(v => v.value === pair.v2);

      if (v1 && v2 && v1.confidence > 0.5 && v2.confidence > 0.5) {
        const tradeOffKey = `${pair.v1}-${pair.v2}`;
        const reverseKey = `${pair.v2}-${pair.v1}`;
        const resolution = this.resolvedTradeOffs.get(tradeOffKey) || this.resolvedTradeOffs.get(reverseKey);

        let resolutionText = 'Unresolved - explore this tension further';
        let resolutionConfidence = 0.3;

        if (resolution) {
          const winner = resolution === 'A' ? pair.v1 : pair.v2;
          resolutionText = `You prioritize ${winner} when these values conflict`;
          resolutionConfidence = 0.8;
        }

        conflicts.push({
          value1: pair.v1,
          value2: pair.v2,
          conflictType: pair.type,
          description: pair.description,
          resolution: resolutionText,
          resolutionConfidence,
        });
      }
    }

    return conflicts;
  }

  private generateSystemSummary(coreTier: ValueDimension[], conflicts: ValueConflict[]): string {
    if (coreTier.length === 0) {
      return 'Value system still emerging - answer more questions to clarify priorities';
    }

    const topValues = coreTier.slice(0, 3).map(v => v.value);

    let summary = `Your core values are ${topValues.slice(0, -1).join(', ')}`;
    if (topValues.length > 1) {
      summary += ` and ${topValues[topValues.length - 1]}`;
    }
    summary += '. ';

    if (conflicts.length > 0) {
      const resolvedConflicts = conflicts.filter(c => c.resolutionConfidence > 0.7);
      if (resolvedConflicts.length > 0) {
        summary += `When values conflict, you consistently prioritize ${resolvedConflicts[0].value1} over ${resolvedConflicts[0].value2}. `;
      } else {
        summary += `You're navigating tension between ${conflicts[0].value1} and ${conflicts[0].value2}. `;
      }
    }

    return summary;
  }

  getTradeOffQuestions(): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    for (let i = 0; i < Math.min(this.tradeOffs.length, 5); i++) {
      const tradeOff = this.tradeOffs[i];
      if (tradeOff.chosenOption) continue;

      questions.push({
        id: `value-tradeoff-${i}`,
        area: 'values',
        type: 'scenario',
        text: tradeOff.scenario,
        options: [
          {
            value: 'A',
            label: `${tradeOff.optionA.value}: ${tradeOff.optionA.description}`,
            insight: tradeOff.implication,
          },
          {
            value: 'B',
            label: `${tradeOff.optionB.value}: ${tradeOff.optionB.description}`,
            insight: tradeOff.implication,
          },
        ],
      });
    }

    return questions;
  }
}
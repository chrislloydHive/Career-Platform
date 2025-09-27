import { QuestionResponse } from '../adaptive-questions/adaptive-engine';
import { DiscoveredInsight } from '../adaptive-questions/adaptive-engine';
import { AdaptiveQuestion } from '../adaptive-questions/question-banks';
import { UserProfile } from '@/types/user-profile';

export interface AuthenticitySignal {
  type: 'authentic' | 'adapted' | 'ambiguous';
  indicator: string;
  evidence: string;
  confidence: number;
}

export interface SelfPerceptionGap {
  stated: string;
  actual: string;
  gapSize: 'large' | 'moderate' | 'small';
  evidence: string[];
  possibleReasons: string[];
}

export interface AuthenticPreference {
  preference: string;
  authenticityScore: number;
  shouldWantSignals: string[];
  actuallyWantSignals: string[];
  recommendation: string;
}

export interface AuthenticityProfile {
  overallAuthenticity: number;
  authenticPreferences: AuthenticPreference[];
  perceptionGaps: SelfPerceptionGap[];
  probingQuestions: AdaptiveQuestion[];
  insights: string[];
}

export class AuthenticSelfDetector {
  private signals: AuthenticitySignal[] = [];

  constructor(
    private responses: Record<string, QuestionResponse>,
    private insights: DiscoveredInsight[],
    private userProfile?: UserProfile
  ) {
    this.detectAuthenticitySignals();
  }

  private detectAuthenticitySignals() {
    for (const [questionId, response] of Object.entries(this.responses)) {
      const signals = this.analyzeResponse(questionId, response);
      this.signals.push(...signals);
    }
  }

  private analyzeResponse(questionId: string, response: QuestionResponse): AuthenticitySignal[] {
    const signals: AuthenticitySignal[] = [];

    if (response.confidenceLevel === 'uncertain') {
      signals.push({
        type: 'ambiguous',
        indicator: 'Low confidence response',
        evidence: `Marked as uncertain for ${questionId}`,
        confidence: 0.6,
      });
    }

    const responseStr = String(response.response).toLowerCase();

    const shouldWantKeywords = [
      'should', 'supposed to', 'expected', 'right thing',
      'professional', 'career-wise', 'smart move', 'makes sense',
    ];

    const actuallyWantKeywords = [
      'excited', 'energized', 'love', 'enjoy', 'fun',
      'passionate', 'drawn to', 'naturally', 'feel alive',
    ];

    const hasShould = shouldWantKeywords.some(kw => responseStr.includes(kw));
    const hasActual = actuallyWantKeywords.some(kw => responseStr.includes(kw));

    if (hasShould && !hasActual) {
      signals.push({
        type: 'adapted',
        indicator: 'Should-based language',
        evidence: `Response contains obligation language without genuine excitement`,
        confidence: 0.7,
      });
    }

    if (hasActual && !hasShould) {
      signals.push({
        type: 'authentic',
        indicator: 'Emotion-based language',
        evidence: `Response expresses genuine excitement and natural preference`,
        confidence: 0.8,
      });
    }

    if (questionId.includes('value') || questionId.includes('priority')) {
      const sociallyDesirable = this.checkSocialDesirability(responseStr);
      if (sociallyDesirable) {
        signals.push({
          type: 'adapted',
          indicator: 'Socially desirable response',
          evidence: `Response aligns with common social expectations`,
          confidence: 0.5,
        });
      }
    }

    return signals;
  }

  private checkSocialDesirability(response: string): boolean {
    const sociallyDesirable = [
      'work-life balance',
      'making a difference',
      'helping others',
      'continuous learning',
      'professional development',
    ];

    return sociallyDesirable.some(phrase => response.includes(phrase));
  }

  detectPerceptionGaps(): SelfPerceptionGap[] {
    const gaps: SelfPerceptionGap[] = [];

    gaps.push(...this.detectCareerStageGaps());
    gaps.push(...this.detectValueGaps());
    gaps.push(...this.detectWorkStyleGaps());

    return gaps;
  }

  private detectCareerStageGaps(): SelfPerceptionGap[] {
    const gaps: SelfPerceptionGap[] = [];

    if (!this.userProfile) return gaps;

    const yearsExp = new Date().getFullYear() - (this.userProfile.education[0]?.graduationYear || 2022);
    const numIndustries = new Set(this.userProfile.experience.map(e =>
      this.categorizeIndustry(e.company, e.title)
    )).size;

    const explorationInsights = this.insights.filter(i =>
      i.insight.toLowerCase().includes('explor') ||
      i.insight.toLowerCase().includes('learning') ||
      i.insight.toLowerCase().includes('try')
    );

    const specializationInsights = this.insights.filter(i =>
      i.insight.toLowerCase().includes('expert') ||
      i.insight.toLowerCase().includes('master') ||
      i.insight.toLowerCase().includes('deep')
    );

    if (yearsExp <= 3 && numIndustries >= 3 && specializationInsights.length > explorationInsights.length) {
      gaps.push({
        stated: 'Ready to specialize and go deep in one area',
        actual: 'Still in active exploration mode across multiple fields',
        gapSize: 'moderate',
        evidence: [
          `${numIndustries} different industries explored in ${yearsExp} years`,
          'Career behavior suggests continued exploration',
          'Stated preference for specialization',
        ],
        possibleReasons: [
          'Feeling pressure to "pick a lane" based on career stage expectations',
          'Concern that continued exploration looks unfocused',
          'Not yet discovered the field worth specializing in',
        ],
      });
    }

    if (explorationInsights.length > 5 && yearsExp > 2) {
      const growthInsights = this.insights.filter(i =>
        i.insight.toLowerCase().includes('growth') ||
        i.insight.toLowerCase().includes('advance')
      );

      if (growthInsights.length > explorationInsights.length) {
        gaps.push({
          stated: 'Want rapid career advancement and clear progression',
          actual: 'Driven by curiosity and learning new domains',
          gapSize: 'large',
          evidence: [
            `${explorationInsights.length} insights about exploration`,
            'Pattern of switching contexts to learn',
            'Stated desire for advancement',
          ],
          possibleReasons: [
            'Genuine love of learning misidentified as lack of focus',
            'Pressure to show "upward trajectory" in early career',
            'Building T-shaped expertise but calling it career indecision',
          ],
        });
      }
    }

    return gaps;
  }

  private detectValueGaps(): SelfPerceptionGap[] {
    const gaps: SelfPerceptionGap[] = [];

    const impactInsights = this.insights.filter(i =>
      i.insight.toLowerCase().includes('impact') ||
      i.insight.toLowerCase().includes('difference')
    );

    const autonomyInsights = this.insights.filter(i =>
      i.insight.toLowerCase().includes('autonom') ||
      i.insight.toLowerCase().includes('independent')
    );

    if (impactInsights.length > 0 && autonomyInsights.length > impactInsights.length * 2) {
      gaps.push({
        stated: 'Motivated by making a meaningful impact',
        actual: 'Driven by autonomy and ownership of work',
        gapSize: 'moderate',
        evidence: [
          'Stronger pattern of seeking independence',
          'Impact mentioned but not primary driver',
          'Autonomy appears in more responses',
        ],
        possibleReasons: [
          'Impact sounds more noble than autonomy',
          'Autonomy enables impact but is the true motivator',
          'Social expectation to prioritize purpose over control',
        ],
      });
    }

    const balanceResponses = Object.values(this.responses).filter(r =>
      String(r.response).toLowerCase().includes('balance')
    );

    const intensityResponses = Object.values(this.responses).filter(r =>
      String(r.response).toLowerCase().includes('deep') ||
      String(r.response).toLowerCase().includes('immerse')
    );

    if (balanceResponses.length > 0 && intensityResponses.length > balanceResponses.length) {
      gaps.push({
        stated: 'Values work-life balance',
        actual: 'Gets energized by deep immersion in interesting work',
        gapSize: 'large',
        evidence: [
          'Mentions balance as ideal',
          'Shows excitement about intensive projects',
          'Energy from deep work contradicts balance claim',
        ],
        possibleReasons: [
          'Balance is expected answer, especially in early career',
          'True preference is sustainable intensity, not equal balance',
          'Hasn\'t experienced the right work to know what balance means',
        ],
      });
    }

    return gaps;
  }

  private detectWorkStyleGaps(): SelfPerceptionGap[] {
    const gaps: SelfPerceptionGap[] = [];

    const collaborationInsights = this.insights.filter(i =>
      i.insight.toLowerCase().includes('collaborat') ||
      i.insight.toLowerCase().includes('team')
    );

    const independentInsights = this.insights.filter(i =>
      i.insight.toLowerCase().includes('independ') ||
      i.insight.toLowerCase().includes('autonom')
    );

    if (collaborationInsights.length > 0 && independentInsights.length > collaborationInsights.length) {
      gaps.push({
        stated: 'Prefers collaborative, team-based work',
        actual: 'Wants collaboration for planning, autonomy for execution',
        gapSize: 'moderate',
        evidence: [
          'Strong independence signals in actual preferences',
          'Collaboration mentioned but less emphasized',
          'Pattern suggests selective collaboration',
        ],
        possibleReasons: [
          '"Team player" is safe, expected answer',
          'Nuanced preference: collaborative planning, autonomous execution',
          'Concern that preference for solo work appears antisocial',
        ],
      });
    }

    return gaps;
  }

  buildAuthenticityProfile(): AuthenticityProfile {
    const authenticPreferences = this.analyzePreferenceAuthenticity();
    const perceptionGaps = this.detectPerceptionGaps();
    const probingQuestions = this.generateProbingQuestions(perceptionGaps);
    const insights = this.generateAuthenticityInsights(authenticPreferences, perceptionGaps);

    const authenticCount = this.signals.filter(s => s.type === 'authentic').length;
    const adaptedCount = this.signals.filter(s => s.type === 'adapted').length;
    const totalSignals = authenticCount + adaptedCount;

    const overallAuthenticity = totalSignals > 0
      ? authenticCount / totalSignals
      : 0.7;

    return {
      overallAuthenticity,
      authenticPreferences,
      perceptionGaps,
      probingQuestions,
      insights,
    };
  }

  private analyzePreferenceAuthenticity(): AuthenticPreference[] {
    const preferences: AuthenticPreference[] = [];

    for (const insight of this.insights) {
      const shouldSignals = this.signals.filter(s =>
        s.type === 'adapted' && s.evidence.toLowerCase().includes(insight.insight.toLowerCase())
      );

      const actualSignals = this.signals.filter(s =>
        s.type === 'authentic' && s.evidence.toLowerCase().includes(insight.insight.toLowerCase())
      );

      const authenticityScore = actualSignals.length > shouldSignals.length
        ? 0.8
        : shouldSignals.length > actualSignals.length
        ? 0.4
        : 0.6;

      if (shouldSignals.length > 0 || actualSignals.length > 0) {
        preferences.push({
          preference: insight.insight,
          authenticityScore,
          shouldWantSignals: shouldSignals.map(s => s.indicator),
          actuallyWantSignals: actualSignals.map(s => s.indicator),
          recommendation: this.generateRecommendation(authenticityScore, insight.insight),
        });
      }
    }

    return preferences.sort((a, b) => a.authenticityScore - b.authenticityScore);
  }

  private generateRecommendation(score: number, preference: string): string {
    if (score < 0.5) {
      return `Explore whether this is genuinely important to you or an "expected" preference`;
    } else if (score < 0.7) {
      return `This seems somewhat authentic but could benefit from deeper exploration`;
    } else {
      return `This appears to be a genuine preference - trust this signal`;
    }
  }

  private generateProbingQuestions(gaps: SelfPerceptionGap[]): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    for (const gap of gaps) {
      if (gap.stated.includes('specialize')) {
        questions.push({
          id: 'auth-explore-specialize',
          area: 'values',
          type: 'scenario',
          text: 'You have two job offers with equal pay. Which excites you more?',
          options: [
            {
              value: 'specialist',
              label: 'Specialist role: Go deep in one domain, become the expert',
              insight: 'Genuine preference for specialization',
            },
            {
              value: 'generalist',
              label: 'Generalist role: Touch multiple domains, keep learning new things',
              insight: 'Authentic explorer, not just "unfocused"',
            },
          ],
        });
      }

      if (gap.stated.includes('advancement')) {
        questions.push({
          id: 'auth-growth-vs-learning',
          area: 'values',
          type: 'multiple-choice',
          text: 'What makes you feel most successful at the end of a workday?',
          options: [
            {
              value: 'progress',
              label: 'Made clear progress toward career advancement',
              insight: 'Advancement-driven',
            },
            {
              value: 'learned',
              label: 'Learned something completely new',
              insight: 'Learning-driven (advancement is secondary)',
            },
            {
              value: 'solved',
              label: 'Solved a challenging problem',
              insight: 'Challenge-driven',
            },
          ],
        });
      }

      if (gap.stated.includes('impact')) {
        questions.push({
          id: 'auth-impact-vs-autonomy',
          area: 'values',
          type: 'scenario',
          text: 'Choose between these two projects:',
          options: [
            {
              value: 'impact-directed',
              label: 'High-impact project with clear direction from leadership',
              insight: 'Genuine impact focus',
            },
            {
              value: 'autonomy-uncertain',
              label: 'Uncertain impact but complete ownership and autonomy',
              insight: 'Autonomy matters more than stated impact',
            },
          ],
        });
      }

      if (gap.stated.includes('balance')) {
        questions.push({
          id: 'auth-balance-vs-intensity',
          area: 'work-style',
          type: 'multiple-choice',
          text: 'When do you feel most energized?',
          options: [
            {
              value: 'balanced',
              label: 'Maintaining steady 9-5 boundaries with clear separation',
              insight: 'Genuine balance preference',
            },
            {
              value: 'intense',
              label: 'Deep immersion in fascinating work (even if hours are long)',
              insight: 'Energized by intensity, not balance',
            },
            {
              value: 'flexible',
              label: 'Flexible schedule that adapts to project demands',
              insight: 'Prefers flexibility over strict balance',
            },
          ],
        });
      }

      if (gap.stated.includes('collaborative')) {
        questions.push({
          id: 'auth-collab-nuance',
          area: 'people-interaction',
          type: 'scenario',
          text: 'Your ideal project setup:',
          options: [
            {
              value: 'full-collab',
              label: 'Constant collaboration - regular syncs, paired work, shared decisions',
              insight: 'Genuinely collaborative',
            },
            {
              value: 'plan-execute',
              label: 'Collaborate to plan, execute independently, check in at milestones',
              insight: 'Selective collaboration, autonomous execution',
            },
            {
              value: 'solo-feedback',
              label: 'Work solo, get feedback when needed',
              insight: 'Independent with optional collaboration',
            },
          ],
        });
      }
    }

    return questions;
  }

  private generateAuthenticityInsights(
    preferences: AuthenticPreference[],
    gaps: SelfPerceptionGap[]
  ): string[] {
    const insights: string[] = [];

    const lowAuthenticity = preferences.filter(p => p.authenticityScore < 0.5);
    if (lowAuthenticity.length > 0) {
      insights.push(
        `${lowAuthenticity.length} preferences show "should-want" signals. These may reflect expectations rather than genuine desires.`
      );
    }

    for (const gap of gaps.filter(g => g.gapSize === 'large')) {
      insights.push(
        `Gap detected: You say "${gap.stated}" but your behavior suggests "${gap.actual}". ${gap.possibleReasons[0]}`
      );
    }

    const authenticCount = this.signals.filter(s => s.type === 'authentic').length;
    const totalSignals = this.signals.length;

    if (authenticCount / totalSignals > 0.7) {
      insights.push(
        'Strong authenticity signals across your responses. You seem clear about what you genuinely want.'
      );
    } else if (authenticCount / totalSignals < 0.4) {
      insights.push(
        'Many responses contain obligation language. Consider: what would you choose if no one was watching?'
      );
    }

    if (gaps.some(g => g.stated.includes('specialize') && g.actual.includes('exploration'))) {
      insights.push(
        'Your exploration isn\'t indecision—it\'s building rare cross-domain expertise. Don\'t rush to specialize.'
      );
    }

    return insights;
  }

  private categorizeIndustry(company: string, title: string): string {
    const text = `${company} ${title}`.toLowerCase();

    if (text.includes('health')) return 'healthcare';
    if (text.includes('fitness')) return 'fitness';
    if (text.includes('marketing')) return 'marketing';
    if (text.includes('retail')) return 'retail';
    if (text.includes('tech')) return 'technology';

    return 'other';
  }
}
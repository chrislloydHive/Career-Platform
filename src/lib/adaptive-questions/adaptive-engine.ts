import {
  AdaptiveQuestion,
  ExplorationArea,
  allQuestionBanks,
  getQuestionById,
} from './question-banks';

export interface QuestionResponse {
  questionId: string;
  response: unknown;
  timestamp: Date;
  confidenceLevel?: 'certain' | 'somewhat-sure' | 'uncertain';
}

export interface DiscoveredInsight {
  type: 'strength' | 'preference' | 'hidden-interest' | 'growth-area';
  area: ExplorationArea;
  insight: string;
  confidence: number;
  basedOn: string[];
}

export interface IdentifiedGap {
  area: ExplorationArea;
  gap: string;
  importance: 'high' | 'medium' | 'low';
  suggestedQuestions: string[];
}

export interface AdaptiveSessionState {
  responses: Record<string, QuestionResponse>;
  askedQuestions: string[];
  discoveredInsights: DiscoveredInsight[];
  identifiedGaps: IdentifiedGap[];
  currentArea?: ExplorationArea;
  explorationDepth: Record<ExplorationArea, number>;
}

export class AdaptiveQuestioningEngine {
  private state: AdaptiveSessionState;

  constructor(initialState?: Partial<AdaptiveSessionState>) {
    this.state = {
      responses: initialState?.responses || {},
      askedQuestions: initialState?.askedQuestions || [],
      discoveredInsights: initialState?.discoveredInsights || [],
      identifiedGaps: initialState?.identifiedGaps || [],
      currentArea: initialState?.currentArea,
      explorationDepth: initialState?.explorationDepth || {
        'work-style': 0,
        'people-interaction': 0,
        'problem-solving': 0,
        'creativity': 0,
        'structure-flexibility': 0,
        'values': 0,
        'environment': 0,
        'learning-growth': 0,
      },
    };
  }

  getState(): AdaptiveSessionState {
    return { ...this.state };
  }

  recordResponse(questionId: string, response: unknown, confidenceLevel?: 'certain' | 'somewhat-sure' | 'uncertain') {
    const question = getQuestionById(questionId);
    if (!question) {
      throw new Error(`Question ${questionId} not found`);
    }

    this.state.responses[questionId] = {
      questionId,
      response,
      timestamp: new Date(),
      confidenceLevel,
    };

    if (!this.state.askedQuestions.includes(questionId)) {
      this.state.askedQuestions.push(questionId);
    }

    this.state.explorationDepth[question.area]++;

    this.checkForInsights();
    this.detectGaps();
  }

  getNextQuestions(limit: number = 3): AdaptiveQuestion[] {
    const candidates: Array<{ question: AdaptiveQuestion; priority: number; reason: string }> = [];

    const lastResponse = this.getLastResponse();
    if (lastResponse) {
      const lastQuestion = getQuestionById(lastResponse.questionId);
      if (lastQuestion) {
        const followUps = this.getFollowUpQuestions(lastQuestion, lastResponse.response);
        followUps.forEach(q => candidates.push({ question: q, priority: 100, reason: 'Follow-up question' }));

        if (lastQuestion.clarificationNeeded?.(lastResponse.response)) {
          const clarifyQ = this.getClarificationQuestion(lastQuestion, lastResponse.response);
          if (clarifyQ) {
            candidates.push({ question: clarifyQ, priority: 95, reason: 'Clarification needed' });
          }
        }
      }
    }

    const gapQuestions = this.getGapFillingQuestions();
    gapQuestions.forEach(q => candidates.push({ question: q, priority: 80, reason: 'Fill knowledge gap' }));

    const unexploredAreas = this.getUnexploredAreas();
    if (unexploredAreas.length > 0) {
      const area = unexploredAreas[0];
      const questions = allQuestionBanks[area as keyof typeof allQuestionBanks];
      const firstQ = questions?.[0];
      if (firstQ) {
        candidates.push({ question: firstQ, priority: 70, reason: `Start exploring ${area}` });
      }
    }

    const shallow = this.getShallowlyExploredAreas();
    shallow.forEach(area => {
      const questions = allQuestionBanks[area as keyof typeof allQuestionBanks];
      const unanswered = questions?.filter(q => !this.state.askedQuestions.includes(q.id));
      if (unanswered && unanswered.length > 0) {
        candidates.push({ question: unanswered[0], priority: 60, reason: `Deepen ${area} exploration` });
      }
    });

    const uniqueCandidates = candidates.filter((c, index, self) =>
      index === self.findIndex(t => t.question.id === c.question.id)
    );

    const alreadyAsked = uniqueCandidates.filter(c => this.state.askedQuestions.includes(c.question.id));
    const notYetAsked = uniqueCandidates.filter(c => !this.state.askedQuestions.includes(c.question.id));

    notYetAsked.sort((a, b) => b.priority - a.priority);

    return notYetAsked.slice(0, limit).map(c => c.question);
  }

  private getFollowUpQuestions(question: AdaptiveQuestion, response: unknown): AdaptiveQuestion[] {
    const followUps: AdaptiveQuestion[] = [];

    if (question.followUpConditions) {
      for (const condition of question.followUpConditions) {
        if (condition.if(response)) {
          for (const qId of condition.then) {
            const q = getQuestionById(qId);
            if (q && !this.state.askedQuestions.includes(q.id)) {
              followUps.push(q);
            }
          }
        }
      }
    }

    return followUps;
  }

  private getClarificationQuestion(question: AdaptiveQuestion, response: unknown): AdaptiveQuestion | null {
    const clarifyId = `${question.id}-clarify`;

    if (question.id === 'pi-conflict' && response === 'accept-move-on') {
      return {
        id: 'pi-conflict-clarify',
        area: 'people-interaction',
        type: 'multiple-choice',
        text: 'When you accept a team decision you disagree with, is it because...',
        options: [
          { value: 'avoid-conflict', label: 'I prefer to avoid conflict' },
          { value: 'trust-process', label: 'I trust the team\'s decision-making process' },
          { value: 'pick-battles', label: 'I choose to pick my battles strategically' },
          { value: 'not-worth', label: 'This particular issue isn\'t important enough' },
        ],
      };
    }

    return null;
  }

  private getGapFillingQuestions(): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    for (const gap of this.state.identifiedGaps) {
      for (const qId of gap.suggestedQuestions) {
        const q = getQuestionById(qId);
        if (q && !this.state.askedQuestions.includes(q.id)) {
          questions.push(q);
        }
      }
    }

    return questions;
  }

  private getUnexploredAreas(): ExplorationArea[] {
    return (Object.keys(this.state.explorationDepth) as ExplorationArea[])
      .filter(area => this.state.explorationDepth[area] === 0);
  }

  private getShallowlyExploredAreas(): ExplorationArea[] {
    return (Object.keys(this.state.explorationDepth) as ExplorationArea[])
      .filter(area => this.state.explorationDepth[area] > 0 && this.state.explorationDepth[area] < 3)
      .sort((a, b) => this.state.explorationDepth[a] - this.state.explorationDepth[b]);
  }

  private checkForInsights() {
    for (const area of Object.keys(allQuestionBanks) as ExplorationArea[]) {
      const questions = allQuestionBanks[area as keyof typeof allQuestionBanks];

      for (const question of questions) {
        if (question.insightTriggers) {
          for (const trigger of question.insightTriggers) {
            const responses = this.getResponseValues();

            if (trigger.pattern(responses)) {
              const existing = this.state.discoveredInsights.find(
                i => i.insight === trigger.insight
              );

              if (!existing) {
                this.state.discoveredInsights.push({
                  type: trigger.hiddenInterest ? 'hidden-interest' : 'preference',
                  area,
                  insight: trigger.insight,
                  confidence: 0.8,
                  basedOn: [question.id],
                });
              }
            }
          }
        }
      }
    }
  }

  private detectGaps() {
    for (const area of Object.keys(allQuestionBanks) as ExplorationArea[]) {
      const questions = allQuestionBanks[area as keyof typeof allQuestionBanks];

      for (const question of questions) {
        if (question.gapDetectors) {
          for (const detector of question.gapDetectors) {
            const responses = this.getResponseValues();

            if (detector.detect(responses)) {
              const existing = this.state.identifiedGaps.find(
                g => g.gap === detector.gap
              );

              if (!existing) {
                this.state.identifiedGaps.push({
                  area,
                  gap: detector.gap,
                  importance: 'medium',
                  suggestedQuestions: detector.suggestedQuestions,
                });
              }
            }
          }
        }
      }
    }
  }

  private getResponseValues(): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    for (const [questionId, response] of Object.entries(this.state.responses)) {
      values[questionId] = response.response;
    }
    return values;
  }

  private getLastResponse(): QuestionResponse | null {
    const responses = Object.values(this.state.responses);
    if (responses.length === 0) return null;

    return responses.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest
    );
  }

  getInsights(): DiscoveredInsight[] {
    return [...this.state.discoveredInsights];
  }

  getGaps(): IdentifiedGap[] {
    return [...this.state.identifiedGaps];
  }

  getExplorationProgress(): { area: ExplorationArea; depth: number; totalQuestions: number }[] {
    return (Object.keys(this.state.explorationDepth) as ExplorationArea[]).map(area => ({
      area,
      depth: this.state.explorationDepth[area],
      totalQuestions: allQuestionBanks[area as keyof typeof allQuestionBanks]?.length || 0,
    }));
  }

  getCompletionPercentage(): number {
    const totalQuestions = Object.values(allQuestionBanks)
      .flat()
      .length;
    const answeredQuestions = this.state.askedQuestions.length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  }

  analyzeUserProfile(): {
    strengths: string[];
    preferences: string[];
    hiddenInterests: string[];
    suggestions: string[];
  } {
    const insights = this.getInsights();

    return {
      strengths: insights
        .filter(i => i.type === 'strength')
        .map(i => i.insight),
      preferences: insights
        .filter(i => i.type === 'preference')
        .map(i => i.insight),
      hiddenInterests: insights
        .filter(i => i.type === 'hidden-interest')
        .map(i => i.insight),
      suggestions: this.state.identifiedGaps
        .filter(g => g.importance === 'high')
        .map(g => `Consider exploring: ${g.gap}`),
    };
  }

  exportProfile() {
    return {
      responses: this.state.responses,
      insights: this.state.discoveredInsights,
      gaps: this.state.identifiedGaps,
      progress: this.getExplorationProgress(),
      completion: this.getCompletionPercentage(),
      analysis: this.analyzeUserProfile(),
    };
  }
}
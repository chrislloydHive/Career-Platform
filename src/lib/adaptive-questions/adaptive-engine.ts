import {
  AdaptiveQuestion,
  ExplorationArea,
  allQuestionBanks,
  getQuestionById,
} from './question-banks';
import {
  PatternRecognitionEngine,
  ConsistencyPattern,
  PreferenceIntensity,
  ValueHierarchy,
  Contradiction,
  HiddenMotivation,
} from './pattern-recognition';
import { InsightSynthesisEngine, SynthesizedInsight } from './insight-synthesis';
import { DynamicQuestionGenerator, DynamicQuestionContext } from './dynamic-question-generator';
import { InteractionTracker } from './interaction-tracker';
import {
  allArchaeologyQuestions,
  getArchaeologyFollowUps,
  synthesizeMotivationInsights,
  MotivationInsight,
  ArchaeologyQuestion,
} from './motivation-archaeology';
import { StrengthValidationEngine, StrengthProfile } from '../strengths/strength-validation';
import { UserProfile } from '@/types/user-profile';
import { HiddenInterestPredictor, ExplorationSuggestion } from '../predictions/hidden-interest-predictor';
import { FutureSelfProjector, FutureSelfProjection } from '../future-modeling/future-self-projector';
import { LifeStageAdapter, LifeStageContext, TransitionReadiness, CareerStageInsight } from '../life-stage/life-stage-adapter';
import { GeographicIntelligence, GeographicProfile, LocationImpact, GeographicInsight } from '../geography/geographic-intelligence';
import { ConfidenceEvolutionEngine, InsightEvolution, ConfidencePattern, EvolutionSummary } from '../insights/confidence-evolution';
import { NarrativeInsightGenerator, NarrativeInsight } from '../insights/narrative-insight-generator';
import { AuthenticSelfDetector, AuthenticityProfile, AuthenticPreference, SelfPerceptionGap } from '../authenticity/authentic-self-detector';

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
  consistencyPatterns: ConsistencyPattern[];
  preferenceIntensities: PreferenceIntensity[];
  valueHierarchy: ValueHierarchy | null;
  contradictions: Contradiction[];
  hiddenMotivations: HiddenMotivation[];
  synthesizedInsights: SynthesizedInsight[];
  motivationInsights: MotivationInsight[];
  archaeologyDepth: number;
  strengthProfile: StrengthProfile | null;
  hiddenInterestPredictions: ExplorationSuggestion[];
  futureSelfProjection: FutureSelfProjection | null;
  lifeStageContext: LifeStageContext | null;
  transitionReadiness: TransitionReadiness | null;
  careerStageInsights: CareerStageInsight[];
  geographicProfile: GeographicProfile | null;
  locationImpacts: LocationImpact[];
  geographicInsights: GeographicInsight[];
  confidenceEvolutions: InsightEvolution[];
  confidencePatterns: ConfidencePattern[];
  evolutionSummary: EvolutionSummary | null;
  narrativeInsights: NarrativeInsight[];
  authenticityProfile: AuthenticityProfile | null;
}

export class AdaptiveQuestioningEngine {
  private state: AdaptiveSessionState;
  private dynamicGenerator: DynamicQuestionGenerator;
  private userProfile?: UserProfile;
  private generatedQuestionsCache: AdaptiveQuestion[] = [];

  constructor(initialState?: Partial<AdaptiveSessionState>, userProfile?: UserProfile) {
    this.dynamicGenerator = new DynamicQuestionGenerator();
    this.userProfile = userProfile;
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
      consistencyPatterns: initialState?.consistencyPatterns || [],
      preferenceIntensities: initialState?.preferenceIntensities || [],
      valueHierarchy: initialState?.valueHierarchy || null,
      contradictions: initialState?.contradictions || [],
      hiddenMotivations: initialState?.hiddenMotivations || [],
      synthesizedInsights: initialState?.synthesizedInsights || [],
      motivationInsights: initialState?.motivationInsights || [],
      archaeologyDepth: initialState?.archaeologyDepth || 0,
      strengthProfile: initialState?.strengthProfile || null,
      hiddenInterestPredictions: initialState?.hiddenInterestPredictions || [],
      futureSelfProjection: initialState?.futureSelfProjection || null,
      lifeStageContext: initialState?.lifeStageContext || null,
      transitionReadiness: initialState?.transitionReadiness || null,
      careerStageInsights: initialState?.careerStageInsights || [],
      geographicProfile: initialState?.geographicProfile || null,
      locationImpacts: initialState?.locationImpacts || [],
      geographicInsights: initialState?.geographicInsights || [],
      confidenceEvolutions: initialState?.confidenceEvolutions || [],
      confidencePatterns: initialState?.confidencePatterns || [],
      evolutionSummary: initialState?.evolutionSummary || null,
      narrativeInsights: initialState?.narrativeInsights || [],
      authenticityProfile: initialState?.authenticityProfile || null,
    };
  }

  getState(): AdaptiveSessionState {
    return { ...this.state };
  }

  loadState(savedState: AdaptiveSessionState) {
    this.state = { ...savedState };
  }

  recordResponse(questionId: string, response: unknown, confidenceLevel?: 'certain' | 'somewhat-sure' | 'uncertain') {
    let question = getQuestionById(questionId);

    if (!question) {
      question = this.generatedQuestionsCache.find(q => q.id === questionId);
    }

    if (!question) {
      console.warn(`Question ${questionId} not found in any question bank`);
      question = {
        id: questionId,
        area: 'values' as ExplorationArea,
        type: 'open-ended',
        text: 'Question',
      };
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
    this.runPatternRecognition();
    this.runInsightSynthesis();
    this.runMotivationArchaeology();
    this.runStrengthValidation();
    this.runHiddenInterestPrediction();
    this.runFutureSelfProjection();
    this.runLifeStageAdaptation();
    this.runGeographicIntelligence();
    this.runConfidenceEvolution();
    this.runNarrativeGeneration();
    this.runAuthenticityDetection();
  }

  getNextQuestions(limit: number = 3): AdaptiveQuestion[] {
    this.generatedQuestionsCache = [];

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

    const dynamicQuestions = this.getDynamicQuestions();
    this.generatedQuestionsCache.push(...dynamicQuestions);
    dynamicQuestions.forEach(q => candidates.push({ question: q, priority: 90, reason: 'Personalized from career interests' }));

    const archaeologyQuestions = this.getArchaeologyQuestions();
    this.generatedQuestionsCache.push(...archaeologyQuestions);
    archaeologyQuestions.forEach(q => candidates.push({ question: q, priority: 85, reason: 'Deep motivation exploration' }));

    const lifeStageQuestions = this.getLifeStageQuestions();
    this.generatedQuestionsCache.push(...lifeStageQuestions);
    lifeStageQuestions.forEach(q => candidates.push({ question: q, priority: 87, reason: 'Career stage-specific exploration' }));

    const geographicQuestions = this.getGeographicQuestions();
    this.generatedQuestionsCache.push(...geographicQuestions);
    geographicQuestions.forEach(q => candidates.push({ question: q, priority: 86, reason: 'Location and career trade-offs' }));

    const authenticityQuestions = this.getAuthenticityProbingQuestions();
    this.generatedQuestionsCache.push(...authenticityQuestions);
    authenticityQuestions.forEach(q => candidates.push({ question: q, priority: 88, reason: 'Discover authentic preferences' }));

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

  private getDynamicQuestions(): AdaptiveQuestion[] {
    const responseCount = Object.keys(this.state.responses).length;

    if (responseCount < 5) {
      return [];
    }

    const interactions = InteractionTracker.getRecentInteractions(50);

    if (interactions.length < 2) {
      return [];
    }

    const context: DynamicQuestionContext = {
      interactions,
      existingResponses: this.state.responses,
    };

    const dynamicQuestions = this.dynamicGenerator.generateQuestionsFromContext(context);

    return dynamicQuestions.filter(q => !this.state.askedQuestions.includes(q.id));
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

  private runPatternRecognition() {
    if (Object.keys(this.state.responses).length < 3) {
      return;
    }

    const patternEngine = new PatternRecognitionEngine(this.state.responses);

    this.state.consistencyPatterns = patternEngine.detectConsistencyPatterns();
    this.state.preferenceIntensities = patternEngine.analyzePreferenceIntensity();
    this.state.valueHierarchy = patternEngine.detectValueHierarchy();
    this.state.contradictions = patternEngine.detectContradictions();
    this.state.hiddenMotivations = patternEngine.discoverHiddenMotivations();

    this.updateInsightsWithPatterns(patternEngine);

    this.addMotivationInsights();

    this.handleContradictions();
  }

  private runInsightSynthesis() {
    if (Object.keys(this.state.responses).length < 5) {
      return;
    }

    const synthesisEngine = new InsightSynthesisEngine(this.state.responses);
    this.state.synthesizedInsights = synthesisEngine.synthesizeInsights();
  }

  private runMotivationArchaeology() {
    const responseValues = this.getResponseValues();
    const motivationInsights = synthesizeMotivationInsights(responseValues);

    for (const insight of motivationInsights) {
      const existing = this.state.motivationInsights.find(
        i => i.insight === insight.insight
      );

      if (!existing) {
        this.state.motivationInsights.push(insight);
        this.state.archaeologyDepth++;
      }
    }
  }

  private runStrengthValidation() {
    if (!this.userProfile || Object.keys(this.state.responses).length < 5) {
      return;
    }

    const validationEngine = new StrengthValidationEngine(
      this.state.responses,
      this.userProfile
    );

    this.state.strengthProfile = validationEngine.validateStrengths();

    for (const strength of this.state.strengthProfile.validated) {
      for (const insight of strength.insights) {
        const existing = this.state.discoveredInsights.find(i => i.insight === insight);

        if (!existing) {
          this.state.discoveredInsights.push({
            type: 'strength',
            area: 'work-style',
            insight,
            confidence: strength.confidence,
            basedOn: strength.evidence.map(e => e.description),
          });
        }
      }
    }

    for (const hiddenStrength of this.state.strengthProfile.summary.hiddenTalents) {
      const strength = this.state.strengthProfile.validated.find(s => s.name === hiddenStrength);
      if (strength) {
        const existing = this.state.discoveredInsights.find(
          i => i.insight.includes(hiddenStrength) && i.type === 'hidden-interest'
        );

        if (!existing) {
          this.state.discoveredInsights.push({
            type: 'hidden-interest',
            area: 'work-style',
            insight: `Hidden strength: ${hiddenStrength} - You consistently demonstrate this but may not recognize it as a core capability.`,
            confidence: strength.confidence,
            basedOn: strength.evidence.map(e => e.source),
          });
        }
      }
    }
  }

  private getArchaeologyQuestions(): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];
    const responseValues = this.getResponseValues();

    const followUps = getArchaeologyFollowUps(responseValues);
    for (const followUp of followUps) {
      if (!this.state.askedQuestions.includes(followUp.id)) {
        questions.push(followUp as AdaptiveQuestion);
      }
    }

    if (this.state.archaeologyDepth < 3 && Object.keys(this.state.responses).length >= 3) {
      for (const question of allArchaeologyQuestions) {
        if (question.depth === 'intermediate' && !this.state.askedQuestions.includes(question.id)) {
          questions.push(question as AdaptiveQuestion);
          break;
        }
      }
    }

    if (this.state.archaeologyDepth >= 5) {
      for (const question of allArchaeologyQuestions) {
        if (question.depth === 'deep' && !this.state.askedQuestions.includes(question.id)) {
          questions.push(question as AdaptiveQuestion);
          break;
        }
      }
    }

    return questions.slice(0, 2);
  }

  private updateInsightsWithPatterns(patternEngine: PatternRecognitionEngine) {
    for (const insight of this.state.discoveredInsights) {
      const newConfidence = patternEngine.calculateDynamicConfidence(
        insight,
        this.state.consistencyPatterns,
        this.state.preferenceIntensities,
        this.state.valueHierarchy || { topValues: [], valueConflicts: [], coreMotivation: '', confidence: 0.5 }
      );
      insight.confidence = newConfidence;
    }
  }

  private addMotivationInsights() {
    for (const motivation of this.state.hiddenMotivations) {
      const existing = this.state.discoveredInsights.find(
        i => i.insight === motivation.insight
      );

      if (!existing) {
        this.state.discoveredInsights.push({
          type: 'hidden-interest',
          area: motivation.relatedAreas[0],
          insight: motivation.insight,
          confidence: motivation.confidence,
          basedOn: motivation.evidence,
        });
      }
    }
  }

  private handleContradictions() {
    for (const contradiction of this.state.contradictions) {
      if (contradiction.needsClarification && contradiction.severity === 'high') {
        const existing = this.state.identifiedGaps.find(
          g => g.gap.includes(contradiction.question1) || g.gap.includes(contradiction.question2)
        );

        if (!existing) {
          this.state.identifiedGaps.push({
            area: 'values',
            gap: `Clarify apparent contradiction: ${contradiction.possibleReasons[0]}`,
            importance: 'high',
            suggestedQuestions: [],
          });
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

  getSynthesizedInsights(): SynthesizedInsight[] {
    return [...this.state.synthesizedInsights];
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
    const totalAnswered = this.state.askedQuestions.length;
    const totalInsights = this.state.discoveredInsights.length;
    const areasExplored = Object.values(this.state.explorationDepth).filter(d => d > 0).length;

    const targetQuestions = 50;
    const targetInsights = 10;
    const targetAreas = 8;

    const questionProgress = Math.min(100, (totalAnswered / targetQuestions) * 100);
    const insightProgress = Math.min(100, (totalInsights / targetInsights) * 100);
    const areaProgress = Math.min(100, (areasExplored / targetAreas) * 100);

    const questionWeight = 0.5;
    const insightWeight = 0.3;
    const areaWeight = 0.2;

    return Math.round(
      (questionProgress * questionWeight) +
      (insightProgress * insightWeight) +
      (areaProgress * areaWeight)
    );
  }

  isComplete(): boolean {
    const completionPercent = this.getCompletionPercentage();
    const minInsights = 5;
    const minResponses = 25;

    return (
      completionPercent >= 70 &&
      this.state.discoveredInsights.length >= minInsights &&
      Object.keys(this.state.responses).length >= minResponses
    );
  }

  canFinish(): boolean {
    return this.getCompletionPercentage() >= 40 ||
           Object.keys(this.state.responses).length >= 15;
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

  getPatternAnalysis() {
    return {
      consistencyPatterns: this.state.consistencyPatterns,
      preferenceIntensities: this.state.preferenceIntensities,
      valueHierarchy: this.state.valueHierarchy,
      contradictions: this.state.contradictions,
      hiddenMotivations: this.state.hiddenMotivations,
    };
  }

  exportProfile() {
    return {
      responses: this.state.responses,
      insights: this.state.discoveredInsights,
      synthesizedInsights: this.state.synthesizedInsights,
      motivationInsights: this.state.motivationInsights,
      strengthProfile: this.state.strengthProfile,
      hiddenInterestPredictions: this.state.hiddenInterestPredictions,
      futureSelfProjection: this.state.futureSelfProjection,
      lifeStageContext: this.state.lifeStageContext,
      transitionReadiness: this.state.transitionReadiness,
      careerStageInsights: this.state.careerStageInsights,
      geographicProfile: this.state.geographicProfile,
      locationImpacts: this.state.locationImpacts,
      geographicInsights: this.state.geographicInsights,
      confidenceEvolutions: this.state.confidenceEvolutions,
      confidencePatterns: this.state.confidencePatterns,
      evolutionSummary: this.state.evolutionSummary,
      narrativeInsights: this.state.narrativeInsights,
      gaps: this.state.identifiedGaps,
      progress: this.getExplorationProgress(),
      completion: this.getCompletionPercentage(),
      analysis: this.analyzeUserProfile(),
      patterns: this.getPatternAnalysis(),
    };
  }

  getMotivationInsights(): MotivationInsight[] {
    return this.state.motivationInsights;
  }

  getStrengthProfile(): StrengthProfile | null {
    return this.state.strengthProfile;
  }

  private runHiddenInterestPrediction() {
    if (!this.userProfile || Object.keys(this.state.responses).length < 5) {
      return;
    }

    const interactions = InteractionTracker.getRecentInteractions(100);

    const predictor = new HiddenInterestPredictor(
      this.state.responses,
      interactions,
      this.userProfile
    );

    this.state.hiddenInterestPredictions = predictor.predictHiddenInterests();

    for (const prediction of this.state.hiddenInterestPredictions) {
      const existing = this.state.discoveredInsights.find(
        i => i.insight.includes(prediction.careerArea) && i.type === 'hidden-interest'
      );

      if (!existing) {
        this.state.discoveredInsights.push({
          type: 'hidden-interest',
          area: this.mapCareerAreaToExplorationArea(prediction.careerArea),
          insight: prediction.reasoning,
          confidence: prediction.confidence,
          basedOn: prediction.signals.map(s => s.evidence.join('; ')),
        });
      }
    }
  }

  private mapCareerAreaToExplorationArea(careerArea: string): ExplorationArea {
    const mapping: Record<string, ExplorationArea> = {
      'Data Visualization': 'creativity',
      'Product Management': 'problem-solving',
      'UX Research': 'people-interaction',
      'Operations': 'structure-flexibility',
      'Training': 'learning-growth',
      'Analytics': 'problem-solving',
      'Customer Success': 'people-interaction',
      'Content Strategy': 'creativity',
    };

    for (const [key, value] of Object.entries(mapping)) {
      if (careerArea.includes(key)) {
        return value;
      }
    }

    return 'work-style';
  }

  getHiddenInterestPredictions(): ExplorationSuggestion[] {
    return this.state.hiddenInterestPredictions;
  }

  private runFutureSelfProjection() {
    if (!this.userProfile || Object.keys(this.state.responses).length < 10) {
      return;
    }

    const interactions = InteractionTracker.getRecentInteractions(100);

    const projector = new FutureSelfProjector(
      this.state.responses,
      this.userProfile,
      this.state.strengthProfile,
      this.state.motivationInsights,
      interactions
    );

    this.state.futureSelfProjection = projector.projectFutureSelf();

    const projection = this.state.futureSelfProjection;

    for (const challenge of projection.challenges) {
      if (challenge.severity === 'high' && challenge.likelihood >= 0.6) {
        const existing = this.state.discoveredInsights.find(
          i => i.insight.includes(challenge.description)
        );

        if (!existing) {
          this.state.discoveredInsights.push({
            type: 'growth-area',
            area: 'values',
            insight: `Future challenge: ${challenge.description}. Mitigation: ${challenge.mitigation[0]}`,
            confidence: challenge.likelihood,
            basedOn: ['Future self projection'],
          });
        }
      }
    }

    for (const growthArea of projection.growthAreas.slice(0, 3)) {
      if (growthArea.importance === 'critical' || growthArea.importance === 'high') {
        const existing = this.state.discoveredInsights.find(
          i => i.insight.includes(growthArea.skill)
        );

        if (!existing) {
          this.state.discoveredInsights.push({
            type: 'growth-area',
            area: 'learning-growth',
            insight: `High-potential growth area: ${growthArea.skill}. Can reach ${growthArea.potentialLevel} level within ${growthArea.timeToAchieve}.`,
            confidence: growthArea.naturalAptitude,
            basedOn: ['Future self projection', 'Strength validation'],
          });
        }
      }
    }
  }

  getFutureSelfProjection(): FutureSelfProjection | null {
    return this.state.futureSelfProjection;
  }

  private runLifeStageAdaptation() {
    if (!this.userProfile) {
      return;
    }

    const adapter = new LifeStageAdapter(this.userProfile, this.state.responses);

    this.state.lifeStageContext = adapter.detectLifeStage();

    if (Object.keys(this.state.responses).length >= 3) {
      this.state.transitionReadiness = adapter.assessTransitionReadiness(this.state.lifeStageContext);
      this.state.careerStageInsights = adapter.generateCareerStageInsights(this.state.lifeStageContext);

      for (const insight of this.state.careerStageInsights) {
        if (insight.confidence >= 0.7) {
          const existing = this.state.discoveredInsights.find(
            i => i.insight === insight.insight
          );

          if (!existing) {
            const insightType = insight.type === 'challenge' ? 'growth-area' : 'preference';
            this.state.discoveredInsights.push({
              type: insightType,
              area: 'values',
              insight: insight.insight,
              confidence: insight.confidence,
              basedOn: ['Life stage analysis'],
            });
          }
        }
      }
    }
  }

  private getLifeStageQuestions(): AdaptiveQuestion[] {
    if (!this.userProfile || !this.state.lifeStageContext) {
      return [];
    }

    const adapter = new LifeStageAdapter(this.userProfile, this.state.responses);
    const questions = adapter.generateLifeStageQuestions(this.state.lifeStageContext);

    return questions.filter(q => !this.state.askedQuestions.includes(q.id)).slice(0, 2);
  }

  getLifeStageContext(): LifeStageContext | null {
    return this.state.lifeStageContext;
  }

  getTransitionReadiness(): TransitionReadiness | null {
    return this.state.transitionReadiness;
  }

  getCareerStageInsights(): CareerStageInsight[] {
    return this.state.careerStageInsights;
  }

  private runGeographicIntelligence() {
    if (!this.userProfile) {
      return;
    }

    const geoIntel = new GeographicIntelligence(this.userProfile, this.state.responses);

    this.state.geographicProfile = geoIntel.buildGeographicProfile();

    if (Object.keys(this.state.responses).length >= 3) {
      this.state.locationImpacts = geoIntel.analyzeLocationImpacts(this.state.geographicProfile);
      this.state.geographicInsights = geoIntel.generateGeographicInsights(
        this.state.geographicProfile,
        this.state.locationImpacts
      );

      for (const insight of this.state.geographicInsights) {
        if (insight.confidence >= 0.75) {
          const existing = this.state.discoveredInsights.find(
            i => i.insight === insight.insight
          );

          if (!existing) {
            const insightType = insight.type === 'constraint' ? 'growth-area' : 'preference';
            this.state.discoveredInsights.push({
              type: insightType,
              area: 'environment',
              insight: insight.insight,
              confidence: insight.confidence,
              basedOn: ['Geographic analysis'],
            });
          }
        }
      }
    }
  }

  private getGeographicQuestions(): AdaptiveQuestion[] {
    if (!this.userProfile || !this.state.geographicProfile) {
      return [];
    }

    const geoIntel = new GeographicIntelligence(this.userProfile, this.state.responses);
    const questions = geoIntel.generateGeographicQuestions(this.state.geographicProfile);

    return questions.filter(q => !this.state.askedQuestions.includes(q.id)).slice(0, 2);
  }

  getGeographicProfile(): GeographicProfile | null {
    return this.state.geographicProfile;
  }

  getLocationImpacts(): LocationImpact[] {
    return this.state.locationImpacts;
  }

  getGeographicInsights(): GeographicInsight[] {
    return this.state.geographicInsights;
  }

  private runConfidenceEvolution() {
    if (Object.keys(this.state.responses).length < 3) {
      return;
    }

    const evolutionEngine = new ConfidenceEvolutionEngine(
      this.state.responses,
      this.state.discoveredInsights
    );

    this.state.confidenceEvolutions = evolutionEngine.getEvolutions();
    this.state.confidencePatterns = evolutionEngine.getPatterns();
    this.state.evolutionSummary = evolutionEngine.getEvolutionSummary();

    for (const pattern of this.state.confidencePatterns) {
      if (pattern.confidence >= 0.85) {
        const existing = this.state.discoveredInsights.find(
          i => i.insight === pattern.implication
        );

        if (!existing) {
          this.state.discoveredInsights.push({
            type: 'preference',
            area: 'values',
            insight: pattern.implication,
            confidence: pattern.confidence,
            basedOn: ['Confidence evolution analysis'],
          });
        }
      }
    }
  }

  getConfidenceEvolutions(): InsightEvolution[] {
    return this.state.confidenceEvolutions;
  }

  getConfidencePatterns(): ConfidencePattern[] {
    return this.state.confidencePatterns;
  }

  getEvolutionSummary(): EvolutionSummary | null {
    return this.state.evolutionSummary;
  }

  private runNarrativeGeneration() {
    if (!this.userProfile || Object.keys(this.state.responses).length < 3) {
      return;
    }

    const narrativeGenerator = new NarrativeInsightGenerator(
      this.userProfile,
      this.state.responses,
      this.state.discoveredInsights
    );

    this.state.narrativeInsights = narrativeGenerator.generateNarrativeInsights();
  }

  getNarrativeInsights(): NarrativeInsight[] {
    return this.state.narrativeInsights;
  }

  private runAuthenticityDetection() {
    if (Object.keys(this.state.responses).length < 5) {
      return;
    }

    const authenticityDetector = new AuthenticSelfDetector(
      this.state.responses,
      this.state.discoveredInsights,
      this.userProfile
    );

    this.state.authenticityProfile = authenticityDetector.buildAuthenticityProfile();
  }

  getAuthenticityProfile(): AuthenticityProfile | null {
    return this.state.authenticityProfile;
  }

  getAuthenticityProbingQuestions(): AdaptiveQuestion[] {
    if (!this.state.authenticityProfile) {
      return [];
    }
    return this.state.authenticityProfile.probingQuestions;
  }
}
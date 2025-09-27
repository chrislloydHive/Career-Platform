import { QuestionResponse, DiscoveredInsight } from './adaptive-engine';
import { ExplorationArea } from './question-banks';

export interface ConsistencyPattern {
  area: ExplorationArea;
  theme: string;
  responses: string[];
  consistencyScore: number;
  confidence: number;
}

export interface PreferenceIntensity {
  preference: string;
  area: ExplorationArea;
  intensity: 'strong' | 'moderate' | 'weak';
  evidence: string[];
  confidence: number;
}

export interface ValueHierarchy {
  topValues: Array<{ value: string; priority: number; confidence: number }>;
  valueConflicts: Array<{ value1: string; value2: string; context: string }>;
  coreMotivation: string;
  confidence: number;
}

export interface Contradiction {
  question1: string;
  question2: string;
  responses: [unknown, unknown];
  severity: 'high' | 'medium' | 'low';
  possibleReasons: string[];
  needsClarification: boolean;
}

export interface HiddenMotivation {
  motivation: string;
  evidence: string[];
  relatedAreas: ExplorationArea[];
  confidence: number;
  insight: string;
}

export class PatternRecognitionEngine {
  private responses: Record<string, QuestionResponse>;

  constructor(responses: Record<string, QuestionResponse>) {
    this.responses = responses;
  }

  detectConsistencyPatterns(): ConsistencyPattern[] {
    const patterns: ConsistencyPattern[] = [];
    const responsesByArea = this.groupResponsesByArea();

    for (const [area, areaResponses] of Object.entries(responsesByArea)) {
      const autonomyPattern = this.detectAutonomyPattern(areaResponses);
      if (autonomyPattern) {
        patterns.push({
          area: area as ExplorationArea,
          theme: 'autonomy-preference',
          responses: autonomyPattern.responses,
          consistencyScore: autonomyPattern.score,
          confidence: this.calculatePatternConfidence(autonomyPattern.score, areaResponses.length),
        });
      }

      const collaborationPattern = this.detectCollaborationPattern(areaResponses);
      if (collaborationPattern) {
        patterns.push({
          area: area as ExplorationArea,
          theme: 'collaboration-preference',
          responses: collaborationPattern.responses,
          consistencyScore: collaborationPattern.score,
          confidence: this.calculatePatternConfidence(collaborationPattern.score, areaResponses.length),
        });
      }

      const structurePattern = this.detectStructurePattern(areaResponses);
      if (structurePattern) {
        patterns.push({
          area: area as ExplorationArea,
          theme: 'structure-preference',
          responses: structurePattern.responses,
          consistencyScore: structurePattern.score,
          confidence: this.calculatePatternConfidence(structurePattern.score, areaResponses.length),
        });
      }

      const creativityPattern = this.detectCreativityPattern(areaResponses);
      if (creativityPattern) {
        patterns.push({
          area: area as ExplorationArea,
          theme: 'creativity-drive',
          responses: creativityPattern.responses,
          consistencyScore: creativityPattern.score,
          confidence: this.calculatePatternConfidence(creativityPattern.score, areaResponses.length),
        });
      }
    }

    return patterns;
  }

  analyzePreferenceIntensity(): PreferenceIntensity[] {
    const intensities: PreferenceIntensity[] = [];
    const allResponses = Object.values(this.responses);

    const autonomyEvidence = this.gatherAutonomyEvidence(allResponses);
    if (autonomyEvidence.length > 0) {
      intensities.push({
        preference: 'Independent work',
        area: 'work-style',
        intensity: this.calculateIntensity(autonomyEvidence.length, allResponses.length),
        evidence: autonomyEvidence,
        confidence: Math.min(0.95, 0.5 + (autonomyEvidence.length * 0.15)),
      });
    }

    const peopleEvidence = this.gatherPeopleOrientedEvidence(allResponses);
    if (peopleEvidence.length > 0) {
      intensities.push({
        preference: 'People-oriented work',
        area: 'people-interaction',
        intensity: this.calculateIntensity(peopleEvidence.length, allResponses.length),
        evidence: peopleEvidence,
        confidence: Math.min(0.95, 0.5 + (peopleEvidence.length * 0.15)),
      });
    }

    const problemSolvingEvidence = this.gatherProblemSolvingEvidence(allResponses);
    if (problemSolvingEvidence.length > 0) {
      intensities.push({
        preference: 'Analytical problem-solving',
        area: 'problem-solving',
        intensity: this.calculateIntensity(problemSolvingEvidence.length, allResponses.length),
        evidence: problemSolvingEvidence,
        confidence: Math.min(0.95, 0.5 + (problemSolvingEvidence.length * 0.15)),
      });
    }

    const learningEvidence = this.gatherLearningEvidence(allResponses);
    if (learningEvidence.length > 0) {
      intensities.push({
        preference: 'Continuous learning',
        area: 'learning-growth',
        intensity: this.calculateIntensity(learningEvidence.length, allResponses.length),
        evidence: learningEvidence,
        confidence: Math.min(0.95, 0.5 + (learningEvidence.length * 0.15)),
      });
    }

    return intensities;
  }

  detectValueHierarchy(): ValueHierarchy {
    const values: Array<{ value: string; priority: number; evidence: string[] }> = [];
    const conflicts: Array<{ value1: string; value2: string; context: string }> = [];

    const allResponses = Object.values(this.responses);

    const impactValue = this.assessValue('impact', allResponses);
    if (impactValue.priority > 0) values.push(impactValue);

    const autonomyValue = this.assessValue('autonomy', allResponses);
    if (autonomyValue.priority > 0) values.push(autonomyValue);

    const growthValue = this.assessValue('growth', allResponses);
    if (growthValue.priority > 0) values.push(growthValue);

    const stabilityValue = this.assessValue('stability', allResponses);
    if (stabilityValue.priority > 0) values.push(stabilityValue);

    const creativityValue = this.assessValue('creativity', allResponses);
    if (creativityValue.priority > 0) values.push(creativityValue);

    const collaborationValue = this.assessValue('collaboration', allResponses);
    if (collaborationValue.priority > 0) values.push(collaborationValue);

    if (autonomyValue.priority > 7 && collaborationValue.priority > 7) {
      conflicts.push({
        value1: 'autonomy',
        value2: 'collaboration',
        context: 'High preference for both independent work and team collaboration',
      });
    }

    if (creativityValue.priority > 7 && stabilityValue.priority > 7) {
      conflicts.push({
        value1: 'creativity',
        value2: 'stability',
        context: 'Desires both creative freedom and structured environment',
      });
    }

    values.sort((a, b) => b.priority - a.priority);

    const topValues = values.slice(0, 5).map(v => ({
      value: v.value,
      priority: v.priority,
      confidence: Math.min(0.95, 0.6 + (v.evidence.length * 0.1)),
    }));

    const coreMotivation = this.inferCoreMotivation(topValues);

    return {
      topValues,
      valueConflicts: conflicts,
      coreMotivation,
      confidence: topValues.length > 0 ? topValues[0].confidence : 0.5,
    };
  }

  detectContradictions(): Contradiction[] {
    const contradictions: Contradiction[] = [];
    const responses = Object.entries(this.responses);

    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        const [id1, resp1] = responses[i];
        const [id2, resp2] = responses[j];

        if (this.isAutonomyCollaborationContradiction(resp1, resp2)) {
          contradictions.push({
            question1: id1,
            question2: id2,
            responses: [resp1.response, resp2.response],
            severity: 'medium',
            possibleReasons: [
              'Context-dependent preference (solo vs team tasks)',
              'Values both autonomy and collaboration in different situations',
              'Preference for collaborative autonomy',
            ],
            needsClarification: true,
          });
        }

        if (this.isStructureFlexibilityContradiction(resp1, resp2)) {
          contradictions.push({
            question1: id1,
            question2: id2,
            responses: [resp1.response, resp2.response],
            severity: 'medium',
            possibleReasons: [
              'Wants structure for processes but flexibility in approach',
              'Prefers structure in some areas but not others',
              'Values predictable flexibility',
            ],
            needsClarification: true,
          });
        }

        if (this.isPeopleVsTaskContradiction(resp1, resp2)) {
          contradictions.push({
            question1: id1,
            question2: id2,
            responses: [resp1.response, resp2.response],
            severity: 'low',
            possibleReasons: [
              'Enjoys people but prefers task-focused work',
              'Context-dependent (enjoys people in certain roles)',
              'Values both people and productivity',
            ],
            needsClarification: false,
          });
        }
      }
    }

    return contradictions;
  }

  discoverHiddenMotivations(): HiddenMotivation[] {
    const motivations: HiddenMotivation[] = [];
    const patterns = this.detectConsistencyPatterns();
    const intensities = this.analyzePreferenceIntensity();
    const hierarchy = this.detectValueHierarchy();

    const masteryMotivation = this.detectMasteryMotivation(patterns, intensities);
    if (masteryMotivation) motivations.push(masteryMotivation);

    const impactMotivation = this.detectImpactMotivation(patterns, hierarchy);
    if (impactMotivation) motivations.push(impactMotivation);

    const recognitionMotivation = this.detectRecognitionMotivation(patterns);
    if (recognitionMotivation) motivations.push(recognitionMotivation);

    const innovationMotivation = this.detectInnovationMotivation(patterns, intensities);
    if (innovationMotivation) motivations.push(innovationMotivation);

    const connectionMotivation = this.detectConnectionMotivation(patterns, intensities);
    if (connectionMotivation) motivations.push(connectionMotivation);

    return motivations;
  }

  calculateDynamicConfidence(
    insight: DiscoveredInsight,
    allPatterns: ConsistencyPattern[],
    intensities: PreferenceIntensity[],
    hierarchy: ValueHierarchy
  ): number {
    let confidence = insight.confidence;

    const relatedPatterns = allPatterns.filter(p => p.area === insight.area);
    const patternBoost = relatedPatterns.reduce((sum, p) => sum + (p.consistencyScore * 0.1), 0);
    confidence += patternBoost;

    const relatedIntensities = intensities.filter(i => i.area === insight.area && i.intensity === 'strong');
    confidence += relatedIntensities.length * 0.08;

    if (insight.basedOn.length > 3) {
      confidence += Math.min(0.15, (insight.basedOn.length - 3) * 0.03);
    }

    const insightWords = insight.insight.toLowerCase();
    const topValueMatch = hierarchy.topValues.some(v =>
      insightWords.includes(v.value.toLowerCase())
    );
    if (topValueMatch) {
      confidence += 0.1;
    }

    return Math.min(0.98, confidence);
  }

  private groupResponsesByArea(): Record<string, QuestionResponse[]> {
    const grouped: Record<string, QuestionResponse[]> = {};
    for (const response of Object.values(this.responses)) {
      const area = this.inferArea(response.questionId);
      if (!grouped[area]) grouped[area] = [];
      grouped[area].push(response);
    }
    return grouped;
  }

  private inferArea(questionId: string): string {
    const prefix = questionId.split('-')[0];
    const areaMap: Record<string, string> = {
      'ws': 'work-style',
      'pi': 'people-interaction',
      'ps': 'problem-solving',
      'cr': 'creativity',
      'sf': 'structure-flexibility',
      'val': 'values',
      'env': 'environment',
      'lg': 'learning-growth',
    };
    return areaMap[prefix] || 'work-style';
  }

  private detectAutonomyPattern(responses: QuestionResponse[]): { responses: string[]; score: number } | null {
    const autonomyResponses = responses.filter(r =>
      String(r.response).toLowerCase().includes('independ') ||
      String(r.response).toLowerCase().includes('alone') ||
      String(r.response).toLowerCase().includes('autonomous')
    );

    if (autonomyResponses.length >= 2) {
      return {
        responses: autonomyResponses.map(r => String(r.response)),
        score: autonomyResponses.length / responses.length,
      };
    }
    return null;
  }

  private detectCollaborationPattern(responses: QuestionResponse[]): { responses: string[]; score: number } | null {
    const collabResponses = responses.filter(r =>
      String(r.response).toLowerCase().includes('team') ||
      String(r.response).toLowerCase().includes('collaborat') ||
      String(r.response).toLowerCase().includes('together')
    );

    if (collabResponses.length >= 2) {
      return {
        responses: collabResponses.map(r => String(r.response)),
        score: collabResponses.length / responses.length,
      };
    }
    return null;
  }

  private detectStructurePattern(responses: QuestionResponse[]): { responses: string[]; score: number } | null {
    const structureResponses = responses.filter(r =>
      String(r.response).toLowerCase().includes('structure') ||
      String(r.response).toLowerCase().includes('organized') ||
      String(r.response).toLowerCase().includes('plan')
    );

    if (structureResponses.length >= 2) {
      return {
        responses: structureResponses.map(r => String(r.response)),
        score: structureResponses.length / responses.length,
      };
    }
    return null;
  }

  private detectCreativityPattern(responses: QuestionResponse[]): { responses: string[]; score: number } | null {
    const creativityResponses = responses.filter(r =>
      String(r.response).toLowerCase().includes('creativ') ||
      String(r.response).toLowerCase().includes('innovate') ||
      String(r.response).toLowerCase().includes('new')
    );

    if (creativityResponses.length >= 2) {
      return {
        responses: creativityResponses.map(r => String(r.response)),
        score: creativityResponses.length / responses.length,
      };
    }
    return null;
  }

  private calculatePatternConfidence(score: number, totalResponses: number): number {
    const baseConfidence = score * 0.7;
    const volumeBonus = Math.min(0.25, (totalResponses / 10) * 0.25);
    return Math.min(0.95, baseConfidence + volumeBonus);
  }

  private gatherAutonomyEvidence(responses: QuestionResponse[]): string[] {
    return responses
      .filter(r =>
        String(r.response).toLowerCase().includes('independ') ||
        String(r.response).toLowerCase().includes('alone') ||
        String(r.response).toLowerCase().includes('self-directed')
      )
      .map(r => `${r.questionId}: ${String(r.response)}`);
  }

  private gatherPeopleOrientedEvidence(responses: QuestionResponse[]): string[] {
    return responses
      .filter(r =>
        String(r.response).toLowerCase().includes('people') ||
        String(r.response).toLowerCase().includes('help') ||
        String(r.response).toLowerCase().includes('team')
      )
      .map(r => `${r.questionId}: ${String(r.response)}`);
  }

  private gatherProblemSolvingEvidence(responses: QuestionResponse[]): string[] {
    return responses
      .filter(r =>
        String(r.response).toLowerCase().includes('analyz') ||
        String(r.response).toLowerCase().includes('solve') ||
        String(r.response).toLowerCase().includes('logic')
      )
      .map(r => `${r.questionId}: ${String(r.response)}`);
  }

  private gatherLearningEvidence(responses: QuestionResponse[]): string[] {
    return responses
      .filter(r =>
        String(r.response).toLowerCase().includes('learn') ||
        String(r.response).toLowerCase().includes('grow') ||
        String(r.response).toLowerCase().includes('develop')
      )
      .map(r => `${r.questionId}: ${String(r.response)}`);
  }

  private calculateIntensity(evidenceCount: number, totalResponses: number): 'strong' | 'moderate' | 'weak' {
    const ratio = evidenceCount / totalResponses;
    if (ratio >= 0.4) return 'strong';
    if (ratio >= 0.2) return 'moderate';
    return 'weak';
  }

  private assessValue(value: string, responses: QuestionResponse[]): { value: string; priority: number; evidence: string[] } {
    const keywords: Record<string, string[]> = {
      'impact': ['impact', 'difference', 'help', 'change', 'contribute'],
      'autonomy': ['independent', 'autonomous', 'freedom', 'self-directed', 'control'],
      'growth': ['learn', 'grow', 'develop', 'improve', 'progress'],
      'stability': ['stable', 'secure', 'consistent', 'predictable', 'reliable'],
      'creativity': ['creative', 'innovative', 'new', 'original', 'design'],
      'collaboration': ['team', 'together', 'collaborate', 'group', 'cooperative'],
    };

    const evidence: string[] = [];
    let matches = 0;

    for (const response of responses) {
      const responseText = String(response.response).toLowerCase();
      if (keywords[value]?.some(keyword => responseText.includes(keyword))) {
        matches++;
        evidence.push(response.questionId);
      }
    }

    return {
      value,
      priority: Math.min(10, Math.round((matches / responses.length) * 20)),
      evidence,
    };
  }

  private inferCoreMotivation(topValues: Array<{ value: string; priority: number }>): string {
    if (topValues.length === 0) return 'Exploring career direction';

    const top = topValues[0];
    const motivationMap: Record<string, string> = {
      'impact': 'Making a meaningful difference in people\'s lives',
      'autonomy': 'Having control and independence in their work',
      'growth': 'Continuously learning and developing new skills',
      'stability': 'Building a secure and predictable career',
      'creativity': 'Expressing creativity and innovation',
      'collaboration': 'Working with and supporting others',
    };

    return motivationMap[top.value] || 'Building a fulfilling career';
  }

  private isAutonomyCollaborationContradiction(r1: QuestionResponse, r2: QuestionResponse): boolean {
    const r1Text = String(r1.response).toLowerCase();
    const r2Text = String(r2.response).toLowerCase();

    const r1Autonomy = r1Text.includes('independ') || r1Text.includes('alone');
    const r2Collab = r2Text.includes('team') || r2Text.includes('collaborat');

    return (r1Autonomy && r2Collab) || (r2Text.includes('independ') && r1Text.includes('team'));
  }

  private isStructureFlexibilityContradiction(r1: QuestionResponse, r2: QuestionResponse): boolean {
    const r1Text = String(r1.response).toLowerCase();
    const r2Text = String(r2.response).toLowerCase();

    const r1Structure = r1Text.includes('structure') || r1Text.includes('plan');
    const r2Flex = r2Text.includes('flexible') || r2Text.includes('spontaneous');

    return (r1Structure && r2Flex) || (r2Text.includes('structure') && r1Text.includes('flexible'));
  }

  private isPeopleVsTaskContradiction(r1: QuestionResponse, r2: QuestionResponse): boolean {
    const r1Text = String(r1.response).toLowerCase();
    const r2Text = String(r2.response).toLowerCase();

    const r1People = r1Text.includes('people') || r1Text.includes('social');
    const r2Task = r2Text.includes('task') || r2Text.includes('alone');

    return (r1People && r2Task) || (r2Text.includes('people') && r1Text.includes('task'));
  }

  private detectMasteryMotivation(patterns: ConsistencyPattern[], intensities: PreferenceIntensity[]): HiddenMotivation | null {
    const learningIntensity = intensities.find(i => i.preference.includes('learning'));
    const problemSolvingPattern = patterns.find(p => p.theme.includes('problem'));

    if (learningIntensity && learningIntensity.intensity === 'strong') {
      return {
        motivation: 'Mastery and Expertise Development',
        evidence: learningIntensity.evidence,
        relatedAreas: ['learning-growth', 'problem-solving'],
        confidence: learningIntensity.confidence,
        insight: 'Driven by the pursuit of mastery and becoming an expert in their field',
      };
    }

    return null;
  }

  private detectImpactMotivation(patterns: ConsistencyPattern[], hierarchy: ValueHierarchy): HiddenMotivation | null {
    const impactValue = hierarchy.topValues.find(v => v.value === 'impact');

    if (impactValue && impactValue.priority >= 7) {
      return {
        motivation: 'Social Impact and Contribution',
        evidence: ['High priority on making a difference'],
        relatedAreas: ['values', 'people-interaction'],
        confidence: impactValue.confidence,
        insight: 'Deeply motivated by making a positive impact on others and society',
      };
    }

    return null;
  }

  private detectRecognitionMotivation(patterns: ConsistencyPattern[]): HiddenMotivation | null {
    return null;
  }

  private detectInnovationMotivation(patterns: ConsistencyPattern[], intensities: PreferenceIntensity[]): HiddenMotivation | null {
    const creativityPattern = patterns.find(p => p.theme === 'creativity-drive');

    if (creativityPattern && creativityPattern.consistencyScore > 0.5) {
      return {
        motivation: 'Innovation and Creativity',
        evidence: creativityPattern.responses,
        relatedAreas: ['creativity', 'problem-solving'],
        confidence: creativityPattern.confidence,
        insight: 'Strongly motivated by creating new solutions and expressing creativity',
      };
    }

    return null;
  }

  private detectConnectionMotivation(patterns: ConsistencyPattern[], intensities: PreferenceIntensity[]): HiddenMotivation | null {
    const peopleIntensity = intensities.find(i => i.preference.includes('People-oriented'));
    const collabPattern = patterns.find(p => p.theme === 'collaboration-preference');

    if (peopleIntensity && peopleIntensity.intensity === 'strong' && collabPattern) {
      return {
        motivation: 'Human Connection and Relationships',
        evidence: [...peopleIntensity.evidence, ...collabPattern.responses],
        relatedAreas: ['people-interaction', 'work-style'],
        confidence: Math.min(0.9, (peopleIntensity.confidence + collabPattern.confidence) / 2),
        insight: 'Deeply values building relationships and connecting with others in their work',
      };
    }

    return null;
  }
}
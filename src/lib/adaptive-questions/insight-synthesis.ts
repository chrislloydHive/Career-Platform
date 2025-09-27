import { ExplorationArea, AdaptiveQuestion, getQuestionById } from './question-banks';
import { QuestionResponse } from './adaptive-engine';

export interface SynthesizedInsight {
  type: 'cross-domain' | 'paradox' | 'nuanced-preference' | 'conditional-behavior';
  title: string;
  description: string;
  confidence: number;
  sourceAreas: ExplorationArea[];
  basedOn: string[];
  implications: string[];
}

interface ResponsePattern {
  area: ExplorationArea;
  questionId: string;
  response: unknown;
  weight: number;
}

export class InsightSynthesisEngine {
  private responses: Record<string, QuestionResponse>;

  constructor(responses: Record<string, QuestionResponse>) {
    this.responses = responses;
  }

  synthesizeInsights(): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = [];

    insights.push(...this.detectCollaborationPatterns());
    insights.push(...this.detectStructureFlexibilityParadoxes());
    insights.push(...this.detectCreativityExecutionDichotomy());
    insights.push(...this.detectLeadershipStyleNuances());
    insights.push(...this.detectEnvironmentValueAlignment());
    insights.push(...this.detectProblemSolvingCreativitySynergy());
    insights.push(...this.detectAutonomyCollaborationBalance());
    insights.push(...this.detectLearningApplicationPatterns());

    return insights.filter(i => i.confidence >= 0.6).sort((a, b) => b.confidence - a.confidence);
  }

  private detectCollaborationPatterns(): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = [];

    const peopleResponses = this.getResponsesByArea('people-interaction');
    const workStyleResponses = this.getResponsesByArea('work-style');
    const creativityResponses = this.getResponsesByArea('creativity');

    if (peopleResponses.length >= 2 && creativityResponses.length >= 1) {
      const collaborativeCreativity = this.checkPattern(creativityResponses, ['team-brainstorm', 'collaborative']);
      const independentExecution = this.checkPattern(workStyleResponses, ['independent', 'autonomy', 'solo']);

      if (collaborativeCreativity && independentExecution) {
        insights.push({
          type: 'cross-domain',
          title: 'Collaborative Ideation, Independent Execution',
          description: 'You thrive in collaborative brainstorming and creative sessions but prefer to execute and implement ideas independently. This suggests you value diverse input during the conceptual phase but need autonomy during execution.',
          confidence: 0.85,
          sourceAreas: ['creativity', 'work-style', 'people-interaction'],
          basedOn: [...creativityResponses.map(r => r.questionId), ...workStyleResponses.map(r => r.questionId)],
          implications: [
            'Seek roles with strong team collaboration in planning phases',
            'Ensure you have ownership over project execution',
            'Look for environments that balance team input with individual accountability'
          ]
        });
      }

      const independentCreativity = this.checkPattern(creativityResponses, ['alone', 'independent', 'solo']);
      const collaborativeWork = this.checkPattern(peopleResponses, ['team', 'collaborative', 'group']);

      if (independentCreativity && collaborativeWork) {
        insights.push({
          type: 'paradox',
          title: 'Solo Creativity, Team Implementation',
          description: 'You prefer to develop creative ideas independently but enjoy working with others to implement them. This indicates you need quiet time for deep thinking but value team energy for execution.',
          confidence: 0.82,
          sourceAreas: ['creativity', 'people-interaction', 'work-style'],
          basedOn: [...creativityResponses.map(r => r.questionId), ...peopleResponses.map(r => r.questionId)],
          implications: [
            'Request time blocks for individual creative work',
            'Engage teams during implementation and refinement phases',
            'Communicate your creative process needs to collaborators'
          ]
        });
      }
    }

    return insights;
  }

  private detectStructureFlexibilityParadoxes(): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = [];

    const structureResponses = this.getResponsesByArea('structure-flexibility');
    const problemSolvingResponses = this.getResponsesByArea('problem-solving');
    const valueResponses = this.getResponsesByArea('values');

    if (structureResponses.length >= 2 && problemSolvingResponses.length >= 1) {
      const structuredProcess = this.checkPattern(structureResponses, ['structure', 'organized', 'systematic', 'planned']);
      const flexibleOutcomes = this.checkPattern(problemSolvingResponses, ['creative', 'adaptive', 'flexible', 'innovative']);

      if (structuredProcess && flexibleOutcomes) {
        insights.push({
          type: 'nuanced-preference',
          title: 'Structure in Process, Flexibility in Outcomes',
          description: 'You value clear processes and systematic approaches but remain open to diverse outcomes and solutions. This suggests you use structure as a framework for exploration, not restriction.',
          confidence: 0.88,
          sourceAreas: ['structure-flexibility', 'problem-solving'],
          basedOn: [...structureResponses.map(r => r.questionId), ...problemSolvingResponses.map(r => r.questionId)],
          implications: [
            'Seek roles with established methodologies but innovation expectations',
            'You may excel in process improvement and optimization',
            'Consider positions that blend operational excellence with creative problem-solving'
          ]
        });
      }

      const flexibleProcess = this.checkPattern(structureResponses, ['flexible', 'adaptive', 'spontaneous']);
      const structuredOutcomes = this.checkPattern(valueResponses, ['achievement', 'results', 'excellence']);

      if (flexibleProcess && structuredOutcomes) {
        insights.push({
          type: 'nuanced-preference',
          title: 'Flexible Methods, Structured Goals',
          description: 'You prefer adaptable approaches and methods but are driven by clear, structured goals and outcomes. This indicates you value freedom in how you work but need clarity on what you\'re working toward.',
          confidence: 0.84,
          sourceAreas: ['structure-flexibility', 'values', 'problem-solving'],
          basedOn: [...structureResponses.map(r => r.questionId), ...valueResponses.map(r => r.questionId)],
          implications: [
            'Ensure roles have clear objectives but flexible methodologies',
            'You may struggle with both ambiguous goals AND rigid processes',
            'Look for outcome-oriented cultures with process autonomy'
          ]
        });
      }
    }

    return insights;
  }

  private detectCreativityExecutionDichotomy(): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = [];

    const creativityResponses = this.getResponsesByArea('creativity');
    const structureResponses = this.getResponsesByArea('structure-flexibility');
    const problemSolvingResponses = this.getResponsesByArea('problem-solving');

    if (creativityResponses.length >= 2 && structureResponses.length >= 1) {
      const highCreativity = this.checkPattern(creativityResponses, ['innovative', 'creative', 'original', 'novel']);
      const systematicExecution = this.checkPattern(structureResponses, ['organized', 'systematic', 'detailed']);

      if (highCreativity && systematicExecution) {
        insights.push({
          type: 'cross-domain',
          title: 'Creative Vision, Systematic Execution',
          description: 'You combine strong creative and innovative thinking with systematic, organized execution. This rare combination suggests you can both envision novel solutions and methodically bring them to life.',
          confidence: 0.90,
          sourceAreas: ['creativity', 'structure-flexibility', 'problem-solving'],
          basedOn: [...creativityResponses.map(r => r.questionId), ...structureResponses.map(r => r.questionId)],
          implications: [
            'You may excel in innovation-focused roles requiring implementation',
            'Consider product development, creative operations, or innovation management',
            'This skill set is particularly valuable in startup or high-growth environments'
          ]
        });
      }
    }

    return insights;
  }

  private detectLeadershipStyleNuances(): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = [];

    const peopleResponses = this.getResponsesByArea('people-interaction');
    const workStyleResponses = this.getResponsesByArea('work-style');
    const valueResponses = this.getResponsesByArea('values');

    if (peopleResponses.length >= 2 && workStyleResponses.length >= 1) {
      const empoweringOthers = this.checkPattern(peopleResponses, ['mentor', 'support', 'enable', 'guide']);
      const leadsFromBehind = this.checkPattern(workStyleResponses, ['facilitate', 'enable', 'support']);

      if (empoweringOthers && leadsFromBehind) {
        insights.push({
          type: 'cross-domain',
          title: 'Servant Leadership Orientation',
          description: 'You prefer to lead by enabling and empowering others rather than directing. This suggests a facilitative leadership style focused on team growth and autonomy.',
          confidence: 0.83,
          sourceAreas: ['people-interaction', 'work-style', 'values'],
          basedOn: [...peopleResponses.map(r => r.questionId), ...workStyleResponses.map(r => r.questionId)],
          implications: [
            'Seek leadership roles emphasizing coaching and development',
            'You may excel in team lead or manager positions focused on growth',
            'Consider cultures valuing collaborative leadership over command-and-control'
          ]
        });
      }

      const directCommunication = this.checkPattern(peopleResponses, ['direct', 'clear', 'honest']);
      const diplomaticApproach = this.checkPattern(valueResponses, ['harmony', 'relationships', 'empathy']);

      if (directCommunication && diplomaticApproach) {
        insights.push({
          type: 'nuanced-preference',
          title: 'Direct but Diplomatic Communication',
          description: 'You value clear, direct communication while maintaining empathy and relationship harmony. This balance suggests you can deliver tough feedback constructively.',
          confidence: 0.81,
          sourceAreas: ['people-interaction', 'values'],
          basedOn: [...peopleResponses.map(r => r.questionId), ...valueResponses.map(r => r.questionId)],
          implications: [
            'You may excel in roles requiring difficult conversations',
            'Consider positions in HR, management, or client relations',
            'This skill is valuable for conflict resolution and feedback-rich cultures'
          ]
        });
      }
    }

    return insights;
  }

  private detectEnvironmentValueAlignment(): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = [];

    const environmentResponses = this.getResponsesByArea('environment');
    const valueResponses = this.getResponsesByArea('values');
    const workStyleResponses = this.getResponsesByArea('work-style');

    if (environmentResponses.length >= 2 && valueResponses.length >= 2) {
      const dynamicEnvironment = this.checkPattern(environmentResponses, ['fast-paced', 'dynamic', 'changing']);
      const stabilityValue = this.checkPattern(valueResponses, ['security', 'stability', 'predictability']);

      if (dynamicEnvironment && stabilityValue) {
        insights.push({
          type: 'paradox',
          title: 'Craves Dynamic Environment with Stable Foundation',
          description: 'You\'re energized by fast-paced, dynamic work environments but also value underlying stability and security. This suggests you need change within a framework of reliability.',
          confidence: 0.79,
          sourceAreas: ['environment', 'values', 'work-style'],
          basedOn: [...environmentResponses.map(r => r.questionId), ...valueResponses.map(r => r.questionId)],
          implications: [
            'Look for established companies with innovation initiatives',
            'Avoid both rigid bureaucracies and chaotic startups',
            'Seek roles with variety in a stable organizational context'
          ]
        });
      }

      const quietEnvironment = this.checkPattern(environmentResponses, ['quiet', 'focused', 'calm']);
      const collaborationValue = this.checkPattern(valueResponses, ['teamwork', 'collaboration', 'connection']);

      if (quietEnvironment && collaborationValue) {
        insights.push({
          type: 'conditional-behavior',
          title: 'Values Collaboration, Needs Quiet Execution Time',
          description: 'You value teamwork and collaboration but also need quiet, focused time to do your best work. This suggests you thrive in environments with intentional collaboration, not constant interruption.',
          confidence: 0.86,
          sourceAreas: ['environment', 'values', 'work-style'],
          basedOn: [...environmentResponses.map(r => r.questionId), ...valueResponses.map(r => r.questionId)],
          implications: [
            'Advocate for "focus time" blocks in collaborative environments',
            'Consider hybrid work arrangements for balance',
            'Look for teams with strong async communication practices'
          ]
        });
      }
    }

    return insights;
  }

  private detectProblemSolvingCreativitySynergy(): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = [];

    const problemSolvingResponses = this.getResponsesByArea('problem-solving');
    const creativityResponses = this.getResponsesByArea('creativity');
    const learningResponses = this.getResponsesByArea('learning-growth');

    if (problemSolvingResponses.length >= 2 && creativityResponses.length >= 1) {
      const analyticalProblemSolving = this.checkPattern(problemSolvingResponses, ['analytical', 'logical', 'systematic']);
      const creativeApproach = this.checkPattern(creativityResponses, ['creative', 'innovative', 'original']);

      if (analyticalProblemSolving && creativeApproach) {
        insights.push({
          type: 'cross-domain',
          title: 'Analytical Creativity Blend',
          description: 'You combine analytical, logical problem-solving with creative, innovative thinking. This integration suggests you can find novel solutions while ensuring they\'re practical and well-reasoned.',
          confidence: 0.87,
          sourceAreas: ['problem-solving', 'creativity'],
          basedOn: [...problemSolvingResponses.map(r => r.questionId), ...creativityResponses.map(r => r.questionId)],
          implications: [
            'You may excel in strategy, product innovation, or design thinking roles',
            'Consider positions requiring both creativity and business acumen',
            'This combination is valuable in consulting and innovation teams'
          ]
        });
      }

      const intuitiveDecisions = this.checkPattern(problemSolvingResponses, ['intuitive', 'gut', 'instinct']);
      const researchOriented = this.checkPattern(learningResponses, ['research', 'data', 'evidence']);

      if (intuitiveDecisions && researchOriented) {
        insights.push({
          type: 'nuanced-preference',
          title: 'Intuition Informed by Research',
          description: 'You make decisions intuitively but ground your intuition in research and evidence. This suggests your "gut feelings" are actually rapid pattern recognition from deep knowledge.',
          confidence: 0.82,
          sourceAreas: ['problem-solving', 'learning-growth'],
          basedOn: [...problemSolvingResponses.map(r => r.questionId), ...learningResponses.map(r => r.questionId)],
          implications: [
            'You likely develop strong expertise over time',
            'Consider roles valuing both quick decisions and deep knowledge',
            'This approach works well in consulting, advisory, or expert positions'
          ]
        });
      }
    }

    return insights;
  }

  private detectAutonomyCollaborationBalance(): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = [];

    const workStyleResponses = this.getResponsesByArea('work-style');
    const peopleResponses = this.getResponsesByArea('people-interaction');
    const valueResponses = this.getResponsesByArea('values');

    if (workStyleResponses.length >= 2 && peopleResponses.length >= 2) {
      const highAutonomy = this.checkPattern(workStyleResponses, ['independent', 'autonomy', 'self-directed']);
      const valuesConnection = this.checkPattern(valueResponses, ['connection', 'relationships', 'community']);

      if (highAutonomy && valuesConnection) {
        insights.push({
          type: 'nuanced-preference',
          title: 'Independent Worker, Relational Person',
          description: 'You work best independently but deeply value relationships and connection. This suggests you need autonomy in your work structure but connection in your work culture.',
          confidence: 0.85,
          sourceAreas: ['work-style', 'people-interaction', 'values'],
          basedOn: [...workStyleResponses.map(r => r.questionId), ...valueResponses.map(r => r.questionId)],
          implications: [
            'Seek remote-friendly roles with strong team culture',
            'Look for teams that respect boundaries but foster connection',
            'Consider roles with project ownership but collaborative touchpoints'
          ]
        });
      }

      const needsCollaboration = this.checkPattern(peopleResponses, ['team', 'collaborative', 'together']);
      const accountabilityDriven = this.checkPattern(workStyleResponses, ['ownership', 'responsible', 'accountable']);

      if (needsCollaboration && accountabilityDriven) {
        insights.push({
          type: 'cross-domain',
          title: 'Collaborative with Strong Personal Accountability',
          description: 'You thrive in collaborative environments while maintaining strong personal accountability and ownership. This suggests you can work effectively in teams without diffusing responsibility.',
          confidence: 0.84,
          sourceAreas: ['work-style', 'people-interaction'],
          basedOn: [...workStyleResponses.map(r => r.questionId), ...peopleResponses.map(r => r.questionId)],
          implications: [
            'You may excel in team lead or project management roles',
            'Look for cultures with clear individual accountability within teams',
            'Avoid environments where team work obscures individual contributions'
          ]
        });
      }
    }

    return insights;
  }

  private detectLearningApplicationPatterns(): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = [];

    const learningResponses = this.getResponsesByArea('learning-growth');
    const problemSolvingResponses = this.getResponsesByArea('problem-solving');
    const workStyleResponses = this.getResponsesByArea('work-style');

    if (learningResponses.length >= 2 && problemSolvingResponses.length >= 1) {
      const continualLearning = this.checkPattern(learningResponses, ['continuous', 'learning', 'growth', 'development']);
      const practicalApplication = this.checkPattern(problemSolvingResponses, ['practical', 'applied', 'real-world']);

      if (continualLearning && practicalApplication) {
        insights.push({
          type: 'cross-domain',
          title: 'Learning Through Application',
          description: 'You learn best by doing and applying knowledge to real problems. This suggests you value growth opportunities with immediate practical application over theoretical learning.',
          confidence: 0.88,
          sourceAreas: ['learning-growth', 'problem-solving', 'work-style'],
          basedOn: [...learningResponses.map(r => r.questionId), ...problemSolvingResponses.map(r => r.questionId)],
          implications: [
            'Seek roles with challenging projects and learning opportunities',
            'You may struggle with pure training or classroom environments',
            'Look for apprenticeship-style growth and mentorship opportunities'
          ]
        });
      }

      const theoryOriented = this.checkPattern(learningResponses, ['theory', 'conceptual', 'framework']);
      const quickExecution = this.checkPattern(workStyleResponses, ['fast', 'quick', 'rapid', 'agile']);

      if (theoryOriented && quickExecution) {
        insights.push({
          type: 'nuanced-preference',
          title: 'Theoretical Thinker, Fast Executor',
          description: 'You enjoy conceptual and theoretical thinking but move quickly in execution. This suggests you invest time upfront in understanding frameworks, then apply them rapidly.',
          confidence: 0.80,
          sourceAreas: ['learning-growth', 'work-style', 'problem-solving'],
          basedOn: [...learningResponses.map(r => r.questionId), ...workStyleResponses.map(r => r.questionId)],
          implications: [
            'You may excel in consulting or strategic implementation roles',
            'Consider positions requiring framework development and rapid deployment',
            'This approach works well in scaling organizations'
          ]
        });
      }
    }

    return insights;
  }

  private getResponsesByArea(area: ExplorationArea): ResponsePattern[] {
    return Object.entries(this.responses)
      .map(([questionId, response]) => {
        const question = getQuestionById(questionId);
        if (question?.area === area) {
          return {
            area,
            questionId,
            response: response.response,
            weight: response.confidenceLevel === 'certain' ? 1.0 :
                   response.confidenceLevel === 'somewhat-sure' ? 0.7 : 0.4
          };
        }
        return null;
      })
      .filter((p): p is ResponsePattern => p !== null);
  }

  private checkPattern(responses: ResponsePattern[], keywords: string[]): boolean {
    if (responses.length === 0) return false;

    const matches = responses.filter(r => {
      const responseStr = String(r.response).toLowerCase();
      return keywords.some(kw => responseStr.includes(kw.toLowerCase()));
    });

    const totalWeight = responses.reduce((sum, r) => sum + r.weight, 0);
    const matchWeight = matches.reduce((sum, r) => sum + r.weight, 0);

    return matchWeight / totalWeight >= 0.5;
  }
}
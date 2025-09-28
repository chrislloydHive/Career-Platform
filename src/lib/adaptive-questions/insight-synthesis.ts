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
    insights.push(...this.detectFundamentalMotivationDrivers());
    insights.push(...this.detectIdentityCareerAlignment());
    insights.push(...this.detectEnergyAuthenticity());

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
            'Excel as Product Manager leading cross-functional planning with autonomous execution',
            'Thrive in UX Design roles with collaborative research but independent design creation',
            'Consider Software Architect positions balancing team input with technical ownership',
            'Look for Strategy Consultant roles with team brainstorming and client delivery ownership',
            'Avoid micromanaged environments or purely collaborative roles without individual ownership',
            'Seek companies with "collaboration in planning, ownership in execution" cultures'
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
            'Ideal for Creative Director roles with solo ideation and team execution phases',
            'Excel in Research & Development positions with independent exploration and collaborative testing',
            'Consider Content Strategy roles with individual content creation and team distribution',
            'Thrive as Lead Designer with solo conceptual work and team implementation',
            'Look for hybrid remote arrangements allowing focused creative time',
            'Seek agencies or studios that respect the creative process and provide maker time'
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
            'Perfect for Process Innovation Manager roles at established companies',
            'Excel as Solutions Engineer combining systematic approach with creative problem-solving',
            'Thrive in Management Consulting with proven frameworks applied to unique challenges',
            'Consider Operations roles at tech companies balancing efficiency with experimentation',
            'Look for "innovation within guidelines" environments like Google, Microsoft, or IBM',
            'Avoid both chaotic startups and rigid bureaucracies - seek structured innovation cultures'
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
            'Ideal for Chief Technology Officer roles balancing vision with execution discipline',
            'Excel as Product Development Lead turning creative concepts into market reality',
            'Perfect for Innovation Manager positions at corporations launching new initiatives',
            'Consider Creative Operations Director roles systematizing creative processes',
            'Thrive in companies like Apple, Tesla, or design-driven startups that value both creativity and execution',
            'Look for roles requiring both "zero-to-one" thinking and "one-to-scale" implementation'
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
            'Perfect for Engineering Manager roles focused on team growth and technical enablement',
            'Excel as People Manager in consulting firms developing talent while delivering client value',
            'Ideal for Department Head positions at companies prioritizing employee development',
            'Consider Head of Operations roles optimizing systems to empower team performance',
            'Thrive at companies like Atlassian, Buffer, or GitLab with servant leadership cultures',
            'Look for "manager as coach" environments rather than traditional hierarchical structures'
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
            'Perfect for Customer Success Manager roles requiring honest but empathetic client feedback',
            'Excel as HR Business Partner delivering difficult messages while maintaining relationships',
            'Ideal for Technical Program Manager roles navigating stakeholder conflicts with diplomacy',
            'Consider Account Management positions balancing client advocacy with company interests',
            'Thrive in Sales Engineering roles providing honest technical assessments while building trust',
            'Look for companies with "radical candor" cultures like Netflix, Bridgewater, or Ray Dalio-inspired environments'
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
            'Perfect for Innovation roles at Fortune 500 companies with R&D budgets and stable infrastructure',
            'Excel in Product Manager positions at established tech companies launching new features',
            'Ideal for Strategy roles at mature startups (Series B+) with proven business models',
            'Consider Business Development positions at companies expanding into new markets',
            'Thrive at companies like Google, Amazon, or Microsoft with "startup within big company" cultures',
            'Avoid both early-stage startups (too chaotic) and traditional corporations (too rigid)'
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
            'Perfect for Senior Individual Contributor roles in collaborative but respectful environments',
            'Excel as Technical Lead with design collaboration but focused implementation time',
            'Ideal for Research roles requiring both team input and deep individual analysis',
            'Consider remote-first companies like GitLab, Automattic, or Buffer with async-first cultures',
            'Thrive in consulting firms with "heads down" project work balanced with client collaboration',
            'Look for companies with "no meeting days" or protected focus time policies'
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
            'Perfect for Product Strategy roles requiring both creative vision and analytical validation',
            'Excel as Design Researcher combining creative methodology with systematic data analysis',
            'Ideal for Management Consultant positions blending innovative solutions with logical frameworks',
            'Consider Business Intelligence roles turning creative questions into analytical insights',
            'Thrive at companies like McKinsey, IDEO, or Palantir that value both creativity and rigor',
            'Look for "analytical creative" roles in strategy consulting, product development, or innovation labs'
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
            'Perfect for Principal Engineer roles making rapid technical decisions based on deep expertise',
            'Excel as Subject Matter Expert in consulting firms providing quick but well-informed recommendations',
            'Ideal for Senior Analyst positions requiring both rapid market analysis and deep sector knowledge',
            'Consider Advisory roles where expertise enables confident, intuitive guidance',
            'Thrive in environments valuing "experienced gut instinct" over extensive deliberation',
            'Look for senior IC roles at companies like Stripe, Airbnb, or top consulting firms that respect expertise-driven decisions'
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
            'Perfect for Senior Developer roles in remote-first companies with strong async culture',
            'Excel as Independent Consultant with regular client touchpoints but autonomous delivery',
            'Ideal for Technical Writer roles requiring solo deep work with collaborative review cycles',
            'Consider Product Marketing Manager positions with independent campaign development and team coordination',
            'Thrive at companies like Zapier, GitHub, or Basecamp that value both autonomy and connection',
            'Look for hybrid arrangements with "office days" focused on collaboration and "home days" for focused work'
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
            'Perfect for Scrum Master roles balancing team facilitation with personal delivery ownership',
            'Excel as Technical Team Lead with both collaborative planning and individual code contributions',
            'Ideal for Project Manager positions where you own outcomes while enabling team success',
            'Consider Product Owner roles requiring both stakeholder collaboration and personal backlog accountability',
            'Thrive in environments with clear OKRs and individual performance metrics within team goals',
            'Look for companies that celebrate both team wins and individual contributions equally'
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
            'Perfect for Solutions Engineer roles learning new technologies through real client implementations',
            'Excel in Implementation Consultant positions where each project teaches new industry applications',
            'Ideal for Growth Marketing roles experimenting with new channels through live campaign testing',
            'Consider Field Engineer positions where technical learning happens through hands-on problem solving',
            'Thrive at companies like Palantir, Stripe, or consulting firms where learning happens through doing',
            'Avoid training-heavy companies or roles with extensive classroom onboarding without immediate application'
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
            'Perfect for Principal Consultant roles developing methodologies and rapidly implementing them across clients',
            'Excel as Head of Strategy at scaling startups requiring both framework thinking and execution speed',
            'Ideal for Technical Architect positions designing systems with theoretical rigor and rapid prototyping',
            'Consider Chief of Staff roles requiring strategic framework development with fast tactical execution',
            'Thrive at companies like Bain, BCG, or high-growth SaaS companies balancing strategy with speed',
            'Look for "think fast, move fast" cultures that value both depth and velocity'
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

  private detectFundamentalMotivationDrivers(): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = [];
    const valueResponses = this.getResponsesByArea('values');

    const structureNeed = this.responses['cd-1'];
    const clarityDeep = this.responses['cd-2'];

    if (structureNeed?.response === 'uncertainty' && clarityDeep) {
      insights.push({
        type: 'cross-domain',
        title: 'Clarity as Psychological Safety',
        description: 'Your need for structure isn\'t about rigidity - it\'s about needing clear expectations to feel psychologically safe and perform at your best. Without knowing what success looks like, you experience genuine stress that impacts your work quality.',
        confidence: 0.9,
        sourceAreas: ['values', 'work-style'],
        basedOn: ['cd-1', 'cd-2'],
        implications: [
          'This makes you ideal for project management roles where clear expectations drive team performance',
          'Consider companies with structured onboarding and defined success metrics',
          'Excel in consulting firms with established methodologies and client deliverables',
          'Thrive in enterprise software roles with clear user requirements and acceptance criteria',
          'Seek operations roles where processes and outcomes are well-defined',
          'Avoid early-stage startups where role boundaries and success metrics are fluid',
          'Look for managers who provide regular feedback and clear goal-setting',
          'Consider roles like Business Analyst, Program Manager, or Implementation Specialist'
        ]
      });
    }

    const autonomyResponse = this.responses['cd-autonomy'];
    const trustSubResponse = autonomyResponse?.response === 'trust';

    if (trustSubResponse) {
      insights.push({
        type: 'nuanced-preference',
        title: 'Trust and Respect as Core Needs',
        description: 'Your desire for autonomy isn\'t about avoiding oversight - it\'s fundamentally about needing to be trusted and having your judgment respected. Being micromanaged feels like a violation of trust, not just an inconvenience.',
        confidence: 0.88,
        sourceAreas: ['values', 'people-interaction'],
        basedOn: ['cd-autonomy'],
        implications: [
          'Excel in Senior IC roles at companies like Netflix, Spotify, or Shopify with high-trust cultures',
          'Perfect for Principal roles where expertise earns you decision-making authority',
          'Ideal for remote-first companies that hire for outcomes rather than oversight',
          'Consider consulting firms where client results demonstrate your competence and earn autonomy',
          'Avoid micromanagement-heavy industries like traditional finance or highly regulated sectors',
          'Look for managers who ask "What do you need from me?" rather than "What did you do today?"',
          'Thrive in environments where trust is given based on track record, not hierarchy'
        ]
      });
    }

    return insights;
  }

  private detectIdentityCareerAlignment(): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = [];

    const roleModelResponse = this.responses['ci-role-models'];
    const peakExperience = this.responses['pe-2'];

    if (roleModelResponse?.response === 'problem-solvers' && peakExperience) {
      insights.push({
        type: 'cross-domain',
        title: 'Problem-Solver Identity Core',
        description: 'Solving problems isn\'t just what you do - it\'s who you are. Your early identification with problem-solvers reveals that intellectual challenge and analytical work are central to your identity, not just career preferences. Work that doesn\'t challenge your mind will feel empty regardless of other benefits.',
        confidence: 0.92,
        sourceAreas: ['values', 'problem-solving', 'learning-growth'],
        basedOn: ['ci-role-models', 'pe-2'],
        implications: [
          'Perfect for Principal Engineer roles at companies like Google, Facebook, or Stripe tackling complex technical challenges',
          'Excel as Management Consultant solving unique strategic problems for different industries',
          'Ideal for Research Scientist positions at AI labs, pharmaceutical companies, or tech R&D divisions',
          'Consider Founding Engineer roles at startups where every problem is novel and undefined',
          'Thrive in roles like Data Scientist, Solutions Architect, or Technical Product Manager with evolving complexity',
          'Avoid operational roles, routine maintenance work, or highly standardized processes regardless of pay',
          'Look for companies known for hard technical problems: SpaceX, Palantir, DeepMind, or top-tier consulting firms'
        ]
      });
    }

    if (roleModelResponse?.response === 'helpers') {
      insights.push({
        type: 'cross-domain',
        title: 'Service as Identity',
        description: 'Helping others is fundamental to your identity, formed in childhood. This isn\'t a preference you can compromise on - you need to see visible, direct impact on individuals to feel your work matters. Abstract or indirect impact won\'t satisfy this deep need.',
        confidence: 0.9,
        sourceAreas: ['values', 'people-interaction'],
        basedOn: ['ci-role-models'],
        implications: [
          'Perfect for Customer Success roles where you directly solve user problems and receive thank-you messages',
          'Excel as Product Manager for user-facing features where you can see immediate impact on real people',
          'Ideal for roles in education technology, healthcare, or social impact companies with visible beneficiaries',
          'Consider Developer Relations positions helping other developers succeed with direct community feedback',
          'Thrive in customer-facing roles at companies like Zoom, Slack, or educational platforms where users express gratitude',
          'Avoid backend infrastructure, internal tooling, or pure data analysis roles without user connection',
          'Look for companies that share user success stories and celebrate impact on individuals, not just business metrics'
        ]
      });
    }

    if (roleModelResponse?.response === 'creators') {
      insights.push({
        type: 'cross-domain',
        title: 'Maker Identity',
        description: 'You identified early with creators because making and building is core to who you are. You need tangible output - something you can point to and say "I made that." Pure analysis or advising without creation will feel incomplete.',
        confidence: 0.88,
        sourceAreas: ['creativity', 'work-style'],
        basedOn: ['ci-role-models'],
        implications: [
          'Perfect for Full-Stack Developer roles where you build complete features users can interact with',
          'Excel as Product Designer creating interfaces and experiences people use daily',
          'Ideal for Content Creator roles at companies like Medium, Substack, or creative agencies',
          'Consider Founding roles where you build products, companies, or teams from zero to launch',
          'Thrive at maker-friendly companies like GitHub, Figma, or Notion that celebrate creative output',
          'Avoid pure strategy consulting, business analysis, or advisory roles without tangible deliverables',
          'Look for roles where you can point to something and say "I built that" - your portfolio matters more than your title'
        ]
      });
    }

    return insights;
  }

  private detectEnergyAuthenticity(): SynthesizedInsight[] {
    const insights: SynthesizedInsight[] = [];

    const energyDrain = this.responses['ep-2'];
    const energySource = this.responses['ep-1'];
    const aliveResponse = this.responses['ep-3'];

    if (energyDrain?.response === 'social' && energySource) {
      insights.push({
        type: 'conditional-behavior',
        title: 'Introversion is Neurological, Not Preference',
        description: 'Your need for solitude to recharge isn\'t a preference - it\'s how your nervous system works. Constant social interaction genuinely depletes your cognitive resources. High-meeting, always-on cultures will burn you out regardless of how interesting the work is.',
        confidence: 0.93,
        sourceAreas: ['work-style', 'environment', 'people-interaction'],
        basedOn: ['ep-2', 'ep-1'],
        implications: [
          'Perfect for Senior IC roles at companies like Basecamp, Buffer, or GitLab with async-first, low-meeting cultures',
          'Excel in Technical Writing, Software Development, or Research roles requiring deep focused work',
          'Ideal for remote positions with companies that measure output, not hours or meeting attendance',
          'Consider consulting where client work is project-based with natural recharge periods between engagements',
          'Thrive at companies with "No Meeting Fridays" or "Focus Time" policies like Shopify or Atlassian',
          'Absolutely avoid sales, customer success, or client-facing roles requiring constant social interaction',
          'This is neurological, not a preference - prioritize this over salary, title, or other benefits'
        ]
      });
    }

    if (energyDrain?.response === 'constraints') {
      insights.push({
        type: 'nuanced-preference',
        title: 'Creative Freedom as Energy Source',
        description: 'Rigid constraints don\'t just frustrate you - they actively drain your energy because autonomy and creative freedom are fundamental to how you stay motivated. You need the ability to exercise judgment and solve problems your way to maintain engagement.',
        confidence: 0.87,
        sourceAreas: ['work-style', 'creativity', 'values'],
        basedOn: ['ep-2'],
        implications: [
          'Perfect for Senior roles at fast-moving startups like Stripe, Figma, or Notion where you own decisions',
          'Excel in Product roles with outcome ownership but methodology freedom',
          'Ideal for Consulting positions where you design solutions rather than follow prescribed processes',
          'Consider Creative roles at agencies or design studios with creative freedom within client briefs',
          'Thrive at companies known for autonomy like Netflix, Spotify, or GitLab with "context not control" cultures',
          'Avoid traditional banking, government, or heavily regulated industries with rigid approval processes',
          'Look for "how" flexibility even if "what" outcomes are defined - entrepreneurial environments energize you'
        ]
      });
    }

    if (aliveResponse) {
      const aliveText = String(aliveResponse.response).toLowerCase();
      if (aliveText.includes('creat') || aliveText.includes('build') || aliveText.includes('mak')) {
        insights.push({
          type: 'cross-domain',
          title: 'Creation as Vitality Source',
          description: 'You feel most alive when creating. This reveals that creative expression and tangible output aren\'t nice-to-haves - they\'re essential to your vitality and engagement. Work that doesn\'t let you create will leave you feeling depleted and disconnected.',
          confidence: 0.85,
          sourceAreas: ['creativity', 'work-style', 'values'],
          basedOn: ['ep-3'],
          implications: [
            'Perfect for Founding Engineer roles building new products from scratch rather than maintaining legacy systems',
            'Excel in Product Design positions creating new user experiences rather than optimizing existing ones',
            'Ideal for Content Strategy roles developing original campaigns rather than managing existing content',
            'Consider Innovation Manager positions launching new initiatives rather than optimizing current operations',
            'Thrive at companies like Tesla, SpaceX, or cutting-edge startups focused on creation over optimization',
            'Avoid pure DevOps, maintenance engineering, or operational efficiency roles that lack creative expression',
            'Even in analytical roles, seek positions where you create new models, insights, or frameworks rather than run reports'
          ]
        });
      }
    }

    return insights;
  }
}
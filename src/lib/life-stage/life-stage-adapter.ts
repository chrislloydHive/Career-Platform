import { UserProfile } from '@/types/user-profile';
import { AdaptiveQuestion, ExplorationArea } from '../adaptive-questions/question-banks';
import { QuestionResponse } from '../adaptive-questions/adaptive-engine';

export type LifeStage =
  | 'recent-graduate'
  | 'early-career-explorer'
  | 'career-changer'
  | 'mid-career-specialist'
  | 'senior-professional'
  | 'career-returner';

export type TransitionType =
  | 'industry-change'
  | 'function-change'
  | 'role-level-change'
  | 'multiple-field-navigation'
  | 'startup-to-corporate'
  | 'corporate-to-startup';

export interface LifeStageContext {
  stage: LifeStage;
  yearsPostGraduation: number;
  numberOfJobChanges: number;
  numberOfIndustries: number;
  currentTransition?: TransitionType;
  transitionMotivations: string[];
  stabilityScore: number;
  growthOrientation: number;
}

export interface TransitionReadiness {
  overall: number;
  dimensions: {
    skillTransferability: number;
    financialReadiness: number;
    emotionalReadiness: number;
    networkStrength: number;
    industryKnowledge: number;
  };
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export interface CareerStageInsight {
  type: 'motivation' | 'transferability' | 'priority' | 'readiness' | 'challenge';
  insight: string;
  stageSpecific: boolean;
  confidence: number;
  actionable: string[];
}

export class LifeStageAdapter {
  private profile: UserProfile;
  private responses: Record<string, QuestionResponse>;

  constructor(profile: UserProfile, responses: Record<string, QuestionResponse>) {
    this.profile = profile;
    this.responses = responses;
  }

  detectLifeStage(): LifeStageContext {
    const currentYear = new Date().getFullYear();
    const graduationYear = this.profile.education[0]?.graduationYear || currentYear;
    const yearsPostGraduation = currentYear - graduationYear;

    const numberOfJobChanges = this.profile.experience.length;

    const industries = new Set(
      this.profile.experience.map(exp => this.categorizeIndustry(exp.company, exp.title))
    );
    const numberOfIndustries = industries.size;

    const stage = this.determineLifeStage(yearsPostGraduation, numberOfJobChanges, numberOfIndustries);
    const currentTransition = this.detectCurrentTransition();
    const transitionMotivations = this.inferTransitionMotivations();
    const stabilityScore = this.calculateStabilityScore();
    const growthOrientation = this.calculateGrowthOrientation();

    return {
      stage,
      yearsPostGraduation,
      numberOfJobChanges,
      numberOfIndustries,
      currentTransition,
      transitionMotivations,
      stabilityScore,
      growthOrientation,
    };
  }

  private determineLifeStage(
    yearsPostGrad: number,
    jobChanges: number,
    industries: number
  ): LifeStage {
    if (yearsPostGrad <= 2 && industries >= 3) {
      return 'recent-graduate';
    }

    if (yearsPostGrad <= 3 && jobChanges >= 3) {
      return 'early-career-explorer';
    }

    if (industries >= 3 && yearsPostGrad >= 2) {
      return 'career-changer';
    }

    if (yearsPostGrad >= 5 && yearsPostGrad <= 10) {
      return 'mid-career-specialist';
    }

    if (yearsPostGrad > 10) {
      return 'senior-professional';
    }

    return 'early-career-explorer';
  }

  private categorizeIndustry(company: string, title: string): string {
    const healthcareKeywords = ['chiropractic', 'clinic', 'health', 'medical', 'patient'];
    const fitnessKeywords = ['training', 'fitness', 'gym', 'athletic'];
    const retailKeywords = ['lululemon', 'retail', 'merchandising', 'store'];
    const marketingKeywords = ['advertising', 'marketing', 'agency'];

    const allText = `${company} ${title}`.toLowerCase();

    if (healthcareKeywords.some(kw => allText.includes(kw))) return 'healthcare';
    if (fitnessKeywords.some(kw => allText.includes(kw))) return 'fitness';
    if (retailKeywords.some(kw => allText.includes(kw))) return 'retail';
    if (marketingKeywords.some(kw => allText.includes(kw))) return 'marketing';

    return 'other';
  }

  private detectCurrentTransition(): TransitionType | undefined {
    if (this.profile.experience.length < 2) return undefined;

    const recentRole = this.profile.experience[0];
    const previousRole = this.profile.experience[1];

    const recentIndustry = this.categorizeIndustry(recentRole.company, recentRole.title);
    const previousIndustry = this.categorizeIndustry(previousRole.company, previousRole.title);

    const industries = new Set(
      this.profile.experience.map(exp => this.categorizeIndustry(exp.company, exp.title))
    );

    if (industries.size >= 3) {
      return 'multiple-field-navigation';
    }

    if (recentIndustry !== previousIndustry) {
      return 'industry-change';
    }

    const recentFunction = this.categorizeFunction(recentRole.title);
    const previousFunction = this.categorizeFunction(previousRole.title);

    if (recentFunction !== previousFunction) {
      return 'function-change';
    }

    return undefined;
  }

  private categorizeFunction(title: string): string {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('manager') || titleLower.includes('admin')) return 'operations';
    if (titleLower.includes('trainer') || titleLower.includes('educator')) return 'training';
    if (titleLower.includes('marketing')) return 'marketing';
    if (titleLower.includes('visual') || titleLower.includes('merchandis')) return 'creative';
    if (titleLower.includes('intern')) return 'intern';

    return 'other';
  }

  private inferTransitionMotivations(): string[] {
    const motivations: string[] = [];

    const valuesHelping = this.profile.values.some(v => v.toLowerCase().includes('helping'));
    if (valuesHelping) {
      motivations.push('Desire for meaningful impact');
    }

    const seekingGrowth = this.profile.careerPreferences.dealBreakers.some(db =>
      db.toLowerCase().includes('lack of growth')
    );
    if (seekingGrowth) {
      motivations.push('Need for professional development');
    }

    const skillsToGrow = this.profile.careerPreferences.skillsToGrow.length;
    if (skillsToGrow >= 4) {
      motivations.push('Expanding skill set and capabilities');
    }

    const preferredIndustries = this.profile.preferredIndustries;
    const currentIndustry = this.categorizeIndustry(
      this.profile.experience[0].company,
      this.profile.experience[0].title
    );
    const seekingIndustryChange = preferredIndustries.some(ind =>
      !ind.toLowerCase().includes(currentIndustry)
    );
    if (seekingIndustryChange) {
      motivations.push('Exploring different industry fit');
    }

    const diverseExperience = new Set(
      this.profile.experience.map(exp => this.categorizeIndustry(exp.company, exp.title))
    ).size;
    if (diverseExperience >= 3) {
      motivations.push('Finding the right career fit through exploration');
    }

    return motivations;
  }

  private calculateStabilityScore(): number {
    let score = 0.5;

    const currentYear = new Date().getFullYear();
    const graduationYear = this.profile.education[0]?.graduationYear || currentYear;
    const yearsPostGrad = currentYear - graduationYear;

    if (yearsPostGrad > 0) {
      const jobChangesPerYear = this.profile.experience.length / yearsPostGrad;
      score = Math.max(0, 1 - (jobChangesPerYear * 0.3));
    }

    const valuesStability = this.profile.values.some(v =>
      v.toLowerCase().includes('structure') || v.toLowerCase().includes('stability')
    );
    if (valuesStability) {
      score += 0.2;
    }

    const workLifeBalancePriority = this.profile.careerPreferences.workLifeBalance
      .toLowerCase()
      .includes('high priority');
    if (workLifeBalancePriority) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private calculateGrowthOrientation(): number {
    let score = 0.5;

    const skillsToGrow = this.profile.careerPreferences.skillsToGrow.length;
    score += Math.min(skillsToGrow * 0.1, 0.3);

    const growthInGoals = this.profile.careerGoals.some(goal =>
      goal.toLowerCase().includes('growth') || goal.toLowerCase().includes('development')
    );
    if (growthInGoals) {
      score += 0.2;
    }

    const dealBreaker = this.profile.careerPreferences.dealBreakers.some(db =>
      db.toLowerCase().includes('lack of growth')
    );
    if (dealBreaker) {
      score += 0.2;
    }

    const magnaCumLaude = this.profile.education[0]?.honors?.some(h =>
      h.includes('Magna Cum Laude')
    );
    if (magnaCumLaude) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  generateLifeStageQuestions(context: LifeStageContext): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    questions.push(...this.generateCareerChangeMotivationQuestions(context));
    questions.push(...this.generateSkillTransferabilityQuestions(context));
    questions.push(...this.generateGrowthStabilityQuestions(context));
    questions.push(...this.generateTransitionReadinessQuestions(context));

    return questions;
  }

  private generateCareerChangeMotivationQuestions(context: LifeStageContext): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    if (context.stage === 'recent-graduate' || context.stage === 'career-changer') {
      questions.push({
        id: 'ls-motivation-1',
        area: 'values' as ExplorationArea,
        type: 'multiple-choice',
        text: 'You\'ve explored multiple fields (healthcare, fitness, marketing, retail) in the past few years. What\'s driving your exploration?',
        options: [
          {
            value: 'finding-fit',
            label: 'I\'m still figuring out what truly fits me',
            insight: 'Active exploration phase - seeking authentic fit'
          },
          {
            value: 'building-breadth',
            label: 'I want diverse experience before specializing',
            insight: 'Intentional skill-building through varied exposure'
          },
          {
            value: 'following-interests',
            label: 'I\'ve been following my evolving interests',
            insight: 'Interest-driven career navigation'
          },
          {
            value: 'opportunity-driven',
            label: 'I took opportunities as they came',
            insight: 'Opportunistic career building'
          }
        ]
      });

      questions.push({
        id: 'ls-motivation-2',
        area: 'values' as ExplorationArea,
        type: 'scenario',
        text: 'Looking back at your roles in different industries, what consistent thread do you notice in what you enjoyed most?',
        options: [
          {
            value: 'helping-people',
            label: 'Direct impact on individuals (training clients, helping patients)',
            insight: 'Core motivation: helping people through direct service'
          },
          {
            value: 'creating-systems',
            label: 'Building processes and systems (operations, merchandising)',
            insight: 'Core motivation: creating order and efficiency'
          },
          {
            value: 'creative-expression',
            label: 'Creative problem-solving and visual work',
            insight: 'Core motivation: creative and aesthetic contribution'
          },
          {
            value: 'learning-growth',
            label: 'Learning new things and growing my skills',
            insight: 'Core motivation: continuous learning and mastery'
          }
        ]
      });

      questions.push({
        id: 'ls-motivation-3',
        area: 'values' as ExplorationArea,
        type: 'open-ended',
        text: 'Now that you\'ve experienced healthcare operations, fitness training, marketing, and retail - which industry felt most "right" for you, and why?',
      });
    }

    return questions;
  }

  private generateSkillTransferabilityQuestions(context: LifeStageContext): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    if (context.numberOfIndustries >= 2) {
      questions.push({
        id: 'ls-transfer-1',
        area: 'work-style' as ExplorationArea,
        type: 'multiple-choice',
        text: 'When you moved from [previous role] to [current role], which skills transferred most easily?',
        options: [
          {
            value: 'relationship-skills',
            label: 'Building relationships and communication',
            insight: 'Strong interpersonal skill transferability'
          },
          {
            value: 'operational-skills',
            label: 'Operations, processes, and organization',
            insight: 'Strong operational skill transferability'
          },
          {
            value: 'creative-skills',
            label: 'Creative thinking and problem-solving',
            insight: 'Strong creative skill transferability'
          },
          {
            value: 'technical-skills',
            label: 'Technical skills and tools',
            insight: 'Strong technical skill transferability'
          }
        ]
      });

      questions.push({
        id: 'ls-transfer-2',
        area: 'learning-growth' as ExplorationArea,
        type: 'scenario',
        text: 'Which skills from your diverse background (training, operations, marketing, merchandising) do you most want to leverage in your next role?',
        options: [
          {
            value: 'operations-leverage',
            label: 'Operations and systems thinking',
            insight: 'Wants to leverage operational expertise'
          },
          {
            value: 'marketing-leverage',
            label: 'Marketing and communication',
            insight: 'Wants to leverage marketing skills'
          },
          {
            value: 'training-leverage',
            label: 'Teaching and client development',
            insight: 'Wants to leverage education/training skills'
          },
          {
            value: 'creative-leverage',
            label: 'Visual and creative work',
            insight: 'Wants to leverage creative abilities'
          },
          {
            value: 'combination',
            label: 'A combination of multiple skills',
            insight: 'Seeks role integrating diverse skill set'
          }
        ]
      });

      questions.push({
        id: 'ls-transfer-3',
        area: 'problem-solving' as ExplorationArea,
        type: 'open-ended',
        text: 'Can you describe a situation where you successfully applied something you learned in one field (like fitness training) to solve a problem in another field (like healthcare operations)?',
      });
    }

    return questions;
  }

  private generateGrowthStabilityQuestions(context: LifeStageContext): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    questions.push({
      id: 'ls-growth-1',
      area: 'values' as ExplorationArea,
      type: 'scale',
      text: 'At this stage of your career, how do you balance growth opportunity versus stability?',
      options: [
        {
          value: '1',
          label: 'Prioritize stability - I want to establish myself',
          insight: 'Stability-oriented: ready to deepen expertise'
        },
        {
          value: '2',
          label: 'Lean toward stability with some growth',
          insight: 'Moderate stability preference with growth interest'
        },
        {
          value: '3',
          label: 'Balanced - both are equally important',
          insight: 'Balanced growth-stability priorities'
        },
        {
          value: '4',
          label: 'Lean toward growth with some stability',
          insight: 'Growth-oriented with stability awareness'
        },
        {
          value: '5',
          label: 'Prioritize growth - I\'m still exploring and learning',
          insight: 'Growth-oriented: maximizing learning opportunities'
        }
      ]
    });

    questions.push({
      id: 'ls-growth-2',
      area: 'learning-growth' as ExplorationArea,
      type: 'scenario',
      text: 'Two job offers: (A) Familiar role in healthcare operations with clear path. (B) Stretch role in health tech requiring new skills. Which appeals more and why?',
      options: [
        {
          value: 'familiar',
          label: 'Option A - I value leveraging what I know well',
          insight: 'Prefers building on existing strengths'
        },
        {
          value: 'stretch',
          label: 'Option B - I\'m excited to learn something new',
          insight: 'Motivated by learning and growth challenges'
        },
        {
          value: 'context-dependent',
          label: 'It depends on other factors (compensation, team, mission)',
          insight: 'Decision factors beyond growth vs stability'
        }
      ]
    });

    if (context.yearsPostGraduation <= 3) {
      questions.push({
        id: 'ls-growth-3',
        area: 'values' as ExplorationArea,
        type: 'open-ended',
        text: 'As a recent graduate with diverse experience, do you feel pressure to "pick a lane" and specialize? How do you feel about that?',
      });
    }

    return questions;
  }

  private generateTransitionReadinessQuestions(context: LifeStageContext): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    if (context.currentTransition) {
      questions.push({
        id: 'ls-ready-1',
        area: 'work-style' as ExplorationArea,
        type: 'multiple-choice',
        text: 'What makes you feel most ready for a career transition into a new field/role?',
        options: [
          {
            value: 'transferable-skills',
            label: 'I have transferable skills from my diverse background',
            insight: 'Confidence rooted in skill transferability'
          },
          {
            value: 'learning-ability',
            label: 'I\'m a fast learner and can adapt',
            insight: 'Confidence rooted in learning agility'
          },
          {
            value: 'clear-interest',
            label: 'I have a clear sense of what I want',
            insight: 'Confidence rooted in self-knowledge'
          },
          {
            value: 'network',
            label: 'I have connections who can help me',
            insight: 'Confidence rooted in network support'
          }
        ]
      });

      questions.push({
        id: 'ls-ready-2',
        area: 'values' as ExplorationArea,
        type: 'scenario',
        text: 'What concerns you most about making a career transition?',
        options: [
          {
            value: 'starting-over',
            label: 'Starting over and losing progress I\'ve made',
            insight: 'Concern: loss of accumulated experience'
          },
          {
            value: 'skill-gaps',
            label: 'Not having the right skills or credentials',
            insight: 'Concern: qualification adequacy'
          },
          {
            value: 'financial-risk',
            label: 'Financial uncertainty or taking a pay cut',
            insight: 'Concern: financial stability'
          },
          {
            value: 'wrong-choice',
            label: 'Making the wrong choice again',
            insight: 'Concern: decision confidence'
          },
          {
            value: 'not-concerned',
            label: 'I\'m not particularly concerned - transitions are part of growth',
            insight: 'High transition confidence'
          }
        ]
      });

      questions.push({
        id: 'ls-ready-3',
        area: 'learning-growth' as ExplorationArea,
        type: 'open-ended',
        text: 'What preparation or support would help you feel more confident about your next career move?',
      });
    }

    return questions;
  }

  assessTransitionReadiness(context: LifeStageContext): TransitionReadiness {
    const skillTransferability = this.assessSkillTransferability();
    const financialReadiness = this.assessFinancialReadiness();
    const emotionalReadiness = this.assessEmotionalReadiness();
    const networkStrength = this.assessNetworkStrength();
    const industryKnowledge = this.assessIndustryKnowledge();

    const overall = (
      skillTransferability * 0.3 +
      financialReadiness * 0.15 +
      emotionalReadiness * 0.25 +
      networkStrength * 0.15 +
      industryKnowledge * 0.15
    );

    const strengths: string[] = [];
    const gaps: string[] = [];

    if (skillTransferability >= 0.7) {
      strengths.push('Strong transferable skill set from diverse experience');
    } else {
      gaps.push('Need to build more directly relevant skills');
    }

    if (emotionalReadiness >= 0.7) {
      strengths.push('High self-awareness and motivation for change');
    } else {
      gaps.push('Clarify motivations and build transition confidence');
    }

    if (networkStrength < 0.5) {
      gaps.push('Expand professional network in target industry');
    }

    if (industryKnowledge < 0.6) {
      gaps.push('Deepen knowledge of target industry');
    }

    const recommendations = this.generateTransitionRecommendations(
      { skillTransferability, financialReadiness, emotionalReadiness, networkStrength, industryKnowledge },
      gaps
    );

    return {
      overall,
      dimensions: {
        skillTransferability,
        financialReadiness,
        emotionalReadiness,
        networkStrength,
        industryKnowledge,
      },
      strengths,
      gaps,
      recommendations,
    };
  }

  private assessSkillTransferability(): number {
    let score = 0.5;

    const diverseIndustries = new Set(
      this.profile.experience.map(exp => this.categorizeIndustry(exp.company, exp.title))
    ).size;

    if (diverseIndustries >= 3) {
      score += 0.2;
    }

    const hasOperationsExp = this.profile.experience.some(exp =>
      exp.title.toLowerCase().includes('admin') || exp.title.toLowerCase().includes('manager')
    );
    if (hasOperationsExp) score += 0.15;

    const hasMarketingExp = this.profile.skills.some(s => s.toLowerCase().includes('marketing'));
    if (hasMarketingExp) score += 0.15;

    const hasClientFacingExp = this.profile.experience.some(exp =>
      exp.description.some(d =>
        d.toLowerCase().includes('client') ||
        d.toLowerCase().includes('customer') ||
        d.toLowerCase().includes('patient')
      )
    );
    if (hasClientFacingExp) score += 0.1;

    return Math.min(score, 1.0);
  }

  private assessFinancialReadiness(): number {
    let score = 0.5;

    const compensationNote = this.profile.careerPreferences.compensationPriority;
    if (compensationNote.toLowerCase().includes('not the primary driver')) {
      score += 0.3;
    }

    const minimumSalary = compensationNote.match(/\$(\d+)/);
    if (minimumSalary && parseInt(minimumSalary[1]) <= 60) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private assessEmotionalReadiness(): number {
    let score = 0.5;

    const motivationResponse = this.responses['ls-motivation-1'];
    if (motivationResponse) {
      const response = String(motivationResponse.response);
      if (response === 'finding-fit' || response === 'building-breadth') {
        score += 0.2;
      }
    }

    const readinessResponse = this.responses['ls-ready-1'];
    if (readinessResponse) {
      score += 0.15;
    }

    const concernResponse = this.responses['ls-ready-2'];
    if (concernResponse && String(concernResponse.response) === 'not-concerned') {
      score += 0.2;
    }

    const growthOrientation = this.calculateGrowthOrientation();
    score += growthOrientation * 0.15;

    return Math.min(score, 1.0);
  }

  private assessNetworkStrength(): number {
    let score = 0.3;

    const yearsPostGrad = new Date().getFullYear() - (this.profile.education[0]?.graduationYear || new Date().getFullYear());
    score += Math.min(yearsPostGrad * 0.1, 0.3);

    const numberOfEmployers = this.profile.experience.length;
    score += Math.min(numberOfEmployers * 0.08, 0.4);

    return Math.min(score, 1.0);
  }

  private assessIndustryKnowledge(): number {
    let score = 0.4;

    const hasHealthcareExp = this.profile.experience.some(exp =>
      this.categorizeIndustry(exp.company, exp.title) === 'healthcare'
    );
    if (hasHealthcareExp) score += 0.3;

    const targetHealthTech = this.profile.preferredIndustries.some(ind =>
      ind.toLowerCase().includes('health tech') || ind.toLowerCase().includes('digital health')
    );
    if (targetHealthTech && hasHealthcareExp) {
      score += 0.2;
    }

    const hasWellnessExp = this.profile.experience.some(exp =>
      this.categorizeIndustry(exp.company, exp.title) === 'fitness'
    );
    if (hasWellnessExp) score += 0.1;

    return Math.min(score, 1.0);
  }

  private generateTransitionRecommendations(
    dimensions: { [key: string]: number },
    gaps: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (dimensions.skillTransferability < 0.6) {
      recommendations.push('Take online courses to build directly relevant skills for target roles');
      recommendations.push('Create portfolio projects that demonstrate skills in new context');
    }

    if (dimensions.networkStrength < 0.5) {
      recommendations.push('Attend health tech meetups and conferences');
      recommendations.push('Conduct 10+ informational interviews with people in target roles');
      recommendations.push('Join online communities for health tech professionals');
    }

    if (dimensions.industryKnowledge < 0.6) {
      recommendations.push('Research 20+ companies in target industry');
      recommendations.push('Subscribe to industry newsletters and podcasts');
      recommendations.push('Try 10+ products/apps in target space and critique them');
    }

    if (dimensions.emotionalReadiness < 0.7) {
      recommendations.push('Work with career coach to clarify transition goals');
      recommendations.push('Create detailed 90-day transition plan');
    }

    if (recommendations.length === 0) {
      recommendations.push('You\'re well-positioned for transition - focus on applying and networking');
    }

    return recommendations;
  }

  generateCareerStageInsights(context: LifeStageContext): CareerStageInsight[] {
    const insights: CareerStageInsight[] = [];

    insights.push(...this.generateMotivationInsights(context));
    insights.push(...this.generateTransferabilityInsights(context));
    insights.push(...this.generatePriorityInsights(context));
    insights.push(...this.generateReadinessInsights(context));
    insights.push(...this.generateChallengeInsights(context));

    return insights;
  }

  private generateMotivationInsights(context: LifeStageContext): CareerStageInsight[] {
    const insights: CareerStageInsight[] = [];

    if (context.stage === 'recent-graduate' || context.stage === 'career-changer') {
      const motivationResponse = this.responses['ls-motivation-1'];
      if (motivationResponse) {
        const response = String(motivationResponse.response);

        if (response === 'finding-fit') {
          insights.push({
            type: 'motivation',
            insight: 'You\'re in active exploration mode, which is healthy at this stage. Your diverse experience (healthcare, fitness, marketing) is helping you understand what truly fits.',
            stageSpecific: true,
            confidence: 0.85,
            actionable: [
              'Continue exploration but start identifying patterns in what you enjoy',
              'Track what energizes vs drains you in each role',
              'By year 3 post-grad, begin narrowing to 1-2 focus areas'
            ]
          });
        }

        if (response === 'building-breadth') {
          insights.push({
            type: 'motivation',
            insight: 'Intentional skill-building through varied experience shows strategic thinking. You\'re building a valuable T-shaped profile.',
            stageSpecific: true,
            confidence: 0.8,
            actionable: [
              'Start identifying your "vertical" - the deep expertise you want',
              'Articulate how diverse experience creates unique value',
              'Plan next role to either deepen expertise or add final breadth piece'
            ]
          });
        }
      }

      const threadResponse = this.responses['ls-motivation-2'];
      if (threadResponse) {
        const thread = String(threadResponse.response);

        insights.push({
          type: 'motivation',
          insight: `Your consistent thread across roles is "${thread}". This is your career anchor - the non-negotiable that should guide future decisions.`,
          stageSpecific: true,
          confidence: 0.9,
          actionable: [
            `Explicitly look for roles that maximize ${thread}`,
            'Use this as filter when evaluating opportunities',
            'In interviews, ask how role delivers on this motivation'
          ]
        });
      }
    }

    return insights;
  }

  private generateTransferabilityInsights(context: LifeStageContext): CareerStageInsight[] {
    const insights: CareerStageInsight[] = [];

    if (context.numberOfIndustries >= 2) {
      const transferResponse = this.responses['ls-transfer-2'];
      if (transferResponse) {
        const leverage = String(transferResponse.response);

        if (leverage === 'combination') {
          insights.push({
            type: 'transferability',
            insight: 'Your desire to integrate multiple skills (operations + marketing + training) points toward roles like Product Management, Strategy, or Customer Success that value generalists.',
            stageSpecific: true,
            confidence: 0.85,
            actionable: [
              'Research Product Manager roles in health tech - perfect for multi-skilled backgrounds',
              'Emphasize your ability to bridge functions in resume/interviews',
              'Seek "glue" roles that connect multiple departments'
            ]
          });
        }
      }

      insights.push({
        type: 'transferability',
        insight: `Your diverse background (${context.numberOfIndustries} industries) is an asset, not a liability. The key is articulating the through-line that makes it coherent.`,
        stageSpecific: true,
        confidence: 0.8,
        actionable: [
          'Craft a narrative: "I explored healthcare, fitness, and retail to understand how businesses help people"',
          'Position diversity as strategic exploration, not job-hopping',
          'Target roles that value cross-functional experience'
        ]
      });
    }

    return insights;
  }

  private generatePriorityInsights(context: LifeStageContext): CareerStageInsight[] {
    const insights: CareerStageInsight[] = [];

    const growthResponse = this.responses['ls-growth-1'];
    if (growthResponse) {
      const scale = String(growthResponse.response);

      if (scale === '5' || scale === '4') {
        insights.push({
          type: 'priority',
          insight: `At ${context.yearsPostGraduation} years post-grad, your growth orientation is appropriate. This is the time to maximize learning, even if it means some instability.`,
          stageSpecific: true,
          confidence: 0.85,
          actionable: [
            'Prioritize learning opportunities over compensation (within reason)',
            'Seek roles that will stretch you technically or strategically',
            'Plan to establish stability around year 5 when expertise deepens'
          ]
        });
      }

      if (scale === '1' || scale === '2') {
        insights.push({
          type: 'priority',
          insight: `You're seeking stability after ${context.numberOfJobChanges} role changes. This suggests you're ready to go deeper rather than broader.`,
          stageSpecific: true,
          confidence: 0.8,
          actionable: [
            'Choose next role carefully - aim for 2+ year commitment',
            'Look for clear growth path within one company',
            'Prioritize company stability and clear career ladder'
          ]
        });
      }
    }

    return insights;
  }

  private generateReadinessInsights(context: LifeStageContext): CareerStageInsight[] {
    const insights: CareerStageInsight[] = [];

    const readiness = this.assessTransitionReadiness(context);

    if (readiness.overall >= 0.7) {
      insights.push({
        type: 'readiness',
        insight: `You're highly ready for career transition (${(readiness.overall * 100).toFixed(0)}% readiness score). Your diverse background and growth orientation position you well.`,
        stageSpecific: true,
        confidence: 0.9,
        actionable: [
          'Start actively applying to target roles',
          'Leverage your strengths: ' + readiness.strengths[0],
          'Network aggressively - you have the foundation'
        ]
      });
    } else if (readiness.overall >= 0.5) {
      insights.push({
        type: 'readiness',
        insight: `You're moderately ready for transition (${(readiness.overall * 100).toFixed(0)}% readiness). Address key gaps before major move.`,
        stageSpecific: true,
        confidence: 0.8,
        actionable: readiness.recommendations.slice(0, 3)
      });
    } else {
      insights.push({
        type: 'readiness',
        insight: `You're building readiness for transition (${(readiness.overall * 100).toFixed(0)}% readiness). Focus on preparation before jumping.`,
        stageSpecific: true,
        confidence: 0.85,
        actionable: readiness.recommendations
      });
    }

    return insights;
  }

  private generateChallengeInsights(context: LifeStageContext): CareerStageInsight[] {
    const insights: CareerStageInsight[] = [];

    if (context.stage === 'recent-graduate' || context.stage === 'career-changer') {
      insights.push({
        type: 'challenge',
        insight: 'Common challenge for recent grads with diverse experience: "Am I a generalist or specialist?" The answer: You\'re building toward T-shaped expertise.',
        stageSpecific: true,
        confidence: 0.8,
        actionable: [
          'Accept that specialization comes after exploration (years 3-5)',
          'Start identifying your vertical: what you want to be known for',
          'Frame diverse experience as "building foundation for specialized expertise"'
        ]
      });

      if (context.numberOfJobChanges >= 3) {
        insights.push({
          type: 'challenge',
          insight: `${context.numberOfJobChanges} role changes in ${context.yearsPostGraduation} years may raise employer questions. Prepare a compelling narrative.`,
          stageSpecific: true,
          confidence: 0.75,
          actionable: [
            'Story: "I explored to find the right fit, and now I\'m ready to commit to [target field]"',
            'Emphasize patterns and growth across roles',
            'Show how each role built specific skills for target career',
            'Next role should be 2+ year commitment to show stability'
          ]
        });
      }
    }

    return insights;
  }
}
import { QuestionResponse } from '../adaptive-questions/adaptive-engine';
import { UserProfile } from '@/types/user-profile';
import { StrengthProfile, ValidatedStrength } from '../strengths/strength-validation';
import { MotivationInsight } from '../adaptive-questions/motivation-archaeology';
import { CareerInteraction } from '../adaptive-questions/interaction-tracker';

export type TimeHorizon = 'immediate' | '1-year' | '3-year' | '5-year' | '10-year';

export type SatisfactionDimension =
  | 'intellectual-fulfillment'
  | 'work-life-balance'
  | 'growth-opportunity'
  | 'financial-security'
  | 'impact-meaning'
  | 'autonomy-flexibility'
  | 'social-connection'
  | 'mastery-achievement';

export interface SatisfactionPrediction {
  dimension: SatisfactionDimension;
  currentScore: number;
  projectedScore: Record<TimeHorizon, number>;
  confidence: number;
  reasoning: string;
  trajectory: 'increasing' | 'stable' | 'decreasing' | 'uncertain';
  keyFactors: string[];
}

export interface GrowthArea {
  skill: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  potentialLevel: 'intermediate' | 'advanced' | 'expert' | 'mastery';
  timeToAchieve: TimeHorizon;
  importance: 'critical' | 'high' | 'medium' | 'low';
  developmentPath: string[];
  naturalAptitude: number;
  effort: number;
}

export interface Challenge {
  type: 'skill-gap' | 'preference-mismatch' | 'value-tension' | 'growth-ceiling' | 'lifestyle-constraint';
  description: string;
  likelihood: number;
  severity: 'high' | 'medium' | 'low';
  timeframe: TimeHorizon;
  mitigation: string[];
  opportunityInChallenge?: string;
}

export interface SkillDevelopmentRecommendation {
  skill: string;
  priority: 'immediate' | 'short-term' | 'long-term';
  reasoning: string;
  currentGap: number;
  futureDemand: number;
  alignmentWithStrengths: number;
  learningPath: {
    phase: string;
    duration: string;
    activities: string[];
    milestones: string[];
  }[];
  resources: string[];
  quickWins: string[];
}

export interface WorkEnvironmentEvolution {
  dimension: 'structure' | 'autonomy' | 'collaboration' | 'pace' | 'complexity' | 'impact-scope';
  currentPreference: string;
  projectedEvolution: {
    timeHorizon: TimeHorizon;
    preference: string;
    reason: string;
  }[];
  flexibility: number;
  adaptationNeeded: string[];
}

export interface FutureSelfProjection {
  careerSatisfaction: {
    overall: Record<TimeHorizon, number>;
    dimensions: SatisfactionPrediction[];
    peakSatisfactionPeriod: TimeHorizon;
    riskPeriods: TimeHorizon[];
  };
  growthAreas: GrowthArea[];
  challenges: Challenge[];
  skillDevelopment: SkillDevelopmentRecommendation[];
  workEnvironmentEvolution: WorkEnvironmentEvolution[];
  idealCareerPath: {
    timeHorizon: TimeHorizon;
    role: string;
    reasoning: string;
    preparationNeeded: string[];
  }[];
  confidence: number;
  assumptions: string[];
}

export class FutureSelfProjector {
  private responses: Record<string, QuestionResponse>;
  private userProfile: UserProfile;
  private strengthProfile: StrengthProfile | null;
  private motivationInsights: MotivationInsight[];
  private interactions: CareerInteraction[];

  constructor(
    responses: Record<string, QuestionResponse>,
    userProfile: UserProfile,
    strengthProfile: StrengthProfile | null,
    motivationInsights: MotivationInsight[],
    interactions: CareerInteraction[]
  ) {
    this.responses = responses;
    this.userProfile = userProfile;
    this.strengthProfile = strengthProfile;
    this.motivationInsights = motivationInsights;
    this.interactions = interactions;
  }

  projectFutureSelf(): FutureSelfProjection {
    const satisfactionPredictions = this.predictCareerSatisfaction();
    const growthAreas = this.identifyGrowthAreas();
    const challenges = this.identifyChallenges();
    const skillRecommendations = this.generateSkillDevelopmentRecommendations();
    const environmentEvolution = this.modelWorkEnvironmentEvolution();
    const careerPath = this.projectIdealCareerPath();

    const overallSatisfaction = this.calculateOverallSatisfaction(satisfactionPredictions);

    return {
      careerSatisfaction: {
        overall: overallSatisfaction,
        dimensions: satisfactionPredictions,
        peakSatisfactionPeriod: this.identifyPeakPeriod(overallSatisfaction),
        riskPeriods: this.identifyRiskPeriods(overallSatisfaction),
      },
      growthAreas,
      challenges,
      skillDevelopment: skillRecommendations,
      workEnvironmentEvolution: environmentEvolution,
      idealCareerPath: careerPath,
      confidence: this.calculateProjectionConfidence(),
      assumptions: this.documentAssumptions(),
    };
  }

  private predictCareerSatisfaction(): SatisfactionPrediction[] {
    const predictions: SatisfactionPrediction[] = [];

    predictions.push(this.predictIntellectualFulfillment());
    predictions.push(this.predictWorkLifeBalance());
    predictions.push(this.predictGrowthOpportunity());
    predictions.push(this.predictFinancialSecurity());
    predictions.push(this.predictImpactMeaning());
    predictions.push(this.predictAutonomyFlexibility());
    predictions.push(this.predictSocialConnection());
    predictions.push(this.predictMasteryAchievement());

    return predictions;
  }

  private predictIntellectualFulfillment(): SatisfactionPrediction {
    let currentScore = 0.6;
    const keyFactors: string[] = [];

    const magnaCumLaude = this.userProfile.education.some(edu =>
      edu.honors?.some(h => h.includes('Magna Cum Laude'))
    );
    if (magnaCumLaude) {
      currentScore += 0.15;
      keyFactors.push('Academic excellence suggests high intellectual needs');
    }

    const problemSolvingStrength = this.strengthProfile?.validated.some(s =>
      s.name.toLowerCase().includes('problem-solving') || s.name.toLowerCase().includes('strategic')
    );
    if (problemSolvingStrength) {
      currentScore += 0.1;
      keyFactors.push('Problem-solving strength indicates need for intellectual challenge');
    }

    const currentRole = this.userProfile.experience[0];
    const isIntellectuallyEngaging = currentRole.title.toLowerCase().includes('manager') ||
                                      currentRole.description.some(d => d.toLowerCase().includes('strategic'));
    if (!isIntellectuallyEngaging) {
      currentScore -= 0.2;
      keyFactors.push('Current role may lack strategic/intellectual depth');
    }

    const projectedScore: Record<TimeHorizon, number> = {
      'immediate': currentScore,
      '1-year': currentScore + 0.1,
      '3-year': currentScore + 0.25,
      '5-year': currentScore + 0.35,
      '10-year': Math.min(currentScore + 0.4, 1.0),
    };

    return {
      dimension: 'intellectual-fulfillment',
      currentScore: Math.max(0, Math.min(1, currentScore)),
      projectedScore,
      confidence: 0.75,
      reasoning: 'Your academic excellence and strategic thinking suggest high intellectual needs. As you move from operational roles into strategy/product roles, intellectual satisfaction will increase significantly.',
      trajectory: 'increasing',
      keyFactors,
    };
  }

  private predictWorkLifeBalance(): SatisfactionPrediction {
    const currentScore = 0.7;
    const keyFactors: string[] = [];

    const workLifeBalanceValue = this.userProfile.values.some(v =>
      v.toLowerCase().includes('work-life balance')
    );
    if (workLifeBalanceValue) {
      keyFactors.push('Work-life balance is a core value');
    }

    const divisionOneAthlete = this.userProfile.strengths.some(s =>
      s.toLowerCase().includes('division i')
    );
    if (divisionOneAthlete) {
      keyFactors.push('Athletic discipline suggests ability to maintain boundaries');
    }

    const preferredHours = this.userProfile.careerPreferences.workLifeBalance;
    if (preferredHours.toLowerCase().includes('40-45')) {
      keyFactors.push('Clear preference for sustainable hours');
    }

    const projectedScore: Record<TimeHorizon, number> = {
      'immediate': currentScore,
      '1-year': currentScore - 0.1,
      '3-year': currentScore - 0.05,
      '5-year': currentScore + 0.1,
      '10-year': currentScore + 0.15,
    };

    return {
      dimension: 'work-life-balance',
      currentScore: Math.max(0, Math.min(1, currentScore)),
      projectedScore,
      confidence: 0.8,
      reasoning: 'You prioritize work-life balance, which is excellent. Early career growth may temporarily challenge this (1-3 years), but established expertise will restore and enhance balance.',
      trajectory: 'stable',
      keyFactors,
    };
  }

  private predictGrowthOpportunity(): SatisfactionPrediction {
    let currentScore = 0.5;
    const keyFactors: string[] = [];

    const skillsToGrow = this.userProfile.careerPreferences.skillsToGrow;
    if (skillsToGrow.length >= 4) {
      keyFactors.push('Strong motivation to develop new skills');
      currentScore += 0.1;
    }

    const emergingStrengths = this.strengthProfile?.emerging.length || 0;
    if (emergingStrengths > 0) {
      keyFactors.push(`${emergingStrengths} emerging strengths show growth potential`);
    }

    const yearsSinceGraduation = new Date().getFullYear() - 2023;
    if (yearsSinceGraduation < 3) {
      currentScore += 0.15;
      keyFactors.push('Early career stage = high growth opportunity');
    }

    const projectedScore: Record<TimeHorizon, number> = {
      'immediate': currentScore,
      '1-year': currentScore + 0.25,
      '3-year': currentScore + 0.35,
      '5-year': currentScore + 0.25,
      '10-year': currentScore + 0.15,
    };

    return {
      dimension: 'growth-opportunity',
      currentScore: Math.max(0, Math.min(1, currentScore)),
      projectedScore,
      confidence: 0.85,
      reasoning: 'Growth opportunity peaks in years 1-5 as you transition from operations to strategy roles. Your diverse experience + strong learning drive = rapid skill development.',
      trajectory: 'increasing',
      keyFactors,
    };
  }

  private predictFinancialSecurity(): SatisfactionPrediction {
    const currentScore = 0.55;
    const keyFactors: string[] = [];

    const compensationPref = this.userProfile.careerPreferences.compensationPriority;
    if (compensationPref.toLowerCase().includes('not the primary driver')) {
      keyFactors.push('Money is important but not primary motivator');
    }

    const minimumSalary = compensationPref.match(/\$(\d+)/);
    if (minimumSalary && parseInt(minimumSalary[1]) >= 55) {
      keyFactors.push('Clear minimum threshold suggests financial awareness');
    }

    const projectedScore: Record<TimeHorizon, number> = {
      'immediate': currentScore,
      '1-year': currentScore + 0.1,
      '3-year': currentScore + 0.25,
      '5-year': currentScore + 0.35,
      '10-year': currentScore + 0.4,
    };

    return {
      dimension: 'financial-security',
      currentScore: Math.max(0, Math.min(1, currentScore)),
      projectedScore,
      confidence: 0.7,
      reasoning: 'Financial security will steadily improve as you move into higher-value roles (Product/Strategy). Your balanced approach to compensation suggests you won\'t sacrifice fulfillment for money.',
      trajectory: 'increasing',
      keyFactors,
    };
  }

  private predictImpactMeaning(): SatisfactionPrediction {
    let currentScore = 0.75;
    const keyFactors: string[] = [];

    const helpingValue = this.userProfile.values.some(v =>
      v.toLowerCase().includes('helping people')
    );
    if (helpingValue) {
      currentScore += 0.15;
      keyFactors.push('Deep need to help people and make impact');
    }

    const wellnessExperience = this.userProfile.experience.some(exp =>
      exp.title.toLowerCase().includes('trainer') ||
      exp.description.some(d => d.toLowerCase().includes('wellbeing') || d.toLowerCase().includes('health'))
    );
    if (wellnessExperience) {
      keyFactors.push('Direct impact experience in wellness roles');
    }

    const currentlyInHealthcare = this.userProfile.experience[0].company.toLowerCase().includes('chiropractic');
    if (currentlyInHealthcare) {
      keyFactors.push('Currently making direct health impact');
    }

    const projectedScore: Record<TimeHorizon, number> = {
      'immediate': Math.min(currentScore, 0.9),
      '1-year': Math.min(currentScore - 0.1, 0.9),
      '3-year': Math.min(currentScore + 0.05, 0.95),
      '5-year': Math.min(currentScore + 0.1, 0.95),
      '10-year': Math.min(currentScore + 0.15, 1.0),
    };

    return {
      dimension: 'impact-meaning',
      currentScore: Math.max(0, Math.min(1, currentScore)),
      projectedScore,
      confidence: 0.9,
      reasoning: 'Impact/meaning is your core driver. May temporarily dip as you transition to less direct-impact roles (e.g., product strategy), but will amplify as you realize your work affects thousands vs dozens.',
      trajectory: 'stable',
      keyFactors,
    };
  }

  private predictAutonomyFlexibility(): SatisfactionPrediction {
    let currentScore = 0.6;
    const keyFactors: string[] = [];

    const autonomyValue = this.userProfile.careerPreferences.dealBreakers.some(db =>
      db.toLowerCase().includes('limited autonomy')
    );
    if (autonomyValue) {
      currentScore += 0.1;
      keyFactors.push('Limited autonomy is a dealbreaker');
    }

    const remotePreference = this.userProfile.preferredLocations.some(loc =>
      loc.toLowerCase().includes('remote')
    );
    if (remotePreference) {
      keyFactors.push('Remote work preference indicates flexibility need');
    }

    const projectedScore: Record<TimeHorizon, number> = {
      'immediate': currentScore,
      '1-year': currentScore - 0.05,
      '3-year': currentScore + 0.15,
      '5-year': currentScore + 0.25,
      '10-year': currentScore + 0.35,
    };

    return {
      dimension: 'autonomy-flexibility',
      currentScore: Math.max(0, Math.min(1, currentScore)),
      projectedScore,
      confidence: 0.75,
      reasoning: 'Autonomy will increase as you build expertise and trust. Early roles may have more oversight, but your strategic thinking + track record will earn you significant freedom by year 3-5.',
      trajectory: 'increasing',
      keyFactors,
    };
  }

  private predictSocialConnection(): SatisfactionPrediction {
    let currentScore = 0.7;
    const keyFactors: string[] = [];

    const relationshipStrength = this.strengthProfile?.validated.some(s =>
      s.name.toLowerCase().includes('relationship')
    );
    if (relationshipStrength) {
      currentScore += 0.15;
      keyFactors.push('Relationship building is a core strength');
    }

    const collaborativeEnvironment = this.userProfile.careerPreferences.workEnvironment.some(env =>
      env.toLowerCase().includes('collaborative')
    );
    if (collaborativeEnvironment) {
      keyFactors.push('Values collaborative team environment');
    }

    const projectedScore: Record<TimeHorizon, number> = {
      'immediate': currentScore,
      '1-year': currentScore,
      '3-year': currentScore + 0.05,
      '5-year': currentScore + 0.1,
      '10-year': currentScore + 0.15,
    };

    return {
      dimension: 'social-connection',
      currentScore: Math.max(0, Math.min(1, currentScore)),
      projectedScore,
      confidence: 0.8,
      reasoning: 'Your relationship-building strength means social connection will remain high. As you move into leadership, you\'ll build deeper professional relationships and mentor others.',
      trajectory: 'stable',
      keyFactors,
    };
  }

  private predictMasteryAchievement(): SatisfactionPrediction {
    let currentScore = 0.65;
    const keyFactors: string[] = [];

    const achievementOrientation = this.userProfile.strengths.some(s =>
      s.toLowerCase().includes('athlete')
    );
    if (achievementOrientation) {
      currentScore += 0.15;
      keyFactors.push('Athletic background shows achievement orientation');
    }

    const academicHonors = this.userProfile.education[0].honors?.length || 0;
    if (academicHonors >= 6) {
      keyFactors.push('Multiple academic honors show mastery drive');
    }

    const projectedScore: Record<TimeHorizon, number> = {
      'immediate': currentScore,
      '1-year': currentScore + 0.05,
      '3-year': currentScore + 0.2,
      '5-year': currentScore + 0.25,
      '10-year': currentScore + 0.3,
    };

    return {
      dimension: 'mastery-achievement',
      currentScore: Math.max(0, Math.min(1, currentScore)),
      projectedScore,
      confidence: 0.85,
      reasoning: 'Your athletic discipline + academic excellence show strong mastery drive. As you develop deep expertise in health tech/product, you\'ll experience increasing mastery satisfaction.',
      trajectory: 'increasing',
      keyFactors,
    };
  }

  private identifyGrowthAreas(): GrowthArea[] {
    const growthAreas: GrowthArea[] = [];

    const skillsToGrow = this.userProfile.careerPreferences.skillsToGrow;

    for (const skill of skillsToGrow) {
      const naturalAptitude = this.assessNaturalAptitude(skill);
      const currentLevel = this.inferCurrentLevel(skill);
      const potentialLevel = this.inferPotentialLevel(currentLevel, naturalAptitude);
      const importance = this.assessSkillImportance(skill);

      growthAreas.push({
        skill,
        currentLevel,
        potentialLevel,
        timeToAchieve: this.estimateTimeToAchieve(currentLevel, potentialLevel, naturalAptitude),
        importance,
        developmentPath: this.createDevelopmentPath(skill),
        naturalAptitude,
        effort: this.calculateRequiredEffort(currentLevel, potentialLevel, naturalAptitude),
      });
    }

    return growthAreas.sort((a, b) => {
      const importanceWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return (importanceWeight[b.importance] * b.naturalAptitude) - (importanceWeight[a.importance] * a.naturalAptitude);
    });
  }

  private assessNaturalAptitude(skill: string): number {
    let aptitude = 0.5;

    const relatedStrengths = this.strengthProfile?.validated.filter(s =>
      this.skillRelatedToStrength(skill, s)
    ) || [];

    if (relatedStrengths.length > 0) {
      const avgConfidence = relatedStrengths.reduce((sum, s) => sum + s.confidence, 0) / relatedStrengths.length;
      aptitude += avgConfidence * 0.3;
    }

    if (this.userProfile.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
      aptitude += 0.2;
    }

    return Math.min(aptitude, 1.0);
  }

  private skillRelatedToStrength(skill: string, strength: ValidatedStrength): boolean {
    const skillLower = skill.toLowerCase();
    const strengthLower = strength.name.toLowerCase();

    if (strengthLower.includes(skillLower) || skillLower.includes(strengthLower)) {
      return true;
    }

    const mappings: Record<string, string[]> = {
      'digital marketing': ['marketing', 'creative', 'communication'],
      'analytics': ['analytical', 'problem-solving', 'strategic'],
      'health technology': ['technical', 'health', 'wellness'],
      'strategic planning': ['strategic', 'organizational', 'leadership'],
      'data-driven': ['analytical', 'problem-solving'],
      'leadership': ['leadership', 'interpersonal', 'communication'],
    };

    for (const [key, categories] of Object.entries(mappings)) {
      if (skillLower.includes(key.toLowerCase())) {
        return categories.some(cat => strengthLower.includes(cat));
      }
    }

    return false;
  }

  private inferCurrentLevel(skill: string): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    const hasSkill = this.userProfile.skills.some(s =>
      s.toLowerCase().includes(skill.toLowerCase())
    );

    if (hasSkill) {
      const yearsExperience = this.estimateYearsOfExperience(skill);
      if (yearsExperience >= 5) return 'advanced';
      if (yearsExperience >= 2) return 'intermediate';
      return 'intermediate';
    }

    const relatedExperience = this.userProfile.experience.some(exp =>
      exp.description.some(d => d.toLowerCase().includes(skill.toLowerCase()))
    );

    return relatedExperience ? 'beginner' : 'beginner';
  }

  private estimateYearsOfExperience(skill: string): number {
    let years = 0;

    for (const exp of this.userProfile.experience) {
      const startYear = parseInt(exp.startDate.split(' ')[1] || new Date().getFullYear().toString());
      const endYear = exp.endDate ? parseInt(exp.endDate.split(' ')[1]) : new Date().getFullYear();
      const duration = endYear - startYear;

      const isRelevant = exp.skills?.some(s => s.toLowerCase().includes(skill.toLowerCase())) ||
                         exp.description.some(d => d.toLowerCase().includes(skill.toLowerCase()));

      if (isRelevant) {
        years += duration;
      }
    }

    return years;
  }

  private inferPotentialLevel(
    currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert',
    naturalAptitude: number
  ): 'intermediate' | 'advanced' | 'expert' | 'mastery' {
    if (naturalAptitude >= 0.8) {
      if (currentLevel === 'expert') return 'mastery';
      if (currentLevel === 'advanced') return 'mastery';
      return 'expert';
    }

    if (naturalAptitude >= 0.6) {
      if (currentLevel === 'advanced') return 'expert';
      if (currentLevel === 'intermediate') return 'expert';
      return 'advanced';
    }

    if (currentLevel === 'beginner') return 'intermediate';
    if (currentLevel === 'intermediate') return 'advanced';
    return 'expert';
  }

  private estimateTimeToAchieve(
    currentLevel: string,
    potentialLevel: string,
    naturalAptitude: number
  ): TimeHorizon {
    const levelGap = this.calculateLevelGap(currentLevel, potentialLevel);
    const aptitudeMultiplier = 1 / Math.max(naturalAptitude, 0.3);

    const baseTime = levelGap * aptitudeMultiplier;

    if (baseTime <= 1) return '1-year';
    if (baseTime <= 3) return '3-year';
    if (baseTime <= 5) return '5-year';
    return '10-year';
  }

  private calculateLevelGap(current: string, potential: string): number {
    const levels = ['beginner', 'intermediate', 'advanced', 'expert', 'mastery'];
    const currentIndex = levels.indexOf(current);
    const potentialIndex = levels.indexOf(potential);
    return potentialIndex - currentIndex;
  }

  private assessSkillImportance(skill: string): 'critical' | 'high' | 'medium' | 'low' {
    const skillLower = skill.toLowerCase();

    const careerGoals = this.userProfile.careerGoals.join(' ').toLowerCase();

    if (careerGoals.includes(skillLower)) {
      return 'critical';
    }

    const criticalSkills = ['digital marketing', 'health technology', 'strategic planning', 'data-driven'];
    if (criticalSkills.some(cs => skillLower.includes(cs))) {
      return 'high';
    }

    return 'medium';
  }

  private createDevelopmentPath(
    skill: string
  ): string[] {
    const skillPaths: Record<string, string[]> = {
      'digital marketing': [
        'Master social media algorithms and analytics',
        'Learn A/B testing and conversion optimization',
        'Develop content strategy and SEO skills',
        'Understand marketing automation platforms',
        'Build data-driven campaign management expertise'
      ],
      'analytics': [
        'Learn Excel/Google Sheets advanced functions',
        'Master data visualization (Tableau, Looker)',
        'Understand statistical analysis basics',
        'Develop SQL and database querying skills',
        'Learn predictive analytics and modeling'
      ],
      'health technology': [
        'Understand digital health ecosystem and regulations',
        'Learn health data standards (FHIR, HL7)',
        'Explore telemedicine and patient platforms',
        'Study healthcare workflows and pain points',
        'Develop health product management skills'
      ],
      'strategic planning': [
        'Learn strategic frameworks (SWOT, Porter\'s Five Forces)',
        'Develop business case and ROI analysis skills',
        'Master roadmapping and prioritization',
        'Understand competitive analysis',
        'Build stakeholder management expertise'
      ],
      'leadership': [
        'Develop active listening and empathy',
        'Learn delegation and team management',
        'Master difficult conversations and feedback',
        'Understand motivational techniques',
        'Build vision-setting and communication skills'
      ],
    };

    for (const [key, steps] of Object.entries(skillPaths)) {
      if (skill.toLowerCase().includes(key.toLowerCase())) {
        return steps;
      }
    }

    return [
      `Build foundational knowledge in ${skill}`,
      `Practice ${skill} in real-world projects`,
      `Seek mentorship from ${skill} experts`,
      `Earn credentials or certifications`,
      `Teach others and establish expertise`
    ];
  }

  private calculateRequiredEffort(
    currentLevel: string,
    potentialLevel: string,
    naturalAptitude: number
  ): number {
    const levelGap = this.calculateLevelGap(currentLevel, potentialLevel);
    const baseEffort = levelGap * 0.25;
    const aptitudeAdjustment = (1 - naturalAptitude) * 0.3;
    return Math.min(baseEffort + aptitudeAdjustment, 1.0);
  }

  private identifyChallenges(): Challenge[] {
    const challenges: Challenge[] = [];

    challenges.push(...this.identifySkillGapChallenges());
    challenges.push(...this.identifyPreferenceMismatchChallenges());
    challenges.push(...this.identifyValueTensionChallenges());
    challenges.push(...this.identifyGrowthCeilingChallenges());
    challenges.push(...this.identifyLifestyleConstraintChallenges());

    return challenges.sort((a, b) => {
      const severityWeight = { high: 3, medium: 2, low: 1 };
      return (severityWeight[b.severity] * b.likelihood) - (severityWeight[a.severity] * a.likelihood);
    });
  }

  private identifySkillGapChallenges(): Challenge[] {
    const challenges: Challenge[] = [];

    const technicalSkills = this.userProfile.careerPreferences.skillsToGrow.filter(skill =>
      skill.toLowerCase().includes('tech') || skill.toLowerCase().includes('data')
    );

    if (technicalSkills.length > 0) {
      challenges.push({
        type: 'skill-gap',
        description: 'Technical skill development may feel daunting coming from marketing/operations background',
        likelihood: 0.7,
        severity: 'medium',
        timeframe: '1-year',
        mitigation: [
          'Start with user-friendly tools (no-code platforms)',
          'Take structured online courses with guided projects',
          'Find a technical mentor or learning buddy',
          'Focus on understanding concepts before tools'
        ],
        opportunityInChallenge: 'Cross-functional thinking (business + tech) is highly valuable in product roles',
      });
    }

    return challenges;
  }

  private identifyPreferenceMismatchChallenges(): Challenge[] {
    const challenges: Challenge[] = [];

    const valuesStructure = this.userProfile.values.some(v => v.toLowerCase().includes('structure'));
    const wantsGrowth = this.userProfile.careerPreferences.dealBreakers.some(db =>
      db.toLowerCase().includes('lack of growth')
    );

    if (valuesStructure && wantsGrowth) {
      challenges.push({
        type: 'preference-mismatch',
        description: 'High-growth opportunities often come with ambiguity and changing priorities, which may conflict with your need for structure',
        likelihood: 0.6,
        severity: 'medium',
        timeframe: '1-year',
        mitigation: [
          'Look for scale-ups (not early startups) with some processes',
          'Seek roles where you can build the structure',
          'Develop frameworks for managing ambiguity',
          'Set personal structure within flexible environments'
        ],
        opportunityInChallenge: 'Your ability to create order from chaos is valuable - use it as a differentiator',
      });
    }

    return challenges;
  }

  private identifyValueTensionChallenges(): Challenge[] {
    const challenges: Challenge[] = [];

    const impactDriven = this.userProfile.values.some(v => v.toLowerCase().includes('helping people'));
    const strategyInterested = this.userProfile.careerPreferences.skillsToGrow.some(s =>
      s.toLowerCase().includes('strategic')
    );

    if (impactDriven && strategyInterested) {
      challenges.push({
        type: 'value-tension',
        description: 'Moving from direct-impact roles (training, healthcare) to strategy may feel less fulfilling initially',
        likelihood: 0.65,
        severity: 'medium',
        timeframe: '1-year',
        mitigation: [
          'Track downstream impact metrics (users helped)',
          'Maintain volunteer or side work with direct impact',
          'Reframe: strategy allows you to help more people at scale',
          'Choose products with clear mission alignment'
        ],
        opportunityInChallenge: 'Realizing your decisions affect thousands vs dozens can be deeply fulfilling',
      });
    }

    return challenges;
  }

  private identifyGrowthCeilingChallenges(): Challenge[] {
    const challenges: Challenge[] = [];

    const locationConstrained = this.userProfile.preferredLocations.some(loc =>
      loc.toLowerCase().includes('spokane')
    );

    if (locationConstrained) {
      challenges.push({
        type: 'growth-ceiling',
        description: 'Smaller market (Spokane) may limit access to advanced product/strategy roles',
        likelihood: 0.55,
        severity: 'medium',
        timeframe: '3-year',
        mitigation: [
          'Leverage remote opportunities (health tech is very remote-friendly)',
          'Consider hybrid roles with occasional travel',
          'Build online presence and network nationally',
          'Look for remote-first companies with Spokane-area presence'
        ],
        opportunityInChallenge: 'Remote work in health tech is now standard - location is less limiting',
      });
    }

    return challenges;
  }

  private identifyLifestyleConstraintChallenges(): Challenge[] {
    const challenges: Challenge[] = [];

    const workLifeBalancePriority = this.userProfile.careerPreferences.workLifeBalance.toLowerCase().includes('high priority');

    if (workLifeBalancePriority) {
      challenges.push({
        type: 'lifestyle-constraint',
        description: 'Building expertise and advancing into leadership may temporarily require longer hours',
        likelihood: 0.5,
        severity: 'low',
        timeframe: '1-year',
        mitigation: [
          'Set clear boundaries and communicate them early',
          'Choose companies with balance-friendly cultures',
          'Front-load learning in dedicated sprints',
          'Use efficiency from structure preference to work smarter'
        ],
        opportunityInChallenge: 'Your discipline from athletics means you\'re efficient - can achieve more in fewer hours',
      });
    }

    return challenges;
  }

  private generateSkillDevelopmentRecommendations(): SkillDevelopmentRecommendation[] {
    const recommendations: SkillDevelopmentRecommendation[] = [];

    const skillsToGrow = this.userProfile.careerPreferences.skillsToGrow;

    for (const skill of skillsToGrow) {
      const currentGap = this.assessCurrentGap(skill);
      const futureDemand = this.assessFutureDemand(skill);
      const strengthAlignment = this.assessStrengthAlignment(skill);
      const priority = this.determinePriority(currentGap, futureDemand, strengthAlignment);

      recommendations.push({
        skill,
        priority,
        reasoning: this.explainPriority(skill, currentGap, futureDemand, strengthAlignment),
        currentGap,
        futureDemand,
        alignmentWithStrengths: strengthAlignment,
        learningPath: this.buildLearningPath(skill, priority),
        resources: this.suggestResources(skill),
        quickWins: this.identifyQuickWins(skill),
      });
    }

    return recommendations.sort((a, b) => {
      const priorityWeight = { immediate: 3, 'short-term': 2, 'long-term': 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  }

  private assessCurrentGap(skill: string): number {
    const currentLevel = this.inferCurrentLevel(skill);
    const levelValues = { beginner: 0.25, intermediate: 0.5, advanced: 0.75, expert: 1.0 };
    return 1 - levelValues[currentLevel];
  }

  private assessFutureDemand(skill: string): number {
    const highDemandSkills = ['digital marketing', 'health technology', 'data-driven', 'strategic planning', 'data analysis'];
    const skillLower = skill.toLowerCase();

    for (const highDemand of highDemandSkills) {
      if (skillLower.includes(highDemand.toLowerCase())) {
        return 0.9;
      }
    }

    return 0.6;
  }

  private assessStrengthAlignment(skill: string): number {
    return this.assessNaturalAptitude(skill);
  }

  private determinePriority(
    currentGap: number,
    futureDemand: number,
    strengthAlignment: number
  ): 'immediate' | 'short-term' | 'long-term' {
    const score = (currentGap * 0.3) + (futureDemand * 0.4) + (strengthAlignment * 0.3);

    if (score >= 0.7) return 'immediate';
    if (score >= 0.5) return 'short-term';
    return 'long-term';
  }

  private explainPriority(
    skill: string,
    currentGap: number,
    futureDemand: number,
    strengthAlignment: number
  ): string {
    const reasons: string[] = [];

    if (currentGap > 0.6) {
      reasons.push('significant current gap');
    }

    if (futureDemand > 0.8) {
      reasons.push('high future demand in target roles');
    }

    if (strengthAlignment > 0.7) {
      reasons.push('strong natural aptitude');
    }

    if (reasons.length === 0) {
      return `${skill} is valuable for your career growth`;
    }

    return `Prioritize ${skill} due to ${reasons.join(', ')}`;
  }

  private buildLearningPath(
    skill: string,
    priority: 'immediate' | 'short-term' | 'long-term'
  ): { phase: string; duration: string; activities: string[]; milestones: string[] }[] {
    const developmentSteps = this.createDevelopmentPath(skill);

    if (priority === 'immediate') {
      return [
        {
          phase: 'Foundation (Months 1-2)',
          duration: '2 months',
          activities: [developmentSteps[0], 'Take online course or bootcamp', 'Complete 2-3 small practice projects'],
          milestones: ['Understand core concepts', 'Complete certification or course', 'Build portfolio piece']
        },
        {
          phase: 'Application (Months 3-6)',
          duration: '4 months',
          activities: [developmentSteps[1], 'Apply in current role', 'Seek stretch project'],
          milestones: ['Use skill in real work context', 'Get feedback from expert', 'Document measurable results']
        },
        {
          phase: 'Mastery (Months 7-12)',
          duration: '6 months',
          activities: [developmentSteps[2], 'Teach others or create content', 'Lead skill-based initiative'],
          milestones: ['Recognized as go-to person', 'Mentor others', 'Include in resume/LinkedIn']
        }
      ];
    }

    return [
      {
        phase: 'Exploration',
        duration: '3-6 months',
        activities: [developmentSteps[0], 'Read books and articles', 'Take introductory course'],
        milestones: ['Understand landscape', 'Identify specific focus area']
      },
      {
        phase: 'Development',
        duration: '6-12 months',
        activities: [developmentSteps[1], developmentSteps[2], 'Practice in side projects'],
        milestones: ['Develop working proficiency', 'Apply in professional context']
      }
    ];
  }

  private suggestResources(skill: string): string[] {
    const resourceMap: Record<string, string[]> = {
      'digital marketing': [
        'Google Digital Marketing & E-commerce Certificate',
        'HubSpot Content Marketing Certification',
        'Meta Blueprint Certifications',
        'Reforge Growth Series'
      ],
      'analytics': [
        'Google Data Analytics Certificate',
        'Tableau Desktop Specialist Certification',
        'Mode SQL Tutorial',
        'Storytelling with Data book by Cole Nussbaumer Knaflic'
      ],
      'health technology': [
        'Digital Health 101 course (Stanford)',
        'Rock Health Digital Health Consumer Adoption Report',
        'Health IT certifications (CAHIMS)',
        'Healthcare Information and Management Systems Society (HIMSS) resources'
      ],
      'strategic planning': [
        'Good Strategy Bad Strategy by Richard Rumelt',
        'Playing to Win by A.G. Lafley',
        'Reforge Product Strategy course',
        'Harvard Business Review Strategy articles'
      ],
      'leadership': [
        'The Manager\'s Path by Camille Fournier',
        'Radical Candor by Kim Scott',
        'First Round Review Leadership articles',
        'Executive coaching or leadership program'
      ],
    };

    for (const [key, resources] of Object.entries(resourceMap)) {
      if (skill.toLowerCase().includes(key.toLowerCase())) {
        return resources;
      }
    }

    return [
      `Search for top-rated courses on ${skill} on Coursera/Udemy`,
      `Find ${skill} communities on LinkedIn or Slack`,
      `Read recent books on ${skill}`,
      `Follow ${skill} thought leaders on Twitter/LinkedIn`
    ];
  }

  private identifyQuickWins(skill: string): string[] {
    const quickWinMap: Record<string, string[]> = {
      'digital marketing': [
        'Set up Google Analytics on a website and learn to read reports',
        'Create a content calendar for social media',
        'Run a small A/B test on email subject lines'
      ],
      'analytics': [
        'Build a dashboard in Google Sheets with charts',
        'Complete a SQL tutorial and query a practice database',
        'Analyze your own social media or website metrics'
      ],
      'health technology': [
        'Research 10 digital health companies and their products',
        'Try 3-5 health apps and critique their UX',
        'Read case studies from Rock Health or CB Insights'
      ],
      'strategic planning': [
        'Create a personal SWOT analysis',
        'Map out your career strategy with 1/3/5 year goals',
        'Analyze a competitor for your current company'
      ],
      'leadership': [
        'Shadow a leader for a day and take notes',
        'Lead a small project or initiative',
        'Practice giving structured feedback to a peer'
      ],
    };

    for (const [key, wins] of Object.entries(quickWinMap)) {
      if (skill.toLowerCase().includes(key.toLowerCase())) {
        return wins;
      }
    }

    return [
      `Find a free online resource about ${skill} and complete it this week`,
      `Identify someone in your network who excels at ${skill} and ask for coffee chat`,
      `Apply ${skill} to a small personal or work project`
    ];
  }

  private modelWorkEnvironmentEvolution(): WorkEnvironmentEvolution[] {
    const evolutions: WorkEnvironmentEvolution[] = [];

    evolutions.push(this.modelStructureEvolution());
    evolutions.push(this.modelAutonomyEvolution());
    evolutions.push(this.modelCollaborationEvolution());
    evolutions.push(this.modelPaceEvolution());
    evolutions.push(this.modelComplexityEvolution());
    evolutions.push(this.modelImpactScopeEvolution());

    return evolutions;
  }

  private modelStructureEvolution(): WorkEnvironmentEvolution {
    const valuesStructure = this.userProfile.values.some(v => v.toLowerCase().includes('structure'));

    return {
      dimension: 'structure',
      currentPreference: valuesStructure
        ? 'High structure: Clear processes, defined roles, predictable workflows'
        : 'Moderate structure: Some frameworks with flexibility',
      projectedEvolution: [
        {
          timeHorizon: 'immediate',
          preference: 'High structure with clear expectations',
          reason: 'Need stability while building foundational skills'
        },
        {
          timeHorizon: '1-year',
          preference: 'Moderate-high structure with room for initiative',
          reason: 'Growing confidence allows for some ambiguity'
        },
        {
          timeHorizon: '3-year',
          preference: 'Moderate structure: You define frameworks',
          reason: 'Expertise enables you to create structure rather than need it'
        },
        {
          timeHorizon: '5-year',
          preference: 'Lower structure need: Comfortable with ambiguity',
          reason: 'Senior roles require building structure for others'
        }
      ],
      flexibility: 0.7,
      adaptationNeeded: [
        'Gradually take on projects with less definition',
        'Practice comfort with ambiguity in controlled settings',
        'Shift from "I need structure" to "I create structure"'
      ],
    };
  }

  private modelAutonomyEvolution(): WorkEnvironmentEvolution {
    return {
      dimension: 'autonomy',
      currentPreference: 'Moderate autonomy with guidance available',
      projectedEvolution: [
        {
          timeHorizon: 'immediate',
          preference: 'Guided autonomy: Freedom within guardrails',
          reason: 'Building expertise requires mentorship'
        },
        {
          timeHorizon: '3-year',
          preference: 'High autonomy: Own decisions and initiatives',
          reason: 'Track record and expertise earn trust'
        },
        {
          timeHorizon: '5-year',
          preference: 'Strategic autonomy: Set direction for team/product',
          reason: 'Leadership role requires vision-setting freedom'
        }
      ],
      flexibility: 0.8,
      adaptationNeeded: [
        'Build confidence in decision-making through small bets',
        'Document your reasoning to justify autonomous decisions',
        'Seek feedback to calibrate judgment'
      ],
    };
  }

  private modelCollaborationEvolution(): WorkEnvironmentEvolution {
    const collaborativePreference = this.userProfile.careerPreferences.workEnvironment.some(env =>
      env.toLowerCase().includes('collaborative')
    );

    return {
      dimension: 'collaboration',
      currentPreference: collaborativePreference
        ? 'High collaboration: Team-based work and shared goals'
        : 'Balanced collaboration',
      projectedEvolution: [
        {
          timeHorizon: 'immediate',
          preference: 'High collaboration: Learn from team',
          reason: 'Collaborative learning accelerates growth'
        },
        {
          timeHorizon: '3-year',
          preference: 'Strategic collaboration: Lead cross-functional initiatives',
          reason: 'Senior roles involve orchestrating teams'
        },
        {
          timeHorizon: '5-year',
          preference: 'Executive collaboration: Partner with leadership',
          reason: 'Strategy roles require stakeholder management'
        }
      ],
      flexibility: 0.9,
      adaptationNeeded: [
        'Maintain strong collaboration skills',
        'Develop ability to influence without authority',
        'Build executive communication skills'
      ],
    };
  }

  private modelPaceEvolution(): WorkEnvironmentEvolution {
    return {
      dimension: 'pace',
      currentPreference: 'Sustainable pace: Consistent effort without burnout',
      projectedEvolution: [
        {
          timeHorizon: '1-year',
          preference: 'Moderate-fast pace: Learning mode may feel intense',
          reason: 'Skill development requires concentrated effort'
        },
        {
          timeHorizon: '3-year',
          preference: 'Sustainable pace: Efficiency from expertise',
          reason: 'Mastery allows you to work smarter, not harder'
        },
        {
          timeHorizon: '5-year',
          preference: 'Variable pace: Sprint when needed, sustainable baseline',
          reason: 'Leadership requires adaptability and strategic intensity'
        }
      ],
      flexibility: 0.75,
      adaptationNeeded: [
        'Build stamina for short-term intensity',
        'Leverage your athletic discipline for focus sprints',
        'Maintain non-negotiable recovery practices'
      ],
    };
  }

  private modelComplexityEvolution(): WorkEnvironmentEvolution {
    return {
      dimension: 'complexity',
      currentPreference: 'Moderate complexity: Clear problems with defined solutions',
      projectedEvolution: [
        {
          timeHorizon: 'immediate',
          preference: 'Moderate complexity: Structured learning opportunities',
          reason: 'Building mental models for complex problem-solving'
        },
        {
          timeHorizon: '3-year',
          preference: 'High complexity: Ambiguous problems requiring creativity',
          reason: 'Strategic thinking strength enables complex work'
        },
        {
          timeHorizon: '5-year',
          preference: 'Very high complexity: Multi-stakeholder, strategic decisions',
          reason: 'Senior roles involve systems-level thinking'
        }
      ],
      flexibility: 0.8,
      adaptationNeeded: [
        'Practice breaking complex problems into manageable parts',
        'Develop frameworks for navigating ambiguity',
        'Build tolerance for incomplete information'
      ],
    };
  }

  private modelImpactScopeEvolution(): WorkEnvironmentEvolution {
    const helpingValue = this.userProfile.values.some(v => v.toLowerCase().includes('helping'));

    return {
      dimension: 'impact-scope',
      currentPreference: helpingValue
        ? 'Direct impact: See how your work helps individuals'
        : 'Measurable impact',
      projectedEvolution: [
        {
          timeHorizon: 'immediate',
          preference: 'Direct impact: 1-on-1 or small group influence',
          reason: 'Personal connection provides meaning'
        },
        {
          timeHorizon: '1-year',
          preference: 'Team impact: Help 10-50 people through product/strategy',
          reason: 'Moving to scaled impact feels uncertain'
        },
        {
          timeHorizon: '3-year',
          preference: 'Scaled impact: Thousands of users benefit from your work',
          reason: 'Realization: leverage amplifies your helping motivation'
        },
        {
          timeHorizon: '5-year',
          preference: 'Strategic impact: Shape industry or organizational direction',
          reason: 'Leadership enables systemic change at scale'
        }
      ],
      flexibility: 0.85,
      adaptationNeeded: [
        'Reframe "helping people" as both direct and indirect',
        'Track downstream impact metrics',
        'Maintain some direct impact through mentoring or volunteering'
      ],
    };
  }

  private projectIdealCareerPath(): {
    timeHorizon: TimeHorizon;
    role: string;
    reasoning: string;
    preparationNeeded: string[];
  }[] {
    return [
      {
        timeHorizon: 'immediate',
        role: 'Marketing Coordinator / Operations Specialist (Health Tech)',
        reasoning: 'Leverage your current marketing + operations skills while learning the health tech space. Gets you into the industry.',
        preparationNeeded: [
          'Research health tech companies (digital health, telemedicine, wellness platforms)',
          'Update resume to emphasize healthcare + marketing experience',
          'Network with health tech professionals on LinkedIn',
          'Complete Google Digital Marketing or HubSpot certifications'
        ]
      },
      {
        timeHorizon: '1-year',
        role: 'Product Marketing Manager or Customer Success Manager (Health Tech)',
        reasoning: 'Bridge role that uses your relationship skills + marketing background while building product understanding.',
        preparationNeeded: [
          'Take customer discovery and user research courses',
          'Build case studies of your marketing impact',
          'Learn product management fundamentals',
          'Develop analytics and data storytelling skills'
        ]
      },
      {
        timeHorizon: '3-year',
        role: 'Associate Product Manager or Strategy & Operations Lead (Health Tech)',
        reasoning: 'Your operations experience + strategic thinking + customer empathy = strong PM foundation. By year 3, you\'ve proven product thinking.',
        preparationNeeded: [
          'Ship product features or lead cross-functional projects',
          'Master data-driven decision making',
          'Build portfolio of product work',
          'Develop technical fluency (not coding, but understanding systems)'
        ]
      },
      {
        timeHorizon: '5-year',
        role: 'Product Manager or Strategy Lead (Wellness/Digital Health)',
        reasoning: 'Own a product or strategic initiative. Combine all your skills: operations, marketing, user empathy, strategic thinking.',
        preparationNeeded: [
          'Lead successful product launches',
          'Build executive communication skills',
          'Develop vision-setting and strategy skills',
          'Establish thought leadership in wellness tech space'
        ]
      },
      {
        timeHorizon: '10-year',
        role: 'Senior Product Manager, Director of Product, or VP of Strategy (Health Tech)',
        reasoning: 'Leadership role where you shape product strategy, mentor teams, and drive organizational impact at scale.',
        preparationNeeded: [
          'Build track record of successful products and teams',
          'Develop organizational and political savvy',
          'Mentor and develop other PMs',
          'Contribute to industry through speaking, writing, or advising'
        ]
      }
    ];
  }

  private calculateOverallSatisfaction(predictions: SatisfactionPrediction[]): Record<TimeHorizon, number> {
    const timeHorizons: TimeHorizon[] = ['immediate', '1-year', '3-year', '5-year', '10-year'];
    const overall: Record<TimeHorizon, number> = {} as Record<TimeHorizon, number>;

    for (const horizon of timeHorizons) {
      const scores = predictions.map(p => p.projectedScore[horizon]);
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      overall[horizon] = Math.max(0, Math.min(1, avgScore));
    }

    return overall;
  }

  private identifyPeakPeriod(overallSatisfaction: Record<TimeHorizon, number>): TimeHorizon {
    let peakHorizon: TimeHorizon = 'immediate';
    let peakScore = 0;

    for (const [horizon, score] of Object.entries(overallSatisfaction)) {
      if (score > peakScore) {
        peakScore = score;
        peakHorizon = horizon as TimeHorizon;
      }
    }

    return peakHorizon;
  }

  private identifyRiskPeriods(overallSatisfaction: Record<TimeHorizon, number>): TimeHorizon[] {
    const riskPeriods: TimeHorizon[] = [];
    const scores = Object.entries(overallSatisfaction);

    for (let i = 0; i < scores.length - 1; i++) {
      const currentScore = scores[i][1];
      const nextScore = scores[i + 1][1];

      if (nextScore < currentScore - 0.1) {
        riskPeriods.push(scores[i + 1][0] as TimeHorizon);
      }
    }

    return riskPeriods;
  }

  private calculateProjectionConfidence(): number {
    const dataPoints = Object.keys(this.responses).length;
    const hasStrengthProfile = this.strengthProfile !== null;
    const hasMotivationInsights = this.motivationInsights.length > 0;
    const hasInteractionData = this.interactions.length > 0;

    let confidence = 0.5;

    if (dataPoints >= 10) confidence += 0.15;
    if (dataPoints >= 20) confidence += 0.1;
    if (hasStrengthProfile) confidence += 0.1;
    if (hasMotivationInsights) confidence += 0.1;
    if (hasInteractionData) confidence += 0.05;

    return Math.min(confidence, 0.95);
  }

  private documentAssumptions(): string[] {
    return [
      'Assumes continued interest in health/wellness industry',
      'Assumes willingness to develop technical/analytical skills',
      'Assumes remote work opportunities remain available',
      'Assumes health tech industry continues growth trajectory',
      'Assumes personal circumstances allow for career focus',
      'Based on current preferences which may evolve over time',
      'Projections become less certain beyond 5-year horizon'
    ];
  }
}
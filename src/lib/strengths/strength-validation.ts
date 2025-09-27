import { QuestionResponse } from '../adaptive-questions/adaptive-engine';
import { UserProfile, Experience } from '@/types/user-profile';
import { InteractionTracker, CareerInteraction } from '../adaptive-questions/interaction-tracker';

export type StrengthCategory =
  | 'analytical'
  | 'creative'
  | 'interpersonal'
  | 'organizational'
  | 'leadership'
  | 'technical'
  | 'communication'
  | 'strategic';

export type EvidenceSource =
  | 'self-discovery'
  | 'work-experience'
  | 'career-interest'
  | 'performance'
  | 'behavioral';

export interface StrengthEvidence {
  source: EvidenceSource;
  weight: number;
  description: string;
  specifics: string[];
  timestamp?: Date;
}

export interface ValidatedStrength {
  name: string;
  category: StrengthCategory;
  confidence: number;
  isStrength: boolean;
  evidence: StrengthEvidence[];
  validationScore: number;
  selfPerception: {
    claimed: boolean;
    consistency: number;
  };
  behavioralEvidence: {
    demonstrated: boolean;
    frequency: number;
    contexts: string[];
  };
  interestAlignment: {
    aligned: boolean;
    explorationPattern: string[];
  };
  performanceIndicators: {
    present: boolean;
    signals: string[];
  };
  insights: string[];
  developmentGaps?: string[];
  isNaturalTalent: boolean;
  isLearnedSkill: boolean;
}

export interface StrengthProfile {
  validated: ValidatedStrength[];
  emerging: ValidatedStrength[];
  claimed: ValidatedStrength[];
  summary: {
    topStrengths: string[];
    underutilized: string[];
    overestimated: string[];
    hiddenTalents: string[];
  };
  confidenceMetrics: {
    overall: number;
    selfAwareness: number;
    evidenceQuality: number;
  };
}

export class StrengthValidationEngine {
  private responses: Record<string, QuestionResponse>;
  private profile: UserProfile;
  private interactions: CareerInteraction[];

  constructor(
    responses: Record<string, QuestionResponse>,
    profile: UserProfile,
    interactions?: CareerInteraction[]
  ) {
    this.responses = responses;
    this.profile = profile;
    this.interactions = interactions || InteractionTracker.getRecentInteractions(100);
  }

  validateStrengths(): StrengthProfile {
    const allPotentialStrengths = this.identifyPotentialStrengths();
    const validatedStrengths: ValidatedStrength[] = [];

    for (const strength of allPotentialStrengths) {
      const validated = this.validateStrength(strength);
      validatedStrengths.push(validated);
    }

    return this.buildStrengthProfile(validatedStrengths);
  }

  private identifyPotentialStrengths(): Array<{ name: string; category: StrengthCategory }> {
    const potentialStrengths = new Set<string>();

    this.profile.strengths.forEach(s => potentialStrengths.add(s));

    this.profile.skills.forEach(s => potentialStrengths.add(s));

    for (const exp of this.profile.experience) {
      if (exp.skills) {
        exp.skills.forEach(s => potentialStrengths.add(s));
      }
    }

    const fromResponses = this.extractStrengthsFromResponses();
    fromResponses.forEach(s => potentialStrengths.add(s));

    return Array.from(potentialStrengths).map(name => ({
      name,
      category: this.categorizeStrength(name),
    }));
  }

  private extractStrengthsFromResponses(): string[] {
    const strengths: string[] = [];

    const problemSolvingResponse = this.responses['ps-approach'];
    if (problemSolvingResponse?.response === 'break-down') {
      strengths.push('analytical thinking');
    } else if (problemSolvingResponse?.response === 'try-solutions') {
      strengths.push('experimental problem-solving');
    }

    const creativityResponse = this.responses['cr-process'];
    if (creativityResponse?.response === 'alone' || creativityResponse?.response === 'independent') {
      strengths.push('independent creativity');
    } else if (creativityResponse?.response === 'team-brainstorm') {
      strengths.push('collaborative ideation');
    }

    const peopleResponse = this.responses['pi-energy'];
    if (peopleResponse?.response === 'energizing' || peopleResponse?.response === 'essential') {
      strengths.push('interpersonal connection');
    }

    const structureResponse = this.responses['sf-preference'];
    if (structureResponse?.response === 'structure') {
      strengths.push('organizational planning');
    }

    const roleModelResponse = this.responses['ci-role-models'];
    if (roleModelResponse?.response === 'problem-solvers') {
      strengths.push('analytical problem-solving');
    } else if (roleModelResponse?.response === 'helpers') {
      strengths.push('service orientation');
    } else if (roleModelResponse?.response === 'creators') {
      strengths.push('creative execution');
    } else if (roleModelResponse?.response === 'leaders') {
      strengths.push('leadership');
    } else if (roleModelResponse?.response === 'teachers') {
      strengths.push('teaching and mentorship');
    }

    return strengths;
  }

  private validateStrength(potential: { name: string; category: StrengthCategory }): ValidatedStrength {
    const evidence: StrengthEvidence[] = [];

    const selfPerception = this.checkSelfPerception(potential.name);
    if (selfPerception.claimed) {
      evidence.push({
        source: 'self-discovery',
        weight: 0.3,
        description: 'Explicitly stated as strength in profile',
        specifics: selfPerception.specifics,
      });
    }

    const workEvidence = this.checkWorkExperience(potential.name);
    if (workEvidence.demonstrated) {
      evidence.push({
        source: 'work-experience',
        weight: 0.4,
        description: 'Demonstrated in work history',
        specifics: workEvidence.specifics,
      });
    }

    const interestEvidence = this.checkCareerInterests(potential.name);
    if (interestEvidence.aligned) {
      evidence.push({
        source: 'career-interest',
        weight: 0.2,
        description: 'Aligned with career exploration patterns',
        specifics: interestEvidence.specifics,
      });
    }

    const performanceEvidence = this.checkPerformanceIndicators(potential.name);
    if (performanceEvidence.present) {
      evidence.push({
        source: 'performance',
        weight: 0.3,
        description: 'Performance indicators suggest excellence',
        specifics: performanceEvidence.specifics,
      });
    }

    const behavioralEvidence = this.checkBehavioralPatterns(potential.name);
    if (behavioralEvidence.demonstrated) {
      evidence.push({
        source: 'behavioral',
        weight: 0.25,
        description: 'Behavioral patterns show consistent application',
        specifics: behavioralEvidence.specifics,
      });
    }

    const totalWeight = evidence.reduce((sum, e) => sum + e.weight, 0);
    const maxWeight = 1.45;
    const validationScore = Math.min(totalWeight / maxWeight, 1.0);

    const confidence = this.calculateConfidence(evidence, selfPerception, workEvidence);

    const isStrength = validationScore >= 0.6 && confidence >= 0.65;

    const insights = this.generateStrengthInsights(
      potential.name,
      evidence,
      selfPerception,
      workEvidence,
      interestEvidence,
      behavioralEvidence,
      validationScore
    );

    const { isNaturalTalent, isLearnedSkill } = this.distinguishTalentVsSkill(
      potential.name,
      evidence,
      selfPerception,
      workEvidence
    );

    return {
      name: potential.name,
      category: potential.category,
      confidence,
      isStrength,
      evidence,
      validationScore,
      selfPerception: {
        claimed: selfPerception.claimed,
        consistency: selfPerception.consistency,
      },
      behavioralEvidence: {
        demonstrated: behavioralEvidence.demonstrated,
        frequency: behavioralEvidence.frequency,
        contexts: behavioralEvidence.contexts,
      },
      interestAlignment: {
        aligned: interestEvidence.aligned,
        explorationPattern: interestEvidence.explorationPattern,
      },
      performanceIndicators: {
        present: performanceEvidence.present,
        signals: performanceEvidence.specifics,
      },
      insights,
      developmentGaps: this.identifyDevelopmentGaps(potential.name, evidence, workEvidence),
      isNaturalTalent,
      isLearnedSkill,
    };
  }

  private checkSelfPerception(strengthName: string): {
    claimed: boolean;
    consistency: number;
    specifics: string[];
  } {
    const specifics: string[] = [];
    let claimed = false;
    let consistencyScore = 0;

    if (this.profile.strengths.some(s =>
      s.toLowerCase().includes(strengthName.toLowerCase()) ||
      strengthName.toLowerCase().includes(s.toLowerCase())
    )) {
      claimed = true;
      consistencyScore += 0.4;
      specifics.push(`Listed in profile strengths`);
    }

    const relevantResponses = Object.values(this.responses).filter(r => {
      const responseStr = String(r.response).toLowerCase();
      return responseStr.includes(strengthName.toLowerCase()) ||
             this.isRelatedStrength(strengthName, responseStr);
    });

    if (relevantResponses.length > 0) {
      consistencyScore += Math.min(relevantResponses.length * 0.2, 0.6);
      specifics.push(`Mentioned in ${relevantResponses.length} Self Discovery responses`);
    }

    return {
      claimed,
      consistency: Math.min(consistencyScore, 1.0),
      specifics,
    };
  }

  private checkWorkExperience(strengthName: string): {
    demonstrated: boolean;
    specifics: string[];
  } {
    const specifics: string[] = [];
    let demonstrated = false;

    for (const exp of this.profile.experience) {
      const allText = [
        exp.title,
        ...exp.description,
        ...(exp.skills || []),
      ].join(' ').toLowerCase();

      if (allText.includes(strengthName.toLowerCase()) ||
          this.isRelatedStrength(strengthName, allText)) {
        demonstrated = true;
        specifics.push(`${exp.title} at ${exp.company}: Applied in ${exp.description[0]}`);
      }

      if (exp.skills?.some(s =>
        s.toLowerCase().includes(strengthName.toLowerCase()) ||
        strengthName.toLowerCase().includes(s.toLowerCase())
      )) {
        demonstrated = true;
        specifics.push(`Listed skill at ${exp.company}`);
      }
    }

    return { demonstrated, specifics };
  }

  private checkCareerInterests(strengthName: string): {
    aligned: boolean;
    specifics: string[];
    explorationPattern: string[];
  } {
    const specifics: string[] = [];
    const explorationPattern: string[] = [];
    let aligned = false;

    const roleInterests = this.interactions.filter(i => i.type === 'role_interest');
    const careerViews = this.interactions.filter(i => i.type === 'career_viewed');

    for (const interaction of [...roleInterests, ...careerViews]) {
      if (this.strengthAlignsWith(interaction.content, strengthName, interaction.metadata)) {
        aligned = true;
        specifics.push(`Interest in ${interaction.content}`);
        explorationPattern.push(interaction.content);
      }
    }

    if (explorationPattern.length >= 3) {
      specifics.push(`Consistent pattern across ${explorationPattern.length} career explorations`);
    }

    return { aligned, specifics, explorationPattern };
  }

  private checkPerformanceIndicators(strengthName: string): {
    present: boolean;
    specifics: string[];
  } {
    const specifics: string[] = [];
    let present = false;

    if (this.profile.education[0]?.honors && this.profile.education[0].honors.length > 0) {
      if (this.strengthRelatedToAcademicExcellence(strengthName)) {
        present = true;
        specifics.push(`Academic honors: ${this.profile.education[0].honors[0]}`);
      }
    }

    for (const exp of this.profile.experience) {
      const hasLeadershipIndicators = exp.description.some(d =>
        d.toLowerCase().includes('led') ||
        d.toLowerCase().includes('managed') ||
        d.toLowerCase().includes('coordinated')
      );

      if (hasLeadershipIndicators && this.strengthRelatedToLeadership(strengthName)) {
        present = true;
        specifics.push(`Leadership demonstrated at ${exp.company}`);
      }

      const hasImpactIndicators = exp.description.some(d =>
        d.toLowerCase().includes('increased') ||
        d.toLowerCase().includes('improved') ||
        d.toLowerCase().includes('drove') ||
        d.toLowerCase().includes('ensured')
      );

      if (hasImpactIndicators) {
        present = true;
        specifics.push(`Measurable impact at ${exp.company}`);
      }
    }

    return { present, specifics };
  }

  private checkBehavioralPatterns(strengthName: string): {
    demonstrated: boolean;
    frequency: number;
    contexts: string[];
    specifics: string[];
  } {
    const contexts: string[] = [];
    const specifics: string[] = [];
    let frequency = 0;

    const experiences = this.profile.experience;
    for (const exp of experiences) {
      if (this.experienceDemonstratesStrength(exp, strengthName)) {
        frequency++;
        contexts.push(exp.company);
      }
    }

    const demonstrated = frequency >= 2;

    if (demonstrated) {
      specifics.push(`Demonstrated across ${frequency} different roles`);
      specifics.push(`Contexts: ${contexts.join(', ')}`);
    }

    return { demonstrated, frequency, contexts, specifics };
  }

  private calculateConfidence(
    evidence: StrengthEvidence[],
    selfPerception: { claimed: boolean; consistency: number },
    workEvidence: { demonstrated: boolean }
  ): number {
    let confidence = 0;

    const sourceTypes = new Set(evidence.map(e => e.source));
    const diversityBonus = Math.min(sourceTypes.size * 0.15, 0.45);
    confidence += diversityBonus;

    const evidenceQuality = evidence.reduce((sum, e) => sum + e.weight, 0) / evidence.length;
    confidence += evidenceQuality * 0.4;

    if (selfPerception.claimed && workEvidence.demonstrated) {
      confidence += 0.15;
    }

    if (!selfPerception.claimed && workEvidence.demonstrated) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  private generateStrengthInsights(
    strengthName: string,
    evidence: StrengthEvidence[],
    selfPerception: { claimed: boolean; consistency: number; specifics: string[] },
    workEvidence: { demonstrated: boolean; specifics: string[] },
    interestEvidence: { aligned: boolean; specifics: string[]; explorationPattern: string[] },
    behavioralEvidence: { demonstrated: boolean; frequency: number; contexts: string[]; specifics: string[] },
    validationScore: number
  ): string[] {
    const insights: string[] = [];

    if (validationScore >= 0.8) {
      insights.push(`${strengthName} is a validated core strength with strong evidence across multiple sources.`);
    } else if (validationScore >= 0.6) {
      insights.push(`${strengthName} is a confirmed strength with solid supporting evidence.`);
    }

    if (selfPerception.claimed && !workEvidence.demonstrated) {
      insights.push(`You identify ${strengthName} as a strength, but work history doesn't yet show applied experience. Consider seeking opportunities to demonstrate this.`);
    }

    if (!selfPerception.claimed && workEvidence.demonstrated) {
      insights.push(`${strengthName} is a hidden strength - you've consistently demonstrated it but may not recognize it as a core capability.`);
    }

    if (workEvidence.demonstrated && interestEvidence.aligned) {
      insights.push(`Strong alignment: you've used ${strengthName} in past roles AND actively explore careers that leverage it.`);
    }

    if (behavioralEvidence.frequency >= 3) {
      insights.push(`${strengthName} is a consistent pattern across ${behavioralEvidence.frequency} different contexts, suggesting it's reliable and transferable.`);
    }

    if (selfPerception.consistency >= 0.8) {
      insights.push(`You have high self-awareness about ${strengthName} - your self-perception aligns well with behavioral evidence.`);
    }

    return insights;
  }

  private distinguishTalentVsSkill(
    strengthName: string,
    evidence: StrengthEvidence[],
    selfPerception: { claimed: boolean; consistency: number; specifics: string[] },
    workEvidence: { demonstrated: boolean; specifics: string[] }
  ): { isNaturalTalent: boolean; isLearnedSkill: boolean } {
    let naturalTalentScore = 0;
    let learnedSkillScore = 0;

    const childhoodResponse = this.responses['ci-1'] || this.responses['ci-role-models'];
    if (childhoodResponse) {
      const responseStr = String(childhoodResponse.response).toLowerCase();
      if (responseStr.includes(strengthName.toLowerCase())) {
        naturalTalentScore += 0.4;
      }
    }

    const peakExperience = this.responses['pe-1'];
    if (peakExperience) {
      const responseStr = String(peakExperience.response).toLowerCase();
      if (responseStr.includes(strengthName.toLowerCase())) {
        naturalTalentScore += 0.3;
      }
    }

    if (selfPerception.consistency >= 0.8) {
      naturalTalentScore += 0.3;
    }

    if (this.profile.education[0]?.major &&
        this.strengthRelatedToEducation(strengthName, this.profile.education[0].major)) {
      learnedSkillScore += 0.4;
    }

    const professionalDevelopment = workEvidence.specifics.some((s: string) =>
      s.toLowerCase().includes('training') ||
      s.toLowerCase().includes('certification') ||
      s.toLowerCase().includes('learned')
    );
    if (professionalDevelopment) {
      learnedSkillScore += 0.6;
    }

    return {
      isNaturalTalent: naturalTalentScore >= 0.6,
      isLearnedSkill: learnedSkillScore >= 0.5,
    };
  }

  private identifyDevelopmentGaps(
    strengthName: string,
    evidence: StrengthEvidence[],
    workEvidence: { demonstrated: boolean; specifics: string[] }
  ): string[] | undefined {
    const gaps: string[] = [];

    if (!workEvidence.demonstrated) {
      gaps.push('Seek opportunities to apply this strength in professional contexts');
    }

    const hasPerformanceEvidence = evidence.some(e => e.source === 'performance');
    if (!hasPerformanceEvidence && workEvidence.demonstrated) {
      gaps.push('Build measurable outcomes that demonstrate impact of this strength');
    }

    const contexts = workEvidence.specifics.length;
    if (contexts < 2) {
      gaps.push('Demonstrate this strength in diverse contexts to prove transferability');
    }

    return gaps.length > 0 ? gaps : undefined;
  }

  private buildStrengthProfile(validated: ValidatedStrength[]): StrengthProfile {
    const strongValidation = validated.filter(s => s.validationScore >= 0.8 && s.isStrength);
    const moderate = validated.filter(s => s.validationScore >= 0.6 && s.validationScore < 0.8 && s.isStrength);
    const claimed = validated.filter(s => s.selfPerception.claimed && !s.isStrength);

    const hidden = validated.filter(s =>
      !s.selfPerception.claimed &&
      s.behavioralEvidence.demonstrated &&
      s.validationScore >= 0.7
    );

    const underutilized = validated.filter(s =>
      s.isStrength &&
      s.behavioralEvidence.demonstrated &&
      !s.interestAlignment.aligned
    );

    const overestimated = validated.filter(s =>
      s.selfPerception.claimed &&
      s.selfPerception.consistency >= 0.6 &&
      !s.behavioralEvidence.demonstrated
    );

    const allValidated = [...strongValidation, ...moderate];
    const totalEvidence = allValidated.reduce((sum, s) => sum + s.evidence.length, 0);
    const avgConfidence = allValidated.reduce((sum, s) => sum + s.confidence, 0) / allValidated.length;

    const selfAware = validated.filter(s =>
      Math.abs((s.selfPerception.claimed ? 1 : 0) - s.validationScore) < 0.3
    );

    return {
      validated: allValidated.sort((a, b) => b.validationScore - a.validationScore),
      emerging: moderate,
      claimed,
      summary: {
        topStrengths: strongValidation.slice(0, 5).map(s => s.name),
        underutilized: underutilized.map(s => s.name),
        overestimated: overestimated.map(s => s.name),
        hiddenTalents: hidden.map(s => s.name),
      },
      confidenceMetrics: {
        overall: avgConfidence || 0,
        selfAwareness: selfAware.length / validated.length,
        evidenceQuality: totalEvidence / validated.length,
      },
    };
  }

  private categorizeStrength(name: string): StrengthCategory {
    const lower = name.toLowerCase();

    if (lower.includes('analy') || lower.includes('problem') || lower.includes('research')) {
      return 'analytical';
    }
    if (lower.includes('creat') || lower.includes('design') || lower.includes('innovat')) {
      return 'creative';
    }
    if (lower.includes('people') || lower.includes('relation') || lower.includes('client') ||
        lower.includes('patient') || lower.includes('customer')) {
      return 'interpersonal';
    }
    if (lower.includes('organiz') || lower.includes('plan') || lower.includes('coordinat') ||
        lower.includes('admin')) {
      return 'organizational';
    }
    if (lower.includes('lead') || lower.includes('manag') || lower.includes('direct')) {
      return 'leadership';
    }
    if (lower.includes('technical') || lower.includes('program') || lower.includes('software')) {
      return 'technical';
    }
    if (lower.includes('communic') || lower.includes('present') || lower.includes('writing') ||
        lower.includes('teach')) {
      return 'communication';
    }
    if (lower.includes('strateg') || lower.includes('vision') || lower.includes('big picture')) {
      return 'strategic';
    }

    return 'interpersonal';
  }

  private isRelatedStrength(strengthName: string, text: string): boolean {
    const relationshipMap: Record<string, string[]> = {
      'analytical': ['analysis', 'data', 'research', 'investigate', 'examine', 'assess'],
      'communication': ['present', 'speak', 'write', 'explain', 'articulate', 'convey'],
      'leadership': ['lead', 'manage', 'guide', 'direct', 'inspire', 'coordinate'],
      'creative': ['design', 'innovate', 'imagine', 'create', 'develop', 'conceptualize'],
      'organizational': ['organize', 'plan', 'schedule', 'structure', 'systematize', 'coordinate'],
      'interpersonal': ['collaborate', 'team', 'relationship', 'empathy', 'rapport', 'connect'],
    };

    for (const [key, related] of Object.entries(relationshipMap)) {
      if (strengthName.toLowerCase().includes(key)) {
        return related.some(r => text.includes(r));
      }
    }

    return false;
  }

  private strengthAlignsWith(content: string, strengthName: string, metadata?: Record<string, unknown>): boolean {
    const contentLower = content.toLowerCase();
    const strengthLower = strengthName.toLowerCase();

    if (contentLower.includes(strengthLower)) {
      return true;
    }

    if (metadata) {
      const skills = metadata.skills as string[] | undefined;
      if (skills && skills.some(s =>
        s.toLowerCase().includes(strengthLower) ||
        strengthLower.includes(s.toLowerCase())
      )) {
        return true;
      }
    }

    return false;
  }

  private strengthRelatedToAcademicExcellence(strengthName: string): boolean {
    const academic = ['analytical', 'research', 'writing', 'critical thinking', 'learning'];
    return academic.some(a => strengthName.toLowerCase().includes(a));
  }

  private strengthRelatedToLeadership(strengthName: string): boolean {
    const leadership = ['leadership', 'management', 'coordination', 'team', 'organizational'];
    return leadership.some(l => strengthName.toLowerCase().includes(l));
  }

  private strengthRelatedToEducation(strengthName: string, major: string): boolean {
    const majorLower = major.toLowerCase();
    const strengthLower = strengthName.toLowerCase();

    if (majorLower.includes('marketing') &&
        (strengthLower.includes('communication') || strengthLower.includes('creative') ||
         strengthLower.includes('strategy'))) {
      return true;
    }

    if (majorLower.includes('english') &&
        (strengthLower.includes('writing') || strengthLower.includes('communication'))) {
      return true;
    }

    return false;
  }

  private experienceDemonstratesStrength(exp: Experience, strengthName: string): boolean {
    const allText = [exp.title, ...exp.description, ...(exp.skills || [])].join(' ').toLowerCase();
    const strengthLower = strengthName.toLowerCase();

    return allText.includes(strengthLower) || this.isRelatedStrength(strengthName, allText);
  }
}
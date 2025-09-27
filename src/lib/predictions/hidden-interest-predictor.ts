import { QuestionResponse } from '../adaptive-questions/adaptive-engine';
import { CareerInteraction } from '../adaptive-questions/interaction-tracker';
import { UserProfile } from '@/types/user-profile';
import { ExplorationArea } from '../adaptive-questions/question-banks';

export interface HiddenInterestSignal {
  type: 'response-pattern' | 'blind-spot' | 'preference-combo' | 'personality-fit';
  strength: number;
  evidence: string[];
  indicatesInterest: string;
}

export interface ExplorationSuggestion {
  careerArea: string;
  confidence: number;
  reasoning: string;
  signals: HiddenInterestSignal[];
  unexpectednessFactor: number;
  specificRoles: string[];
  whyUnexplored: string;
  explorationType: 'stretch' | 'adjacent' | 'hidden-gem';
}

export interface BlindSpot {
  area: string;
  researchGap: number;
  possibleReasons: string[];
  potentialFit: number;
}

export interface PreferenceCombination {
  traits: string[];
  unusualCombination: boolean;
  indicatesCareer: string[];
  confidence: number;
}

export interface PersonalityCareerFit {
  personality: string[];
  suggestedCareer: string;
  fitScore: number;
  reasoning: string;
}

export class HiddenInterestPredictor {
  private responses: Record<string, QuestionResponse>;
  private interactions: CareerInteraction[];
  private userProfile: UserProfile;

  constructor(
    responses: Record<string, QuestionResponse>,
    interactions: CareerInteraction[],
    userProfile: UserProfile
  ) {
    this.responses = responses;
    this.interactions = interactions;
    this.userProfile = userProfile;
  }

  predictHiddenInterests(): ExplorationSuggestion[] {
    const suggestions: ExplorationSuggestion[] = [];

    const responsePatternSignals = this.analyzeResponsePatterns();
    const blindSpots = this.identifyBlindSpots();
    const preferenceCombos = this.analyzePreferenceCombinations();
    const personalityFits = this.analyzePersonalityCareerFit();

    const allSignals = this.combineSignals(
      responsePatternSignals,
      blindSpots,
      preferenceCombos,
      personalityFits
    );

    for (const [careerArea, signals] of Object.entries(allSignals)) {
      if (signals.length === 0) continue;

      const avgStrength = signals.reduce((sum, s) => sum + s.strength, 0) / signals.length;

      if (avgStrength >= 0.6) {
        const unexpectedness = this.calculateUnexpectedness(careerArea);

        if (unexpectedness >= 0.5) {
          suggestions.push({
            careerArea,
            confidence: avgStrength,
            reasoning: this.generateReasoning(signals, careerArea),
            signals,
            unexpectednessFactor: unexpectedness,
            specificRoles: this.suggestSpecificRoles(careerArea, signals),
            whyUnexplored: this.explainWhyUnexplored(careerArea),
            explorationType: this.determineExplorationType(unexpectedness, signals),
          });
        }
      }
    }

    return suggestions.sort((a, b) =>
      (b.confidence * b.unexpectednessFactor) - (a.confidence * a.unexpectednessFactor)
    );
  }

  private analyzeResponsePatterns(): HiddenInterestSignal[] {
    const signals: HiddenInterestSignal[] = [];

    const dataPatternSignal = this.detectDataAnalysisPattern();
    if (dataPatternSignal) signals.push(dataPatternSignal);

    const visualThinkingSignal = this.detectVisualThinkingPattern();
    if (visualThinkingSignal) signals.push(visualThinkingSignal);

    const systemsThinkingSignal = this.detectSystemsThinkingPattern();
    if (systemsThinkingSignal) signals.push(systemsThinkingSignal);

    const teachingPattern = this.detectTeachingPattern();
    if (teachingPattern) signals.push(teachingPattern);

    const researchPattern = this.detectResearchPattern();
    if (researchPattern) signals.push(researchPattern);

    return signals;
  }

  private detectDataAnalysisPattern(): HiddenInterestSignal | null {
    const evidence: string[] = [];
    let strength = 0;

    const problemSolvingResponse = this.responses['ps-analytical'];
    if (problemSolvingResponse &&
        (String(problemSolvingResponse.response).includes('data') ||
         String(problemSolvingResponse.response).includes('patterns') ||
         String(problemSolvingResponse.response).includes('analysis'))) {
      evidence.push('Shows analytical approach to problem-solving');
      strength += 0.3;
    }

    const structurePreference = this.responses['sf-structure'];
    if (structurePreference && String(structurePreference.response).includes('metrics')) {
      evidence.push('Values metrics and measurable outcomes');
      strength += 0.25;
    }

    const workHistory = this.userProfile.experience.some(exp =>
      exp.description.some(d =>
        d.toLowerCase().includes('data') ||
        d.toLowerCase().includes('analytics') ||
        d.toLowerCase().includes('performance')
      )
    );
    if (workHistory) {
      evidence.push('Work history shows data/analytics exposure');
      strength += 0.25;
    }

    const currentSkills = this.userProfile.skills.some(s =>
      s.toLowerCase().includes('analysis') ||
      s.toLowerCase().includes('data')
    );
    if (currentSkills) {
      evidence.push('Current skills include analysis');
      strength += 0.2;
    }

    if (evidence.length >= 2 && strength >= 0.5) {
      return {
        type: 'response-pattern',
        strength,
        evidence,
        indicatesInterest: 'Data Visualization & Analytics',
      };
    }

    return null;
  }

  private detectVisualThinkingPattern(): HiddenInterestSignal | null {
    const evidence: string[] = [];
    let strength = 0;

    const creativityResponse = this.responses['cr-visual'];
    if (creativityResponse) {
      evidence.push('Shows preference for visual expression');
      strength += 0.35;
    }

    const visualMerchandising = this.userProfile.experience.some(exp =>
      exp.skills?.some(s => s.toLowerCase().includes('visual')) ||
      exp.title.toLowerCase().includes('visual')
    );
    if (visualMerchandising) {
      evidence.push('Professional experience with visual design');
      strength += 0.4;
    }

    const problemSolvingVisual = this.responses['ps-approach'];
    if (problemSolvingVisual &&
        String(problemSolvingVisual.response).toLowerCase().includes('visual')) {
      evidence.push('Uses visual methods for problem-solving');
      strength += 0.25;
    }

    if (evidence.length >= 2 && strength >= 0.6) {
      return {
        type: 'response-pattern',
        strength,
        evidence,
        indicatesInterest: 'Data Visualization & Design',
      };
    }

    return null;
  }

  private detectSystemsThinkingPattern(): HiddenInterestSignal | null {
    const evidence: string[] = [];
    let strength = 0;

    const structureValue = this.responses['v-structure'] || this.responses['cd-1'];
    if (structureValue) {
      evidence.push('Values structure and systems');
      strength += 0.3;
    }

    const processOptimization = this.userProfile.skills.some(s =>
      s.toLowerCase().includes('process') ||
      s.toLowerCase().includes('operations')
    );
    if (processOptimization) {
      evidence.push('Skills in process optimization');
      strength += 0.35;
    }

    const operationsExp = this.userProfile.experience.some(exp =>
      exp.title.toLowerCase().includes('operations') ||
      exp.title.toLowerCase().includes('admin') ||
      exp.description.some(d => d.toLowerCase().includes('managed') || d.toLowerCase().includes('coordinated'))
    );
    if (operationsExp) {
      evidence.push('Experience managing operations and processes');
      strength += 0.35;
    }

    if (evidence.length >= 2 && strength >= 0.6) {
      return {
        type: 'response-pattern',
        strength,
        evidence,
        indicatesInterest: 'Operations & Systems Design',
      };
    }

    return null;
  }

  private detectTeachingPattern(): HiddenInterestSignal | null {
    const evidence: string[] = [];
    let strength = 0;

    const helpingMotivation = this.userProfile.values.some(v =>
      v.toLowerCase().includes('helping people')
    );
    if (helpingMotivation) {
      evidence.push('Strong motivation to help people');
      strength += 0.25;
    }

    const educatorExp = this.userProfile.experience.some(exp =>
      exp.title.toLowerCase().includes('educator') ||
      exp.description.some(d => d.toLowerCase().includes('educated') || d.toLowerCase().includes('training'))
    );
    if (educatorExp) {
      evidence.push('Professional experience educating others');
      strength += 0.4;
    }

    const personalTraining = this.userProfile.experience.some(exp =>
      exp.title.toLowerCase().includes('trainer')
    );
    if (personalTraining) {
      evidence.push('Experience in one-on-one instruction');
      strength += 0.35;
    }

    if (evidence.length >= 2 && strength >= 0.6) {
      return {
        type: 'response-pattern',
        strength,
        evidence,
        indicatesInterest: 'Corporate Training & Development',
      };
    }

    return null;
  }

  private detectResearchPattern(): HiddenInterestSignal | null {
    const evidence: string[] = [];
    let strength = 0;

    const analyticalStrength = this.userProfile.strengths.some(s =>
      s.toLowerCase().includes('problem-solving') || s.toLowerCase().includes('strategic')
    );
    if (analyticalStrength) {
      evidence.push('Strategic and analytical thinking strength');
      strength += 0.3;
    }

    const caseStudyExp = this.userProfile.experience.some(exp =>
      exp.description.some(d =>
        d.toLowerCase().includes('case study') ||
        d.toLowerCase().includes('analyze') ||
        d.toLowerCase().includes('evaluate')
      )
    );
    if (caseStudyExp) {
      evidence.push('Experience developing case studies and analysis');
      strength += 0.4;
    }

    const magnaCumLaude = this.userProfile.education.some(edu =>
      edu.honors?.some(h => h.includes('Magna Cum Laude'))
    );
    if (magnaCumLaude) {
      evidence.push('Academic excellence suggests research aptitude');
      strength += 0.3;
    }

    if (evidence.length >= 2 && strength >= 0.6) {
      return {
        type: 'response-pattern',
        strength,
        evidence,
        indicatesInterest: 'User Research & Insights',
      };
    }

    return null;
  }

  private identifyBlindSpots(): Map<string, BlindSpot> {
    const blindSpots = new Map<string, BlindSpot>();

    const researchedAreas = new Set<string>();
    for (const interaction of this.interactions) {
      if (interaction.metadata?.industry) {
        researchedAreas.add(interaction.metadata.industry.toLowerCase());
      }
      if (interaction.metadata?.jobFunction) {
        researchedAreas.add(interaction.metadata.jobFunction.toLowerCase());
      }
    }

    const potentialAreas = [
      { name: 'Product Management', keywords: ['product', 'pm', 'roadmap'] },
      { name: 'UX Research', keywords: ['ux', 'user research', 'usability'] },
      { name: 'Health Tech Product', keywords: ['health tech', 'digital health', 'medtech'] },
      { name: 'Data Visualization', keywords: ['data viz', 'visualization', 'analytics'] },
      { name: 'Customer Success', keywords: ['customer success', 'account management', 'csm'] },
      { name: 'Wellness Program Management', keywords: ['wellness program', 'corporate wellness', 'wellbeing'] },
      { name: 'Content Strategy', keywords: ['content strategy', 'content marketing', 'editorial'] },
    ];

    for (const area of potentialAreas) {
      const hasResearched = area.keywords.some(keyword =>
        Array.from(researchedAreas).some(researched => researched.includes(keyword))
      );

      if (!hasResearched) {
        const fitScore = this.calculateFitForArea(area.name);

        if (fitScore >= 0.6) {
          blindSpots.set(area.name, {
            area: area.name,
            researchGap: 1.0,
            possibleReasons: this.inferWhyNotResearched(area.name),
            potentialFit: fitScore,
          });
        }
      }
    }

    return blindSpots;
  }

  private calculateFitForArea(areaName: string): number {
    let fitScore = 0;

    const fitMapping: Record<string, { skills: string[]; values: string[]; experience: string[] }> = {
      'Product Management': {
        skills: ['marketing', 'operations', 'strategic', 'problem-solving'],
        values: ['structure', 'helping people', 'creativity', 'strategy'],
        experience: ['operations', 'marketing', 'project']
      },
      'UX Research': {
        skills: ['analysis', 'communication', 'research', 'problem-solving'],
        values: ['helping people', 'understanding needs', 'improving experience'],
        experience: ['case study', 'analyze', 'customer', 'client']
      },
      'Health Tech Product': {
        skills: ['marketing', 'healthcare', 'operations', 'technology'],
        values: ['helping people', 'health', 'wellness', 'innovation'],
        experience: ['healthcare', 'clinic', 'patient', 'wellness']
      },
      'Data Visualization': {
        skills: ['visual', 'creative', 'analytical', 'data'],
        values: ['clarity', 'communication', 'impact'],
        experience: ['visual', 'creative', 'marketing', 'data']
      },
      'Customer Success': {
        skills: ['relationship', 'communication', 'problem-solving', 'operations'],
        values: ['helping people', 'relationships', 'impact'],
        experience: ['client', 'customer', 'patient', 'guest']
      },
      'Wellness Program Management': {
        skills: ['operations', 'wellness', 'program', 'marketing'],
        values: ['health', 'wellness', 'helping people', 'structure'],
        experience: ['wellness', 'fitness', 'healthcare', 'program']
      },
      'Content Strategy': {
        skills: ['writing', 'marketing', 'creative', 'strategy'],
        values: ['creativity', 'communication', 'impact'],
        experience: ['marketing', 'content', 'social media', 'communication']
      },
    };

    const areaFit = fitMapping[areaName];
    if (!areaFit) return 0;

    for (const keyword of areaFit.skills) {
      const hasSkill = this.userProfile.skills.some(s =>
        s.toLowerCase().includes(keyword)
      ) || this.userProfile.strengths.some(s =>
        s.toLowerCase().includes(keyword)
      );
      if (hasSkill) fitScore += 0.15;
    }

    for (const keyword of areaFit.values) {
      const hasValue = this.userProfile.values.some(v =>
        v.toLowerCase().includes(keyword)
      ) || this.userProfile.careerPreferences.motivations.some(m =>
        m.toLowerCase().includes(keyword)
      );
      if (hasValue) fitScore += 0.15;
    }

    for (const keyword of areaFit.experience) {
      const hasExp = this.userProfile.experience.some(exp =>
        exp.description.some(d => d.toLowerCase().includes(keyword)) ||
        exp.title.toLowerCase().includes(keyword) ||
        exp.skills?.some(s => s.toLowerCase().includes(keyword))
      );
      if (hasExp) fitScore += 0.2;
    }

    return Math.min(fitScore, 1.0);
  }

  private inferWhyNotResearched(areaName: string): string[] {
    const reasons: string[] = [];

    if (areaName.includes('Tech') || areaName.includes('Product')) {
      reasons.push('May seem too technical or engineering-focused');
    }

    if (areaName.includes('UX') || areaName.includes('Research')) {
      reasons.push('Research roles might not be on your radar from marketing background');
    }

    if (areaName.includes('Data')) {
      reasons.push('Data roles might seem to require specialized technical skills');
    }

    if (areaName.includes('Customer Success')) {
      reasons.push('Often confused with customer service (which is different)');
    }

    if (reasons.length === 0) {
      reasons.push('Simply outside your current exploration patterns');
    }

    return reasons;
  }

  private analyzePreferenceCombinations(): Map<string, PreferenceCombination> {
    const combinations = new Map<string, PreferenceCombination>();

    const structureValue = this.responses['v-structure'] || this.responses['cd-1'];
    const creativityValue = this.responses['cr-preference'];
    const helpingMotivation = this.userProfile.values.some(v => v.toLowerCase().includes('helping'));

    if (structureValue && creativityValue) {
      combinations.set('structure-creativity', {
        traits: ['Structure preference', 'Creative expression'],
        unusualCombination: true,
        indicatesCareer: ['Product Design', 'UX/UI Design', 'Design Systems'],
        confidence: 0.75,
      });
    }

    if (helpingMotivation && structureValue) {
      const analyticalSkill = this.userProfile.skills.some(s =>
        s.toLowerCase().includes('analysis') || s.toLowerCase().includes('data')
      );

      if (analyticalSkill) {
        combinations.set('helping-analytical-structure', {
          traits: ['Helping people motivation', 'Analytical thinking', 'Structure preference'],
          unusualCombination: true,
          indicatesCareer: ['Healthcare Analytics', 'Wellness Data Analysis', 'Patient Outcomes Research'],
          confidence: 0.8,
        });
      }
    }

    const visualSkills = this.userProfile.experience.some(exp =>
      exp.skills?.some(s => s.toLowerCase().includes('visual'))
    );
    const dataExposure = this.userProfile.experience.some(exp =>
      exp.description.some(d => d.toLowerCase().includes('data') || d.toLowerCase().includes('performance'))
    );

    if (visualSkills && dataExposure) {
      combinations.set('visual-data', {
        traits: ['Visual design skills', 'Data/analytics exposure'],
        unusualCombination: true,
        indicatesCareer: ['Data Visualization Specialist', 'Analytics Designer', 'Dashboard Designer'],
        confidence: 0.85,
      });
    }

    const teachingExp = this.userProfile.experience.some(exp =>
      exp.title.toLowerCase().includes('trainer') || exp.title.toLowerCase().includes('educator')
    );
    const marketingSkills = this.userProfile.skills.some(s => s.toLowerCase().includes('marketing'));

    if (teachingExp && marketingSkills) {
      combinations.set('teaching-marketing', {
        traits: ['Teaching/training experience', 'Marketing skills'],
        unusualCombination: false,
        indicatesCareer: ['Customer Education', 'Product Marketing (Education)', 'Learning & Development'],
        confidence: 0.7,
      });
    }

    return combinations;
  }

  private analyzePersonalityCareerFit(): Map<string, PersonalityCareerFit> {
    const fits = new Map<string, PersonalityCareerFit>();

    const personality: string[] = [];

    if (this.userProfile.values.some(v => v.toLowerCase().includes('structure'))) {
      personality.push('Structure-oriented');
    }

    if (this.userProfile.strengths.some(s => s.toLowerCase().includes('strategic'))) {
      personality.push('Strategic thinker');
    }

    if (this.userProfile.values.some(v => v.toLowerCase().includes('helping'))) {
      personality.push('Helper/impact-driven');
    }

    if (this.userProfile.strengths.some(s => s.toLowerCase().includes('creative'))) {
      personality.push('Creative problem-solver');
    }

    if (this.userProfile.strengths.some(s => s.toLowerCase().includes('relationship'))) {
      personality.push('Relationship builder');
    }

    if (personality.includes('Structure-oriented') &&
        personality.includes('Helper/impact-driven') &&
        personality.includes('Strategic thinker')) {
      fits.set('product-manager', {
        personality: personality.slice(0, 3),
        suggestedCareer: 'Health Tech Product Manager',
        fitScore: 0.85,
        reasoning: 'Combines your love of structure with helping people through strategic product decisions. Product managers create frameworks that help users at scale.',
      });
    }

    if (personality.includes('Creative problem-solver') &&
        personality.includes('Helper/impact-driven') &&
        personality.includes('Relationship builder')) {
      fits.set('ux-researcher', {
        personality: personality.filter(p =>
          p.includes('Creative') || p.includes('Helper') || p.includes('Relationship')
        ),
        suggestedCareer: 'UX Researcher',
        fitScore: 0.8,
        reasoning: 'You understand people deeply through your training/client work. UX research applies this empathy to improve products for thousands of users.',
      });
    }

    if (personality.includes('Structure-oriented') &&
        personality.includes('Creative problem-solver')) {
      fits.set('data-viz', {
        personality: [personality.find(p => p.includes('Structure'))!, personality.find(p => p.includes('Creative'))!],
        suggestedCareer: 'Data Visualization Specialist',
        fitScore: 0.75,
        reasoning: 'Your visual merchandising background shows you understand how to present information beautifully. Add data, and you create compelling stories that drive decisions.',
      });
    }

    return fits;
  }

  private combineSignals(
    responsePatterns: HiddenInterestSignal[],
    blindSpots: Map<string, BlindSpot>,
    preferenceCombos: Map<string, PreferenceCombination>,
    personalityFits: Map<string, PersonalityCareerFit>
  ): Record<string, HiddenInterestSignal[]> {
    const combined: Record<string, HiddenInterestSignal[]> = {};

    for (const signal of responsePatterns) {
      if (!combined[signal.indicatesInterest]) {
        combined[signal.indicatesInterest] = [];
      }
      combined[signal.indicatesInterest].push(signal);
    }

    for (const [, blindSpot] of blindSpots) {
      if (!combined[blindSpot.area]) {
        combined[blindSpot.area] = [];
      }
      combined[blindSpot.area].push({
        type: 'blind-spot',
        strength: blindSpot.potentialFit,
        evidence: [`Never researched despite ${(blindSpot.potentialFit * 100).toFixed(0)}% fit`, ...blindSpot.possibleReasons],
        indicatesInterest: blindSpot.area,
      });
    }

    for (const [, combo] of preferenceCombos) {
      for (const career of combo.indicatesCareer) {
        if (!combined[career]) {
          combined[career] = [];
        }
        combined[career].push({
          type: 'preference-combo',
          strength: combo.confidence,
          evidence: [`Unique combination: ${combo.traits.join(' + ')}`],
          indicatesInterest: career,
        });
      }
    }

    for (const [, fit] of personalityFits) {
      if (!combined[fit.suggestedCareer]) {
        combined[fit.suggestedCareer] = [];
      }
      combined[fit.suggestedCareer].push({
        type: 'personality-fit',
        strength: fit.fitScore,
        evidence: [fit.reasoning, `Personality traits: ${fit.personality.join(', ')}`],
        indicatesInterest: fit.suggestedCareer,
      });
    }

    return combined;
  }

  private calculateUnexpectedness(careerArea: string): number {
    const researchedAreas = this.interactions.map(i =>
      i.content.toLowerCase() + ' ' + (i.metadata?.industry || '') + ' ' + (i.metadata?.jobFunction || '')
    );

    const careerLower = careerArea.toLowerCase();
    const hasResearched = researchedAreas.some(area =>
      area.includes(careerLower) ||
      careerLower.split(' ').some(word => area.includes(word))
    );

    if (hasResearched) {
      return 0.2;
    }

    const isAdjacentToGoals = this.userProfile.careerGoals.some(goal =>
      goal.toLowerCase().includes(careerLower) ||
      careerLower.split(' ').some(word => goal.toLowerCase().includes(word))
    );

    if (isAdjacentToGoals) {
      return 0.6;
    }

    return 0.9;
  }

  private generateReasoning(signals: HiddenInterestSignal[], careerArea: string): string {
    const evidencePoints = signals.flatMap(s => s.evidence);

    const topEvidence = evidencePoints.slice(0, 3).join('. ');

    return `Based on your responses, you might unexpectedly enjoy ${careerArea}. ${topEvidence}. This role could combine your existing strengths in ways you haven't explored yet.`;
  }

  private suggestSpecificRoles(careerArea: string, signals: HiddenInterestSignal[]): string[] {
    const roleMapping: Record<string, string[]> = {
      'Data Visualization & Analytics': [
        'Healthcare Data Visualization Specialist',
        'Wellness Analytics Designer',
        'Marketing Analytics Visualizer'
      ],
      'Data Visualization & Design': [
        'Data Storytelling Designer',
        'Analytics Dashboard Designer',
        'Health Metrics Visualizer'
      ],
      'Operations & Systems Design': [
        'Healthcare Operations Analyst',
        'Wellness Program Operations Manager',
        'Patient Experience Operations Lead'
      ],
      'Corporate Training & Development': [
        'Corporate Wellness Trainer',
        'Health & Fitness Program Developer',
        'Employee Wellness Educator'
      ],
      'User Research & Insights': [
        'Health Tech UX Researcher',
        'Wellness Product Researcher',
        'Patient Experience Researcher'
      ],
      'Product Management': [
        'Health Tech Associate Product Manager',
        'Wellness Platform Product Manager',
        'Patient Experience Product Manager'
      ],
      'UX Research': [
        'UX Researcher - Health Tech',
        'Wellness App UX Researcher',
        'Healthcare User Researcher'
      ],
      'Health Tech Product': [
        'Digital Health Product Manager',
        'Wellness Technology Product Lead',
        'Patient Portal Product Manager'
      ],
      'Customer Success': [
        'Customer Success Manager - Health Tech',
        'Wellness Platform Customer Success',
        'Healthcare SaaS Customer Success'
      ],
      'Wellness Program Management': [
        'Corporate Wellness Program Manager',
        'Employee Wellbeing Program Lead',
        'Wellness Benefits Manager'
      ],
      'Content Strategy': [
        'Health & Wellness Content Strategist',
        'Healthcare Content Marketing Manager',
        'Wellness Brand Content Lead'
      ],
    };

    const roles = roleMapping[careerArea] || [careerArea];

    return roles;
  }

  private explainWhyUnexplored(careerArea: string): string {
    const explanations: Record<string, string> = {
      'Data Visualization & Analytics': 'Often seen as highly technical, but your visual merchandising + analytics exposure is the perfect foundation',
      'Data Visualization & Design': 'Bridges creative and analytical - you may not realize this role exists',
      'Operations & Systems Design': 'Your operations experience is transferable, but these roles aren\'t often marketed to marketing majors',
      'Corporate Training & Development': 'Your training experience translates directly, but wellness education roles are less visible',
      'User Research & Insights': 'Marketing majors don\'t always realize research is a career path outside of academia',
      'Product Management': 'Seems technical but is actually strategy + operations + user empathy - all your strengths',
      'UX Research': 'Your client relationship skills translate directly to user research interviews',
      'Health Tech Product': 'Combines health passion + tech + strategy, but product management isn\'t taught in marketing programs',
      'Customer Success': 'Often confused with customer service - this is strategic relationship + problem-solving',
      'Wellness Program Management': 'Your direct wellness experience fits perfectly but these roles are harder to discover',
      'Content Strategy': 'More strategic than typical content marketing roles',
    };

    return explanations[careerArea] || 'This area combines your skills in unexpected ways';
  }

  private determineExplorationType(unexpectedness: number, signals: HiddenInterestSignal[]): 'stretch' | 'adjacent' | 'hidden-gem' {
    if (unexpectedness >= 0.8) {
      return 'stretch';
    }

    const hasBlindSpotSignal = signals.some(s => s.type === 'blind-spot');
    if (hasBlindSpotSignal && unexpectedness >= 0.6) {
      return 'hidden-gem';
    }

    return 'adjacent';
  }
}
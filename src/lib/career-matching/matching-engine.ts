import { JobCategory } from '@/types/career';
import {
  UserProfile,
  CareerMatch,
  MatchReasoning,
  MatchingConfig,
  MatchingWeights
} from '@/types/career-matching';
import { careerResearchService } from '../career-research/career-service';

const DEFAULT_WEIGHTS: MatchingWeights = {
  interests: 0.25,
  skills: 0.25,
  experience: 0.15,
  personality: 0.15,
  preferences: 0.10,
  education: 0.10,
};

const DEFAULT_CONFIG: MatchingConfig = {
  weights: DEFAULT_WEIGHTS,
  minimumScore: 40,
  confidenceThreshold: 0.6,
  maxResults: 10,
};

export class CareerMatchingEngine {
  private config: MatchingConfig;

  constructor(config: Partial<MatchingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public matchCareers(profile: UserProfile): CareerMatch[] {
    const allCareers = this.getAllRelevantCareers(profile);

    const matches = allCareers.map(career => this.evaluateCareer(career, profile));

    return matches
      .filter(match =>
        match.overallScore >= this.config.minimumScore &&
        match.confidence >= this.config.confidenceThreshold
      )
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, this.config.maxResults);
  }

  private getAllRelevantCareers(profile: UserProfile): JobCategory[] {
    const categories = profile.preferences.categories.length > 0
      ? profile.preferences.categories
      : careerResearchService.getAllCategories();

    return categories.flatMap(category =>
      careerResearchService.findByCategory(category)
    );
  }

  private evaluateCareer(career: JobCategory, profile: UserProfile): CareerMatch {
    const reasoning = this.calculateReasoning(career, profile);

    const overallScore = this.calculateOverallScore(reasoning);
    const confidence = this.calculateConfidence(reasoning, profile, career);

    const strengths = this.identifyStrengths(reasoning, career, profile);
    const concerns = this.identifyConcerns(reasoning, career, profile);
    const recommendations = this.generateRecommendations(reasoning, career, profile);

    return {
      career,
      overallScore,
      confidence,
      reasoning,
      strengths,
      concerns,
      recommendations,
    };
  }

  private calculateReasoning(career: JobCategory, profile: UserProfile): MatchReasoning {
    return {
      interestsAlignment: this.evaluateInterests(career, profile),
      skillsMatch: this.evaluateSkills(career, profile),
      experienceAlignment: this.evaluateExperience(career, profile),
      personalityFit: this.evaluatePersonality(career, profile),
      preferencesMatch: this.evaluatePreferences(career, profile),
      educationFit: this.evaluateEducation(career, profile),
    };
  }

  private evaluateInterests(career: JobCategory, profile: UserProfile): MatchReasoning['interestsAlignment'] {
    const userInterests = profile.interests.map(i => i.toLowerCase());
    const careerKeywords = career.keywords.map(k => k.toLowerCase());
    const careerTasks = career.dailyTasks.map(t => t.task.toLowerCase());

    const matchedItems: string[] = [];
    let matchCount = 0;

    userInterests.forEach(interest => {
      if (careerKeywords.some(k => k.includes(interest) || interest.includes(k))) {
        matchedItems.push(interest);
        matchCount++;
      } else if (careerTasks.some(t => t.includes(interest))) {
        matchedItems.push(interest);
        matchCount += 0.5;
      }
    });

    const score = userInterests.length > 0
      ? Math.min(100, (matchCount / userInterests.length) * 100)
      : 50;

    let explanation = '';
    if (score >= 80) {
      explanation = `Excellent alignment! Your interests in ${matchedItems.slice(0, 3).join(', ')} strongly match this role's focus areas.`;
    } else if (score >= 60) {
      explanation = `Good match. Your interests in ${matchedItems.slice(0, 2).join(', ')} align well with this career.`;
    } else if (score >= 40) {
      explanation = `Moderate alignment. Some of your interests (${matchedItems.slice(0, 2).join(', ')}) relate to this role.`;
    } else {
      explanation = `Limited interest overlap. This role focuses on areas different from your stated interests.`;
    }

    return {
      score,
      weight: this.config.weights.interests,
      explanation,
      matchedItems,
    };
  }

  private evaluateSkills(career: JobCategory, profile: UserProfile): MatchReasoning['skillsMatch'] {
    const userSkills = profile.skills.map(s => s.toLowerCase());
    const requiredSkills = career.requiredSkills
      .filter(s => s.importance === 'required')
      .map(s => s.skill.toLowerCase());
    const preferredSkills = career.requiredSkills
      .filter(s => s.importance === 'preferred')
      .map(s => s.skill.toLowerCase());

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const transferableSkills: string[] = [];

    requiredSkills.forEach(required => {
      const match = userSkills.find(user =>
        user.includes(required) || required.includes(user)
      );
      if (match) {
        matchedSkills.push(required);
      } else {
        missingSkills.push(required);
      }
    });

    preferredSkills.forEach(preferred => {
      const match = userSkills.find(user =>
        user.includes(preferred) || preferred.includes(user)
      );
      if (match && !matchedSkills.includes(preferred)) {
        transferableSkills.push(preferred);
      }
    });

    const requiredScore = requiredSkills.length > 0
      ? (matchedSkills.length / requiredSkills.length) * 100
      : 100;
    const preferredBonus = Math.min(20, transferableSkills.length * 5);
    const score = Math.min(100, requiredScore + preferredBonus);

    let explanation = '';
    if (score >= 85) {
      explanation = `Excellent skill match! You have ${matchedSkills.length} of ${requiredSkills.length} required skills.`;
    } else if (score >= 65) {
      explanation = `Good skill foundation. You have ${matchedSkills.length} of ${requiredSkills.length} required skills. ${missingSkills.length > 0 ? `Consider developing: ${missingSkills.slice(0, 2).join(', ')}.` : ''}`;
    } else if (score >= 40) {
      explanation = `Partial skill match. You'll need to develop ${missingSkills.slice(0, 3).join(', ')} to qualify.`;
    } else {
      explanation = `Significant skill gap. This role requires ${requiredSkills.slice(0, 3).join(', ')} which you'll need to learn.`;
    }

    return {
      score,
      weight: this.config.weights.skills,
      explanation,
      matchedSkills,
      missingSkills,
      transferableSkills,
    };
  }

  private evaluateExperience(career: JobCategory, profile: UserProfile): MatchReasoning['experienceAlignment'] {
    const userLevel = profile.experience.level;
    const userYears = profile.experience.yearsOfExperience;
    const userIndustries = profile.experience.industries.map(i => i.toLowerCase());
    const userRoles = profile.experience.roles.map(r => r.toLowerCase());

    const relevantExperience: string[] = [];
    let score = 50;

    const careerProgression = career.careerProgression.find(p => p.level === userLevel);
    if (careerProgression) {
      score += 30;
      relevantExperience.push(`Your ${userLevel}-level experience aligns with this role`);
    }

    const careerKeywords = career.keywords.map(k => k.toLowerCase());
    userIndustries.forEach(industry => {
      if (careerKeywords.some(k => k.includes(industry))) {
        score += 10;
        relevantExperience.push(`Industry experience in ${industry}`);
      }
    });

    userRoles.forEach(role => {
      if (career.relatedRoles.some(r => r.toLowerCase().includes(role))) {
        score += 15;
        relevantExperience.push(`Related role experience: ${role}`);
      }
    });

    if (userYears >= 5) score = Math.min(100, score + 10);

    score = Math.min(100, score);

    let explanation = '';
    if (score >= 80) {
      explanation = `Strong experience match! ${relevantExperience.slice(0, 2).join('. ')}.`;
    } else if (score >= 60) {
      explanation = `Good experience foundation. ${relevantExperience.slice(0, 2).join('. ')}.`;
    } else if (score >= 40) {
      explanation = `Some relevant experience. You have transferable background but may need industry-specific knowledge.`;
    } else {
      explanation = `Limited direct experience. This role typically requires background you don't yet have, but career changers are possible.`;
    }

    return {
      score,
      weight: this.config.weights.experience,
      explanation,
      relevantExperience,
    };
  }

  private evaluatePersonality(career: JobCategory, profile: UserProfile): MatchReasoning['personalityFit'] {
    const traits: string[] = [];
    let score = 50;

    const collaborationTasks = career.dailyTasks.filter(t =>
      t.task.toLowerCase().includes('collaborate') ||
      t.task.toLowerCase().includes('meeting') ||
      t.task.toLowerCase().includes('team')
    );
    const totalCollabTime = collaborationTasks.reduce((sum, t) => sum + t.timePercentage, 0);

    if (totalCollabTime > 30 && profile.personality.workStyle === 'collaborative') {
      score += 15;
      traits.push('Collaborative work style matches team-focused role');
    } else if (totalCollabTime < 20 && profile.personality.workStyle === 'independent') {
      score += 15;
      traits.push('Independent work style matches autonomous role');
    } else if (profile.personality.workStyle === 'mixed') {
      score += 10;
      traits.push('Flexible work style adapts well to this role');
    }

    if (career.industryInsights.some(i => i.trend.toLowerCase().includes('fast-paced'))) {
      if (profile.personality.pace === 'fast-paced') {
        score += 15;
        traits.push('Thrives in fast-paced environment');
      } else if (profile.personality.pace === 'steady') {
        score -= 10;
        traits.push('May find pace challenging');
      }
    }

    const analyticalRoles = ['data', 'analyst', 'engineer', 'scientist'];
    const creativeRoles = ['design', 'marketing', 'content', 'creative'];
    const careerTitle = career.title.toLowerCase();

    if (analyticalRoles.some(r => careerTitle.includes(r)) &&
        profile.personality.problemSolving === 'analytical') {
      score += 15;
      traits.push('Analytical problem-solving fits technical focus');
    } else if (creativeRoles.some(r => careerTitle.includes(r)) &&
               profile.personality.problemSolving === 'creative') {
      score += 15;
      traits.push('Creative problem-solving matches innovative role');
    } else if (profile.personality.problemSolving === 'mixed') {
      score += 10;
      traits.push('Versatile problem-solving approach');
    }

    const seniorRoles = career.careerProgression.filter(p =>
      p.level === 'senior' || p.level === 'executive'
    );
    if (seniorRoles.length > 0 && profile.personality.leadership) {
      score += 10;
      traits.push('Leadership potential for growth');
    }

    score = Math.min(100, Math.max(20, score));

    let explanation = '';
    if (score >= 80) {
      explanation = `Excellent personality fit! ${traits.slice(0, 2).join('. ')}.`;
    } else if (score >= 60) {
      explanation = `Good personality alignment. ${traits.slice(0, 2).join('. ')}.`;
    } else if (score >= 40) {
      explanation = `Moderate fit. ${traits.length > 0 ? traits[0] : 'Some aspects align well'}, but consider if the work style suits you.`;
    } else {
      explanation = `Personality mismatch. This role's work style may not align with your preferences.`;
    }

    return {
      score,
      weight: this.config.weights.personality,
      explanation,
      traits,
    };
  }

  private evaluatePreferences(career: JobCategory, profile: UserProfile): MatchReasoning['preferencesMatch'] {
    const matchedPreferences: string[] = [];
    const tradeoffs: string[] = [];
    let score = 50;

    const envMatch =
      (profile.preferences.workEnvironment.remote && career.workEnvironment.remote) ||
      (profile.preferences.workEnvironment.hybrid && career.workEnvironment.hybrid) ||
      (profile.preferences.workEnvironment.onsite && career.workEnvironment.onsite);

    if (envMatch) {
      score += 20;
      const envType = career.workEnvironment.remote ? 'remote' :
                     career.workEnvironment.hybrid ? 'hybrid' : 'onsite';
      matchedPreferences.push(`Work environment: ${envType}`);
    } else {
      score -= 10;
      tradeoffs.push('Work environment may not match preference');
    }

    const salaryRange = career.salaryRanges.find(s =>
      s.experienceLevel === profile.experience.level
    );
    if (salaryRange) {
      if (salaryRange.median >= profile.preferences.salary.min &&
          salaryRange.median <= profile.preferences.salary.max) {
        score += 20;
        matchedPreferences.push(`Salary aligns ($${salaryRange.median.toLocaleString()})`);
      } else if (salaryRange.median < profile.preferences.salary.min) {
        score -= 15;
        tradeoffs.push(`Salary below preference (${salaryRange.median.toLocaleString()} vs ${profile.preferences.salary.min.toLocaleString()})`);
      }
    }

    const workHours = career.workEnvironment.typicalHours;
    if (profile.preferences.workLifeBalance === 'high' && workHours.includes('40')) {
      score += 10;
      matchedPreferences.push('Good work-life balance');
    } else if (profile.preferences.workLifeBalance === 'low' && workHours.includes('50+')) {
      score += 10;
      matchedPreferences.push('High-intensity work environment');
    } else if (workHours.includes('50+') || workHours.includes('60+')) {
      tradeoffs.push('Demanding hours may impact work-life balance');
    }

    if (career.workEnvironment.travelRequired && !profile.preferences.travelWillingness) {
      score -= 10;
      tradeoffs.push('Role requires travel');
    }

    score = Math.min(100, Math.max(0, score));

    let explanation = '';
    if (score >= 80) {
      explanation = `Great match for your preferences! ${matchedPreferences.slice(0, 2).join('. ')}.`;
    } else if (score >= 60) {
      explanation = `Most preferences aligned. ${matchedPreferences.slice(0, 2).join('. ')}.`;
    } else if (score >= 40) {
      explanation = `Some tradeoffs: ${tradeoffs.slice(0, 2).join('. ')}.`;
    } else {
      explanation = `Significant preference mismatches: ${tradeoffs.slice(0, 2).join('. ')}.`;
    }

    return {
      score,
      weight: this.config.weights.preferences,
      explanation,
      matchedPreferences,
      tradeoffs,
    };
  }

  private evaluateEducation(career: JobCategory, profile: UserProfile): MatchReasoning['educationFit'] {
    const pathways: string[] = [];
    let score = 50;
    let meetsRequirements = false;

    const minDegree = career.education.minimumDegree?.toLowerCase() || '';
    const userLevel = profile.education.level;

    const degreeHierarchy = {
      'high-school': 0,
      'associates': 1,
      'bachelors': 2,
      'masters': 3,
      'phd': 4,
    };

    let requiredLevel = 0;
    if (minDegree.includes('high school') || minDegree.includes('associate')) requiredLevel = 1;
    if (minDegree.includes('bachelor')) requiredLevel = 2;
    if (minDegree.includes('master')) requiredLevel = 3;
    if (minDegree.includes('phd') || minDegree.includes('doctorate')) requiredLevel = 4;

    if (degreeHierarchy[userLevel] >= requiredLevel) {
      score = 100;
      meetsRequirements = true;
      pathways.push('Educational requirements met');
    } else if (requiredLevel > 0) {
      score = 40;
      const gap = requiredLevel - degreeHierarchy[userLevel];
      pathways.push(`Need to complete ${gap === 1 ? 'next degree level' : gap + ' more degree levels'}`);
    } else {
      score = 80;
      meetsRequirements = true;
      pathways.push('No specific degree required');
    }

    if (profile.education.field && minDegree) {
      const fieldLower = profile.education.field.toLowerCase();
      if (minDegree.includes(fieldLower) || career.keywords.some(k => k.toLowerCase().includes(fieldLower))) {
        score = Math.min(100, score + 10);
        pathways.push('Educational background relevant');
      }
    }

    if (career.education.alternativePathways.length > 0 && !meetsRequirements) {
      score += 20;
      pathways.push(...career.education.alternativePathways.slice(0, 2));
    }

    if (career.education.certifications.length > 0 && profile.education.willingToGetCertifications) {
      score += 10;
      pathways.push(`Consider certifications: ${career.education.certifications.slice(0, 2).join(', ')}`);
    }

    let explanation = '';
    if (meetsRequirements) {
      explanation = `You meet the educational requirements. ${pathways[0]}.`;
    } else if (score >= 60) {
      explanation = `Alternative pathways available: ${pathways.slice(1, 3).join('. ')}.`;
    } else {
      explanation = `Additional education needed: ${pathways[0]}.`;
    }

    return {
      score,
      weight: this.config.weights.education,
      explanation,
      meetsRequirements,
      pathways,
    };
  }

  private calculateOverallScore(reasoning: MatchReasoning): number {
    const weightedScore =
      reasoning.interestsAlignment.score * reasoning.interestsAlignment.weight +
      reasoning.skillsMatch.score * reasoning.skillsMatch.weight +
      reasoning.experienceAlignment.score * reasoning.experienceAlignment.weight +
      reasoning.personalityFit.score * reasoning.personalityFit.weight +
      reasoning.preferencesMatch.score * reasoning.preferencesMatch.weight +
      reasoning.educationFit.score * reasoning.educationFit.weight;

    return Math.round(weightedScore);
  }

  private calculateConfidence(reasoning: MatchReasoning, profile: UserProfile, career: JobCategory): number {
    let confidence = 0.5;

    if (profile.interests.length >= 3) confidence += 0.1;
    if (profile.skills.length >= 5) confidence += 0.1;
    if (profile.experience.yearsOfExperience > 0) confidence += 0.1;

    const componentsAboveThreshold = [
      reasoning.interestsAlignment.score,
      reasoning.skillsMatch.score,
      reasoning.experienceAlignment.score,
      reasoning.personalityFit.score,
      reasoning.preferencesMatch.score,
      reasoning.educationFit.score,
    ].filter(score => score >= 60).length;

    confidence += (componentsAboveThreshold / 6) * 0.2;

    return Math.min(1, Math.max(0.3, confidence));
  }

  private identifyStrengths(reasoning: MatchReasoning, career: JobCategory, profile: UserProfile): string[] {
    const strengths: string[] = [];

    if (reasoning.interestsAlignment.score >= 70) {
      strengths.push(`Strong interest alignment (${Math.round(reasoning.interestsAlignment.score)}%)`);
    }

    if (reasoning.skillsMatch.score >= 70 && reasoning.skillsMatch.matchedSkills.length > 0) {
      strengths.push(`${reasoning.skillsMatch.matchedSkills.length} relevant skills`);
    }

    if (reasoning.experienceAlignment.score >= 70) {
      strengths.push('Relevant experience background');
    }

    if (reasoning.personalityFit.score >= 75) {
      strengths.push('Excellent personality fit');
    }

    if (reasoning.preferencesMatch.score >= 70) {
      strengths.push('Matches work preferences');
    }

    if (reasoning.educationFit.meetsRequirements) {
      strengths.push('Meets education requirements');
    }

    const jobOutlook = career.jobOutlook.growthRate;
    if (jobOutlook.includes('faster than average') || jobOutlook.includes('much faster')) {
      strengths.push('Strong job market outlook');
    }

    return strengths.slice(0, 5);
  }

  private identifyConcerns(reasoning: MatchReasoning, career: JobCategory, profile: UserProfile): string[] {
    const concerns: string[] = [];

    if (reasoning.skillsMatch.missingSkills.length > 3) {
      concerns.push(`Need to develop ${reasoning.skillsMatch.missingSkills.length} key skills`);
    }

    if (reasoning.educationFit.score < 60 && !reasoning.educationFit.meetsRequirements) {
      concerns.push('Additional education may be required');
    }

    if (reasoning.experienceAlignment.score < 50) {
      concerns.push('Limited relevant experience');
    }

    if (reasoning.preferencesMatch.tradeoffs.length > 0) {
      concerns.push(...reasoning.preferencesMatch.tradeoffs.slice(0, 2));
    }

    if (career.jobOutlook.competitionLevel === 'high') {
      concerns.push('Highly competitive field');
    }

    if (career.workEnvironment.typicalHours.includes('50+') && profile.preferences.workLifeBalance === 'high') {
      concerns.push('Demanding work hours');
    }

    return concerns.slice(0, 4);
  }

  private generateRecommendations(reasoning: MatchReasoning, career: JobCategory, profile: UserProfile): string[] {
    const recommendations: string[] = [];

    if (reasoning.skillsMatch.missingSkills.length > 0) {
      recommendations.push(`Develop these skills: ${reasoning.skillsMatch.missingSkills.slice(0, 3).join(', ')}`);
    }

    if (career.education.certifications.length > 0 && reasoning.educationFit.score < 90) {
      recommendations.push(`Consider certifications: ${career.education.certifications.slice(0, 2).join(', ')}`);
    }

    if (reasoning.experienceAlignment.score < 70 && career.relatedRoles.length > 0) {
      recommendations.push(`Gain experience in related roles: ${career.relatedRoles.slice(0, 2).join(', ')}`);
    }

    if (reasoning.interestsAlignment.score < 60) {
      recommendations.push(`Research day-to-day tasks to ensure interest alignment`);
    }

    if (!reasoning.educationFit.meetsRequirements && career.education.alternativePathways.length > 0) {
      recommendations.push(`Explore alternative pathways: ${career.education.alternativePathways[0]}`);
    }

    if (career.industryInsights.length > 0) {
      const latestTrend = career.industryInsights[0].trend;
      recommendations.push(`Stay current with: ${latestTrend}`);
    }

    return recommendations.slice(0, 5);
  }

  public updateWeights(newWeights: Partial<MatchingWeights>): void {
    this.config.weights = { ...this.config.weights, ...newWeights };
  }

  public getConfig(): MatchingConfig {
    return { ...this.config };
  }
}

export const careerMatchingEngine = new CareerMatchingEngine();
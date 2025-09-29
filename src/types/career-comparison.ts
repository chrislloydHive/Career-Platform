export interface LifestyleFactors {
  workLifeBalance: {
    score: number; // 1-10 scale
    description: string;
    typicalHours: string;
    flexibility: 'high' | 'medium' | 'low';
    flexibilityDescription: string;
  };
  travelRequirements: {
    frequency: 'none' | 'minimal' | 'moderate' | 'frequent' | 'extensive';
    description: string;
    percentage: number; // 0-100% of time
  };
  scheduleFlexibility: {
    score: number; // 1-10 scale
    remoteWork: 'full' | 'hybrid' | 'occasional' | 'none';
    flexibleHours: boolean;
    description: string;
  };
  stressLevel: {
    score: number; // 1-10 scale (1=low stress, 10=high stress)
    factors: string[];
    description: string;
  };
}

export interface SkillEmphasis {
  technicalSkills: {
    weight: number; // 0-100% emphasis
    primarySkills: string[];
    description: string;
  };
  peopleSkills: {
    weight: number; // 0-100% emphasis
    primarySkills: string[];
    description: string;
  };
  analyticalSkills: {
    weight: number; // 0-100% emphasis
    primarySkills: string[];
    description: string;
  };
  creativeSkills: {
    weight: number; // 0-100% emphasis
    primarySkills: string[];
    description: string;
  };
  leadershipSkills: {
    weight: number; // 0-100% emphasis
    primarySkills: string[];
    description: string;
  };
}

export interface IndustryMobility {
  transferabilityScore: number; // 1-10 scale
  industries: {
    name: string;
    transferability: 'high' | 'medium' | 'low';
    reasoning: string;
  }[];
  skillsTransferability: {
    highly: string[];
    moderately: string[];
    poorly: string[];
  };
  careerPivotOptions: {
    role: string;
    difficulty: 'easy' | 'moderate' | 'challenging';
    timeRequired: string;
    description: string;
  }[];
}

export interface RiskRewardProfile {
  stabilityScore: number; // 1-10 scale (1=low stability, 10=high stability)
  growthPotential: number; // 1-10 scale
  salaryProgression: {
    entryLevel: { min: number; max: number };
    midLevel: { min: number; max: number };
    seniorLevel: { min: number; max: number };
    description: string;
  };
  jobSecurity: {
    score: number; // 1-10 scale
    factors: string[];
    marketOutlook: 'declining' | 'stable' | 'growing' | 'rapidly-growing';
    automationRisk: 'low' | 'medium' | 'high';
  };
  entrepreneurialOpportunity: {
    score: number; // 1-10 scale
    opportunities: string[];
    description: string;
  };
}

export interface CareerPathProfile {
  id: string;
  name: string;
  description: string;
  lifestyle: LifestyleFactors;
  skillEmphasis: SkillEmphasis;
  industryMobility: IndustryMobility;
  riskReward: RiskRewardProfile;
  idealFor: string[];
  notIdealFor: string[];
  timeToCompetency: string;
  educationRequirements: string[];
}

export interface ComparisonInsight {
  category: 'lifestyle' | 'skills' | 'mobility' | 'risk-reward';
  title: string;
  description: string;
  paths: {
    pathId: string;
    score: number;
    reasoning: string;
  }[];
}

export interface CareerPathComparison {
  paths: CareerPathProfile[];
  insights: ComparisonInsight[];
  recommendation: {
    bestFor: {
      workLifeBalance: string;
      careerGrowth: string;
      stability: string;
      creativity: string;
      technicalFocus: string;
      peopleFocus: string;
    };
    tradeOffs: {
      path1: string;
      path2: string;
      comparison: string;
    }[];
  };
}
export interface JobMarketSnapshot {
  location: string;
  careerStage: string;
  jobTitle: string;
  lastUpdated: Date;
  openPositions: number;
  hiringCompanies: HiringCompany[];
  experienceRequirements: ExperienceAnalysis;
  skillRequirements: SkillMarketAnalysis;
  salaryTrends: SalaryTrends;
  marketOutlook: MarketOutlook;
}

export interface HiringCompany {
  name: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  openRoles: number;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  remotePolicy: 'office' | 'hybrid' | 'remote' | 'flexible';
  recentPostings: RecentPosting[];
  hiringTrends: {
    monthlyHires: number;
    growthRate: number;
    averageTimeToFill: number;
  };
}

export interface RecentPosting {
  title: string;
  postedDate: Date;
  location: string;
  experienceRequired: string;
  salaryRange?: {
    min: number;
    max: number;
  };
  isUrgent: boolean;
  keySkills: string[];
}

export interface ExperienceAnalysis {
  averageRequired: number; // years
  range: {
    minimum: number;
    maximum: number;
  };
  distribution: {
    entryLevel: number; // percentage of jobs
    midLevel: number;
    seniorLevel: number;
    expertLevel: number;
  };
  trendsOverTime: {
    month: string;
    averageExperience: number;
  }[];
}

export interface SkillMarketAnalysis {
  totalSkillsRequired: number;
  topSkills: MarketSkill[];
  emergingSkills: MarketSkill[];
  decliningSkills: MarketSkill[];
  skillGaps: SkillGap[];
  competitionLevel: 'low' | 'medium' | 'high' | 'very-high';
}

export interface MarketSkill {
  name: string;
  frequency: number; // percentage of job postings requiring this skill
  importance: 'critical' | 'important' | 'nice-to-have';
  trend: 'rising' | 'stable' | 'declining';
  averageSalaryBoost: number; // percentage salary increase
  certificationAvailable: boolean;
  learningResources: {
    type: 'course' | 'certification' | 'bootcamp' | 'self-study';
    provider: string;
    duration: string;
    cost: number;
  }[];
}

export interface SkillGap {
  skill: string;
  userLevel: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  marketDemand: 'low' | 'medium' | 'high' | 'critical';
  gapSeverity: 'minor' | 'moderate' | 'major' | 'critical';
  timeToClose: string; // e.g., "2-3 months"
  priority: number; // 1-10 ranking for addressing this gap
  impact: string; // description of impact on job prospects
}

export interface SalaryTrends {
  currentRange: {
    min: number;
    max: number;
    median: number;
  };
  trend: 'rising' | 'stable' | 'declining';
  yearOverYearChange: number; // percentage
  locationAdjustment: number; // multiplier for location
  factors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }[];
}

export interface MarketOutlook {
  demandLevel: 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';
  competitionLevel: 'low' | 'medium' | 'high' | 'very-high';
  growthProjection: {
    nextYear: number; // percentage growth
    fiveYear: number;
  };
  automationRisk: 'low' | 'medium' | 'high';
  keyTrends: string[];
  opportunities: string[];
  challenges: string[];
}

export interface UserSkillProfile {
  skills: {
    name: string;
    level: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsOfExperience: number;
    lastUsed: Date;
    certifications: string[];
  }[];
  totalExperience: number;
  location: string;
  preferredRemoteWork: boolean;
  salaryExpectations?: {
    min: number;
    max: number;
  };
}

export interface EnhancedCareerStage {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  marketData: JobMarketSnapshot;
  recommendations: {
    priority: number;
    type: 'skill-development' | 'experience' | 'networking' | 'certification';
    action: string;
    reasoning: string;
    impact: 'low' | 'medium' | 'high';
    timeToComplete: string;
  }[];
  marketReality: {
    viability: 'low' | 'medium' | 'high';
    competitiveness: 'low' | 'medium' | 'high';
    timeToMarket: string;
    successFactors: string[];
    alternativeApproaches: string[];
  };
}

export interface CareerProgressionTimeline {
  userProfile: UserSkillProfile;
  stages: EnhancedCareerStage[];
  overallMarketInsights: {
    bestLocations: string[];
    optimalTiming: string;
    keyCompetitors: string[];
    marketEntry: string;
    riskFactors: string[];
  };
  lastUpdated: Date;
  nextUpdateScheduled: Date;
}
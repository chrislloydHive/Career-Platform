export interface IndustrySalaryVariation {
  industry: string;
  salaryMultiplier: number; // 1.0 = baseline, 1.2 = 20% higher
  salaryRange: {
    junior: { low: number; high: number };
    mid: { low: number; high: number };
    senior: { low: number; high: number };
  };
  totalCompensationNotes: string[];
  benefits: string[];
  equityPotential: 'high' | 'moderate' | 'low' | 'none';
}

export interface IndustryRoleDifferences {
  industry: string;
  roleVariation: string;
  keyDifferences: string[];
  specificResponsibilities: string[];
  toolsAndTechnologies: string[];
  workEnvironment: string;
  teamStructure: string;
  careerProgression: string[];
  challenges: string[];
  opportunities: string[];
}

export interface IndustryGrowthProjection {
  industry: string;
  overallGrowthRate: number; // Annual percentage growth
  timeframe: string;
  roleSpecificGrowth: {
    junior: 'high' | 'moderate' | 'slow' | 'declining';
    mid: 'high' | 'moderate' | 'slow' | 'declining';
    senior: 'high' | 'moderate' | 'slow' | 'declining';
  };
  drivingFactors: string[];
  futureOutlook: string;
  recommendedPreparation: string[];
}

export interface IndustryHiringPatterns {
  industry: string;
  hiringVolume: 'very-high' | 'high' | 'moderate' | 'low';
  seasonality: string;
  commonCompanyTypes: string[];
  typicalCompanySizes: string[];
  remoteWorkAvailability: 'high' | 'moderate' | 'low' | 'rare';
  locationConcentration: string[];
  recruitionChannels: string[];
  interviewProcess: string[];
}

export interface IndustryContext {
  careerTitle: string;
  industryVariations: IndustryRoleDifferences[];
  salaryVariations: IndustrySalaryVariation[];
  growthProjections: IndustryGrowthProjection[];
  hiringPatterns: IndustryHiringPatterns[];
  topIndustries: string[];
  industryTransitionDifficulty: Record<string, {
    difficulty: 'easy' | 'moderate' | 'hard' | 'very-hard';
    timeToTransition: string;
    requiredPreparation: string[];
    successTips: string[];
  }>;
}

export interface EnhancedCareerPath {
  // Extend existing career path interfaces with industry context
  industryContext: IndustryContext;
}

// Common industry categories
export const MAJOR_INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Retail & E-commerce',
  'Manufacturing',
  'Consulting',
  'Media & Entertainment',
  'Government & Non-profit',
  'Energy & Utilities',
  'Education',
  'Real Estate',
  'Transportation & Logistics'
] as const;

export type MajorIndustry = typeof MAJOR_INDUSTRIES[number];

// Industry-specific characteristics
export interface IndustryCharacteristics {
  industry: MajorIndustry;
  typicalCompanySize: 'startup' | 'mid-size' | 'enterprise' | 'mixed';
  workCulture: string;
  paceOfWork: 'fast' | 'moderate' | 'steady';
  innovationLevel: 'cutting-edge' | 'modern' | 'traditional';
  regulatoryEnvironment: 'highly-regulated' | 'moderately-regulated' | 'flexible';
  budgetConstraints: 'high-budget' | 'moderate-budget' | 'cost-conscious';
}
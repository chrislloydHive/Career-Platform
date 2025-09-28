export type CareerCategory = 'healthcare' | 'tech' | 'marketing' | 'finance' | 'education' | 'business' | 'wellness' | 'design';

export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';

export interface DailyTask {
  task: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  timePercentage: number;
}

export interface SkillRequirement {
  skill: string;
  category: 'technical' | 'soft' | 'certification';
  importance: 'required' | 'preferred' | 'nice-to-have';
  description?: string;
}

export interface SalaryRange {
  min: number;
  max: number;
  median: number;
  currency: string;
  period: 'yearly';
  experienceLevel: ExperienceLevel;
}

export interface CareerProgression {
  level: ExperienceLevel;
  title: string;
  yearsExperience: string;
  typicalSalaryRange: SalaryRange;
  keyResponsibilities: string[];
  requiredSkills: string[];
}

export interface IndustryInsight {
  topic: string;
  description: string;
  trend: 'growing' | 'stable' | 'declining';
  source?: string;
}

export interface JobCategory {
  id: string;
  category: CareerCategory;
  title: string;
  description: string;
  alternativeTitles: string[];
  dailyTasks: DailyTask[];
  requiredSkills: SkillRequirement[];
  salaryRanges: SalaryRange[];
  careerProgression: CareerProgression[];
  industryInsights: IndustryInsight[];
  workEnvironment: {
    remote: boolean;
    hybrid: boolean;
    onsite: boolean;
    travelRequired: boolean;
    typicalHours: string;
  };
  jobOutlook: {
    growthRate: string;
    projectedJobs: string;
    competitionLevel: 'low' | 'medium' | 'high';
  };
  education: {
    minimumDegree?: string;
    preferredDegree?: string;
    certifications: string[];
    alternativePathways: string[];
  };
  relatedRoles: string[];
  keywords: string[];
  activeTab?: string;
}

export interface CareerResearchQuery {
  category?: CareerCategory;
  experienceLevel?: ExperienceLevel;
  skills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  keywords?: string[];
}

export interface CareerMatch {
  jobCategory: JobCategory;
  matchScore: number;
  matchReasons: string[];
  missingSkills: string[];
  salaryAlignment: 'below' | 'within' | 'above';
}
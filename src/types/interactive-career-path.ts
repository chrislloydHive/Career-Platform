export interface GeographicSalaryData {
  location: string;
  lowRange: number;
  highRange: number;
  costOfLivingIndex: number;
  marketDemand: 'very-high' | 'high' | 'moderate' | 'low';
}

export interface DayInLifeScenario {
  timeSlot: string;
  activity: string;
  description: string;
  skillsUsed: string[];
}

export interface DetailedJobDescription {
  overview: string;
  coreResponsibilities: string[];
  typicalProjects: string[];
  workEnvironment: string;
  dayInLife: DayInLifeScenario[];
  requiredEducation: string[];
  preferredExperience: string[];
  careerProgression: string[];
}

export interface InteractiveSkill {
  name: string;
  importance: 'critical' | 'important' | 'beneficial';
  timeToLearn: string;
  howToLearn: string[];
  currentLevel: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  userHasSkill: boolean;
  cost: string;
  certifications?: string[];
}

export interface InteractiveCareerStage {
  id: string;
  title: string;
  timeframe: string;
  baselineTimeframe: string; // Original timeframe before user preferences
  salaryData: GeographicSalaryData[];
  jobDescription: DetailedJobDescription;
  requiredSkills: InteractiveSkill[];
  keyMilestones: string[];
  transitionCriteria: string[];
}

export interface TimelinePreference {
  speed: 'accelerated' | 'standard' | 'gradual';
  label: string;
  description: string;
  timeMultiplier: number; // 0.7 for accelerated, 1.0 for standard, 1.4 for gradual
}

export interface SavedCareerPath {
  id: string;
  pathName: string;
  savedAt: Date;
  customizations: {
    timelinePreference: TimelinePreference;
    selectedGeography: string;
    skillsMarkedAsHave: string[];
    personalNotes: string;
  };
}

export interface PersonalizedDevelopmentPlan {
  skillsToLearn: InteractiveSkill[];
  estimatedTotalTime: string;
  estimatedCost: string;
  priorityOrder: string[];
  quickWins: InteractiveSkill[]; // Skills user can learn quickly
  foundationSkills: InteractiveSkill[]; // Critical skills to start with
  advancedSkills: InteractiveSkill[]; // Skills for later stages
}

export interface InteractiveCareerPath {
  id: string;
  pathName: string;
  description: string;
  stages: InteractiveCareerStage[];
  skillDevelopment: InteractiveSkill[];
  industryDemand: 'very-high' | 'high' | 'growing' | 'stable' | 'competitive';
  matchScore: number;
  whyThisPath: string[];

  // Interactive features
  isExpanded: boolean;
  selectedStageId?: string;
  timelinePreference: TimelinePreference;
  selectedGeography: string;
  developmentPlan: PersonalizedDevelopmentPlan;
  isSaved: boolean;
}

export const DEFAULT_TIMELINE_PREFERENCES: TimelinePreference[] = [
  {
    speed: 'accelerated',
    label: 'Fast Track',
    description: 'Intensive learning and quicker progression',
    timeMultiplier: 0.7
  },
  {
    speed: 'standard',
    label: 'Standard Pace',
    description: 'Balanced progression with steady learning',
    timeMultiplier: 1.0
  },
  {
    speed: 'gradual',
    label: 'Gradual Growth',
    description: 'Thorough learning with extended timelines',
    timeMultiplier: 1.4
  }
];

export const DEFAULT_GEOGRAPHIC_MARKETS = [
  'San Francisco, CA',
  'New York, NY',
  'Seattle, WA',
  'Austin, TX',
  'Chicago, IL',
  'Boston, MA',
  'Los Angeles, CA',
  'Denver, CO',
  'Remote (US Average)',
  'Global Remote'
];
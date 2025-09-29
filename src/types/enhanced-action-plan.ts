export interface ActionableTask {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  dueDate?: Date;
  isCompleted: boolean;
  completedDate?: Date;
  resources: TaskResource[];
  templates: TaskTemplate[];
  linkedSkills: string[];
  prerequisites: string[];
  tags: string[];
}

export interface TaskResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'tool' | 'template' | 'course' | 'book' | 'website';
  url?: string;
  description: string;
  cost: 'free' | 'paid' | 'freemium';
  provider?: string;
  duration?: string;
  rating?: number;
}

export interface TaskTemplate {
  id: string;
  title: string;
  type: 'email' | 'document' | 'checklist' | 'script' | 'plan';
  content: string;
  variables: string[];
  instructions: string;
  examples: string[];
}

export interface SkillAlignmentMap {
  skillName: string;
  relatedTasks: string[];
  progressWeight: number;
  milestones: SkillMilestone[];
}

export interface SkillMilestone {
  id: string;
  title: string;
  description: string;
  requiredTasks: string[];
  skillLevelUnlocked: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface UnifiedTimelineEvent {
  id: string;
  title: string;
  type: 'skill' | 'task' | 'milestone' | 'application' | 'networking' | 'interview';
  date: Date;
  duration: number; // in days
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dependencies: string[];
  linkedItems: {
    tasks?: string[];
    skills?: string[];
    applications?: string[];
  };
  description?: string;
  actionRequired?: string;
}

export interface CareerResearchTask extends ActionableTask {
  careerTitle: string;
  researchAreas: string[];
  informationalInterviews: {
    targetRoles: string[];
    companies: string[];
    questions: string[];
  };
  marketAnalysis: {
    salaryResearch: boolean;
    jobTrendAnalysis: boolean;
    skillDemandAnalysis: boolean;
  };
}

export interface SkillBuildingTask extends ActionableTask {
  skillName: string;
  currentLevel: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  learningPath: {
    courses: string[];
    projects: string[];
    certifications: string[];
  };
  practiceActivities: string[];
  assessmentCriteria: string[];
}

export interface NetworkingTask extends ActionableTask {
  networkingType: 'linkedin' | 'events' | 'informational_interview' | 'cold_outreach' | 'referral';
  targetPeople: {
    roles: string[];
    companies: string[];
    industries: string[];
  };
  platforms: string[];
  messageTemplates: TaskTemplate[];
  followUpSchedule: string[];
}

export interface JobSearchTask extends ActionableTask {
  searchStrategy: 'direct_application' | 'networking' | 'recruiting' | 'cold_outreach';
  targetCompanies: string[];
  targetRoles: string[];
  applicationMaterials: {
    resume: boolean;
    coverLetter: boolean;
    portfolio: boolean;
    references: boolean;
  };
  trackingMethod: string;
}

export interface EnhancedActionPlan {
  careerResearchTasks: CareerResearchTask[];
  skillBuildingTasks: SkillBuildingTask[];
  networkingTasks: NetworkingTask[];
  jobSearchTasks: JobSearchTask[];
  skillAlignmentMap: SkillAlignmentMap[];
  unifiedTimeline: UnifiedTimelineEvent[];
  completionMetrics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    averageCompletionTime: number;
  };
}

export interface TaskProgress {
  taskId: string;
  startDate?: Date;
  timeSpent: number; // in minutes
  progressNotes: string[];
  blockers: string[];
  helpNeeded: string[];
  completionEvidence: string[];
}

export interface ActionPlanMetrics {
  weeklyGoals: {
    tasksToComplete: number;
    skillsToImprove: number;
    networkingContacts: number;
    applicationsToSubmit: number;
  };
  monthlyMilestones: {
    careerResearchProgress: number;
    skillDevelopmentProgress: number;
    networkingProgress: number;
    jobSearchProgress: number;
  };
  overallProgress: {
    readinessScore: number;
    timelineAdherence: number;
    goalAchievement: number;
  };
}
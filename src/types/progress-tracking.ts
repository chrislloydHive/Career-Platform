export interface CourseProgress {
  id: string;
  title: string;
  provider: string;
  type: 'course' | 'certification' | 'book' | 'practice' | 'bootcamp';
  duration: string;
  cost: 'free' | 'low' | 'medium' | 'high';
  url?: string;
  skillArea: string;
  priority: 'critical' | 'important' | 'beneficial';
  dateAdded: Date;
  dateStarted?: Date;
  dateCompleted?: Date;
  timeSpent: number; // minutes
  isCompleted: boolean;
  notes?: string;
  rating?: number; // 1-5 stars
}

export interface SkillProgress {
  skillName: string;
  category: 'technical' | 'soft' | 'industry' | 'certification';
  currentLevel: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  importance: 'critical' | 'important' | 'beneficial';
  timeToAcquire: string;
  totalTimeSpent: number; // minutes
  courses: CourseProgress[];
  milestones: SkillMilestone[];
  lastUpdated: Date;
}

export interface SkillMilestone {
  id: string;
  description: string;
  isCompleted: boolean;
  dateCompleted?: Date;
  evidence?: string; // URL to portfolio/certificate/project
}

export interface CareerReadinessScore {
  overall: number; // 0-100
  breakdown: {
    technicalSkills: number;
    softSkills: number;
    industryKnowledge: number;
    experience: number;
  };
  lastUpdated: Date;
  careerPath: string;
  improvementAreas: string[];
  nextSteps: string[];
}

export interface LearningOpportunity {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'certification' | 'event' | 'book' | 'bootcamp' | 'webinar' | 'practice';
  provider: string;
  skillAreas: string[];
  relevanceScore: number; // 0-100
  cost: 'free' | 'low' | 'medium' | 'high';
  duration: string;
  startDate?: Date;
  endDate?: Date;
  url?: string;
  isBookmarked: boolean;
  isDismissed: boolean;
  dateAdded: Date;
}

export interface ProgressEntry {
  id: string;
  type: 'course_started' | 'course_completed' | 'skill_improved' | 'milestone_achieved' | 'time_logged' | 'opportunity_found';
  title: string;
  description: string;
  skillArea?: string;
  timeSpent?: number;
  date: Date;
  metadata?: Record<string, unknown>;
}

export interface MentorShare {
  id: string;
  shareType: 'progress_summary' | 'skill_roadmap' | 'achievement' | 'help_request';
  recipientEmail: string;
  recipientName: string;
  message: string;
  sharedData: {
    progressSummary?: ProgressSummary;
    skillRoadmap?: SkillProgress[];
    achievements?: ProgressEntry[];
    helpWith?: string[];
  };
  dateShared: Date;
  isViewed?: boolean;
  mentorResponse?: string;
}

export interface ProgressSummary {
  totalTimeSpent: number; // minutes
  coursesCompleted: number;
  coursesInProgress: number;
  skillsImproved: number;
  currentReadinessScore: CareerReadinessScore;
  previousReadinessScore?: CareerReadinessScore;
  recentAchievements: ProgressEntry[];
  weeklyProgress: {
    week: string; // YYYY-MM-DD
    timeSpent: number;
    coursesCompleted: number;
    skillsWorkedOn: string[];
  }[];
  monthlyProgress: {
    month: string; // YYYY-MM
    timeSpent: number;
    coursesCompleted: number;
    skillsImproved: number;
    readinessScoreChange: number;
  }[];
}

export interface ProgressTrackingState {
  skills: SkillProgress[];
  courses: CourseProgress[];
  opportunities: LearningOpportunity[];
  progressEntries: ProgressEntry[];
  mentorShares: MentorShare[];
  summary: ProgressSummary;
  lastSync: Date;
}

export interface NotificationSettings {
  weeklyProgress: boolean;
  newOpportunities: boolean;
  milestoneReminders: boolean;
  readinessScoreChanges: boolean;
  mentorResponseAlerts: boolean;
  courseDeadlines: boolean;
}

export interface ProgressPreferences {
  targetCareerPath: string;
  weeklyTimeGoal: number; // minutes
  preferredLearningTypes: ('course' | 'certification' | 'book' | 'practice' | 'bootcamp' | 'event' | 'webinar')[];
  notifications: NotificationSettings;
  shareWithMentors: boolean;
  autoTrackTime: boolean;
}
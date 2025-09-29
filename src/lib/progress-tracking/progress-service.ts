import {
  ProgressTrackingState,
  SkillProgress,
  CourseProgress,
  ProgressEntry,
  CareerReadinessScore,
  LearningOpportunity,
  ProgressSummary,
  MentorShare,
  ProgressPreferences
} from '@/types/progress-tracking';

export class ProgressTrackingService {
  private static readonly STORAGE_KEY = 'career_progress_tracking';
  private static readonly PREFERENCES_KEY = 'progress_preferences';
  private static instance: ProgressTrackingService;

  private state: ProgressTrackingState;
  private preferences: ProgressPreferences;
  private listeners: ((state: ProgressTrackingState) => void)[] = [];

  private constructor() {
    this.state = this.loadState();
    this.preferences = this.loadPreferences();
  }

  static getInstance(): ProgressTrackingService {
    if (!ProgressTrackingService.instance) {
      ProgressTrackingService.instance = new ProgressTrackingService();
    }
    return ProgressTrackingService.instance;
  }

  private loadState(): ProgressTrackingState {
    if (typeof window === 'undefined') {
      return this.getDefaultState();
    }

    try {
      const stored = localStorage.getItem(ProgressTrackingService.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          lastSync: new Date(parsed.lastSync),
          skills: parsed.skills.map((skill: Record<string, unknown>) => ({
            ...skill,
            lastUpdated: new Date(skill.lastUpdated),
            courses: (skill.courses as Record<string, unknown>[]).map((course: Record<string, unknown>) => ({
              ...course,
              dateAdded: new Date(course.dateAdded),
              dateStarted: course.dateStarted ? new Date(course.dateStarted) : undefined,
              dateCompleted: course.dateCompleted ? new Date(course.dateCompleted) : undefined
            }))
          })),
          progressEntries: parsed.progressEntries.map((entry: Record<string, unknown>) => ({
            ...entry,
            date: new Date(entry.date)
          })),
          opportunities: parsed.opportunities.map((opp: Record<string, unknown>) => ({
            ...opp,
            dateAdded: new Date(opp.dateAdded),
            startDate: opp.startDate ? new Date(opp.startDate) : undefined,
            endDate: opp.endDate ? new Date(opp.endDate) : undefined
          }))
        };
      }
    } catch (error) {
      console.error('Error loading progress state:', error);
    }

    return this.getDefaultState();
  }

  private loadPreferences(): ProgressPreferences {
    if (typeof window === 'undefined') {
      return this.getDefaultPreferences();
    }

    try {
      const stored = localStorage.getItem(ProgressTrackingService.PREFERENCES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }

    return this.getDefaultPreferences();
  }

  private getDefaultState(): ProgressTrackingState {
    return {
      skills: [],
      courses: [],
      opportunities: [],
      progressEntries: [],
      mentorShares: [],
      summary: this.generateSummary([], [], []),
      lastSync: new Date()
    };
  }

  private getDefaultPreferences(): ProgressPreferences {
    return {
      targetCareerPath: '',
      weeklyTimeGoal: 600, // 10 hours
      preferredLearningTypes: ['course', 'certification', 'practice'],
      notifications: {
        weeklyProgress: true,
        newOpportunities: true,
        milestoneReminders: true,
        readinessScoreChanges: true,
        mentorResponseAlerts: true,
        courseDeadlines: true
      },
      shareWithMentors: false,
      autoTrackTime: true
    };
  }

  private saveState(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ProgressTrackingService.STORAGE_KEY, JSON.stringify(this.state));
        this.notifyListeners();
      } catch (error) {
        console.error('Error saving progress state:', error);
      }
    }
  }

  private savePreferences(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ProgressTrackingService.PREFERENCES_KEY, JSON.stringify(this.preferences));
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: ProgressTrackingState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): ProgressTrackingState {
    return { ...this.state };
  }

  getPreferences(): ProgressPreferences {
    return { ...this.preferences };
  }

  updatePreferences(preferences: Partial<ProgressPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    this.savePreferences();
  }

  addSkill(skillData: Omit<SkillProgress, 'courses' | 'milestones' | 'lastUpdated' | 'totalTimeSpent'>): void {
    const skill: SkillProgress = {
      ...skillData,
      courses: [],
      milestones: [],
      totalTimeSpent: 0,
      lastUpdated: new Date()
    };

    this.state.skills.push(skill);
    this.addProgressEntry({
      type: 'skill_improved',
      title: `Started tracking skill: ${skill.skillName}`,
      description: `Added ${skill.skillName} to your development roadmap`,
      skillArea: skill.skillName
    });

    this.updateSummary();
    this.saveState();
  }

  updateSkillLevel(skillName: string, newLevel: SkillProgress['currentLevel']): void {
    const skill = this.state.skills.find(s => s.skillName === skillName);
    if (skill) {
      const oldLevel = skill.currentLevel;
      skill.currentLevel = newLevel;
      skill.lastUpdated = new Date();

      this.addProgressEntry({
        type: 'skill_improved',
        title: `Skill level improved: ${skillName}`,
        description: `Advanced from ${oldLevel} to ${newLevel}`,
        skillArea: skillName
      });

      this.updateSummary();
      this.saveState();
    }
  }

  addCourseToSkill(skillName: string, course: Omit<CourseProgress, 'id' | 'dateAdded' | 'timeSpent' | 'isCompleted'>): void {
    const skill = this.state.skills.find(s => s.skillName === skillName);
    if (skill) {
      const newCourse: CourseProgress = {
        ...course,
        id: `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dateAdded: new Date(),
        timeSpent: 0,
        isCompleted: false
      };

      skill.courses.push(newCourse);
      this.state.courses.push(newCourse);

      this.addProgressEntry({
        type: 'course_started',
        title: `Added course: ${course.title}`,
        description: `Added to ${skillName} development plan`,
        skillArea: skillName
      });

      this.updateSummary();
      this.saveState();
    }
  }

  startCourse(courseId: string): void {
    const course = this.state.courses.find(c => c.id === courseId);
    if (course && !course.dateStarted) {
      course.dateStarted = new Date();

      this.addProgressEntry({
        type: 'course_started',
        title: `Started course: ${course.title}`,
        description: `Began ${course.title} by ${course.provider}`,
        skillArea: course.skillArea
      });

      this.updateSummary();
      this.saveState();
    }
  }

  completeCourse(courseId: string, rating?: number, notes?: string): void {
    const course = this.state.courses.find(c => c.id === courseId);
    if (course) {
      course.isCompleted = true;
      course.dateCompleted = new Date();
      if (rating) course.rating = rating;
      if (notes) course.notes = notes;

      this.addProgressEntry({
        type: 'course_completed',
        title: `Completed course: ${course.title}`,
        description: `Finished ${course.title} by ${course.provider}`,
        skillArea: course.skillArea,
        timeSpent: course.timeSpent
      });

      this.updateSummary();
      this.saveState();
    }
  }

  logTime(courseId: string, minutes: number): void {
    const course = this.state.courses.find(c => c.id === courseId);
    if (course) {
      course.timeSpent += minutes;

      const skill = this.state.skills.find(s => s.skillName === course.skillArea);
      if (skill) {
        skill.totalTimeSpent += minutes;
        skill.lastUpdated = new Date();
      }

      this.addProgressEntry({
        type: 'time_logged',
        title: `Logged ${minutes} minutes`,
        description: `Time spent on ${course.title}`,
        skillArea: course.skillArea,
        timeSpent: minutes
      });

      this.updateSummary();
      this.saveState();
    }
  }

  addLearningOpportunity(opportunity: Omit<LearningOpportunity, 'id' | 'dateAdded' | 'isBookmarked' | 'isDismissed'>): void {
    const newOpportunity: LearningOpportunity = {
      ...opportunity,
      id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dateAdded: new Date(),
      isBookmarked: false,
      isDismissed: false
    };

    this.state.opportunities.push(newOpportunity);

    this.addProgressEntry({
      type: 'opportunity_found',
      title: `New learning opportunity: ${opportunity.title}`,
      description: `Found relevant ${opportunity.type} for ${opportunity.skillAreas.join(', ')}`,
      metadata: { opportunityId: newOpportunity.id }
    });

    this.updateSummary();
    this.saveState();
  }

  bookmarkOpportunity(opportunityId: string): void {
    const opportunity = this.state.opportunities.find(o => o.id === opportunityId);
    if (opportunity) {
      opportunity.isBookmarked = !opportunity.isBookmarked;
      this.saveState();
    }
  }

  dismissOpportunity(opportunityId: string): void {
    const opportunity = this.state.opportunities.find(o => o.id === opportunityId);
    if (opportunity) {
      opportunity.isDismissed = true;
      this.saveState();
    }
  }

  private addProgressEntry(entry: Omit<ProgressEntry, 'id' | 'date'>): void {
    const newEntry: ProgressEntry = {
      ...entry,
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date()
    };

    this.state.progressEntries.unshift(newEntry);

    // Keep only last 1000 entries to prevent excessive storage
    if (this.state.progressEntries.length > 1000) {
      this.state.progressEntries = this.state.progressEntries.slice(0, 1000);
    }
  }

  calculateCareerReadinessScore(careerPath: string): CareerReadinessScore {
    const relevantSkills = (this.state?.skills || []).filter(skill =>
      this.isSkillRelevantToCareer(skill.skillName, careerPath)
    );

    if (relevantSkills.length === 0) {
      return {
        overall: 0,
        breakdown: {
          technicalSkills: 0,
          softSkills: 0,
          industryKnowledge: 0,
          experience: 0
        },
        lastUpdated: new Date(),
        careerPath,
        improvementAreas: ['No relevant skills tracked yet'],
        nextSteps: ['Start adding skills to your development plan']
      };
    }

    const technicalSkills = relevantSkills.filter(s => s.category === 'technical');
    const softSkills = relevantSkills.filter(s => s.category === 'soft');
    const industrySkills = relevantSkills.filter(s => s.category === 'industry');

    const technicalScore = this.calculateSkillCategoryScore(technicalSkills);
    const softScore = this.calculateSkillCategoryScore(softSkills);
    const industryScore = this.calculateSkillCategoryScore(industrySkills);

    // Experience score based on total time spent and courses completed
    const totalTimeHours = (this.state?.summary?.totalTimeSpent || 0) / 60;
    const completedCourses = this.state?.summary?.coursesCompleted || 0;
    const experienceScore = Math.min(100, (totalTimeHours * 2) + (completedCourses * 10));

    const overall = Math.round((technicalScore * 0.35) + (softScore * 0.25) + (industryScore * 0.25) + (experienceScore * 0.15));

    return {
      overall,
      breakdown: {
        technicalSkills: Math.round(technicalScore),
        softSkills: Math.round(softScore),
        industryKnowledge: Math.round(industryScore),
        experience: Math.round(experienceScore)
      },
      lastUpdated: new Date(),
      careerPath,
      improvementAreas: this.identifyImprovementAreas(relevantSkills),
      nextSteps: this.generateNextSteps(relevantSkills, careerPath)
    };
  }

  private isSkillRelevantToCareer(skillName: string, careerPath: string): boolean {
    const skillLower = skillName.toLowerCase();
    const careerLower = careerPath.toLowerCase();

    const relevanceMap: Record<string, string[]> = {
      'data analyst': ['data', 'sql', 'python', 'excel', 'tableau', 'power bi', 'statistics', 'analysis'],
      'product manager': ['product', 'strategy', 'analytics', 'communication', 'leadership', 'research'],
      'ux designer': ['design', 'user', 'figma', 'sketch', 'research', 'prototyping', 'wireframing'],
      'software engineer': ['programming', 'javascript', 'python', 'react', 'node', 'git', 'algorithms'],
      'data scientist': ['python', 'machine learning', 'statistics', 'sql', 'tensorflow', 'data', 'analysis']
    };

    const keywords = relevanceMap[careerLower] || [];
    return keywords.some(keyword => skillLower.includes(keyword));
  }

  private calculateSkillCategoryScore(skills: SkillProgress[]): number {
    if (skills.length === 0) return 0;

    const levelScores = {
      'none': 0,
      'beginner': 25,
      'intermediate': 50,
      'advanced': 75,
      'expert': 100
    };

    const totalScore = skills.reduce((sum, skill) => {
      const baseScore = levelScores[skill.currentLevel];
      const timeBonus = Math.min(25, skill.totalTimeSpent / 60 * 0.5); // Small bonus for time invested
      const courseBonus = Math.min(15, skill.courses.filter(c => c.isCompleted).length * 5);
      return sum + baseScore + timeBonus + courseBonus;
    }, 0);

    return Math.min(100, totalScore / skills.length);
  }

  private identifyImprovementAreas(skills: SkillProgress[]): string[] {
    const areas: string[] = [];

    const criticalSkills = skills.filter(s => s.importance === 'critical');
    const beginnerLevel = criticalSkills.filter(s => s.currentLevel === 'beginner' || s.currentLevel === 'none');

    if (beginnerLevel.length > 0) {
      areas.push(`Critical skills need development: ${beginnerLevel.map(s => s.skillName).join(', ')}`);
    }

    const lowTime = skills.filter(s => s.totalTimeSpent < 300); // Less than 5 hours
    if (lowTime.length > 0) {
      areas.push('Increase practice time for key skills');
    }

    const noCourses = skills.filter(s => s.courses.length === 0);
    if (noCourses.length > 0) {
      areas.push('Add learning resources for skill development');
    }

    return areas.length > 0 ? areas : ['Continue steady progress on all skill areas'];
  }

  private generateNextSteps(skills: SkillProgress[], careerPath: string): string[] {
    const steps: string[] = [];

    const criticalSkills = skills.filter(s => s.importance === 'critical' && (s.currentLevel === 'none' || s.currentLevel === 'beginner'));
    if (criticalSkills.length > 0) {
      steps.push(`Focus on critical skills: ${criticalSkills[0].skillName}`);
    }

    const inProgressCourses = this.state.courses.filter(c => c.dateStarted && !c.isCompleted);
    if (inProgressCourses.length > 0) {
      steps.push(`Complete in-progress course: ${inProgressCourses[0].title}`);
    }

    const readySkills = skills.filter(s => s.currentLevel === 'intermediate' && s.importance === 'critical');
    if (readySkills.length > 0) {
      steps.push(`Advance ${readySkills[0].skillName} to advanced level`);
    }

    if (this.state.summary.totalTimeSpent < this.preferences.weeklyTimeGoal) {
      steps.push(`Increase weekly learning time to ${this.preferences.weeklyTimeGoal / 60} hours`);
    }

    return steps.length > 0 ? steps : ['Continue current learning plan'];
  }

  private updateSummary(): void {
    this.state.summary = this.generateSummary(
      this.state.skills,
      this.state.courses,
      this.state.progressEntries
    );
    this.state.lastSync = new Date();
  }

  private generateSummary(skills: SkillProgress[], courses: CourseProgress[], entries: ProgressEntry[]): ProgressSummary {
    const totalTimeSpent = courses.reduce((sum, course) => sum + course.timeSpent, 0);
    const coursesCompleted = courses.filter(c => c.isCompleted).length;
    const coursesInProgress = courses.filter(c => c.dateStarted && !c.isCompleted).length;
    const skillsImproved = skills.filter(s => s.currentLevel !== 'none').length;

    const recentAchievements = entries
      .filter(e => ['course_completed', 'skill_improved', 'milestone_achieved'].includes(e.type))
      .slice(0, 10);

    // Generate weekly progress for last 12 weeks
    const weeklyProgress = this.generateWeeklyProgress(entries, 12);

    // Generate monthly progress for last 6 months
    const monthlyProgress = this.generateMonthlyProgress(entries, skills, 6);

    return {
      totalTimeSpent,
      coursesCompleted,
      coursesInProgress,
      skillsImproved,
      currentReadinessScore: this.calculateCareerReadinessScore(this.preferences?.targetCareerPath || ''),
      recentAchievements,
      weeklyProgress,
      monthlyProgress
    };
  }

  private generateWeeklyProgress(entries: ProgressEntry[], weeks: number) {
    const now = new Date();
    const weeklyData = [];

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekEntries = entries.filter(e => e.date >= weekStart && e.date <= weekEnd);

      weeklyData.unshift({
        week: weekStart.toISOString().split('T')[0],
        timeSpent: weekEntries.reduce((sum, e) => sum + (e.timeSpent || 0), 0),
        coursesCompleted: weekEntries.filter(e => e.type === 'course_completed').length,
        skillsWorkedOn: [...new Set(weekEntries.map(e => e.skillArea).filter(Boolean))]
      });
    }

    return weeklyData;
  }

  private generateMonthlyProgress(entries: ProgressEntry[], skills: SkillProgress[], months: number) {
    const now = new Date();
    const monthlyData = [];

    for (let i = 0; i < months; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

      const monthEntries = entries.filter(e => e.date >= monthStart && e.date <= monthEnd);

      monthlyData.unshift({
        month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
        timeSpent: monthEntries.reduce((sum, e) => sum + (e.timeSpent || 0), 0),
        coursesCompleted: monthEntries.filter(e => e.type === 'course_completed').length,
        skillsImproved: monthEntries.filter(e => e.type === 'skill_improved').length,
        readinessScoreChange: 0 // Could calculate historical changes if previous scores were stored
      });
    }

    return monthlyData;
  }

  // Mentor sharing functionality
  sharewithMentor(
    recipientEmail: string,
    recipientName: string,
    shareType: MentorShare['shareType'],
    message: string,
    additionalData?: Record<string, unknown>
  ): string {
    const share: MentorShare = {
      id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      shareType,
      recipientEmail,
      recipientName,
      message,
      sharedData: this.prepareShareData(shareType, additionalData),
      dateShared: new Date()
    };

    this.state.mentorShares.push(share);
    this.saveState();

    // In a real implementation, this would send an email or notification
    console.log('Sharing with mentor:', share);

    return share.id;
  }

  private prepareShareData(shareType: MentorShare['shareType'], additionalData?: Record<string, unknown>) {
    switch (shareType) {
      case 'progress_summary':
        return { progressSummary: this.state.summary };
      case 'skill_roadmap':
        return { skillRoadmap: this.state.skills };
      case 'achievement':
        return { achievements: this.state.summary.recentAchievements };
      case 'help_request':
        return { helpWith: additionalData?.helpWith || [] };
      default:
        return {};
    }
  }

  exportData(): string {
    return JSON.stringify(this.state, null, 2);
  }

  importData(jsonData: string): void {
    try {
      const importedState = JSON.parse(jsonData);
      this.state = {
        ...importedState,
        lastSync: new Date()
      };
      this.updateSummary();
      this.saveState();
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid import data format');
    }
  }

  clearData(): void {
    this.state = this.getDefaultState();
    this.saveState();
  }
}
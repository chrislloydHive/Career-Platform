import { AdaptiveQuestioningEngine } from '@/lib/adaptive-questions/adaptive-engine';
import { CareerFitScore } from '@/lib/matching/realtime-career-matcher';
import {
  EnhancedActionPlan,
  ActionableTask,
  CareerResearchTask,
  SkillBuildingTask,
  NetworkingTask,
  JobSearchTask,
  TaskResource,
  TaskTemplate,
  SkillAlignmentMap,
  UnifiedTimelineEvent,
  SkillMilestone
} from '@/types/enhanced-action-plan';

type ExportedProfile = ReturnType<AdaptiveQuestioningEngine['exportProfile']> & {
  topCareers?: CareerFitScore[];
};

export class EnhancedActionPlanGenerator {
  static generateActionPlan(profile: ExportedProfile): EnhancedActionPlan {
    const strengths = profile.analysis.strengths || [];
    const preferences = profile.analysis.preferences || [];
    const topCareers = profile.topCareers || [];

    const careerResearchTasks = this.generateCareerResearchTasks(topCareers, profile);
    const skillBuildingTasks = this.generateSkillBuildingTasks(strengths, topCareers);
    const networkingTasks = this.generateNetworkingTasks(topCareers, profile);
    const jobSearchTasks = this.generateJobSearchTasks(profile);
    const skillAlignmentMap = this.createSkillAlignmentMap(skillBuildingTasks, careerResearchTasks);
    const unifiedTimeline = this.createUnifiedTimeline(
      careerResearchTasks,
      skillBuildingTasks,
      networkingTasks,
      jobSearchTasks
    );

    const allTasks = [
      ...careerResearchTasks,
      ...skillBuildingTasks,
      ...networkingTasks,
      ...jobSearchTasks
    ];

    return {
      careerResearchTasks,
      skillBuildingTasks,
      networkingTasks,
      jobSearchTasks,
      skillAlignmentMap,
      unifiedTimeline,
      completionMetrics: {
        totalTasks: allTasks.length,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0,
        averageCompletionTime: 0
      }
    };
  }

  private static generateCareerResearchTasks(
    topCareers: CareerFitScore[],
    profile: ExportedProfile
  ): CareerResearchTask[] {
    const tasks: CareerResearchTask[] = [];

    topCareers.slice(0, 3).forEach((career, index) => {
      // Company Research Task
      tasks.push({
        id: `career_research_companies_${career.careerTitle.replace(/\s+/g, '_').toLowerCase()}`,
        title: `Research Top Companies for ${career.careerTitle}`,
        description: `Identify and research 10-15 companies actively hiring for ${career.careerTitle} roles`,
        priority: index === 0 ? 'critical' : 'high',
        estimatedTime: '4-6 hours',
        difficulty: 'medium',
        category: 'Career Research',
        isCompleted: false,
        resources: this.getCompanyResearchResources(career.careerTitle),
        templates: this.getCompanyResearchTemplates(),
        linkedSkills: ['Research', 'Market Analysis'],
        prerequisites: [],
        tags: ['research', 'companies', career.careerTitle.toLowerCase()],
        careerTitle: career.careerTitle,
        researchAreas: ['Company Culture', 'Hiring Practices', 'Required Skills', 'Compensation', 'Growth Opportunities'],
        informationalInterviews: {
          targetRoles: [career.careerTitle, `Senior ${career.careerTitle}`, `Lead ${career.careerTitle}`],
          companies: this.getTargetCompanies(career.careerTitle),
          questions: this.getInformationalInterviewQuestions(career.careerTitle)
        },
        marketAnalysis: {
          salaryResearch: true,
          jobTrendAnalysis: true,
          skillDemandAnalysis: true
        }
      });

      // Day in the Life Research
      tasks.push({
        id: `career_research_daily_${career.careerTitle.replace(/\s+/g, '_').toLowerCase()}`,
        title: `Understand Daily Responsibilities of ${career.careerTitle}`,
        description: `Research and document what a typical day looks like for someone in a ${career.careerTitle} role`,
        priority: 'medium',
        estimatedTime: '2-3 hours',
        difficulty: 'easy',
        category: 'Career Research',
        isCompleted: false,
        resources: this.getDayInLifeResources(career.careerTitle),
        templates: this.getDayInLifeTemplates(),
        linkedSkills: ['Research', 'Communication'],
        prerequisites: [],
        tags: ['research', 'daily-life', career.careerTitle.toLowerCase()],
        careerTitle: career.careerTitle,
        researchAreas: ['Daily Tasks', 'Tools Used', 'Challenges', 'Rewards', 'Career Progression'],
        informationalInterviews: {
          targetRoles: [career.careerTitle],
          companies: [],
          questions: [
            'What does a typical day look like in your role?',
            'What tools and technologies do you use daily?',
            'What are the biggest challenges you face?',
            'What do you enjoy most about your work?'
          ]
        },
        marketAnalysis: {
          salaryResearch: false,
          jobTrendAnalysis: false,
          skillDemandAnalysis: true
        }
      });

      // Informational Interview Task
      tasks.push({
        id: `career_research_interviews_${career.careerTitle.replace(/\s+/g, '_').toLowerCase()}`,
        title: `Conduct 3 Informational Interviews for ${career.careerTitle}`,
        description: `Schedule and conduct informational interviews with professionals in ${career.careerTitle} roles`,
        priority: 'high',
        estimatedTime: '6-8 hours',
        difficulty: 'hard',
        category: 'Career Research',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isCompleted: false,
        resources: this.getInformationalInterviewResources(),
        templates: this.getInformationalInterviewTemplates(),
        linkedSkills: ['Networking', 'Communication', 'Research'],
        prerequisites: [`career_research_companies_${career.careerTitle.replace(/\s+/g, '_').toLowerCase()}`],
        tags: ['networking', 'interviews', career.careerTitle.toLowerCase()],
        careerTitle: career.careerTitle,
        researchAreas: ['Role Requirements', 'Career Path', 'Industry Insights', 'Skill Recommendations'],
        informationalInterviews: {
          targetRoles: [career.careerTitle, `Senior ${career.careerTitle}`],
          companies: this.getTargetCompanies(career.careerTitle),
          questions: this.getInformationalInterviewQuestions(career.careerTitle)
        },
        marketAnalysis: {
          salaryResearch: true,
          jobTrendAnalysis: true,
          skillDemandAnalysis: true
        }
      });
    });

    return tasks;
  }

  private static generateSkillBuildingTasks(
    strengths: string[],
    topCareers: CareerFitScore[]
  ): SkillBuildingTask[] {
    const tasks: SkillBuildingTask[] = [];
    const skillsNeeded = this.identifySkillGaps(strengths, topCareers);

    skillsNeeded.forEach((skillInfo, index) => {
      tasks.push({
        id: `skill_building_${skillInfo.skill.replace(/\s+/g, '_').toLowerCase()}`,
        title: `Develop ${skillInfo.skill} Skills`,
        description: `Build proficiency in ${skillInfo.skill} from ${skillInfo.currentLevel} to ${skillInfo.targetLevel}`,
        priority: skillInfo.priority,
        estimatedTime: skillInfo.estimatedTime,
        difficulty: this.getSkillDifficulty(skillInfo.skill),
        category: 'Skill Building',
        dueDate: new Date(Date.now() + this.getSkillTimelineInDays(skillInfo.estimatedTime) * 24 * 60 * 60 * 1000),
        isCompleted: false,
        resources: this.getSkillResources(skillInfo.skill),
        templates: this.getSkillTemplates(skillInfo.skill),
        linkedSkills: [skillInfo.skill],
        prerequisites: this.getSkillPrerequisites(skillInfo.skill),
        tags: ['skill-building', skillInfo.skill.toLowerCase(), skillInfo.priority],
        skillName: skillInfo.skill,
        currentLevel: skillInfo.currentLevel,
        targetLevel: skillInfo.targetLevel,
        learningPath: this.createLearningPath(skillInfo.skill),
        practiceActivities: this.getPracticeActivities(skillInfo.skill),
        assessmentCriteria: this.getAssessmentCriteria(skillInfo.skill)
      });
    });

    return tasks;
  }

  private static generateNetworkingTasks(
    topCareers: CareerFitScore[],
    profile: ExportedProfile
  ): NetworkingTask[] {
    const tasks: NetworkingTask[] = [];

    // LinkedIn Profile Optimization
    tasks.push({
      id: 'networking_linkedin_optimization',
      title: 'Optimize LinkedIn Profile for Target Roles',
      description: 'Update LinkedIn profile to attract recruiters and connections in your target career field',
      priority: 'critical',
      estimatedTime: '3-4 hours',
      difficulty: 'medium',
      category: 'Networking',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      isCompleted: false,
      resources: this.getLinkedInOptimizationResources(),
      templates: this.getLinkedInTemplates(),
      linkedSkills: ['Personal Branding', 'Communication'],
      prerequisites: [],
      tags: ['linkedin', 'profile', 'optimization'],
      networkingType: 'linkedin',
      targetPeople: {
        roles: topCareers.slice(0, 3).map(c => c.careerTitle),
        companies: topCareers.flatMap(c => this.getTargetCompanies(c.careerTitle)).slice(0, 10),
        industries: this.getTargetIndustries(topCareers)
      },
      platforms: ['LinkedIn'],
      messageTemplates: this.getLinkedInMessageTemplates(),
      followUpSchedule: ['1 week', '1 month', '3 months']
    });

    // Industry Events Research and Attendance
    tasks.push({
      id: 'networking_industry_events',
      title: 'Attend 2 Industry Events or Meetups',
      description: 'Research and attend relevant industry events, meetups, or conferences',
      priority: 'high',
      estimatedTime: '8-12 hours',
      difficulty: 'medium',
      category: 'Networking',
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 2 months
      isCompleted: false,
      resources: this.getEventNetworkingResources(),
      templates: this.getEventNetworkingTemplates(),
      linkedSkills: ['Networking', 'Communication', 'Presentation'],
      prerequisites: ['networking_linkedin_optimization'],
      tags: ['events', 'meetups', 'conferences'],
      networkingType: 'events',
      targetPeople: {
        roles: topCareers.slice(0, 3).map(c => c.careerTitle),
        companies: [],
        industries: this.getTargetIndustries(topCareers)
      },
      platforms: ['Meetup', 'Eventbrite', 'Industry Associations'],
      messageTemplates: this.getEventFollowUpTemplates(),
      followUpSchedule: ['24 hours', '1 week', '1 month']
    });

    // Cold Outreach Campaign
    tasks.push({
      id: 'networking_cold_outreach',
      title: 'Execute Strategic Cold Outreach Campaign',
      description: 'Reach out to 20 professionals in your target field for advice and insights',
      priority: 'high',
      estimatedTime: '10-15 hours',
      difficulty: 'hard',
      category: 'Networking',
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 1.5 months
      isCompleted: false,
      resources: this.getColdOutreachResources(),
      templates: this.getColdOutreachTemplates(),
      linkedSkills: ['Communication', 'Research', 'Persistence'],
      prerequisites: ['networking_linkedin_optimization'],
      tags: ['cold-outreach', 'networking', 'research'],
      networkingType: 'cold_outreach',
      targetPeople: {
        roles: topCareers.slice(0, 3).map(c => c.careerTitle),
        companies: topCareers.flatMap(c => this.getTargetCompanies(c.careerTitle)).slice(0, 15),
        industries: this.getTargetIndustries(topCareers)
      },
      platforms: ['LinkedIn', 'Email', 'Twitter'],
      messageTemplates: this.getColdOutreachMessageTemplates(),
      followUpSchedule: ['1 week', '2 weeks', '1 month']
    });

    return tasks;
  }

  private static generateJobSearchTasks(profile: ExportedProfile): JobSearchTask[] {
    const tasks: JobSearchTask[] = [];

    // Resume Optimization
    tasks.push({
      id: 'job_search_resume_optimization',
      title: 'Optimize Resume for Target Roles',
      description: 'Update and tailor resume to highlight relevant skills and experiences for target positions',
      priority: 'critical',
      estimatedTime: '4-6 hours',
      difficulty: 'medium',
      category: 'Job Search',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
      isCompleted: false,
      resources: this.getResumeOptimizationResources(),
      templates: this.getResumeTemplates(),
      linkedSkills: ['Writing', 'Personal Branding'],
      prerequisites: [],
      tags: ['resume', 'optimization', 'application'],
      searchStrategy: 'direct_application',
      targetCompanies: [],
      targetRoles: profile.topCareers?.slice(0, 3).map(c => c.careerTitle) || [],
      applicationMaterials: {
        resume: true,
        coverLetter: false,
        portfolio: false,
        references: false
      },
      trackingMethod: 'Spreadsheet'
    });

    // Application Tracking System Setup
    tasks.push({
      id: 'job_search_tracking_setup',
      title: 'Set Up Application Tracking System',
      description: 'Create a system to track job applications, interview schedules, and follow-ups',
      priority: 'high',
      estimatedTime: '2-3 hours',
      difficulty: 'easy',
      category: 'Job Search',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      isCompleted: false,
      resources: this.getTrackingSystemResources(),
      templates: this.getTrackingSystemTemplates(),
      linkedSkills: ['Organization', 'Planning'],
      prerequisites: [],
      tags: ['tracking', 'organization', 'system'],
      searchStrategy: 'direct_application',
      targetCompanies: [],
      targetRoles: [],
      applicationMaterials: {
        resume: false,
        coverLetter: false,
        portfolio: false,
        references: false
      },
      trackingMethod: 'Custom System'
    });

    // Portfolio Development (if applicable)
    if (this.needsPortfolio(profile.topCareers || [])) {
      tasks.push({
        id: 'job_search_portfolio_development',
        title: 'Create Professional Portfolio',
        description: 'Develop a portfolio showcasing your skills, projects, and achievements',
        priority: 'high',
        estimatedTime: '15-20 hours',
        difficulty: 'hard',
        category: 'Job Search',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
        isCompleted: false,
        resources: this.getPortfolioResources(),
        templates: this.getPortfolioTemplates(),
        linkedSkills: ['Design', 'Presentation', 'Technical Skills'],
        prerequisites: ['job_search_resume_optimization'],
        tags: ['portfolio', 'showcase', 'projects'],
        searchStrategy: 'direct_application',
        targetCompanies: [],
        targetRoles: profile.topCareers?.slice(0, 3).map(c => c.careerTitle) || [],
        applicationMaterials: {
          resume: false,
          coverLetter: false,
          portfolio: true,
          references: false
        },
        trackingMethod: 'Portfolio Platform'
      });
    }

    return tasks;
  }

  private static createSkillAlignmentMap(
    skillTasks: SkillBuildingTask[],
    researchTasks: CareerResearchTask[]
  ): SkillAlignmentMap[] {
    const alignmentMap: SkillAlignmentMap[] = [];

    skillTasks.forEach(task => {
      const relatedTasks = [
        task.id,
        ...researchTasks.filter(rt =>
          rt.linkedSkills.some(skill => task.linkedSkills.includes(skill))
        ).map(rt => rt.id)
      ];

      alignmentMap.push({
        skillName: task.skillName,
        relatedTasks,
        progressWeight: task.priority === 'critical' ? 0.4 : task.priority === 'high' ? 0.3 : 0.2,
        milestones: this.createSkillMilestones(task.skillName, task.currentLevel, task.targetLevel)
      });
    });

    return alignmentMap;
  }

  private static createUnifiedTimeline(
    careerTasks: CareerResearchTask[],
    skillTasks: SkillBuildingTask[],
    networkingTasks: NetworkingTask[],
    jobSearchTasks: JobSearchTask[]
  ): UnifiedTimelineEvent[] {
    const events: UnifiedTimelineEvent[] = [];
    const now = new Date();

    // Add all tasks as timeline events
    [...careerTasks, ...skillTasks, ...networkingTasks, ...jobSearchTasks].forEach(task => {
      const startDate = task.dueDate ? new Date(task.dueDate.getTime() - this.getTaskDurationInDays(task.estimatedTime) * 24 * 60 * 60 * 1000) : now;

      events.push({
        id: `timeline_${task.id}`,
        title: task.title,
        type: this.getTimelineEventType(task),
        date: startDate,
        duration: this.getTaskDurationInDays(task.estimatedTime),
        priority: task.priority === 'critical' ? 'critical' : task.priority,
        status: 'pending',
        dependencies: task.prerequisites,
        linkedItems: {
          tasks: [task.id],
          skills: task.linkedSkills
        },
        description: task.description,
        actionRequired: `Complete: ${task.title}`
      });
    });

    // Add milestone events
    const milestones = [
      {
        id: 'milestone_1month_review',
        title: '1-Month Progress Review',
        date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        description: 'Review progress on all action plan items and adjust timeline as needed'
      },
      {
        id: 'milestone_3month_review',
        title: '3-Month Career Readiness Assessment',
        date: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        description: 'Comprehensive review of career readiness and job search preparation'
      },
      {
        id: 'milestone_6month_review',
        title: '6-Month Goal Achievement Review',
        date: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
        description: 'Evaluate achievement of career transition goals and plan next steps'
      }
    ];

    milestones.forEach(milestone => {
      events.push({
        id: milestone.id,
        title: milestone.title,
        type: 'milestone',
        date: milestone.date,
        duration: 1,
        priority: 'high',
        status: 'pending',
        dependencies: [],
        linkedItems: {},
        description: milestone.description,
        actionRequired: 'Schedule review session'
      });
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Helper methods for generating resources and templates
  private static getCompanyResearchResources(careerTitle: string): TaskResource[] {
    return [
      {
        id: 'glassdoor_research',
        title: 'Glassdoor Company Research',
        type: 'website',
        url: 'https://www.glassdoor.com',
        description: 'Research company reviews, salaries, and interview experiences',
        cost: 'freemium',
        provider: 'Glassdoor',
        rating: 4.5
      },
      {
        id: 'linkedin_company_pages',
        title: 'LinkedIn Company Pages Analysis',
        type: 'website',
        url: 'https://www.linkedin.com',
        description: 'Analyze company culture, recent updates, and employee profiles',
        cost: 'freemium',
        provider: 'LinkedIn',
        rating: 4.7
      },
      {
        id: 'company_research_template',
        title: 'Company Research Template',
        type: 'template',
        description: 'Structured template for documenting company research',
        cost: 'free'
      }
    ];
  }

  private static getCompanyResearchTemplates(): TaskTemplate[] {
    return [
      {
        id: 'company_profile_template',
        title: 'Company Profile Research Template',
        type: 'document',
        content: `# Company Research: {COMPANY_NAME}

## Basic Information
- Industry: {INDUSTRY}
- Size: {EMPLOYEE_COUNT}
- Location: {HEADQUARTERS}
- Founded: {FOUNDED_YEAR}

## Culture & Values
- Mission: {MISSION}
- Values: {VALUES}
- Work Environment: {WORK_ENVIRONMENT}

## Opportunities
- Open Positions: {OPEN_POSITIONS}
- Career Growth: {CAREER_GROWTH}
- Learning & Development: {LEARNING_OPPORTUNITIES}

## Compensation & Benefits
- Salary Range: {SALARY_RANGE}
- Benefits: {BENEFITS}
- Work-Life Balance: {WORK_LIFE_BALANCE}

## Interview Process
- Steps: {INTERVIEW_STEPS}
- Timeline: {INTERVIEW_TIMELINE}
- Key Questions: {COMMON_QUESTIONS}

## Decision Factors
- Pros: {PROS}
- Cons: {CONS}
- Overall Rating: {RATING}/10`,
        variables: ['COMPANY_NAME', 'INDUSTRY', 'EMPLOYEE_COUNT', 'HEADQUARTERS', 'FOUNDED_YEAR', 'MISSION', 'VALUES', 'WORK_ENVIRONMENT', 'OPEN_POSITIONS', 'CAREER_GROWTH', 'LEARNING_OPPORTUNITIES', 'SALARY_RANGE', 'BENEFITS', 'WORK_LIFE_BALANCE', 'INTERVIEW_STEPS', 'INTERVIEW_TIMELINE', 'COMMON_QUESTIONS', 'PROS', 'CONS', 'RATING'],
        instructions: 'Fill out this template for each company you research to maintain consistent documentation.',
        examples: ['Example: Google company research', 'Example: Startup company research']
      }
    ];
  }

  private static getTargetCompanies(careerTitle: string): string[] {
    const companyMap: Record<string, string[]> = {
      'Data Analyst': ['Google', 'Meta', 'Amazon', 'Netflix', 'Spotify', 'Airbnb'],
      'Product Manager': ['Apple', 'Google', 'Meta', 'Uber', 'Stripe', 'Figma'],
      'UX Designer': ['Apple', 'Google', 'Figma', 'Adobe', 'Spotify', 'Airbnb'],
      'Software Engineer': ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix'],
      'Data Scientist': ['Google', 'Meta', 'Netflix', 'Uber', 'Airbnb', 'Spotify']
    };

    return companyMap[careerTitle] || ['Google', 'Meta', 'Amazon', 'Apple', 'Microsoft', 'Netflix'];
  }

  private static getInformationalInterviewQuestions(careerTitle: string): string[] {
    const baseQuestions = [
      'What does a typical day look like in your role?',
      'What skills are most important for success?',
      'How did you get started in this field?',
      'What do you enjoy most about your work?',
      'What are the biggest challenges you face?',
      'What advice would you give to someone looking to enter this field?',
      'What trends do you see shaping the future of this role?',
      'What would you do differently if you were starting your career today?'
    ];

    const roleSpecificQuestions: Record<string, string[]> = {
      'Data Analyst': [
        'What data tools and technologies do you use most frequently?',
        'How do you communicate findings to non-technical stakeholders?',
        'What types of business problems do you typically solve?'
      ],
      'Product Manager': [
        'How do you prioritize features and requirements?',
        'How do you work with engineering and design teams?',
        'What metrics do you use to measure product success?'
      ],
      'UX Designer': [
        'What is your design process from concept to delivery?',
        'How do you conduct and incorporate user research?',
        'What design tools and software do you recommend?'
      ]
    };

    return [...baseQuestions, ...(roleSpecificQuestions[careerTitle] || [])];
  }

  private static getDayInLifeResources(careerTitle: string): TaskResource[] {
    return [
      {
        id: 'day_in_life_youtube',
        title: `Day in the Life - ${careerTitle} Videos`,
        type: 'video',
        url: `https://www.youtube.com/results?search_query=day+in+the+life+${careerTitle.replace(/\s+/g, '+')}`,
        description: 'YouTube videos showing real professionals in their daily work',
        cost: 'free',
        provider: 'YouTube'
      },
      {
        id: 'reddit_career_discussions',
        title: 'Reddit Career Discussions',
        type: 'website',
        url: 'https://www.reddit.com/r/cscareerquestions',
        description: 'Community discussions about daily work experiences',
        cost: 'free',
        provider: 'Reddit'
      }
    ];
  }

  private static getDayInLifeTemplates(): TaskTemplate[] {
    return [
      {
        id: 'day_in_life_research_template',
        title: 'Day in the Life Research Template',
        type: 'document',
        content: `# Day in the Life: {ROLE_TITLE}

## Daily Schedule
### Morning (9 AM - 12 PM)
- {MORNING_ACTIVITIES}

### Afternoon (12 PM - 5 PM)
- {AFTERNOON_ACTIVITIES}

### Evening/Flexible Hours
- {EVENING_ACTIVITIES}

## Tools & Technologies Used
- {TOOLS_LIST}

## Key Responsibilities
- {RESPONSIBILITIES}

## Challenges & Problem-Solving
- {DAILY_CHALLENGES}

## Interactions & Meetings
- {TEAM_INTERACTIONS}
- {STAKEHOLDER_MEETINGS}

## Skills Applied Daily
- {DAILY_SKILLS}

## Work Environment
- {WORK_ENVIRONMENT}

## Career Growth Activities
- {GROWTH_ACTIVITIES}`,
        variables: ['ROLE_TITLE', 'MORNING_ACTIVITIES', 'AFTERNOON_ACTIVITIES', 'EVENING_ACTIVITIES', 'TOOLS_LIST', 'RESPONSIBILITIES', 'DAILY_CHALLENGES', 'TEAM_INTERACTIONS', 'STAKEHOLDER_MEETINGS', 'DAILY_SKILLS', 'WORK_ENVIRONMENT', 'GROWTH_ACTIVITIES'],
        instructions: 'Use this template to document insights from day-in-the-life research.',
        examples: []
      }
    ];
  }

  private static getInformationalInterviewResources(): TaskResource[] {
    return [
      {
        id: 'informational_interview_guide',
        title: 'The Complete Guide to Informational Interviews',
        type: 'article',
        url: 'https://www.themuse.com/advice/how-to-ask-for-an-informational-interview-and-get-a-yes',
        description: 'Comprehensive guide on conducting effective informational interviews',
        cost: 'free',
        provider: 'The Muse'
      },
      {
        id: 'linkedin_connection_strategies',
        title: 'LinkedIn Connection and Outreach Strategies',
        type: 'course',
        description: 'Learn effective ways to connect with professionals on LinkedIn',
        cost: 'paid',
        provider: 'LinkedIn Learning',
        duration: '2 hours'
      }
    ];
  }

  private static getInformationalInterviewTemplates(): TaskTemplate[] {
    return [
      {
        id: 'informational_interview_request',
        title: 'Informational Interview Request Email',
        type: 'email',
        content: `Subject: Seeking Career Advice - {YOUR_BACKGROUND} Interested in {THEIR_ROLE}

Hi {FIRST_NAME},

I hope this message finds you well. My name is {YOUR_NAME}, and I'm currently {YOUR_CURRENT_SITUATION}.

I've been researching careers in {THEIR_FIELD} and came across your profile. Your experience at {THEIR_COMPANY} and background in {SPECIFIC_EXPERIENCE} particularly caught my attention.

I would be incredibly grateful for 15-20 minutes of your time to learn about your career journey and get your insights on the {THEIR_ROLE} field. I'm specifically interested in:

- {SPECIFIC_QUESTION_1}
- {SPECIFIC_QUESTION_2}
- {SPECIFIC_QUESTION_3}

I understand you must be very busy, so I'm happy to work around your schedule. I could meet over coffee, have a phone call, or even just exchange a few emails if that works better for you.

Thank you so much for considering my request. I really appreciate any guidance you can provide.

Best regards,
{YOUR_NAME}
{YOUR_CONTACT_INFO}`,
        variables: ['YOUR_NAME', 'YOUR_BACKGROUND', 'THEIR_ROLE', 'FIRST_NAME', 'YOUR_CURRENT_SITUATION', 'THEIR_FIELD', 'THEIR_COMPANY', 'SPECIFIC_EXPERIENCE', 'SPECIFIC_QUESTION_1', 'SPECIFIC_QUESTION_2', 'SPECIFIC_QUESTION_3', 'YOUR_CONTACT_INFO'],
        instructions: 'Personalize this template for each person you reach out to. Research their background thoroughly before sending.',
        examples: ['Example for reaching out to a Product Manager', 'Example for reaching out to a Data Scientist']
      }
    ];
  }

  // Additional helper methods would continue here...
  private static identifySkillGaps(strengths: string[], topCareers: CareerFitScore[]) {
    // This would analyze the gap between current strengths and required skills
    return [
      {
        skill: 'Data Analysis',
        currentLevel: 'beginner' as const,
        targetLevel: 'intermediate' as const,
        priority: 'critical' as const,
        estimatedTime: '3-4 months'
      },
      {
        skill: 'Communication',
        currentLevel: 'intermediate' as const,
        targetLevel: 'advanced' as const,
        priority: 'high' as const,
        estimatedTime: '2-3 months'
      }
    ];
  }

  private static getSkillDifficulty(skill: string): 'easy' | 'medium' | 'hard' {
    const technicalSkills = ['Programming', 'Data Analysis', 'Machine Learning', 'System Design'];
    const softSkills = ['Communication', 'Leadership', 'Presentation'];

    if (technicalSkills.some(ts => skill.includes(ts))) return 'hard';
    if (softSkills.some(ss => skill.includes(ss))) return 'medium';
    return 'medium';
  }

  private static getSkillTimelineInDays(estimatedTime: string): number {
    if (estimatedTime.includes('week')) return parseInt(estimatedTime) * 7;
    if (estimatedTime.includes('month')) return parseInt(estimatedTime) * 30;
    return 30; // default
  }

  private static getSkillResources(skill: string): TaskResource[] {
    // Return skill-specific resources
    return [
      {
        id: `${skill.toLowerCase()}_course`,
        title: `${skill} Fundamentals Course`,
        type: 'course',
        description: `Comprehensive course covering ${skill} basics`,
        cost: 'paid',
        provider: 'Coursera',
        duration: '4-6 weeks'
      }
    ];
  }

  private static getSkillTemplates(skill: string): TaskTemplate[] {
    return [
      {
        id: `${skill.toLowerCase()}_learning_plan`,
        title: `${skill} Learning Plan`,
        type: 'plan',
        content: `Learning plan template for ${skill}`,
        variables: ['SKILL_NAME', 'CURRENT_LEVEL', 'TARGET_LEVEL'],
        instructions: `Customize this plan for learning ${skill}`,
        examples: []
      }
    ];
  }

  private static getSkillPrerequisites(skill: string): string[] {
    const prerequisiteMap: Record<string, string[]> = {
      'Machine Learning': ['Data Analysis', 'Statistics', 'Programming'],
      'Advanced Analytics': ['Data Analysis', 'Statistics'],
      'Leadership': ['Communication', 'Team Collaboration']
    };

    return prerequisiteMap[skill] || [];
  }

  private static createLearningPath(skill: string) {
    return {
      courses: [`${skill} Fundamentals`, `Advanced ${skill}`],
      projects: [`${skill} Practice Project`, `${skill} Portfolio Project`],
      certifications: [`${skill} Certification`]
    };
  }

  private static getPracticeActivities(skill: string): string[] {
    return [
      `Daily ${skill} practice (30 minutes)`,
      `Weekly ${skill} project work`,
      `Monthly ${skill} assessment`
    ];
  }

  private static getAssessmentCriteria(skill: string): string[] {
    return [
      `Demonstrate ${skill} fundamentals`,
      `Complete practical ${skill} project`,
      `Explain ${skill} concepts to others`
    ];
  }

  private static createSkillMilestones(skillName: string, currentLevel: string, targetLevel: string): SkillMilestone[] {
    return [
      {
        id: `${skillName.toLowerCase()}_milestone_1`,
        title: `${skillName} Foundation`,
        description: `Complete basic ${skillName} training`,
        requiredTasks: [`skill_building_${skillName.replace(/\s+/g, '_').toLowerCase()}`],
        skillLevelUnlocked: 'beginner'
      }
    ];
  }

  private static getTimelineEventType(task: ActionableTask): UnifiedTimelineEvent['type'] {
    if (task.category === 'Skill Building') return 'skill';
    if (task.category === 'Networking') return 'networking';
    if (task.category === 'Job Search') return 'application';
    return 'task';
  }

  private static getTaskDurationInDays(estimatedTime: string): number {
    if (estimatedTime.includes('hour')) {
      const hours = parseInt(estimatedTime);
      return Math.ceil(hours / 8); // Assuming 8 hours per day
    }
    if (estimatedTime.includes('day')) return parseInt(estimatedTime);
    if (estimatedTime.includes('week')) return parseInt(estimatedTime) * 7;
    return 7; // default
  }

  private static getTargetIndustries(topCareers: CareerFitScore[]): string[] {
    return ['Technology', 'Healthcare', 'Finance', 'Education', 'Consulting'];
  }

  private static getLinkedInOptimizationResources(): TaskResource[] {
    return [
      {
        id: 'linkedin_optimization_guide',
        title: 'LinkedIn Profile Optimization Guide',
        type: 'article',
        url: 'https://www.linkedin.com/help/linkedin/answer/a519819',
        description: 'Official LinkedIn guide for optimizing your profile',
        cost: 'free',
        provider: 'LinkedIn'
      }
    ];
  }

  private static getLinkedInTemplates(): TaskTemplate[] {
    return [
      {
        id: 'linkedin_headline_template',
        title: 'LinkedIn Headline Template',
        type: 'template',
        content: '{CURRENT_ROLE} | {KEY_SKILL_1} & {KEY_SKILL_2} | Passionate about {INTEREST} | Open to {TARGET_OPPORTUNITIES}',
        variables: ['CURRENT_ROLE', 'KEY_SKILL_1', 'KEY_SKILL_2', 'INTEREST', 'TARGET_OPPORTUNITIES'],
        instructions: 'Create a compelling headline that showcases your value proposition',
        examples: []
      }
    ];
  }

  private static getLinkedInMessageTemplates(): TaskTemplate[] {
    return [
      {
        id: 'linkedin_connection_request',
        title: 'LinkedIn Connection Request',
        type: 'template',
        content: 'Hi {FIRST_NAME}, I noticed we both work in {INDUSTRY}. I\'d love to connect and learn from your experience in {THEIR_ROLE}.',
        variables: ['FIRST_NAME', 'INDUSTRY', 'THEIR_ROLE'],
        instructions: 'Personalize connection requests to increase acceptance rates',
        examples: []
      }
    ];
  }

  private static getEventNetworkingResources(): TaskResource[] {
    return [
      {
        id: 'meetup_platform',
        title: 'Meetup - Find Industry Events',
        type: 'website',
        url: 'https://www.meetup.com',
        description: 'Platform for finding local professional meetups and events',
        cost: 'free'
      }
    ];
  }

  private static getEventNetworkingTemplates(): TaskTemplate[] {
    return [
      {
        id: 'event_introduction_script',
        title: 'Event Introduction Script',
        type: 'script',
        content: 'Hi, I\'m {YOUR_NAME}. I\'m {YOUR_BACKGROUND} and I\'m exploring opportunities in {TARGET_FIELD}. What brings you to this event?',
        variables: ['YOUR_NAME', 'YOUR_BACKGROUND', 'TARGET_FIELD'],
        instructions: 'Practice this introduction before attending networking events',
        examples: []
      }
    ];
  }

  private static getEventFollowUpTemplates(): TaskTemplate[] {
    return [
      {
        id: 'event_follow_up_email',
        title: 'Post-Event Follow-up Email',
        type: 'email',
        content: 'Hi {FIRST_NAME}, It was great meeting you at {EVENT_NAME} yesterday. I enjoyed our conversation about {CONVERSATION_TOPIC}. I\'d love to continue our discussion over coffee sometime.',
        variables: ['FIRST_NAME', 'EVENT_NAME', 'CONVERSATION_TOPIC'],
        instructions: 'Send follow-up emails within 24-48 hours of meeting someone',
        examples: []
      }
    ];
  }

  private static getColdOutreachResources(): TaskResource[] {
    return [
      {
        id: 'cold_outreach_guide',
        title: 'The Art of Cold Outreach',
        type: 'article',
        description: 'Guide to effective cold outreach strategies',
        cost: 'free'
      }
    ];
  }

  private static getColdOutreachTemplates(): TaskTemplate[] {
    return [
      {
        id: 'cold_outreach_email',
        title: 'Cold Outreach Email Template',
        type: 'email',
        content: 'Subject: Quick question about {SPECIFIC_TOPIC}\n\nHi {FIRST_NAME},\n\nI hope this email finds you well. I came across your profile while researching {THEIR_FIELD} and was impressed by {SPECIFIC_ACHIEVEMENT}.\n\nI\'m currently {YOUR_SITUATION} and would greatly appreciate any insights you might have about {SPECIFIC_QUESTION}.\n\nI understand you\'re busy, so even a brief response would be incredibly valuable.\n\nBest regards,\n{YOUR_NAME}',
        variables: ['SPECIFIC_TOPIC', 'FIRST_NAME', 'THEIR_FIELD', 'SPECIFIC_ACHIEVEMENT', 'YOUR_SITUATION', 'SPECIFIC_QUESTION', 'YOUR_NAME'],
        instructions: 'Keep cold outreach emails short, specific, and value-focused',
        examples: []
      }
    ];
  }

  private static getColdOutreachMessageTemplates(): TaskTemplate[] {
    return this.getColdOutreachTemplates();
  }

  private static getResumeOptimizationResources(): TaskResource[] {
    return [
      {
        id: 'resume_optimization_guide',
        title: 'Resume Optimization for ATS',
        type: 'article',
        description: 'Guide to optimizing resumes for Applicant Tracking Systems',
        cost: 'free'
      }
    ];
  }

  private static getResumeTemplates(): TaskTemplate[] {
    return [
      {
        id: 'modern_resume_template',
        title: 'Modern Resume Template',
        type: 'document',
        content: 'Professional resume template optimized for ATS systems',
        variables: ['NAME', 'CONTACT_INFO', 'SUMMARY', 'EXPERIENCE', 'SKILLS', 'EDUCATION'],
        instructions: 'Customize this template with your information and target role keywords',
        examples: []
      }
    ];
  }

  private static getTrackingSystemResources(): TaskResource[] {
    return [
      {
        id: 'job_search_tracker_template',
        title: 'Job Application Tracking Spreadsheet',
        type: 'template',
        description: 'Comprehensive spreadsheet for tracking job applications',
        cost: 'free'
      }
    ];
  }

  private static getTrackingSystemTemplates(): TaskTemplate[] {
    return [
      {
        id: 'application_tracking_spreadsheet',
        title: 'Application Tracking Template',
        type: 'template',
        content: 'Spreadsheet template with columns for company, role, application date, status, contacts, and notes',
        variables: ['COMPANY', 'ROLE', 'APPLICATION_DATE', 'STATUS', 'CONTACT', 'NOTES'],
        instructions: 'Use this template to track all your job applications and follow-ups',
        examples: []
      }
    ];
  }

  private static needsPortfolio(topCareers: CareerFitScore[]): boolean {
    const portfolioCareers = ['UX Designer', 'Product Designer', 'Web Developer', 'Data Scientist', 'Software Engineer'];
    return topCareers.some(career =>
      portfolioCareers.some(pc => career.careerTitle.includes(pc))
    );
  }

  private static getPortfolioResources(): TaskResource[] {
    return [
      {
        id: 'portfolio_builder_guide',
        title: 'Professional Portfolio Builder Guide',
        type: 'article',
        description: 'Step-by-step guide to building an impressive portfolio',
        cost: 'free'
      }
    ];
  }

  private static getPortfolioTemplates(): TaskTemplate[] {
    return [
      {
        id: 'portfolio_project_template',
        title: 'Portfolio Project Template',
        type: 'document',
        content: 'Template for documenting portfolio projects with problem, solution, and results',
        variables: ['PROJECT_NAME', 'PROBLEM', 'SOLUTION', 'RESULTS', 'TECHNOLOGIES'],
        instructions: 'Use this template for each project in your portfolio',
        examples: []
      }
    ];
  }
}
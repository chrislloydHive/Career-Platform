import {
  InteractiveCareerPath,
  InteractiveCareerStage,
  InteractiveSkill,
  GeographicSalaryData,
  DetailedJobDescription,
  DayInLifeScenario,
  PersonalizedDevelopmentPlan,
  DEFAULT_TIMELINE_PREFERENCES,
  DEFAULT_GEOGRAPHIC_MARKETS,
  TimelinePreference
} from '@/types/interactive-career-path';

export class InteractiveCareerGenerator {
  private static salaryDatabase: Record<string, Record<string, GeographicSalaryData[]>> = {
    'Data Scientist': {
      'Entry Level': [
        { location: 'San Francisco, CA', lowRange: 120000, highRange: 150000, costOfLivingIndex: 180, marketDemand: 'very-high' },
        { location: 'New York, NY', lowRange: 110000, highRange: 140000, costOfLivingIndex: 170, marketDemand: 'very-high' },
        { location: 'Seattle, WA', lowRange: 105000, highRange: 135000, costOfLivingIndex: 145, marketDemand: 'high' },
        { location: 'Austin, TX', lowRange: 85000, highRange: 115000, costOfLivingIndex: 105, marketDemand: 'high' },
        { location: 'Chicago, IL', lowRange: 80000, highRange: 110000, costOfLivingIndex: 108, marketDemand: 'moderate' },
        { location: 'Remote (US Average)', lowRange: 90000, highRange: 120000, costOfLivingIndex: 100, marketDemand: 'high' }
      ],
      'Mid Level': [
        { location: 'San Francisco, CA', lowRange: 180000, highRange: 220000, costOfLivingIndex: 180, marketDemand: 'very-high' },
        { location: 'New York, NY', lowRange: 160000, highRange: 200000, costOfLivingIndex: 170, marketDemand: 'very-high' },
        { location: 'Seattle, WA', lowRange: 150000, highRange: 185000, costOfLivingIndex: 145, marketDemand: 'high' },
        { location: 'Austin, TX', lowRange: 125000, highRange: 155000, costOfLivingIndex: 105, marketDemand: 'high' },
        { location: 'Chicago, IL', lowRange: 115000, highRange: 145000, costOfLivingIndex: 108, marketDemand: 'moderate' },
        { location: 'Remote (US Average)', lowRange: 130000, highRange: 165000, costOfLivingIndex: 100, marketDemand: 'high' }
      ],
      'Senior Level': [
        { location: 'San Francisco, CA', lowRange: 250000, highRange: 350000, costOfLivingIndex: 180, marketDemand: 'very-high' },
        { location: 'New York, NY', lowRange: 220000, highRange: 310000, costOfLivingIndex: 170, marketDemand: 'very-high' },
        { location: 'Seattle, WA', lowRange: 200000, highRange: 280000, costOfLivingIndex: 145, marketDemand: 'high' },
        { location: 'Austin, TX', lowRange: 170000, highRange: 240000, costOfLivingIndex: 105, marketDemand: 'high' },
        { location: 'Chicago, IL', lowRange: 160000, highRange: 220000, costOfLivingIndex: 108, marketDemand: 'moderate' },
        { location: 'Remote (US Average)', lowRange: 180000, highRange: 250000, costOfLivingIndex: 100, marketDemand: 'high' }
      ]
    },
    'UX Designer': {
      'Entry Level': [
        { location: 'San Francisco, CA', lowRange: 95000, highRange: 125000, costOfLivingIndex: 180, marketDemand: 'high' },
        { location: 'New York, NY', lowRange: 85000, highRange: 115000, costOfLivingIndex: 170, marketDemand: 'high' },
        { location: 'Seattle, WA', lowRange: 80000, highRange: 105000, costOfLivingIndex: 145, marketDemand: 'moderate' },
        { location: 'Austin, TX', lowRange: 65000, highRange: 85000, costOfLivingIndex: 105, marketDemand: 'moderate' },
        { location: 'Chicago, IL', lowRange: 60000, highRange: 80000, costOfLivingIndex: 108, marketDemand: 'moderate' },
        { location: 'Remote (US Average)', lowRange: 70000, highRange: 95000, costOfLivingIndex: 100, marketDemand: 'high' }
      ],
      'Mid Level': [
        { location: 'San Francisco, CA', lowRange: 130000, highRange: 165000, costOfLivingIndex: 180, marketDemand: 'high' },
        { location: 'New York, NY', lowRange: 115000, highRange: 145000, costOfLivingIndex: 170, marketDemand: 'high' },
        { location: 'Seattle, WA', lowRange: 105000, highRange: 135000, costOfLivingIndex: 145, marketDemand: 'moderate' },
        { location: 'Austin, TX', lowRange: 85000, highRange: 115000, costOfLivingIndex: 105, marketDemand: 'moderate' },
        { location: 'Chicago, IL', lowRange: 80000, highRange: 105000, costOfLivingIndex: 108, marketDemand: 'moderate' },
        { location: 'Remote (US Average)', lowRange: 95000, highRange: 125000, costOfLivingIndex: 100, marketDemand: 'high' }
      ],
      'Senior Level': [
        { location: 'San Francisco, CA', lowRange: 180000, highRange: 250000, costOfLivingIndex: 180, marketDemand: 'high' },
        { location: 'New York, NY', lowRange: 160000, highRange: 220000, costOfLivingIndex: 170, marketDemand: 'high' },
        { location: 'Seattle, WA', lowRange: 140000, highRange: 190000, costOfLivingIndex: 145, marketDemand: 'moderate' },
        { location: 'Austin, TX', lowRange: 120000, highRange: 165000, costOfLivingIndex: 105, marketDemand: 'moderate' },
        { location: 'Chicago, IL', lowRange: 110000, highRange: 150000, costOfLivingIndex: 108, marketDemand: 'moderate' },
        { location: 'Remote (US Average)', lowRange: 130000, highRange: 180000, costOfLivingIndex: 100, marketDemand: 'high' }
      ]
    }
  };

  private static jobDescriptions: Record<string, Record<string, DetailedJobDescription>> = {
    'Data Scientist': {
      'Entry Level': {
        overview: 'Analyze complex datasets to extract actionable insights that drive business decisions. Work with stakeholders to understand data requirements and translate findings into clear recommendations.',
        coreResponsibilities: [
          'Clean and prepare data for analysis using Python/R',
          'Build and validate predictive models',
          'Create data visualizations and dashboards',
          'Collaborate with business teams to understand requirements',
          'Present findings to technical and non-technical audiences'
        ],
        typicalProjects: [
          'Customer churn prediction model',
          'Sales forecasting dashboard',
          'A/B test analysis and recommendations',
          'Market basket analysis for product recommendations',
          'Fraud detection system development'
        ],
        workEnvironment: 'Hybrid office/remote environment with collaborative team settings. Mix of independent analysis work and cross-functional meetings.',
        dayInLife: [
          { timeSlot: '9:00 AM', activity: 'Daily standup', description: 'Quick team sync on project progress and blockers', skillsUsed: ['Communication', 'Project Management'] },
          { timeSlot: '9:30 AM', activity: 'Data exploration', description: 'Investigate new dataset for customer behavior analysis', skillsUsed: ['Python', 'Pandas', 'SQL'] },
          { timeSlot: '11:00 AM', activity: 'Model development', description: 'Build and tune machine learning model for churn prediction', skillsUsed: ['Machine Learning', 'Scikit-learn', 'Statistics'] },
          { timeSlot: '1:00 PM', activity: 'Stakeholder meeting', description: 'Present initial findings to marketing team', skillsUsed: ['Data Visualization', 'Business Communication'] },
          { timeSlot: '2:30 PM', activity: 'Code review', description: 'Review teammate\'s analysis pipeline', skillsUsed: ['Code Review', 'Best Practices'] },
          { timeSlot: '3:30 PM', activity: 'Documentation', description: 'Document methodology and create analysis summary', skillsUsed: ['Technical Writing', 'Documentation'] },
          { timeSlot: '4:30 PM', activity: 'Learning time', description: 'Study new deep learning techniques', skillsUsed: ['Continuous Learning', 'Research'] }
        ],
        requiredEducation: ['Bachelor\'s in Data Science, Statistics, Computer Science, or related field', 'Strong foundation in statistics and mathematics'],
        preferredExperience: ['Internship or project experience with data analysis', 'Portfolio demonstrating data science projects', 'Experience with Python or R'],
        careerProgression: ['Senior Data Scientist', 'Lead Data Scientist', 'Data Science Manager', 'Principal Data Scientist']
      },
      'Mid Level': {
        overview: 'Lead complex data science projects from conception to deployment. Mentor junior team members and collaborate with senior leadership on strategic initiatives.',
        coreResponsibilities: [
          'Design and implement end-to-end ML pipelines',
          'Lead cross-functional data science projects',
          'Mentor junior data scientists',
          'Communicate insights to C-level executives',
          'Establish best practices and methodologies'
        ],
        typicalProjects: [
          'Recommendation engine for e-commerce platform',
          'Pricing optimization algorithm',
          'Customer lifetime value modeling',
          'Real-time fraud detection system',
          'Supply chain optimization model'
        ],
        workEnvironment: 'Strategic role with significant autonomy. Regular interaction with executives and key stakeholders. Mix of hands-on work and leadership responsibilities.',
        dayInLife: [
          { timeSlot: '8:30 AM', activity: 'Strategy planning', description: 'Plan quarterly data science initiatives with director', skillsUsed: ['Strategic Planning', 'Business Acumen'] },
          { timeSlot: '10:00 AM', activity: 'Architecture design', description: 'Design ML pipeline architecture for new product feature', skillsUsed: ['MLOps', 'System Design', 'Cloud Platforms'] },
          { timeSlot: '11:30 AM', activity: 'Team mentoring', description: 'One-on-one with junior data scientist on model optimization', skillsUsed: ['Mentoring', 'Technical Leadership'] },
          { timeSlot: '1:00 PM', activity: 'Executive presentation', description: 'Present ROI analysis of ML initiatives to CEO', skillsUsed: ['Executive Communication', 'Business Impact'] },
          { timeSlot: '2:30 PM', activity: 'Model deployment', description: 'Deploy customer segmentation model to production', skillsUsed: ['MLOps', 'Production Systems'] },
          { timeSlot: '4:00 PM', activity: 'Cross-team collaboration', description: 'Work with engineering on data infrastructure', skillsUsed: ['Collaboration', 'Technical Architecture'] }
        ],
        requiredEducation: ['Master\'s preferred in Data Science or related field', '3-5 years of professional data science experience'],
        preferredExperience: ['Experience deploying models to production', 'Leadership or mentoring experience', 'Domain expertise in specific industry'],
        careerProgression: ['Principal Data Scientist', 'Data Science Manager', 'Director of Data Science', 'VP of Analytics']
      },
      'Senior Level': {
        overview: 'Drive data science strategy across the organization. Lead high-impact initiatives that directly influence business outcomes and establish the company as a data-driven organization.',
        coreResponsibilities: [
          'Define organization-wide data science strategy',
          'Lead team of senior data scientists and managers',
          'Identify new business opportunities through data',
          'Establish data science standards and governance',
          'Drive innovation in ML/AI capabilities'
        ],
        typicalProjects: [
          'Company-wide AI transformation initiative',
          'Advanced deep learning research projects',
          'Data monetization strategy development',
          'Acquisition due diligence data analysis',
          'Next-generation product development'
        ],
        workEnvironment: 'Executive-level role with significant organizational impact. Regular board presentations and strategic decision-making. Balance of leadership and technical innovation.',
        dayInLife: [
          { timeSlot: '8:00 AM', activity: 'Board preparation', description: 'Prepare quarterly AI/ML impact report for board meeting', skillsUsed: ['Executive Leadership', 'Strategic Communication'] },
          { timeSlot: '9:30 AM', activity: 'Team leadership', description: 'Lead weekly data science leadership team meeting', skillsUsed: ['Team Management', 'Strategic Planning'] },
          { timeSlot: '11:00 AM', activity: 'Innovation review', description: 'Review cutting-edge research for potential implementation', skillsUsed: ['Research', 'Innovation Management'] },
          { timeSlot: '1:00 PM', activity: 'Partnership meeting', description: 'Discuss AI collaboration with university research team', skillsUsed: ['Partnership Development', 'Academic Relations'] },
          { timeSlot: '3:00 PM', activity: 'Product strategy', description: 'Define data requirements for next-gen product features', skillsUsed: ['Product Strategy', 'Technical Vision'] },
          { timeSlot: '4:30 PM', activity: 'Talent development', description: 'Interview senior data science candidates', skillsUsed: ['Talent Acquisition', 'Technical Assessment'] }
        ],
        requiredEducation: ['PhD preferred or Master\'s with exceptional experience', '7+ years of progressive data science leadership'],
        preferredExperience: ['Experience building data science teams', 'Track record of business impact', 'Thought leadership in the field'],
        careerProgression: ['Chief Data Officer', 'VP of AI/ML', 'Chief Technology Officer', 'Founder/Entrepreneur']
      }
    }
  };

  static generateInteractiveCareerPath(
    careerTitle: string,
    matchScore: number,
    whyThisPath: string[]
  ): InteractiveCareerPath {
    const stages = this.generateCareerStages(careerTitle);
    const skillDevelopment = this.generateInteractiveSkills(careerTitle);
    const developmentPlan = this.generatePersonalizedDevelopmentPlan(skillDevelopment);

    return {
      id: `${careerTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      pathName: `${careerTitle} Career Path`,
      description: `Complete career progression from entry-level to senior ${careerTitle} roles`,
      stages,
      skillDevelopment,
      industryDemand: 'high',
      matchScore,
      whyThisPath,
      isExpanded: false,
      timelinePreference: DEFAULT_TIMELINE_PREFERENCES[1], // Standard pace
      selectedGeography: 'San Francisco, CA',
      developmentPlan,
      isSaved: false
    };
  }

  private static generateCareerStages(careerTitle: string): InteractiveCareerStage[] {
    const levels = ['Entry Level', 'Mid Level', 'Senior Level'];
    const timeframes = ['0-2 years', '3-6 years', '7+ years'];

    return levels.map((level, index) => ({
      id: `${careerTitle.toLowerCase().replace(/\s+/g, '-')}-${level.toLowerCase().replace(/\s+/g, '-')}`,
      title: `${level} ${careerTitle}`,
      timeframe: timeframes[index],
      baselineTimeframe: timeframes[index],
      salaryData: this.salaryDatabase[careerTitle]?.[level] || this.getDefaultSalaryData(level),
      jobDescription: this.jobDescriptions[careerTitle]?.[level] || this.getDefaultJobDescription(level),
      requiredSkills: this.getSkillsForStage(careerTitle, level),
      keyMilestones: this.getMilestonesForStage(level),
      transitionCriteria: this.getTransitionCriteria(level)
    }));
  }

  private static generateInteractiveSkills(careerTitle: string): InteractiveSkill[] {
    const baseSkills: Record<string, InteractiveSkill[]> = {
      'Data Scientist': [
        { name: 'Python Programming', importance: 'critical', timeToLearn: '2-3 months', howToLearn: ['Online courses', 'Bootcamps', 'Practice projects'], currentLevel: 'none', userHasSkill: false, cost: '$50-200', certifications: ['Python Institute PCAP'] },
        { name: 'Statistics & Probability', importance: 'critical', timeToLearn: '3-4 months', howToLearn: ['University courses', 'Online statistics courses', 'Textbooks'], currentLevel: 'none', userHasSkill: false, cost: '$100-500', certifications: ['SAS Statistical Business Analyst'] },
        { name: 'Machine Learning', importance: 'critical', timeToLearn: '4-6 months', howToLearn: ['Specialized bootcamps', 'University courses', 'Hands-on projects'], currentLevel: 'none', userHasSkill: false, cost: '$200-2000', certifications: ['AWS ML Specialty', 'Google ML Engineer'] },
        { name: 'SQL & Databases', importance: 'critical', timeToLearn: '1-2 months', howToLearn: ['Online tutorials', 'Practice with real databases', 'Certification courses'], currentLevel: 'none', userHasSkill: false, cost: '$50-300', certifications: ['Oracle SQL Certified', 'Microsoft SQL Server'] },
        { name: 'Data Visualization', importance: 'important', timeToLearn: '1-2 months', howToLearn: ['Tableau/PowerBI courses', 'Design principles', 'Portfolio projects'], currentLevel: 'none', userHasSkill: false, cost: '$100-400', certifications: ['Tableau Desktop Specialist'] },
        { name: 'Cloud Platforms (AWS/Azure)', importance: 'important', timeToLearn: '2-3 months', howToLearn: ['Cloud provider training', 'Hands-on labs', 'Certification paths'], currentLevel: 'none', userHasSkill: false, cost: '$150-600', certifications: ['AWS Solutions Architect', 'Azure Data Scientist'] },
        { name: 'Business Communication', importance: 'important', timeToLearn: '3-6 months', howToLearn: ['Presentation courses', 'Toastmasters', 'Practice with stakeholders'], currentLevel: 'none', userHasSkill: false, cost: '$100-500' },
        { name: 'Deep Learning', importance: 'beneficial', timeToLearn: '4-6 months', howToLearn: ['Advanced online courses', 'Research papers', 'Complex projects'], currentLevel: 'none', userHasSkill: false, cost: '$200-1000', certifications: ['TensorFlow Developer'] }
      ],
      'UX Designer': [
        { name: 'User Research Methods', importance: 'critical', timeToLearn: '2-3 months', howToLearn: ['UX bootcamps', 'Design courses', 'Practice studies'], currentLevel: 'none', userHasSkill: false, cost: '$200-1500', certifications: ['Nielsen Norman UX Certification'] },
        { name: 'Prototyping (Figma/Sketch)', importance: 'critical', timeToLearn: '1-2 months', howToLearn: ['Tool-specific courses', 'YouTube tutorials', 'Practice projects'], currentLevel: 'none', userHasSkill: false, cost: '$50-300', certifications: ['Figma Professional'] },
        { name: 'Information Architecture', importance: 'critical', timeToLearn: '2-3 months', howToLearn: ['IA courses', 'Books', 'Real project experience'], currentLevel: 'none', userHasSkill: false, cost: '$100-600' },
        { name: 'Visual Design Principles', importance: 'important', timeToLearn: '3-4 months', howToLearn: ['Design school', 'Online courses', 'Portfolio building'], currentLevel: 'none', userHasSkill: false, cost: '$150-800' },
        { name: 'Usability Testing', importance: 'important', timeToLearn: '1-2 months', howToLearn: ['UX courses', 'Practice testing', 'Certification programs'], currentLevel: 'none', userHasSkill: false, cost: '$100-500' },
        { name: 'Front-end Development', importance: 'beneficial', timeToLearn: '3-6 months', howToLearn: ['Coding bootcamps', 'Online tutorials', 'Practice projects'], currentLevel: 'none', userHasSkill: false, cost: '$200-2000' },
        { name: 'Design Systems', importance: 'important', timeToLearn: '2-3 months', howToLearn: ['Advanced UX courses', 'Company case studies', 'Hands-on experience'], currentLevel: 'none', userHasSkill: false, cost: '$150-700' }
      ]
    };

    return baseSkills[careerTitle] || baseSkills['Data Scientist'];
  }

  private static generatePersonalizedDevelopmentPlan(skills: InteractiveSkill[]): PersonalizedDevelopmentPlan {
    const skillsToLearn = skills.filter(skill => !skill.userHasSkill);
    const foundationSkills = skills.filter(skill => skill.importance === 'critical');
    const quickWins = skills.filter(skill => skill.timeToLearn.includes('1-2 months'));
    const advancedSkills = skills.filter(skill => skill.importance === 'beneficial');

    const totalTimeInMonths = skillsToLearn.reduce((total, skill) => {
      const timeMatch = skill.timeToLearn.match(/(\d+)-?(\d+)?/);
      const avgTime = timeMatch ? (parseInt(timeMatch[1]) + (parseInt(timeMatch[2]) || parseInt(timeMatch[1]))) / 2 : 3;
      return total + avgTime;
    }, 0);

    const totalCostEstimate = skillsToLearn.reduce((total, skill) => {
      const costMatch = skill.cost.match(/\$(\d+)-?(\d+)?/);
      const avgCost = costMatch ? (parseInt(costMatch[1]) + (parseInt(costMatch[2]) || parseInt(costMatch[1]))) / 2 : 300;
      return total + avgCost;
    }, 0);

    return {
      skillsToLearn,
      estimatedTotalTime: `${Math.ceil(totalTimeInMonths)} months`,
      estimatedCost: `$${totalCostEstimate.toLocaleString()}`,
      priorityOrder: foundationSkills.map(skill => skill.name),
      quickWins,
      foundationSkills,
      advancedSkills
    };
  }

  private static getDefaultSalaryData(level: string): GeographicSalaryData[] {
    const baseSalaries: Record<string, [number, number]> = {
      'Entry Level': [60000, 90000],
      'Mid Level': [90000, 130000],
      'Senior Level': [130000, 200000]
    };

    const [low, high] = baseSalaries[level] || [60000, 90000];

    return DEFAULT_GEOGRAPHIC_MARKETS.slice(0, 6).map(location => ({
      location,
      lowRange: low,
      highRange: high,
      costOfLivingIndex: 100,
      marketDemand: 'moderate' as const
    }));
  }

  private static getDefaultJobDescription(level: string): DetailedJobDescription {
    return {
      overview: `${level} position with growth opportunities and skill development focus.`,
      coreResponsibilities: [`Core ${level.toLowerCase()} responsibilities`],
      typicalProjects: [`Typical ${level.toLowerCase()} projects`],
      workEnvironment: 'Professional office environment with collaborative team culture',
      dayInLife: [
        { timeSlot: '9:00 AM', activity: 'Daily planning', description: 'Review tasks and priorities', skillsUsed: ['Time Management'] }
      ],
      requiredEducation: ['Relevant degree or equivalent experience'],
      preferredExperience: [`${level.toLowerCase()} experience preferred`],
      careerProgression: ['Next level opportunities available']
    };
  }

  private static getSkillsForStage(careerTitle: string, level: string): InteractiveSkill[] {
    const allSkills = this.generateInteractiveSkills(careerTitle);

    if (level === 'Entry Level') {
      return allSkills.filter(skill => skill.importance === 'critical').slice(0, 4);
    } else if (level === 'Mid Level') {
      return allSkills.filter(skill => skill.importance !== 'beneficial').slice(0, 6);
    } else {
      return allSkills;
    }
  }

  private static getMilestonesForStage(level: string): string[] {
    const milestones: Record<string, string[]> = {
      'Entry Level': [
        'Complete onboarding and initial training',
        'Deliver first independent project',
        'Establish working relationships with key stakeholders',
        'Demonstrate core technical competencies'
      ],
      'Mid Level': [
        'Lead cross-functional project team',
        'Mentor junior team members',
        'Drive process improvements',
        'Expand domain expertise',
        'Build external professional network'
      ],
      'Senior Level': [
        'Define departmental strategy and vision',
        'Influence organizational decision-making',
        'Establish thought leadership in industry',
        'Drive innovation and best practices',
        'Develop next generation of leaders'
      ]
    };

    return milestones[level] || milestones['Entry Level'];
  }

  private static getTransitionCriteria(level: string): string[] {
    const criteria: Record<string, string[]> = {
      'Entry Level': [
        'Consistent performance reviews of "meets expectations" or above',
        'Completion of required certifications',
        'Demonstrated ability to work independently',
        'Positive stakeholder feedback'
      ],
      'Mid Level': [
        'Track record of successful project leadership',
        'Evidence of team development and mentoring',
        'Strategic thinking and business impact',
        'Industry recognition or thought leadership'
      ],
      'Senior Level': [
        'Proven ability to drive organizational change',
        'Strong external industry reputation',
        'History of developing high-performing teams',
        'Board-level presentation experience'
      ]
    };

    return criteria[level] || criteria['Entry Level'];
  }

  static updateTimelinePreference(
    path: InteractiveCareerPath,
    preference: TimelinePreference
  ): InteractiveCareerPath {
    const updatedStages = path.stages.map(stage => {
      const baseYears = this.parseTimeframe(stage.baselineTimeframe);
      const adjustedYears = baseYears.map(year => Math.ceil(year * preference.timeMultiplier));

      // Update job description based on timeline preference
      const updatedJobDescription = this.adjustJobDescriptionForTimeline(stage.jobDescription, preference);

      return {
        ...stage,
        timeframe: this.formatTimeframe(adjustedYears),
        jobDescription: updatedJobDescription
      };
    });

    // Update skill development plan based on timeline preference
    const updatedSkillDevelopment = this.adjustSkillDevelopmentForTimeline(path.skillDevelopment, preference);
    const updatedDevelopmentPlan = this.generatePersonalizedDevelopmentPlan(updatedSkillDevelopment);

    return {
      ...path,
      timelinePreference: preference,
      stages: updatedStages,
      skillDevelopment: updatedSkillDevelopment,
      developmentPlan: updatedDevelopmentPlan
    };
  }

  static updateSkillsMarked(
    path: InteractiveCareerPath,
    skillName: string,
    userHasSkill: boolean
  ): InteractiveCareerPath {
    const updatedSkills = path.skillDevelopment.map(skill =>
      skill.name === skillName ? { ...skill, userHasSkill } : skill
    );

    const updatedDevelopmentPlan = this.generatePersonalizedDevelopmentPlan(updatedSkills);

    return {
      ...path,
      skillDevelopment: updatedSkills,
      developmentPlan: updatedDevelopmentPlan
    };
  }

  private static parseTimeframe(timeframe: string): number[] {
    const match = timeframe.match(/(\d+)-?(\d+)?\s*years?/);
    if (match) {
      const start = parseInt(match[1]);
      const end = match[2] ? parseInt(match[2]) : start;
      return [start, end];
    }
    return [1, 2];
  }

  private static formatTimeframe(years: number[]): string {
    if (years[0] === years[1]) {
      return `${years[0]} year${years[0] > 1 ? 's' : ''}`;
    }
    return `${years[0]}-${years[1]} years`;
  }

  private static adjustJobDescriptionForTimeline(
    jobDescription: DetailedJobDescription,
    preference: TimelinePreference
  ): DetailedJobDescription {
    // Create different content based on timeline preference
    if (preference.speed === 'accelerated') {
      return {
        ...jobDescription,
        overview: jobDescription.overview + ' Fast-track progression requires intense focus and accelerated skill development.',
        dayInLife: jobDescription.dayInLife.map(scenario => ({
          ...scenario,
          description: scenario.description + ' (Accelerated pace requires efficient execution)'
        })),
        coreResponsibilities: [
          ...jobDescription.coreResponsibilities,
          'Maintain accelerated learning schedule',
          'Seek rapid feedback and iteration cycles'
        ]
      };
    } else if (preference.speed === 'gradual') {
      return {
        ...jobDescription,
        overview: jobDescription.overview + ' Gradual progression allows for deep mastery and thorough understanding.',
        dayInLife: jobDescription.dayInLife.map(scenario => ({
          ...scenario,
          description: scenario.description + ' (Gradual pace allows for comprehensive exploration)'
        })),
        coreResponsibilities: [
          ...jobDescription.coreResponsibilities,
          'Focus on mastery over speed',
          'Build comprehensive domain expertise'
        ]
      };
    }

    // Standard pace - return as is
    return jobDescription;
  }

  private static adjustSkillDevelopmentForTimeline(
    skills: InteractiveSkill[],
    preference: TimelinePreference
  ): InteractiveSkill[] {
    return skills.map(skill => {
      if (preference.speed === 'accelerated') {
        // Accelerated timeline - shorter learning times, more intensive methods
        const timeMatch = skill.timeToLearn.match(/(\d+)-?(\d+)?/);
        if (timeMatch) {
          const reducedTime = Math.max(1, Math.ceil(parseInt(timeMatch[1]) * 0.7));
          const reducedTimeEnd = timeMatch[2] ? Math.max(1, Math.ceil(parseInt(timeMatch[2]) * 0.7)) : reducedTime;

          return {
            ...skill,
            timeToLearn: timeMatch[2] ? `${reducedTime}-${reducedTimeEnd} months` : `${reducedTime} months`,
            howToLearn: [
              'Intensive bootcamps',
              'Accelerated online programs',
              'Immersive workshops',
              ...skill.howToLearn.slice(0, 2)
            ]
          };
        }
      } else if (preference.speed === 'gradual') {
        // Gradual timeline - longer learning times, more comprehensive methods
        const timeMatch = skill.timeToLearn.match(/(\d+)-?(\d+)?/);
        if (timeMatch) {
          const extendedTime = Math.ceil(parseInt(timeMatch[1]) * 1.5);
          const extendedTimeEnd = timeMatch[2] ? Math.ceil(parseInt(timeMatch[2]) * 1.5) : extendedTime;

          return {
            ...skill,
            timeToLearn: timeMatch[2] ? `${extendedTime}-${extendedTimeEnd} months` : `${extendedTime} months`,
            howToLearn: [
              'Comprehensive university courses',
              'In-depth self-study',
              'Mentorship programs',
              'Multiple practice projects',
              ...skill.howToLearn.slice(0, 2)
            ]
          };
        }
      }

      // Standard pace - return as is
      return skill;
    });
  }
}
import { LearningOpportunity, SkillProgress, ProgressPreferences } from '@/types/progress-tracking';

export class LearningOpportunityService {
  private static readonly OPPORTUNITY_SOURCES = [
    'Coursera',
    'edX',
    'Udemy',
    'LinkedIn Learning',
    'Pluralsight',
    'Google Skillshop',
    'AWS Training',
    'Microsoft Learn',
    'Codecademy',
    'freeCodeCamp',
    'Khan Academy',
    'MIT OpenCourseWare'
  ];

  static generateOpportunities(
    skills: SkillProgress[],
    preferences: ProgressPreferences
  ): LearningOpportunity[] {
    const opportunities: LearningOpportunity[] = [];

    // Generate opportunities for each skill
    skills.forEach(skill => {
      const skillOpportunities = this.generateSkillOpportunities(skill, preferences);
      opportunities.push(...skillOpportunities);
    });

    // Add general career-relevant opportunities
    if (preferences.targetCareerPath) {
      const careerOpportunities = this.generateCareerOpportunities(preferences.targetCareerPath, preferences);
      opportunities.push(...careerOpportunities);
    }

    // Sort by relevance score and return top opportunities
    return opportunities
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20);
  }

  private static generateSkillOpportunities(
    skill: SkillProgress,
    preferences: ProgressPreferences
  ): LearningOpportunity[] {
    const opportunities: LearningOpportunity[] = [];

    // Generate opportunities based on skill level and importance
    const opportunityCount = skill.importance === 'critical' ? 3 : 2;

    for (let i = 0; i < opportunityCount; i++) {
      const opportunity = this.createSkillOpportunity(skill, preferences, i);
      if (opportunity) {
        opportunities.push(opportunity);
      }
    }

    return opportunities;
  }

  private static createSkillOpportunity(
    skill: SkillProgress,
    preferences: ProgressPreferences,
    index: number
  ): LearningOpportunity | null {
    const templates = this.getSkillOpportunityTemplates(skill.skillName, skill.category);
    if (templates.length === 0) return null;

    const template = templates[index % templates.length];
    const provider = this.OPPORTUNITY_SOURCES[Math.floor(Math.random() * this.OPPORTUNITY_SOURCES.length)];

    // Calculate relevance score
    let relevanceScore = 70; // Base score

    // Boost for critical skills
    if (skill.importance === 'critical') relevanceScore += 20;

    // Boost for preferred learning types
    if (preferences.preferredLearningTypes.includes(template.type)) relevanceScore += 10;

    // Boost for skills that need development
    if (skill.currentLevel === 'none' || skill.currentLevel === 'beginner') {
      relevanceScore += 15;
    }

    // Boost for skills with low time invested
    if (skill.totalTimeSpent < 300) { // Less than 5 hours
      relevanceScore += 10;
    }

    return {
      id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: template.title.replace('{skill}', skill.skillName),
      description: template.description.replace('{skill}', skill.skillName),
      type: template.type,
      provider,
      skillAreas: [skill.skillName],
      relevanceScore: Math.min(100, relevanceScore),
      cost: template.cost,
      duration: template.duration,
      url: template.url,
      isBookmarked: false,
      isDismissed: false,
      dateAdded: new Date()
    };
  }

  private static generateCareerOpportunities(
    careerPath: string,
    preferences: ProgressPreferences
  ): LearningOpportunity[] {
    const opportunities: LearningOpportunity[] = [];
    const careerTemplates = this.getCareerOpportunityTemplates(careerPath);

    careerTemplates.forEach((template, index) => {
      const provider = this.OPPORTUNITY_SOURCES[Math.floor(Math.random() * this.OPPORTUNITY_SOURCES.length)];

      let relevanceScore = 60; // Base score for career-relevant content

      // Boost for preferred learning types
      if (preferences.preferredLearningTypes.includes(template.type)) relevanceScore += 15;

      opportunities.push({
        id: `career_opp_${Date.now()}_${index}`,
        title: template.title,
        description: template.description,
        type: template.type,
        provider,
        skillAreas: template.skillAreas,
        relevanceScore,
        cost: template.cost,
        duration: template.duration,
        url: template.url,
        isBookmarked: false,
        isDismissed: false,
        dateAdded: new Date()
      });
    });

    return opportunities;
  }

  private static getSkillOpportunityTemplates(skillName: string, category: string) {
    const skillLower = skillName.toLowerCase();

    // Programming skills
    if (skillLower.includes('python')) {
      return [
        {
          title: 'Complete Python Developer Bootcamp',
          description: 'Comprehensive {skill} course covering basics to advanced topics',
          type: 'course' as const,
          cost: 'medium' as const,
          duration: '40 hours',
          url: 'https://www.udemy.com/course/complete-python-bootcamp/'
        },
        {
          title: 'Python for Data Science Specialization',
          description: 'Learn {skill} specifically for data analysis and visualization',
          type: 'certification' as const,
          cost: 'medium' as const,
          duration: '3 months',
          url: 'https://www.coursera.org/specializations/python'
        },
        {
          title: 'Python Practice on HackerRank',
          description: 'Solve coding challenges to improve your {skill} skills',
          type: 'practice' as const,
          cost: 'free' as const,
          duration: 'Ongoing',
          url: 'https://www.hackerrank.com/domains/python'
        }
      ];
    }

    if (skillLower.includes('javascript')) {
      return [
        {
          title: 'Modern JavaScript Development',
          description: 'Master {skill} ES6+ features and modern development practices',
          type: 'course' as const,
          cost: 'low' as const,
          duration: '30 hours',
          url: 'https://www.udemy.com/course/modern-javascript/'
        },
        {
          title: 'JavaScript Algorithms and Data Structures',
          description: 'Build algorithmic thinking with {skill}',
          type: 'certification' as const,
          cost: 'free' as const,
          duration: '300 hours',
          url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/'
        }
      ];
    }

    if (skillLower.includes('sql')) {
      return [
        {
          title: 'SQL for Data Science',
          description: 'Learn {skill} for data analysis and database management',
          type: 'course' as const,
          cost: 'medium' as const,
          duration: '25 hours',
          url: 'https://www.coursera.org/learn/sql-for-data-science'
        },
        {
          title: 'Advanced SQL Queries',
          description: 'Master complex {skill} queries and database optimization',
          type: 'course' as const,
          cost: 'low' as const,
          duration: '15 hours',
          url: 'https://www.udemy.com/course/advanced-sql/'
        }
      ];
    }

    // Design skills
    if (skillLower.includes('figma') || skillLower.includes('design')) {
      return [
        {
          title: 'UI/UX Design with Figma',
          description: 'Master {skill} for professional interface design',
          type: 'course' as const,
          cost: 'low' as const,
          duration: '20 hours',
          url: 'https://www.udemy.com/course/figma-ux-ui-design/'
        },
        {
          title: 'Google UX Design Certificate',
          description: 'Comprehensive UX design program including {skill}',
          type: 'certification' as const,
          cost: 'medium' as const,
          duration: '6 months',
          url: 'https://www.coursera.org/professional-certificates/google-ux-design'
        }
      ];
    }

    // Data analysis skills
    if (skillLower.includes('tableau') || skillLower.includes('visualization')) {
      return [
        {
          title: 'Tableau Desktop Specialist',
          description: 'Get certified in {skill} for data visualization',
          type: 'certification' as const,
          cost: 'medium' as const,
          duration: '40 hours',
          url: 'https://www.tableau.com/learn/certification'
        },
        {
          title: 'Data Visualization with Tableau',
          description: 'Learn to create compelling visualizations with {skill}',
          type: 'course' as const,
          cost: 'low' as const,
          duration: '25 hours',
          url: 'https://www.udemy.com/course/tableau-desktop/'
        }
      ];
    }

    // Machine Learning
    if (skillLower.includes('machine learning') || skillLower.includes('ml')) {
      return [
        {
          title: 'Machine Learning Course by Andrew Ng',
          description: 'Foundational course in {skill} and AI',
          type: 'course' as const,
          cost: 'medium' as const,
          duration: '60 hours',
          url: 'https://www.coursera.org/learn/machine-learning'
        },
        {
          title: 'Applied Machine Learning in Python',
          description: 'Hands-on {skill} with real-world projects',
          type: 'course' as const,
          cost: 'medium' as const,
          duration: '35 hours',
          url: 'https://www.coursera.org/learn/python-machine-learning'
        }
      ];
    }

    // Project Management
    if (skillLower.includes('project management') || skillLower.includes('scrum')) {
      return [
        {
          title: 'PMP Certification Prep',
          description: 'Prepare for {skill} certification',
          type: 'certification' as const,
          cost: 'high' as const,
          duration: '60 hours',
          url: 'https://www.pmi.org/certifications/project-management-pmp'
        },
        {
          title: 'Agile Project Management',
          description: 'Master agile methodologies in {skill}',
          type: 'course' as const,
          cost: 'low' as const,
          duration: '20 hours',
          url: 'https://www.udemy.com/course/agile-project-management/'
        }
      ];
    }

    // Communication skills
    if (skillLower.includes('communication') || skillLower.includes('presentation')) {
      return [
        {
          title: 'Professional Communication Skills',
          description: 'Improve your {skill} for career advancement',
          type: 'course' as const,
          cost: 'low' as const,
          duration: '10 hours',
          url: 'https://www.linkedin.com/learning/communication-skills'
        },
        {
          title: 'Public Speaking Fundamentals',
          description: 'Build confidence in {skill} and presentations',
          type: 'course' as const,
          cost: 'free' as const,
          duration: '15 hours',
          url: 'https://www.edx.org/course/public-speaking'
        }
      ];
    }

    // Generic templates for any skill
    return [
      {
        title: `Fundamentals of ${skillName}`,
        description: 'Build a strong foundation in {skill}',
        type: 'course' as const,
        cost: 'low' as const,
        duration: '20 hours',
        url: undefined
      },
      {
        title: `Advanced ${skillName} Techniques`,
        description: 'Take your {skill} to the next level',
        type: 'course' as const,
        cost: 'medium' as const,
        duration: '30 hours',
        url: undefined
      }
    ];
  }

  private static getCareerOpportunityTemplates(careerPath: string) {
    const careerLower = careerPath.toLowerCase();

    if (careerLower.includes('data analyst')) {
      return [
        {
          title: 'Google Data Analytics Certificate',
          description: 'Complete professional certificate for data analysts',
          type: 'certification' as const,
          cost: 'medium' as const,
          duration: '6 months',
          skillAreas: ['Data Analysis', 'SQL', 'Tableau', 'R'],
          url: 'https://www.coursera.org/professional-certificates/google-data-analytics'
        },
        {
          title: 'Excel to Advanced Analytics',
          description: 'Progress from Excel to advanced data analysis tools',
          type: 'course' as const,
          cost: 'low' as const,
          duration: '25 hours',
          skillAreas: ['Excel', 'Power BI', 'Data Visualization'],
          url: 'https://www.udemy.com/course/excel-analytics/'
        }
      ];
    }

    if (careerLower.includes('product manager')) {
      return [
        {
          title: 'Product Management Fundamentals',
          description: 'Learn core product management skills and frameworks',
          type: 'course' as const,
          cost: 'medium' as const,
          duration: '40 hours',
          skillAreas: ['Product Strategy', 'User Research', 'Analytics'],
          url: 'https://www.coursera.org/learn/product-management'
        },
        {
          title: 'Data-Driven Product Management',
          description: 'Use analytics to make better product decisions',
          type: 'course' as const,
          cost: 'low' as const,
          duration: '15 hours',
          skillAreas: ['Product Analytics', 'A/B Testing', 'Metrics'],
          url: 'https://www.udemy.com/course/data-driven-product-management/'
        }
      ];
    }

    if (careerLower.includes('ux designer')) {
      return [
        {
          title: 'Google UX Design Certificate',
          description: 'Complete UX design program with portfolio projects',
          type: 'certification' as const,
          cost: 'medium' as const,
          duration: '6 months',
          skillAreas: ['User Research', 'Wireframing', 'Prototyping', 'Figma'],
          url: 'https://www.coursera.org/professional-certificates/google-ux-design'
        },
        {
          title: 'Design Systems Fundamentals',
          description: 'Learn to create and manage design systems',
          type: 'course' as const,
          cost: 'low' as const,
          duration: '20 hours',
          skillAreas: ['Design Systems', 'Component Libraries', 'Design Tokens'],
          url: 'https://www.udemy.com/course/design-systems/'
        }
      ];
    }

    if (careerLower.includes('software engineer')) {
      return [
        {
          title: 'Full Stack Web Development',
          description: 'Complete bootcamp for web development',
          type: 'bootcamp' as const,
          cost: 'high' as const,
          duration: '6 months',
          skillAreas: ['JavaScript', 'React', 'Node.js', 'Databases'],
          url: 'https://www.freecodecamp.org/learn'
        },
        {
          title: 'System Design Interview Prep',
          description: 'Prepare for software engineering interviews',
          type: 'course' as const,
          cost: 'medium' as const,
          duration: '30 hours',
          skillAreas: ['System Design', 'Algorithms', 'Architecture'],
          url: 'https://www.educative.io/courses/grokking-the-system-design-interview'
        }
      ];
    }

    // Default opportunities for any career
    return [
      {
        title: `${careerPath} Career Bootcamp`,
        description: `Comprehensive program for aspiring ${careerPath.toLowerCase()}s`,
        type: 'bootcamp' as const,
        cost: 'high' as const,
        duration: '3 months',
        skillAreas: ['Industry Knowledge', 'Professional Skills'],
        url: undefined
      }
    ];
  }

  static getNotificationMessage(opportunity: LearningOpportunity): string {
    const messages = [
      `🚀 New learning opportunity: "${opportunity.title}" - Perfect for developing ${opportunity.skillAreas.join(', ')}`,
      `💡 Recommended for you: "${opportunity.title}" - ${opportunity.description}`,
      `📚 Just found: "${opportunity.title}" by ${opportunity.provider} - Matches your learning goals`,
      `🎯 Skill boost opportunity: "${opportunity.title}" - ${opportunity.duration} to enhance ${opportunity.skillAreas.join(', ')}`
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  static shouldNotifyUser(
    opportunity: LearningOpportunity,
    preferences: ProgressPreferences
  ): boolean {
    // Check if user wants opportunity notifications
    if (!preferences.notifications.newOpportunities) return false;

    // Only notify for high relevance opportunities
    if (opportunity.relevanceScore < 80) return false;

    // Check if it matches preferred learning types
    return preferences.preferredLearningTypes.includes(opportunity.type);
  }

  static generateWeeklyOpportunityDigest(
    opportunities: LearningOpportunity[],
    skills: SkillProgress[]
  ): {
    title: string;
    summary: string;
    topOpportunities: LearningOpportunity[];
    skillFocus: string[];
  } {
    const topOpportunities = opportunities
      .filter(opp => !opp.isDismissed && !opp.isBookmarked)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);

    const criticalSkills = skills
      .filter(skill => skill.importance === 'critical' && skill.currentLevel !== skill.targetLevel)
      .map(skill => skill.skillName);

    return {
      title: '📚 Your Weekly Learning Opportunities',
      summary: `We found ${opportunities.length} new learning opportunities this week. Focus on ${criticalSkills.slice(0, 2).join(' and ')} for maximum career impact.`,
      topOpportunities,
      skillFocus: criticalSkills.slice(0, 3)
    };
  }
}
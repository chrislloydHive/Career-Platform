import {
  JobMarketSnapshot,
  HiringCompany,
  ExperienceAnalysis,
  SkillMarketAnalysis,
  MarketSkill,
  SkillGap,
  SalaryTrends,
  MarketOutlook,
  UserSkillProfile,
  RecentPosting
} from '@/types/job-market-data';

export class JobMarketDataService {
  private static readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour
  private static cache = new Map<string, { data: JobMarketSnapshot; timestamp: number }>();

  static async getJobMarketSnapshot(
    jobTitle: string,
    location: string,
    userProfile?: UserSkillProfile
  ): Promise<JobMarketSnapshot> {
    const cacheKey = `${jobTitle}-${location}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    // For demonstration, we'll use realistic synthetic data
    // In production, this would integrate with job APIs like:
    // - Indeed API, LinkedIn API, Glassdoor API, etc.
    const snapshot = await this.generateMarketSnapshot(jobTitle, location, userProfile);

    this.cache.set(cacheKey, { data: snapshot, timestamp: Date.now() });
    return snapshot;
  }

  private static async generateMarketSnapshot(
    jobTitle: string,
    location: string,
    userProfile?: UserSkillProfile
  ): Promise<JobMarketSnapshot> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const hiringCompanies = this.generateHiringCompanies(jobTitle, location);
    const experienceRequirements = this.analyzeExperienceRequirements(jobTitle);
    const skillRequirements = this.analyzeSkillRequirements(jobTitle, userProfile);
    const salaryTrends = this.analyzeSalaryTrends(jobTitle, location);
    const marketOutlook = this.generateMarketOutlook(jobTitle);

    return {
      location,
      careerStage: this.determineCareerStage(jobTitle),
      jobTitle,
      lastUpdated: new Date(),
      openPositions: this.calculateOpenPositions(jobTitle, location),
      hiringCompanies,
      experienceRequirements,
      skillRequirements,
      salaryTrends,
      marketOutlook
    };
  }

  private static generateHiringCompanies(jobTitle: string, location: string): HiringCompany[] {
    const companies = this.getCompaniesForRole(jobTitle);

    return companies.map(company => ({
      name: company.name,
      industry: company.industry,
      size: company.size,
      openRoles: Math.floor(Math.random() * 10) + 1,
      urgency: this.determineUrgency(),
      remotePolicy: company.remotePolicy,
      recentPostings: this.generateRecentPostings(jobTitle, company.name),
      hiringTrends: {
        monthlyHires: Math.floor(Math.random() * 20) + 5,
        growthRate: (Math.random() * 30) - 10, // -10% to +20%
        averageTimeToFill: Math.floor(Math.random() * 60) + 30 // 30-90 days
      }
    }));
  }

  private static generateRecentPostings(jobTitle: string, companyName: string): RecentPosting[] {
    const postings: RecentPosting[] = [];
    const count = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      postings.push({
        title: this.generateJobVariation(jobTitle),
        postedDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        location: Math.random() > 0.3 ? 'Remote' : 'San Francisco, CA',
        experienceRequired: this.generateExperienceRequirement(),
        salaryRange: Math.random() > 0.4 ? {
          min: 80000 + Math.floor(Math.random() * 50000),
          max: 120000 + Math.floor(Math.random() * 80000)
        } : undefined,
        isUrgent: Math.random() > 0.8,
        keySkills: this.getSkillsForRole(jobTitle).slice(0, Math.floor(Math.random() * 4) + 3)
      });
    }

    return postings;
  }

  private static analyzeExperienceRequirements(jobTitle: string): ExperienceAnalysis {
    const baseExperience = this.getBaseExperience(jobTitle);

    return {
      averageRequired: baseExperience,
      range: {
        minimum: Math.max(0, baseExperience - 2),
        maximum: baseExperience + 3
      },
      distribution: {
        entryLevel: jobTitle.includes('Junior') || jobTitle.includes('Entry') ? 60 : 20,
        midLevel: 45,
        seniorLevel: 25,
        expertLevel: 10
      },
      trendsOverTime: this.generateExperienceTrends()
    };
  }

  private static analyzeSkillRequirements(jobTitle: string, userProfile?: UserSkillProfile): SkillMarketAnalysis {
    const requiredSkills = this.getSkillsForRole(jobTitle);
    const topSkills = requiredSkills.map(skill => this.createMarketSkill(skill));
    const skillGaps = userProfile ? this.calculateSkillGaps(requiredSkills, userProfile) : [];

    return {
      totalSkillsRequired: requiredSkills.length,
      topSkills: topSkills.slice(0, 8),
      emergingSkills: this.getEmergingSkills(jobTitle),
      decliningSkills: this.getDecliningSkills(jobTitle),
      skillGaps,
      competitionLevel: this.determineCompetitionLevel(jobTitle)
    };
  }

  private static calculateSkillGaps(requiredSkills: string[], userProfile: UserSkillProfile): SkillGap[] {
    const gaps: SkillGap[] = [];

    requiredSkills.forEach(skill => {
      const userSkill = userProfile.skills.find(s =>
        s.name.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(s.name.toLowerCase())
      );

      const userLevel = userSkill?.level || 'none';
      const marketDemand = this.getSkillDemand(skill);
      const gapSeverity = this.calculateGapSeverity(userLevel, marketDemand);

      if (gapSeverity !== 'minor' || userLevel === 'none') {
        gaps.push({
          skill,
          userLevel,
          marketDemand,
          gapSeverity,
          timeToClose: this.estimateTimeToClose(userLevel, marketDemand),
          priority: this.calculatePriority(marketDemand, gapSeverity),
          impact: this.describeImpact(skill, gapSeverity)
        });
      }
    });

    return gaps.sort((a, b) => b.priority - a.priority);
  }

  private static analyzeSalaryTrends(jobTitle: string, location: string): SalaryTrends {
    const baseSalary = this.getBaseSalary(jobTitle);
    const locationMultiplier = this.getLocationMultiplier(location);

    return {
      currentRange: {
        min: Math.floor(baseSalary * locationMultiplier * 0.8),
        max: Math.floor(baseSalary * locationMultiplier * 1.3),
        median: Math.floor(baseSalary * locationMultiplier)
      },
      trend: Math.random() > 0.3 ? 'rising' : 'stable',
      yearOverYearChange: (Math.random() * 15) + 2, // 2-17% increase
      locationAdjustment: locationMultiplier,
      factors: [
        { factor: 'High demand for skills', impact: 'positive', weight: 0.8 },
        { factor: 'Remote work availability', impact: 'positive', weight: 0.6 },
        { factor: 'Economic uncertainty', impact: 'negative', weight: 0.3 }
      ]
    };
  }

  private static generateMarketOutlook(jobTitle: string): MarketOutlook {
    return {
      demandLevel: this.getDemandLevel(jobTitle),
      competitionLevel: this.determineCompetitionLevel(jobTitle),
      growthProjection: {
        nextYear: Math.floor(Math.random() * 20) + 5, // 5-25%
        fiveYear: Math.floor(Math.random() * 50) + 20 // 20-70%
      },
      automationRisk: this.getAutomationRisk(jobTitle),
      keyTrends: this.getKeyTrends(jobTitle),
      opportunities: this.getOpportunities(jobTitle),
      challenges: this.getChallenges(jobTitle)
    };
  }

  // Helper methods for data generation
  private static getCompaniesForRole(jobTitle: string) {
    const techCompanies = [
      { name: 'Google', industry: 'Technology', size: 'enterprise', remotePolicy: 'hybrid' },
      { name: 'Meta', industry: 'Technology', size: 'enterprise', remotePolicy: 'remote' },
      { name: 'Microsoft', industry: 'Technology', size: 'enterprise', remotePolicy: 'flexible' },
      { name: 'Stripe', industry: 'Fintech', size: 'large', remotePolicy: 'remote' },
      { name: 'Airbnb', industry: 'Technology', size: 'large', remotePolicy: 'flexible' },
      { name: 'Figma', industry: 'Design Tools', size: 'medium', remotePolicy: 'remote' },
      { name: 'Notion', industry: 'Productivity', size: 'medium', remotePolicy: 'remote' },
      { name: 'Databricks', industry: 'Data & AI', size: 'large', remotePolicy: 'hybrid' }
    ] as const;

    const healthcareCompanies = [
      { name: 'Kaiser Permanente', industry: 'Healthcare', size: 'enterprise', remotePolicy: 'hybrid' },
      { name: 'Teladoc', industry: 'Digital Health', size: 'large', remotePolicy: 'remote' },
      { name: 'Epic Systems', industry: 'Healthcare Tech', size: 'large', remotePolicy: 'office' }
    ] as const;

    if (jobTitle.toLowerCase().includes('data') || jobTitle.toLowerCase().includes('analyst')) {
      return [...techCompanies.slice(0, 6), ...healthcareCompanies.slice(0, 2)];
    } else if (jobTitle.toLowerCase().includes('product')) {
      return techCompanies.slice(0, 8);
    } else if (jobTitle.toLowerCase().includes('design') || jobTitle.toLowerCase().includes('ux')) {
      return [techCompanies[5], techCompanies[6], ...techCompanies.slice(0, 4)];
    }

    return techCompanies.slice(0, 6);
  }

  private static getSkillsForRole(jobTitle: string): string[] {
    if (jobTitle.toLowerCase().includes('data') || jobTitle.toLowerCase().includes('analyst')) {
      return ['SQL', 'Python', 'R', 'Tableau', 'Excel', 'Statistics', 'Machine Learning', 'Data Visualization'];
    } else if (jobTitle.toLowerCase().includes('product')) {
      return ['Product Strategy', 'Roadmapping', 'User Research', 'Analytics', 'Agile', 'Stakeholder Management', 'Market Analysis', 'A/B Testing'];
    } else if (jobTitle.toLowerCase().includes('design') || jobTitle.toLowerCase().includes('ux')) {
      return ['Figma', 'User Research', 'Prototyping', 'Information Architecture', 'Usability Testing', 'Design Systems', 'Interaction Design', 'Visual Design'];
    }

    return ['Communication', 'Problem Solving', 'Leadership', 'Project Management'];
  }

  private static createMarketSkill(skillName: string): MarketSkill {
    return {
      name: skillName,
      frequency: Math.floor(Math.random() * 60) + 30, // 30-90% of job postings
      importance: Math.random() > 0.6 ? 'critical' : Math.random() > 0.3 ? 'important' : 'nice-to-have',
      trend: Math.random() > 0.7 ? 'rising' : Math.random() > 0.2 ? 'stable' : 'declining',
      averageSalaryBoost: Math.floor(Math.random() * 25) + 5, // 5-30% boost
      certificationAvailable: Math.random() > 0.4,
      learningResources: [
        {
          type: 'course',
          provider: 'Coursera',
          duration: '4-8 weeks',
          cost: Math.floor(Math.random() * 200) + 50
        },
        {
          type: 'certification',
          provider: 'Industry Standard',
          duration: '3-6 months',
          cost: Math.floor(Math.random() * 800) + 200
        }
      ]
    };
  }

  private static calculateOpenPositions(jobTitle: string, location: string): number {
    const baseJobs = location === 'San Francisco, CA' ? 150 :
                    location === 'New York, NY' ? 120 :
                    location === 'Remote' ? 300 : 80;

    const roleMultiplier = jobTitle.toLowerCase().includes('senior') ? 0.6 :
                          jobTitle.toLowerCase().includes('junior') ? 1.5 : 1.0;

    return Math.floor(baseJobs * roleMultiplier * (0.8 + Math.random() * 0.4));
  }

  private static determineCareerStage(jobTitle: string): string {
    if (jobTitle.toLowerCase().includes('senior') || jobTitle.toLowerCase().includes('lead')) {
      return 'Senior Level';
    } else if (jobTitle.toLowerCase().includes('junior') || jobTitle.toLowerCase().includes('entry')) {
      return 'Entry Level';
    }
    return 'Mid Level';
  }

  private static determineUrgency(): 'low' | 'medium' | 'high' | 'urgent' {
    const rand = Math.random();
    if (rand > 0.9) return 'urgent';
    if (rand > 0.7) return 'high';
    if (rand > 0.4) return 'medium';
    return 'low';
  }

  private static generateJobVariation(baseTitle: string): string {
    const variations = [
      baseTitle,
      `Senior ${baseTitle}`,
      `${baseTitle} - Remote`,
      `${baseTitle} (Contract)`,
      `Lead ${baseTitle}`
    ];
    return variations[Math.floor(Math.random() * variations.length)];
  }

  private static generateExperienceRequirement(): string {
    const options = [
      '0-2 years',
      '2-4 years',
      '3-5 years',
      '5+ years',
      '7+ years',
      'Entry level'
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  private static getBaseExperience(jobTitle: string): number {
    if (jobTitle.toLowerCase().includes('senior')) return 5;
    if (jobTitle.toLowerCase().includes('lead')) return 7;
    if (jobTitle.toLowerCase().includes('junior') || jobTitle.toLowerCase().includes('entry')) return 1;
    return 3;
  }

  private static generateExperienceTrends() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      averageExperience: 3 + Math.random() * 2
    }));
  }

  private static getEmergingSkills(jobTitle: string): MarketSkill[] {
    const emergingSkills = jobTitle.toLowerCase().includes('data') ?
      ['AI/ML', 'LLMs', 'Vector Databases'] :
      jobTitle.toLowerCase().includes('product') ?
      ['AI Product Strategy', 'Voice UI', 'AR/VR'] :
      ['AI-Assisted Design', 'Voice Interfaces', '3D Design'];

    return emergingSkills.map(skill => this.createMarketSkill(skill));
  }

  private static getDecliningSkills(jobTitle: string): MarketSkill[] {
    const decliningSkills = ['Flash', 'jQuery', 'Legacy Systems'];
    return decliningSkills.map(skill => this.createMarketSkill(skill));
  }

  private static determineCompetitionLevel(jobTitle: string): 'low' | 'medium' | 'high' | 'very-high' {
    if (jobTitle.toLowerCase().includes('senior')) return 'very-high';
    if (jobTitle.toLowerCase().includes('data')) return 'high';
    if (jobTitle.toLowerCase().includes('product')) return 'high';
    return 'medium';
  }

  private static getSkillDemand(skill: string): 'low' | 'medium' | 'high' | 'critical' {
    const highDemandSkills = ['Python', 'SQL', 'React', 'Product Strategy', 'Figma'];
    const criticalSkills = ['AI/ML', 'Data Analysis', 'User Research'];

    if (criticalSkills.some(s => skill.toLowerCase().includes(s.toLowerCase()))) return 'critical';
    if (highDemandSkills.some(s => skill.toLowerCase().includes(s.toLowerCase()))) return 'high';
    return 'medium';
  }

  private static calculateGapSeverity(userLevel: string, marketDemand: string): 'minor' | 'moderate' | 'major' | 'critical' {
    if (marketDemand === 'critical' && userLevel === 'none') return 'critical';
    if (marketDemand === 'high' && (userLevel === 'none' || userLevel === 'beginner')) return 'major';
    if (marketDemand === 'medium' && userLevel === 'none') return 'moderate';
    return 'minor';
  }

  private static estimateTimeToClose(userLevel: string, marketDemand: string): string {
    if (userLevel === 'none') {
      return marketDemand === 'critical' ? '6-12 months' : '3-6 months';
    }
    if (userLevel === 'beginner') {
      return marketDemand === 'critical' ? '3-6 months' : '2-4 months';
    }
    return '1-3 months';
  }

  private static calculatePriority(marketDemand: string, gapSeverity: string): number {
    const demandScore = { critical: 4, high: 3, medium: 2, low: 1 }[marketDemand] || 1;
    const severityScore = { critical: 4, major: 3, moderate: 2, minor: 1 }[gapSeverity] || 1;
    return demandScore + severityScore;
  }

  private static describeImpact(skill: string, gapSeverity: string): string {
    if (gapSeverity === 'critical') {
      return `Critical skill gap: ${skill} is essential for most positions in this field`;
    }
    if (gapSeverity === 'major') {
      return `Major gap: ${skill} significantly improves job prospects and salary potential`;
    }
    if (gapSeverity === 'moderate') {
      return `Moderate gap: ${skill} would strengthen your competitive position`;
    }
    return `Minor gap: ${skill} is helpful but not essential`;
  }

  private static getBaseSalary(jobTitle: string): number {
    if (jobTitle.toLowerCase().includes('senior')) return 140000;
    if (jobTitle.toLowerCase().includes('lead')) return 160000;
    if (jobTitle.toLowerCase().includes('junior')) return 85000;
    if (jobTitle.toLowerCase().includes('product')) return 120000;
    if (jobTitle.toLowerCase().includes('data')) return 110000;
    if (jobTitle.toLowerCase().includes('design')) return 105000;
    return 95000;
  }

  private static getLocationMultiplier(location: string): number {
    const multipliers: Record<string, number> = {
      'San Francisco, CA': 1.4,
      'New York, NY': 1.3,
      'Seattle, WA': 1.2,
      'Austin, TX': 1.0,
      'Remote': 1.1,
      'Chicago, IL': 1.0,
      'Denver, CO': 0.95,
      'Atlanta, GA': 0.9
    };
    return multipliers[location] || 1.0;
  }

  private static getDemandLevel(jobTitle: string): 'very-low' | 'low' | 'moderate' | 'high' | 'very-high' {
    if (jobTitle.toLowerCase().includes('data') || jobTitle.toLowerCase().includes('ai')) return 'very-high';
    if (jobTitle.toLowerCase().includes('product')) return 'high';
    if (jobTitle.toLowerCase().includes('design')) return 'high';
    return 'moderate';
  }

  private static getAutomationRisk(jobTitle: string): 'low' | 'medium' | 'high' {
    if (jobTitle.toLowerCase().includes('design') || jobTitle.toLowerCase().includes('product')) return 'low';
    if (jobTitle.toLowerCase().includes('data') && jobTitle.toLowerCase().includes('analyst')) return 'medium';
    return 'low';
  }

  private static getKeyTrends(jobTitle: string): string[] {
    if (jobTitle.toLowerCase().includes('data')) {
      return ['AI/ML integration', 'Real-time analytics', 'Data governance focus', 'Self-service BI tools'];
    }
    if (jobTitle.toLowerCase().includes('product')) {
      return ['AI-powered products', 'Data-driven decisions', 'Customer-centric design', 'Agile methodologies'];
    }
    if (jobTitle.toLowerCase().includes('design')) {
      return ['AI-assisted design', 'Accessibility focus', 'Design systems', 'Voice and conversational UI'];
    }
    return ['Digital transformation', 'Remote collaboration', 'Automation', 'Sustainability focus'];
  }

  private static getOpportunities(jobTitle: string): string[] {
    return [
      'High demand for skilled professionals',
      'Remote work opportunities',
      'Cross-industry applications',
      'Continuous learning and growth'
    ];
  }

  private static getChallenges(jobTitle: string): string[] {
    return [
      'Rapidly evolving technology landscape',
      'Increasing competition',
      'Need for continuous skill development',
      'Keeping up with industry trends'
    ];
  }
}
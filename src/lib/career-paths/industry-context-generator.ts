import {
  IndustryContext,
  IndustryRoleDifferences,
  IndustrySalaryVariation,
  IndustryGrowthProjection,
  IndustryHiringPatterns,
  MajorIndustry,
  MAJOR_INDUSTRIES,
  IndustryCharacteristics
} from '@/types/industry-context';

export class IndustryContextGenerator {
  private static industryCharacteristics: Record<MajorIndustry, IndustryCharacteristics> = {
    'Technology': {
      industry: 'Technology',
      typicalCompanySize: 'mixed',
      workCulture: 'Innovation-focused, fast-paced, collaborative',
      paceOfWork: 'fast',
      innovationLevel: 'cutting-edge',
      regulatoryEnvironment: 'flexible',
      budgetConstraints: 'high-budget'
    },
    'Healthcare': {
      industry: 'Healthcare',
      typicalCompanySize: 'enterprise',
      workCulture: 'Patient-centered, compliance-focused, evidence-based',
      paceOfWork: 'steady',
      innovationLevel: 'modern',
      regulatoryEnvironment: 'highly-regulated',
      budgetConstraints: 'moderate-budget'
    },
    'Financial Services': {
      industry: 'Financial Services',
      typicalCompanySize: 'enterprise',
      workCulture: 'Risk-aware, detail-oriented, performance-driven',
      paceOfWork: 'fast',
      innovationLevel: 'modern',
      regulatoryEnvironment: 'highly-regulated',
      budgetConstraints: 'high-budget'
    },
    'Retail & E-commerce': {
      industry: 'Retail & E-commerce',
      typicalCompanySize: 'mixed',
      workCulture: 'Customer-focused, data-driven, seasonal',
      paceOfWork: 'fast',
      innovationLevel: 'modern',
      regulatoryEnvironment: 'moderately-regulated',
      budgetConstraints: 'cost-conscious'
    },
    'Manufacturing': {
      industry: 'Manufacturing',
      typicalCompanySize: 'enterprise',
      workCulture: 'Process-oriented, safety-focused, efficiency-driven',
      paceOfWork: 'steady',
      innovationLevel: 'modern',
      regulatoryEnvironment: 'highly-regulated',
      budgetConstraints: 'moderate-budget'
    },
    'Consulting': {
      industry: 'Consulting',
      typicalCompanySize: 'mid-size',
      workCulture: 'Client-focused, analytical, project-based',
      paceOfWork: 'fast',
      innovationLevel: 'modern',
      regulatoryEnvironment: 'flexible',
      budgetConstraints: 'high-budget'
    },
    'Media & Entertainment': {
      industry: 'Media & Entertainment',
      typicalCompanySize: 'mixed',
      workCulture: 'Creative, deadline-driven, collaborative',
      paceOfWork: 'fast',
      innovationLevel: 'cutting-edge',
      regulatoryEnvironment: 'flexible',
      budgetConstraints: 'moderate-budget'
    },
    'Government & Non-profit': {
      industry: 'Government & Non-profit',
      typicalCompanySize: 'enterprise',
      workCulture: 'Mission-driven, structured, public service',
      paceOfWork: 'moderate',
      innovationLevel: 'traditional',
      regulatoryEnvironment: 'highly-regulated',
      budgetConstraints: 'cost-conscious'
    },
    'Energy & Utilities': {
      industry: 'Energy & Utilities',
      typicalCompanySize: 'enterprise',
      workCulture: 'Safety-first, reliability-focused, technical',
      paceOfWork: 'steady',
      innovationLevel: 'modern',
      regulatoryEnvironment: 'highly-regulated',
      budgetConstraints: 'moderate-budget'
    },
    'Education': {
      industry: 'Education',
      typicalCompanySize: 'mixed',
      workCulture: 'Student-centered, research-oriented, collaborative',
      paceOfWork: 'moderate',
      innovationLevel: 'modern',
      regulatoryEnvironment: 'moderately-regulated',
      budgetConstraints: 'cost-conscious'
    },
    'Real Estate': {
      industry: 'Real Estate',
      typicalCompanySize: 'mid-size',
      workCulture: 'Relationship-driven, market-focused, cyclical',
      paceOfWork: 'moderate',
      innovationLevel: 'modern',
      regulatoryEnvironment: 'moderately-regulated',
      budgetConstraints: 'moderate-budget'
    },
    'Transportation & Logistics': {
      industry: 'Transportation & Logistics',
      typicalCompanySize: 'enterprise',
      workCulture: 'Efficiency-focused, time-sensitive, operational',
      paceOfWork: 'fast',
      innovationLevel: 'modern',
      regulatoryEnvironment: 'highly-regulated',
      budgetConstraints: 'cost-conscious'
    }
  };

  static generateIndustryContext(careerTitle: string): IndustryContext {
    const topIndustries = this.getTopIndustriesForRole(careerTitle);
    const industryVariations = this.generateRoleDifferences(careerTitle, topIndustries);
    const salaryVariations = this.generateSalaryVariations(careerTitle, topIndustries);
    const growthProjections = this.generateGrowthProjections(careerTitle, topIndustries);
    const hiringPatterns = this.generateHiringPatterns(careerTitle, topIndustries);
    const industryTransitionDifficulty = this.generateTransitionDifficulty(careerTitle, topIndustries);

    return {
      careerTitle,
      industryVariations,
      salaryVariations,
      growthProjections,
      hiringPatterns,
      topIndustries,
      industryTransitionDifficulty
    };
  }

  private static getTopIndustriesForRole(careerTitle: string): string[] {
    const roleIndustryMap: Record<string, string[]> = {
      'Data Analyst': ['Technology', 'Financial Services', 'Healthcare', 'Retail & E-commerce', 'Consulting'],
      'Product Manager': ['Technology', 'Financial Services', 'Retail & E-commerce', 'Healthcare', 'Media & Entertainment'],
      'Software Engineer': ['Technology', 'Financial Services', 'Healthcare', 'Media & Entertainment', 'Transportation & Logistics'],
      'Marketing Manager': ['Retail & E-commerce', 'Technology', 'Media & Entertainment', 'Healthcare', 'Financial Services'],
      'UX Designer': ['Technology', 'Media & Entertainment', 'Retail & E-commerce', 'Financial Services', 'Healthcare'],
      'Project Manager': ['Technology', 'Consulting', 'Manufacturing', 'Healthcare', 'Financial Services'],
      'Business Analyst': ['Financial Services', 'Technology', 'Healthcare', 'Consulting', 'Government & Non-profit'],
      'Sales Manager': ['Technology', 'Retail & E-commerce', 'Financial Services', 'Real Estate', 'Manufacturing'],
      'HR Manager': ['Technology', 'Healthcare', 'Financial Services', 'Manufacturing', 'Government & Non-profit'],
      'Financial Analyst': ['Financial Services', 'Technology', 'Healthcare', 'Real Estate', 'Energy & Utilities']
    };

    // Return top industries or default set if role not found
    return roleIndustryMap[careerTitle] || ['Technology', 'Healthcare', 'Financial Services', 'Retail & E-commerce', 'Manufacturing'];
  }

  private static generateRoleDifferences(careerTitle: string, industries: string[]): IndustryRoleDifferences[] {
    const variations: IndustryRoleDifferences[] = [];

    industries.forEach(industry => {
      const characteristics = this.industryCharacteristics[industry as MajorIndustry];
      if (!characteristics) return;

      variations.push(this.generateRoleVariation(careerTitle, industry, characteristics));
    });

    return variations;
  }

  private static generateRoleVariation(careerTitle: string, industry: string, characteristics: IndustryCharacteristics): IndustryRoleDifferences {
    // Generate role-specific variations based on career title and industry
    const baseVariations = this.getRoleVariationTemplates(careerTitle, industry);

    return {
      industry,
      roleVariation: baseVariations.roleVariation,
      keyDifferences: baseVariations.keyDifferences,
      specificResponsibilities: baseVariations.specificResponsibilities,
      toolsAndTechnologies: baseVariations.toolsAndTechnologies,
      workEnvironment: `${characteristics.workCulture}. Typically ${characteristics.paceOfWork} paced with ${characteristics.innovationLevel} technology adoption.`,
      teamStructure: baseVariations.teamStructure,
      careerProgression: baseVariations.careerProgression,
      challenges: baseVariations.challenges,
      opportunities: baseVariations.opportunities
    };
  }

  private static getRoleVariationTemplates(careerTitle: string, industry: string): Omit<IndustryRoleDifferences, 'industry' | 'workEnvironment'> {
    const templates: Record<string, Record<string, Omit<IndustryRoleDifferences, 'industry' | 'workEnvironment'>>> = {
      'Data Analyst': {
        'Technology': {
          roleVariation: 'Product Analytics Specialist',
          keyDifferences: ['Focus on user behavior and product metrics', 'A/B testing and experimentation', 'Real-time data processing'],
          specificResponsibilities: ['Track user engagement and retention metrics', 'Design and analyze A/B tests', 'Build product dashboards', 'Collaborate with product and engineering teams'],
          toolsAndTechnologies: ['Python', 'SQL', 'Tableau/Looker', 'Google Analytics', 'Mixpanel', 'Amplitude', 'Apache Spark'],
          teamStructure: 'Embedded in cross-functional product teams with engineers and designers',
          careerProgression: ['Senior Product Analyst → Lead Product Analyst → Head of Product Analytics → VP of Data'],
          challenges: ['Fast-changing requirements', 'Large data volumes', 'Real-time decision making'],
          opportunities: ['High impact on product decisions', 'Cutting-edge tools', 'Fast career growth']
        },
        'Healthcare': {
          roleVariation: 'Healthcare Data Analyst',
          keyDifferences: ['HIPAA compliance requirements', 'Clinical and patient outcome focus', 'Evidence-based analysis'],
          specificResponsibilities: ['Analyze patient outcomes and treatment efficacy', 'Support clinical research studies', 'Ensure data privacy compliance', 'Generate regulatory reports'],
          toolsAndTechnologies: ['SAS', 'R', 'SPSS', 'Epic/Cerner', 'REDCap', 'Tableau', 'SQL Server'],
          teamStructure: 'Work with clinical teams, researchers, and compliance officers',
          careerProgression: ['Senior Healthcare Analyst → Lead Clinical Data Analyst → Director of Healthcare Analytics → Chief Data Officer'],
          challenges: ['Strict regulatory compliance', 'Complex medical terminology', 'Data quality issues'],
          opportunities: ['Meaningful impact on patient care', 'Job security', 'Growing field with aging population']
        },
        'Financial Services': {
          roleVariation: 'Financial Risk Analyst',
          keyDifferences: ['Regulatory reporting requirements', 'Risk modeling and stress testing', 'Real-time market data analysis'],
          specificResponsibilities: ['Develop risk models and scenarios', 'Monitor portfolio performance', 'Create regulatory compliance reports', 'Analyze market trends'],
          toolsAndTechnologies: ['Python', 'R', 'MATLAB', 'Bloomberg Terminal', 'SAS', 'Tableau', 'SQL', 'Monte Carlo simulations'],
          teamStructure: 'Work with risk management, compliance, and trading teams',
          careerProgression: ['Senior Risk Analyst → Risk Manager → Director of Risk Analytics → Chief Risk Officer'],
          challenges: ['High-pressure environment', 'Regulatory complexity', 'Market volatility'],
          opportunities: ['High compensation', 'Intellectual challenges', 'Career stability']
        },
        'Retail & E-commerce': {
          roleVariation: 'Customer Insights Analyst',
          keyDifferences: ['Customer behavior and lifecycle analysis', 'Merchandising and inventory optimization', 'Seasonal trend analysis'],
          specificResponsibilities: ['Analyze customer purchasing patterns', 'Optimize pricing and promotions', 'Forecast demand and inventory needs', 'Measure marketing campaign effectiveness'],
          toolsAndTechnologies: ['Google Analytics', 'Adobe Analytics', 'Tableau', 'Python', 'SQL', 'Shopify Analytics', 'Salesforce'],
          teamStructure: 'Collaborate with marketing, merchandising, and operations teams',
          careerProgression: ['Senior Customer Analyst → Analytics Manager → Director of Customer Analytics → VP of Insights'],
          challenges: ['Seasonal volatility', 'Fast-changing consumer behavior', 'Inventory management pressure'],
          opportunities: ['Direct impact on revenue', 'Diverse analytical challenges', 'Growing e-commerce market']
        },
        'Consulting': {
          roleVariation: 'Management Consulting Analyst',
          keyDifferences: ['Client-facing work', 'Cross-industry exposure', 'Strategic business analysis'],
          specificResponsibilities: ['Conduct market research and competitive analysis', 'Build financial models for clients', 'Present findings to C-level executives', 'Support strategy development'],
          toolsAndTechnologies: ['Excel', 'PowerPoint', 'Tableau', 'Python', 'SQL', 'Alteryx', 'Industry databases'],
          teamStructure: 'Work in small teams with consultants and engagement managers',
          careerProgression: ['Senior Consultant → Manager → Senior Manager → Principal → Partner'],
          challenges: ['High client expectations', 'Travel requirements', 'Long hours'],
          opportunities: ['Rapid skill development', 'High compensation', 'Diverse industry exposure']
        }
      }
      // Add more role templates as needed...
    };

    const roleTemplates = templates[careerTitle];
    if (!roleTemplates || !roleTemplates[industry]) {
      // Return generic template if specific combination not found
      return {
        roleVariation: `${careerTitle} - ${industry} Focus`,
        keyDifferences: [`Specialized focus on ${industry.toLowerCase()} domain`, 'Industry-specific regulations and requirements', 'Tailored analytical approaches'],
        specificResponsibilities: ['Domain-specific analysis', 'Industry compliance reporting', 'Stakeholder collaboration', 'Process optimization'],
        toolsAndTechnologies: ['Industry-standard tools', 'SQL', 'Excel', 'Business Intelligence platforms'],
        teamStructure: `Cross-functional teams within ${industry.toLowerCase()} context`,
        careerProgression: [`Senior ${careerTitle} → Lead Analyst → Director → VP`],
        challenges: ['Industry-specific complexity', 'Regulatory requirements', 'Domain expertise development'],
        opportunities: ['Industry expertise development', 'Specialized skill set', 'Career growth within domain']
      };
    }

    return roleTemplates[industry];
  }

  private static generateSalaryVariations(careerTitle: string, industries: string[]): IndustrySalaryVariation[] {
    const baseSalaryMap: Record<string, { junior: { low: number; high: number }; mid: { low: number; high: number }; senior: { low: number; high: number } }> = {
      'Data Analyst': {
        junior: { low: 60000, high: 85000 },
        mid: { low: 85000, high: 120000 },
        senior: { low: 120000, high: 160000 }
      },
      'Product Manager': {
        junior: { low: 90000, high: 130000 },
        mid: { low: 130000, high: 180000 },
        senior: { low: 180000, high: 250000 }
      }
      // Add more base salaries...
    };

    const industryMultipliers: Record<string, number> = {
      'Technology': 1.3,
      'Financial Services': 1.25,
      'Healthcare': 1.0,
      'Consulting': 1.2,
      'Retail & E-commerce': 0.9,
      'Manufacturing': 0.95,
      'Media & Entertainment': 0.85,
      'Government & Non-profit': 0.75,
      'Energy & Utilities': 1.1,
      'Education': 0.7,
      'Real Estate': 1.0,
      'Transportation & Logistics': 0.9
    };

    const baseSalary = baseSalaryMap[careerTitle] || baseSalaryMap['Data Analyst'];

    return industries.map(industry => {
      const multiplier = industryMultipliers[industry] || 1.0;
      const characteristics = this.industryCharacteristics[industry as MajorIndustry];

      return {
        industry,
        salaryMultiplier: multiplier,
        salaryRange: {
          junior: {
            low: Math.round(baseSalary.junior.low * multiplier),
            high: Math.round(baseSalary.junior.high * multiplier)
          },
          mid: {
            low: Math.round(baseSalary.mid.low * multiplier),
            high: Math.round(baseSalary.mid.high * multiplier)
          },
          senior: {
            low: Math.round(baseSalary.senior.low * multiplier),
            high: Math.round(baseSalary.senior.high * multiplier)
          }
        },
        totalCompensationNotes: this.generateCompensationNotes(industry, characteristics),
        benefits: this.generateBenefits(industry, characteristics),
        equityPotential: this.getEquityPotential(industry)
      };
    });
  }

  private static generateCompensationNotes(industry: string, characteristics: IndustryCharacteristics): string[] {
    const baseNotes = [
      `${industry} typically offers ${characteristics.budgetConstraints === 'high-budget' ? 'competitive' : 'moderate'} base salaries`,
    ];

    if (characteristics.budgetConstraints === 'high-budget') {
      baseNotes.push('Performance bonuses common', 'Stock options or RSUs often available');
    }

    if (industry === 'Technology') {
      baseNotes.push('Equity compensation can significantly increase total comp', 'Annual refresher grants common');
    } else if (industry === 'Financial Services') {
      baseNotes.push('Year-end bonuses can be 20-100% of base salary', 'Deferred compensation for senior roles');
    } else if (industry === 'Healthcare') {
      baseNotes.push('Strong job security and benefits', 'Loan forgiveness programs may be available');
    }

    return baseNotes;
  }

  private static generateBenefits(industry: string, characteristics: IndustryCharacteristics): string[] {
    const baseBenefits = ['Health insurance', 'Retirement plan (401k)'];

    if (characteristics.budgetConstraints === 'high-budget') {
      baseBenefits.push('Premium health coverage', 'Wellness programs', 'Professional development budget');
    }

    if (industry === 'Technology') {
      baseBenefits.push('Flexible work arrangements', 'Unlimited PTO', 'Free meals/snacks', 'Home office stipend');
    } else if (industry === 'Financial Services') {
      baseBenefits.push('Performance bonuses', 'Tuition reimbursement', 'Financial planning services');
    } else if (industry === 'Healthcare') {
      baseBenefits.push('Excellent health benefits', 'Pension plans', 'Continuing education support');
    }

    return baseBenefits;
  }

  private static getEquityPotential(industry: string): 'high' | 'moderate' | 'low' | 'none' {
    const equityMap: Record<string, 'high' | 'moderate' | 'low' | 'none'> = {
      'Technology': 'high',
      'Financial Services': 'moderate',
      'Healthcare': 'low',
      'Consulting': 'low',
      'Retail & E-commerce': 'moderate',
      'Manufacturing': 'low',
      'Media & Entertainment': 'moderate',
      'Government & Non-profit': 'none',
      'Energy & Utilities': 'low',
      'Education': 'none',
      'Real Estate': 'low',
      'Transportation & Logistics': 'low'
    };

    return equityMap[industry] || 'low';
  }

  private static generateGrowthProjections(careerTitle: string, industries: string[]): IndustryGrowthProjection[] {
    // This would ideally pull from real market data, but for now we'll use reasonable projections
    const growthData: Record<string, { rate: number; factors: string[]; outlook: string }> = {
      'Technology': {
        rate: 8.5,
        factors: ['AI and automation adoption', 'Digital transformation', 'Cloud computing growth'],
        outlook: 'Strong continued growth expected through 2030+'
      },
      'Healthcare': {
        rate: 6.2,
        factors: ['Aging population', 'Healthcare digitization', 'Preventive care focus'],
        outlook: 'Steady growth driven by demographic trends'
      },
      'Financial Services': {
        rate: 4.1,
        factors: ['Fintech innovation', 'Regulatory compliance needs', 'Digital banking'],
        outlook: 'Moderate growth with technology-driven transformation'
      },
      'Retail & E-commerce': {
        rate: 7.3,
        factors: ['E-commerce expansion', 'Omnichannel strategies', 'Customer analytics'],
        outlook: 'Strong growth in digital commerce and analytics roles'
      },
      'Manufacturing': {
        rate: 3.8,
        factors: ['Industry 4.0 adoption', 'Supply chain optimization', 'Automation'],
        outlook: 'Steady growth with focus on technology integration'
      }
    };

    return industries.map(industry => {
      const data = growthData[industry] || { rate: 4.0, factors: ['Market dynamics', 'Technology adoption'], outlook: 'Moderate growth expected' };

      return {
        industry,
        overallGrowthRate: data.rate,
        timeframe: '2024-2029',
        roleSpecificGrowth: {
          junior: data.rate > 6 ? 'high' : data.rate > 4 ? 'moderate' : 'slow',
          mid: data.rate > 5 ? 'high' : data.rate > 3 ? 'moderate' : 'slow',
          senior: data.rate > 4 ? 'high' : data.rate > 2 ? 'moderate' : 'slow'
        },
        drivingFactors: data.factors,
        futureOutlook: data.outlook,
        recommendedPreparation: this.getRecommendedPreparation(careerTitle, industry)
      };
    });
  }

  private static getRecommendedPreparation(careerTitle: string, industry: string): string[] {
    const basePrep = ['Stay current with industry trends', 'Develop domain expertise', 'Build professional network'];

    if (industry === 'Technology') {
      basePrep.push('Learn emerging technologies', 'Contribute to open source', 'Attend tech conferences');
    } else if (industry === 'Healthcare') {
      basePrep.push('Understand healthcare regulations', 'Learn clinical terminology', 'Focus on patient privacy');
    } else if (industry === 'Financial Services') {
      basePrep.push('Obtain relevant certifications', 'Study financial regulations', 'Develop quantitative skills');
    }

    return basePrep;
  }

  private static generateHiringPatterns(careerTitle: string, industries: string[]): IndustryHiringPatterns[] {
    return industries.map(industry => {
      const characteristics = this.industryCharacteristics[industry as MajorIndustry];

      return {
        industry,
        hiringVolume: this.getHiringVolume(industry),
        seasonality: this.getSeasonality(industry),
        commonCompanyTypes: this.getCommonCompanyTypes(industry),
        typicalCompanySizes: [characteristics?.typicalCompanySize || 'mixed'],
        remoteWorkAvailability: this.getRemoteWorkAvailability(industry),
        locationConcentration: this.getLocationConcentration(industry),
        recruitionChannels: ['LinkedIn', 'Company websites', 'Recruiting firms', 'Industry job boards'],
        interviewProcess: this.getInterviewProcess(industry, careerTitle)
      };
    });
  }

  private static getHiringVolume(industry: string): 'very-high' | 'high' | 'moderate' | 'low' {
    const volumeMap: Record<string, 'very-high' | 'high' | 'moderate' | 'low'> = {
      'Technology': 'very-high',
      'Healthcare': 'high',
      'Financial Services': 'high',
      'Retail & E-commerce': 'high',
      'Manufacturing': 'moderate',
      'Consulting': 'moderate',
      'Media & Entertainment': 'moderate',
      'Government & Non-profit': 'low',
      'Energy & Utilities': 'low',
      'Education': 'low',
      'Real Estate': 'moderate',
      'Transportation & Logistics': 'moderate'
    };

    return volumeMap[industry] || 'moderate';
  }

  private static getSeasonality(industry: string): string {
    const seasonalityMap: Record<string, string> = {
      'Technology': 'Year-round hiring with slight uptick in Q1 and Q3',
      'Healthcare': 'Steady year-round demand',
      'Financial Services': 'Peak hiring in Q1 and Q4, slower in summer',
      'Retail & E-commerce': 'High demand before holiday seasons (Q3-Q4)',
      'Manufacturing': 'Steady with increased demand in spring/summer',
      'Consulting': 'Peak hiring in Q1 and Q3, project-based fluctuations',
      'Government & Non-profit': 'Fiscal year dependent (often Q4-Q1)',
      'Education': 'Peak hiring in spring/early summer for fall positions'
    };

    return seasonalityMap[industry] || 'Relatively steady year-round';
  }

  private static getCommonCompanyTypes(industry: string): string[] {
    const companyTypeMap: Record<string, string[]> = {
      'Technology': ['Startups', 'Scale-ups', 'Big Tech', 'SaaS companies', 'Consulting firms'],
      'Healthcare': ['Hospitals', 'Health systems', 'Pharmaceutical companies', 'Medical device companies', 'Healthcare IT'],
      'Financial Services': ['Banks', 'Investment firms', 'Insurance companies', 'Fintech startups', 'Credit unions'],
      'Retail & E-commerce': ['E-commerce platforms', 'Retail chains', 'Fashion brands', 'Marketplaces', 'CPG companies'],
      'Manufacturing': ['Manufacturers', 'Industrial companies', 'Automotive companies', 'Aerospace firms', 'Chemical companies']
    };

    return companyTypeMap[industry] || ['Large enterprises', 'Mid-size companies', 'Specialized firms'];
  }

  private static getRemoteWorkAvailability(industry: string): 'high' | 'moderate' | 'low' | 'rare' {
    const remoteMap: Record<string, 'high' | 'moderate' | 'low' | 'rare'> = {
      'Technology': 'high',
      'Financial Services': 'moderate',
      'Healthcare': 'low',
      'Consulting': 'moderate',
      'Retail & E-commerce': 'moderate',
      'Manufacturing': 'low',
      'Media & Entertainment': 'high',
      'Government & Non-profit': 'low',
      'Energy & Utilities': 'low',
      'Education': 'moderate',
      'Real Estate': 'moderate',
      'Transportation & Logistics': 'low'
    };

    return remoteMap[industry] || 'moderate';
  }

  private static getLocationConcentration(industry: string): string[] {
    const locationMap: Record<string, string[]> = {
      'Technology': ['San Francisco Bay Area', 'Seattle', 'Austin', 'New York', 'Boston'],
      'Healthcare': ['Major metropolitan areas', 'Boston', 'Minneapolis', 'Nashville', 'Dallas'],
      'Financial Services': ['New York', 'Charlotte', 'Chicago', 'San Francisco', 'London'],
      'Retail & E-commerce': ['Seattle', 'San Francisco', 'New York', 'Minneapolis', 'Atlanta'],
      'Manufacturing': ['Detroit', 'Chicago', 'Houston', 'Cleveland', 'Milwaukee']
    };

    return locationMap[industry] || ['Major metropolitan areas', 'Industry hubs'];
  }

  private static getInterviewProcess(industry: string, careerTitle: string): string[] {
    const baseProcess = ['Initial screening', 'Technical assessment', 'Behavioral interview', 'Final round'];

    if (industry === 'Technology') {
      return ['Phone screen', 'Technical assessment', 'System design (senior roles)', 'Cultural fit', 'Final round'];
    } else if (industry === 'Financial Services') {
      return ['HR screening', 'Technical interview', 'Case study', 'Compliance check', 'Senior leadership interview'];
    } else if (industry === 'Healthcare') {
      return ['Application review', 'Phone interview', 'Technical assessment', 'Background check', 'Reference check'];
    }

    return baseProcess;
  }

  private static generateTransitionDifficulty(careerTitle: string, industries: string[]): Record<string, {
    difficulty: 'easy' | 'moderate' | 'hard' | 'very-hard';
    timeToTransition: string;
    requiredPreparation: string[];
    successTips: string[];
  }> {
    const transitions: Record<string, any> = {};

    industries.forEach(industry => {
      transitions[industry] = {
        difficulty: this.getTransitionDifficulty(industry),
        timeToTransition: this.getTransitionTime(industry),
        requiredPreparation: this.getTransitionPreparation(careerTitle, industry),
        successTips: this.getTransitionTips(industry)
      };
    });

    return transitions;
  }

  private static getTransitionDifficulty(industry: string): 'easy' | 'moderate' | 'hard' | 'very-hard' {
    const difficultyMap: Record<string, 'easy' | 'moderate' | 'hard' | 'very-hard'> = {
      'Technology': 'moderate',
      'Healthcare': 'hard',
      'Financial Services': 'hard',
      'Retail & E-commerce': 'easy',
      'Manufacturing': 'moderate',
      'Consulting': 'moderate',
      'Media & Entertainment': 'moderate',
      'Government & Non-profit': 'easy',
      'Education': 'easy'
    };

    return difficultyMap[industry] || 'moderate';
  }

  private static getTransitionTime(industry: string): string {
    const timeMap: Record<string, string> = {
      'Technology': '3-6 months',
      'Healthcare': '6-12 months',
      'Financial Services': '6-9 months',
      'Retail & E-commerce': '2-4 months',
      'Manufacturing': '4-6 months',
      'Consulting': '3-6 months',
      'Government & Non-profit': '2-4 months',
      'Education': '2-4 months'
    };

    return timeMap[industry] || '3-6 months';
  }

  private static getTransitionPreparation(careerTitle: string, industry: string): string[] {
    const basePrep = [`Learn ${industry.toLowerCase()} domain knowledge`, 'Network with industry professionals', 'Update resume with relevant keywords'];

    if (industry === 'Healthcare') {
      basePrep.push('Understand HIPAA and healthcare regulations', 'Learn medical terminology', 'Consider healthcare analytics certification');
    } else if (industry === 'Financial Services') {
      basePrep.push('Study financial markets and products', 'Consider Series 7 or CFA certification', 'Learn risk management concepts');
    } else if (industry === 'Technology') {
      basePrep.push('Learn relevant programming languages', 'Build portfolio projects', 'Contribute to open source');
    }

    return basePrep;
  }

  private static getTransitionTips(industry: string): string[] {
    const baseTips = ['Leverage transferable skills', 'Start with entry-level positions', 'Consider contract/consulting work first'];

    if (industry === 'Technology') {
      baseTips.push('Attend tech meetups and conferences', 'Build a strong GitHub profile', 'Consider bootcamp or online courses');
    } else if (industry === 'Healthcare') {
      baseTips.push('Volunteer at healthcare organizations', 'Shadow healthcare professionals', 'Take healthcare informatics courses');
    }

    return baseTips;
  }
}
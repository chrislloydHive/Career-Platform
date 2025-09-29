import {
  CareerPathProfile,
  CareerPathComparison,
  ComparisonInsight
} from '@/types/career-comparison';

export const CAREER_PATH_PROFILES: Record<string, CareerPathProfile> = {
  'data-analytics': {
    id: 'data-analytics',
    name: 'Data Analytics',
    description: 'Transform raw data into actionable business insights through statistical analysis, visualization, and reporting.',
    lifestyle: {
      workLifeBalance: {
        score: 7,
        description: 'Generally good work-life balance with predictable hours, though project deadlines can create temporary intensity.',
        typicalHours: '40-45 hours/week',
        flexibility: 'high',
        flexibilityDescription: 'Most analytical work can be done independently with flexible scheduling'
      },
      travelRequirements: {
        frequency: 'minimal',
        description: 'Occasional travel for stakeholder meetings or conference presentations',
        percentage: 5
      },
      scheduleFlexibility: {
        score: 8,
        remoteWork: 'hybrid',
        flexibleHours: true,
        description: 'High flexibility due to nature of analytical work - results matter more than hours'
      },
      stressLevel: {
        score: 5,
        factors: ['Data quality issues', 'Tight deadlines', 'Technical challenges'],
        description: 'Moderate stress primarily from technical problem-solving and deadline pressure'
      }
    },
    skillEmphasis: {
      technicalSkills: {
        weight: 70,
        primarySkills: ['SQL', 'Python/R', 'Statistics', 'Data Visualization', 'Machine Learning'],
        description: 'Heavy emphasis on technical data manipulation and analysis tools'
      },
      peopleSkills: {
        weight: 20,
        primarySkills: ['Stakeholder Communication', 'Requirements Gathering', 'Presentation Skills'],
        description: 'Important for translating technical findings to business stakeholders'
      },
      analyticalSkills: {
        weight: 80,
        primarySkills: ['Statistical Thinking', 'Problem Decomposition', 'Pattern Recognition', 'Hypothesis Testing'],
        description: 'Core competency - ability to find insights in complex datasets'
      },
      creativeSkills: {
        weight: 30,
        primarySkills: ['Data Storytelling', 'Visualization Design', 'Creative Problem Solving'],
        description: 'Applied creativity in presenting insights and solving unique analytical challenges'
      },
      leadershipSkills: {
        weight: 25,
        primarySkills: ['Project Leadership', 'Cross-functional Collaboration', 'Mentoring'],
        description: 'Growing importance as you advance to lead analytical initiatives'
      }
    },
    industryMobility: {
      transferabilityScore: 9,
      industries: [
        { name: 'Technology', transferability: 'high', reasoning: 'Data-driven decision making is core to tech companies' },
        { name: 'Finance', transferability: 'high', reasoning: 'Risk analysis and quantitative modeling are essential' },
        { name: 'Healthcare', transferability: 'high', reasoning: 'Clinical research and population health analytics' },
        { name: 'Retail/E-commerce', transferability: 'high', reasoning: 'Customer analytics and inventory optimization' },
        { name: 'Manufacturing', transferability: 'medium', reasoning: 'Quality control and process optimization' },
        { name: 'Non-profit', transferability: 'medium', reasoning: 'Impact measurement and donor analytics' }
      ],
      skillsTransferability: {
        highly: ['Statistical Analysis', 'SQL', 'Data Visualization', 'Critical Thinking'],
        moderately: ['Domain-specific Modeling', 'Industry Metrics', 'Regulatory Knowledge'],
        poorly: ['Industry-specific Tools', 'Compliance Requirements']
      },
      careerPivotOptions: [
        { role: 'Data Scientist', difficulty: 'easy', timeRequired: '6-12 months', description: 'Natural progression with additional ML focus' },
        { role: 'Business Intelligence Manager', difficulty: 'moderate', timeRequired: '1-2 years', description: 'Requires leadership and strategy skills' },
        { role: 'Product Analyst', difficulty: 'easy', timeRequired: '3-6 months', description: 'Apply analytics to product optimization' },
        { role: 'Strategy Consultant', difficulty: 'moderate', timeRequired: '1-2 years', description: 'Leverage analytical thinking for business strategy' }
      ]
    },
    riskReward: {
      stabilityScore: 8,
      growthPotential: 8,
      salaryProgression: {
        entryLevel: { min: 65000, max: 85000 },
        midLevel: { min: 90000, max: 130000 },
        seniorLevel: { min: 130000, max: 200000 },
        description: 'Strong salary progression with high demand for experienced analysts'
      },
      jobSecurity: {
        score: 9,
        factors: ['High demand across industries', 'Critical business function', 'Difficult to outsource'],
        marketOutlook: 'rapidly-growing',
        automationRisk: 'low'
      },
      entrepreneurialOpportunity: {
        score: 7,
        opportunities: ['Analytics Consulting', 'SaaS Analytics Tools', 'Industry-specific Solutions'],
        description: 'Good opportunities for consulting or building analytical tools for specific industries'
      }
    },
    idealFor: [
      'Detail-oriented problem solvers',
      'People who enjoy working with numbers and patterns',
      'Those who like translating complex information into clear insights',
      'Independent workers who enjoy deep focus time'
    ],
    notIdealFor: [
      'People who prefer constant human interaction',
      'Those uncomfortable with ambiguity in data',
      'Individuals who dislike technical troubleshooting',
      'People seeking high-stakes, fast-paced environments'
    ],
    timeToCompetency: '1-2 years',
    educationRequirements: ['Bachelor\'s in quantitative field', 'Strong statistics/math foundation', 'Programming experience preferred']
  },

  'product-management': {
    id: 'product-management',
    name: 'Product Management',
    description: 'Drive product strategy, prioritize features, and coordinate cross-functional teams to deliver products that solve customer problems.',
    lifestyle: {
      workLifeBalance: {
        score: 6,
        description: 'Moderate work-life balance with high responsibility and cross-functional coordination demands.',
        typicalHours: '45-55 hours/week',
        flexibility: 'medium',
        flexibilityDescription: 'Schedule driven by meetings, launches, and cross-team coordination needs'
      },
      travelRequirements: {
        frequency: 'moderate',
        description: 'Regular travel for customer research, team collaboration, and industry events',
        percentage: 15
      },
      scheduleFlexibility: {
        score: 6,
        remoteWork: 'hybrid',
        flexibleHours: false,
        description: 'Limited flexibility due to need for real-time collaboration with multiple teams'
      },
      stressLevel: {
        score: 7,
        factors: ['Multiple stakeholder demands', 'Launch pressures', 'Resource constraints', 'Market competition'],
        description: 'Higher stress from balancing competing priorities and external pressures'
      }
    },
    skillEmphasis: {
      technicalSkills: {
        weight: 40,
        primarySkills: ['Product Analytics', 'Technical Architecture Understanding', 'Agile/Scrum', 'Prototyping Tools'],
        description: 'Moderate technical depth needed to work effectively with engineering teams'
      },
      peopleSkills: {
        weight: 70,
        primarySkills: ['Stakeholder Management', 'Customer Empathy', 'Cross-functional Communication', 'Conflict Resolution'],
        description: 'Critical for managing diverse stakeholders and building consensus'
      },
      analyticalSkills: {
        weight: 60,
        primarySkills: ['Market Analysis', 'User Research', 'Data-driven Decision Making', 'Strategic Thinking'],
        description: 'Essential for understanding market needs and making prioritization decisions'
      },
      creativeSkills: {
        weight: 65,
        primarySkills: ['Design Thinking', 'Feature Innovation', 'User Experience Design', 'Problem Reframing'],
        description: 'High importance for envisioning product solutions and user experiences'
      },
      leadershipSkills: {
        weight: 80,
        primarySkills: ['Vision Setting', 'Team Influence', 'Strategic Planning', 'Change Management'],
        description: 'Core competency for driving product vision and rallying teams around goals'
      }
    },
    industryMobility: {
      transferabilityScore: 8,
      industries: [
        { name: 'Technology', transferability: 'high', reasoning: 'Product management principles apply across all tech products' },
        { name: 'Financial Services', transferability: 'high', reasoning: 'Digital transformation driving product-led approaches' },
        { name: 'Healthcare', transferability: 'medium', reasoning: 'Regulatory complexity but growing digital health focus' },
        { name: 'Retail/E-commerce', transferability: 'high', reasoning: 'Customer experience and digital product focus' },
        { name: 'Manufacturing', transferability: 'medium', reasoning: 'IoT and digital transformation creating product opportunities' },
        { name: 'Education', transferability: 'medium', reasoning: 'EdTech growth but different stakeholder dynamics' }
      ],
      skillsTransferability: {
        highly: ['Strategic Thinking', 'User Research', 'Agile Methodologies', 'Cross-functional Leadership'],
        moderately: ['Industry Knowledge', 'Regulatory Understanding', 'Domain-specific Metrics'],
        poorly: ['Platform-specific Tools', 'Industry Regulations', 'Specialized Compliance']
      },
      careerPivotOptions: [
        { role: 'Strategy Consultant', difficulty: 'moderate', timeRequired: '1-2 years', description: 'Leverage strategic thinking and business analysis skills' },
        { role: 'Marketing Manager', difficulty: 'easy', timeRequired: '6-12 months', description: 'Apply customer insight and go-to-market experience' },
        { role: 'Business Development', difficulty: 'moderate', timeRequired: '1-2 years', description: 'Use market understanding and relationship skills' },
        { role: 'Startup Founder', difficulty: 'moderate', timeRequired: '6-18 months', description: 'Apply product vision and execution experience' }
      ]
    },
    riskReward: {
      stabilityScore: 6,
      growthPotential: 9,
      salaryProgression: {
        entryLevel: { min: 85000, max: 120000 },
        midLevel: { min: 120000, max: 180000 },
        seniorLevel: { min: 180000, max: 350000 },
        description: 'High growth potential with significant compensation increases at senior levels'
      },
      jobSecurity: {
        score: 7,
        factors: ['High impact on business success', 'Cross-functional skill set', 'Growing digital transformation'],
        marketOutlook: 'growing',
        automationRisk: 'low'
      },
      entrepreneurialOpportunity: {
        score: 9,
        opportunities: ['Product-led Startups', 'Consulting Services', 'Product Training/Education', 'SaaS Products'],
        description: 'Excellent preparation for entrepreneurship with market insight and execution skills'
      }
    },
    idealFor: [
      'Natural coordinators and relationship builders',
      'People who enjoy solving customer problems',
      'Strategic thinkers who can balance competing priorities',
      'Those energized by cross-functional collaboration'
    ],
    notIdealFor: [
      'People who prefer working independently',
      'Those uncomfortable with ambiguity and changing priorities',
      'Individuals who need deep technical specialization',
      'People who dislike politics and stakeholder management'
    ],
    timeToCompetency: '2-3 years',
    educationRequirements: ['Bachelor\'s degree (any field)', 'Business acumen', 'Customer-facing experience preferred']
  },

  'ux-design': {
    id: 'ux-design',
    name: 'UX Design',
    description: 'Research user needs, design intuitive interfaces, and create delightful experiences that solve real user problems.',
    lifestyle: {
      workLifeBalance: {
        score: 7,
        description: 'Good work-life balance with creative fulfillment, though project deadlines can create intensity.',
        typicalHours: '40-50 hours/week',
        flexibility: 'high',
        flexibilityDescription: 'Creative work allows for flexible scheduling and remote collaboration'
      },
      travelRequirements: {
        frequency: 'minimal',
        description: 'Occasional travel for user research, design conferences, or client meetings',
        percentage: 8
      },
      scheduleFlexibility: {
        score: 8,
        remoteWork: 'full',
        flexibleHours: true,
        description: 'High flexibility as design work can be done independently with periodic collaboration'
      },
      stressLevel: {
        score: 6,
        factors: ['Design critiques', 'User feedback pressure', 'Technical constraints', 'Subjective feedback'],
        description: 'Moderate stress from creative criticism and balancing user needs with business constraints'
      }
    },
    skillEmphasis: {
      technicalSkills: {
        weight: 50,
        primarySkills: ['Design Tools (Figma, Sketch)', 'Prototyping', 'HTML/CSS Basics', 'User Research Tools'],
        description: 'Moderate technical skills focused on design tools and basic web technologies'
      },
      peopleSkills: {
        weight: 65,
        primarySkills: ['User Empathy', 'Stakeholder Communication', 'Design Critique', 'Client Presentation'],
        description: 'Important for understanding users and communicating design decisions'
      },
      analyticalSkills: {
        weight: 55,
        primarySkills: ['User Research', 'Usability Testing', 'Information Architecture', 'Behavioral Analysis'],
        description: 'Significant focus on understanding user behavior and measuring design effectiveness'
      },
      creativeSkills: {
        weight: 85,
        primarySkills: ['Visual Design', 'Interaction Design', 'Design Thinking', 'Creative Problem Solving'],
        description: 'Core competency - ability to create innovative and aesthetically pleasing solutions'
      },
      leadershipSkills: {
        weight: 45,
        primarySkills: ['Design Team Leadership', 'Design System Governance', 'Creative Direction'],
        description: 'Growing importance for senior roles leading design teams and initiatives'
      }
    },
    industryMobility: {
      transferabilityScore: 7,
      industries: [
        { name: 'Technology', transferability: 'high', reasoning: 'Digital products require strong UX design capabilities' },
        { name: 'E-commerce', transferability: 'high', reasoning: 'Customer experience directly impacts conversion and retention' },
        { name: 'Financial Services', transferability: 'medium', reasoning: 'Growing focus on digital experience but regulatory constraints' },
        { name: 'Healthcare', transferability: 'medium', reasoning: 'Patient experience focus but complex regulatory environment' },
        { name: 'Education', transferability: 'medium', reasoning: 'EdTech growth but different user dynamics' },
        { name: 'Entertainment/Media', transferability: 'high', reasoning: 'Content and experience design are core business needs' }
      ],
      skillsTransferability: {
        highly: ['User Research Methods', 'Design Thinking', 'Prototyping', 'Usability Principles'],
        moderately: ['Industry-specific Patterns', 'Domain Knowledge', 'Compliance Requirements'],
        poorly: ['Platform-specific Guidelines', 'Industry Regulations', 'Specialized Accessibility Standards']
      },
      careerPivotOptions: [
        { role: 'Product Manager', difficulty: 'moderate', timeRequired: '1-2 years', description: 'Leverage user understanding and product thinking skills' },
        { role: 'Design Researcher', difficulty: 'easy', timeRequired: '6-12 months', description: 'Focus on research aspects of UX practice' },
        { role: 'Creative Director', difficulty: 'moderate', timeRequired: '2-3 years', description: 'Expand to broader creative leadership role' },
        { role: 'UX Consultant', difficulty: 'easy', timeRequired: '1-2 years', description: 'Apply design expertise across multiple clients' }
      ]
    },
    riskReward: {
      stabilityScore: 7,
      growthPotential: 7,
      salaryProgression: {
        entryLevel: { min: 70000, max: 95000 },
        midLevel: { min: 95000, max: 140000 },
        seniorLevel: { min: 140000, max: 220000 },
        description: 'Steady progression with premium for design leadership and specialized skills'
      },
      jobSecurity: {
        score: 8,
        factors: ['Critical for digital products', 'Human-centered skills difficult to automate', 'Growing design awareness'],
        marketOutlook: 'growing',
        automationRisk: 'low'
      },
      entrepreneurialOpportunity: {
        score: 8,
        opportunities: ['Design Consultancy', 'Design Tools/Products', 'Digital Agencies', 'Design Education'],
        description: 'Strong opportunities for independent consulting and creating design-focused products'
      }
    },
    idealFor: [
      'Creative problem solvers with aesthetic sensibility',
      'People who are naturally empathetic to user needs',
      'Visual thinkers who enjoy iterative improvement',
      'Those who find fulfillment in crafting delightful experiences'
    ],
    notIdealFor: [
      'People who prefer working with numbers over visuals',
      'Those uncomfortable with subjective feedback',
      'Individuals who need highly structured processes',
      'People who avoid creative criticism and iteration'
    ],
    timeToCompetency: '1-2 years',
    educationRequirements: ['Design-related degree preferred', 'Strong portfolio demonstrating design thinking', 'Understanding of user-centered design principles']
  }
};

export class CareerComparisonGenerator {
  static generateComparison(pathIds: string[]): CareerPathComparison {
    const paths = pathIds.map(id => CAREER_PATH_PROFILES[id]).filter(Boolean);

    if (paths.length < 2) {
      throw new Error('At least 2 career paths required for comparison');
    }

    const insights = this.generateInsights(paths);
    const recommendation = this.generateRecommendations(paths);

    return {
      paths,
      insights,
      recommendation
    };
  }

  private static generateInsights(paths: CareerPathProfile[]): ComparisonInsight[] {
    const insights: ComparisonInsight[] = [];

    // Work-Life Balance Insight
    insights.push({
      category: 'lifestyle',
      title: 'Work-Life Balance Comparison',
      description: 'How each path affects your personal time and schedule flexibility',
      paths: paths.map(path => ({
        pathId: path.id,
        score: path.lifestyle.workLifeBalance.score,
        reasoning: `${path.lifestyle.workLifeBalance.description} (${path.lifestyle.workLifeBalance.typicalHours})`
      }))
    });

    // Technical vs People Skills
    insights.push({
      category: 'skills',
      title: 'Technical vs People Skills Balance',
      description: 'The relative importance of technical capabilities versus interpersonal skills',
      paths: paths.map(path => ({
        pathId: path.id,
        score: Math.round((path.skillEmphasis.technicalSkills.weight + path.skillEmphasis.analyticalSkills.weight) / 2),
        reasoning: `${path.skillEmphasis.technicalSkills.weight}% technical, ${path.skillEmphasis.peopleSkills.weight}% people skills`
      }))
    });

    // Industry Mobility
    insights.push({
      category: 'mobility',
      title: 'Career Transferability',
      description: 'How easily skills transfer across industries and roles',
      paths: paths.map(path => ({
        pathId: path.id,
        score: path.industryMobility.transferabilityScore,
        reasoning: `${path.industryMobility.careerPivotOptions.length} pivot options, strong transferability across ${path.industryMobility.industries.filter(i => i.transferability === 'high').length} industries`
      }))
    });

    // Risk vs Reward
    insights.push({
      category: 'risk-reward',
      title: 'Stability vs Growth Potential',
      description: 'Balance between job security and potential for rapid advancement',
      paths: paths.map(path => ({
        pathId: path.id,
        score: Math.round((path.riskReward.stabilityScore + path.riskReward.growthPotential) / 2),
        reasoning: `Stability: ${path.riskReward.stabilityScore}/10, Growth: ${path.riskReward.growthPotential}/10`
      }))
    });

    return insights;
  }

  private static generateRecommendations(paths: CareerPathProfile[]) {
    const sortedByWorkLife = [...paths].sort((a, b) => b.lifestyle.workLifeBalance.score - a.lifestyle.workLifeBalance.score);
    const sortedByGrowth = [...paths].sort((a, b) => b.riskReward.growthPotential - a.riskReward.growthPotential);
    const sortedByStability = [...paths].sort((a, b) => b.riskReward.stabilityScore - a.riskReward.stabilityScore);
    const sortedByCreativity = [...paths].sort((a, b) => b.skillEmphasis.creativeSkills.weight - a.skillEmphasis.creativeSkills.weight);
    const sortedByTechnical = [...paths].sort((a, b) => b.skillEmphasis.technicalSkills.weight - a.skillEmphasis.technicalSkills.weight);
    const sortedByPeople = [...paths].sort((a, b) => b.skillEmphasis.peopleSkills.weight - a.skillEmphasis.peopleSkills.weight);

    return {
      bestFor: {
        workLifeBalance: sortedByWorkLife[0].name,
        careerGrowth: sortedByGrowth[0].name,
        stability: sortedByStability[0].name,
        creativity: sortedByCreativity[0].name,
        technicalFocus: sortedByTechnical[0].name,
        peopleFocus: sortedByPeople[0].name
      },
      tradeOffs: this.generateTradeOffs(paths)
    };
  }

  private static generateTradeOffs(paths: CareerPathProfile[]) {
    const tradeOffs = [];

    for (let i = 0; i < paths.length; i++) {
      for (let j = i + 1; j < paths.length; j++) {
        const path1 = paths[i];
        const path2 = paths[j];

        // Find the most significant difference
        const workLifeDiff = Math.abs(path1.lifestyle.workLifeBalance.score - path2.lifestyle.workLifeBalance.score);
        const growthDiff = Math.abs(path1.riskReward.growthPotential - path2.riskReward.growthPotential);
        const stabilityDiff = Math.abs(path1.riskReward.stabilityScore - path2.riskReward.stabilityScore);
        const creativeDiff = Math.abs(path1.skillEmphasis.creativeSkills.weight - path2.skillEmphasis.creativeSkills.weight);

        let comparison = '';
        const maxDiff = Math.max(workLifeDiff, growthDiff, stabilityDiff, creativeDiff);

        if (maxDiff === workLifeDiff && workLifeDiff >= 2) {
          const betterBalance = path1.lifestyle.workLifeBalance.score > path2.lifestyle.workLifeBalance.score ? path1.name : path2.name;
          const worseBalance = path1.lifestyle.workLifeBalance.score < path2.lifestyle.workLifeBalance.score ? path1.name : path2.name;
          comparison = `${betterBalance} offers significantly better work-life balance than ${worseBalance}`;
        } else if (maxDiff === growthDiff && growthDiff >= 2) {
          const higherGrowth = path1.riskReward.growthPotential > path2.riskReward.growthPotential ? path1.name : path2.name;
          const lowerGrowth = path1.riskReward.growthPotential < path2.riskReward.growthPotential ? path1.name : path2.name;
          comparison = `${higherGrowth} has higher growth potential but ${lowerGrowth} may offer more predictable progression`;
        } else if (maxDiff === creativeDiff && creativeDiff >= 20) {
          const moreCreative = path1.skillEmphasis.creativeSkills.weight > path2.skillEmphasis.creativeSkills.weight ? path1.name : path2.name;
          const lessCreative = path1.skillEmphasis.creativeSkills.weight < path2.skillEmphasis.creativeSkills.weight ? path1.name : path2.name;
          comparison = `${moreCreative} emphasizes creative skills much more than ${lessCreative}`;
        } else {
          comparison = `Both paths offer different strengths - consider your personal priorities for lifestyle vs growth vs creativity`;
        }

        if (comparison) {
          tradeOffs.push({
            path1: path1.name,
            path2: path2.name,
            comparison
          });
        }
      }
    }

    return tradeOffs;
  }
}
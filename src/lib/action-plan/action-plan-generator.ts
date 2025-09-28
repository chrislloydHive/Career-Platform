import { AdaptiveQuestioningEngine } from '@/lib/adaptive-questions/adaptive-engine';
import { CareerFitScore } from '@/lib/matching/realtime-career-matcher';

type ExportedProfile = ReturnType<AdaptiveQuestioningEngine['exportProfile']> & {
  topCareers?: CareerFitScore[];
};

export interface ActionPlan {
  careersToResearch: {
    title: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    searchQuery: string;
    researchActions: string[];
    keyQuestions: string[];
    salaryRange: string;
    growthOutlook: string;
  }[];
  skillsTodevelop: {
    skill: string;
    reason: string;
    timeline: string;
    resources: string[];
    priority: 'critical' | 'important' | 'beneficial';
  }[];
  networkingSuggestions: {
    industry: string;
    strategy: string;
    platforms: string[];
    keyTitles: string[];
    specificActions: string[];
    messageTemplates: string[];
    eventTypes: string[];
  }[];
  jobSearchStrategies: {
    strategy: string;
    description: string;
    timeframe: string;
    effectiveness: string;
  }[];
  timelineRecommendations: {
    phase: string;
    timeframe: string;
    actions: string[];
    milestones: string[];
  }[];
}

export function generateActionPlan(profile: ExportedProfile): ActionPlan {
  const strengths = profile.analysis.strengths || [];
  const preferences = profile.analysis.preferences || [];
  const hiddenInterests = profile.patterns?.hiddenMotivations || [];

  // Generate careers to research based on profile
  const careersToResearch = generateCareerRecommendations(strengths, preferences, hiddenInterests);

  // Generate skills development plan
  const skillsTodevelop = generateSkillsRecommendations(strengths, preferences);

  // Generate networking suggestions
  const networkingSuggestions = generateNetworkingSuggestions(careersToResearch);

  // Generate job search strategies
  const jobSearchStrategies = generateJobSearchStrategies(profile);

  // Generate timeline recommendations
  const timelineRecommendations = generateTimelineRecommendations();

  return {
    careersToResearch,
    skillsTodevelop,
    networkingSuggestions,
    jobSearchStrategies,
    timelineRecommendations
  };
}

function generateCareerRecommendations(
  strengths: string[],
  preferences: string[],
  hiddenInterests: { motivation: string; relatedAreas: string[] }[]
): ActionPlan['careersToResearch'] {
  const careerMap: Record<string, { reason: string; priority: 'high' | 'medium' | 'low' }> = {};

  // Map strengths to careers
  strengths.forEach(strength => {
    const lower = strength.toLowerCase();
    if (lower.includes('analytic') || lower.includes('data') || lower.includes('problem')) {
      careerMap['Data Analyst'] = { reason: `Strong analytical abilities: ${strength}`, priority: 'high' };
      careerMap['Business Analyst'] = { reason: `Problem-solving strength: ${strength}`, priority: 'medium' };
    }
    if (lower.includes('creative') || lower.includes('design') || lower.includes('visual')) {
      careerMap['UX Designer'] = { reason: `Creative strengths: ${strength}`, priority: 'high' };
      careerMap['Product Designer'] = { reason: `Design thinking: ${strength}`, priority: 'medium' };
    }
    if (lower.includes('communication') || lower.includes('writing') || lower.includes('present')) {
      careerMap['Technical Writer'] = { reason: `Communication skills: ${strength}`, priority: 'high' };
      careerMap['Product Manager'] = { reason: `Strong communication: ${strength}`, priority: 'medium' };
    }
    if (lower.includes('detail') || lower.includes('organized') || lower.includes('systematic')) {
      careerMap['Project Manager'] = { reason: `Organizational strength: ${strength}`, priority: 'high' };
      careerMap['Operations Analyst'] = { reason: `Detail-oriented: ${strength}`, priority: 'medium' };
    }
  });

  // Map preferences to careers
  preferences.forEach(preference => {
    const lower = preference.toLowerCase();
    if (lower.includes('collaborate') || lower.includes('team') || lower.includes('people')) {
      careerMap['Product Manager'] = { reason: `Team collaboration preference: ${preference}`, priority: 'high' };
      careerMap['HR Business Partner'] = { reason: `People-focused: ${preference}`, priority: 'medium' };
    }
    if (lower.includes('independent') || lower.includes('autonomous') || lower.includes('self-directed')) {
      careerMap['Software Developer'] = { reason: `Independent work style: ${preference}`, priority: 'high' };
      careerMap['Research Scientist'] = { reason: `Autonomous approach: ${preference}`, priority: 'medium' };
    }
    if (lower.includes('learning') || lower.includes('growth') || lower.includes('challenge')) {
      careerMap['Data Scientist'] = { reason: `Growth mindset: ${preference}`, priority: 'high' };
      careerMap['Consultant'] = { reason: `Learning orientation: ${preference}`, priority: 'medium' };
    }
  });

  // Map hidden interests to careers
  hiddenInterests.forEach(interest => {
    const motivation = interest.motivation?.toLowerCase() || '';
    if (motivation.includes('impact') || motivation.includes('meaning')) {
      careerMap['Product Manager'] = { reason: `Desire for impact: ${interest.motivation}`, priority: 'high' };
      careerMap['UX Researcher'] = { reason: `Meaningful work focus: ${interest.motivation}`, priority: 'medium' };
    }
    if (motivation.includes('innovation') || motivation.includes('creative')) {
      careerMap['Product Designer'] = { reason: `Innovation drive: ${interest.motivation}`, priority: 'high' };
      careerMap['Strategy Consultant'] = { reason: `Creative problem-solving: ${interest.motivation}`, priority: 'medium' };
    }
  });

  // Convert to array and add comprehensive research data
  return Object.entries(careerMap).map(([title, { reason, priority }]) => ({
    title,
    reason,
    priority,
    searchQuery: title.toLowerCase().replace(/\s+/g, '+'),
    researchActions: getResearchActions(title),
    keyQuestions: getKeyQuestions(title),
    salaryRange: getSalaryRange(title),
    growthOutlook: getGrowthOutlook(title)
  }));
}

function generateSkillsRecommendations(
  strengths: string[],
  preferences: string[]
): ActionPlan['skillsTodevelop'] {
  const skills: ActionPlan['skillsTodevelop'] = [];

  // Core professional skills
  skills.push({
    skill: 'Data Analysis & Visualization',
    reason: 'Essential for most modern roles, builds on analytical strengths',
    timeline: '3-6 months',
    resources: ['Coursera: Google Data Analytics', 'Tableau Public tutorials', 'SQL practice on HackerRank'],
    priority: 'critical'
  });

  skills.push({
    skill: 'Project Management',
    reason: 'Valuable across all industries, enhances organizational capabilities',
    timeline: '2-4 months',
    resources: ['PMP Certification prep', 'Agile/Scrum training', 'Asana or Jira tutorials'],
    priority: 'important'
  });

  skills.push({
    skill: 'Digital Communication',
    reason: 'Critical for remote work and stakeholder management',
    timeline: '1-2 months',
    resources: ['LinkedIn Learning: Professional Writing', 'Presentation skills workshops', 'Slack/Teams mastery'],
    priority: 'important'
  });

  // Add specific skills based on strengths
  if (strengths.some(s => s.toLowerCase().includes('analytic'))) {
    skills.push({
      skill: 'Python/R Programming',
      reason: 'Builds on analytical strengths for data science roles',
      timeline: '6-12 months',
      resources: ['Codecademy Python course', 'DataCamp R tutorials', 'Kaggle competitions'],
      priority: 'critical'
    });
  }

  if (strengths.some(s => s.toLowerCase().includes('creative'))) {
    skills.push({
      skill: 'Design Thinking & UX',
      reason: 'Leverages creative abilities for product development',
      timeline: '4-8 months',
      resources: ['Google UX Design Certificate', 'Figma tutorials', 'Design portfolio development'],
      priority: 'critical'
    });
  }

  return skills;
}

function generateNetworkingSuggestions(
  careers: ActionPlan['careersToResearch']
): ActionPlan['networkingSuggestions'] {
  const industries = [...new Set(careers.map(career => {
    if (career.title.includes('Data') || career.title.includes('Analyst')) return 'Data & Analytics';
    if (career.title.includes('Design') || career.title.includes('UX')) return 'Design & Product';
    if (career.title.includes('Manager') || career.title.includes('Product')) return 'Product Management';
    if (career.title.includes('Developer') || career.title.includes('Engineer')) return 'Technology';
    return 'Business & Strategy';
  }))];

  return industries.map(industry => ({
    industry,
    strategy: getNetworkingStrategy(industry),
    platforms: getNetworkingPlatforms(industry),
    keyTitles: getKeyTitles(industry),
    specificActions: getSpecificNetworkingActions(industry),
    messageTemplates: getMessageTemplates(industry),
    eventTypes: getEventTypes(industry)
  }));
}

function getNetworkingStrategy(industry: string): string {
  const strategies: Record<string, string> = {
    'Data & Analytics': 'Join data science meetups, participate in Kaggle competitions, attend analytics conferences',
    'Design & Product': 'Engage with design communities, share portfolio work, attend UX meetups and conferences',
    'Product Management': 'Join PM communities, attend product meetups, participate in product strategy discussions',
    'Technology': 'Contribute to open source projects, join tech meetups, participate in hackathons',
    'Business & Strategy': 'Attend industry conferences, join professional associations, engage in business forums'
  };
  return strategies[industry] || 'Build relationships through industry events and professional communities';
}

function getNetworkingPlatforms(industry: string): string[] {
  const platforms: Record<string, string[]> = {
    'Data & Analytics': ['LinkedIn', 'Kaggle', 'DataCamp Community', 'Reddit r/analytics'],
    'Design & Product': ['LinkedIn', 'Dribbble', 'Behance', 'Designer Hangout Slack'],
    'Product Management': ['LinkedIn', 'Product Hunt', 'Mind the Product', 'ProductCamp'],
    'Technology': ['LinkedIn', 'GitHub', 'Stack Overflow', 'Dev.to'],
    'Business & Strategy': ['LinkedIn', 'Harvard Business Review forums', 'Industry associations']
  };
  return platforms[industry] || ['LinkedIn', 'Industry forums', 'Professional associations'];
}

function getKeyTitles(industry: string): string[] {
  const titles: Record<string, string[]> = {
    'Data & Analytics': ['Data Scientist', 'Analytics Manager', 'Business Intelligence Manager', 'Chief Data Officer'],
    'Design & Product': ['Design Director', 'Head of Design', 'Product Design Manager', 'VP of Product'],
    'Product Management': ['Senior Product Manager', 'Director of Product', 'VP of Product', 'Chief Product Officer'],
    'Technology': ['Engineering Manager', 'Technical Lead', 'CTO', 'VP of Engineering'],
    'Business & Strategy': ['Director of Strategy', 'VP of Business Development', 'General Manager', 'CEO']
  };
  return titles[industry] || ['Manager', 'Director', 'VP', 'C-Level'];
}

function generateJobSearchStrategies(profile: ExportedProfile): ActionPlan['jobSearchStrategies'] {
  return [
    {
      strategy: 'Targeted Application Strategy',
      description: 'Focus on 5-10 high-quality applications per week rather than mass applying',
      timeframe: 'Ongoing',
      effectiveness: 'High - better response rates and fit assessment'
    },
    {
      strategy: 'Network-First Approach',
      description: 'Leverage connections for warm introductions and internal referrals',
      timeframe: '2-3 months of relationship building',
      effectiveness: 'Very High - 70% of jobs are filled through networking'
    },
    {
      strategy: 'Skills Portfolio Development',
      description: 'Create tangible examples of your work and problem-solving abilities',
      timeframe: '1-2 months preparation',
      effectiveness: 'High - demonstrates capabilities beyond resume'
    },
    {
      strategy: 'Industry Research & Insights',
      description: 'Become knowledgeable about target companies and industry trends',
      timeframe: 'Ongoing, 30 mins daily',
      effectiveness: 'Medium-High - shows genuine interest and preparation'
    }
  ];
}

function getResearchActions(title: string): string[] {
  const actionsMap: Record<string, string[]> = {
    'Data Analyst': [
      'Review 10 Data Analyst job postings to identify common requirements',
      'Research 5 companies known for strong data culture (Netflix, Airbnb, Spotify)',
      'Find salary data on Glassdoor, PayScale, and levels.fyi',
      'Read "Data Analyst career path" articles on Harvard Business Review',
      'Join r/analytics and DataCamp community forums'
    ],
    'Product Manager': [
      'Read "Cracking the PM Interview" and "Inspired" by Marty Cagan',
      'Research PM roles at top tech companies (Google, Meta, Amazon)',
      'Follow product leaders on LinkedIn (Julie Zhuo, Ken Norton, Shreyas Doshi)',
      'Analyze 3 products you use daily - write brief product critiques',
      'Join ProductHunt community and Product Manager HQ Slack'
    ],
    'UX Designer': [
      'Build a portfolio showcasing 3 design case studies',
      'Research design systems at major companies (Material Design, Human Interface)',
      'Follow top designers on Dribbble and Behance',
      'Complete Google UX Design Certificate case studies',
      'Join Designer Hangout Slack and local UX meetups'
    ]
  };
  return actionsMap[title] || [
    `Research ${title} job requirements on major job boards`,
    `Find professionals in ${title} roles on LinkedIn`,
    `Read industry articles about ${title} career paths`,
    `Join professional communities related to ${title}`,
    `Analyze salary and growth data for ${title} positions`
  ];
}

function getKeyQuestions(title: string): string[] {
  const questionsMap: Record<string, string[]> = {
    'Data Analyst': [
      'What tools and programming languages are most in-demand?',
      'What types of business problems do data analysts typically solve?',
      'How do I transition from Excel to advanced analytics tools?',
      'What certifications are most valued by employers?',
      'What does a typical day look like for a data analyst?'
    ],
    'Product Manager': [
      'How do I break into PM without prior product experience?',
      'What technical knowledge do I need as a PM?',
      'How do PMs measure success and impact?',
      'What\'s the difference between PM roles at different company stages?',
      'How do I demonstrate product thinking in interviews?'
    ],
    'UX Designer': [
      'How do I build a portfolio without professional design experience?',
      'What design tools should I master first?',
      'How important is a formal design education?',
      'What\'s the difference between UX and UI design roles?',
      'How do I conduct user research and usability testing?'
    ]
  };
  return questionsMap[title] || [
    `What are the core responsibilities of a ${title}?`,
    `What skills and qualifications do employers look for?`,
    `What's the typical career progression for ${title}?`,
    `What tools and technologies should I learn?`,
    `How can I gain relevant experience in ${title}?`
  ];
}

function getSalaryRange(title: string): string {
  const salaryMap: Record<string, string> = {
    'Data Analyst': '$65K-$95K (entry) → $85K-$120K (experienced)',
    'Product Manager': '$90K-$130K (entry) → $120K-$180K (experienced)',
    'UX Designer': '$70K-$100K (entry) → $95K-$140K (experienced)',
    'Business Analyst': '$60K-$85K (entry) → $80K-$110K (experienced)',
    'Software Developer': '$75K-$110K (entry) → $100K-$150K (experienced)',
    'Project Manager': '$65K-$90K (entry) → $85K-$120K (experienced)'
  };
  return salaryMap[title] || '$60K-$90K (entry) → $80K-$120K (experienced)';
}

function getGrowthOutlook(title: string): string {
  const growthMap: Record<string, string> = {
    'Data Analyst': 'Strong growth (25% by 2031) - high demand across industries',
    'Product Manager': 'Very strong growth (30% by 2031) - critical role in tech',
    'UX Designer': 'Rapid growth (35% by 2031) - expanding digital experiences',
    'Business Analyst': 'Steady growth (15% by 2031) - consistent business need',
    'Software Developer': 'Very strong growth (28% by 2031) - ongoing digitization',
    'Project Manager': 'Strong growth (20% by 2031) - essential across industries'
  };
  return growthMap[title] || 'Moderate growth expected - research specific market trends';
}

function getSpecificNetworkingActions(industry: string): string[] {
  const actionsMap: Record<string, string[]> = {
    'Data & Analytics': [
      'Set up coffee chats with 2 data professionals per month',
      'Comment thoughtfully on data science posts on LinkedIn',
      'Participate in Kaggle competitions and share your approach',
      'Attend local Data Science meetups or join virtual events',
      'Follow and engage with data leaders like DJ Patil, Hilary Mason'
    ],
    'Product Management': [
      'Schedule 1 informational interview with a PM weekly',
      'Share product insights and case studies on LinkedIn',
      'Join ProductCamp in your city or attend virtually',
      'Engage in product discussions on Twitter and LinkedIn',
      'Attend product meetups and startup pitch events'
    ],
    'Design & Product': [
      'Share design work and process on Dribbble/Behance',
      'Join local design meetups and portfolio review sessions',
      'Participate in design challenges and critique sessions',
      'Follow design leaders and comment on their work',
      'Attend design conferences like Config, DesignX, or local events'
    ]
  };
  return actionsMap[industry] || [
    'Reach out to 2-3 professionals in the field monthly',
    'Engage with industry content on social media',
    'Attend relevant professional events and meetups',
    'Join online communities and contribute valuable insights',
    'Follow and learn from industry leaders'
  ];
}

function getMessageTemplates(industry: string): string[] {
  const templatesMap: Record<string, string[]> = {
    'Data & Analytics': [
      'Hi [Name], I am exploring a transition into data analytics and was impressed by your work at [Company]. Would you be open to a brief chat about your career path?',
      'Hello [Name], I saw your recent post about [specific topic]. As someone learning data analysis, I would love to hear your perspective on getting started in the field.',
      'Hi [Name], I am working on developing my analytics skills and noticed you have experience with [specific tool/technique]. Would you have 15 minutes to share some insights?'
    ],
    'Product Management': [
      'Hi [Name], I am researching a career transition into product management and would love to learn about your journey at [Company]. Are you open to a brief informational interview?',
      'Hello [Name], I saw your article about [specific PM topic] and found it very insightful. I am exploring PM roles - would you be willing to share some career advice?',
      'Hi [Name], I am developing my product skills and noticed your experience with [specific area]. Could we chat briefly about what you wish you had known starting out?'
    ]
  };
  return templatesMap[industry] || [
    'Hi [Name], I am exploring opportunities in [field] and would value your insights about the industry. Would you be open to a brief conversation?',
    'Hello [Name], I noticed your experience in [specific area] and would love to learn from your perspective. Are you available for a short informational chat?'
  ];
}

function getEventTypes(industry: string): string[] {
  const eventsMap: Record<string, string[]> = {
    'Data & Analytics': [
      'Data Science meetups and conferences',
      'Analytics user groups (Tableau, Power BI, etc.)',
      'Industry conferences (Strata, Spark Summit)',
      'Hackathons and data competitions',
      'University data science seminars'
    ],
    'Product Management': [
      'ProductCamp and PM meetups',
      'Startup pitch events and demo days',
      'Tech conferences with product tracks',
      'Product-focused workshops and bootcamps',
      'Industry association events'
    ],
    'Design & Product': [
      'Design meetups and portfolio reviews',
      'UX conferences (UX Week, Interaction)',
      'Design thinking workshops',
      'Creative industry events',
      'Design sprint facilitation training'
    ]
  };
  return eventsMap[industry] || [
    'Professional association meetings',
    'Industry conferences and seminars',
    'Networking mixers and meetups',
    'Workshops and training sessions',
    'Online webinars and virtual events'
  ];
}

function generateTimelineRecommendations(): ActionPlan['timelineRecommendations'] {
  return [
    {
      phase: 'Foundation Building',
      timeframe: 'Months 1-3',
      actions: [
        'Complete skills assessment and identify gaps',
        'Begin core skill development (data analysis, project management)',
        'Start building professional network',
        'Update LinkedIn profile and create portfolio'
      ],
      milestones: [
        'Complete 1-2 online certifications',
        'Connect with 20+ industry professionals',
        'Have updated portfolio/resume ready'
      ]
    },
    {
      phase: 'Active Exploration',
      timeframe: 'Months 4-6',
      actions: [
        'Conduct informational interviews',
        'Apply to target roles strategically',
        'Attend industry events and meetups',
        'Continue skill development with advanced topics'
      ],
      milestones: [
        'Complete 5+ informational interviews',
        'Apply to 10-15 strategic positions',
        'Attend 3+ industry events'
      ]
    },
    {
      phase: 'Career Transition',
      timeframe: 'Months 7-12',
      actions: [
        'Negotiate offers and evaluate opportunities',
        'Begin new role with 90-day plan',
        'Continue networking and skill development',
        'Set goals for first year in new role'
      ],
      milestones: [
        'Secure new position',
        'Successfully complete 90-day onboarding',
        'Establish new professional relationships'
      ]
    }
  ];
}
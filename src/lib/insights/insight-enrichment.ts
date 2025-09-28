import { DiscoveredInsight } from '../adaptive-questions/adaptive-engine';

export interface EnrichedInsight extends DiscoveredInsight {
  careerRoles: string[];
  nextSteps: string[];
}

const strengthToRolesMap: Record<string, string[]> = {
  'deep work': ['Data Analyst', 'UX Researcher', 'Content Strategist', 'Software Developer', 'Research Scientist'],
  'analytical': ['Business Analyst', 'Data Scientist', 'Financial Analyst', 'Operations Research Analyst', 'Statistician'],
  'creative': ['Creative Director', 'Product Designer', 'Marketing Manager', 'Content Creator', 'Brand Strategist'],
  'collaborative': ['Project Manager', 'Scrum Master', 'HR Business Partner', 'Account Manager', 'Team Lead'],
  'leadership': ['Engineering Manager', 'Product Manager', 'Director of Operations', 'Team Lead', 'VP of Product'],
  'problem solving': ['Solutions Architect', 'Management Consultant', 'Product Manager', 'Systems Engineer', 'Innovation Manager'],
  'communication': ['Technical Writer', 'Product Marketing Manager', 'Customer Success Manager', 'PR Manager', 'Communications Director'],
  'detail-oriented': ['Quality Assurance Engineer', 'Compliance Manager', 'Accountant', 'Editor', 'Research Coordinator'],
  'strategic': ['Strategy Consultant', 'Business Development Manager', 'Chief of Staff', 'Product Strategist', 'VP of Strategy'],
  'technical': ['Software Engineer', 'DevOps Engineer', 'Data Engineer', 'Security Analyst', 'Systems Administrator'],
  'empathy': ['User Researcher', 'Customer Success Manager', 'HR Manager', 'Therapist', 'Social Worker'],
  'organization': ['Operations Manager', 'Program Manager', 'Executive Assistant', 'Event Coordinator', 'Office Manager'],
  'innovation': ['Innovation Manager', 'R&D Engineer', 'Product Designer', 'Entrepreneur', 'Startup Founder'],
  'teaching': ['Training Manager', 'Technical Instructor', 'Learning & Development Specialist', 'Professor', 'Corporate Trainer'],
  'autonomy': ['Freelance Consultant', 'Independent Researcher', 'Entrepreneur', 'Remote Developer', 'Solo Designer'],
};

const preferenceToRolesMap: Record<string, string[]> = {
  'remote work': ['Remote Software Developer', 'Digital Marketing Manager', 'Virtual Assistant', 'Online Educator', 'Remote UX Designer'],
  'flexible schedule': ['Freelance Writer', 'Consultant', 'Independent Designer', 'Contract Developer', 'Part-time Analyst'],
  'team environment': ['Project Manager', 'Agile Coach', 'Product Manager', 'Sales Team Lead', 'Marketing Coordinator'],
  'independent work': ['Data Scientist', 'Software Developer', 'Technical Writer', 'Research Analyst', 'Graphic Designer'],
  'structured': ['Financial Analyst', 'Compliance Officer', 'Quality Assurance', 'Operations Specialist', 'Process Manager'],
  'dynamic': ['Event Manager', 'Sales Executive', 'Startup Employee', 'Emergency Response Coordinator', 'News Reporter'],
  'client-facing': ['Account Manager', 'Sales Engineer', 'Consultant', 'Customer Success Manager', 'Client Services Director'],
  'behind the scenes': ['Backend Engineer', 'Data Analyst', 'Research Scientist', 'Database Administrator', 'Systems Architect'],
  'fast-paced': ['Startup Founder', 'Emergency Room Physician', 'Trader', 'News Producer', 'Agile Developer'],
  'steady pace': ['Research Scientist', 'Technical Writer', 'Librarian', 'Quality Analyst', 'Archivist'],
};

const hiddenInterestToRolesMap: Record<string, string[]> = {
  'data': ['Data Scientist', 'Business Intelligence Analyst', 'Data Engineer', 'Analytics Manager', 'Research Analyst'],
  'design': ['UX Designer', 'Product Designer', 'Visual Designer', 'Design System Lead', 'Brand Designer'],
  'education': ['Corporate Trainer', 'Learning Experience Designer', 'Instructional Designer', 'Educational Consultant', 'Training Manager'],
  'writing': ['Technical Writer', 'Content Strategist', 'Copywriter', 'Documentation Manager', 'Communications Specialist'],
  'research': ['User Researcher', 'Market Research Analyst', 'UX Researcher', 'Data Scientist', 'Research Coordinator'],
  'product': ['Product Manager', 'Product Owner', 'Product Strategist', 'Product Designer', 'Growth Product Manager'],
  'operations': ['Operations Manager', 'Process Improvement Specialist', 'Supply Chain Manager', 'Operations Analyst', 'Logistics Coordinator'],
  'sales': ['Solutions Engineer', 'Business Development Manager', 'Account Executive', 'Sales Manager', 'Pre-Sales Consultant'],
  'technology': ['Software Engineer', 'DevOps Engineer', 'Cloud Architect', 'Solutions Architect', 'Tech Lead'],
  'people': ['People Operations Manager', 'HR Business Partner', 'Talent Development Manager', 'Organizational Development Consultant', 'Culture Manager'],
};

function findMatchingRoles(insightText: string, type: 'strength' | 'preference' | 'hidden-interest' | 'growth-area'): string[] {
  const lowerInsight = insightText.toLowerCase();
  const roles: Set<string> = new Set();

  const maps = type === 'preference' ? preferenceToRolesMap :
                type === 'hidden-interest' ? hiddenInterestToRolesMap :
                strengthToRolesMap;

  Object.entries(maps).forEach(([keyword, roleList]) => {
    if (lowerInsight.includes(keyword)) {
      roleList.slice(0, 3).forEach(role => roles.add(role));
    }
  });

  if (roles.size === 0) {
    const defaultRoles = type === 'strength' ? ['Business Analyst', 'Product Manager', 'Consultant'] :
                        type === 'preference' ? ['Project Manager', 'Team Lead', 'Specialist'] :
                        type === 'hidden-interest' ? ['Analyst', 'Coordinator', 'Manager'] :
                        ['Junior Analyst', 'Associate', 'Coordinator'];
    return defaultRoles;
  }

  return Array.from(roles).slice(0, 5);
}

function generateNextSteps(insight: DiscoveredInsight, roles: string[]): string[] {
  const steps: string[] = [];
  const lowerInsight = insight.insight.toLowerCase();

  if (lowerInsight.includes('deep work') || lowerInsight.includes('focus')) {
    steps.push('Research companies known for focused work environments (e.g., Basecamp, GitLab)');
    steps.push('Ask about uninterrupted work time during interviews');
  }

  if (lowerInsight.includes('collaboration') || lowerInsight.includes('team')) {
    steps.push('Prioritize companies with strong team cultures and collaborative practices');
    steps.push('Look for roles that explicitly mention cross-functional teamwork');
  }

  if (lowerInsight.includes('creative') || lowerInsight.includes('innovation')) {
    steps.push('Build a portfolio showcasing your creative work and problem-solving approach');
    steps.push('Research companies with dedicated innovation time or creative freedom');
  }

  if (lowerInsight.includes('analytical') || lowerInsight.includes('data')) {
    steps.push('Take online courses to strengthen data analysis skills (SQL, Python, R)');
    steps.push('Look for roles with access to rich datasets and analytics tools');
  }

  if (lowerInsight.includes('leadership') || lowerInsight.includes('manage')) {
    steps.push('Seek opportunities to lead projects or mentor junior team members');
    steps.push('Research management training programs and leadership development paths');
  }

  if (lowerInsight.includes('remote') || lowerInsight.includes('flexible')) {
    steps.push('Filter job searches for remote or hybrid positions');
    steps.push('Research companies with proven remote-first cultures');
  }

  if (lowerInsight.includes('structure') || lowerInsight.includes('process')) {
    steps.push('Look for established companies with clear processes and career paths');
    steps.push('Research companies known for operational excellence');
  }

  if (lowerInsight.includes('fast') || lowerInsight.includes('dynamic')) {
    steps.push('Consider startups or high-growth companies with rapid pace');
    steps.push('Research industries undergoing significant transformation');
  }

  if (insight.type === 'hidden-interest') {
    steps.push(`Explore ${roles[0]} role descriptions to understand required skills`);
    steps.push(`Connect with professionals in ${roles[0]} roles on LinkedIn for informational interviews`);
  }

  if (insight.type === 'growth-area') {
    steps.push('Identify specific skills to develop through online courses or workshops');
    steps.push('Seek mentorship from someone strong in this area');
  }

  if (steps.length === 0) {
    steps.push(`Research ${roles[0]} and ${roles[1]} positions to understand key responsibilities`);
    steps.push(`Connect with professionals in these roles for informational interviews`);
    steps.push(`Identify companies that value this strength in their job descriptions`);
  }

  return steps.slice(0, 3);
}

export function enrichInsight(insight: DiscoveredInsight): EnrichedInsight {
  const careerRoles = findMatchingRoles(insight.insight, insight.type);
  const nextSteps = generateNextSteps(insight, careerRoles);

  return {
    ...insight,
    careerRoles,
    nextSteps,
  };
}

export function enrichInsights(insights: DiscoveredInsight[]): EnrichedInsight[] {
  return insights.map(enrichInsight);
}

export function enrichStrength(strength: string): { roles: string[]; nextSteps: string[] } {
  const lowerStrength = strength.toLowerCase();
  const roles: Set<string> = new Set();

  Object.entries(strengthToRolesMap).forEach(([keyword, roleList]) => {
    if (lowerStrength.includes(keyword)) {
      roleList.slice(0, 3).forEach(role => roles.add(role));
    }
  });

  const finalRoles = roles.size > 0 ? Array.from(roles).slice(0, 5) : ['Business Analyst', 'Product Manager', 'Consultant'];

  const nextSteps = [
    `Research ${finalRoles[0]} job descriptions to identify skill gaps`,
    `Connect with professionals in these roles on LinkedIn`,
    `Look for companies that explicitly value this strength in their culture`,
  ];

  return { roles: finalRoles, nextSteps };
}

export function enrichPreference(preference: string): { roles: string[]; nextSteps: string[] } {
  const lowerPref = preference.toLowerCase();
  const roles: Set<string> = new Set();

  Object.entries(preferenceToRolesMap).forEach(([keyword, roleList]) => {
    if (lowerPref.includes(keyword)) {
      roleList.slice(0, 3).forEach(role => roles.add(role));
    }
  });

  const finalRoles = roles.size > 0 ? Array.from(roles).slice(0, 5) : ['Project Manager', 'Team Lead', 'Specialist'];

  const nextSteps = [
    `Filter job searches for roles that match this preference`,
    `Ask about work environment during interviews`,
    `Research companies known for supporting this work style`,
  ];

  return { roles: finalRoles, nextSteps };
}

export function enrichHiddenInterest(interest: string): { roles: string[]; nextSteps: string[] } {
  const lowerInterest = interest.toLowerCase();
  const roles: Set<string> = new Set();

  Object.entries(hiddenInterestToRolesMap).forEach(([keyword, roleList]) => {
    if (lowerInterest.includes(keyword)) {
      roleList.slice(0, 3).forEach(role => roles.add(role));
    }
  });

  const finalRoles = roles.size > 0 ? Array.from(roles).slice(0, 5) : ['Analyst', 'Coordinator', 'Manager'];

  const nextSteps = [
    `Explore entry points into ${finalRoles[0]} roles`,
    `Take online courses to build relevant skills`,
    `Attend industry meetups or webinars in this area`,
  ];

  return { roles: finalRoles, nextSteps };
}
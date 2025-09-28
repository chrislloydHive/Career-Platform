import { CareerFitScore } from '../matching/realtime-career-matcher';
import { DiscoveredInsight } from '../adaptive-questions/adaptive-engine';

export interface CareerPathStage {
  title: string;
  timeframe: string;
  salary: string;
  keyResponsibilities: string[];
  requiredSkills: string[];
}

export interface SkillDevelopmentMilestone {
  skill: string;
  timeframe: string;
  howToLearn: string;
  importance: 'critical' | 'important' | 'beneficial';
}

export interface CareerTrajectory {
  pathName: string;
  description: string;
  startingRole: CareerPathStage;
  midCareer: CareerPathStage;
  seniorRole: CareerPathStage;
  skillDevelopment: SkillDevelopmentMilestone[];
  estimatedTimeline: string;
  industryDemand: 'high' | 'growing' | 'stable' | 'competitive';
  matchScore: number;
  whyThisPath: string[];
}

const careerPathDatabase: Record<string, Omit<CareerTrajectory, 'matchScore' | 'whyThisPath'>> = {
  'Data Analytics & Insights': {
    pathName: 'Data Analytics & Insights',
    description: 'Progress from analyzing data to leading data strategy and insights teams',
    startingRole: {
      title: 'Data Analyst',
      timeframe: 'Years 0-2',
      salary: '$60K-$85K',
      keyResponsibilities: [
        'Create reports and dashboards',
        'Clean and prepare data for analysis',
        'Support business decisions with data insights',
        'Learn data visualization tools'
      ],
      requiredSkills: ['SQL', 'Excel', 'Data Visualization (Tableau/PowerBI)', 'Basic Statistics']
    },
    midCareer: {
      title: 'Senior Data Analyst / Analytics Manager',
      timeframe: 'Years 3-5',
      salary: '$90K-$130K',
      keyResponsibilities: [
        'Lead analytics projects',
        'Mentor junior analysts',
        'Define KPIs and metrics strategy',
        'Present insights to executives'
      ],
      requiredSkills: ['Advanced SQL', 'Python/R', 'Statistical Analysis', 'Project Management', 'Stakeholder Communication']
    },
    seniorRole: {
      title: 'Director of Analytics / Head of Data',
      timeframe: 'Years 6-10',
      salary: '$140K-$200K+',
      keyResponsibilities: [
        'Define company-wide analytics strategy',
        'Build and lead analytics teams',
        'Drive data-informed culture',
        'Partner with C-suite on strategic initiatives'
      ],
      requiredSkills: ['Leadership', 'Strategic Thinking', 'Team Building', 'Business Acumen', 'Data Engineering', 'Machine Learning']
    },
    skillDevelopment: [
      { skill: 'SQL & Database Fundamentals', timeframe: 'Months 0-3', howToLearn: 'Online courses (DataCamp, Mode Analytics)', importance: 'critical' },
      { skill: 'Data Visualization', timeframe: 'Months 3-6', howToLearn: 'Tableau/PowerBI certifications, practice projects', importance: 'critical' },
      { skill: 'Python for Data Analysis', timeframe: 'Months 6-12', howToLearn: 'Pandas, NumPy tutorials, Kaggle competitions', importance: 'important' },
      { skill: 'Statistical Analysis', timeframe: 'Year 1-2', howToLearn: 'Statistics courses, A/B testing practice', importance: 'important' },
      { skill: 'Leadership & Communication', timeframe: 'Year 2-3', howToLearn: 'Present regularly, mentor others, lead projects', importance: 'important' },
      { skill: 'Machine Learning Basics', timeframe: 'Year 3-4', howToLearn: 'ML courses, apply to real problems', importance: 'beneficial' }
    ],
    estimatedTimeline: '6-10 years to senior leadership',
    industryDemand: 'high'
  },

  'Product Management': {
    pathName: 'Product Management',
    description: 'Build products from conception through launch and lead product strategy',
    startingRole: {
      title: 'Associate Product Manager',
      timeframe: 'Years 0-2',
      salary: '$80K-$110K',
      keyResponsibilities: [
        'Support product roadmap execution',
        'Gather user feedback and requirements',
        'Work with engineers and designers',
        'Track product metrics'
      ],
      requiredSkills: ['User Research', 'Prioritization', 'Communication', 'Basic Analytics', 'Agile/Scrum']
    },
    midCareer: {
      title: 'Product Manager / Senior PM',
      timeframe: 'Years 3-5',
      salary: '$120K-$170K',
      keyResponsibilities: [
        'Own product roadmap and strategy',
        'Lead cross-functional teams',
        'Define product vision',
        'Make data-driven decisions'
      ],
      requiredSkills: ['Product Strategy', 'Data Analysis', 'Technical Understanding', 'Leadership', 'Market Research']
    },
    seniorRole: {
      title: 'Director of Product / VP Product',
      timeframe: 'Years 6-10',
      salary: '$180K-$300K+',
      keyResponsibilities: [
        'Set product vision and strategy',
        'Build and lead PM teams',
        'Drive company-wide product initiatives',
        'Partner with CEO on business strategy'
      ],
      requiredSkills: ['Strategic Leadership', 'Team Management', 'Business Strategy', 'Market Positioning', 'Executive Communication']
    },
    skillDevelopment: [
      { skill: 'Product Thinking', timeframe: 'Months 0-6', howToLearn: 'Read "Inspired", "Lean Product", practice product teardowns', importance: 'critical' },
      { skill: 'User Research & Testing', timeframe: 'Months 3-9', howToLearn: 'Conduct user interviews, usability testing', importance: 'critical' },
      { skill: 'Data & Analytics', timeframe: 'Months 6-12', howToLearn: 'SQL, product analytics tools (Amplitude, Mixpanel)', importance: 'important' },
      { skill: 'Technical Fundamentals', timeframe: 'Year 1-2', howToLearn: 'Learn APIs, databases, system design basics', importance: 'important' },
      { skill: 'Stakeholder Management', timeframe: 'Year 2-3', howToLearn: 'Lead projects, present to executives', importance: 'important' },
      { skill: 'Business Strategy', timeframe: 'Year 3-5', howToLearn: 'MBA or product strategy courses', importance: 'beneficial' }
    ],
    estimatedTimeline: '7-10 years to VP level',
    industryDemand: 'high'
  },

  'UX Design & Research': {
    pathName: 'UX Design & Research',
    description: 'Design user experiences and lead design teams',
    startingRole: {
      title: 'UX Designer / Junior UX Researcher',
      timeframe: 'Years 0-2',
      salary: '$65K-$95K',
      keyResponsibilities: [
        'Create wireframes and prototypes',
        'Conduct user research',
        'Design user interfaces',
        'Collaborate with product teams'
      ],
      requiredSkills: ['Figma/Sketch', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems']
    },
    midCareer: {
      title: 'Senior UX Designer / Lead Researcher',
      timeframe: 'Years 3-5',
      salary: '$100K-$150K',
      keyResponsibilities: [
        'Lead design projects',
        'Mentor junior designers',
        'Define design strategy',
        'Present research insights'
      ],
      requiredSkills: ['Advanced Prototyping', 'Research Strategy', 'Design Leadership', 'Cross-functional Collaboration', 'Information Architecture']
    },
    seniorRole: {
      title: 'Design Director / Head of UX',
      timeframe: 'Years 6-10',
      salary: '$150K-$220K+',
      keyResponsibilities: [
        'Set design vision and strategy',
        'Build and lead design teams',
        'Shape product direction',
        'Establish design culture'
      ],
      requiredSkills: ['Design Leadership', 'Team Building', 'Strategic Thinking', 'Executive Communication', 'Design Systems']
    },
    skillDevelopment: [
      { skill: 'Design Tools Mastery', timeframe: 'Months 0-6', howToLearn: 'Figma/Sketch courses, daily practice', importance: 'critical' },
      { skill: 'User Research Methods', timeframe: 'Months 3-9', howToLearn: 'Conduct interviews, usability tests, surveys', importance: 'critical' },
      { skill: 'Interaction Design', timeframe: 'Months 6-12', howToLearn: 'Study interaction patterns, build prototypes', importance: 'important' },
      { skill: 'Design Systems', timeframe: 'Year 1-2', howToLearn: 'Study existing systems, contribute to team system', importance: 'important' },
      { skill: 'Leadership & Mentoring', timeframe: 'Year 2-4', howToLearn: 'Mentor juniors, lead design reviews', importance: 'important' },
      { skill: 'Business & Strategy', timeframe: 'Year 3-5', howToLearn: 'Learn business metrics, strategic design thinking', importance: 'beneficial' }
    ],
    estimatedTimeline: '7-10 years to director level',
    industryDemand: 'growing'
  },

  'Software Engineering': {
    pathName: 'Software Engineering',
    description: 'Build software systems and progress to technical or management leadership',
    startingRole: {
      title: 'Software Engineer',
      timeframe: 'Years 0-2',
      salary: '$85K-$130K',
      keyResponsibilities: [
        'Write and test code',
        'Fix bugs and improve features',
        'Participate in code reviews',
        'Learn best practices'
      ],
      requiredSkills: ['Programming (Python/JavaScript/Java)', 'Git', 'Testing', 'Debugging', 'Algorithms']
    },
    midCareer: {
      title: 'Senior Software Engineer / Tech Lead',
      timeframe: 'Years 3-5',
      salary: '$130K-$190K',
      keyResponsibilities: [
        'Design system architecture',
        'Lead technical projects',
        'Mentor junior engineers',
        'Make technical decisions'
      ],
      requiredSkills: ['System Design', 'Architecture', 'Leadership', 'Code Review', 'Performance Optimization']
    },
    seniorRole: {
      title: 'Engineering Manager / Staff Engineer',
      timeframe: 'Years 6-10',
      salary: '$180K-$350K+',
      keyResponsibilities: [
        'Lead engineering teams or technical direction',
        'Set technical strategy',
        'Drive engineering excellence',
        'Influence company-wide decisions'
      ],
      requiredSkills: ['Technical Leadership', 'Team Management', 'Strategic Thinking', 'Architecture at Scale', 'Communication']
    },
    skillDevelopment: [
      { skill: 'Programming Fundamentals', timeframe: 'Months 0-6', howToLearn: 'Bootcamp or CS courses, daily coding', importance: 'critical' },
      { skill: 'Data Structures & Algorithms', timeframe: 'Months 3-12', howToLearn: 'LeetCode, AlgoExpert, CS courses', importance: 'critical' },
      { skill: 'System Design', timeframe: 'Year 1-2', howToLearn: 'System design courses, read architecture docs', importance: 'important' },
      { skill: 'Testing & Quality', timeframe: 'Year 1-2', howToLearn: 'Write tests, learn testing frameworks', importance: 'important' },
      { skill: 'Leadership Skills', timeframe: 'Year 2-4', howToLearn: 'Lead projects, mentor others', importance: 'important' },
      { skill: 'Cloud & DevOps', timeframe: 'Year 2-4', howToLearn: 'AWS/GCP certifications, CI/CD practice', importance: 'beneficial' }
    ],
    estimatedTimeline: '6-10 years to senior IC or manager',
    industryDemand: 'high'
  },

  'Marketing & Growth': {
    pathName: 'Marketing & Growth',
    description: 'Drive customer acquisition and grow marketing programs',
    startingRole: {
      title: 'Marketing Coordinator / Growth Analyst',
      timeframe: 'Years 0-2',
      salary: '$50K-$75K',
      keyResponsibilities: [
        'Execute marketing campaigns',
        'Analyze campaign performance',
        'Support content creation',
        'Manage marketing tools'
      ],
      requiredSkills: ['Marketing Analytics', 'Content Creation', 'Social Media', 'Email Marketing', 'Basic SEO']
    },
    midCareer: {
      title: 'Marketing Manager / Growth Lead',
      timeframe: 'Years 3-5',
      salary: '$85K-$130K',
      keyResponsibilities: [
        'Own marketing channels',
        'Lead campaign strategy',
        'Manage marketing budget',
        'Drive growth metrics'
      ],
      requiredSkills: ['Digital Marketing', 'Analytics', 'A/B Testing', 'Channel Strategy', 'Budget Management']
    },
    seniorRole: {
      title: 'Head of Marketing / VP Growth',
      timeframe: 'Years 6-10',
      salary: '$140K-$250K+',
      keyResponsibilities: [
        'Set marketing strategy',
        'Build and lead teams',
        'Drive customer acquisition',
        'Partner with sales and product'
      ],
      requiredSkills: ['Strategic Marketing', 'Team Leadership', 'Growth Strategy', 'Brand Building', 'Executive Communication']
    },
    skillDevelopment: [
      { skill: 'Digital Marketing Fundamentals', timeframe: 'Months 0-6', howToLearn: 'Google Analytics cert, marketing courses', importance: 'critical' },
      { skill: 'Content Marketing', timeframe: 'Months 3-9', howToLearn: 'Create content, study high-performing content', importance: 'important' },
      { skill: 'Analytics & Data', timeframe: 'Months 6-12', howToLearn: 'SQL, GA4, marketing analytics tools', importance: 'critical' },
      { skill: 'Growth Experimentation', timeframe: 'Year 1-2', howToLearn: 'Run A/B tests, learn conversion optimization', importance: 'important' },
      { skill: 'Leadership & Strategy', timeframe: 'Year 2-4', howToLearn: 'Lead campaigns, develop strategic thinking', importance: 'important' },
      { skill: 'Brand & Positioning', timeframe: 'Year 3-5', howToLearn: 'Study brand strategy, positioning frameworks', importance: 'beneficial' }
    ],
    estimatedTimeline: '7-10 years to head of marketing',
    industryDemand: 'stable'
  },

  'Business Operations': {
    pathName: 'Business Operations',
    description: 'Optimize operations and scale business processes',
    startingRole: {
      title: 'Operations Coordinator / Analyst',
      timeframe: 'Years 0-2',
      salary: '$55K-$75K',
      keyResponsibilities: [
        'Support operational processes',
        'Create reports and dashboards',
        'Coordinate cross-functional projects',
        'Identify efficiency improvements'
      ],
      requiredSkills: ['Excel', 'Project Management', 'Process Documentation', 'Data Analysis', 'Communication']
    },
    midCareer: {
      title: 'Operations Manager / Senior Analyst',
      timeframe: 'Years 3-5',
      salary: '$90K-$130K',
      keyResponsibilities: [
        'Lead operational initiatives',
        'Optimize business processes',
        'Manage team workflows',
        'Drive efficiency improvements'
      ],
      requiredSkills: ['Process Optimization', 'Project Leadership', 'Analytics', 'Change Management', 'Stakeholder Management']
    },
    seniorRole: {
      title: 'Director of Operations / COO',
      timeframe: 'Years 6-12',
      salary: '$140K-$250K+',
      keyResponsibilities: [
        'Set operational strategy',
        'Scale business operations',
        'Build operational teams',
        'Drive company-wide efficiency'
      ],
      requiredSkills: ['Strategic Operations', 'Leadership', 'Business Strategy', 'Financial Acumen', 'Change Leadership']
    },
    skillDevelopment: [
      { skill: 'Process Analysis', timeframe: 'Months 0-6', howToLearn: 'Learn process mapping, Six Sigma basics', importance: 'critical' },
      { skill: 'Project Management', timeframe: 'Months 3-9', howToLearn: 'PM certification, lead projects', importance: 'critical' },
      { skill: 'Data & Analytics', timeframe: 'Months 6-12', howToLearn: 'SQL, Excel advanced, dashboarding', importance: 'important' },
      { skill: 'Change Management', timeframe: 'Year 1-2', howToLearn: 'Lead process changes, study frameworks', importance: 'important' },
      { skill: 'Strategic Thinking', timeframe: 'Year 2-4', howToLearn: 'Business strategy courses, strategic projects', importance: 'important' },
      { skill: 'Financial Management', timeframe: 'Year 3-5', howToLearn: 'Finance courses, budgeting experience', importance: 'beneficial' }
    ],
    estimatedTimeline: '8-12 years to director/COO level',
    industryDemand: 'stable'
  }
};

export function generateCareerPaths(
  topCareers: CareerFitScore[],
  insights: DiscoveredInsight[],
  strengths: string[]
): CareerTrajectory[] {
  const trajectories: CareerTrajectory[] = [];

  const careerToPathMap: Record<string, string> = {
    'Data Analyst': 'Data Analytics & Insights',
    'Data Scientist': 'Data Analytics & Insights',
    'Business Intelligence Analyst': 'Data Analytics & Insights',
    'Product Manager': 'Product Management',
    'Product Owner': 'Product Management',
    'UX Designer': 'UX Design & Research',
    'UX Researcher': 'UX Design & Research',
    'Product Designer': 'UX Design & Research',
    'Software Engineer': 'Software Engineering',
    'Software Developer': 'Software Engineering',
    'Full Stack Developer': 'Software Engineering',
    'Marketing Manager': 'Marketing & Growth',
    'Growth Manager': 'Marketing & Growth',
    'Digital Marketing Manager': 'Marketing & Growth',
    'Operations Manager': 'Business Operations',
    'Business Operations Manager': 'Business Operations',
    'Program Manager': 'Business Operations',
  };

  const pathsAdded = new Set<string>();

  for (const career of topCareers.slice(0, 5)) {
    const pathName = careerToPathMap[career.careerTitle];
    if (pathName && !pathsAdded.has(pathName)) {
      const pathTemplate = careerPathDatabase[pathName];
      if (pathTemplate) {
        const whyThisPath = generateWhyThisPath(career, insights, strengths);
        trajectories.push({
          ...pathTemplate,
          matchScore: Math.round(career.currentScore),
          whyThisPath
        });
        pathsAdded.add(pathName);
      }
    }

    if (trajectories.length >= 3) break;
  }

  if (trajectories.length < 3) {
    const remainingPaths = Object.keys(careerPathDatabase).filter(p => !pathsAdded.has(p));
    for (const pathName of remainingPaths.slice(0, 3 - trajectories.length)) {
      const pathTemplate = careerPathDatabase[pathName];
      trajectories.push({
        ...pathTemplate,
        matchScore: 70,
        whyThisPath: ['Aligned with your skills and interests', 'Growing field with good opportunities', 'Matches your work style preferences']
      });
    }
  }

  return trajectories.slice(0, 3);
}

function generateWhyThisPath(
  career: CareerFitScore,
  insights: DiscoveredInsight[],
  strengths: string[]
): string[] {
  const reasons: string[] = [];

  const topFactors = career.matchFactors.slice(0, 2);
  for (const factor of topFactors) {
    reasons.push(factor.factor);
  }

  const relevantInsights = insights
    .filter(i => i.type === 'strength' || i.type === 'preference')
    .slice(0, 1);

  for (const insight of relevantInsights) {
    reasons.push(insight.insight);
  }

  if (reasons.length < 3 && strengths.length > 0) {
    reasons.push(strengths[0]);
  }

  return reasons.slice(0, 3);
}
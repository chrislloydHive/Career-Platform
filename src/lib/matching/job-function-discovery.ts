/**
 * Job Function Discovery
 * Identifies broad job function areas based on assessment responses
 */

import { CareerFitScore } from './realtime-career-matcher';
import { SynthesizedInsight } from '../adaptive-questions/insight-synthesis';
import { ConsistencyPattern, PreferenceIntensity, HiddenMotivation } from '../adaptive-questions/pattern-recognition';
import { DiscoveredInsight } from '../adaptive-questions/adaptive-engine';

export interface JobFunction {
  id: string;
  title: string;
  description: string;
  matchPercentage: number;
  whyThisFits: string[];
  educationAlignment: string;
  dayToDay: string;
  relatedCareerTitles: string[];
  traits: string[];
}

interface AssessmentProfile {
  insights: DiscoveredInsight[];
  synthesizedInsights: SynthesizedInsight[];
  analysis: {
    strengths: string[];
    workStyle?: string;
    interests?: string[];
  };
  patterns: {
    consistencyPatterns?: ConsistencyPattern[];
    preferenceIntensities?: PreferenceIntensity[];
    hiddenMotivations?: HiddenMotivation[];
  };
  topCareers?: CareerFitScore[];
  responses?: Record<string, unknown>;
}

const JOB_FUNCTION_DEFINITIONS = [
  {
    id: 'analytical-data',
    title: 'Analytical & Data-Driven Work',
    keywords: ['analysis', 'data', 'research', 'metrics', 'analytical', 'problem-solving', 'logical', 'quantitative'],
    careerCategories: ['Data & Analytics', 'Technology', 'Finance'],
    dayToDay: 'Working with numbers, spreadsheets, and data visualization tools. Identifying patterns, solving problems through analysis, and making data-informed recommendations.',
    relatedRoles: ['Data Analyst', 'Business Analyst', 'Research Assistant', 'Financial Analyst', 'Marketing Analyst'],
  },
  {
    id: 'creative-communication',
    title: 'Creative & Strategic Communication',
    keywords: ['creative', 'design', 'communication', 'content', 'writing', 'visual', 'marketing', 'brand', 'storytelling'],
    careerCategories: ['Marketing', 'Design', 'Creative'],
    dayToDay: 'Creating content, designing visuals, writing copy, and developing communication strategies. Working on campaigns, social media, or brand messaging.',
    relatedRoles: ['Marketing Coordinator', 'Content Creator', 'Social Media Coordinator', 'Junior Designer', 'Copywriter'],
  },
  {
    id: 'people-service',
    title: 'People-Focused & Service Roles',
    keywords: ['people', 'helping', 'service', 'communication', 'support', 'customer', 'clients', 'team', 'collaborative'],
    careerCategories: ['Customer Success', 'Healthcare', 'Education', 'Human Resources'],
    dayToDay: 'Interacting with people, solving their problems, providing support, and building relationships. Regular meetings, calls, and helping others achieve their goals.',
    relatedRoles: ['Customer Success Associate', 'Account Coordinator', 'HR Coordinator', 'Client Services Associate', 'Sales Development Representative'],
  },
  {
    id: 'technical-systems',
    title: 'Technical & System-Oriented Work',
    keywords: ['technical', 'technology', 'coding', 'programming', 'systems', 'development', 'engineering', 'software'],
    careerCategories: ['Technology', 'Engineering', 'IT'],
    dayToDay: 'Building, maintaining, or improving technical systems. Writing code, troubleshooting issues, implementing solutions, and working with technology tools.',
    relatedRoles: ['Junior Developer', 'IT Support Specialist', 'QA Tester', 'Technical Support', 'Systems Administrator'],
  },
  {
    id: 'strategic-coordination',
    title: 'Strategic Planning & Coordination',
    keywords: ['strategy', 'planning', 'project', 'organization', 'coordination', 'management', 'operations', 'business'],
    careerCategories: ['Operations', 'Project Management', 'Business', 'Consulting'],
    dayToDay: 'Planning projects, coordinating between teams, organizing resources, and ensuring things run smoothly. Managing timelines, priorities, and keeping projects on track.',
    relatedRoles: ['Project Coordinator', 'Operations Associate', 'Business Operations Analyst', 'Program Coordinator', 'Strategy Analyst'],
  },
];

export function discoverJobFunctions(profile: AssessmentProfile, userEducation?: string): JobFunction[] {
  const functionScores = new Map<string, number>();
  const functionReasons = new Map<string, Set<string>>();
  const functionTraits = new Map<string, Set<string>>();

  // Initialize
  JOB_FUNCTION_DEFINITIONS.forEach(func => {
    functionScores.set(func.id, 0);
    functionReasons.set(func.id, new Set());
    functionTraits.set(func.id, new Set());
  });

  // Score based on insights
  profile.insights?.forEach(insight => {
    if (!insight || typeof insight !== 'object') return;
    const text = (insight as { text?: string; area?: string }).text || (insight as { area?: string }).area;
    if (!text || typeof text !== 'string') return;

    JOB_FUNCTION_DEFINITIONS.forEach(func => {
      const insightText = text.toLowerCase();
      const matchCount = func.keywords.filter(keyword => insightText.includes(keyword)).length;
      if (matchCount > 0) {
        const confidence = typeof (insight as { confidence?: number }).confidence === 'number' ? (insight as { confidence: number }).confidence : 0.5;
        const score = matchCount * confidence * 10;
        functionScores.set(func.id, (functionScores.get(func.id) || 0) + score);
        functionReasons.get(func.id)?.add(text);
      }
    });
  });

  // Score based on synthesized insights
  profile.synthesizedInsights?.forEach(insight => {
    if (!insight?.title || !insight?.description) return;

    JOB_FUNCTION_DEFINITIONS.forEach(func => {
      const combinedText = `${insight.title} ${insight.description}`.toLowerCase();
      const matchCount = func.keywords.filter(keyword => combinedText.includes(keyword)).length;
      if (matchCount > 0) {
        const score = matchCount * (insight.confidence || 0.5) * 15;
        functionScores.set(func.id, (functionScores.get(func.id) || 0) + score);
        functionReasons.get(func.id)?.add(insight.description);
      }
    });
  });

  // Score based on strengths
  profile.analysis?.strengths?.forEach(strength => {
    if (!strength || typeof strength !== 'string') return;

    JOB_FUNCTION_DEFINITIONS.forEach(func => {
      const strengthText = strength.toLowerCase();
      const matchCount = func.keywords.filter(keyword => strengthText.includes(keyword)).length;
      if (matchCount > 0) {
        const score = matchCount * 8;
        functionScores.set(func.id, (functionScores.get(func.id) || 0) + score);
        functionTraits.get(func.id)?.add(strength);
      }
    });
  });

  // Score based on interests
  profile.analysis?.interests?.forEach(interest => {
    if (!interest || typeof interest !== 'string') return;

    JOB_FUNCTION_DEFINITIONS.forEach(func => {
      const interestText = interest.toLowerCase();
      if (func.keywords.some(keyword => interestText.includes(keyword))) {
        functionScores.set(func.id, (functionScores.get(func.id) || 0) + 12);
        functionTraits.get(func.id)?.add(interest);
      }
    });
  });

  // Score based on top careers
  profile.topCareers?.forEach(career => {
    if (!career?.careerCategory || !career?.currentScore) return;

    JOB_FUNCTION_DEFINITIONS.forEach(func => {
      if (func.careerCategories.some(cat => career.careerCategory.includes(cat))) {
        const score = career.currentScore * 20;
        functionScores.set(func.id, (functionScores.get(func.id) || 0) + score);
        functionReasons.get(func.id)?.add(`Strong match with ${career.careerCategory} careers`);
      }
    });
  });

  // Score based on hidden motivations
  profile.patterns?.hiddenMotivations?.forEach(motivation => {
    if (!motivation?.motivation || typeof motivation.motivation !== 'string') return;

    JOB_FUNCTION_DEFINITIONS.forEach(func => {
      const motivationText = motivation.motivation.toLowerCase();
      if (func.keywords.some(keyword => motivationText.includes(keyword))) {
        const score = (motivation.confidence || 0.5) * 10;
        functionScores.set(func.id, (functionScores.get(func.id) || 0) + score);
        functionReasons.get(func.id)?.add(motivation.motivation);
      }
    });
  });

  // Convert scores to percentages and create JobFunction objects
  const maxScore = Math.max(...Array.from(functionScores.values()));
  const jobFunctions: JobFunction[] = [];

  JOB_FUNCTION_DEFINITIONS.forEach(funcDef => {
    const score = functionScores.get(funcDef.id) || 0;
    if (score > 0) {
      const matchPercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

      // Get education alignment
      let educationAlignment = 'Your background provides a foundation for this work.';
      if (userEducation) {
        const eduLower = userEducation.toLowerCase();
        if (funcDef.id === 'analytical-data' && (eduLower.includes('math') || eduLower.includes('science') || eduLower.includes('economics'))) {
          educationAlignment = `Your ${userEducation} degree directly prepares you for analytical work with strong quantitative foundations.`;
        } else if (funcDef.id === 'creative-communication' && (eduLower.includes('marketing') || eduLower.includes('communication') || eduLower.includes('english') || eduLower.includes('design'))) {
          educationAlignment = `Your ${userEducation} background is perfect for creative and communication-focused roles.`;
        } else if (funcDef.id === 'people-service' && (eduLower.includes('psychology') || eduLower.includes('sociology') || eduLower.includes('communication'))) {
          educationAlignment = `Your ${userEducation} degree provides strong people skills and understanding of human behavior.`;
        } else if (funcDef.id === 'technical-systems' && (eduLower.includes('computer') || eduLower.includes('engineering') || eduLower.includes('it'))) {
          educationAlignment = `Your ${userEducation} education directly aligns with technical and systems work.`;
        } else if (funcDef.id === 'strategic-coordination' && (eduLower.includes('business') || eduLower.includes('management'))) {
          educationAlignment = `Your ${userEducation} degree provides business acumen for strategic planning roles.`;
        }
      }

      const reasons = Array.from(functionReasons.get(funcDef.id) || []).slice(0, 3);
      const traits = Array.from(functionTraits.get(funcDef.id) || []).slice(0, 4);

      jobFunctions.push({
        id: funcDef.id,
        title: funcDef.title,
        description: funcDef.dayToDay,
        matchPercentage: Math.max(matchPercentage, 45), // Minimum 45% to be encouraging
        whyThisFits: reasons.length > 0 ? reasons : ['Your assessment responses show alignment with this function area'],
        educationAlignment,
        dayToDay: funcDef.dayToDay,
        relatedCareerTitles: funcDef.relatedRoles,
        traits,
      });
    }
  });

  // Sort by match percentage and return top 3-5
  return jobFunctions
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 5);
}

import { AdaptiveQuestion, ExplorationArea } from './question-banks';

export type MotivationArea =
  | 'core-drivers'
  | 'childhood-influences'
  | 'peak-experiences'
  | 'energy-patterns'
  | 'value-origins';

export interface ArchaeologyQuestion extends AdaptiveQuestion {
  motivationArea: MotivationArea;
  depth: 'surface' | 'intermediate' | 'deep';
  followUpPath?: string[];
  insightCategories: string[];
}

export const coreDriverQuestions: ArchaeologyQuestion[] = [
  {
    id: 'cd-1',
    area: 'values' as ExplorationArea,
    motivationArea: 'core-drivers',
    depth: 'intermediate',
    type: 'scenario',
    text: 'You mentioned you value structure in your work. Can you think of a time when lack of structure caused you stress? What specifically felt difficult about that experience?',
    options: [
      {
        value: 'uncertainty',
        label: 'I didn\'t know what was expected of me or what success looked like',
        insight: 'Core driver: clarity and defined expectations'
      },
      {
        value: 'planning',
        label: 'I couldn\'t plan ahead or prepare the way I wanted to',
        insight: 'Core driver: preparation and control'
      },
      {
        value: 'stability',
        label: 'Things kept changing and I couldn\'t establish routines',
        insight: 'Core driver: stability and predictability'
      },
      {
        value: 'accountability',
        label: 'It was unclear who was responsible for what',
        insight: 'Core driver: clear accountability and roles'
      },
    ],
    insightCategories: ['structure-motivation', 'stress-triggers', 'work-environment-needs'],
    followUpConditions: [
      {
        if: (response) => response === 'uncertainty',
        then: ['cd-2', 'cd-clarity'],
        reason: 'Explore need for clarity and expectations'
      },
      {
        if: (response) => response === 'planning',
        then: ['cd-3', 'ep-control'],
        reason: 'Explore need for control and preparation'
      },
    ],
  },
  {
    id: 'cd-2',
    area: 'values' as ExplorationArea,
    motivationArea: 'core-drivers',
    depth: 'deep',
    type: 'open-ended',
    text: 'When you think about needing clarity in your work, what does that give you that\'s important to you? What would be missing without it?',
    insightCategories: ['fundamental-needs', 'psychological-safety', 'performance-drivers'],
  },
  {
    id: 'cd-3',
    area: 'work-style' as ExplorationArea,
    motivationArea: 'core-drivers',
    depth: 'deep',
    type: 'open-ended',
    text: 'Why is being able to plan and prepare important to you? What does preparation allow you to do or be?',
    insightCategories: ['control-needs', 'anxiety-management', 'excellence-drivers'],
  },
  {
    id: 'cd-autonomy',
    area: 'values' as ExplorationArea,
    motivationArea: 'core-drivers',
    depth: 'intermediate',
    type: 'scenario',
    text: 'You mentioned valuing autonomy. Think of a time when you felt micromanaged or controlled. What bothered you most about that situation?',
    options: [
      {
        value: 'trust',
        label: 'It felt like they didn\'t trust my judgment or abilities',
        insight: 'Core driver: being trusted and respected'
      },
      {
        value: 'creativity',
        label: 'I couldn\'t solve problems my own way or be creative',
        insight: 'Core driver: creative freedom and problem ownership'
      },
      {
        value: 'ownership',
        label: 'I couldn\'t take real ownership of my work',
        insight: 'Core driver: responsibility and ownership'
      },
      {
        value: 'impact',
        label: 'My individual contributions didn\'t feel meaningful',
        insight: 'Core driver: individual agency and impact'
      },
    ],
    insightCategories: ['autonomy-motivation', 'trust-needs', 'self-expression'],
    followUpConditions: [
      {
        if: (response) => response === 'creativity',
        then: ['cd-creativity-deep', 'pe-creative'],
        reason: 'Explore creative expression needs'
      },
    ],
  },
  {
    id: 'cd-collaboration',
    area: 'people-interaction' as ExplorationArea,
    motivationArea: 'core-drivers',
    depth: 'intermediate',
    type: 'open-ended',
    text: 'You mentioned enjoying collaboration. What specifically does working with others give you that working alone doesn\'t? Go beyond the surface answer.',
    insightCategories: ['collaboration-drivers', 'social-needs', 'motivation-sources'],
  },
  {
    id: 'cd-impact',
    area: 'values' as ExplorationArea,
    motivationArea: 'core-drivers',
    depth: 'intermediate',
    type: 'scenario',
    text: 'When you think about making an impact through your work, what kind of change matters most to you?',
    options: [
      {
        value: 'individual-help',
        label: 'Directly helping individual people in meaningful ways',
        insight: 'Core driver: personal connection and direct impact'
      },
      {
        value: 'system-change',
        label: 'Improving systems or processes that affect many people',
        insight: 'Core driver: systemic thinking and scale'
      },
      {
        value: 'innovation',
        label: 'Creating something new that didn\'t exist before',
        insight: 'Core driver: innovation and pioneering'
      },
      {
        value: 'excellence',
        label: 'Doing excellent work that sets a high standard',
        insight: 'Core driver: quality and mastery'
      },
      {
        value: 'knowledge',
        label: 'Advancing understanding or teaching others',
        insight: 'Core driver: knowledge creation and transmission'
      },
    ],
    insightCategories: ['impact-definition', 'legacy-thinking', 'meaning-sources'],
    followUpConditions: [
      {
        if: (response) => response === 'individual-help',
        then: ['cd-individual-deep', 'pe-helping'],
        reason: 'Explore personal connection motivation'
      },
      {
        if: (response) => response === 'innovation',
        then: ['cd-innovation-deep', 'ci-origins'],
        reason: 'Explore innovation and creativity roots'
      },
    ],
  },
];

export const childhoodInfluenceQuestions: ArchaeologyQuestion[] = [
  {
    id: 'ci-1',
    area: 'values' as ExplorationArea,
    motivationArea: 'childhood-influences',
    depth: 'intermediate',
    type: 'open-ended',
    text: 'Think back to when you were around 10-12 years old. What activities or hobbies could you lose yourself in for hours? What was it about those activities that captivated you?',
    insightCategories: ['intrinsic-interests', 'childhood-patterns', 'flow-activities'],
  },
  {
    id: 'ci-2',
    area: 'values' as ExplorationArea,
    motivationArea: 'childhood-influences',
    depth: 'intermediate',
    type: 'open-ended',
    text: 'What did the adults in your life (parents, teachers, mentors) value most about work or success? How has that shaped what you believe about careers?',
    insightCategories: ['inherited-values', 'family-influence', 'cultural-programming'],
  },
  {
    id: 'ci-3',
    area: 'creativity' as ExplorationArea,
    motivationArea: 'childhood-influences',
    depth: 'deep',
    type: 'open-ended',
    text: 'When you were young, what were you curious about that adults dismissed or didn\'t take seriously? Looking back, why do you think that interested you?',
    insightCategories: ['suppressed-interests', 'authentic-curiosity', 'reclaimed-passions'],
  },
  {
    id: 'ci-role-models',
    area: 'values' as ExplorationArea,
    motivationArea: 'childhood-influences',
    depth: 'intermediate',
    type: 'scenario',
    text: 'Who did you admire or look up to when you were younger (could be real people or fictional characters)? What specific qualities in them resonated with you?',
    options: [
      {
        value: 'problem-solvers',
        label: 'People who solved complex problems or figured things out',
        insight: 'Early identification with analytical thinking'
      },
      {
        value: 'helpers',
        label: 'People who helped, healed, or cared for others',
        insight: 'Early identification with caregiving and service'
      },
      {
        value: 'creators',
        label: 'People who made or created beautiful/interesting things',
        insight: 'Early identification with creative expression'
      },
      {
        value: 'leaders',
        label: 'People who led others or stood up for what was right',
        insight: 'Early identification with leadership and advocacy'
      },
      {
        value: 'explorers',
        label: 'People who explored, discovered, or adventured',
        insight: 'Early identification with discovery and exploration'
      },
      {
        value: 'teachers',
        label: 'People who explained things or shared knowledge',
        insight: 'Early identification with education and mentorship'
      },
    ],
    insightCategories: ['identity-formation', 'role-model-patterns', 'aspiration-roots'],
  },
  {
    id: 'ci-childhood-praise',
    area: 'values' as ExplorationArea,
    motivationArea: 'childhood-influences',
    depth: 'intermediate',
    type: 'open-ended',
    text: 'What did people consistently praise you for when you were growing up? Do you still seek that kind of validation in your work today?',
    insightCategories: ['validation-patterns', 'praise-conditioning', 'approval-seeking'],
  },
  {
    id: 'ci-origins',
    area: 'creativity' as ExplorationArea,
    motivationArea: 'childhood-influences',
    depth: 'deep',
    type: 'open-ended',
    text: 'Your interest in innovation might have roots in childhood. Can you remember an early experience of creating, inventing, or figuring something out on your own? How did that feel?',
    insightCategories: ['innovation-roots', 'creative-identity', 'maker-mindset-origins'],
  },
];

export const peakExperienceQuestions: ArchaeologyQuestion[] = [
  {
    id: 'pe-1',
    area: 'work-style' as ExplorationArea,
    motivationArea: 'peak-experiences',
    depth: 'intermediate',
    type: 'open-ended',
    text: 'Think of a time when you were completely absorbed in what you were doing - where time flew by and you felt fully engaged. Describe what you were doing and what made that experience so engaging.',
    insightCategories: ['flow-conditions', 'optimal-engagement', 'intrinsic-motivation'],
  },
  {
    id: 'pe-2',
    area: 'values' as ExplorationArea,
    motivationArea: 'peak-experiences',
    depth: 'deep',
    type: 'open-ended',
    text: 'What was the most meaningful work experience you\'ve ever had? Not the most successful or impressive - the most meaningful. What made it matter to you?',
    insightCategories: ['meaning-definition', 'fulfillment-factors', 'purpose-clarity'],
  },
  {
    id: 'pe-3',
    area: 'problem-solving' as ExplorationArea,
    motivationArea: 'peak-experiences',
    depth: 'intermediate',
    type: 'open-ended',
    text: 'Describe a moment when you solved a problem or completed something difficult and felt genuinely proud. What specific aspects of that challenge brought out your best?',
    insightCategories: ['challenge-preferences', 'mastery-moments', 'capability-activation'],
  },
  {
    id: 'pe-creative',
    area: 'creativity' as ExplorationArea,
    motivationArea: 'peak-experiences',
    depth: 'intermediate',
    type: 'open-ended',
    text: 'Tell me about a time when you created something or approached a problem in a novel way. What was satisfying about the creative process?',
    insightCategories: ['creative-fulfillment', 'innovation-satisfaction', 'expression-needs'],
  },
  {
    id: 'pe-helping',
    area: 'people-interaction' as ExplorationArea,
    motivationArea: 'peak-experiences',
    depth: 'intermediate',
    type: 'open-ended',
    text: 'Recall a time when you really helped someone or made a difference in someone\'s experience. What was most rewarding about that for you?',
    insightCategories: ['service-motivation', 'connection-rewards', 'impact-satisfaction'],
  },
  {
    id: 'pe-mastery',
    area: 'learning-growth' as ExplorationArea,
    motivationArea: 'peak-experiences',
    depth: 'intermediate',
    type: 'scenario',
    text: 'Think about a skill or area where you\'ve achieved real competence. What drove you to get good at it?',
    options: [
      {
        value: 'excellence',
        label: 'I wanted to be excellent at it - to master it',
        insight: 'Driven by mastery and excellence for its own sake'
      },
      {
        value: 'recognition',
        label: 'I wanted others to respect my expertise',
        insight: 'Driven by external recognition and status'
      },
      {
        value: 'utility',
        label: 'It was useful and helped me accomplish things',
        insight: 'Driven by pragmatic value and utility'
      },
      {
        value: 'enjoyment',
        label: 'The process of learning it was deeply enjoyable',
        insight: 'Driven by intrinsic enjoyment of learning'
      },
      {
        value: 'identity',
        label: 'It became part of who I am',
        insight: 'Driven by identity formation and self-concept'
      },
    ],
    insightCategories: ['mastery-motivation', 'achievement-drivers', 'skill-development-patterns'],
  },
];

export const energyPatternQuestions: ArchaeologyQuestion[] = [
  {
    id: 'ep-1',
    area: 'work-style' as ExplorationArea,
    motivationArea: 'energy-patterns',
    depth: 'intermediate',
    type: 'open-ended',
    text: 'What type of work leaves you feeling energized rather than drained, even after a long day? Be specific about what aspects create that energy.',
    insightCategories: ['energy-sources', 'sustainable-work', 'vitality-factors'],
  },
  {
    id: 'ep-2',
    area: 'work-style' as ExplorationArea,
    motivationArea: 'energy-patterns',
    depth: 'intermediate',
    type: 'scenario',
    text: 'At the end of a workday, what leaves you most drained?',
    options: [
      {
        value: 'social',
        label: 'Too much social interaction or meetings',
        insight: 'Introversion or need for solitary processing time'
      },
      {
        value: 'details',
        label: 'Tedious details or repetitive tasks',
        insight: 'Need for variety and big-picture thinking'
      },
      {
        value: 'ambiguity',
        label: 'Unclear expectations or undefined problems',
        insight: 'Need for clarity and structure'
      },
      {
        value: 'conflict',
        label: 'Interpersonal tension or difficult conversations',
        insight: 'Harmony-seeking or conflict sensitivity'
      },
      {
        value: 'constraints',
        label: 'Rigid rules or inability to use my own judgment',
        insight: 'Need for autonomy and creative freedom'
      },
      {
        value: 'isolation',
        label: 'Working alone without collaboration or interaction',
        insight: 'Extroversion or need for social connection'
      },
    ],
    insightCategories: ['energy-drains', 'depletion-factors', 'stress-sources'],
    followUpConditions: [
      {
        if: (response) => response === 'social',
        then: ['ep-introvert-deep'],
        reason: 'Explore introversion and recharge needs'
      },
      {
        if: (response) => response === 'isolation',
        then: ['ep-extravert-deep'],
        reason: 'Explore extroversion and connection needs'
      },
    ],
  },
  {
    id: 'ep-3',
    area: 'work-style' as ExplorationArea,
    motivationArea: 'energy-patterns',
    depth: 'deep',
    type: 'open-ended',
    text: 'When do you feel most alive and engaged at work? What conditions or activities create that aliveness?',
    insightCategories: ['peak-vitality', 'engagement-conditions', 'thriving-factors'],
  },
  {
    id: 'ep-control',
    area: 'work-style' as ExplorationArea,
    motivationArea: 'energy-patterns',
    depth: 'deep',
    type: 'open-ended',
    text: 'You mentioned needing control or the ability to plan. What happens internally when you don\'t have that control? What are you protecting yourself from?',
    insightCategories: ['anxiety-management', 'control-needs-origin', 'psychological-safety'],
  },
  {
    id: 'ep-introvert-deep',
    area: 'people-interaction' as ExplorationArea,
    motivationArea: 'energy-patterns',
    depth: 'deep',
    type: 'open-ended',
    text: 'Social interaction drains you - but what specifically do you need when you recharge? What does that alone time give you?',
    insightCategories: ['introversion-needs', 'recharge-mechanisms', 'solitude-value'],
  },
  {
    id: 'ep-extravert-deep',
    area: 'people-interaction' as ExplorationArea,
    motivationArea: 'energy-patterns',
    depth: 'deep',
    type: 'open-ended',
    text: 'You get energy from people - what does interaction with others give you that you don\'t get from solo work?',
    insightCategories: ['extroversion-needs', 'social-energy', 'connection-value'],
  },
  {
    id: 'ep-cognitive',
    area: 'problem-solving' as ExplorationArea,
    motivationArea: 'energy-patterns',
    depth: 'intermediate',
    type: 'scenario',
    text: 'What kind of thinking feels most natural and energizing for you?',
    options: [
      {
        value: 'analytical',
        label: 'Breaking down complex problems into logical components',
        insight: 'Energized by analytical and systematic thinking'
      },
      {
        value: 'creative',
        label: 'Generating new ideas and imaginative possibilities',
        insight: 'Energized by creative and divergent thinking'
      },
      {
        value: 'strategic',
        label: 'Seeing big patterns and planning long-term approaches',
        insight: 'Energized by strategic and systems thinking'
      },
      {
        value: 'practical',
        label: 'Finding concrete solutions to immediate problems',
        insight: 'Energized by practical and action-oriented thinking'
      },
      {
        value: 'relational',
        label: 'Understanding people and interpersonal dynamics',
        insight: 'Energized by empathetic and social thinking'
      },
    ],
    insightCategories: ['cognitive-preferences', 'thinking-strengths', 'mental-energy'],
  },
];

export const valueOriginQuestions: ArchaeologyQuestion[] = [
  {
    id: 'vo-1',
    area: 'values' as ExplorationArea,
    motivationArea: 'value-origins',
    depth: 'deep',
    type: 'open-ended',
    text: 'You mentioned that [specific value] is important to you. Can you trace back where that value came from? Was there an experience or person who shaped that?',
    insightCategories: ['value-formation', 'formative-experiences', 'belief-origins'],
  },
  {
    id: 'vo-2',
    area: 'values' as ExplorationArea,
    motivationArea: 'value-origins',
    depth: 'deep',
    type: 'open-ended',
    text: 'Is there a value you hold that\'s actually in reaction to something - a "never again" or "not like that" from your past?',
    insightCategories: ['reactive-values', 'contrast-formation', 'avoidance-motivation'],
  },
  {
    id: 'vo-3',
    area: 'values' as ExplorationArea,
    motivationArea: 'value-origins',
    depth: 'deep',
    type: 'open-ended',
    text: 'What\'s a value you were taught to care about but that doesn\'t actually resonate with you personally? How do you know it\'s not truly yours?',
    insightCategories: ['imposed-values', 'authentic-vs-adopted', 'value-clarification'],
  },
  {
    id: 'vo-4',
    area: 'values' as ExplorationArea,
    motivationArea: 'value-origins',
    depth: 'intermediate',
    type: 'open-ended',
    text: 'If you could only preserve one aspect of your work life and everything else had to change, what would you hold onto? Why is that the core thing?',
    insightCategories: ['core-values', 'non-negotiables', 'essence-identification'],
  },
  {
    id: 'vo-conflict',
    area: 'values' as ExplorationArea,
    motivationArea: 'value-origins',
    depth: 'deep',
    type: 'scenario',
    text: 'Sometimes we hold values that conflict with each other. Which tension do you feel most?',
    options: [
      {
        value: 'security-growth',
        label: 'Security/stability vs. growth/challenge',
        insight: 'Tension between safety and development needs'
      },
      {
        value: 'autonomy-connection',
        label: 'Independence/autonomy vs. collaboration/belonging',
        insight: 'Tension between individual agency and social connection'
      },
      {
        value: 'excellence-balance',
        label: 'Excellence/achievement vs. work-life balance',
        insight: 'Tension between performance drive and wellbeing'
      },
      {
        value: 'authenticity-success',
        label: 'Being authentic vs. being successful/accepted',
        insight: 'Tension between self-expression and social achievement'
      },
      {
        value: 'purpose-pragmatism',
        label: 'Following purpose vs. practical considerations',
        insight: 'Tension between meaning and material needs'
      },
    ],
    insightCategories: ['value-conflicts', 'internal-tensions', 'priority-clarification'],
  },
  {
    id: 'vo-legacy',
    area: 'values' as ExplorationArea,
    motivationArea: 'value-origins',
    depth: 'deep',
    type: 'open-ended',
    text: 'If people who worked with you remembered one quality about how you approached your work, what would you want it to be? Why does that matter to you?',
    insightCategories: ['legacy-values', 'reputation-desires', 'identity-ideals'],
  },
];

export const allArchaeologyQuestions = [
  ...coreDriverQuestions,
  ...childhoodInfluenceQuestions,
  ...peakExperienceQuestions,
  ...energyPatternQuestions,
  ...valueOriginQuestions,
];

export function getArchaeologyFollowUps(
  responses: Record<string, unknown>
): ArchaeologyQuestion[] {
  const followUps: ArchaeologyQuestion[] = [];

  for (const question of allArchaeologyQuestions) {
    if (!question.followUpConditions) continue;

    for (const condition of question.followUpConditions) {
      const response = responses[question.id];
      if (response && condition.if(response)) {
        for (const followUpId of condition.then) {
          const followUp = allArchaeologyQuestions.find(q => q.id === followUpId);
          if (followUp && !responses[followUp.id]) {
            followUps.push(followUp);
          }
        }
      }
    }
  }

  return followUps;
}

export function synthesizeMotivationInsights(
  responses: Record<string, unknown>
): MotivationInsight[] {
  const insights: MotivationInsight[] = [];

  const structureResponse = responses['cd-1'];
  if (structureResponse) {
    const driverMap: Record<string, MotivationInsight> = {
      'uncertainty': {
        category: 'core-driver',
        insight: 'Your need for structure stems from a desire for clarity and defined expectations. You perform best when you understand what success looks like and can measure your progress.',
        fundamentalNeed: 'Psychological safety through clear expectations',
        careerImplication: 'Seek roles with clear KPIs, defined processes, and explicit success criteria. Avoid ambiguous startup environments.',
      },
      'planning': {
        category: 'core-driver',
        insight: 'Your need for structure is rooted in a desire to prepare and maintain control. You gain confidence through thorough preparation.',
        fundamentalNeed: 'Sense of control and competence through preparation',
        careerImplication: 'Look for roles that allow planning time, strategic thinking, and project management rather than constant firefighting.',
      },
      'stability': {
        category: 'core-driver',
        insight: 'Your need for structure comes from valuing predictability and stable routines. Change and chaos are genuinely draining for you.',
        fundamentalNeed: 'Environmental stability and routine',
        careerImplication: 'Prioritize established companies with stable processes. Rapid change environments will burn you out.',
      },
    };

    const insight = driverMap[structureResponse as string];
    if (insight) {
      insights.push(insight);
    }
  }

  const roleModelResponse = responses['ci-role-models'];
  if (roleModelResponse) {
    const identityMap: Record<string, MotivationInsight> = {
      'problem-solvers': {
        category: 'identity-formation',
        insight: 'Your early admiration for problem-solvers suggests you identify with analytical thinking and intellectual mastery. This isn\'t just a skill - it\'s part of your core identity.',
        fundamentalNeed: 'Intellectual engagement and problem-solving challenges',
        careerImplication: 'You need work that challenges your analytical abilities. Routine execution without problem-solving will feel empty.',
      },
      'helpers': {
        category: 'identity-formation',
        insight: 'Your childhood admiration for helpers reveals that caregiving and service are central to your identity, not just preferences.',
        fundamentalNeed: 'Feeling needed and making direct positive impact on others',
        careerImplication: 'You need visible impact on individuals. Abstract or indirect impact won\'t fulfill this deep need to help.',
      },
      'creators': {
        category: 'identity-formation',
        insight: 'You identified early with creators, suggesting that making and expressing is fundamental to who you are.',
        fundamentalNeed: 'Creative expression and tangible output',
        careerImplication: 'You need to create things - whether code, designs, content, or solutions. Pure analysis without creation will feel incomplete.',
      },
    };

    const insight = identityMap[roleModelResponse as string];
    if (insight) {
      insights.push(insight);
    }
  }

  const drainResponse = responses['ep-2'];
  if (drainResponse) {
    const energyMap: Record<string, MotivationInsight> = {
      'social': {
        category: 'energy-pattern',
        insight: 'You\'re energized by solitary work and depleted by excessive social interaction. This is neurological, not just preference.',
        fundamentalNeed: 'Regular solitude and deep focus time',
        careerImplication: 'High-meeting cultures and constant collaboration will exhaust you. Seek roles with substantial independent work time.',
      },
      'isolation': {
        category: 'energy-pattern',
        insight: 'Isolation drains you - people are your energy source. This is fundamental to how you\'re wired.',
        fundamentalNeed: 'Regular social interaction and collaborative work',
        careerImplication: 'Remote or solitary roles will leave you depleted. You need team environments and frequent interaction.',
      },
      'constraints': {
        category: 'energy-pattern',
        insight: 'Rigid constraints drain your energy because autonomy and creative freedom are fundamental needs for you.',
        fundamentalNeed: 'Autonomy and ability to exercise judgment',
        careerImplication: 'Highly regulated or micromanaged environments are toxic for you. Seek roles with decision-making authority.',
      },
    };

    const insight = energyMap[drainResponse as string];
    if (insight) {
      insights.push(insight);
    }
  }

  return insights;
}

export interface MotivationInsight {
  category: 'core-driver' | 'identity-formation' | 'energy-pattern' | 'value-origin' | 'formative-experience';
  insight: string;
  fundamentalNeed: string;
  careerImplication: string;
}
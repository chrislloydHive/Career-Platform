export type ExplorationArea =
  | 'work-style'
  | 'people-interaction'
  | 'problem-solving'
  | 'creativity'
  | 'structure-flexibility'
  | 'values'
  | 'environment'
  | 'learning-growth';

export type QuestionType =
  | 'multiple-choice'
  | 'scale'
  | 'open-ended'
  | 'ranking'
  | 'scenario';

export interface AdaptiveQuestion {
  id: string;
  area: ExplorationArea;
  type: QuestionType;
  text: string;
  options?: { value: string; label: string; insight?: string }[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  followUpConditions?: FollowUpCondition[];
  gapDetectors?: GapDetector[];
  insightTriggers?: InsightTrigger[];
  clarificationNeeded?: (response: unknown) => boolean;
}

export interface FollowUpCondition {
  if: (response: unknown) => boolean;
  then: string[];
  reason: string;
}

export interface GapDetector {
  detect: (responses: Record<string, unknown>) => boolean;
  gap: string;
  suggestedQuestions: string[];
}

export interface InsightTrigger {
  pattern: (responses: Record<string, unknown>) => boolean;
  insight: string;
  hiddenInterest?: string;
}

export const workStyleQuestions: AdaptiveQuestion[] = [
  {
    id: 'ws-1',
    area: 'work-style',
    type: 'scenario',
    text: 'Imagine you have a full day ahead with no meetings. How would you ideally structure your time?',
    options: [
      {
        value: 'focused-blocks',
        label: 'Large focused blocks on one or two major tasks',
        insight: 'Suggests deep work preference and project-based thinking'
      },
      {
        value: 'varied-tasks',
        label: 'Mix of different tasks and activities throughout the day',
        insight: 'Indicates variety-seeking and multitasking comfort'
      },
      {
        value: 'flexible-flow',
        label: 'Let it flow naturally based on what feels right',
        insight: 'Shows preference for autonomy and intuitive work style'
      },
      {
        value: 'structured-plan',
        label: 'Follow a detailed schedule I created in advance',
        insight: 'Reveals planning orientation and structure preference'
      },
    ],
    followUpConditions: [
      {
        if: (response) => response === 'focused-blocks',
        then: ['ws-deep-work', 'ws-project-length'],
        reason: 'Explore deep work capacity and project preferences'
      },
      {
        if: (response) => response === 'varied-tasks',
        then: ['ws-task-switching', 'ws-multitask-comfort'],
        reason: 'Understand task-switching patterns'
      },
      {
        if: (response) => response === 'flexible-flow',
        then: ['ws-structure-challenge', 'ws-deadlines'],
        reason: 'Probe relationship with structure and deadlines'
      },
    ],
  },
  {
    id: 'ws-deep-work',
    area: 'work-style',
    type: 'scale',
    text: 'How long can you typically maintain intense focus on a single task before needing a break?',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: {
      min: '30 mins or less',
      max: '3+ hours'
    },
    insightTriggers: [
      {
        pattern: (responses) =>
          responses['ws-1'] === 'focused-blocks' &&
          typeof responses['ws-deep-work'] === 'number' &&
          responses['ws-deep-work'] >= 4,
        insight: 'Strong capacity for deep work - ideal for research, analysis, or creative roles',
      },
    ],
  },
  {
    id: 'ws-routine',
    area: 'work-style',
    type: 'scale',
    text: 'Rate your comfort with having the same routine every day',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: {
      min: 'Feels stifling',
      max: 'Very comfortable'
    },
    followUpConditions: [
      {
        if: (response) => typeof response === 'number' && response <= 2,
        then: ['ws-variety-need', 'ws-change-response'],
        reason: 'Explore need for variety and response to change'
      },
    ],
  },
  {
    id: 'ws-energy-pattern',
    area: 'work-style',
    type: 'multiple-choice',
    text: 'When do you typically feel most productive and energized?',
    options: [
      { value: 'early-morning', label: 'Early morning (5-9 AM)' },
      { value: 'mid-morning', label: 'Mid-morning to afternoon (9 AM - 3 PM)' },
      { value: 'late-afternoon', label: 'Late afternoon/evening (3-8 PM)' },
      { value: 'night', label: 'Night time (8 PM+)' },
      { value: 'varies', label: 'It varies greatly day to day' },
    ],
  },
];

export const peopleInteractionQuestions: AdaptiveQuestion[] = [
  {
    id: 'pi-1',
    area: 'people-interaction',
    type: 'scenario',
    text: 'A colleague is struggling with a problem you know how to solve. What\'s your natural response?',
    options: [
      {
        value: 'jump-help',
        label: 'Immediately offer to help and show them how to solve it',
        insight: 'Teaching and mentoring instinct'
      },
      {
        value: 'guide-discovery',
        label: 'Ask questions to guide them to discover the solution themselves',
        insight: 'Coaching and facilitation strength'
      },
      {
        value: 'provide-resources',
        label: 'Share resources or documentation that can help them',
        insight: 'Knowledge management and systems thinking'
      },
      {
        value: 'wait-ask',
        label: 'Wait for them to ask for help before getting involved',
        insight: 'Respects boundaries, may prefer independent work'
      },
    ],
    followUpConditions: [
      {
        if: (response) => response === 'jump-help' || response === 'guide-discovery',
        then: ['pi-teaching-enjoy', 'pi-team-size'],
        reason: 'Explore teaching aptitude and team preferences'
      },
      {
        if: (response) => response === 'wait-ask',
        then: ['pi-collaboration-preference', 'pi-solo-comfort'],
        reason: 'Understand collaboration boundaries'
      },
    ],
    gapDetectors: [
      {
        detect: (responses) =>
          responses['pi-1'] === 'wait-ask' &&
          !responses['pi-collaboration-preference'],
        gap: 'Unclear collaboration preferences',
        suggestedQuestions: ['pi-collaboration-preference', 'pi-solo-comfort'],
      },
    ],
  },
  {
    id: 'pi-team-size',
    area: 'people-interaction',
    type: 'multiple-choice',
    text: 'In a team setting, what size group do you work best with?',
    options: [
      { value: 'small-2-3', label: 'Small (2-3 people) - close collaboration' },
      { value: 'medium-4-6', label: 'Medium (4-6 people) - balanced team' },
      { value: 'large-7plus', label: 'Large (7+ people) - diverse perspectives' },
      { value: 'solo-preferred', label: 'I prefer working independently' },
    ],
  },
  {
    id: 'pi-conflict',
    area: 'people-interaction',
    type: 'scenario',
    text: 'You disagree with a team decision that you think is wrong. How do you typically respond?',
    options: [
      { value: 'voice-immediately', label: 'Voice my concerns immediately and clearly' },
      { value: 'gather-evidence', label: 'Gather data/evidence first, then present my case' },
      { value: 'one-on-one', label: 'Discuss privately with key stakeholders first' },
      { value: 'accept-move-on', label: 'Accept the decision and move forward with the team' },
    ],
    clarificationNeeded: (response) => response === 'accept-move-on',
    followUpConditions: [
      {
        if: (response) => response === 'accept-move-on',
        then: ['pi-conflict-clarify'],
        reason: 'Clarify if this is conflict avoidance or pragmatic acceptance'
      },
    ],
  },
  {
    id: 'pi-energy-source',
    area: 'people-interaction',
    type: 'scale',
    text: 'After a full day of meetings and social interaction, how do you feel?',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: {
      min: 'Completely drained',
      max: 'Energized and excited'
    },
    insightTriggers: [
      {
        pattern: (responses) =>
          typeof responses['pi-energy-source'] === 'number' &&
          responses['pi-energy-source'] >= 4,
        insight: 'Extroverted energy pattern - thrives in people-facing roles',
        hiddenInterest: 'Sales, consulting, or team leadership roles'
      },
      {
        pattern: (responses) =>
          typeof responses['pi-energy-source'] === 'number' &&
          responses['pi-energy-source'] <= 2,
        insight: 'Introverted energy pattern - excels in independent or small-team work',
        hiddenInterest: 'Research, writing, technical, or analytical roles'
      },
    ],
  },
  {
    id: 'pi-presentation',
    area: 'people-interaction',
    type: 'multiple-choice',
    text: 'How do you feel about presenting ideas to a large group?',
    options: [
      { value: 'love-it', label: 'I love it - it\'s energizing' },
      { value: 'comfortable', label: 'Comfortable with preparation' },
      { value: 'neutral', label: 'Neither enjoy nor dread it' },
      { value: 'uncomfortable', label: 'Uncomfortable but can do it' },
      { value: 'avoid', label: 'Try to avoid it when possible' },
    ],
  },
];

export const problemSolvingQuestions: AdaptiveQuestion[] = [
  {
    id: 'ps-1',
    area: 'problem-solving',
    type: 'scenario',
    text: 'You encounter a complex problem you\'ve never seen before. What\'s your first instinct?',
    options: [
      {
        value: 'break-down',
        label: 'Break it down into smaller, manageable pieces',
        insight: 'Analytical and systematic approach'
      },
      {
        value: 'research',
        label: 'Research how others have solved similar problems',
        insight: 'Learning-oriented and collaborative problem solver'
      },
      {
        value: 'experiment',
        label: 'Start experimenting with different approaches',
        insight: 'Hands-on and iterative problem solver'
      },
      {
        value: 'visualize',
        label: 'Create diagrams or visual representations',
        insight: 'Visual and spatial reasoning strength'
      },
      {
        value: 'discuss',
        label: 'Discuss it with others to gain different perspectives',
        insight: 'Collaborative and communication-focused'
      },
    ],
    followUpConditions: [
      {
        if: (response) => response === 'break-down',
        then: ['ps-analytical-depth', 'ps-data-comfort'],
        reason: 'Explore analytical capabilities'
      },
      {
        if: (response) => response === 'experiment',
        then: ['ps-failure-tolerance', 'ps-iteration-speed'],
        reason: 'Understand experimentation comfort'
      },
    ],
  },
  {
    id: 'ps-ambiguity',
    area: 'problem-solving',
    type: 'scale',
    text: 'How comfortable are you working on problems where the end goal isn\'t clearly defined?',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: {
      min: 'Very uncomfortable',
      max: 'Thrive on it'
    },
    insightTriggers: [
      {
        pattern: (responses) =>
          typeof responses['ps-ambiguity'] === 'number' &&
          responses['ps-ambiguity'] >= 4,
        insight: 'High tolerance for ambiguity - suited for innovation and strategy roles',
        hiddenInterest: 'Entrepreneurship, research, product development'
      },
    ],
  },
  {
    id: 'ps-technical-abstract',
    area: 'problem-solving',
    type: 'multiple-choice',
    text: 'Which type of problem do you find most engaging?',
    options: [
      { value: 'technical', label: 'Technical problems with clear right/wrong answers' },
      { value: 'strategic', label: 'Strategic problems requiring judgment calls' },
      { value: 'people-problems', label: 'People or organizational challenges' },
      { value: 'creative', label: 'Creative challenges with multiple valid solutions' },
      { value: 'all-equally', label: 'I enjoy all types equally' },
    ],
    gapDetectors: [
      {
        detect: (responses) =>
          responses['ps-technical-abstract'] === 'all-equally' &&
          !responses['ps-preference-clarify'],
        gap: 'Need to explore specific problem-solving preferences',
        suggestedQuestions: ['ps-preference-clarify'],
      },
    ],
  },
  {
    id: 'ps-time-pressure',
    area: 'problem-solving',
    type: 'scale',
    text: 'How do you perform when solving problems under tight deadlines?',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: {
      min: 'Performance drops significantly',
      max: 'Perform better under pressure'
    },
  },
];

export const creativityQuestions: AdaptiveQuestion[] = [
  {
    id: 'cr-1',
    area: 'creativity',
    type: 'scenario',
    text: 'You\'re asked to come up with a new approach to an existing process. What\'s your method?',
    options: [
      {
        value: 'blank-slate',
        label: 'Start from scratch - reimagine everything',
        insight: 'Revolutionary thinking, innovative approach'
      },
      {
        value: 'improve-existing',
        label: 'Analyze what exists and find ways to improve it',
        insight: 'Iterative improvement, optimization mindset'
      },
      {
        value: 'combine-ideas',
        label: 'Look at other fields and adapt their solutions',
        insight: 'Cross-pollination thinking, synthesis skills'
      },
      {
        value: 'user-centered',
        label: 'Talk to users/stakeholders to understand their needs first',
        insight: 'Empathy-driven, human-centered design'
      },
    ],
    followUpConditions: [
      {
        if: (response) => response === 'blank-slate',
        then: ['cr-risk-tolerance', 'cr-failure-learning'],
        reason: 'Explore innovation comfort and failure response'
      },
    ],
  },
  {
    id: 'cr-expression',
    area: 'creativity',
    type: 'multiple-choice',
    text: 'How do you typically express creative ideas?',
    options: [
      { value: 'visual', label: 'Drawings, diagrams, or visual mockups' },
      { value: 'written', label: 'Written descriptions or documentation' },
      { value: 'verbal', label: 'Talking through ideas with others' },
      { value: 'prototype', label: 'Building quick prototypes or demos' },
      { value: 'varies', label: 'Depends on the idea and context' },
    ],
  },
  {
    id: 'cr-constraints',
    area: 'creativity',
    type: 'scale',
    text: 'Do you work better with creative freedom or clear constraints?',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: {
      min: 'Need constraints to focus',
      max: 'Need freedom to explore'
    },
  },
  {
    id: 'cr-idea-execution',
    area: 'creativity',
    type: 'multiple-choice',
    text: 'What part of the creative process excites you most?',
    options: [
      { value: 'ideation', label: 'Coming up with new ideas' },
      { value: 'refinement', label: 'Refining and perfecting ideas' },
      { value: 'execution', label: 'Bringing ideas to life' },
      { value: 'collaboration', label: 'Collaborating to build on ideas' },
      { value: 'full-cycle', label: 'The entire process from start to finish' },
    ],
    insightTriggers: [
      {
        pattern: (responses) => responses['cr-idea-execution'] === 'ideation',
        insight: 'Ideation strength - may thrive in innovation or strategy roles',
        hiddenInterest: 'Product strategy, innovation consulting, research'
      },
      {
        pattern: (responses) => responses['cr-idea-execution'] === 'execution',
        insight: 'Execution strength - implementation and delivery focus',
        hiddenInterest: 'Project management, operations, engineering'
      },
    ],
  },
];

export const structureFlexibilityQuestions: AdaptiveQuestion[] = [
  {
    id: 'sf-1',
    area: 'structure-flexibility',
    type: 'scenario',
    text: 'Your manager gives you a project with minimal guidance. How do you feel?',
    options: [
      {
        value: 'excited',
        label: 'Excited - I love the freedom to define the approach',
        insight: 'High autonomy preference, entrepreneurial mindset'
      },
      {
        value: 'comfortable',
        label: 'Comfortable - I can figure it out as I go',
        insight: 'Adaptable and self-directed'
      },
      {
        value: 'need-some',
        label: 'I\'d want to clarify goals and expectations first',
        insight: 'Appreciates clarity, strategic thinker'
      },
      {
        value: 'prefer-structure',
        label: 'Uncomfortable - I prefer clear guidelines and structure',
        insight: 'Values clear frameworks and defined processes'
      },
    ],
    followUpConditions: [
      {
        if: (response) => response === 'excited' || response === 'comfortable',
        then: ['sf-planning-style', 'sf-accountability'],
        reason: 'Explore self-management and accountability preferences'
      },
      {
        if: (response) => response === 'prefer-structure',
        then: ['sf-structure-type', 'sf-adaptation'],
        reason: 'Understand what type of structure is most helpful'
      },
    ],
  },
  {
    id: 'sf-change',
    area: 'structure-flexibility',
    type: 'scenario',
    text: 'Your company announces a major organizational restructure. What\'s your reaction?',
    options: [
      { value: 'opportunity', label: 'Excited about new opportunities' },
      { value: 'cautious', label: 'Cautiously optimistic' },
      { value: 'wait-see', label: 'Take a wait-and-see approach' },
      { value: 'concerned', label: 'Concerned about disruption' },
      { value: 'stressed', label: 'Stressed by the uncertainty' },
    ],
    insightTriggers: [
      {
        pattern: (responses) =>
          responses['sf-change'] === 'opportunity',
        insight: 'Change catalyst - thrives in dynamic environments',
        hiddenInterest: 'Startups, growth companies, change management'
      },
    ],
  },
  {
    id: 'sf-deadlines',
    area: 'structure-flexibility',
    type: 'multiple-choice',
    text: 'How do you typically work with deadlines?',
    options: [
      { value: 'early', label: 'Finish well before the deadline' },
      { value: 'steady', label: 'Work steadily from start to deadline' },
      { value: 'motivated', label: 'Deadline pressure motivates me' },
      { value: 'last-minute', label: 'Do my best work last-minute' },
    ],
  },
  {
    id: 'sf-rules',
    area: 'structure-flexibility',
    type: 'scale',
    text: 'When you see a rule or process you think is inefficient, what do you do?',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: {
      min: 'Follow it as written',
      max: 'Find workarounds or advocate for change'
    },
  },
];

export const allQuestionBanks = {
  'work-style': workStyleQuestions,
  'people-interaction': peopleInteractionQuestions,
  'problem-solving': problemSolvingQuestions,
  'creativity': creativityQuestions,
  'structure-flexibility': structureFlexibilityQuestions,
};

export function getQuestionById(id: string): AdaptiveQuestion | undefined {
  for (const questions of Object.values(allQuestionBanks)) {
    const found = questions.find(q => q.id === id);
    if (found) return found;
  }
  return undefined;
}

export function getQuestionsByArea(area: ExplorationArea): AdaptiveQuestion[] {
  return allQuestionBanks[area as keyof typeof allQuestionBanks] || [];
}
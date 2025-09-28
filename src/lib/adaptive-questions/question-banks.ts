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
    id: 'pi-conflict-clarify',
    area: 'people-interaction',
    type: 'multiple-choice',
    text: 'When you choose to accept and move on from a disagreement, is it usually because:',
    options: [
      { value: 'avoid-conflict', label: 'I want to avoid conflict and maintain harmony' },
      { value: 'pragmatic', label: 'I pick my battles and focus on what matters most' },
      { value: 'trust-team', label: 'I trust the team\'s collective decision-making' },
      { value: 'not-worth-it', label: 'The issue isn\'t important enough to push back on' },
    ],
    insightTriggers: [
      {
        pattern: (responses) => responses['pi-conflict-clarify'] === 'avoid-conflict',
        insight: 'Conflict-averse - values harmony and avoiding confrontation',
        hiddenInterest: 'Supportive roles, collaborative environments'
      },
      {
        pattern: (responses) => responses['pi-conflict-clarify'] === 'pragmatic',
        insight: 'Strategically assertive - knows when to push and when to yield',
        hiddenInterest: 'Leadership, strategy, project management'
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
    id: 'ps-analytical-depth',
    area: 'problem-solving',
    type: 'scale',
    text: 'How deep do you like to analyze a problem before starting to solve it?',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: {
      min: 'Start solving quickly',
      max: 'Thoroughly analyze first'
    },
  },
  {
    id: 'ps-data-comfort',
    area: 'problem-solving',
    type: 'scale',
    text: 'How comfortable are you working with data and analytics to solve problems?',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: {
      min: 'Prefer qualitative approaches',
      max: 'Love working with data'
    },
  },
  {
    id: 'ps-failure-tolerance',
    area: 'problem-solving',
    type: 'scale',
    text: 'How do you feel about potential failures when trying new approaches?',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: {
      min: 'Avoid risk of failure',
      max: 'Embrace failures as learning'
    },
  },
  {
    id: 'ps-iteration-speed',
    area: 'problem-solving',
    type: 'multiple-choice',
    text: 'When experimenting with solutions, what\'s your typical approach?',
    options: [
      { value: 'quick-iterations', label: 'Quick iterations with frequent adjustments' },
      { value: 'measured-iterations', label: 'Measured iterations with careful evaluation' },
      { value: 'parallel-approaches', label: 'Test multiple approaches simultaneously' },
      { value: 'single-focused', label: 'Focus deeply on one approach at a time' },
    ],
  },
  {
    id: 'ps-preference-clarify',
    area: 'problem-solving',
    type: 'open-ended',
    text: 'You mentioned enjoying all types of problems equally. Can you describe a recent problem you found particularly satisfying to solve and what made it engaging?',
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

export const valuesQuestions: AdaptiveQuestion[] = [
  {
    id: 'val-1',
    area: 'values',
    type: 'scenario',
    text: 'You receive two job offers with similar pay. What factor would most influence your decision?',
    options: [
      {
        value: 'impact',
        label: 'The potential to make a meaningful impact',
        insight: 'Purpose-driven, mission-oriented'
      },
      {
        value: 'growth',
        label: 'Opportunities for learning and advancement',
        insight: 'Growth-focused, career development priority'
      },
      {
        value: 'culture',
        label: 'Company culture and team fit',
        insight: 'Relationship and environment focused'
      },
      {
        value: 'stability',
        label: 'Job security and company stability',
        insight: 'Security and predictability valued'
      },
      {
        value: 'flexibility',
        label: 'Work-life balance and flexibility',
        insight: 'Life balance and autonomy priority'
      },
    ],
    followUpConditions: [
      {
        if: (response) => response === 'impact',
        then: ['val-impact-type', 'val-measure-success'],
        reason: 'Explore what kind of impact matters'
      },
    ],
  },
  {
    id: 'val-impact-type',
    area: 'values',
    type: 'multiple-choice',
    text: 'What type of impact is most meaningful to you?',
    options: [
      { value: 'social', label: 'Helping people or communities' },
      { value: 'environmental', label: 'Protecting the environment' },
      { value: 'innovation', label: 'Advancing technology or knowledge' },
      { value: 'economic', label: 'Creating economic opportunity' },
      { value: 'cultural', label: 'Enriching culture or art' },
    ],
  },
  {
    id: 'val-measure-success',
    area: 'values',
    type: 'open-ended',
    text: 'How do you personally measure success in your career?',
  },
  {
    id: 'val-compromise',
    area: 'values',
    type: 'scale',
    text: 'Would you take a significant pay cut for work that aligns with your values?',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: {
      min: 'Unlikely - compensation is key',
      max: 'Absolutely - values come first'
    },
    insightTriggers: [
      {
        pattern: (responses) =>
          typeof responses['val-compromise'] === 'number' &&
          responses['val-compromise'] >= 4,
        insight: 'Strong values alignment - willing to sacrifice for meaningful work',
        hiddenInterest: 'Non-profit, social impact, mission-driven organizations'
      },
    ],
  },
  {
    id: 'val-recognition',
    area: 'values',
    type: 'multiple-choice',
    text: 'What kind of recognition is most important to you?',
    options: [
      { value: 'public', label: 'Public recognition and visibility' },
      { value: 'peer', label: 'Respect from peers and colleagues' },
      { value: 'leadership', label: 'Recognition from leadership' },
      { value: 'results', label: 'Seeing tangible results of my work' },
      { value: 'minimal', label: 'Don\'t need much recognition' },
    ],
  },
];

export const environmentQuestions: AdaptiveQuestion[] = [
  {
    id: 'env-1',
    area: 'environment',
    type: 'scenario',
    text: 'What physical work environment helps you do your best work?',
    options: [
      {
        value: 'home',
        label: 'Quiet, private space at home',
        insight: 'Values autonomy and control over environment'
      },
      {
        value: 'office',
        label: 'Collaborative office with team nearby',
        insight: 'Energy from being around others'
      },
      {
        value: 'flexible',
        label: 'Mix of locations - variety keeps me engaged',
        insight: 'Adaptable, values flexibility'
      },
      {
        value: 'dynamic',
        label: 'Dynamic spaces - cafes, coworking, travel',
        insight: 'Stimulation-seeking, location independent'
      },
    ],
  },
  {
    id: 'env-noise',
    area: 'environment',
    type: 'scale',
    text: 'How do you handle noise and activity around you while working?',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: {
      min: 'Need complete quiet',
      max: 'Energized by activity'
    },
  },
  {
    id: 'env-commute',
    area: 'environment',
    type: 'scale',
    text: 'How important is minimizing your commute time?',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: {
      min: 'Don\'t mind a long commute',
      max: 'Critical priority'
    },
  },
  {
    id: 'env-location',
    area: 'environment',
    type: 'multiple-choice',
    text: 'Where do you see yourself living and working long-term?',
    options: [
      { value: 'urban', label: 'Major city - access to opportunities and culture' },
      { value: 'suburban', label: 'Suburbs - balance of space and access' },
      { value: 'rural', label: 'Rural area - nature and quieter life' },
      { value: 'digital-nomad', label: 'Location independent - travel frequently' },
      { value: 'undecided', label: 'Still figuring this out' },
    ],
  },
];

export const learningGrowthQuestions: AdaptiveQuestion[] = [
  {
    id: 'lg-1',
    area: 'learning-growth',
    type: 'scenario',
    text: 'You have a free weekend to learn something new. What draws you in?',
    options: [
      {
        value: 'technical',
        label: 'A technical skill or tool',
        insight: 'Skill-building and practical competence focus'
      },
      {
        value: 'strategic',
        label: 'Business strategy or leadership concepts',
        insight: 'Strategic thinking and leadership interest'
      },
      {
        value: 'creative',
        label: 'Creative or artistic skill',
        insight: 'Creative expression and aesthetics valued'
      },
      {
        value: 'interpersonal',
        label: 'Communication or interpersonal skills',
        insight: 'People skills and relationships priority'
      },
      {
        value: 'random',
        label: 'Whatever sparks my curiosity in the moment',
        insight: 'Curiosity-driven, broad interests'
      },
    ],
  },
  {
    id: 'lg-depth',
    area: 'learning-growth',
    type: 'scale',
    text: 'Do you prefer to develop deep expertise in one area or broad knowledge across many?',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: {
      min: 'Deep specialist',
      max: 'Broad generalist'
    },
    insightTriggers: [
      {
        pattern: (responses) =>
          typeof responses['lg-depth'] === 'number' &&
          responses['lg-depth'] <= 2,
        insight: 'Specialist orientation - suited for deep technical or expert roles',
        hiddenInterest: 'Research, specialized consulting, technical leadership'
      },
      {
        pattern: (responses) =>
          typeof responses['lg-depth'] === 'number' &&
          responses['lg-depth'] >= 4,
        insight: 'Generalist orientation - suited for cross-functional or strategic roles',
        hiddenInterest: 'Product management, general management, entrepreneurship'
      },
    ],
  },
  {
    id: 'lg-feedback',
    area: 'learning-growth',
    type: 'multiple-choice',
    text: 'How do you prefer to receive feedback on your work?',
    options: [
      { value: 'direct', label: 'Direct and immediate feedback' },
      { value: 'written', label: 'Written feedback I can review privately' },
      { value: 'discussion', label: 'Collaborative discussion and dialogue' },
      { value: 'self-assessment', label: 'Self-reflection with occasional check-ins' },
      { value: 'results', label: 'Through results and outcomes' },
    ],
  },
  {
    id: 'lg-challenge',
    area: 'learning-growth',
    type: 'scale',
    text: 'How do you feel when you\'re given a task slightly beyond your current abilities?',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: {
      min: 'Anxious and uncomfortable',
      max: 'Excited and motivated'
    },
  },
  {
    id: 'lg-teaching',
    area: 'learning-growth',
    type: 'scale',
    text: 'How much do you enjoy teaching or mentoring others?',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: {
      min: 'Not interested',
      max: 'Love it - core to my identity'
    },
  },
];

export const allQuestionBanks = {
  'work-style': workStyleQuestions,
  'people-interaction': peopleInteractionQuestions,
  'problem-solving': problemSolvingQuestions,
  'creativity': creativityQuestions,
  'structure-flexibility': structureFlexibilityQuestions,
  'values': valuesQuestions,
  'environment': environmentQuestions,
  'learning-growth': learningGrowthQuestions,
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
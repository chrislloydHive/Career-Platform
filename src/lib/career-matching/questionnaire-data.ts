import { CareerQuestion } from '@/types/career-matching';

export const careerQuestionnaire: CareerQuestion[] = [
  {
    id: 'interests-1',
    question: 'What kind of stuff actually interests you? (Be honest, not what sounds impressive)',
    type: 'multiple-choice',
    category: 'interests',
    options: [
      { value: 'technology', label: 'Technology & Programming' },
      { value: 'design', label: 'Design & Creativity' },
      { value: 'health', label: 'Healthcare & Wellness' },
      { value: 'finance', label: 'Finance & Business' },
      { value: 'marketing', label: 'Marketing & Communication' },
      { value: 'data', label: 'Data & Analytics' },
      { value: 'people', label: 'Working with People' },
      { value: 'coaching', label: 'Teaching & Coaching' },
    ],
    required: true,
    helpText: 'Select all that apply',
  },
  {
    id: 'interests-2',
    question: 'Which of these would you actually enjoy doing most days?',
    type: 'multiple-choice',
    category: 'interests',
    options: [
      { value: 'coding', label: 'Writing code and building software' },
      { value: 'design', label: 'Creating visual designs or user experiences' },
      { value: 'analysis', label: 'Analyzing data and finding insights' },
      { value: 'communication', label: 'Communicating with clients or teams' },
      { value: 'strategy', label: 'Developing strategies and plans' },
      { value: 'problem-solving', label: 'Solving complex problems' },
      { value: 'helping', label: 'Helping others achieve their goals' },
      { value: 'creating-content', label: 'Creating content (writing, media, etc.)' },
    ],
    required: true,
    helpText: 'Choose 3-5 activities',
  },
  {
    id: 'skills-1',
    question: 'What skills do you have? (Even if you learned them in school or side projects)',
    type: 'multiple-choice',
    category: 'skills',
    options: [
      { value: 'programming', label: 'Programming/Software Development' },
      { value: 'design-tools', label: 'Design Tools (Figma, Adobe, etc.)' },
      { value: 'data-analysis', label: 'Data Analysis (Excel, SQL, etc.)' },
      { value: 'marketing-tools', label: 'Marketing Tools (Social media, etc.)' },
      { value: 'financial-analysis', label: 'Financial Analysis' },
      { value: 'project-management', label: 'Organizing projects/people' },
      { value: 'communication', label: 'Writing/Speaking clearly' },
      { value: 'coaching', label: 'Teaching/Explaining things' },
      { value: 'sales', label: 'Persuading/Selling' },
      { value: 'none', label: 'None yet (that\'s okay!)' },
    ],
    required: true,
    helpText: 'Select all that apply - be generous with yourself',
  },
  {
    id: 'skills-2',
    question: 'How do you feel about learning new tools and technologies?',
    type: 'rating',
    category: 'skills',
    min: 1,
    max: 5,
    required: true,
    helpText: '1 = Give me stability, 5 = I live for the new shiny thing',
  },
  {
    id: 'experience-1',
    question: 'Where are you at in your career journey?',
    type: 'single-choice',
    category: 'experience',
    options: [
      { value: 'student', label: 'Still in school' },
      { value: 'recent-grad', label: 'Just graduated' },
      { value: 'first-job', label: 'In my first job (0-1 year)' },
      { value: 'early-career', label: 'Early career (1-3 years)' },
    ],
    required: true,
  },
  {
    id: 'experience-3',
    question: 'Have you done any internships, part-time work, or side projects?',
    type: 'multiple-choice',
    category: 'experience',
    options: [
      { value: 'internship', label: 'Internships' },
      { value: 'part-time', label: 'Part-time jobs' },
      { value: 'freelance', label: 'Freelance/side projects' },
      { value: 'volunteer', label: 'Volunteer work' },
      { value: 'club', label: 'School clubs/organizations' },
      { value: 'none', label: 'Not really, and that\'s okay' },
    ],
    required: false,
    helpText: 'Select all that apply - all experience counts',
  },
  {
    id: 'personality-1',
    question: 'When working on a project, what sounds better?',
    type: 'single-choice',
    category: 'personality',
    options: [
      { value: 'independent', label: 'Headphones on, in the zone alone' },
      { value: 'collaborative', label: 'Brainstorming with others' },
      { value: 'mixed', label: 'Depends on the day/project' },
    ],
    required: true,
  },
  {
    id: 'personality-2',
    question: 'Pick your vibe:',
    type: 'single-choice',
    category: 'personality',
    options: [
      { value: 'fast-paced', label: 'Fast-paced chaos (deadlines, pivots, never boring)' },
      { value: 'steady', label: 'Steady and predictable (I like routines)' },
      { value: 'varied', label: 'Mix of both' },
    ],
    required: true,
  },
  {
    id: 'personality-3',
    question: 'When you face a problem, you usually:',
    type: 'single-choice',
    category: 'personality',
    options: [
      { value: 'analytical', label: 'Break it down with data and logic' },
      { value: 'creative', label: 'Think outside the box, try weird solutions' },
      { value: 'practical', label: 'Use what worked before' },
      { value: 'mixed', label: 'Depends on the problem' },
    ],
    required: true,
  },
  {
    id: 'personality-4',
    question: 'How much people interaction feels right?',
    type: 'single-choice',
    category: 'personality',
    options: [
      { value: 'frequent', label: 'A lot - meetings, calls, constant interaction' },
      { value: 'moderate', label: 'Some - regular check-ins but mostly solo work' },
      { value: 'minimal', label: 'Minimal - occasional syncs, mostly heads-down' },
    ],
    required: true,
  },
  {
    id: 'preferences-1',
    question: 'Where do you want to work?',
    type: 'multiple-choice',
    category: 'preferences',
    options: [
      { value: 'remote', label: 'Remote (sweatpants forever)' },
      { value: 'hybrid', label: 'Hybrid (best of both)' },
      { value: 'onsite', label: 'Office (I like the structure)' },
    ],
    required: true,
    helpText: 'Select all you\'d be open to',
  },
  {
    id: 'preferences-2',
    question: 'What salary would you be happy with to start?',
    type: 'range',
    category: 'preferences',
    min: 30000,
    max: 100000,
    required: true,
    helpText: 'Annual salary in USD - be realistic for entry level',
  },
  {
    id: 'preferences-4',
    question: 'Work-life balance: how important?',
    type: 'single-choice',
    category: 'preferences',
    options: [
      { value: 'high', label: 'Very - I have a life outside work' },
      { value: 'medium', label: 'Important but flexible for the right opportunity' },
      { value: 'low', label: 'I\'m here to grind early in my career' },
    ],
    required: true,
  },
  {
    id: 'education-1',
    question: 'What\'s your education situation?',
    type: 'single-choice',
    category: 'education',
    options: [
      { value: 'high-school', label: 'High school grad' },
      { value: 'some-college', label: 'Some college (no degree yet)' },
      { value: 'associates', label: 'Associate degree' },
      { value: 'bachelors', label: 'Bachelor\'s degree' },
      { value: 'masters', label: 'Master\'s degree' },
    ],
    required: true,
  },
  {
    id: 'education-2',
    question: 'What did/are you studying?',
    type: 'text',
    category: 'education',
    required: false,
    helpText: 'e.g., Psychology, Marketing, Computer Science (or "Undecided")',
  },
  {
    id: 'education-3',
    question: 'Would you do a bootcamp or get a certification if it helped?',
    type: 'single-choice',
    category: 'education',
    options: [
      { value: 'yes', label: 'Yeah, if it gets me a good job' },
      { value: 'no', label: 'Nah, done with school' },
      { value: 'maybe', label: 'Depends - what is it and how long?' },
    ],
    required: true,
  },
  {
    id: 'values-1',
    question: 'What matters most to you in a job? (Pick your top 3)',
    type: 'multiple-choice',
    category: 'preferences',
    options: [
      { value: 'salary', label: 'Good pay' },
      { value: 'growth', label: 'Learning and growing' },
      { value: 'impact', label: 'Making a difference' },
      { value: 'creativity', label: 'Being creative' },
      { value: 'stability', label: 'Job security' },
      { value: 'flexibility', label: 'Flexible schedule' },
      { value: 'people', label: 'Working with cool people' },
      { value: 'challenge', label: 'Being challenged' },
    ],
    required: true,
    helpText: 'Choose exactly 3',
  },
];

export function getQuestionsByCategory(category: CareerQuestion['category']): CareerQuestion[] {
  return careerQuestionnaire.filter(q => q.category === category);
}

export function getRequiredQuestions(): CareerQuestion[] {
  return careerQuestionnaire.filter(q => q.required);
}

export function getCategoryProgress(responses: Record<string, unknown>, category: CareerQuestion['category']): number {
  const categoryQuestions = getQuestionsByCategory(category);
  const answeredCount = categoryQuestions.filter(q => responses[q.id] !== undefined).length;
  return categoryQuestions.length > 0 ? (answeredCount / categoryQuestions.length) * 100 : 0;
}
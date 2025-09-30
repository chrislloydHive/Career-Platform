export interface OnboardingData {
  // Step 1: Welcome - no data collected

  // Step 2: Background
  workExperience: {
    yearsOfExperience?: string;
    currentRole?: string;
    currentCompany?: string;
    industry?: string;
  };
  education: {
    highestDegree?: string;
    fieldOfStudy?: string;
    graduationYear?: string;
  };
  location: {
    currentLocation?: string;
    willingToRelocate?: boolean;
    preferredLocations?: string[];
  };

  // Step 3: Resume/LinkedIn
  resumeUrl?: string;
  linkedinUrl?: string;
  hasUploadedResume?: boolean;

  // Step 4: Career Goals
  primaryGoal: 'career_change' | 'recent_graduate' | 'next_role' | 'unsure' | 'skill_development' | 'industry_switch';
  specificGoals?: string[];
  timeframe?: string;

  // Metadata
  completedAt: Date;
  stepsCompleted: number[];
  isComplete: boolean;
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component: string;
  isOptional?: boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome",
    description: "Let's get you started on your career discovery journey",
    component: "welcome"
  },
  {
    id: 2,
    title: "Background",
    description: "Tell us about your experience and education",
    component: "background",
    isOptional: true
  },
  {
    id: 3,
    title: "Profile Enhancement",
    description: "Upload your resume or LinkedIn profile for better personalization",
    component: "profile",
    isOptional: true
  },
  {
    id: 4,
    title: "Career Goals",
    description: "Help us understand what brought you here",
    component: "goals"
  },
  {
    id: 5,
    title: "Ready to Begin",
    description: "Your personalized MyNextRole experience is ready!",
    component: "completion"
  }
];

export const CAREER_GOALS = [
  {
    id: 'career_change',
    label: 'Exploring Career Change',
    description: 'I want to transition to a different career field'
  },
  {
    id: 'recent_graduate',
    label: 'Recent Graduate',
    description: 'I recently graduated and am exploring career options'
  },
  {
    id: 'next_role',
    label: 'Looking for Next Role',
    description: 'I know my field but want to find the right next position'
  },
  {
    id: 'industry_switch',
    label: 'Industry Switch',
    description: 'I want to apply my skills in a different industry'
  },
  {
    id: 'skill_development',
    label: 'Skill Development',
    description: 'I want to understand what skills to develop for my career'
  },
  {
    id: 'unsure',
    label: 'Unsure About Direction',
    description: 'I need help figuring out what career path is right for me'
  }
] as const;
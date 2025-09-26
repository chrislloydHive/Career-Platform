import { JobCategory, CareerCategory, ExperienceLevel } from './career';

export interface UserProfile {
  interests: string[];
  skills: string[];
  experience: {
    level: ExperienceLevel;
    yearsOfExperience: number;
    industries: string[];
    roles: string[];
  };
  preferences: {
    workEnvironment: {
      remote: boolean;
      hybrid: boolean;
      onsite: boolean;
    };
    salary: {
      min: number;
      max: number;
    };
    categories: CareerCategory[];
    workLifeBalance: 'high' | 'medium' | 'low';
    travelWillingness: boolean;
  };
  personality: {
    workStyle: 'independent' | 'collaborative' | 'mixed';
    pace: 'fast-paced' | 'steady' | 'varied';
    problemSolving: 'analytical' | 'creative' | 'practical' | 'mixed';
    communication: 'frequent' | 'moderate' | 'minimal';
    leadership: boolean;
  };
  education: {
    level: 'high-school' | 'associates' | 'bachelors' | 'masters' | 'phd';
    field?: string;
    willingToGetCertifications: boolean;
  };
  questionnaire?: QuestionnaireResponses;
}

export interface QuestionnaireResponses {
  [questionId: string]: string | number | string[] | boolean;
}

export interface CareerQuestion {
  id: string;
  question: string;
  type: 'single-choice' | 'multiple-choice' | 'rating' | 'text' | 'range';
  category: 'interests' | 'skills' | 'experience' | 'preferences' | 'personality' | 'education';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  required: boolean;
  helpText?: string;
}

export interface CareerMatch {
  career: JobCategory;
  overallScore: number;
  confidence: number;
  reasoning: MatchReasoning;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

export interface MatchReasoning {
  interestsAlignment: {
    score: number;
    weight: number;
    explanation: string;
    matchedItems: string[];
  };
  skillsMatch: {
    score: number;
    weight: number;
    explanation: string;
    matchedSkills: string[];
    missingSkills: string[];
    transferableSkills: string[];
  };
  experienceAlignment: {
    score: number;
    weight: number;
    explanation: string;
    relevantExperience: string[];
  };
  personalityFit: {
    score: number;
    weight: number;
    explanation: string;
    traits: string[];
  };
  preferencesMatch: {
    score: number;
    weight: number;
    explanation: string;
    matchedPreferences: string[];
    tradeoffs: string[];
  };
  educationFit: {
    score: number;
    weight: number;
    explanation: string;
    meetsRequirements: boolean;
    pathways: string[];
  };
}

export interface MatchingWeights {
  interests: number;
  skills: number;
  experience: number;
  personality: number;
  preferences: number;
  education: number;
}

export interface MatchingConfig {
  weights: MatchingWeights;
  minimumScore: number;
  confidenceThreshold: number;
  maxResults: number;
}
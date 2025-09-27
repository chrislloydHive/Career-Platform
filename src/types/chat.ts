import { JobCategory } from './career';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: CareerSuggestion[];
  followUpQuestions?: string[];
}

export interface CareerSuggestion {
  career: JobCategory;
  relevanceScore: number;
  reasoning: string;
  matchedKeywords: string[];
}

export interface ChatQuery {
  text: string;
  context?: {
    previousMessages?: ChatMessage[];
    userPreferences?: Record<string, unknown>;
  };
}

export interface ChatResponse {
  message: string;
  suggestions: CareerSuggestion[];
  followUpQuestions: string[];
  clarificationNeeded?: boolean;
  extractedIntent: QueryIntent;
  aiEnhanced?: boolean;
}

export interface QueryIntent {
  type: 'career_search' | 'information' | 'comparison' | 'exploration';
  keywords: string[];
  filters: {
    categories?: string[];
    workEnvironment?: string[];
    skills?: string[];
    interests?: string[];
    preferences?: Record<string, unknown>;
  };
  constraints?: {
    remote?: boolean;
    salary?: { min?: number; max?: number };
    education?: string;
  };
}
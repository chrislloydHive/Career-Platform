'use client';

import { useState, useEffect } from 'react';
import { CareerQuestion, QuestionnaireResponses, UserProfile, CareerMatch } from '@/types/career-matching';
import { careerQuestionnaire, getCategoryProgress } from '@/lib/career-matching/questionnaire-data';
import { careerMatchingEngine } from '@/lib/career-matching/matching-engine';
import { ExperienceLevel, CareerCategory } from '@/types/career';

interface QuestionnaireProps {
  onComplete: (matches: CareerMatch[]) => void;
  enableRealTimeMatching?: boolean;
}

export function CareerMatchingQuestionnaire({ onComplete, enableRealTimeMatching = true }: QuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<QuestionnaireResponses>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [realtimeMatches, setRealtimeMatches] = useState<CareerMatch[]>([]);
  const [showRealtimePreview, setShowRealtimePreview] = useState(false);

  const categories: Array<CareerQuestion['category']> = [
    'interests',
    'skills',
    'experience',
    'personality',
    'preferences',
    'education',
  ];

  const categoryLabels = {
    interests: 'Your Interests',
    skills: 'Your Skills',
    experience: 'Your Experience',
    personality: 'Your Personality',
    preferences: 'Your Preferences',
    education: 'Your Education',
  };

  const categoryIcons = {
    interests: '🎯',
    skills: '💡',
    experience: '📊',
    personality: '✨',
    preferences: '⚙️',
    education: '🎓',
  };

  const currentCategory = categories[currentStep];
  const currentQuestions = careerQuestionnaire.filter(q => q.category === currentCategory);

  useEffect(() => {
    if (enableRealTimeMatching && Object.keys(responses).length >= 5) {
      updateRealtimeMatches();
    }
  }, [responses, enableRealTimeMatching]);

  const updateRealtimeMatches = () => {
    try {
      const partialProfile = buildUserProfile();
      const matches = careerMatchingEngine.matchCareers(partialProfile);
      setRealtimeMatches(matches.slice(0, 3));
    } catch {
      setRealtimeMatches([]);
    }
  };

  const handleResponse = (questionId: string, value: string | number | string[] | boolean) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const buildUserProfile = (): UserProfile => {
    const interests: string[] = [];
    if (Array.isArray(responses['interests-1'])) {
      interests.push(...(responses['interests-1'] as string[]));
    }
    if (Array.isArray(responses['interests-2'])) {
      interests.push(...(responses['interests-2'] as string[]));
    }

    const skills: string[] = [];
    if (Array.isArray(responses['skills-1'])) {
      skills.push(...(responses['skills-1'] as string[]));
    }

    const experienceLevel = (responses['experience-1'] as ExperienceLevel) || 'entry';
    const yearsOfExperience = typeof responses['experience-2'] === 'number' ? responses['experience-2'] : 0;
    const industries = Array.isArray(responses['experience-3']) ? responses['experience-3'] : [];

    const workEnvironment = {
      remote: Array.isArray(responses['preferences-1']) && responses['preferences-1'].includes('remote'),
      hybrid: Array.isArray(responses['preferences-1']) && responses['preferences-1'].includes('hybrid'),
      onsite: Array.isArray(responses['preferences-1']) && responses['preferences-1'].includes('onsite'),
    };

    const salaryMin = typeof responses['preferences-2'] === 'number' ? responses['preferences-2'] : 40000;
    const salaryMax = typeof responses['preferences-3'] === 'number' ? responses['preferences-3'] : 100000;

    const preferredCategories = Array.isArray(responses['preferences-6'])
      ? responses['preferences-6'] as CareerCategory[]
      : [];

    const workLifeBalance = (responses['preferences-4'] as 'high' | 'medium' | 'low') || 'medium';
    const travelWillingness = responses['preferences-5'] === 'yes' || responses['preferences-5'] === 'sometimes';

    const workStyle = (responses['personality-1'] as 'independent' | 'collaborative' | 'mixed') || 'mixed';
    const pace = (responses['personality-2'] as 'fast-paced' | 'steady' | 'varied') || 'varied';
    const problemSolving = (responses['personality-3'] as 'analytical' | 'creative' | 'practical' | 'mixed') || 'mixed';
    const communication = (responses['personality-4'] as 'frequent' | 'moderate' | 'minimal') || 'moderate';
    const leadership = responses['personality-5'] === 'yes' || responses['personality-5'] === 'maybe';

    const educationLevel = (responses['education-1'] as UserProfile['education']['level']) || 'bachelors';
    const educationField = typeof responses['education-2'] === 'string' ? responses['education-2'] : undefined;
    const willingToGetCertifications = responses['education-3'] === 'yes' || responses['education-3'] === 'maybe';

    return {
      interests,
      skills,
      experience: {
        level: experienceLevel,
        yearsOfExperience,
        industries,
        roles: [],
      },
      preferences: {
        workEnvironment,
        salary: { min: salaryMin, max: salaryMax },
        categories: preferredCategories,
        workLifeBalance,
        travelWillingness,
      },
      personality: {
        workStyle,
        pace,
        problemSolving,
        communication,
        leadership,
      },
      education: {
        level: educationLevel,
        field: educationField,
        willingToGetCertifications,
      },
      questionnaire: responses,
    };
  };

  const handleNext = () => {
    if (currentStep < categories.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsCalculating(true);
    try {
      const profile = buildUserProfile();
      const matches = careerMatchingEngine.matchCareers(profile);
      onComplete(matches);
    } finally {
      setIsCalculating(false);
    }
  };

  const canProceed = () => {
    const requiredQuestionsInCategory = currentQuestions
      .filter(q => q.required)
      .every(q => responses[q.id] !== undefined && responses[q.id] !== '');
    return requiredQuestionsInCategory;
  };

  const renderQuestion = (question: CareerQuestion) => {
    const value = responses[question.id];

    switch (question.type) {
      case 'single-choice':
        return (
          <div className="space-y-3">
            {question.options?.map(option => (
              <label
                key={option.value}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  value === option.value
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleResponse(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-gray-100">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map(option => (
              <label
                key={option.value}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  Array.isArray(value) && value.includes(option.value)
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                }`}
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleResponse(question.id, newValues);
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-gray-100">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              {Array.from({ length: question.max || 5 }, (_, i) => i + 1).map(rating => (
                <button
                  key={rating}
                  onClick={() => handleResponse(question.id, rating)}
                  className={`w-14 h-14 rounded-full font-bold transition-all ${
                    value === rating
                      ? 'bg-blue-600 text-white scale-110'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>{question.min || 1}</span>
              <span>{question.max || 5}</span>
            </div>
          </div>
        );

      case 'range':
        return (
          <div className="space-y-4">
            <input
              type="range"
              min={question.min || 0}
              max={question.max || 100}
              value={typeof value === 'number' ? value : question.min || 0}
              onChange={(e) => handleResponse(question.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between items-center">
              <span className="text-gray-400">{question.min || 0}</span>
              <span className="text-2xl font-bold text-blue-400">
                {typeof value === 'number' ? value.toLocaleString() : question.min || 0}
              </span>
              <span className="text-gray-400">{question.max || 100}</span>
            </div>
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            placeholder="Type your answer..."
            className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500"
          />
        );

      default:
        return null;
    }
  };

  const overallProgress = (currentStep / categories.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">
            Step {currentStep + 1} of {categories.length}
          </span>
          <span className="text-sm text-gray-400">
            {Math.round(overallProgress)}% Complete
          </span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map((category, index) => {
          const progress = getCategoryProgress(responses, category);
          const isActive = index === currentStep;
          const isCompleted = progress === 100;

          return (
            <button
              key={category}
              onClick={() => setCurrentStep(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : isCompleted
                  ? 'bg-green-900/50 text-green-400'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span>{categoryIcons[category]}</span>
              <span className="text-sm">{categoryLabels[category]}</span>
              {isCompleted && <span className="text-xs">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-100 mb-2 flex items-center gap-2">
            <span>{categoryIcons[currentCategory]}</span>
            {categoryLabels[currentCategory]}
          </h2>
          <p className="text-gray-400">Answer these questions to help us find your ideal career match</p>
        </div>

        <div className="space-y-8">
          {currentQuestions.map(question => (
            <div key={question.id} className="space-y-3">
              <label className="block text-lg font-medium text-gray-100">
                {question.question}
                {question.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {question.helpText && (
                <p className="text-sm text-gray-400">{question.helpText}</p>
              )}
              {renderQuestion(question)}
            </div>
          ))}
        </div>
      </div>

      {enableRealTimeMatching && realtimeMatches.length > 0 && (
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6 border border-purple-500/30 mb-6">
          <button
            onClick={() => setShowRealtimePreview(!showRealtimePreview)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-1">
                🎯 Live Career Matches
              </h3>
              <p className="text-sm text-gray-400">
                Based on your current answers, here are your top matches
              </p>
            </div>
            <svg
              className={`w-6 h-6 text-gray-400 transition-transform ${showRealtimePreview ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showRealtimePreview && (
            <div className="mt-4 space-y-3">
              {realtimeMatches.map((match, index) => (
                <div key={match.career.id} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-100">{match.career.title}</h4>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                      {Math.round(match.overallScore)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{match.career.description.substring(0, 100)}...</p>
                  {match.strengths.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {match.strengths.slice(0, 2).map((strength, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-green-900/50 text-green-400 rounded">
                          {strength}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-6 py-3 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed() || isCalculating}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isCalculating ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Calculating...
            </>
          ) : currentStep === categories.length - 1 ? (
            'Get My Career Matches →'
          ) : (
            'Next →'
          )}
        </button>
      </div>
    </div>
  );
}
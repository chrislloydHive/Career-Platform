'use client';

import { useState, useEffect } from 'react';
import { AdaptiveQuestioningEngine, DiscoveredInsight, IdentifiedGap } from '@/lib/adaptive-questions/adaptive-engine';
import { SynthesizedInsight } from '@/lib/adaptive-questions/insight-synthesis';
import { AdaptiveQuestion, ExplorationArea } from '@/lib/adaptive-questions/question-banks';
import { InteractiveInsightCards } from './InteractiveInsightCards';
import { UserProfile } from '@/types/user-profile';
import { RealtimeCareerMatcher, LiveCareerUpdate, CareerFitScore } from '@/lib/matching/realtime-career-matcher';
import { LiveCareerMatchesPanel } from './LiveCareerMatchesPanel';
import { AuthenticityProfile } from '@/lib/authenticity/authentic-self-detector';
import { AuthenticityInsightsDisplay } from './AuthenticityInsightsDisplay';

interface AdaptiveQuestionnaireProps {
  onComplete?: (profile: ReturnType<AdaptiveQuestioningEngine['exportProfile']>) => void;
  onInsightDiscovered?: (insight: DiscoveredInsight) => void;
  userProfile?: UserProfile;
}

export function AdaptiveQuestionnaire({ onComplete, onInsightDiscovered, userProfile }: AdaptiveQuestionnaireProps) {
  const [engine] = useState(() => new AdaptiveQuestioningEngine());
  const [currentQuestions, setCurrentQuestions] = useState<AdaptiveQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [response, setResponse] = useState<unknown>(null);
  const [scaleValue, setScaleValue] = useState(3);
  const [textInput, setTextInput] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState<'certain' | 'somewhat-sure' | 'uncertain'>('certain');
  const [insights, setInsights] = useState<DiscoveredInsight[]>([]);
  const [synthesizedInsights, setSynthesizedInsights] = useState<SynthesizedInsight[]>([]);
  const [gaps, setGaps] = useState<IdentifiedGap[]>([]);
  const [showProgress, setShowProgress] = useState(false);
  const [showSynthesized, setShowSynthesized] = useState(true);
  const [careerMatcher, setCareerMatcher] = useState<RealtimeCareerMatcher | null>(null);
  const [topCareers, setTopCareers] = useState<CareerFitScore[]>([]);
  const [risingCareers, setRisingCareers] = useState<CareerFitScore[]>([]);
  const [latestUpdate, setLatestUpdate] = useState<LiveCareerUpdate | undefined>();
  const [showCareerMatches, setShowCareerMatches] = useState(false);
  const [authenticityProfile, setAuthenticityProfile] = useState<AuthenticityProfile | null>(null);
  const [showAuthenticityInsights, setShowAuthenticityInsights] = useState(false);

  useEffect(() => {
    loadNextQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNextQuestions = () => {
    const nextQuestions = engine.getNextQuestions(1);
    if (nextQuestions.length > 0) {
      setCurrentQuestions(nextQuestions);
      setCurrentQuestionIndex(0);
      resetResponse();
    }
  };

  const resetResponse = () => {
    setResponse(null);
    setScaleValue(3);
    setTextInput('');
    setConfidenceLevel('certain');
  };

  const currentQuestion = currentQuestions[currentQuestionIndex];

  const handleSubmitResponse = () => {
    if (!currentQuestion || response === null) return;

    engine.recordResponse(currentQuestion.id, response, confidenceLevel);

    const newInsights = engine.getInsights();
    const previousCount = insights.length;

    if (newInsights.length > previousCount) {
      const latest = newInsights[newInsights.length - 1];
      onInsightDiscovered?.(latest);
    }

    setInsights(newInsights);
    setSynthesizedInsights(engine.getSynthesizedInsights());
    setGaps(engine.getGaps());

    if (newInsights.length >= 2) {
      updateCareerMatches(newInsights);
    }

    const authProfile = engine.getAuthenticityProfile();
    if (authProfile) {
      setAuthenticityProfile(authProfile);
      if (!showAuthenticityInsights && Object.keys(engine.getState().responses).length >= 5) {
        setShowAuthenticityInsights(true);
      }
    }

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetResponse();
    } else {
      loadNextQuestions();
    }
  };

  const updateCareerMatches = (currentInsights: DiscoveredInsight[]) => {
    const responses = engine.getState().responses;

    if (!careerMatcher) {
      const matcher = new RealtimeCareerMatcher(responses, currentInsights, userProfile);
      setCareerMatcher(matcher);
      setTopCareers(matcher.getTopCareers(5));
      setRisingCareers(matcher.getRisingCareers(3));
      setShowCareerMatches(true);
    } else {
      const updates = careerMatcher.updateScores(currentInsights);
      setTopCareers(careerMatcher.getTopCareers(5));
      setRisingCareers(careerMatcher.getRisingCareers(3));

      if (updates.length > 0) {
        setLatestUpdate(updates[0]);
      }
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetResponse();
    } else {
      loadNextQuestions();
    }
  };

  const handleComplete = () => {
    const profile = engine.exportProfile();
    onComplete?.(profile);
  };


  const getAreaLabel = (area: ExplorationArea) => {
    return area.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map(option => (
              <button
                key={option.value}
                onClick={() => setResponse(option.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  response === option.value
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                    response === option.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-600'
                  }`}>
                    {response === option.value && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-200 font-medium">{option.label}</p>
                    {option.insight && response === option.value && (
                      <p className="text-sm text-blue-400 mt-2 italic">{option.insight}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        );

      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>{currentQuestion.scaleLabels?.min}</span>
              <span>{currentQuestion.scaleLabels?.max}</span>
            </div>
            <input
              type="range"
              min={currentQuestion.scaleMin || 1}
              max={currentQuestion.scaleMax || 5}
              value={scaleValue}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setScaleValue(value);
                setResponse(value);
              }}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-center">
              <div className="px-6 py-3 bg-blue-600 text-white rounded-lg text-2xl font-bold">
                {scaleValue}
              </div>
            </div>
          </div>
        );

      case 'open-ended':
        return (
          <div>
            <textarea
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                setResponse(e.target.value);
              }}
              placeholder="Share your thoughts..."
              className="w-full px-4 py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-32"
            />
          </div>
        );

      case 'scenario':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map(option => (
              <button
                key={option.value}
                onClick={() => setResponse(option.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  response === option.value
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <p className="text-gray-200 font-medium">{option.label}</p>
                {option.insight && response === option.value && (
                  <p className="text-sm text-blue-400 mt-2 italic">{option.insight}</p>
                )}
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-100 mb-4">
            Exploration Complete!
          </h2>
          <p className="text-gray-400 mb-6">
            You&apos;ve completed the adaptive career exploration. Review your insights and discovered interests below.
          </p>
          <button
            onClick={handleComplete}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Full Profile
          </button>
        </div>
      </div>
    );
  }

  const progress = engine.getCompletionPercentage();
  const explorationProgress = engine.getExplorationProgress();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-100">Adaptive Career Exploration</h1>
          <button
            onClick={() => setShowProgress(!showProgress)}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            {showProgress ? 'Hide' : 'Show'} Progress
          </button>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-400 mt-2">{progress}% explored</p>
      </div>

      {/* Progress Detail */}
      {showProgress && (
        <div className="mb-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Exploration Areas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {explorationProgress.map(area => (
              <div key={area.area} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-750">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-300">{getAreaLabel(area.area)}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {area.depth}/{area.totalQuestions}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-gray-800 rounded-lg border border-blue-700/30 p-8 mb-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-semibold text-blue-400">
              {getAreaLabel(currentQuestion.area)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs">
                {currentQuestion.type}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-100 leading-relaxed">
              {currentQuestion.text}
            </h2>
          </div>
        </div>

        {renderQuestionInput()}

        {/* Confidence Level */}
        {response !== null && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-3">How certain are you about this answer?</p>
            <div className="flex gap-2">
              {[
                { value: 'certain', label: 'Very Certain', color: 'bg-green-600' },
                { value: 'somewhat-sure', label: 'Somewhat Sure', color: 'bg-yellow-600' },
                { value: 'uncertain', label: 'Uncertain', color: 'bg-orange-600' },
              ].map(level => (
                <button
                  key={level.value}
                  onClick={() => setConfidenceLevel(level.value as typeof confidenceLevel)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    confidenceLevel === level.value
                      ? `${level.color} text-white`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmitResponse}
            disabled={response === null}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed font-medium"
          >
            Continue
          </button>
          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Synthesized Insights - Priority Display */}
      {synthesizedInsights.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900/40 to-green-900/40 rounded-lg border-2 border-blue-600/60 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Cross-Domain Insights ({synthesizedInsights.length})
            </h3>
            <button
              onClick={() => setShowSynthesized(!showSynthesized)}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              {showSynthesized ? 'Hide' : 'Show'}
            </button>
          </div>

          {showSynthesized && (
            <div className="space-y-4">
              {synthesizedInsights.map((insight, index) => (
                <div key={index} className="bg-gray-800/70 rounded-lg p-5 border-l-4 border-blue-500">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                            insight.type === 'cross-domain'
                              ? 'bg-blue-600 text-white'
                              : insight.type === 'paradox'
                              ? 'bg-purple-600 text-white'
                              : insight.type === 'nuanced-preference'
                              ? 'bg-green-600 text-white'
                              : 'bg-orange-600 text-white'
                          }`}>
                            {insight.type.replace('-', ' ')}
                          </span>
                          <span className="text-xs font-medium text-gray-400">
                            {Math.round(insight.confidence * 100)}% confidence
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-100 mb-2">{insight.title}</h4>
                        <p className="text-gray-300 leading-relaxed">{insight.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {insight.sourceAreas.map((area, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs font-medium">
                          {getAreaLabel(area)}
                        </span>
                      ))}
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-4 border border-green-700/30">
                      <h5 className="text-sm font-semibold text-green-400 mb-2">Implications for Your Career:</h5>
                      <ul className="space-y-1.5">
                        {insight.implications.map((implication, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">→</span>
                            <span>{implication}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactive Insight Cards */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Discovered Insights ({insights.length})
            </h3>
            <span className="text-xs text-gray-400">Click any card to explore</span>
          </div>
          <InteractiveInsightCards
            insights={insights}
            userProfile={userProfile}
            onAskRelatedQuestion={(question) => {
              console.log('Related question:', question);
            }}
            onRefineInsight={(insight, refinement) => {
              console.log('Refined insight:', insight, refinement);
              setInsights(prev => prev.map(i => i.insight === insight.insight ? insight : i));
            }}
            onExploreCareer={(careerTitle) => {
              console.log('Explore career:', careerTitle);
            }}
          />
        </div>
      )}


      {/* Authenticity Insights */}
      {showAuthenticityInsights && authenticityProfile && (
        <div className="mt-6">
          <AuthenticityInsightsDisplay
            profile={authenticityProfile}
            onAnswerProbingQuestion={(questionId, response) => {
              engine.recordResponse(questionId, response);
              const updatedProfile = engine.getAuthenticityProfile();
              if (updatedProfile) {
                setAuthenticityProfile(updatedProfile);
              }
            }}
          />
        </div>
      )}

      {/* Gaps Identified */}
      {gaps.length > 0 && (
        <div className="mt-6 bg-blue-900/20 rounded-lg border border-blue-700/50 p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Areas to Explore
          </h3>
          <div className="space-y-2">
            {gaps.map((gap, index) => (
              <div key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>{gap.gap}</span>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>

        {/* Sticky Sidebar - Live Career Matches */}
        {showCareerMatches && (
          <div className="hidden lg:block w-96 flex-shrink-0">
            <LiveCareerMatchesPanel
              topCareers={topCareers}
              risingCareers={risingCareers}
              latestUpdate={latestUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
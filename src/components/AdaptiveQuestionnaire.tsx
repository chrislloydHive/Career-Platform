'use client';

import { useState, useEffect } from 'react';
import { AdaptiveQuestioningEngine, DiscoveredInsight, IdentifiedGap } from '@/lib/adaptive-questions/adaptive-engine';
import { SynthesizedInsight } from '@/lib/adaptive-questions/insight-synthesis';
import { AdaptiveQuestion, ExplorationArea } from '@/lib/adaptive-questions/question-banks';
import { InteractiveInsightCards } from './InteractiveInsightCards';
import { UserProfile } from '@/types/user-profile';
import { RealtimeCareerMatcher, LiveCareerUpdate, CareerFitScore } from '@/lib/matching/realtime-career-matcher';
import { LiveCareerMatchesPanel } from './LiveCareerMatchesPanel';
import { JobCategory } from '@/types/career';
import { AuthenticityProfile } from '@/lib/authenticity/authentic-self-detector';
import { AuthenticityDetectionPanel } from './AuthenticityDetectionPanel';
import { NarrativeInsightGenerator, NarrativeInsight } from '@/lib/insights/narrative-insight-generator';
import { NarrativeInsightCard } from './NarrativeInsightCard';
import { ConfidenceEvolutionEngine, InsightEvolution, ConfidencePattern, EvolutionSummary } from '@/lib/insights/confidence-evolution';
import { ConfidenceEvolutionPanel } from './ConfidenceEvolutionPanel';
import { FutureSelfProjection } from '@/lib/future-modeling/future-self-projector';
import { FutureCareerPathVisualizer } from './FutureCareerPathVisualizer';

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
  const [showProgress, setShowProgress] = useState(true);
  const [showInsightNotification, setShowInsightNotification] = useState(false);
  const [latestInsightNotification, setLatestInsightNotification] = useState<DiscoveredInsight | null>(null);
  const [skippedQuestions, setSkippedQuestions] = useState<AdaptiveQuestion[]>([]);
  const [showSynthesized, setShowSynthesized] = useState(true);
  const [careerMatcher, setCareerMatcher] = useState<RealtimeCareerMatcher | null>(null);
  const [topCareers, setTopCareers] = useState<CareerFitScore[]>([]);
  const [risingCareers, setRisingCareers] = useState<CareerFitScore[]>([]);
  const [latestUpdate, setLatestUpdate] = useState<LiveCareerUpdate | undefined>();
  const [showCareerMatches, setShowCareerMatches] = useState(false);
  const [authenticityProfile, setAuthenticityProfile] = useState<AuthenticityProfile | null>(null);
  const [showAuthenticityInsights, setShowAuthenticityInsights] = useState(false);
  const [narrativeInsights, setNarrativeInsights] = useState<NarrativeInsight[]>([]);
  const [confidenceEvolutions, setConfidenceEvolutions] = useState<InsightEvolution[]>([]);
  const [confidencePatterns, setConfidencePatterns] = useState<ConfidencePattern[]>([]);
  const [evolutionSummary, setEvolutionSummary] = useState<EvolutionSummary | null>(null);
  const [showConfidenceEvolution, setShowConfidenceEvolution] = useState(false);
  const [futureProjection, setFutureProjection] = useState<FutureSelfProjection | null>(null);
  const [showFutureProjection, setShowFutureProjection] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [userCareers, setUserCareers] = useState<JobCategory[]>([]);

  useEffect(() => {
    loadSavedState();
    loadUserCareers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserCareers = async () => {
    try {
      const response = await fetch('/api/careers');
      if (response.ok) {
        const data = await response.json();
        setUserCareers(data.careers || []);
      }
    } catch (error) {
      console.error('Failed to load user careers:', error);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        saveState();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insights, synthesizedInsights, gaps, authenticityProfile, narrativeInsights, confidenceEvolutions, isLoading]);

  const loadSavedState = async () => {
    try {
      const response = await fetch('/api/questionnaire');
      if (response.ok) {
        const data = await response.json();
        if (data.state) {
          engine.loadState(data.state);
          setInsights(data.insights || []);
          setSynthesizedInsights(data.synthesizedInsights || []);
          setGaps(data.gaps || []);
          if (data.authenticityProfile) {
            setAuthenticityProfile(data.authenticityProfile);
          }
          setNarrativeInsights(data.narrativeInsights || []);
          setConfidenceEvolutions(data.confidenceEvolutions || []);

          const nextQuestions = engine.getNextQuestions(1);
          if (nextQuestions.length > 0) {
            setCurrentQuestions(nextQuestions);
            setCurrentQuestionIndex(0);
            resetResponse();
          } else {
            loadNextQuestions();
          }
        } else {
          loadNextQuestions();
        }
      } else {
        loadNextQuestions();
      }
    } catch (error) {
      console.error('Failed to load saved state:', error);
      loadNextQuestions();
    } finally {
      setIsLoading(false);
    }
  };

  const saveState = async () => {
    try {
      setSaveStatus('saving');
      const state = engine.getState();
      const completionPercentage = engine.getCompletionPercentage();
      const lastQuestionId = currentQuestion?.id || null;

      const response = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state,
          insights,
          synthesizedInsights,
          gaps,
          authenticityProfile,
          narrativeInsights,
          confidenceEvolutions,
          lastQuestionId,
          completionPercentage,
        }),
      });

      if (response.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to save state:', error);
      setSaveStatus('error');
    }
  };

  const loadNextQuestions = () => {
    const nextQuestions = engine.getNextQuestions(1);
    if (nextQuestions.length > 0) {
      setCurrentQuestions(nextQuestions);
      setCurrentQuestionIndex(0);
      resetResponse();
    }
  };

  const resetResponse = () => {
    const nextQuestion = currentQuestions[currentQuestionIndex + 1] || currentQuestions[0];
    if (nextQuestion?.type === 'scale') {
      setResponse(3);
      setScaleValue(3);
    } else {
      setResponse(null);
      setScaleValue(3);
    }
    setTextInput('');
    setConfidenceLevel('certain');
  };

  const currentQuestion = currentQuestions[currentQuestionIndex];

  // Set initial response for scale questions
  useEffect(() => {
    if (currentQuestion?.type === 'scale' && response === null) {
      setResponse(3);
    }
  }, [currentQuestion, response]);

  const handleSubmitResponse = async () => {
    if (!currentQuestion || response === null) return;

    engine.recordResponse(currentQuestion.id, response, confidenceLevel);

    const newInsights = engine.getInsights();
    const previousCount = insights.length;

    if (newInsights.length > previousCount) {
      const latest = newInsights[newInsights.length - 1];
      onInsightDiscovered?.(latest);

      setLatestInsightNotification(latest);
      setShowInsightNotification(true);
      setTimeout(() => setShowInsightNotification(false), 5000);
    }

    setInsights(newInsights);
    setSynthesizedInsights(engine.getSynthesizedInsights());
    setGaps(engine.getGaps());

    if (newInsights.length >= 2 && userProfile) {
      const narrativeGen = new NarrativeInsightGenerator(
        userProfile,
        engine.getState().responses,
        newInsights
      );
      setNarrativeInsights(narrativeGen.generateNarrativeInsights());
    }

    if (newInsights.length >= 3) {
      const confidenceEngine = new ConfidenceEvolutionEngine(
        engine.getState().responses,
        newInsights
      );
      setConfidenceEvolutions(confidenceEngine.getEvolutions());
      setConfidencePatterns(confidenceEngine.getPatterns());
      setEvolutionSummary(confidenceEngine.getEvolutionSummary());

      if (!showConfidenceEvolution && Object.keys(engine.getState().responses).length >= 5) {
        setShowConfidenceEvolution(true);
      }
    }

    if (newInsights.length >= 4 && userProfile) {
      const projection = engine.getFutureSelfProjection();
      if (projection) {
        setFutureProjection(projection);
        if (!showFutureProjection && Object.keys(engine.getState().responses).length >= 8) {
          setShowFutureProjection(true);
        }
      }
    }

    updateCareerMatches(newInsights);

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

    await saveState();
  };

  const updateCareerMatches = (currentInsights: DiscoveredInsight[]) => {
    const responses = engine.getState().responses;
    const responseCount = Object.keys(responses).length;

    if (responseCount < 3) return;

    if (!careerMatcher) {
      const matcher = new RealtimeCareerMatcher(responses, currentInsights, userProfile, userCareers);
      setCareerMatcher(matcher);
      setTopCareers(matcher.getTopCareers(5));
      setRisingCareers(matcher.getRisingCareers(3));
      setShowCareerMatches(true);
    } else {
      const updates = careerMatcher.updateScores(currentInsights, responses);
      setTopCareers(careerMatcher.getTopCareers(5));
      setRisingCareers(careerMatcher.getRisingCareers(3));

      if (updates.length > 0) {
        setLatestUpdate(updates[0]);
      }
    }
  };

  const handleSkip = () => {
    if (currentQuestion) {
      setSkippedQuestions(prev => {
        if (prev.some(q => q.id === currentQuestion.id)) {
          return prev;
        }
        return [...prev, currentQuestion];
      });
    }

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetResponse();
    } else {
      loadNextQuestions();
    }
  };

  const handleComeBackLater = () => {
    handleSkip();
  };

  const handleAnswerSkippedQuestion = (question: AdaptiveQuestion) => {
    setCurrentQuestions([question]);
    setCurrentQuestionIndex(0);
    setSkippedQuestions(prev => prev.filter(q => q.id !== question.id));
    resetResponse();
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your questionnaire...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-100 mb-4">
            Exploration Complete!
          </h2>
          <p className="text-gray-400 mb-6">
            You&apos;ve completed the adaptive career exploration. Review your insights and discovered interests below.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Full Profile
            </button>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to restart the questionnaire? This will clear all your answers.')) {
                  try {
                    await fetch('/api/questionnaire', { method: 'DELETE' });
                    window.location.reload();
                  } catch (error) {
                    console.error('Failed to restart:', error);
                  }
                }
              }}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Restart Questionnaire
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = engine.getCompletionPercentage();
  const explorationProgress = engine.getExplorationProgress();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      {/* Real-time Insight Notification - Celebratory */}
      {showInsightNotification && latestInsightNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-xl shadow-2xl p-5 max-w-md border-2 border-amber-300 relative overflow-hidden">
            {/* Sparkle effect */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping" />
              <div className="absolute top-4 right-8 w-1 h-1 bg-white rounded-full animate-ping delay-100" />
              <div className="absolute top-3 right-12 w-1.5 h-1.5 bg-white rounded-full animate-ping delay-200" />
            </div>

            <div className="flex items-start gap-3 relative">
              <div className="p-2.5 bg-white/30 rounded-xl animate-bounce">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">New Insight!</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold text-white">
                    #{insights.length + synthesizedInsights.length}
                  </span>
                </div>
                <p className="text-base text-white font-semibold leading-snug">{latestInsightNotification.insight}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-white/30 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-500"
                      style={{ width: `${latestInsightNotification.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-white font-bold">{Math.round(latestInsightNotification.confidence * 100)}%</span>
                </div>
                <div className="mt-2 text-xs text-white/80">
                  {getAreaLabel(latestInsightNotification.area)}
                </div>
              </div>
              <button
                onClick={() => setShowInsightNotification(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1 max-w-4xl">
      {/* Header with Adaptive Intelligence Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 mb-1">Adaptive Career Exploration</h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>AI adapting questions based on your responses</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-3xl font-bold text-blue-400">{progress}%</div>
                </div>
                <div className="text-xs text-gray-500">explored</div>
              </div>
              <div className="border-l border-gray-700 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="text-2xl font-bold text-amber-400">{insights.length + synthesizedInsights.length}</div>
                </div>
                <div className="text-xs text-gray-500">insights</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 justify-end">
              {saveStatus === 'saving' && (
                <div className="text-xs text-gray-500">Saving...</div>
              )}
              {saveStatus === 'saved' && (
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Saved
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="text-xs text-red-400">Save failed</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 8 Exploration Areas Progress */}
      <div className="mb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-blue-500/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-100">8 Exploration Areas</h3>
          <span className="text-xs text-gray-500">{explorationProgress.filter(a => a.depth > 0).length}/8 started</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {explorationProgress.map(area => {
            const percentage = Math.min(100, area.totalQuestions > 0 ? (area.depth / area.totalQuestions) * 100 : 0);
            return (
              <div key={area.area} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-blue-500/50 transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-200">{getAreaLabel(area.area)}</span>
                  <span className="text-xs text-gray-400">{area.depth}/{area.totalQuestions}</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      percentage === 0 ? 'bg-gray-600' :
                      percentage < 50 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      percentage < 100 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                      'bg-gradient-to-r from-green-500 to-emerald-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gray-800 rounded-lg border border-blue-700/30 p-8 mb-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
            <span className="text-lg font-bold text-blue-400">
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

        {/* Confidence Level Slider */}
        {response !== null && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">How confident are you in this answer?</p>
              <span className={`text-sm font-semibold ${
                confidenceLevel === 'certain' ? 'text-green-400' :
                confidenceLevel === 'somewhat-sure' ? 'text-yellow-400' :
                'text-orange-400'
              }`}>
                {confidenceLevel === 'certain' ? 'Very Confident' :
                 confidenceLevel === 'somewhat-sure' ? 'Somewhat Sure' :
                 'Uncertain'}
              </span>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Uncertain</span>
                  <span>Somewhat</span>
                  <span>Very Sure</span>
                </div>
                <div className="flex gap-2">
                  {[
                    { value: 'uncertain', label: 'Low', color: 'bg-orange-600' },
                    { value: 'somewhat-sure', label: 'Medium', color: 'bg-yellow-600' },
                    { value: 'certain', label: 'High', color: 'bg-green-600' },
                  ].map((level, idx) => (
                    <button
                      key={level.value}
                      onClick={() => setConfidenceLevel(level.value as typeof confidenceLevel)}
                      className={`flex-1 h-3 rounded-full transition-all ${
                        confidenceLevel === level.value
                          ? `${level.color} scale-110 shadow-lg`
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 italic">
                Your confidence helps us understand which insights are strongest
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 mt-6">
          <div className="flex gap-3">
            <button
              onClick={handleSubmitResponse}
              disabled={response === null}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              Continue
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={handleComeBackLater}
              className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              title="Save this question for later"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Come Back Later
            </button>
          </div>
          {skippedQuestions.length > 0 && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {skippedQuestions.length} question{skippedQuestions.length !== 1 ? 's' : ''} saved for later
            </div>
          )}
        </div>
      </div>

      {/* Latest Insights - Compact Preview Above the Fold */}
      {(insights.length > 0 || synthesizedInsights.length > 0) && (
        <div className="mb-6 bg-gradient-to-br from-amber-900/20 via-amber-800/10 to-amber-900/20 rounded-xl border-2 border-amber-500/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h3 className="text-lg font-bold text-amber-100">Latest Insights Discovered</h3>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold">
                {insights.length + synthesizedInsights.length} total
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {[...synthesizedInsights.slice(-2).reverse(), ...insights.slice(-3).reverse()].slice(0, 3).map((insight, index) => {
              const isSynthesized = 'title' in insight;
              const synthInsight = isSynthesized ? insight as SynthesizedInsight : null;
              const regularInsight = !isSynthesized ? insight as DiscoveredInsight : null;
              return (
                <div
                  key={index}
                  className="bg-gray-800/60 rounded-lg p-4 border-l-4 border-amber-500 hover:bg-gray-800/80 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        {isSynthesized && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-600 text-white">
                            CROSS-DOMAIN
                          </span>
                        )}
                        {!isSynthesized && regularInsight?.area && (
                          <span className="text-xs font-medium text-amber-400">
                            {getAreaLabel(regularInsight.area)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-100 leading-relaxed">
                        {isSynthesized ? synthInsight?.title : regularInsight?.insight}
                      </p>
                      {isSynthesized && synthInsight && (
                        <p className="text-xs text-gray-400 mt-1.5">
                          {synthInsight.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-1 rounded">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {Math.round(insight.confidence * 100)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {(insights.length + synthesizedInsights.length) > 3 && (
            <button
              onClick={() => {
                const insightsSection = document.getElementById('all-insights-section');
                insightsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="mt-4 w-full py-2 text-sm text-amber-300 hover:text-amber-200 font-medium flex items-center justify-center gap-1 hover:bg-amber-500/10 rounded-lg transition-all"
            >
              View all {insights.length + synthesizedInsights.length} insights
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Dynamic Adaptation Indicator */}
      {insights.length > 0 && (
        <div className="mb-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-300 mb-1">Questions Adapting to Your Responses</h4>
              <p className="text-xs text-gray-400">
                Based on your answers so far, we&apos;ve detected {insights.length} pattern{insights.length !== 1 ? 's' : ''}.
                The next questions will explore these insights further.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Skipped Questions - Come Back Later */}
      {skippedQuestions.length > 0 && (
        <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Saved for Later ({skippedQuestions.length})
            </h3>
          </div>
          <div className="space-y-3">
            {skippedQuestions.map((question) => (
              <div key={question.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">{getAreaLabel(question.area)}</div>
                    <p className="text-sm text-gray-300">{question.text}</p>
                  </div>
                  <button
                    onClick={() => handleAnswerSkippedQuestion(question)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors whitespace-nowrap"
                  >
                    Answer Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synthesized Insights - Priority Display */}
      {synthesizedInsights.length > 0 && (
        <div id="all-insights-section" className="bg-gradient-to-r from-blue-900/40 to-green-900/40 rounded-lg border-2 border-blue-600/60 p-6 mb-6 scroll-mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              All Insights ({insights.length + synthesizedInsights.length})
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

      {/* Narrative Insight Cards - Story Format */}
      {narrativeInsights.length > 0 && (
        <div className="mb-6">
          <NarrativeInsightCard narrativeInsights={narrativeInsights} />
        </div>
      )}

      {/* Confidence Evolution Panel */}
      {showConfidenceEvolution && evolutionSummary && (
        <div className="mb-6">
          <ConfidenceEvolutionPanel
            evolutions={confidenceEvolutions}
            patterns={confidencePatterns}
            summary={evolutionSummary}
          />
        </div>
      )}

      {/* Future Career Path Visualizer */}
      {showFutureProjection && futureProjection && (
        <div className="mb-6">
          <FutureCareerPathVisualizer projection={futureProjection} />
        </div>
      )}


      {/* Authenticity Detection Panel */}
      {showAuthenticityInsights && authenticityProfile && (
        <div className="mt-6">
          <AuthenticityDetectionPanel
            authenticityProfile={authenticityProfile}
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
        {showCareerMatches && careerMatcher && (
          <div className="hidden lg:block w-96 flex-shrink-0">
            <LiveCareerMatchesPanel
              topCareers={topCareers}
              risingCareers={risingCareers}
              latestUpdate={latestUpdate}
              dataCompleteness={careerMatcher.getDataCompletenessPercentage()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
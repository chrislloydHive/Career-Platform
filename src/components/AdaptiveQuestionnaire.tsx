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
import { CareerSuggestion } from '@/lib/ai/career-suggestions-ai';
import { ExpandableInsightCard } from './ExpandableInsightCard';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInsightNotification, setShowInsightNotification] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [latestInsightNotification, setLatestInsightNotification] = useState<DiscoveredInsight | null>(null);
  const [skippedQuestions, setSkippedQuestions] = useState<AdaptiveQuestion[]>([]);
  const [showSynthesized, setShowSynthesized] = useState(true);
  const [careerMatcher, setCareerMatcher] = useState<RealtimeCareerMatcher | null>(null);
  const [topCareers, setTopCareers] = useState<CareerFitScore[]>([]);
  const [risingCareers, setRisingCareers] = useState<CareerFitScore[]>([]);
  const [latestUpdate, setLatestUpdate] = useState<LiveCareerUpdate | undefined>();
  const [showCareerMatches, setShowCareerMatches] = useState(false);
  const [authenticityProfile, setAuthenticityProfile] = useState<AuthenticityProfile | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<CareerSuggestion[]>([]);
  const [showNewSuggestion, setShowNewSuggestion] = useState(false);
  const [latestSuggestion, setLatestSuggestion] = useState<CareerSuggestion | null>(null);
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

      const payload = {
        state,
        insights,
        synthesizedInsights,
        gaps,
        authenticityProfile,
        narrativeInsights,
        confidenceEvolutions,
        lastQuestionId,
        completionPercentage,
      };

      console.log('Saving questionnaire state...', {
        insightsCount: insights.length,
        synthesizedCount: synthesizedInsights.length,
        gapsCount: gaps.length,
        narrativeCount: narrativeInsights.length,
        completionPercentage,
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('Save request timed out after 15 seconds');
        controller.abort();
      }, 15000); // 15s timeout

      console.log('Sending POST request to /api/questionnaire...');
      const response = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Response received:', response.status, response.statusText);

      if (response.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
        console.log('Save successful');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Save failed with status:', response.status);
        console.error('Error data:', errorData);
        setSaveStatus('error');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Save request was aborted (timeout or manual abort)');
      } else {
        console.error('Failed to save state - exception thrown:', error);
      }
      setSaveStatus('error');
    }
  };

  const loadNextQuestions = () => {
    console.log('loadNextQuestions called');
    const nextQuestions = engine.getNextQuestions(1);
    console.log('Next questions received:', nextQuestions.length);

    if (nextQuestions.length > 0) {
      console.log('Setting next question:', nextQuestions[0].id);
      setCurrentQuestions(nextQuestions);
      setCurrentQuestionIndex(0);
      resetResponse();
    } else {
      console.log('No more questions available - questionnaire complete');
      handleComplete();
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

  // Debug mode keyboard shortcut: Press Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMode(prev => !prev);
        console.log('Debug mode:', !debugMode);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debugMode]);

  const quickSubmit = async () => {
    if (!currentQuestion) return;

    // Auto-select first option for multiple choice or scenario
    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'scenario') {
      if (currentQuestion.options && currentQuestion.options.length > 0) {
        setResponse(currentQuestion.options[0].value);
        setTimeout(() => handleSubmitResponse(), 100);
      }
    } else if (currentQuestion.type === 'scale') {
      setResponse(3);
      setTimeout(() => handleSubmitResponse(), 100);
    } else if (currentQuestion.type === 'open-ended') {
      setResponse('Debug test response');
      setTimeout(() => handleSubmitResponse(), 100);
    }
  };

  const handleSubmitResponse = async () => {
    if (!currentQuestion || response === null || isSubmitting) {
      console.log('Cannot submit:', { currentQuestion: !!currentQuestion, response, isSubmitting });
      return;
    }

    console.log('Submitting response for question:', currentQuestion.id, 'value:', response);
    setIsSubmitting(true);

    try {
      engine.recordResponse(currentQuestion.id, response, confidenceLevel);
    } catch (error) {
      console.error('Error recording response:', error);
      setIsSubmitting(false);
      return;
    }

    const newInsights = engine.getInsights();
    const previousCount = insights.length;

    if (newInsights.length > previousCount) {
      const latest = newInsights[newInsights.length - 1];
      onInsightDiscovered?.(latest);

      setLatestInsightNotification(latest);
      setShowInsightNotification(true);
      setTimeout(() => setShowInsightNotification(false), 4000);
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

    // Generate AI career suggestions periodically
    const responseCount = Object.keys(engine.getState().responses).length;
    if (responseCount >= 8 && (responseCount - 8) % 5 === 0) {
      generateAiSuggestions();
    }

    try {
      if (currentQuestionIndex < currentQuestions.length - 1) {
        console.log('Moving to next question in batch');
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        resetResponse();
      } else {
        console.log('Loading next question batch');
        loadNextQuestions();
      }
    } catch (error) {
      console.error('Error loading next question:', error);
    }

    console.log('About to save state...');
    try {
      await saveState();
    } catch (error) {
      console.error('Error saving state:', error);
    }
    console.log('Response submission complete');
    setIsSubmitting(false);
  };

  const generateAiSuggestions = async () => {
    try {
      const responses = engine.getState().responses;
      const currentInsights = insights;
      const currentMatches = topCareers.map(c => ({
        careerTitle: c.careerTitle,
        currentScore: c.currentScore,
      }));
      const responseCount = Object.keys(responses).length;

      const response = await fetch('/api/career-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          insights: currentInsights,
          currentMatches,
          responseCount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.suggestions && data.suggestions.length > 0) {
          setAiSuggestions(prev => [...prev, ...data.suggestions]);
          setLatestSuggestion(data.suggestions[0]);
          setShowNewSuggestion(true);
          setTimeout(() => setShowNewSuggestion(false), 15000);
        }
      }
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    }
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
                console.log('Restart Questionnaire button clicked');
                if (confirm('Are you sure you want to restart the questionnaire? This will clear all your answers.')) {
                  try {
                    console.log('Calling DELETE /api/questionnaire');
                    const response = await fetch('/api/questionnaire', { method: 'DELETE' });
                    console.log('DELETE response:', response.status, response.statusText);

                    if (response.ok) {
                      console.log('Restart successful, reloading page');
                      window.location.reload();
                    } else {
                      const errorData = await response.json().catch(() => ({}));
                      console.error('Restart failed:', errorData);
                      alert('Failed to restart questionnaire. Please try again.');
                    }
                  } catch (error) {
                    console.error('Failed to restart:', error);
                    alert('An error occurred while restarting. Please try again.');
                  }
                } else {
                  console.log('Restart cancelled by user');
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
    <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-8">
      {/* Debug Panel */}
      {debugMode && (
        <div className="fixed bottom-4 right-4 z-50 bg-yellow-600 text-black rounded-lg shadow-2xl p-3 sm:p-4 max-w-xs sm:max-w-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="font-bold text-xs sm:text-sm">🛠️ DEBUG MODE</h3>
            <button
              onClick={() => setDebugMode(false)}
              className="text-black hover:text-gray-700 text-sm"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 sm:space-y-2 text-xs">
            <p><strong>Question:</strong> {currentQuestion?.id}</p>
            <p><strong>Type:</strong> {currentQuestion?.type}</p>
            <p><strong>Response:</strong> {response !== null ? String(response) : 'none'}</p>
            <p><strong>Responses:</strong> {Object.keys(engine.getState().responses).length}</p>
            <p><strong>Insights:</strong> {insights.length}</p>
            <button
              onClick={quickSubmit}
              className="w-full mt-2 px-3 py-2 bg-black text-yellow-400 rounded font-bold hover:bg-gray-800 text-xs sm:text-sm"
            >
              ⚡ Quick Submit
            </button>
          </div>
        </div>
      )}

      {/* Real-time Insight Notification - Celebratory */}
      {showInsightNotification && latestInsightNotification && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-slide-in-right">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl shadow-2xl p-4 sm:p-5 max-w-md border-2 border-green-400/60 relative overflow-hidden">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent animate-shimmer pointer-events-none" />

            {/* Enhanced sparkle effect with green */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-300 rounded-full animate-ping" />
              <div className="absolute top-4 right-8 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '100ms' }} />
              <div className="absolute top-3 right-12 w-1.5 h-1.5 bg-green-300 rounded-full animate-ping" style={{ animationDelay: '200ms' }} />
              <div className="absolute top-6 right-6 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '300ms' }} />
              <div className="absolute top-5 right-16 w-1 h-1 bg-green-200 rounded-full animate-ping" style={{ animationDelay: '400ms' }} />
            </div>

            <div className="flex items-start gap-3 relative">
              <div className="p-2.5 bg-gradient-to-br from-green-400/30 to-blue-400/30 rounded-xl animate-pulse-subtle">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">✨ New Insight Discovered!</span>
                  <span className="px-2 py-0.5 bg-green-400/30 rounded-full text-xs font-semibold text-green-100 border border-green-300/30">
                    #{insights.length + synthesizedInsights.length}
                  </span>
                </div>
                <p className="text-base text-white font-semibold leading-snug mb-2">{latestInsightNotification.insight}</p>

                {/* Confidence bar with green accent */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-white/20 rounded-full h-2.5 border border-green-300/20">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-300 h-full rounded-full transition-all duration-700 shadow-lg shadow-green-400/50 animate-grow-width"
                      style={{ width: `${latestInsightNotification.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-green-200 font-bold px-2 py-0.5 bg-green-400/20 rounded-full">
                    {Math.round(latestInsightNotification.confidence * 100)}%
                  </span>
                </div>

                {/* Triggered by info */}
                <div className="mt-3 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs text-green-100/90">
                    Triggered by your response • {getAreaLabel(latestInsightNotification.area)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowInsightNotification(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Career Suggestion Notification */}
      {/* {showNewSuggestion && latestSuggestion && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto z-50 animate-slide-in-right">
          <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 rounded-xl shadow-2xl p-4 sm:p-5 max-w-md border-2 border-amber-400/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-2 right-2 w-2 h-2 bg-amber-300 rounded-full animate-ping" />
              <div className="absolute top-4 right-8 w-1 h-1 bg-amber-300 rounded-full animate-ping delay-100" />
              <div className="absolute top-3 right-12 w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping delay-200" />
            </div>

            <div className="flex items-start gap-3 relative">
              <div className="p-2.5 bg-white/30 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">AI Discovery!</span>
                  <span className="px-2 py-0.5 bg-amber-200/30 rounded-full text-xs font-semibold text-amber-100">
                    {latestSuggestion.category}
                  </span>
                </div>
                <p className="text-base text-white font-bold leading-snug mb-2">{latestSuggestion.title}</p>
                <p className="text-sm text-white/90 leading-relaxed mb-2">{latestSuggestion.discoveryReason}</p>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{latestSuggestion.matchScore}% potential match</span>
                </div>
              </div>
              <button
                onClick={() => setShowNewSuggestion(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )} */}

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="flex-1 max-w-full lg:max-w-4xl">
      {/* Header with Adaptive Intelligence Indicator */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-100 mb-1">Adaptive Career Exploration</h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>AI adapting questions</span>
                </div>
              </div>
              <button
                onClick={async () => {
                  console.log('Reset button clicked');
                  if (confirm('Are you sure you want to reset the assessment? This will clear all your answers and start over.')) {
                    try {
                      console.log('Calling DELETE /api/questionnaire');
                      const response = await fetch('/api/questionnaire', { method: 'DELETE' });
                      console.log('DELETE response:', response.status, response.statusText);

                      if (response.ok) {
                        console.log('Reset successful, reloading page');
                        window.location.reload();
                      } else {
                        const errorData = await response.json().catch(() => ({}));
                        console.error('Reset failed:', errorData);
                        alert('Failed to reset questionnaire. Please try again.');
                      }
                    } catch (error) {
                      console.error('Failed to reset:', error);
                      alert('An error occurred while resetting. Please try again.');
                    }
                  } else {
                    console.log('Reset cancelled by user');
                  }
                }}
                className="px-3 py-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
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
      <div className="bg-gray-800 rounded-lg border border-blue-700/30 p-4 sm:p-6 lg:p-8 mb-6">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="h-5 sm:h-6 w-1 bg-blue-500 rounded-full"></div>
            <span className="text-base sm:text-lg font-bold text-blue-400">
              {getAreaLabel(currentQuestion.area)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs">
                {currentQuestion.type}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-100 leading-relaxed">
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
        <div className="space-y-3 mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSubmitResponse}
              disabled={response === null || isSubmitting}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Continue
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
            <button
              onClick={handleComeBackLater}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              title="Save this question for later"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Come Back Later</span>
              <span className="sm:hidden">Later</span>
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
        <div className="mb-6 bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-blue-900/20 rounded-xl border-2 border-blue-500/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h3 className="text-lg font-bold text-blue-100">Latest Insights Discovered</h3>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold">
                {insights.length + synthesizedInsights.length} total
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {[...synthesizedInsights.slice(-2).reverse(), ...insights.slice(-3).reverse()].slice(0, 3).map((insight, index) => (
              <ExpandableInsightCard
                key={index}
                insight={insight}
                responses={engine.getState().responses}
                topCareers={topCareers}
                getAreaLabel={getAreaLabel}
              />
            ))}
          </div>

          {(insights.length + synthesizedInsights.length) > 3 && (
            <button
              onClick={() => {
                const insightsSection = document.getElementById('all-insights-section');
                insightsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="mt-4 w-full py-2 text-sm text-blue-300 hover:text-blue-200 font-medium flex items-center justify-center gap-1 hover:bg-blue-500/10 rounded-lg transition-all"
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
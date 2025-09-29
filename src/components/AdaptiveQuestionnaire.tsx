'use client';

import { useState, useEffect } from 'react';
import { AdaptiveQuestioningEngine, DiscoveredInsight, IdentifiedGap } from '@/lib/adaptive-questions/adaptive-engine';
import { SynthesizedInsight } from '@/lib/adaptive-questions/insight-synthesis';
import { AdaptiveQuestion, ExplorationArea, getQuestionById } from '@/lib/adaptive-questions/question-banks';
import { ConsistencyPattern, PreferenceIntensity, ValueHierarchy, Contradiction, HiddenMotivation } from '@/lib/adaptive-questions/pattern-recognition';
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

type ExportedProfile = ReturnType<AdaptiveQuestioningEngine['exportProfile']> & {
  topCareers?: CareerFitScore[];
};

interface AdaptiveQuestionnaireProps {
  onComplete?: (profile: ExportedProfile) => void;
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [isSmartQuestion, setIsSmartQuestion] = useState(false);
  const [questionSource, setQuestionSource] = useState<'base' | 'followup' | 'gap'>('base');
  const [showConfidenceWidget, setShowConfidenceWidget] = useState(false);
  const [showPatternHistory, setShowPatternHistory] = useState(false);

  const [consistencyPatterns, setConsistencyPatterns] = useState<ConsistencyPattern[]>([]);
  const [preferenceIntensities, setPreferenceIntensities] = useState<PreferenceIntensity[]>([]);
  const [valueHierarchy, setValueHierarchy] = useState<ValueHierarchy | null>(null);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [hiddenMotivations, setHiddenMotivations] = useState<HiddenMotivation[]>([]);

  const [showPatternNotification, setShowPatternNotification] = useState(false);
  const [latestPattern, setLatestPattern] = useState<{
    type: 'consistency' | 'preference' | 'value' | 'contradiction' | 'motivation';
    data: ConsistencyPattern | PreferenceIntensity | ValueHierarchy | Contradiction | HiddenMotivation;
  } | null>(null);
  const [patternHistory, setPatternHistory] = useState<Array<{
    type: 'consistency' | 'preference' | 'value' | 'contradiction' | 'motivation';
    data: ConsistencyPattern | PreferenceIntensity | ValueHierarchy | Contradiction | HiddenMotivation;
    timestamp: Date;
  }>>([]);

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

          // Load pattern data from the engine state
          const engineState = engine.getState();
          setConsistencyPatterns(engineState.consistencyPatterns);
          setPreferenceIntensities(engineState.preferenceIntensities);
          setValueHierarchy(engineState.valueHierarchy);
          setContradictions(engineState.contradictions);
          setHiddenMotivations(engineState.hiddenMotivations);

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
        payloadSize: JSON.stringify(payload).length,
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
        console.warn('Save failed with status:', response.status, '- Error:', errorData);
        console.warn('This is expected if the database table does not exist or if not logged in. Questionnaire will continue working.');

        // Only show error status for non-auth errors to avoid cluttering UI
        if (response.status !== 401) {
          setSaveStatus('error');
          // Auto-clear error after 3 seconds to not clutter UI
          setTimeout(() => setSaveStatus('idle'), 3000);
        } else {
          // For auth errors, just go back to idle
          setSaveStatus('idle');
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Save request was aborted (timeout)');
      } else {
        console.warn('Failed to save state:', error);
      }
      console.warn('Questionnaire will continue working without persistence.');
      setSaveStatus('idle'); // Don't show error, just go back to idle
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
    setIsProcessing(true);
    setProcessingMessage('Analyzing your response...');

    try {
      engine.recordResponse(currentQuestion.id, response, confidenceLevel);
      await new Promise(resolve => setTimeout(resolve, 300));
      setProcessingMessage('Detecting patterns...');
    } catch (error) {
      console.error('Error recording response:', error);
      setIsSubmitting(false);
      setIsProcessing(false);
      return;
    }

    const newInsights = engine.getInsights();
    const previousCount = insights.length;

    await new Promise(resolve => setTimeout(resolve, 300));
    setProcessingMessage('Connecting insights...');

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

    const responseCount = Object.keys(engine.getState().responses).length;
    if (responseCount >= 3) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProcessingMessage('Detecting patterns...');

      const patternAnalysis = engine.getPatternAnalysis();
      const prevConsistency = consistencyPatterns.length;
      const prevPreferences = preferenceIntensities.length;
      const prevContradictions = contradictions.length;
      const prevMotivations = hiddenMotivations.length;

      setConsistencyPatterns(patternAnalysis.consistencyPatterns);
      setPreferenceIntensities(patternAnalysis.preferenceIntensities);
      setValueHierarchy(patternAnalysis.valueHierarchy);
      setContradictions(patternAnalysis.contradictions);
      setHiddenMotivations(patternAnalysis.hiddenMotivations);

      if (patternAnalysis.consistencyPatterns.length > prevConsistency) {
        const newPattern = patternAnalysis.consistencyPatterns[patternAnalysis.consistencyPatterns.length - 1];
        setLatestPattern({ type: 'consistency', data: newPattern });
        setPatternHistory(prev => [...prev, { type: 'consistency', data: newPattern, timestamp: new Date() }]);
        setShowPatternNotification(true);
        setTimeout(() => setShowPatternNotification(false), 6000);
      } else if (patternAnalysis.preferenceIntensities.length > prevPreferences) {
        const newPref = patternAnalysis.preferenceIntensities[patternAnalysis.preferenceIntensities.length - 1];
        if (newPref.intensity === 'strong') {
          setLatestPattern({ type: 'preference', data: newPref });
          setPatternHistory(prev => [...prev, { type: 'preference', data: newPref, timestamp: new Date() }]);
          setShowPatternNotification(true);
          setTimeout(() => setShowPatternNotification(false), 6000);
        }
      } else if (patternAnalysis.contradictions.length > prevContradictions) {
        const newContradiction = patternAnalysis.contradictions[patternAnalysis.contradictions.length - 1];
        setLatestPattern({ type: 'contradiction', data: newContradiction });
        setPatternHistory(prev => [...prev, { type: 'contradiction', data: newContradiction, timestamp: new Date() }]);
        setShowPatternNotification(true);
        setTimeout(() => setShowPatternNotification(false), 6000);
      } else if (patternAnalysis.hiddenMotivations.length > prevMotivations) {
        const newMotivation = patternAnalysis.hiddenMotivations[patternAnalysis.hiddenMotivations.length - 1];
        setLatestPattern({ type: 'motivation', data: newMotivation });
        setPatternHistory(prev => [...prev, { type: 'motivation', data: newMotivation, timestamp: new Date() }]);
        setShowPatternNotification(true);
        setTimeout(() => setShowPatternNotification(false), 6000);
      } else if (patternAnalysis.valueHierarchy && !valueHierarchy && patternAnalysis.valueHierarchy.topValues.length > 0) {
        setLatestPattern({ type: 'value', data: patternAnalysis.valueHierarchy });
        setPatternHistory(prev => [...prev, { type: 'value', data: patternAnalysis.valueHierarchy!, timestamp: new Date() }]);
        setShowPatternNotification(true);
        setTimeout(() => setShowPatternNotification(false), 6000);
      }
    }

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
    await new Promise(resolve => setTimeout(resolve, 200));
    setIsProcessing(false);
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
    // Ensure all analysis is up to date before exporting
    const state = engine.getState();
    console.log('Exporting profile with:', {
      responses: Object.keys(state.responses).length,
      insights: state.discoveredInsights.length,
      synthesizedInsights: state.synthesizedInsights.length,
      patterns: state.consistencyPatterns.length,
      motivations: state.hiddenMotivations.length,
      valueHierarchy: state.valueHierarchy,
      topCareers: topCareers.length,
    });

    const profile = engine.exportProfile();
    console.log('Exported profile:', {
      completion: profile.completion,
      synthesizedInsights: profile.synthesizedInsights.length,
      patterns: profile.patterns.consistencyPatterns.length,
      motivations: profile.patterns.hiddenMotivations.length,
      valueHierarchy: profile.patterns.valueHierarchy,
      topValues: profile.patterns.valueHierarchy?.topValues.length || 0,
    });

    onComplete?.({ ...profile, topCareers: topCareers.slice(0, 7) });
  };


  const getContextualIntro = (question: AdaptiveQuestion): string | null => {
    const responses = engine.getState().responses;
    const recentResponses = Object.entries(responses).slice(-5);

    // Check for related previous answers
    for (const [questionId, response] of recentResponses) {
      const prevQuestion = getQuestionById(questionId);
      if (!prevQuestion) continue;

      // Look for related topics within same area
      if (question.area === prevQuestion.area) {
        // Work style connections
        if (question.text.toLowerCase().includes('routine') &&
            prevQuestion.text.toLowerCase().includes('structure')) {
          return `You mentioned your structure preferences — let's explore routine...`;
        }
        if (question.text.toLowerCase().includes('focus') &&
            prevQuestion.text.toLowerCase().includes('day')) {
          return `Building on how you structure your day...`;
        }
        if (question.text.toLowerCase().includes('energy') &&
            prevQuestion.text.toLowerCase().includes('time')) {
          return `Following up on your time preferences...`;
        }

        // People interaction connections
        if (question.text.toLowerCase().includes('team') &&
            (prevQuestion.text.toLowerCase().includes('help') ||
             prevQuestion.text.toLowerCase().includes('colleague'))) {
          return `You shared how you help colleagues — now about team dynamics...`;
        }
        if (question.text.toLowerCase().includes('conflict') &&
            prevQuestion.text.toLowerCase().includes('team')) {
          return `Continuing on team interactions...`;
        }

        // Problem solving connections
        if (question.text.toLowerCase().includes('solution') &&
            prevQuestion.text.toLowerCase().includes('problem')) {
          return `Based on your problem-solving approach...`;
        }

        // Learning and growth connections
        if (question.text.toLowerCase().includes('learn') &&
            prevQuestion.text.toLowerCase().includes('skill')) {
          return `You mentioned your skills — let's explore learning...`;
        }
        if (question.text.toLowerCase().includes('feedback') &&
            prevQuestion.text.toLowerCase().includes('growth')) {
          return `Following up on your growth preferences...`;
        }

        // Environment connections
        if (question.text.toLowerCase().includes('environment') &&
            prevQuestion.text.toLowerCase().includes('work')) {
          return `Since you mentioned your work style...`;
        }
        if (question.text.toLowerCase().includes('space') &&
            prevQuestion.text.toLowerCase().includes('setting')) {
          return `Building on your setting preferences...`;
        }

        // Values connections
        if (question.text.toLowerCase().includes('value') &&
            prevQuestion.text.toLowerCase().includes('important')) {
          return `You shared what's important to you...`;
        }
        if (question.text.toLowerCase().includes('impact') &&
            prevQuestion.text.toLowerCase().includes('work')) {
          return `Let's explore the impact side of your work...`;
        }
      }

      // Cross-area connections
      if (question.area !== prevQuestion.area) {
        // Connect work style to people interaction
        if (question.area === 'people-interaction' &&
            prevQuestion.area === 'work-style' &&
            response.response === 'flexible-flow') {
          return `You prefer flexible work — let's see how that applies to working with others...`;
        }
        // Connect people interaction to work style
        if (question.area === 'work-style' &&
            prevQuestion.area === 'people-interaction' &&
            String(response.response).includes('solo')) {
          return `You mentioned preferring independent work — let's explore your work style...`;
        }
      }
    }

    // Check for follow-up questions - get specific reason if available
    if (question.followUpConditions && question.followUpConditions.length > 0) {
      // Try to find the most recent response that triggered this follow-up
      const recentQuestionIds = recentResponses.map(([id]) => id);
      for (const [prevQuestionId, response] of recentResponses.reverse()) {
        const prevQuestion = getQuestionById(prevQuestionId);
        if (!prevQuestion?.followUpConditions) continue;

        for (const condition of prevQuestion.followUpConditions) {
          if (condition.if(response.response) && condition.then.includes(question.id)) {
            return `Based on your previous answer...`;
          }
        }
      }
      return `Based on your previous answer...`;
    }

    return null;
  };

  const getWhyAsking = (question: AdaptiveQuestion): string => {
    const areaDescriptions: Record<ExplorationArea, string> = {
      'work-style': 'Your work preferences reveal which environments you\'ll thrive in',
      'people-interaction': 'Understanding how you work with others helps match you to the right team dynamics',
      'problem-solving': 'Your problem-solving approach shows which types of challenges suit you best',
      'creativity': 'Knowing your creative style helps identify roles where innovation matters',
      'structure-flexibility': 'Your preference for structure vs. flexibility indicates compatible work environments',
      'values': 'Understanding what drives you helps match careers aligned with your core values',
      'environment': 'Your environmental preferences reveal where you\'ll feel most comfortable and productive',
      'learning-growth': 'How you learn and grow shows which career paths offer the development you need',
    };

    // Check if it's a follow-up question
    if (question.followUpConditions && question.followUpConditions.length > 0) {
      return 'This helps us understand the nuances of your previous response';
    }

    // Check if we're filling a gap
    const gaps = engine.getGaps();
    const relatedGap = gaps.find(gap => gap.area === question.area);
    if (relatedGap && relatedGap.suggestedQuestions.includes(question.id)) {
      return `This fills a gap in our understanding of your ${getAreaLabel(question.area).toLowerCase()}`;
    }

    return areaDescriptions[question.area] || 'This helps build your career profile';
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
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border-2 border-green-500/30 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              🎉 Assessment Complete!
            </h2>
            <p className="text-green-100 text-lg">
              You&apos;ve discovered {insights.length + synthesizedInsights.length} career insights
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {topCareers.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Your Top Career Matches
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {topCareers.slice(0, 4).map((career, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-green-500/50 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-green-400">#{index + 1}</span>
                            {career.trend === 'rising' && (
                              <span className="text-xs text-green-400">📈 Rising</span>
                            )}
                          </div>
                          <h4 className="text-base font-semibold text-gray-100">{career.careerTitle}</h4>
                        </div>
                        <div className="text-2xl font-bold text-green-400">{Math.round(career.currentScore)}%</div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-300">{career.matchFactors[0]?.factor || 'Strong match'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleComplete}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Full Profile & Insights
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

      {/* Pattern Detection Notification */}
      {showPatternNotification && latestPattern && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-slide-in-right">
          <div className={`rounded-xl shadow-2xl p-4 sm:p-5 max-w-md border-2 relative overflow-hidden ${
            latestPattern.type === 'consistency' ? 'bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 border-purple-400/60' :
            latestPattern.type === 'preference' ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 border-indigo-400/60' :
            latestPattern.type === 'value' ? 'bg-gradient-to-br from-pink-600 via-pink-700 to-pink-800 border-pink-400/60' :
            latestPattern.type === 'contradiction' ? 'bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 border-orange-400/60' :
            'bg-gradient-to-br from-cyan-600 via-cyan-700 to-cyan-800 border-cyan-400/60'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping" />
              <div className="absolute top-4 right-8 w-1.5 h-1.5 bg-white/80 rounded-full animate-ping" style={{ animationDelay: '100ms' }} />
              <div className="absolute top-3 right-12 w-1.5 h-1.5 bg-white/80 rounded-full animate-ping" style={{ animationDelay: '200ms' }} />
            </div>

            <div className="flex items-start gap-3 relative">
              <div className={`p-2.5 rounded-xl animate-pulse-subtle ${
                latestPattern.type === 'consistency' ? 'bg-purple-400/30' :
                latestPattern.type === 'preference' ? 'bg-indigo-400/30' :
                latestPattern.type === 'value' ? 'bg-pink-400/30' :
                latestPattern.type === 'contradiction' ? 'bg-orange-400/30' :
                'bg-cyan-400/30'
              }`}>
                {latestPattern.type === 'consistency' && (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {latestPattern.type === 'preference' && (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                {latestPattern.type === 'value' && (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
                {latestPattern.type === 'contradiction' && (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {latestPattern.type === 'motivation' && (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-white/90 uppercase tracking-wider px-2 py-0.5 bg-white/20 rounded">
                    {latestPattern.type === 'consistency' && '✓ Pattern Detected'}
                    {latestPattern.type === 'preference' && '⚡ Strong Preference'}
                    {latestPattern.type === 'value' && '★ Core Value'}
                    {latestPattern.type === 'contradiction' && '⚠ Interesting Tension'}
                    {latestPattern.type === 'motivation' && '💡 Hidden Driver'}
                  </span>
                </div>
                <p className="text-base text-white font-semibold leading-snug mb-2">
                  {latestPattern.type === 'consistency' && `${(latestPattern.data as ConsistencyPattern).theme.replace('-', ' ')} across ${getAreaLabel((latestPattern.data as ConsistencyPattern).area)}`}
                  {latestPattern.type === 'preference' && (latestPattern.data as PreferenceIntensity).preference}
                  {latestPattern.type === 'value' && `Top value: ${(latestPattern.data as ValueHierarchy).topValues[0]?.value}`}
                  {latestPattern.type === 'contradiction' && (latestPattern.data as Contradiction).possibleReasons[0]}
                  {latestPattern.type === 'motivation' && (latestPattern.data as HiddenMotivation).motivation}
                </p>

                {latestPattern.type === 'consistency' && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-white/20 rounded-full h-2.5 border border-white/20">
                      <div
                        className="bg-gradient-to-r from-purple-300 to-purple-400 h-full rounded-full transition-all duration-700 shadow-lg shadow-purple-400/50 animate-grow-width"
                        style={{ width: `${(latestPattern.data as ConsistencyPattern).confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/90 font-bold px-2 py-0.5 bg-white/20 rounded-full">
                      {Math.round((latestPattern.data as ConsistencyPattern).confidence * 100)}%
                    </span>
                  </div>
                )}

                {latestPattern.type === 'preference' && (
                  <div className="mt-2 text-xs text-white/80">
                    <span className={`px-2 py-1 rounded-full font-semibold ${
                      (latestPattern.data as PreferenceIntensity).intensity === 'strong' ? 'bg-indigo-400/30 text-white' :
                      (latestPattern.data as PreferenceIntensity).intensity === 'moderate' ? 'bg-indigo-400/20 text-white/90' :
                      'bg-indigo-400/10 text-white/70'
                    }`}>
                      {(latestPattern.data as PreferenceIntensity).intensity.toUpperCase()} INTENSITY
                    </span>
                  </div>
                )}

                {latestPattern.type === 'contradiction' && (
                  <div className="mt-2 text-xs text-orange-100">
                    This isn&apos;t necessarily bad - it might reveal contextual preferences!
                  </div>
                )}

                {latestPattern.type === 'motivation' && (
                  <div className="mt-2 text-xs text-cyan-100">
                    {(latestPattern.data as HiddenMotivation).insight}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs text-white/80">
                    Detected from {Object.keys(engine.getState().responses).length} responses
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPatternNotification(false)}
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
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <div className="text-2xl font-bold text-purple-400">{Object.keys(engine.getState().responses).length}</div>
                </div>
                <div className="text-xs text-gray-500">intelligence gathered</div>
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
              {evolutionSummary && confidenceEvolutions.length > 0 && (
                <button
                  onClick={() => setShowConfidenceWidget(!showConfidenceWidget)}
                  className="border-l border-gray-700 pl-4 hover:bg-gray-800/50 px-3 py-2 rounded-lg transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <div className="text-2xl font-bold text-cyan-400">{Math.round(evolutionSummary.selfDiscoveryProgress * 100)}%</div>
                  </div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-400">confidence</div>
                </button>
              )}
              {patternHistory.length > 0 && (
                <button
                  onClick={() => setShowPatternHistory(!showPatternHistory)}
                  className="border-l border-gray-700 pl-4 hover:bg-gray-800/50 px-3 py-2 rounded-lg transition-all group relative"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-2xl font-bold text-purple-400">{patternHistory.length}</div>
                  </div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-400">patterns</div>
                  {patternHistory.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                  )}
                </button>
              )}
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

      {/* Compact Confidence Evolution Widget */}
      {showConfidenceWidget && evolutionSummary && confidenceEvolutions.length > 0 && (
        <div className="mb-6 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-cyan-900/30 rounded-xl border-2 border-cyan-500/40 p-5 animate-slide-in-right">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-cyan-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Confidence Evolution
            </h3>
            <button
              onClick={() => setShowConfidenceWidget(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-green-500/30">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {confidenceEvolutions.filter(e => e.trend === 'strengthening').length}
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Trending Stronger
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-orange-500/30">
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {confidenceEvolutions.filter(e => e.trend === 'weakening').length}
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Needs Exploration
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {evolutionSummary.validatedHunches}
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Validated
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-cyan-500/30">
              <div className="text-2xl font-bold text-cyan-400 mb-1">
                {Math.round(evolutionSummary.selfDiscoveryProgress * 100)}%
              </div>
              <div className="text-xs text-gray-400">Overall Score</div>
            </div>
          </div>

          {/* Trending Insights */}
          <div className="space-y-2">
            {confidenceEvolutions
              .filter(e => e.trend === 'strengthening' || e.trend === 'weakening')
              .slice(0, 3)
              .map((evolution, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    evolution.trend === 'strengthening'
                      ? 'bg-green-900/20 border-green-700/30'
                      : 'bg-orange-900/20 border-orange-700/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {evolution.trend === 'strengthening' ? (
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 mb-1">{evolution.insightText}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={evolution.trend === 'strengthening' ? 'text-green-400' : 'text-orange-400'}>
                          {Math.round(evolution.initialConfidence * 100)}% → {Math.round(evolution.currentConfidence * 100)}%
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">{evolution.confidenceHistory.length} updates</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <button
            onClick={() => {
              setShowConfidenceWidget(false);
              const evolutionSection = document.getElementById('confidence-evolution-full');
              evolutionSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mt-4 w-full py-2 text-sm text-cyan-300 hover:text-cyan-200 font-medium flex items-center justify-center gap-1 hover:bg-cyan-500/10 rounded-lg transition-all"
          >
            View Full Confidence Evolution
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Pattern History Panel */}
      {showPatternHistory && patternHistory.length > 0 && (
        <div className="mb-6 bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-purple-900/30 rounded-xl border-2 border-purple-500/40 p-5 animate-slide-in-right">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-purple-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pattern Recognition
            </h3>
            <button
              onClick={() => setShowPatternHistory(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-300 mb-4">
            As you answer questions, the system detects patterns in your responses. These reveal consistent themes, strong preferences, and hidden motivations.
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {patternHistory.slice().reverse().map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  item.type === 'consistency' ? 'bg-purple-900/20 border-purple-500' :
                  item.type === 'preference' ? 'bg-indigo-900/20 border-indigo-500' :
                  item.type === 'value' ? 'bg-pink-900/20 border-pink-500' :
                  item.type === 'contradiction' ? 'bg-orange-900/20 border-orange-500' :
                  'bg-cyan-900/20 border-cyan-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    item.type === 'consistency' ? 'bg-purple-500/20' :
                    item.type === 'preference' ? 'bg-indigo-500/20' :
                    item.type === 'value' ? 'bg-pink-500/20' :
                    item.type === 'contradiction' ? 'bg-orange-500/20' :
                    'bg-cyan-500/20'
                  }`}>
                    {item.type === 'consistency' && (
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {item.type === 'preference' && (
                      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    {item.type === 'value' && (
                      <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    {item.type === 'contradiction' && (
                      <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    {item.type === 'motivation' && (
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white/70 uppercase tracking-wider">
                        {item.type === 'consistency' && 'Consistency Pattern'}
                        {item.type === 'preference' && 'Strong Preference'}
                        {item.type === 'value' && 'Core Value'}
                        {item.type === 'contradiction' && 'Interesting Tension'}
                        {item.type === 'motivation' && 'Hidden Motivation'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-sm text-gray-200 font-medium mb-2">
                      {item.type === 'consistency' && `${(item.data as ConsistencyPattern).theme.replace('-', ' ')} pattern in ${getAreaLabel((item.data as ConsistencyPattern).area)}`}
                      {item.type === 'preference' && (item.data as PreferenceIntensity).preference}
                      {item.type === 'value' && `Core value: ${(item.data as ValueHierarchy).topValues[0]?.value}`}
                      {item.type === 'contradiction' && (item.data as Contradiction).possibleReasons[0]}
                      {item.type === 'motivation' && (item.data as HiddenMotivation).motivation}
                    </p>

                    {item.type === 'consistency' && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 rounded-full h-1.5">
                          <div
                            className="bg-purple-400 h-full rounded-full"
                            style={{ width: `${(item.data as ConsistencyPattern).confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-purple-300 font-semibold">
                          {Math.round((item.data as ConsistencyPattern).confidence * 100)}%
                        </span>
                      </div>
                    )}

                    {item.type === 'preference' && (
                      <div className="text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          (item.data as PreferenceIntensity).intensity === 'strong' ? 'bg-indigo-500/30 text-indigo-200' :
                          (item.data as PreferenceIntensity).intensity === 'moderate' ? 'bg-indigo-500/20 text-indigo-300' :
                          'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          {(item.data as PreferenceIntensity).intensity.toUpperCase()}
                        </span>
                      </div>
                    )}

                    {item.type === 'motivation' && (
                      <p className="text-xs text-cyan-200 italic">
                        {(item.data as HiddenMotivation).insight}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
      <div className="bg-gray-800 rounded-lg border border-blue-700/30 p-4 sm:p-6 lg:p-8 mb-6 relative">
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-gray-900/95 rounded-lg z-10 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <svg className="animate-spin h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div>
                <div className="text-lg font-semibold text-blue-300">{processingMessage}</div>
                <div className="text-xs text-gray-400 mt-1">AI engine working...</div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 px-6 py-3 bg-gray-800/60 rounded-lg border border-blue-500/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-300">Pattern detection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <span className="text-xs text-gray-300">Insight synthesis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                <span className="text-xs text-gray-300">Career matching</span>
              </div>
            </div>
          </div>
        )}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="h-5 sm:h-6 w-1 bg-blue-500 rounded-full"></div>
            <span className="text-base sm:text-lg font-bold text-blue-400">
              {getAreaLabel(currentQuestion.area)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs flex items-center gap-1.5">
                {currentQuestion.type === 'scale' && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                )}
                {currentQuestion.type === 'multiple-choice' && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {currentQuestion.type === 'scenario' && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                )}
                {currentQuestion.type === 'open-ended' && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )}
                <span>
                  {currentQuestion.type === 'scale' && 'Rate'}
                  {currentQuestion.type === 'multiple-choice' && 'Choose one'}
                  {currentQuestion.type === 'scenario' && 'Scenario'}
                  {currentQuestion.type === 'open-ended' && 'Your thoughts'}
                </span>
              </span>
              {currentQuestion.followUpConditions && currentQuestion.followUpConditions.length > 0 && (
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  Smart Question
                </span>
              )}
              {Object.keys(engine.getState().responses).length > 0 && Object.keys(engine.getState().responses).length % 5 === 0 && (
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-900/30 text-green-300 rounded-full text-xs flex items-center gap-1.5 animate-pulse-subtle">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Milestone Reached
                </span>
              )}
            </div>
            {getContextualIntro(currentQuestion) && (
              <div className="mb-3 flex items-center gap-2 text-sm text-blue-300/80 italic">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {getContextualIntro(currentQuestion)}
              </div>
            )}
            <h2 className="text-lg sm:text-xl font-semibold text-gray-100 leading-relaxed">
              {currentQuestion.text}
            </h2>
            <details className="mt-3 group">
              <summary className="text-xs text-gray-500 hover:text-gray-400 cursor-pointer flex items-center gap-1.5 w-fit">
                <svg className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Why we&apos;re asking this
              </summary>
              <p className="mt-2 text-xs text-gray-400 bg-blue-900/10 border border-blue-700/20 rounded-lg p-3 leading-relaxed">
                {getWhyAsking(currentQuestion)}
              </p>
            </details>
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
                  ].map((level) => (
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
        <div className="mb-6 bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-blue-900/20 rounded-xl border-2 border-blue-500/30 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h3 className="text-lg font-bold text-blue-100">Latest Insights Discovered</h3>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold">
                {insights.length + synthesizedInsights.length} total
              </span>
              <div className="flex items-center gap-1.5 ml-2 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generated from your responses</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[...synthesizedInsights, ...insights]
              .slice(-3)
              .reverse()
              .map((insight, index) => (
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
        <div id="confidence-evolution-full" className="mb-6">
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
        <div className="mt-6 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-blue-900/30 rounded-xl border-2 border-blue-500/40 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-gray-100 flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span>Areas to Explore</span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold">
                {gaps.length} {gaps.length === 1 ? 'opportunity' : 'opportunities'}
              </span>
            </h3>
          </div>
          <div className="space-y-4">
            {gaps.map((gap, index) => {
              const explorationProgress = engine.getExplorationProgress();
              const areaProgress = explorationProgress.find(p => p.area === gap.area);
              const confidencePercentage = areaProgress ? Math.min(100, (areaProgress.depth / areaProgress.totalQuestions) * 100) : 0;

              // Calculate potential impact on career matching
              const impactScore = gap.importance === 'high' ? 85 : gap.importance === 'medium' ? 60 : 35;

              return (
                <div
                  key={index}
                  className="bg-gray-800/60 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-all p-5 group"
                >
                  {/* Header with importance and impact */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        gap.importance === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        gap.importance === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {gap.importance} priority
                      </div>
                      <div className="text-xs text-gray-400">
                        {getAreaLabel(gap.area)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Potential Impact</div>
                        <div className={`text-lg font-bold ${
                          impactScore >= 80 ? 'text-green-400' :
                          impactScore >= 50 ? 'text-yellow-400' :
                          'text-blue-400'
                        }`}>
                          +{impactScore}%
                        </div>
                      </div>
                      <div className="relative w-12 h-12">
                        <svg className="transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#374151"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#60A5FA"
                            strokeWidth="3"
                            strokeDasharray={`${confidencePercentage}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-400">
                          {Math.round(confidencePercentage)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gap description */}
                  <p className="text-base text-gray-200 mb-4 font-medium">{gap.gap}</p>

                  {/* Suggested questions */}
                  {gap.suggestedQuestions.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-semibold text-purple-300">Answer these to close the gap:</span>
                      </div>
                      <div className="space-y-2">
                        {gap.suggestedQuestions.slice(0, 3).map((questionId, qIndex) => {
                          const question = getQuestionById(questionId);
                          if (!question) return null;

                          return (
                            <button
                              key={qIndex}
                              onClick={() => {
                                // Check if already answered
                                const state = engine.getState();
                                if (state.responses[questionId]) {
                                  alert('You\'ve already answered this question!');
                                  return;
                                }
                                // Load this specific question
                                setCurrentQuestions([question]);
                                setCurrentQuestionIndex(0);
                                resetResponse();
                                // Scroll to question
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="w-full text-left p-3 bg-purple-900/20 hover:bg-purple-900/40 border border-purple-700/30 hover:border-purple-500/50 rounded-lg transition-all group/question"
                            >
                              <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5 group-hover/question:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-200 group-hover/question:text-purple-200 transition-colors">{question.text}</p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-xs text-purple-400/60">{question.type}</span>
                                    {engine.getState().responses[questionId] && (
                                      <span className="text-xs text-green-400 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Answered
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {gap.suggestedQuestions.length > 3 && (
                        <p className="text-xs text-gray-500 mt-2 ml-6">+{gap.suggestedQuestions.length - 3} more questions available</p>
                      )}
                    </div>
                  )}

                  {/* Action hint */}
                  <div className="mt-4 pt-3 border-t border-gray-700/50 flex items-center gap-2 text-xs text-gray-400">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Click any question above to answer it now and improve your career matches</span>
                  </div>
                </div>
              );
            })}
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
              explorationProgress={explorationProgress.map(p => ({
                ...p,
                label: getAreaLabel(p.area),
              }))}
              gaps={gaps}
              totalResponses={Object.keys(engine.getState().responses).length}
            />
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { AdaptiveQuestionnaire } from '@/components/AdaptiveQuestionnaire';
import { AdaptiveQuestioningEngine } from '@/lib/adaptive-questions/adaptive-engine';
import { CareerFitScore } from '@/lib/matching/realtime-career-matcher';
import { CareerPathVisualization } from '@/components/CareerPathVisualization';
import { generateCareerPaths } from '@/lib/career-paths/career-path-generator';
import { ActionPlan } from '@/components/ActionPlan';
import { generateActionPlan } from '@/lib/action-plan/action-plan-generator';
import { SkillsGapAnalysis } from '@/components/SkillsGapAnalysis';
import { SaveAssessmentDialog } from '@/components/SaveAssessmentDialog';
import { ExitWarningDialog } from '@/components/ExitWarningDialog';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

type ExportedProfile = ReturnType<AdaptiveQuestioningEngine['exportProfile']> & {
  topCareers?: CareerFitScore[];
};

function ExplorePageContent() {
  const [showResults, setShowResults] = useState(false);
  const [profile, setProfile] = useState<ExportedProfile | null>(null);
  const [questionnaireKey, setQuestionnaireKey] = useState(0);
  const [expandedInsights, setExpandedInsights] = useState<Set<number>>(new Set());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hasUnsavedResults, setHasUnsavedResults] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    findings: false,
    recommendations: false,
    actionPlan: false,
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  // Clear saved state if starting new assessment
  useEffect(() => {
    const isNew = searchParams.get('new') === 'true';
    if (isNew) {
      // Clear the saved questionnaire state
      fetch('/api/questionnaire', { method: 'DELETE' })
        .then(() => {
          console.log('Cleared saved state for new assessment');
          // Remove the query parameter from URL
          router.replace('/explore');
        })
        .catch(err => console.error('Failed to clear saved state:', err));
    }
  }, [searchParams, router]);

  const handleComplete = (exportedProfile: ExportedProfile) => {
    setProfile(exportedProfile);
    setShowResults(true);
    setHasUnsavedResults(true);
  };

  const toggleInsightExpansion = (index: number) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const careerPaths = useMemo(() => {
    if (!profile || !profile.topCareers) return [];
    return generateCareerPaths(
      profile.topCareers,
      profile.insights,
      profile.analysis.strengths
    );
  }, [profile]);

  // Warning effect for unsaved results
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedResults && showResults) {
        e.preventDefault();
        e.returnValue = 'You have unsaved assessment results. Are you sure you want to leave without saving?';
        return e.returnValue;
      }
    };

    const handlePopState = () => {
      if (hasUnsavedResults && showResults) {
        setShowExitWarning(true);
        return false;
      }
    };

    if (hasUnsavedResults && showResults) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedResults, showResults]);

  const handleSaveAssessment = async (title: string, description: string) => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/assessment-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          profile
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save assessment');
      }

      setSaveMessage('Assessment saved successfully!');
      setShowSaveDialog(false);
      setHasUnsavedResults(false); // Mark as saved

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving assessment:', error);
      setSaveMessage('Failed to save assessment. Please try again.');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExitSave = () => {
    setShowExitWarning(false);
    setShowSaveDialog(true);
  };

  const handleExitLeave = () => {
    setHasUnsavedResults(false);
    setShowExitWarning(false);
    // Allow the navigation to proceed
    window.history.back();
  };

  const handleExitCancel = () => {
    setShowExitWarning(false);
  };

  if (showResults && profile) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation
          title="Your Career Profile"
          subtitle="Based on adaptive exploration"
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Save Assessment Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSaveDialog(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  hasUnsavedResults
                    ? 'bg-yellow-600 hover:bg-yellow-500 text-white ring-2 ring-yellow-400/50'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {hasUnsavedResults ? 'Save Assessment (Unsaved!)' : 'Save Assessment'}
              </button>
              {saveMessage && (
                <div className={`px-3 py-1 rounded-lg text-sm ${
                  saveMessage.includes('success')
                    ? 'bg-green-900/50 text-green-400 border border-green-700/50'
                    : 'bg-red-900/50 text-red-400 border border-red-700/50'
                }`}>
                  {saveMessage}
                </div>
              )}
            </div>
            <Link
              href="/assessments"
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
            >
              View Saved Assessments →
            </Link>
          </div>

          {/* Comprehensive Assessment Overview */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-gray-700 p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-100 mb-4">Your Career Assessment Results</h2>
              <div className="max-w-4xl mx-auto space-y-4">
                <p className="text-lg text-gray-300 leading-relaxed">
                  Based on your responses, we&apos;ve identified {profile.synthesizedInsights.length} key patterns that reveal your unique professional identity.
                  {profile.completion >= 80 ? (
                    <span> Your comprehensive profile shows strong alignment in {profile.patterns.consistencyPatterns?.length || 0} areas, suggesting clear career direction.</span>
                  ) : (
                    <span> While your profile is {profile.completion}% complete, we&apos;ve discovered significant insights about your work preferences and motivations.</span>
                  )}
                </p>

                <p className="text-gray-400 leading-relaxed">
                  {profile.synthesizedInsights.length > 0 && (
                    <>
                      Your responses reveal {profile.synthesizedInsights.find(i => i.type === 'cross-domain') ? 'cross-domain interests that suggest versatile career options' : 'focused preferences that indicate specialized career paths'}.
                      {profile.patterns.hiddenMotivations?.length > 0 && (
                        <span> We&apos;ve uncovered {profile.patterns.hiddenMotivations.length} core motivations that will be essential for your career satisfaction.</span>
                      )}
                      {profile.topCareers && profile.topCareers.length > 0 && (
                        <span> This analysis has generated {profile.topCareers.length} personalized career recommendations with match scores ranging from {Math.round(Math.min(...profile.topCareers.map(c => c.currentScore)) * 100)}% to {Math.round(Math.max(...profile.topCareers.map(c => c.currentScore)) * 100)}%.</span>
                      )}
                    </>
                  )}
                </p>

                {profile.patterns.valueHierarchy?.coreMotivation && (
                  <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30 mt-6">
                    <p className="text-blue-100 italic text-center">
                      <span className="text-blue-400 font-medium">Your Core Career Driver:</span> &ldquo;{profile.patterns.valueHierarchy.coreMotivation}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Assessment Findings</h3>
                <p className="text-gray-400 text-sm mb-1">{profile.synthesizedInsights.length} key insights discovered</p>
                <p className="text-blue-400 text-sm">{profile.completion}% profile completion</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Career Recommendations</h3>
                <p className="text-gray-400 text-sm mb-1">{profile.topCareers?.length || 0} career matches identified</p>
                <p className="text-green-400 text-sm">Based on your unique profile</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Action Plan</h3>
                <p className="text-gray-400 text-sm mb-1">Next steps for career growth</p>
                <p className="text-orange-400 text-sm">Concrete steps to move forward</p>
              </div>
            </div>
          </div>

          {/* Section 1: Your Assessment Findings */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6">
            <button
              onClick={() => toggleSection('findings')}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-100">Your Assessment Findings</h2>
                  <div className="text-gray-400 text-sm mt-2 space-y-2 max-w-lg">
                    <p>
                      <span className="text-gray-300 font-medium">{profile.synthesizedInsights.length} Key Insights:</span> {
                        profile.synthesizedInsights.length > 3 ? 'Your responses show complex, multi-faceted career interests with strong patterns across different work domains.' :
                        profile.synthesizedInsights.length > 1 ? 'Clear patterns emerge showing your core work preferences and ideal environment characteristics.' :
                        'Initial insights reveal your primary work motivations and preferred working style.'
                      }
                    </p>
                    <p>
                      <span className="text-gray-300 font-medium">Profile Strength:</span> {
                        profile.completion >= 90 ? 'Comprehensive analysis with high confidence in recommendations.' :
                        profile.completion >= 70 ? 'Strong profile foundation with reliable insights and clear direction.' :
                        profile.completion >= 50 ? 'Solid baseline with room for additional depth through more responses.' :
                        'Initial profile established, consider completing more questions for enhanced insights.'
                      }
                    </p>
                    {profile.patterns.hiddenMotivations?.length > 0 && (
                      <p>
                        <span className="text-gray-300 font-medium">Core Motivations:</span> {profile.patterns.hiddenMotivations.length} deep-level drivers identified that will be crucial for long-term career satisfaction.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {expandedSections.findings ?
                <ChevronDownIcon className="w-5 h-5 text-gray-400" /> :
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              }
            </button>

            {expandedSections.findings && (
              <div className="px-6 pb-6">
                <div className="border-t border-gray-700 pt-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        {profile.completion}%
                      </div>
                      <div className="text-xs text-gray-400">Profile Complete</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {profile.synthesizedInsights.length}
                      </div>
                      <div className="text-xs text-gray-400">Key Insights</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-400 mb-1">
                        {profile.patterns.hiddenMotivations.length}
                      </div>
                      <div className="text-xs text-gray-400">Core Motivations</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-300 mb-1">
                        {Math.round((profile.insights.reduce((sum, i) => sum + i.confidence, 0) / profile.insights.length) * 100) || 0}%
                      </div>
                      <div className="text-xs text-gray-400">Confidence</div>
                    </div>
                  </div>

                  {/* Detailed Insights */}
                  {profile.synthesizedInsights && profile.synthesizedInsights.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-100 mb-4">Cross-Domain Insights</h3>
              <div className="grid grid-cols-1 gap-4">
                {profile.synthesizedInsights.map((insight, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-900/40 to-green-900/40 rounded-lg border-2 border-blue-600/60 p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                            insight.type === 'cross-domain'
                              ? 'bg-blue-600 text-white'
                              : insight.type === 'paradox'
                              ? 'bg-orange-600 text-white'
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
                        <h3 className="text-xl font-bold text-gray-100 mb-2">{insight.title}</h3>
                        <p className="text-gray-300 leading-relaxed">{insight.description}</p>

                        {/* Expand/Collapse Button */}
                        <button
                          onClick={() => toggleInsightExpansion(index)}
                          className="mt-3 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <span>
                            {expandedInsights.has(index) ? 'Show less' : 'Learn more about this insight type'}
                          </span>
                          <svg
                            className={`w-4 h-4 transition-transform ${expandedInsights.has(index) ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Collapsible Content */}
                        {expandedInsights.has(index) && (
                          <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 space-y-4">
                            <p className="text-sm text-gray-300">
                              <strong>What this means:</strong> {
                                insight.type === 'cross-domain'
                                  ? 'This insight reveals connections between different career areas in your responses, showing how your interests span multiple domains and suggesting hybrid career paths.'
                                  : insight.type === 'paradox'
                                  ? 'This insight identifies contradictory preferences in your responses, which often reveal the depth and complexity of your career interests rather than confusion.'
                                  : insight.type === 'nuanced-preference'
                                  ? 'This insight captures complex preferences that go beyond simple yes/no choices, reflecting the sophisticated way you think about career decisions.'
                                  : 'This insight represents additional behavioral patterns detected in your responses that provide valuable context for your career exploration.'
                              }
                            </p>

                            <div>
                              <h4 className="text-sm font-semibold text-blue-400 mb-2">Source Areas:</h4>
                              <div className="flex flex-wrap gap-2">
                                {insight.sourceAreas.map((area, i) => (
                                  <span key={i} className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs font-medium">
                                    {area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="bg-gray-900/50 rounded-lg p-4 border border-green-700/30">
                              <h4 className="text-sm font-semibold text-green-400 mb-2">Career Implications:</h4>
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
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Your Career Recommendations */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6">
            <button
              onClick={() => toggleSection('recommendations')}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-100">Your Career Recommendations</h2>
                  <div className="text-gray-400 text-sm mt-2 space-y-2 max-w-lg">
                    <p>
                      <span className="text-gray-300 font-medium">{profile.topCareers?.length || 0} Career Matches:</span> {
                        profile.topCareers && profile.topCareers.length > 0 ? (
                          <>
                            Ranging from {Math.round(Math.min(...profile.topCareers.map(c => c.currentScore)) * 100)}% to {Math.round(Math.max(...profile.topCareers.map(c => c.currentScore)) * 100)}% compatibility.
                            {profile.topCareers.filter(c => c.currentScore >= 0.8).length > 0 ? ` ${profile.topCareers.filter(c => c.currentScore >= 0.8).length} high-confidence matches (80%+) identified.` :
                             profile.topCareers.filter(c => c.currentScore >= 0.7).length > 0 ? ` ${profile.topCareers.filter(c => c.currentScore >= 0.7).length} strong matches (70%+) with good alignment.` :
                             ' Several promising directions identified for exploration.'}
                          </>
                        ) : 'Career matching in progress based on your assessment responses.'
                      }
                    </p>
                    {profile.topCareers && profile.topCareers.length > 0 && (
                      <p>
                        <span className="text-gray-300 font-medium">Top Categories:</span> {
                          Array.from(new Set(profile.topCareers.slice(0, 3).map(c => c.careerCategory))).join(', ')
                        } show strongest alignment with your interests and work style preferences.
                      </p>
                    )}
                    <p>
                      <span className="text-gray-300 font-medium">Match Basis:</span> Recommendations combine your assessment insights, work preferences, stated interests, and career exploration patterns for personalized results.
                    </p>
                  </div>
                </div>
              </div>
              {expandedSections.recommendations ?
                <ChevronDownIcon className="w-5 h-5 text-gray-400" /> :
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              }
            </button>

            {expandedSections.recommendations && (
              <div className="px-6 pb-6">
                <div className="border-t border-gray-700 pt-6">
                  {profile.topCareers && profile.topCareers.length > 0 ? (
                    <div className="space-y-4">
                      {profile.topCareers.map((career, index) => (
                        <div key={index} className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-600/30 p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-lg font-bold text-gray-100 mb-1">{career.careerTitle}</h4>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-green-400 font-medium">{career.careerCategory}</span>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-400">{Math.round(career.currentScore * 100)}% match</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.round(career.currentScore * 5) ? 'text-green-400' : 'text-gray-600'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h5 className="text-sm font-semibold text-gray-100">Why this fits you:</h5>
                            {career.matchFactors.map((factor, i) => (
                              <div key={i} className="flex items-start gap-3 text-sm">
                                <span className="text-green-400 mt-0.5 text-xs">▶</span>
                                <span className="text-gray-300">{factor.factor}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No career recommendations available for this assessment.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Your Career Path */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6">
            <button
              onClick={() => toggleSection('actionPlan')}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-100">Your Career Path</h2>
                  <div className="text-gray-400 text-sm mt-2 space-y-2 max-w-lg">
                    <p>
                      <span className="text-gray-300 font-medium">Skills Development:</span> {
                        profile.analysis?.strengths?.length > 0 ?
                          `Build on ${profile.analysis.strengths.length} identified strengths while addressing key skill gaps for your target roles.` :
                          'Personalized skill development plan based on your career goals and current capabilities.'
                      }
                    </p>
                    {profile.topCareers && profile.topCareers.length > 0 && (
                      <p>
                        <span className="text-gray-300 font-medium">Career Pathways:</span> {
                          careerPaths.length > 0 ?
                            `${careerPaths.length} potential career trajectories mapped, showing progression steps and timeline estimates.` :
                            'Detailed career progression pathways for your recommended roles, including alternative routes.'
                        }
                      </p>
                    )}
                    <p>
                      <span className="text-gray-300 font-medium">Implementation Focus:</span> Prioritized actions including immediate steps (0-3 months), medium-term development (3-12 months), and long-term career goals (1-3 years).
                    </p>
                    <p>
                      <span className="text-gray-300 font-medium">Success Metrics:</span> Clear milestones and success indicators to track your progress toward your ideal career position and professional growth.
                    </p>
                  </div>
                </div>
              </div>
              {expandedSections.actionPlan ?
                <ChevronDownIcon className="w-5 h-5 text-gray-400" /> :
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              }
            </button>

            {expandedSections.actionPlan && (
              <div className="px-6 pb-6">
                <div className="border-t border-gray-700 pt-6">
                  {/* Skills Gap Analysis */}
                  {profile.topCareers && profile.topCareers.length > 0 && (
                    <div className="mb-8">
                      <SkillsGapAnalysis
                        topCareers={profile.topCareers}
                        userStrengths={profile.analysis.strengths}
                        userExperience={[]}
                      />
                    </div>
                  )}

                  {/* Career Roadmap */}
                  {careerPaths.length > 0 && (
                    <div className="mb-8">
                      <CareerPathVisualization trajectories={careerPaths} />
                    </div>
                  )}

                  {/* Action Plan Component */}
                  <ActionPlan
                    actionPlan={generateActionPlan(profile)}
                    onRestartExploration={async () => {
                      if (confirm('Are you sure you want to restart? This will clear all your responses and start fresh.')) {
                        try {
                          // Clear database state
                          await fetch('/api/questionnaire', { method: 'DELETE' });
                          // Reset local state
                          setShowResults(false);
                          setProfile(null);
                          setQuestionnaireKey(prev => prev + 1);
                          setHasUnsavedResults(false);
                        } catch (error) {
                          console.error('Failed to clear questionnaire:', error);
                          // Still reset even if delete fails
                          setShowResults(false);
                          setProfile(null);
                          setQuestionnaireKey(prev => prev + 1);
                          setHasUnsavedResults(false);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Save Assessment Dialog */}
        <SaveAssessmentDialog
          isOpen={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          onSave={handleSaveAssessment}
          isSaving={isSaving}
        />

        {/* Exit Warning Dialog */}
        <ExitWarningDialog
          isOpen={showExitWarning}
          onSave={handleExitSave}
          onLeave={handleExitLeave}
          onCancel={handleExitCancel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title="Self Discovery"
        subtitle="Discover your hidden interests and strengths"
      />

      <main>
        <AdaptiveQuestionnaire
          key={questionnaireKey}
          onComplete={handleComplete}
        />
      </main>

    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950">
        <Navigation
          title="Self Discovery"
          subtitle="Discover your hidden interests and strengths"
        />
        <main className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading...</div>
        </main>
      </div>
    }>
      <ExplorePageContent />
    </Suspense>
  );
}

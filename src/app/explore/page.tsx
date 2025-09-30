'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { AdaptiveQuestionnaire } from '@/components/AdaptiveQuestionnaire';
import { AdaptiveQuestioningEngine } from '@/lib/adaptive-questions/adaptive-engine';
import { CareerFitScore } from '@/lib/matching/realtime-career-matcher';
import { SaveAssessmentDialog } from '@/components/SaveAssessmentDialog';
import { ExitWarningDialog } from '@/components/ExitWarningDialog';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { discoverJobFunctions, JobFunction } from '@/lib/matching/job-function-discovery';
import { UserProfile } from '@/types/user-profile';

type ExportedProfile = ReturnType<AdaptiveQuestioningEngine['exportProfile']> & {
  topCareers?: CareerFitScore[];
};

function ExplorePageContent() {
  const [hasStarted, setHasStarted] = useState(false);
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
    jobSearch: false,
  });
  const [jobFunctions, setJobFunctions] = useState<JobFunction[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Load user profile to inform assessment
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.profile);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    }
    loadUserProfile();
  }, []);

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

    // Discover job functions based on profile
    const functions = discoverJobFunctions(exportedProfile);
    setJobFunctions(functions);

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
              <h2 className="text-3xl font-bold text-gray-100 mb-4">Alright, Here's What We Found Out About You</h2>
              <div className="max-w-4xl mx-auto space-y-4">
                <p className="text-lg text-gray-300 leading-relaxed">
                  Based on your answers, we&apos;ve spotted {profile.synthesizedInsights.length} patterns that basically screamed &ldquo;{profile.completion >= 80 ? 'I know exactly what I want' : 'I\'m figuring this out and that\'s totally fine'}.&rdquo;
                  {profile.completion >= 80 ? (
                    <span> You&apos;ve got strong vibes in {profile.patterns.consistencyPatterns?.length || 0} areas, which means you&apos;re actually way more decisive than you think.</span>
                  ) : (
                    <span> You&apos;re {profile.completion}% of the way there, and honestly? We&apos;ve already learned enough to point you in the right direction.</span>
                  )}
                </p>

                <p className="text-gray-400 leading-relaxed">
                  {profile.synthesizedInsights.length > 0 && (
                    <>
                      Plot twist: your answers show {profile.synthesizedInsights.find(i => i.type === 'cross-domain') ? 'you\'re into multiple things (which is good because job titles are made up anyway)' : 'you know what you like, and that focus is actually your superpower'}.
                      {profile.patterns.hiddenMotivations?.length > 0 && (
                        <span> We also uncovered {profile.patterns.hiddenMotivations.length} things that really matter to you deep down—the stuff that&apos;ll make you not hate Mondays.</span>
                      )}
                      {profile.topCareers && profile.topCareers.length > 0 && (
                        <span> Oh, and we found {profile.topCareers.length} job titles that fit you anywhere from {Math.round(Math.min(...profile.topCareers.map(c => c.currentScore)) * 100)}% to {Math.round(Math.max(...profile.topCareers.map(c => c.currentScore)) * 100)}% (no job is perfect, but these are pretty close).</span>
                      )}
                    </>
                  )}
                </p>

                {profile.patterns.valueHierarchy?.coreMotivation && (
                  <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30 mt-6">
                    <p className="text-blue-100 italic text-center">
                      <span className="text-blue-400 font-medium">The thing that actually drives you:</span> &ldquo;{profile.patterns.valueHierarchy.coreMotivation}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">The Big Picture</h3>
                <p className="text-gray-400 text-sm mb-1">{jobFunctions.length} types of work you'd probably enjoy</p>
                <p className="text-blue-400 text-sm">The "what kind of stuff do I do" answer</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Actual Job Titles</h3>
                <p className="text-gray-400 text-sm mb-1">{profile.topCareers?.length || 0} real roles to search for</p>
                <p className="text-green-400 text-sm">Copy these into LinkedIn</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Start Applying</h3>
                <p className="text-gray-400 text-sm mb-1">Like, actually apply</p>
                <p className="text-orange-400 text-sm">We'll help you search</p>
              </div>
            </div>
          </div>

          {/* Encouraging Note */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-600/30 p-6 mb-6 text-center">
            <p className="text-blue-100 text-lg leading-relaxed">
              <span className="font-semibold text-blue-300">Quick reminder:</span> You don&apos;t need it all figured out right now. Your first role doesn&apos;t define your entire career. It&apos;s completely okay (and normal) to explore different paths. This is just the beginning.
            </p>
          </div>

          {/* Section 1: Job Function Discovery */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6">
            <button
              onClick={() => toggleSection('findings')}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-100">So What Kind of Work Should You Actually Do?</h2>
                  <p className="text-gray-400 text-sm mt-2 max-w-2xl">
                    Based on what you told us, we've identified <span className="text-gray-300 font-medium">{jobFunctions.length} broad types of work</span> that match your vibe. Think of these as categories, not specific jobs (we'll get to those next).
                  </p>
                </div>
              </div>
              {expandedSections.findings ?
                <ChevronDownIcon className="w-5 h-5 text-gray-400" /> :
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              }
            </button>

            {expandedSections.findings && (
              <div className="px-6 pb-6">
                <div className="border-t border-gray-700 pt-6 space-y-6">
                  {/* Job Function Cards */}
                  {jobFunctions.map((func, index) => (
                    <div key={func.id} className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg border-2 border-blue-600/50 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-100">{func.title}</h3>
                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                              {func.matchPercentage}% match
                            </span>
                          </div>
                          <p className="text-gray-300 leading-relaxed mb-4">
                            {func.dayToDay}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Why This Fits */}
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-blue-700/30">
                          <h4 className="text-sm font-semibold text-blue-400 mb-2">Why we think you'd be good at this:</h4>
                          <ul className="space-y-1.5">
                            {func.whyThisFits.map((reason, i) => (
                              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="text-blue-400 mt-0.5">→</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Education Alignment */}
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-green-700/30">
                          <h4 className="text-sm font-semibold text-green-400 mb-2">How your degree actually helps here:</h4>
                          <p className="text-sm text-gray-300">{func.educationAlignment}</p>
                        </div>

                        {/* Related Roles */}
                        {func.relatedCareerTitles.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-100 mb-2">Jobs that fall under this:</h4>
                            <div className="flex flex-wrap gap-2">
                              {func.relatedCareerTitles.map((title, i) => (
                                <span key={i} className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm">
                                  {title}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {jobFunctions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Keep answering questions and we'll figure out what you're good at</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Specific Job Titles */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6">
            <button
              onClick={() => toggleSection('recommendations')}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-100">Okay But What Do I Actually Apply For?</h2>
                  <p className="text-gray-400 text-sm mt-2 max-w-2xl">
                    Here are <span className="text-gray-300 font-medium">{profile.topCareers?.length || 0} real job titles</span> to copy and paste into LinkedIn, Indeed, or wherever you're applying. These are entry-level roles, so they're looking for your background and potential, not decades of experience.
                  </p>
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
                      {profile.topCareers.slice(0, 8).map((career, index) => (
                        <div key={index} className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg border border-green-600/40 p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-xl font-bold text-gray-100">{career.careerTitle}</h4>
                                <span className="px-2 py-1 bg-green-600/30 text-green-300 rounded text-xs font-semibold">
                                  {Math.round(career.currentScore * 100)}% match
                                </span>
                              </div>
                              <p className="text-sm text-green-400 font-medium mb-1">{career.careerCategory}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Why This Fits */}
                            <div className="bg-gray-800/50 rounded p-3 border border-green-700/30">
                              <h5 className="text-xs font-semibold text-green-400 mb-2">WHY THIS FITS YOU:</h5>
                              <ul className="space-y-1">
                                {career.matchFactors.slice(0, 2).map((factor, i) => (
                                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                    <span className="text-green-400 mt-0.5">•</span>
                                    <span>{factor.factor}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Entry Requirements */}
                            <div className="bg-gray-800/50 rounded p-3 border border-blue-700/30">
                              <h5 className="text-xs font-semibold text-blue-400 mb-2">ENTRY REQUIREMENTS:</h5>
                              <ul className="space-y-1 text-xs text-gray-300">
                                <li>• Bachelor's degree (any field)</li>
                                <li>• 0-2 years experience</li>
                                <li>• Relevant skills or internships helpful</li>
                              </ul>
                            </div>
                          </div>

                          {/* Company Types & Salary */}
                          <div className="flex flex-wrap items-center gap-4 text-xs">
                            <div>
                              <span className="text-gray-400">Company types:</span>
                              <span className="text-gray-300 ml-2">Startups, Tech companies, Agencies, Enterprises</span>
                            </div>
                            <div className="border-l border-gray-600 pl-4">
                              <span className="text-gray-400">Entry salary:</span>
                              <span className="text-gray-300 ml-2">$45k-$65k</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Answer more questions to see actual job titles you can apply for</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Start Your Job Search */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6">
            <button
              onClick={() => toggleSection('jobSearch')}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-100">Cool, Now Let's Actually Find These Jobs</h2>
                  <p className="text-gray-400 text-sm mt-2 max-w-2xl">
                    We know job searching is tedious. So we made it easy: click the buttons below and we'll search for you. Or use the external links to go straight to LinkedIn, Indeed, etc.
                  </p>
                </div>
              </div>
              {expandedSections.jobSearch ?
                <ChevronDownIcon className="w-5 h-5 text-gray-400" /> :
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              }
            </button>

            {expandedSections.jobSearch && (
              <div className="px-6 pb-6">
                <div className="border-t border-gray-700 pt-6 space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-lg border border-orange-600/40 p-6">
                    <h3 className="text-lg font-bold text-gray-100 mb-4">The Fast Track</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Link
                        href="/jobs"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search All Recommended Roles
                      </Link>
                      <button
                        onClick={() => {
                          const titles = profile.topCareers?.slice(0, 3).map(c => c.careerTitle).join(', ') || '';
                          navigator.clipboard.writeText(titles);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-semibold transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy Job Titles
                      </button>
                    </div>
                  </div>

                  {/* Individual Job Searches */}
                  {profile.topCareers && profile.topCareers.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100 mb-4">Or Pick One to Start With</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {profile.topCareers.slice(0, 6).map((career, index) => (
                          <Link
                            key={index}
                            href={`/jobs?search=${encodeURIComponent(career.careerTitle)}`}
                            className="flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              <span className="text-gray-200 font-medium">{career.careerTitle}</span>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* External Job Boards */}
                  <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-5">
                    <h3 className="text-lg font-semibold text-gray-100 mb-3">Or Just Go Straight to the Source</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      These links will search for your top match on the big job boards (we pre-filled the search for you):
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {profile.topCareers && profile.topCareers.length > 0 && (
                        <>
                          <a
                            href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(profile.topCareers[0].careerTitle)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-center rounded font-medium transition-colors"
                          >
                            LinkedIn
                          </a>
                          <a
                            href={`https://www.indeed.com/jobs?q=${encodeURIComponent(profile.topCareers[0].careerTitle)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-center rounded font-medium transition-colors"
                          >
                            Indeed
                          </a>
                          <a
                            href={`https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(profile.topCareers[0].careerTitle)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-center rounded font-medium transition-colors"
                          >
                            Glassdoor
                          </a>
                          <a
                            href={`https://www.ziprecruiter.com/jobs-search?search=${encodeURIComponent(profile.topCareers[0].careerTitle)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-center rounded font-medium transition-colors"
                          >
                            ZipRecruiter
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* How to Position Yourself */}
                  <div className="bg-blue-900/20 rounded-lg border border-blue-600/30 p-5">
                    <h3 className="text-lg font-semibold text-blue-300 mb-3">Pro Tips (Because You're New At This)</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">→</span>
                        <span><strong>Resume:</strong> Put your relevant coursework, projects, and that one internship up top—they count as experience</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">→</span>
                        <span><strong>Cover Letter:</strong> Keep it real—say you're excited to learn and grow. Hiring managers like enthusiasm over fake expertise</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">→</span>
                        <span><strong>Volume:</strong> Aim for 10-15 applications per week. Yeah, it's a numbers game</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">→</span>
                        <span><strong>Search Terms:</strong> Copy those exact job titles above—the algorithm needs keywords to find you</span>
                      </li>
                    </ul>
                  </div>
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
        subtitle="Let's figure out what you're actually good at"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasStarted ? (
          /* Intro Section - shown before starting */
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-600/30 p-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">
              Alright, let's figure this out together
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed mb-6">
              <p>
                This isn't your typical "what's your favorite color?" career quiz. We're going to ask you some questions about what you actually enjoy doing, what you're good at, and what matters to you in a job.
              </p>
              <p>
                <span className="text-blue-400 font-semibold">Here's how it works:</span> Answer honestly (not what sounds impressive), and we'll use AI to spot patterns you might not even see yourself. The more you answer, the better we get at matching you with roles that actually fit.
              </p>
              <p className="text-sm text-gray-400">
                Takes about 10-15 minutes. You can save your progress and come back anytime.
              </p>
            </div>
            <button
              onClick={() => setHasStarted(true)}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-blue-600/25"
            >
              Start Assessment
            </button>
          </div>
        ) : (
          /* Show questionnaire after starting */
          <AdaptiveQuestionnaire
            key={questionnaireKey}
            onComplete={handleComplete}
            userProfile={userProfile || undefined}
          />
        )}
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
          subtitle="Let's figure out what you're actually good at"
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

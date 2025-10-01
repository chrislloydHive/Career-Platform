'use client';

import { useState, useEffect } from 'react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import Link from 'next/link';

interface AssessmentResult {
  topCareers?: Array<{
    careerTitle: string;
    careerCategory: string;
    currentScore: number;
    matchFactors: Array<{
      factor: string;
      weight: number;
    }>;
  }>;
  jobFunctions?: Array<{
    title: string;
    matchPercentage: number;
    whyThisFits: string[];
  }>;
}

interface UserProfile {
  bio?: string;
  skills?: string[];
  interests?: string[];
  strengths?: string[];
  careerGoals?: string[];
  resumeUrl?: string;
}

export function AssessmentBasedRecommendations() {
  const { workflow } = useWorkflow();
  const [assessmentData, setAssessmentData] = useState<AssessmentResult | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!workflow.assessmentId) {
        setIsLoading(false);
        return;
      }

      try {
        // Load both assessment results and user profile in parallel
        const [assessmentResponse, profileResponse] = await Promise.all([
          fetch(`/api/assessment-results/${workflow.assessmentId}`),
          fetch('/api/profile'),
        ]);

        if (assessmentResponse.ok) {
          const data = await assessmentResponse.json();
          // Extract topCareers from the assessment profile
          if (data.assessment?.profile?.topCareers) {
            setAssessmentData({
              topCareers: data.assessment.profile.topCareers,
            });
          }
        }

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserProfile(profileData.profile);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [workflow.assessmentId]);

  // No assessment completed yet
  if (!workflow.assessmentCompleted) {
    return (
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-600/30 p-6 sm:p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-100 mb-2">
              Want Personalized Career Matches?
            </h3>
            <p className="text-sm sm:text-base text-gray-300 mb-4">
              Take the assessment first to see careers tailored specifically to your skills, interests, and work style. We'll analyze your responses and show you the best matches here.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Take Assessment
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 mb-6">
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Loading your personalized matches...</p>
        </div>
      </div>
    );
  }

  const topCareers = assessmentData?.topCareers || [];
  const displayedCareers = showAll ? topCareers : topCareers.slice(0, 6);

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl border border-green-600/30 p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-2">
              Your Top Career Matches
            </h2>
            <p className="text-sm sm:text-base text-gray-300 mb-3">
              Based on your {workflow.hasResume ? 'profile and assessment' : 'assessment'}, here are {topCareers.length} careers that match {workflow.hasResume ? 'your background and' : 'your'} work style.
            </p>
            {/* Show profile context if available */}
            {userProfile && (
              <div className="flex flex-wrap gap-2 mt-3">
                {userProfile.strengths && userProfile.strengths.length > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-900/30 border border-blue-600/30 rounded-full text-xs text-blue-300">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Using your strengths: {userProfile.strengths.slice(0, 2).join(', ')}</span>
                  </div>
                )}
                {userProfile.careerGoals && userProfile.careerGoals.length > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-900/30 border border-purple-600/30 rounded-full text-xs text-purple-300">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span>Aligned with: {userProfile.careerGoals[0]}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Career Cards */}
      {topCareers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {displayedCareers.map((career, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg border border-gray-700 p-5 hover:border-blue-500 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-100 mb-1 group-hover:text-blue-400 transition-colors">
                      {career.careerTitle}
                    </h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {career.careerCategory}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-2xl font-bold text-blue-400">
                      {Math.round(career.currentScore * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">match</div>
                  </div>
                </div>

                {/* Match Factors */}
                {career.matchFactors && career.matchFactors.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase">Why it fits:</div>
                    {career.matchFactors.slice(0, 2).map((factor, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="line-clamp-2">{factor.factor}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* View Details Link */}
                <button
                  onClick={() => {
                    // Trigger search for this career in the explorer below
                    const event = new CustomEvent('careerSearch', { detail: career.careerTitle });
                    window.dispatchEvent(event);
                  }}
                  className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Explore This Career
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Show More/Less Button */}
          {topCareers.length > 6 && (
            <div className="text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                {showAll ? (
                  <>
                    Show Less
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    Show All {topCareers.length} Matches
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <p className="text-gray-400">No career matches found. Try retaking the assessment.</p>
        </div>
      )}
    </div>
  );
}

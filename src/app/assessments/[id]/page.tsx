'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { CareerPathVisualization } from '@/components/CareerPathVisualization';
import { generateCareerPaths } from '@/lib/career-paths/career-path-generator';
import { ActionPlan } from '@/components/ActionPlan';
import { generateActionPlan } from '@/lib/action-plan/action-plan-generator';
import { SkillsGapAnalysis } from '@/components/SkillsGapAnalysis';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

type SavedProfile = {
  responses: Record<string, unknown>;
  insights: Array<{ confidence: number; [key: string]: unknown }>;
  synthesizedInsights: Array<{ type: string; title: string; description: string; implications: string[]; [key: string]: unknown }>;
  gaps: unknown[];
  authenticityProfile: Record<string, unknown>;
  narrativeInsights: unknown[];
  confidenceEvolutions: unknown[];
  patterns: Record<string, unknown>;
  analysis: { strengths?: string[]; [key: string]: unknown };
  topCareers: Array<{ title: string; match: number; [key: string]: unknown }>;
  completion: number;
};

interface CareerRecommendation {
  jobTitle: string;
  category: string;
  matchScore: number;
  reasons: Array<{
    factor: string;
    explanation: string;
    confidence: number;
  }>;
  newInsight?: string;
}

interface SavedAssessment {
  id: number;
  title: string;
  description: string;
  profile: SavedProfile;
  careerRecommendations: CareerRecommendation[];
  savedAt: string;
  createdAt: string;
}

export default function AssessmentDetailPage() {
  const params = useParams();
  const [assessment, setAssessment] = useState<SavedAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    findings: false,
    recommendations: false,
    actionPlan: false,
  });

  useEffect(() => {
    if (params.id) {
      loadAssessment(params.id as string);
    }
  }, [params.id]);

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const loadAssessment = async (id: string) => {
    try {
      const response = await fetch(`/api/assessment-results/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load assessment');
      }
      const data = await response.json();
      setAssessment(data.assessment);
    } catch (error) {
      console.error('Error loading assessment:', error);
      setError('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation
          title="Loading Assessment..."
          subtitle="Please wait"
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading assessment...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation
          title="Assessment Not Found"
          subtitle="Unable to load assessment"
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="text-red-400 mb-4">{error || 'Assessment not found'}</div>
            <Link
              href="/assessments"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Assessments
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const profile = assessment.profile;

  // Transform topCareers to CareerFitScore format for generateCareerPaths
  const transformedCareers = profile.topCareers?.map((career) => ({
    careerTitle: career.title,
    careerCategory: 'General', // Default category since not stored
    currentScore: career.match,
    previousScore: career.match,
    change: 0,
    trend: 'stable' as const,
    matchFactors: []
  })) || [];

  // Safely extract strengths as string array
  const strengths = Array.isArray(profile.analysis?.strengths)
    ? profile.analysis.strengths as string[]
    : [];

  // Transform insights to the expected format for generateCareerPaths
  const transformedInsights = profile.insights?.map((insight) => ({
    type: 'strength' as const,
    area: 'work-style' as const,
    insight: 'Saved insight from assessment',
    basedOn: [],
    confidence: insight.confidence || 0.5,
    explanation: 'Saved from previous assessment'
  })) || [];

  const careerPaths = profile.topCareers && transformedInsights.length > 0 && strengths.length > 0
    ? generateCareerPaths(transformedCareers, transformedInsights, strengths)
    : [];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title={assessment.title}
        subtitle={`Saved ${formatDate(assessment.savedAt)}`}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assessment Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">{assessment.title}</h1>
            {assessment.description && (
              <p className="text-gray-400">{assessment.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>Completion: {profile.completion}%</span>
              <span>•</span>
              <span>Saved: {formatDate(assessment.savedAt)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href={`/assessments/${assessment.id}/retake`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake Assessment
            </a>
            <Link
              href="/assessments"
              className="text-gray-400 hover:text-gray-300 transition-colors px-3 py-2"
            >
              ← All Assessments
            </Link>
          </div>
        </div>

        {/* Comprehensive Assessment Overview */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-gray-700 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Your Saved Career Assessment</h2>
            <div className="max-w-4xl mx-auto space-y-4">
              <p className="text-lg text-gray-300 leading-relaxed">
                This assessment identified {profile.synthesizedInsights.length} key patterns that reveal your unique professional identity.
                {profile.completion >= 80 ? (
                  <span> Your comprehensive profile shows strong alignment in multiple areas, providing clear career direction.</span>
                ) : (
                  <span> With {profile.completion}% completion, significant insights were discovered about your work preferences and motivations.</span>
                )}
              </p>

              <p className="text-gray-400 leading-relaxed">
                {profile.synthesizedInsights.length > 0 && (
                  <>
                    Your responses revealed {profile.synthesizedInsights.find(i => i.type === 'cross-domain') ? 'cross-domain interests suggesting versatile career options' : 'focused preferences indicating specialized career paths'}.
                    {assessment.careerRecommendations && assessment.careerRecommendations.length > 0 && (
                      <span> This analysis generated {assessment.careerRecommendations.length} personalized career recommendations with detailed matching rationale.</span>
                    )}
                  </>
                )}
              </p>

              {profile.authenticityProfile?.coreMotivation && (
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30 mt-6">
                  <p className="text-blue-100 italic text-center">
                    <span className="text-blue-400 font-medium">Your Core Career Driver:</span> &ldquo;{profile.authenticityProfile.coreMotivation}&rdquo;
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
              <p className="text-gray-400 text-sm mb-1">{assessment.careerRecommendations?.length || 0} personalized career matches</p>
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
                <p className="text-gray-400 text-sm mt-1">
                  {profile.synthesizedInsights.length} cross-domain insights reveal patterns in your work preferences,
                  strengths, and motivations that shape your ideal career path.
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
                      {Array.isArray((profile.patterns as Record<string, unknown>)?.hiddenMotivations) ?
                        ((profile.patterns as Record<string, unknown>).hiddenMotivations as unknown[]).length : 0}
                    </div>
                    <div className="text-xs text-gray-400">Core Motivations</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-300 mb-1">
                      {Math.round((profile.insights.reduce((sum: number, i) => sum + i.confidence, 0) / profile.insights.length) * 100) || 0}%
                    </div>
                    <div className="text-xs text-gray-400">Confidence</div>
                  </div>
                </div>

                {/* Detailed Insights */}
                {profile.synthesizedInsights && profile.synthesizedInsights.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Cross-Domain Insights</h3>
                    {profile.synthesizedInsights.map((insight, index: number) => (
                      <div key={index} className="bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-lg border border-blue-600/30 p-5">
                        <div className="flex items-center gap-2 mb-3">
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
                            {Math.round((insight.confidence as number || 0.5) * 100)}% confidence
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-100 mb-2">{insight.title}</h4>
                        <p className="text-gray-300 leading-relaxed mb-4">{insight.description}</p>

                        <div className="bg-gray-900/50 rounded-lg p-4 border border-green-700/30">
                          <h5 className="text-sm font-semibold text-green-400 mb-2">Career Implications:</h5>
                          <ul className="space-y-1.5">
                            {insight.implications.map((implication: string, i: number) => (
                              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="text-green-400 mt-0.5 text-xs">▶</span>
                                <span>{implication}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
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
                <p className="text-gray-400 text-sm mt-1">
                  {assessment.careerRecommendations?.length || 0} personalized career matches based on your unique profile,
                  experience, and exploration patterns.
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
                {assessment.careerRecommendations && assessment.careerRecommendations.length > 0 ? (
                  <div className="space-y-4">
                    {assessment.careerRecommendations.map((rec, index) => (
                      <div key={index} className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-600/30 p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-gray-100 mb-1">{rec.jobTitle}</h4>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-green-400 font-medium">{rec.category}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-400">{Math.round(rec.matchScore * 100)}% match</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(rec.matchScore * 5) ? 'text-green-400' : 'text-gray-600'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>

                        {rec.newInsight && (
                          <div className="bg-blue-900/30 rounded-lg p-3 mb-4 border border-blue-600/30">
                            <h5 className="text-sm font-semibold text-blue-400 mb-1">New Insight:</h5>
                            <p className="text-sm text-gray-300">{rec.newInsight}</p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <h5 className="text-sm font-semibold text-gray-100">Why this fits you:</h5>
                          {rec.reasons.map((reason, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                              <span className="text-green-400 mt-0.5 text-xs">▶</span>
                              <div>
                                <span className="font-medium text-gray-200">{reason.factor}:</span>{' '}
                                <span className="text-gray-300">{reason.explanation}</span>
                                <span className="text-gray-500 ml-2">({Math.round(reason.confidence * 100)}% confidence)</span>
                              </div>
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
                <p className="text-gray-400 text-sm mt-1">
                  Concrete next steps to advance your career based on your assessment findings and
                  recommendations, with skills development and networking strategies.
                </p>
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
                      topCareers={transformedCareers}
                      userStrengths={strengths}
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
                  actionPlan={generateActionPlan(profile as never)}
                  onRestartExploration={async () => {
                    if (confirm('This will start a new assessment. Continue?')) {
                      window.location.href = '/explore';
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
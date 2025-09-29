'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { CareerPathVisualization } from '@/components/CareerPathVisualization';
import { generateCareerPaths } from '@/lib/career-paths/career-path-generator';
import { InteractiveCareerPath } from '@/components/InteractiveCareerPath';
import { InteractiveCareerGenerator } from '@/lib/career-paths/interactive-career-generator';
import { EnhancedCareerTimeline } from '@/components/EnhancedCareerTimeline';
import { EnhancedActionPlan } from '@/components/EnhancedActionPlan';
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

interface BackgroundConnection {
  aspect: string;
  connection: string;
  transferableValue: string;
}

interface IndustryApplication {
  industry: string;
  application: string;
  specificExample: string;
}

interface CareerRecommendation {
  jobTitle: string;
  category: string;
  matchScore: number;
  reasons: Array<{
    factor: string;
    explanation: string;
    confidence: number;
  }>;
  backgroundConnections?: BackgroundConnection[];
  industryApplications?: IndustryApplication[];
  newInsight?: string;
}

interface AlternativePath {
  jobTitle: string;
  category: string;
  matchScore: number;
  appealReason: string;
  personalityAspect: string;
  industryApplications?: IndustryApplication[];
}

interface CareerRecommendationsResponse {
  topRecommendations: CareerRecommendation[];
  alternativePaths: AlternativePath[];
}

interface SavedAssessment {
  id: number;
  title: string;
  description: string;
  profile: SavedProfile;
  careerRecommendations: CareerRecommendationsResponse;
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
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  // Use stored insights from the database instead of regenerating
  const hasStoredInsights = assessment?.profile?.insights && Array.isArray(assessment.profile.insights) && assessment.profile.insights.length > 0;
  const hasNarrativeInsights = assessment?.profile?.narrativeInsights && Array.isArray(assessment.profile.narrativeInsights) && assessment.profile.narrativeInsights.length > 0;

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

  const getAvailableIndustries = () => {
    if (!assessment?.careerRecommendations) return [];

    const industries = new Set<string>();

    // Get industries from top recommendations
    assessment.careerRecommendations.topRecommendations?.forEach(rec => {
      rec.industryApplications?.forEach(app => {
        industries.add(app.industry);
      });
    });

    // Get industries from alternative paths
    assessment.careerRecommendations.alternativePaths?.forEach(alt => {
      alt.industryApplications?.forEach(app => {
        industries.add(app.industry);
      });
    });

    return Array.from(industries).sort();
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
              {hasStoredInsights ? (
                <div className="space-y-4">
                  {/* Display AI-generated insights from database */}
                  {assessment.profile.insights.map((insight: any, index: number) => (
                    <div key={index} className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-600/30">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-lg text-gray-200 leading-relaxed mb-2">
                            <strong className="text-blue-300">{insight.area}:</strong> {insight.insight}
                          </p>
                          {insight.confidence && (
                            <div className="text-sm text-gray-400">
                              Confidence: {Math.round(insight.confidence * 100)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Display synthesized insights if available */}
                  {assessment.profile.synthesizedInsights && assessment.profile.synthesizedInsights.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold text-gray-200 mb-4">Key Insights</h3>
                      <div className="space-y-3">
                        {assessment.profile.synthesizedInsights.map((insight: any, index: number) => (
                          <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                            <h4 className="text-lg font-medium text-gray-100 mb-2">{insight.title}</h4>
                            <p className="text-gray-300 mb-3">{insight.description}</p>
                            {insight.implications && insight.implications.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-400 mb-1">Implications:</p>
                                <ul className="text-sm text-gray-400 space-y-1">
                                  {insight.implications.map((implication: string, impIndex: number) => (
                                    <li key={impIndex} className="flex items-start gap-2">
                                      <span className="text-blue-400 mt-1">→</span>
                                      <span>{implication}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-lg text-gray-300 leading-relaxed">
                    We&apos;ve uncovered something fascinating about how your mind works. Your responses reveal a unique cognitive pattern—you process complex problems by {profile.completion >= 80 ? 'methodically connecting seemingly unrelated concepts, then synthesizing them into breakthrough solutions. This rare combination of systematic thinking and creative leaps' : 'instinctively seeking multiple perspectives before committing to a direction. This deliberate, multi-faceted approach to decision-making'} explains why traditional career advice has probably felt limiting to you.
                  </p>
                  <p className="text-gray-400 leading-relaxed">
                    {profile.synthesizedInsights.length > 0 && (
                      <>
                        Here&apos;s what&apos;s particularly telling: your assessment pattern shows you&apos;re energized by {profile.synthesizedInsights.find(i => i.type === 'cross-domain') ? 'intellectual variety and resist being pigeonholed—you&apos;re the type who could revolutionize an industry precisely because you see connections others miss' : 'deep specialization but with an underlying need for meaningful impact—you want to be exceptionally good at something that genuinely matters'}.
                        {assessment.careerRecommendations && assessment.careerRecommendations.topRecommendations.length > 0 && (
                          <span> Based on this psychological profile, we&apos;ve identified {assessment.careerRecommendations.topRecommendations.length} career paths that don&apos;t just match your skills—they&apos;re designed around how you actually think and what secretly drives you.</span>
                        )}
                      </>
                    )}
                  </p>
                </div>
              )}


              {(() => {
                const coreMotivation = profile.authenticityProfile &&
                  typeof profile.authenticityProfile === 'object' &&
                  'coreMotivation' in profile.authenticityProfile ?
                  profile.authenticityProfile.coreMotivation : null;

                return coreMotivation ? (
                  <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30 mt-6">
                    <p className="text-blue-100 italic text-center">
                      <span className="text-blue-400 font-medium">Your Core Career Driver:</span> &ldquo;{String(coreMotivation)}&rdquo;
                    </p>
                  </div>
                ) : null;
              })()}
            </div>

            <div className="max-w-4xl mx-auto text-center mt-12">
              <p className="text-gray-300">
                Start with your <span className="font-semibold">Assessment Findings</span> to understand yourself, review <span className="font-semibold">Career Recommendations</span> to see where you fit, then use the <span className="font-semibold">Career Path</span> to begin your journey toward your ideal career. Each section builds on the previous one to create a complete roadmap from self-discovery to action.
              </p>
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
                  This section reveals the deep psychological insights discovered through your responses, including your cognitive patterns, work preferences, and motivational drivers. These findings form the foundation for understanding who you are as a professional.
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
                  Building directly on your assessment findings, this section presents career paths that align with your unique psychological profile. Each recommendation explains why it fits your thinking style, strengths, and authentic motivations.
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
                {/* Industry Filter */}
                {getAvailableIndustries().length > 0 && (
                  <div className="mb-6 bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-100 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Filter by Industry
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedIndustry('all')}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedIndustry === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                        }`}
                      >
                        All Industries
                      </button>
                      {getAvailableIndustries().map(industry => (
                        <button
                          key={industry}
                          onClick={() => setSelectedIndustry(industry)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedIndustry === industry
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                          }`}
                        >
                          {industry}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {assessment.careerRecommendations && assessment.careerRecommendations.topRecommendations.length > 0 ? (
                  <div className="space-y-6">
                    {/* Top Recommendations */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-100">Top Career Matches</h3>
                      {assessment.careerRecommendations.topRecommendations.map((rec, index) => (
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

                        {rec.backgroundConnections && rec.backgroundConnections.length > 0 && (
                          <div className="mt-4 bg-amber-900/20 rounded-lg p-4 border border-amber-600/30">
                            <h5 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              How Your Background Fits
                            </h5>
                            <div className="space-y-2">
                              {rec.backgroundConnections.map((connection, i) => (
                                <div key={i} className="text-sm">
                                  <div className="flex items-start gap-3">
                                    <span className="text-amber-400 mt-0.5 text-xs">●</span>
                                    <div>
                                      <span className="font-medium text-amber-300">{connection.aspect}:</span>{' '}
                                      <span className="text-gray-300">{connection.connection}</span>
                                    </div>
                                  </div>
                                  <div className="ml-6 mt-1">
                                    <span className="text-gray-400 text-xs italic">
                                      → {connection.transferableValue}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {rec.industryApplications && rec.industryApplications.length > 0 && (
                          <div className="mt-4 bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
                            <h5 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              Industry Applications
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {rec.industryApplications
                                .filter(app => selectedIndustry === 'all' || app.industry.toLowerCase() === selectedIndustry.toLowerCase())
                                .map((app, i) => (
                                <div key={i} className="bg-slate-700/50 rounded-lg p-3">
                                  <div className="font-medium text-blue-300 text-sm mb-1">{app.industry}</div>
                                  <div className="text-gray-300 text-sm mb-2">{app.application}</div>
                                  <div className="text-gray-400 text-xs italic">{app.specificExample}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    </div>

                    {/* Alternative Paths */}
                    {assessment.careerRecommendations.alternativePaths && assessment.careerRecommendations.alternativePaths.length > 0 && (
                      <div className="space-y-4">
                        <div className="border-t border-gray-600 pt-6">
                          <h3 className="text-lg font-semibold text-gray-100 mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Alternative Paths
                          </h3>
                          <p className="text-gray-400 text-sm mb-4">
                            These careers also match your profile well and might appeal to different aspects of your personality
                          </p>
                          {assessment.careerRecommendations.alternativePaths.map((alt, index) => (
                            <div key={index} className="bg-gradient-to-r from-orange-900/20 to-amber-900/20 rounded-lg border border-orange-600/30 p-4 mb-3">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-100">{alt.jobTitle}</h4>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm text-orange-400 font-medium">{alt.category}</span>
                                    <span className="text-sm text-gray-400">•</span>
                                    <span className="text-sm text-gray-400">{alt.matchScore}% match</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-orange-400">{alt.personalityAspect}</div>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm mb-3">{alt.appealReason}</p>

                              {alt.industryApplications && alt.industryApplications.length > 0 && (
                                <div className="mt-3 bg-slate-700/50 rounded-lg p-3">
                                  <h6 className="text-xs font-semibold text-orange-300 mb-2">Industry Applications:</h6>
                                  <div className="space-y-2">
                                    {alt.industryApplications
                                      .filter(app => selectedIndustry === 'all' || app.industry.toLowerCase() === selectedIndustry.toLowerCase())
                                      .map((app, i) => (
                                      <div key={i} className="text-xs">
                                        <span className="font-medium text-orange-300">{app.industry}:</span>{' '}
                                        <span className="text-gray-300">{app.application}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                  This final section transforms your insights and recommendations into concrete next steps. It includes skills development roadmaps, networking strategies, and interactive career timelines to help you move from understanding to action.
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

                {/* Interactive Career Paths */}
                {assessment.careerRecommendations?.topRecommendations && assessment.careerRecommendations.topRecommendations.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-100 mb-6">Interactive Career Roadmaps</h3>
                    <div className="space-y-6">
                      {assessment.careerRecommendations.topRecommendations.slice(0, 3).map((rec, index) => {
                        const interactiveCareerPath = InteractiveCareerGenerator.generateInteractiveCareerPath(
                          rec.jobTitle,
                          rec.matchScore,
                          rec.reasons.map(r => r.explanation)
                        );

                        return (
                          <InteractiveCareerPath
                            key={index}
                            initialPath={interactiveCareerPath}
                            onSavePath={async (savedPath) => {
                              try {
                                const response = await fetch('/api/save-career-path', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    pathName: savedPath.pathName,
                                    careerPath: savedPath,
                                    customizations: {
                                      timelinePreference: savedPath.timelinePreference,
                                      selectedGeography: savedPath.selectedGeography,
                                      skillsMarkedAsHave: savedPath.skillDevelopment
                                        .filter(skill => skill.userHasSkill)
                                        .map(skill => skill.name),
                                      personalNotes: ''
                                    }
                                  })
                                });

                                if (response.ok) {
                                  alert('Career path saved successfully!');
                                } else {
                                  throw new Error('Failed to save career path');
                                }
                              } catch (error) {
                                console.error('Error saving career path:', error);
                                alert('Failed to save career path. Please try again.');
                              }
                            }}
                            onUpdatePath={(updatedPath) => {
                              // Handle path updates if needed
                              console.log('Career path updated:', updatedPath);
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Real-Time Market Timeline */}
                {assessment.careerRecommendations?.topRecommendations && assessment.careerRecommendations.topRecommendations.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-100 mb-6">Market-Grounded Career Timeline</h3>
                    <div className="space-y-6">
                      {assessment.careerRecommendations.topRecommendations.slice(0, 2).map((rec, index) => (
                        <EnhancedCareerTimeline
                          key={index}
                          careerPath={rec.jobTitle}
                          userLocation="San Francisco, CA" // In production, get from user profile
                          userProfile={{
                            skills: [], // Would be populated from user's actual profile
                            totalExperience: 0,
                            location: "San Francisco, CA",
                            preferredRemoteWork: true
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Traditional Career Roadmap (fallback) */}
                {(!assessment.careerRecommendations?.topRecommendations || assessment.careerRecommendations.topRecommendations.length === 0) && careerPaths.length > 0 && (
                  <div className="mb-8">
                    <CareerPathVisualization trajectories={careerPaths} />
                  </div>
                )}

                {/* Enhanced Action Plan Component */}
                <EnhancedActionPlan
                  profile={{
                    ...profile,
                    topCareers: transformedCareers
                  } as never}
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
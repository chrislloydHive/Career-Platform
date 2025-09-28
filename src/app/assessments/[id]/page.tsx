'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { CareerPathVisualization } from '@/components/CareerPathVisualization';
import { generateCareerPaths } from '@/lib/career-paths/career-path-generator';
import { ActionPlan } from '@/components/ActionPlan';
import { generateActionPlan } from '@/lib/action-plan/action-plan-generator';
import { SkillsGapAnalysis } from '@/components/SkillsGapAnalysis';
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

interface SavedAssessment {
  id: number;
  title: string;
  description: string;
  profile: SavedProfile;
  savedAt: string;
  createdAt: string;
}

export default function AssessmentDetailPage() {
  const params = useParams();
  const [assessment, setAssessment] = useState<SavedAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadAssessment(params.id as string);
    }
  }, [params.id]);

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

        {/* Rest of the content follows the same structure as explore page */}
        {/* This is the same content structure as the explore page results */}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {profile.completion}%
            </div>
            <div className="text-sm text-gray-400">Profile Completion</div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {profile.synthesizedInsights.length}
            </div>
            <div className="text-sm text-gray-400">Cross-Domain Insights</div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {Array.isArray((profile.patterns as Record<string, unknown>)?.consistencyPatterns) ? ((profile.patterns as Record<string, unknown>).consistencyPatterns as unknown[]).length : 0}
            </div>
            <div className="text-sm text-gray-400">Pattern Matches</div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="text-3xl font-bold text-orange-400 mb-1">
              {Array.isArray((profile.patterns as Record<string, unknown>)?.hiddenMotivations) ? ((profile.patterns as Record<string, unknown>).hiddenMotivations as unknown[]).length : 0}
            </div>
            <div className="text-sm text-gray-400">Core Motivations</div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              {Math.round((profile.insights.reduce((sum: number, i) => sum + i.confidence, 0) / profile.insights.length) * 100) || 0}%
            </div>
            <div className="text-sm text-gray-400">Avg Confidence</div>
          </div>
        </div>

        {/* Assessment Findings Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-100 mb-2">Assessment Findings</h1>
            <p className="text-gray-400 text-lg">Key insights from this saved assessment</p>
          </div>
        </div>

        {/* Cross-Domain Insights */}
        {profile.synthesizedInsights && profile.synthesizedInsights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Cross-Domain Insights
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {profile.synthesizedInsights.map((insight, index: number) => (
                <div key={index} className="bg-gradient-to-r from-blue-900/40 to-green-900/40 rounded-lg border-2 border-blue-600/60 p-6">
                  <div className="space-y-4">
                    <div>
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
                          {Math.round((insight.confidence as number || 0.5) * 100)}% confidence
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-100 mb-2">{insight.title}</h3>
                      <p className="text-gray-300 leading-relaxed">{insight.description}</p>

                      <div className="mt-4 bg-gray-900/50 rounded-lg p-4 border border-green-700/30">
                        <h4 className="text-sm font-semibold text-green-400 mb-2">Career Implications:</h4>
                        <ul className="space-y-1.5">
                          {insight.implications.map((implication: string, i: number) => (
                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                              <span className="text-green-400 mt-0.5">→</span>
                              <span>{implication}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Gap Analysis */}
        {profile.topCareers && profile.topCareers.length > 0 && (
          <SkillsGapAnalysis
            topCareers={transformedCareers}
            userStrengths={strengths}
            userExperience={[]}
          />
        )}

        {/* Career Roadmap */}
        {careerPaths.length > 0 && (
          <CareerPathVisualization trajectories={careerPaths} />
        )}

        {/* Action Plan */}
        <ActionPlan
          actionPlan={generateActionPlan(profile as never)}
          onRestartExploration={async () => {
            if (confirm('This will start a new assessment. Continue?')) {
              window.location.href = '/explore';
            }
          }}
        />
      </main>
    </div>
  );
}
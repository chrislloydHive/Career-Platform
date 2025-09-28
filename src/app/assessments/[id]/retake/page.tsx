'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { AdaptiveQuestionnaire } from '@/components/AdaptiveQuestionnaire';

type SavedProfile = {
  responses: any;
  insights: any[];
  synthesizedInsights: any[];
  gaps: any[];
  authenticityProfile: any;
  narrativeInsights: any[];
  confidenceEvolutions: any[];
  patterns: any;
  analysis: any;
  topCareers: any[];
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

export default function RetakeAssessmentPage() {
  const params = useParams();
  const [assessment, setAssessment] = useState<SavedAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRetakeOptions, setShowRetakeOptions] = useState(true);
  const [retakeMode, setRetakeMode] = useState<'fresh' | 'continue' | null>(null);

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

  const handleRetakeMode = async (mode: 'fresh' | 'continue') => {
    setRetakeMode(mode);

    if (mode === 'fresh') {
      // Clear the current questionnaire state
      try {
        await fetch('/api/questionnaire', { method: 'DELETE' });
      } catch (error) {
        console.error('Error clearing questionnaire:', error);
      }
    } else if (mode === 'continue' && assessment) {
      // Load the previous responses into the current questionnaire
      try {
        const questionnaireData = {
          state: assessment.profile.responses,
          insights: assessment.profile.insights,
          synthesizedInsights: assessment.profile.synthesizedInsights,
          gaps: assessment.profile.gaps,
          authenticityProfile: assessment.profile.authenticityProfile,
          narrativeInsights: assessment.profile.narrativeInsights,
          confidenceEvolutions: assessment.profile.confidenceEvolutions,
          lastQuestionId: null,
          completionPercentage: assessment.profile.completion
        };

        await fetch('/api/questionnaire', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questionnaireData),
        });
      } catch (error) {
        console.error('Error loading previous responses:', error);
      }
    }

    setShowRetakeOptions(false);
  };

  const handleComplete = () => {
    // Redirect to explore page to see the new results
    window.location.href = '/explore';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
            <a
              href="/assessments"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Assessments
            </a>
          </div>
        </main>
      </div>
    );
  }

  if (showRetakeOptions) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation
          title="Retake Assessment"
          subtitle={`"${assessment.title}"`}
        />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-100 mb-4">How would you like to retake this assessment?</h1>
            <p className="text-gray-400">
              You can start fresh with a clean slate, or continue building on your previous responses.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Previous Assessment</h3>
            <div className="text-sm text-gray-400 space-y-1">
              <p><strong>Title:</strong> {assessment.title}</p>
              {assessment.description && (
                <p><strong>Description:</strong> {assessment.description}</p>
              )}
              <p><strong>Completion:</strong> {assessment.profile.completion}%</p>
              <p><strong>Saved:</strong> {formatDate(assessment.savedAt)}</p>
              <p><strong>Total Responses:</strong> {Object.keys(assessment.profile.responses).length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-100 mb-3">Start Fresh</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Begin a completely new assessment. All previous responses will be cleared, giving you a clean slate to explore different aspects of your career interests.
                </p>
                <button
                  onClick={() => handleRetakeMode('fresh')}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  Start Fresh Assessment
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-green-500 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-100 mb-3">Continue Building</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Load your previous responses and continue from where you left off. You can answer additional questions or modify existing responses to refine your results.
                </p>
                <button
                  onClick={() => handleRetakeMode('continue')}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                >
                  Continue Building
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href={`/assessments/${assessment.id}`}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              ← Back to Assessment Results
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title={retakeMode === 'fresh' ? 'New Assessment' : 'Continuing Assessment'}
        subtitle={retakeMode === 'fresh' ? 'Starting fresh exploration' : `Building on "${assessment.title}"`}
      />

      <main>
        <AdaptiveQuestionnaire
          key={retakeMode} // This will remount the component when retakeMode changes
          onComplete={handleComplete}
        />
      </main>
    </div>
  );
}
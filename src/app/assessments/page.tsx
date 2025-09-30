'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';

interface SavedAssessment {
  id: number;
  title: string;
  description: string;
  completion_percentage: number;
  saved_at: string;
  created_at: string;
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showNewAssessmentWarning, setShowNewAssessmentWarning] = useState(false);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      console.log('[Assessments Page] Loading assessments...');
      const response = await fetch('/api/assessment-results');
      console.log('[Assessments Page] Response status:', response.status);
      if (response.status === 401) {
        setError('Please log in to view your assessments');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to load assessments');
      }
      const data = await response.json();
      console.log('[Assessments Page] Received data:', data);
      console.log('[Assessments Page] Setting assessments:', data.assessments?.length || 0, 'items');
      setAssessments(data.assessments || []);
    } catch (error) {
      console.error('[Assessments Page] Error loading assessments:', error);
      setError('Failed to load assessments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/assessment-results/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete assessment');
      }

      setAssessments(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting assessment:', error);
      alert('Failed to delete assessment');
    } finally {
      setDeletingId(null);
    }
  };

  const handleNewAssessment = async () => {
    // Check if there's an assessment in progress
    try {
      const response = await fetch('/api/questionnaire');
      if (response.ok) {
        const data = await response.json();
        // If there's saved questionnaire data, show warning
        if (data.responses && Object.keys(data.responses).length > 0) {
          setShowNewAssessmentWarning(true);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking for in-progress assessment:', error);
    }

    // No assessment in progress, go directly to new assessment
    window.location.href = '/explore?new=true';
  };

  const confirmNewAssessment = () => {
    setShowNewAssessmentWarning(false);
    window.location.href = '/explore?new=true';
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
          title="Saved Assessments"
          subtitle="Your career exploration history"
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading assessments...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation
          title="Saved Assessments"
          subtitle="Your career exploration history"
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-400">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title="Saved Assessments"
        subtitle="Your career exploration history"
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Your Saved Assessments</h1>
            <p className="text-sm sm:text-base text-gray-400 mt-1 sm:mt-2">
              Review your career exploration journey and compare different assessment results
            </p>
          </div>
          <button
            onClick={handleNewAssessment}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm sm:text-base rounded-lg transition-colors whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Assessment
          </button>
        </div>

        {assessments.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Saved Assessments</h3>
            <p className="text-gray-500 mb-6">
              You haven&apos;t saved any assessment results yet. Complete an assessment and save it to see it here.
            </p>
            <a
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Start Your First Assessment
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6 hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-1 sm:mb-2 truncate">
                      {assessment.title}
                    </h3>
                    {assessment.description && (
                      <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                        {assessment.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(assessment.id)}
                    disabled={deletingId === assessment.id}
                    className="text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50 ml-2 flex-shrink-0"
                    title="Delete assessment"
                  >
                    {deletingId === assessment.id ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-400">Completion</span>
                    <span className="text-gray-300">{assessment.completion_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-blue-500 h-1.5 sm:h-2 rounded-full"
                      style={{ width: `${assessment.completion_percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    Saved: {formatDate(assessment.saved_at)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`/assessments/${assessment.id}`}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm rounded transition-colors text-center"
                  >
                    View Results
                  </a>
                  <a
                    href={`/assessments/${assessment.id}/retake`}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs sm:text-sm rounded transition-colors text-center"
                  >
                    Retake
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Warning dialog for starting new assessment */}
      {showNewAssessmentWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6 w-full max-w-md">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Assessment in Progress</h3>
                <p className="text-sm text-gray-400">
                  You have an assessment in progress. Starting a new assessment will clear your current responses.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNewAssessmentWarning(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmNewAssessment}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Start New Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
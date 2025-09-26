'use client';

import { useState } from 'react';
import { SearchCriteria, ScoredJob } from '@/types';
import { EnhancedSearchForm } from '@/components/EnhancedSearchForm';
import { EnhancedJobList } from '@/components/EnhancedJobList';
import { RecentSearches } from '@/components/RecentSearches';
import { SearchProgress } from '@/components/SearchProgress';
import { ToastContainer, Toast, createToast } from '@/components/Toast';
import { ExportDialog } from '@/components/ExportDialog';
import { getUserFriendlyError, retryWithBackoff } from '@/lib/feedback/error-handler';
import { saveSearchToHistory } from '@/lib/storage/search-history';

export default function Home() {
  const [jobs, setJobs] = useState<ScoredJob[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [currentSource, setCurrentSource] = useState('');
  const [jobsFound, setJobsFound] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  const addToast = (toast: Toast) => {
    setToasts(prev => [...prev, toast]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSearch = async (criteria: SearchCriteria) => {
    setError(null);
    setIsSearching(true);
    setSearchProgress(0);
    setJobsFound(0);
    setSearchCriteria(criteria);
    setRetryAttempt(0);

    try {
      const result = await retryWithBackoff(
        async () => {
          const response = await fetch('/api/search-jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(criteria),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = (errorData as { error?: { message?: string } })?.error?.message || 'Search failed';
            throw new Error(errorMessage);
          }

          const data = await response.json();

          if (!data.success) {
            const errorMessage = (data as { error?: { message?: string } })?.error?.message || 'Search failed';
            throw new Error(errorMessage);
          }

          return data.data;
        },
        {
          maxAttempts: 2,
          baseDelayMs: 2000,
          maxDelayMs: 5000,
          backoffMultiplier: 2,
        },
        (attempt, delay) => {
          setRetryAttempt(attempt);
          addToast(
            createToast(
              'warning',
              'Retrying Search',
              `Attempt ${attempt + 1} in ${(delay / 1000).toFixed(0)}s...`,
              delay
            )
          );
        }
      );

      setJobs(result.jobs);
      setJobsFound(result.jobs.length);
      setSearchProgress(100);

      saveSearchToHistory(
        criteria,
        result.jobs.length,
        result.metadata.averageScore
      );

      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach((warning: string) => {
          addToast(createToast('warning', 'Partial Results', warning, 7000));
        });
      }

      addToast(
        createToast(
          'success',
          'Search Complete',
          `Found ${result.jobs.length} jobs in ${(result.metadata.totalDurationMs / 1000).toFixed(1)}s`,
          5000
        )
      );
    } catch (err) {
      const friendlyError = getUserFriendlyError(err);
      setError(friendlyError.message);

      addToast(
        createToast(
          friendlyError.severity,
          friendlyError.title,
          friendlyError.message,
          7000
        )
      );
    } finally {
      setIsSearching(false);
      setSearchProgress(0);
      setCurrentSource('');
    }
  };

  const handleSaveJob = (job: ScoredJob) => {
    setSavedJobIds(prev => {
      if (prev.includes(job.id)) {
        addToast(
          createToast('info', 'Job Removed', `${job.title} removed from saved jobs`)
        );
        return prev.filter(id => id !== job.id);
      } else {
        addToast(
          createToast('success', 'Job Saved', `${job.title} added to saved jobs`)
        );
        return [...prev, job.id];
      }
    });
  };

  const handleSelectRecentSearch = (criteria: SearchCriteria) => {
    handleSearch(criteria);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <SearchProgress
        isSearching={isSearching}
        progress={searchProgress}
        currentSource={currentSource}
        jobsFound={jobsFound}
        message={retryAttempt > 0 ? `Retry attempt ${retryAttempt}...` : undefined}
      />

      {showExportDialog && jobs.length > 0 && (
        <ExportDialog
          jobs={jobs}
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          searchCriteria={searchCriteria?.query}
        />
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Job Search Platform</h1>
              <p className="text-sm text-gray-600">Find your next opportunity with AI-powered matching</p>
            </div>
            {jobs.length > 0 && (
              <button
                onClick={() => setShowExportDialog(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Results
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <EnhancedSearchForm
              onSearch={handleSearch}
              isLoading={isSearching}
              error={error}
              onClearError={() => setError(null)}
            />

            {jobs.length === 0 && (
              <RecentSearches
                onSelectSearch={handleSelectRecentSearch}
                maxItems={5}
              />
            )}

            {jobs.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Search Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Jobs:</span>
                    <span className="font-medium">{jobs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Score:</span>
                    <span className="font-medium">
                      {(jobs.reduce((sum, j) => sum + j.score, 0) / jobs.length).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">High Matches:</span>
                    <span className="font-medium text-green-600">
                      {jobs.filter(j => j.score >= 80).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saved Jobs:</span>
                    <span className="font-medium text-yellow-600">
                      {savedJobIds.length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {jobs.length > 0 ? (
              <EnhancedJobList
                jobs={jobs}
                isLoading={false}
                onSaveJob={handleSaveJob}
                savedJobIds={savedJobIds}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Your Job Search</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Enter your job preferences to find opportunities from LinkedIn and Indeed,
                  ranked by AI-powered matching scores.
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-sm text-gray-500">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">Smart Scoring</span>
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full">Multiple Sources</span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full">Export to Excel</span>
                  <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full">Save & Track</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
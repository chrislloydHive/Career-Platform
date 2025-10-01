'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { SearchCriteria, ScoredJob } from '@/types';
import { Navigation } from '@/components/Navigation';
import { EnhancedSearchForm } from '@/components/EnhancedSearchForm';
import { EnhancedJobList } from '@/components/EnhancedJobList';
import { RecentSearches } from '@/components/RecentSearches';
import { SearchProgress } from '@/components/SearchProgress';
import { ToastContainer, Toast, createToast } from '@/components/Toast';
import { ExportDialog } from '@/components/ExportDialog';
import { getUserFriendlyError, retryWithBackoff } from '@/lib/feedback/error-handler';
import { saveSearchToHistory, saveLastSearch, getLastSearch } from '@/lib/storage/search-history';
import { ContextualChat } from '@/components/ContextualChat';
import { WorkflowProgress } from '@/components/WorkflowProgress';

function JobSearchContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<ScoredJob[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [currentSource, setCurrentSource] = useState('');
  const [jobsFound, setJobsFound] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [initialValues, setInitialValues] = useState<Partial<SearchCriteria> | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [searchMetadata, setSearchMetadata] = useState<{
    totalJobsFound?: number;
    uniqueJobs?: number;
    duplicatesRemoved?: number;
    successfulSources?: string[];
    failedSources?: string[];
  } | null>(null);

  useEffect(() => {
    // Check for URL parameters first (from assessment results)
    const searchQuery = searchParams.get('search');
    const locationQuery = searchParams.get('location');

    if (searchQuery) {
      setInitialValues({
        query: searchQuery,
        location: locationQuery || '',
        experienceLevel: 'entry',
        sources: ['google_jobs'],
      });
    } else {
      // Fall back to last search
      const lastSearch = getLastSearch();
      if (lastSearch) {
        setInitialValues(lastSearch.criteria);
        setJobs(lastSearch.jobs);
        setJobsFound(lastSearch.jobs.length);
        setSearchCriteria(lastSearch.criteria);
      }
    }
  }, [searchParams]);

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
    setCurrentPage(1);
    setHasMoreResults(true);

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
      setHasMoreResults(result.jobs.length === (criteria.maxResults || 25));
      setSearchMetadata(result.metadata);

      saveSearchToHistory(
        criteria,
        result.jobs.length,
        result.metadata.averageScore
      );

      saveLastSearch(criteria, result.jobs);

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

  const handleSaveJob = async (job: ScoredJob) => {
    const isSaved = savedJobIds.includes(job.id);

    if (isSaved) {
      try {
        await fetch(`/api/saved-items?id=job-${job.id}`, {
          method: 'DELETE',
        });
        setSavedJobIds(prev => prev.filter(id => id !== job.id));
        addToast(
          createToast('info', 'Job Removed', `${job.title} removed from saved jobs`)
        );
      } catch {
        addToast(
          createToast('error', 'Error', 'Failed to remove job')
        );
      }
    } else {
      try {
        await fetch('/api/saved-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'job', item: job }),
        });
        setSavedJobIds(prev => [...prev, job.id]);
        addToast(
          createToast('success', 'Job Saved', `${job.title} added to saved jobs`)
        );
      } catch {
        addToast(
          createToast('error', 'Error', 'Failed to save job')
        );
      }
    }
  };

  const handleSelectRecentSearch = (criteria: SearchCriteria) => {
    handleSearch(criteria);
  };

  const handleLoadMore = async () => {
    if (!searchCriteria || isLoadingMore || !hasMoreResults) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const loadMoreCriteria = {
        ...searchCriteria,
        maxResults: (searchCriteria.maxResults || 25) * nextPage,
      };

      const response = await fetch('/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loadMoreCriteria),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = (errorData as { error?: { message?: string } })?.error?.message || 'Failed to load more results';
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success) {
        const newJobs = data.data.jobs.filter((newJob: ScoredJob) =>
          !jobs.some(existingJob => existingJob.id === newJob.id)
        );

        setJobs(prev => [...prev, ...newJobs]);
        setCurrentPage(nextPage);
        setHasMoreResults(newJobs.length > 0 && data.data.jobs.length === loadMoreCriteria.maxResults);

        addToast(
          createToast(
            'success',
            'More Results Loaded',
            `Found ${newJobs.length} additional jobs`,
            3000
          )
        );
      } else {
        throw new Error('Failed to load more results');
      }
    } catch (err) {
      const friendlyError = getUserFriendlyError(err);
      setError(friendlyError.message);

      addToast(
        createToast(
          friendlyError.severity,
          'Load More Failed',
          friendlyError.message,
          5000
        )
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Show sign-in prompt for guest users
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation title="Job Search" subtitle="Find your next opportunity" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-100 mb-3">Sign in to Search Jobs</h2>
              <p className="text-gray-400 mb-6">
                Create an account or sign in to access our powerful job search engine with AI-powered matching.
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/login"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
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

      <Navigation
        title="Job Search"
        subtitle="Discover Your Next Career Opportunity"
        actions={
          jobs.length > 0 ? (
            <button
              onClick={() => setShowExportDialog(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Export</span>
            </button>
          ) : null
        }
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Workflow Progress */}
        <WorkflowProgress />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <EnhancedSearchForm
              onSearch={handleSearch}
              isLoading={isSearching}
              error={error}
              onClearError={() => setError(null)}
              initialValues={initialValues}
            />

            {jobs.length === 0 && (
              <div className="hidden sm:block">
                <RecentSearches
                  onSelectSearch={handleSelectRecentSearch}
                  maxItems={5}
                />
              </div>
            )}

            {jobs.length > 0 && (
              <div className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-2 sm:mb-3">Search Summary</h3>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Jobs:</span>
                    <span className="font-medium text-gray-100">{jobs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Score:</span>
                    <span className="font-medium text-gray-100">
                      {(jobs.reduce((sum, j) => sum + j.score, 0) / jobs.length).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">High Matches:</span>
                    <span className="font-medium text-green-400">
                      {jobs.filter(j => j.score >= 80).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saved Jobs:</span>
                    <span className="font-medium text-yellow-400">
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
                searchCriteria={{
                  jobTypes: searchCriteria?.jobTypes,
                  keywords: searchCriteria?.keywords,
                }}
                onLoadMore={handleLoadMore}
                isLoadingMore={isLoadingMore}
                hasMoreResults={hasMoreResults}
                searchMetadata={searchMetadata || undefined}
              />
            ) : (
              <div className="bg-gray-800 rounded-lg shadow-md p-6 sm:p-8 lg:p-12 text-center">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4 sm:mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-100 mb-2">Start Your Job Search</h3>
                <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto">
                  Search LinkedIn, Indeed, and Google Jobs with the form above, or scrape jobs directly from company career pages
                  by selecting &quot;Company Sites&quot; as a job source.
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-xs sm:text-sm">
                  <span className="px-2 sm:px-3 py-1 bg-gray-700 text-gray-300 rounded-full whitespace-nowrap">Company Scraping</span>
                  <span className="px-2 sm:px-3 py-1 bg-gray-700 text-gray-300 rounded-full whitespace-nowrap">Multiple Sources</span>
                  <span className="px-2 sm:px-3 py-1 bg-gray-700 text-gray-300 rounded-full whitespace-nowrap">Export to Excel</span>
                  <span className="px-2 sm:px-3 py-1 bg-gray-700 text-gray-300 rounded-full whitespace-nowrap">Save & Track</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Contextual Chat */}
      <ContextualChat
        context="jobs"
        contextData={{
          searchQuery: searchCriteria?.query,
          location: searchCriteria?.location,
        }}
      />
    </div>
  );
}

export default function JobSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <JobSearchContent />
    </Suspense>
  );
}
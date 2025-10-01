'use client';

import { useState } from 'react';

interface CareerSearchExplainerProps {
  searchQuery: string;
  savedCareersCount: number;
  filteredCareersCount: number;
  hasExactMatch: boolean;
  onResearchWithAI: () => void;
}

export function CareerSearchExplainer({
  searchQuery,
  savedCareersCount,
  filteredCareersCount,
  hasExactMatch,
  onResearchWithAI,
}: CareerSearchExplainerProps) {
  const [showExplainer, setShowExplainer] = useState(savedCareersCount === 0);

  // First time user - no saved careers yet
  if (savedCareersCount === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-600/30 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-100 mb-2">
              Search for Any Career
            </h3>
            <p className="text-gray-300 mb-4">
              Enter a job title above (like "UX Designer" or "Data Analyst"). Our AI will research it for you - salary, day-to-day work, how to get in, and more. Careers you research get saved here for later.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-400">Try searching for:</span>
              {['Product Manager', 'Software Engineer', 'Marketing Manager', 'Data Analyst'].map(title => (
                <button
                  key={title}
                  onClick={onResearchWithAI}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User has saved careers - searching their library
  if (searchQuery.trim()) {
    // Has exact match in saved library
    if (hasExactMatch) {
      return (
        <div className="mb-4">
          <p className="text-sm text-gray-400">
            Searching your {savedCareersCount} saved career{savedCareersCount !== 1 ? 's' : ''}
            {' • '}
            <span className="text-gray-100 font-semibold">{filteredCareersCount} match{filteredCareersCount !== 1 ? 'es' : ''}</span>
          </p>
        </div>
      );
    }

    // No exact match - offer AI research
    return (
      <div className="space-y-4 mb-6">
        <div className="text-sm text-gray-400">
          Searching your {savedCareersCount} saved career{savedCareersCount !== 1 ? 's' : ''}
          {filteredCareersCount > 0 && (
            <>
              {' • '}
              <span className="text-gray-100 font-semibold">{filteredCareersCount} similar match{filteredCareersCount !== 1 ? 'es' : ''}</span>
            </>
          )}
        </div>

        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-100 mb-1">
                &quot;{searchQuery}&quot; not in your saved careers
              </h4>
              <p className="text-sm text-gray-300 mb-3">
                {filteredCareersCount > 0
                  ? `We found ${filteredCareersCount} similar career${filteredCareersCount !== 1 ? 's' : ''} you've saved. Want to research "${searchQuery}" specifically?`
                  : `Want to research "${searchQuery}"? Our AI will find salary info, day-to-day work, and how to get in.`
                }
              </p>
              <button
                onClick={onResearchWithAI}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Research &quot;{searchQuery}&quot; with AI
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not searching - show library summary
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Your career library • <span className="text-gray-100 font-semibold">{savedCareersCount} career{savedCareersCount !== 1 ? 's' : ''}</span>
        </p>
        {showExplainer && (
          <button
            onClick={() => setShowExplainer(false)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Hide tip
          </button>
        )}
      </div>
      {showExplainer && (
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: Search above to find careers you've researched, or enter a new job title to research with AI
        </p>
      )}
    </div>
  );
}

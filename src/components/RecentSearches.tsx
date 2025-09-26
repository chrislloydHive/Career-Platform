'use client';

import { useEffect, useState } from 'react';
import { SearchCriteria } from '@/types';
import {
  getSearchHistory,
  removeSearchFromHistory,
  clearSearchHistory,
  formatSearchSummary,
  SearchHistoryItem,
} from '@/lib/storage/search-history';

interface RecentSearchesProps {
  onSelectSearch: (criteria: SearchCriteria) => void;
  maxItems?: number;
}

export function RecentSearches({ onSelectSearch, maxItems = 5 }: RecentSearchesProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const searches = getSearchHistory();
    setHistory(searches);
  };

  const handleRemove = (id: string) => {
    removeSearchFromHistory(id);
    loadHistory();
  };

  const handleClearAll = () => {
    if (confirm('Clear all search history?')) {
      clearSearchHistory();
      loadHistory();
    }
  };

  const displayedHistory = showAll ? history : history.slice(0, maxItems);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-100">Recent Searches</h2>
        <button
          onClick={handleClearAll}
          className="text-xs text-red-600 hover:text-red-700 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2">
        {displayedHistory.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:border-blue-400 hover:bg-gray-800 transition-all cursor-pointer"
            onClick={() => onSelectSearch(item.criteria)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-100 truncate">
                  {formatSearchSummary(item)}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span>{formatRelativeTime(item.timestamp)}</span>
                {item.resultsCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {item.resultsCount} jobs
                  </span>
                )}
                {item.averageScore !== undefined && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {item.averageScore.toFixed(1)} avg
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {history.length > maxItems && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
        >
          {showAll ? 'Show Less' : `Show ${history.length - maxItems} More`}
        </button>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
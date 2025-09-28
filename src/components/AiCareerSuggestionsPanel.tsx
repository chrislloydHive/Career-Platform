'use client';

import { useState, useEffect } from 'react';
import { CareerSuggestion } from '@/lib/ai/career-suggestions-ai';

export function AiCareerSuggestionsPanel() {
  const [suggestions, setSuggestions] = useState<CareerSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/career-suggestions');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-8 bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-cyan-900/20 rounded-xl border-2 border-blue-500/30 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-blue-500/20 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-blue-500/10 rounded"></div>
            <div className="h-20 bg-blue-500/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-cyan-900/20 rounded-xl border-2 border-blue-500/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-100">AI Career Discoveries</h2>
            <p className="text-sm text-blue-300/80">Unexpected career paths discovered based on your profile</p>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-blue-400 hover:text-blue-300 transition-colors p-2"
          aria-label={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <svg
            className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-gray-800/60 rounded-lg border-l-4 border-blue-500 overflow-hidden hover:bg-gray-800/80 transition-all"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-blue-100">{suggestion.title}</h3>
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs font-semibold">
                          {suggestion.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-blue-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>{suggestion.matchScore}% potential match</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpanded(expanded === suggestion.title ? null : suggestion.title)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <svg
                        className={`w-5 h-5 transition-transform ${expanded === suggestion.title ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed mb-3">
                    {suggestion.discoveryReason}
                  </p>

                  {expanded === suggestion.title && (
                    <div className="mt-4 pt-4 border-t border-blue-500/20">
                      <h4 className="text-sm font-semibold text-blue-300 mb-2">Why this matches your profile:</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {suggestion.reasoning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-blue-500/20">
            <p className="text-xs text-blue-300/60 text-center">
              These careers were suggested by AI based on your questionnaire responses and discovered insights.
              Click each suggestion to learn more about why it matches your profile.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
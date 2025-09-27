'use client';

import { useState, useEffect } from 'react';
import { MarketDataInsight } from '@/lib/web-search/career-search-service';

interface LiveCareerInsightsProps {
  roleName: string;
  location?: string;
  onInsightsLoaded?: (insights: MarketDataInsight[]) => void;
}

export function LiveCareerInsights({ roleName, location, onInsightsLoaded }: LiveCareerInsightsProps) {
  const [insights, setInsights] = useState<MarketDataInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleName, location]);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/career-web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleName,
          location,
          focusAreas: ['salary', 'requirements', 'daytoday', 'trends', 'skills'],
          includeEmerging: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to load insights');

      const data = await response.json();
      setInsights(data.webInsights || []);
      onInsightsLoaded?.(data.webInsights || []);
    } catch (err) {
      setError('Unable to load live insights. Please try again.');
      console.error('Insights loading error:', err);
    } finally {
      setLoading(false);
    }
  };


  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      salary: 'bg-blue-900/30 text-blue-400 border-blue-700/50',
      demand: 'bg-blue-800/30 text-blue-300 border-blue-600/50',
      skills: 'bg-blue-900/30 text-blue-400 border-blue-700/50',
      trends: 'bg-blue-800/30 text-blue-300 border-blue-600/50',
      lifestyle: 'bg-blue-900/30 text-blue-500 border-blue-700/50',
      emerging: 'bg-blue-700/30 text-blue-300 border-blue-600/50',
    };
    return colors[category] || 'bg-gray-800 text-gray-300 border-gray-700';
  };

  const getConfidenceBadge = (confidence: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      high: { color: 'bg-blue-900/50 text-blue-300', label: 'High Confidence' },
      medium: { color: 'bg-blue-800/50 text-blue-400', label: 'Medium Confidence' },
      low: { color: 'bg-blue-700/50 text-blue-500', label: 'Low Confidence' },
    };
    return badges[confidence] || badges.low;
  };

  const filteredInsights = selectedCategory === 'all'
    ? insights
    : insights.filter(i => i.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(insights.map(i => i.category)))];

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading live career insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg border border-red-700/50 p-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-red-400 font-semibold mb-1">Error Loading Insights</h3>
            <p className="text-gray-400 text-sm">{error}</p>
            <button
              onClick={loadInsights}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
        <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <p className="text-gray-400">No insights available for this role.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <h2 className="text-xl font-bold text-gray-100">Live Market Insights</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Live Data</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category === 'all' ? 'All Insights' : category}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredInsights.map((insight, index) => (
            <div
              key={index}
              className={`rounded-lg border p-4 ${getCategoryColor(insight.category)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-100">{insight.title}</h3>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceBadge(insight.confidence).color}`}>
                  {getConfidenceBadge(insight.confidence).label}
                </span>
              </div>

              <p className="text-gray-300 text-sm mb-3 leading-relaxed">{insight.content}</p>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">
                    Source: <span className="text-gray-400 font-medium">{insight.source}</span>
                  </span>
                  {insight.lastUpdated && (
                    <span className="text-gray-500">
                      Updated: {new Date(insight.lastUpdated).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {insight.url && (
                  <a
                    href={insight.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    Learn more
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={loadInsights}
            className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Insights
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-blue-700/50 p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="text-gray-300 mb-1">
              <strong className="text-blue-400">Note:</strong> This data is gathered from web sources and may vary by location, company, and individual circumstances.
            </p>
            <p className="text-gray-500 text-xs">
              Insights are automatically updated from current market data. Always verify important details through official sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
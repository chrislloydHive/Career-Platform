'use client';

import { useState } from 'react';
import { CareerWebSearchResult } from '@/lib/web-search/career-search-service';

interface EmergingRolesDiscoveryProps {
  category?: string;
}

export function EmergingRolesDiscovery({ category = 'technology' }: EmergingRolesDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState(category);
  const [emergingRoles, setEmergingRoles] = useState<CareerWebSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discoverRoles = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/career-web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleName: searchQuery,
          includeEmerging: true,
          focusAreas: ['trends'],
        }),
      });

      if (!response.ok) throw new Error('Failed to discover emerging roles');

      const data = await response.json();
      setEmergingRoles(data.searchResults || []);
    } catch (err) {
      setError('Unable to discover emerging roles. Please try again.');
      console.error('Discovery error:', err);
    } finally {
      setLoading(false);
    }
  };

  const suggestedCategories = [
    'Technology',
    'Healthcare',
    'Finance',
    'Marketing',
    'Design',
    'Wellness',
    'Remote Work',
    'AI & Automation',
    'Sustainability',
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-700/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Discover Emerging Roles</h2>
            <p className="text-gray-300 leading-relaxed">
              Explore cutting-edge career opportunities that are just emerging in the job market.
              These roles represent the future of work and may not yet be in traditional career databases.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
            Search for emerging roles in:
          </label>
          <div className="flex gap-3">
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && discoverRoles()}
              placeholder="e.g., AI, sustainability, remote work..."
              className="flex-1 px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={discoverRoles}
              disabled={loading || !searchQuery}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Discover
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-3">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedCategories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSearchQuery(cat);
                  setTimeout(() => discoverRoles(), 100);
                }}
                className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {emergingRoles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-100">
              Found {emergingRoles.length} Emerging {emergingRoles.length === 1 ? 'Role' : 'Roles'}
            </h3>
            <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Results
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {emergingRoles.map((role, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg border border-gray-700 p-5 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🚀</span>
                      <h4 className="text-lg font-semibold text-gray-100">{role.title}</h4>
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-3">{role.snippet}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <div className="flex items-center gap-1 px-3 py-1 bg-purple-900/30 text-purple-400 rounded-lg text-sm">
                      <span>📊</span>
                      <span>{Math.round(role.relevanceScore * 100)}% Match</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Source: <span className="text-gray-400">{role.source}</span></span>
                    {role.date && <span>Updated: {role.date}</span>}
                  </div>
                  <a
                    href={role.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
                  >
                    Learn More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="text-blue-400 font-medium mb-1">About Emerging Roles</p>
                <p className="text-gray-300">
                  These positions are identified from current web searches and may represent
                  newly created roles, evolving job titles, or specialized positions that are
                  gaining traction in the market. Research each thoroughly before pursuing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && emergingRoles.length === 0 && searchQuery && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-400">No emerging roles found for &quot;{searchQuery}&quot;. Try a different search term.</p>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { SavedItem } from '@/types/saved-items';
import { CareerDetailModal } from '@/components/CareerDetailModal';
import { JobCategory } from '@/types/career';

export default function SavedItemsPage() {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'job' | 'career'>('all');
  const [selectedCareer, setSelectedCareer] = useState<JobCategory | null>(null);

  useEffect(() => {
    loadSavedItems();
  }, []);

  async function loadSavedItems() {
    try {
      const response = await fetch('/api/saved-items');
      if (response.ok) {
        const data = await response.json();
        setSavedItems(data.items);
      }
    } catch (error) {
      console.error('Failed to load saved items:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemove(itemId: string) {
    try {
      await fetch(`/api/saved-items?id=${itemId}`, {
        method: 'DELETE',
      });
      setSavedItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  }

  const filteredItems = savedItems.filter(item =>
    filter === 'all' ? true : item.type === filter
  );

  const jobCount = savedItems.filter(item => item.type === 'job').length;
  const careerCount = savedItems.filter(item => item.type === 'career').length;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title="Saved Items"
        subtitle="Your saved jobs and careers"
      />

      <CareerDetailModal
        career={selectedCareer}
        onClose={() => setSelectedCareer(null)}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6 flex items-center justify-between overflow-x-auto scrollbar-hide pb-2">
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All ({savedItems.length})
            </button>
            <button
              onClick={() => setFilter('job')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'job'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Jobs ({jobCount})
            </button>
            <button
              onClick={() => setFilter('career')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'career'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Careers ({careerCount})
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">Loading saved items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
            <svg className="w-20 h-20 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-100 mb-2">No saved items yet</h3>
            <p className="text-gray-400 mb-6">
              Save jobs from your search results or careers from the explorer to keep track of opportunities.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.type === 'job'
                          ? 'bg-purple-900/50 text-purple-400'
                          : 'bg-blue-900/50 text-blue-400'
                      }`}>
                        {item.type === 'job' ? 'Job' : 'Career'}
                      </span>
                      {item.type === 'job' && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.job.source === 'linkedin'
                            ? 'bg-blue-900/50 text-blue-400'
                            : item.job.source === 'indeed'
                            ? 'bg-purple-900/50 text-purple-400'
                            : item.job.source === 'company_scraper'
                            ? 'bg-orange-900/50 text-orange-400'
                            : 'bg-green-900/50 text-green-400'
                        }`}>
                          {item.job.source === 'google_jobs' ? 'Google Jobs' : item.job.source === 'company_scraper' ? 'Company' : item.job.source}
                        </span>
                      )}
                    </div>

                    {item.type === 'job' ? (
                      <>
                        <h3 className="text-xl font-semibold text-gray-100 mb-1">{item.job.title}</h3>
                        <p className="text-gray-400 mb-2">{item.job.company} • {item.job.location}</p>
                        {item.job.salary && (
                          <p className="text-sm text-green-400 mb-2">
                            ${item.job.salary.min?.toLocaleString()} - ${item.job.salary.max?.toLocaleString()} {item.job.salary.currency}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 line-clamp-2">{item.job.description}</p>
                        <div className="mt-4 flex items-center gap-4">
                          <span className="text-sm text-gray-400">
                            Match Score: <span className="font-semibold text-blue-400">{item.job.score}%</span>
                          </span>
                          <a
                            href={item.job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            View job
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-semibold text-gray-100 mb-1">{item.career.title}</h3>
                        <p className="text-gray-400 mb-2 capitalize">{item.career.category}</p>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.career.description}</p>
                        {item.career.salaryRanges[0] && (
                          <p className="text-sm text-green-400 mb-2">
                            Median: ${item.career.salaryRanges[0].median.toLocaleString()}/year
                          </p>
                        )}
                        <button
                          onClick={() => setSelectedCareer(item.career)}
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          View details →
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="ml-4 p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remove from saved"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Saved {new Date(item.savedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

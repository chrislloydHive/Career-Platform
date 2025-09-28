'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { CareerExplorer } from '@/components/CareerExplorer';
import { CareerDetailModal } from '@/components/CareerDetailModal';
import { CareerComparisonTool } from '@/components/CareerComparisonTool';
import { CareerResearchModal } from '@/components/CareerResearchModal';
import { AiCareerSuggestionsPanel } from '@/components/AiCareerSuggestionsPanel';
import { JobCategory, CareerCategory } from '@/types/career';

export default function CareersPage() {
  const [selectedCareer, setSelectedCareer] = useState<JobCategory | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);

  const handleCareerSaved = async (career: JobCategory) => {
    setRefreshKey(prev => prev + 1);
    window.location.reload();
  };

  const handleTriggerAIResearch = (searchQuery: string) => {
    setAiSearchQuery(searchQuery);
    setShowResearch(true);
  };

  const handleCloseResearch = () => {
    setShowResearch(false);
    setAiSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title="Career Explorer"
        subtitle="Research career paths and opportunities"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showComparison ? (
          <div>
            <button
              onClick={() => setShowComparison(false)}
              className="mb-6 px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Explorer
            </button>
            <CareerComparisonTool />
          </div>
        ) : (
          <>
            <AiCareerSuggestionsPanel />
            <CareerExplorer
              key={refreshKey}
              onCareerSelect={setSelectedCareer}
              onTriggerAIResearch={handleTriggerAIResearch}
              onToggleComparison={() => setShowComparison(!showComparison)}
              filterCategory={filterCategory as CareerCategory | 'all' | undefined}
            />
          </>
        )}
      </main>

      <CareerDetailModal
        career={selectedCareer}
        onClose={() => setSelectedCareer(null)}
        onViewSimilar={(category) => {
          setFilterCategory(category);
          setRefreshKey(prev => prev + 1);
        }}
      />

      <CareerResearchModal
        isOpen={showResearch}
        onClose={handleCloseResearch}
        onSaveCareer={handleCareerSaved}
        initialJobTitle={aiSearchQuery}
      />
    </div>
  );
}
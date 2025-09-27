'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { CareerExplorer } from '@/components/CareerExplorer';
import { CareerDetailModal } from '@/components/CareerDetailModal';
import { CareerComparisonTool } from '@/components/CareerComparisonTool';
import { CareerResearchModal } from '@/components/CareerResearchModal';
import { JobCategory } from '@/types/career';

export default function CareersPage() {
  const [selectedCareer, setSelectedCareer] = useState<JobCategory | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [aiSearchQuery, setAiSearchQuery] = useState('');

  const handleCareerSaved = (career: JobCategory) => {
    setRefreshKey(prev => prev + 1);
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
        actions={
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showComparison
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {showComparison ? 'Explorer' : 'Compare'}
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showComparison ? (
          <CareerComparisonTool />
        ) : (
          <CareerExplorer
            key={refreshKey}
            onCareerSelect={setSelectedCareer}
            onTriggerAIResearch={handleTriggerAIResearch}
          />
        )}
      </main>

      <CareerDetailModal
        career={selectedCareer}
        onClose={() => setSelectedCareer(null)}
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
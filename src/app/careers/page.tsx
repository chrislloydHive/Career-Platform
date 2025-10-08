'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { CareerExplorer } from '@/components/CareerExplorer';
import { CareerDetailModal } from '@/components/CareerDetailModal';
import { CareerComparisonTool } from '@/components/CareerComparisonTool';
import { CareerResearchModal } from '@/components/CareerResearchModal';
import { ContextualChat } from '@/components/ContextualChat';
import { AssessmentBasedRecommendations } from '@/components/AssessmentBasedRecommendations';
import { JobCategory, CareerCategory } from '@/types/career';

export default function CareersPage() {
  const { data: session } = useSession();
  const [selectedCareer, setSelectedCareer] = useState<JobCategory | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const handleCareerSaved = async (career: JobCategory) => {
    setRefreshKey(prev => prev + 1);
    window.location.reload();
  };

  const handleTriggerAIResearch = (searchQuery: string) => {
    if (!session) {
      setAiSearchQuery(searchQuery);
      setShowAuthPrompt(true);
      return;
    }
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
        subtitle="Discover jobs you never knew existed (and how to get them)"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workflow Progress */}

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
            {/* Assessment-Based Recommendations */}
            <AssessmentBasedRecommendations />

            {/* Career Explorer */}
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

      {/* Contextual Chat */}
      <ContextualChat
        context="careers"
        contextData={{ careerTitle: selectedCareer?.title }}
      />

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-2">
                Want to Research &quot;{aiSearchQuery}&quot;?
              </h3>
              <p className="text-gray-400">
                Sign up to unlock AI-powered career research with salary data, day-to-day work insights, and how to break in.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/signup"
                className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-center transition-colors"
              >
                Sign Up Free
              </Link>
              <Link
                href="/login"
                className="block w-full px-6 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-gray-200 rounded-lg font-semibold text-center transition-colors"
              >
                Log In
              </Link>
              <button
                onClick={() => setShowAuthPrompt(false)}
                className="block w-full px-6 py-3 text-gray-400 hover:text-gray-300 text-sm transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
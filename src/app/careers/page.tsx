'use client';

import { useState } from 'react';
import { CareerExplorer } from '@/components/CareerExplorer';
import { CareerDetailModal } from '@/components/CareerDetailModal';
import { CareerComparisonTool } from '@/components/CareerComparisonTool';
import { JobCategory } from '@/types/career';

export default function CareersPage() {
  const [selectedCareer, setSelectedCareer] = useState<JobCategory | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Career Research</h1>
              <p className="text-sm text-gray-400">Explore career paths and opportunities</p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/careers/emerging"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <span>🚀</span>
                Emerging Roles
              </a>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showComparison
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {showComparison ? 'Back to Explorer' : 'Compare Careers'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showComparison ? (
          <CareerComparisonTool />
        ) : (
          <CareerExplorer onCareerSelect={setSelectedCareer} />
        )}
      </main>

      <CareerDetailModal
        career={selectedCareer}
        onClose={() => setSelectedCareer(null)}
      />
    </div>
  );
}
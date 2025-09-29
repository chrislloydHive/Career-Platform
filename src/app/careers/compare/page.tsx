'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { CareerPathComparison } from '@/components/CareerPathComparison';
import { CAREER_PATH_PROFILES } from '@/lib/career-paths/career-comparison-data';

export default function CareerComparePage() {
  const [selectedPaths, setSelectedPaths] = useState<string[]>(['data-analytics', 'product-management', 'ux-design']);
  const [showComparison, setShowComparison] = useState(true);

  const availablePaths = Object.keys(CAREER_PATH_PROFILES);

  const handlePathToggle = (pathId: string) => {
    setSelectedPaths(prev => {
      if (prev.includes(pathId)) {
        // Remove if already selected (but keep at least 2)
        return prev.length > 2 ? prev.filter(id => id !== pathId) : prev;
      } else {
        // Add if not selected (but max 4)
        return prev.length < 4 ? [...prev, pathId] : prev;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title="Career Path Comparison"
        subtitle="Compare lifestyle, skills, and growth potential across career paths"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/careers"
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Explorer
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-4">Compare Career Paths</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Understand the trade-offs between different career paths. Compare work-life balance,
            skill requirements, industry mobility, and risk/reward profiles to make informed decisions.
          </p>
        </div>

        {/* Path Selection */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Select Career Paths to Compare
            <span className="text-sm font-normal text-gray-400 ml-2">
              (Choose 2-4 paths)
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {availablePaths.map(pathId => {
              const path = CAREER_PATH_PROFILES[pathId];
              const isSelected = selectedPaths.includes(pathId);
              const canToggle = isSelected || selectedPaths.length < 4;

              return (
                <button
                  key={pathId}
                  onClick={() => canToggle && handlePathToggle(pathId)}
                  disabled={!canToggle}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : canToggle
                      ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-gray-500'
                      : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">{path.name}</h3>
                      <p className="text-sm opacity-90">{path.description.slice(0, 80)}...</p>
                    </div>
                    {isSelected && (
                      <div className="ml-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Selected: {selectedPaths.length}/4 paths
            </div>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {showComparison ? 'Hide' : 'Show'} Comparison
            </button>
          </div>
        </div>

        {/* Quick Insights */}
        {selectedPaths.length >= 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-green-300">Best for Work-Life Balance</h3>
              </div>
              <p className="text-green-200">
                {CAREER_PATH_PROFILES[
                  selectedPaths.reduce((best, pathId) =>
                    CAREER_PATH_PROFILES[pathId].lifestyle.workLifeBalance.score >
                    CAREER_PATH_PROFILES[best].lifestyle.workLifeBalance.score ? pathId : best
                  )
                ].name}
              </p>
            </div>

            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-blue-300">Highest Growth Potential</h3>
              </div>
              <p className="text-blue-200">
                {CAREER_PATH_PROFILES[
                  selectedPaths.reduce((best, pathId) =>
                    CAREER_PATH_PROFILES[pathId].riskReward.growthPotential >
                    CAREER_PATH_PROFILES[best].riskReward.growthPotential ? pathId : best
                  )
                ].name}
              </p>
            </div>

            <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-orange-300">Most Stable</h3>
              </div>
              <p className="text-orange-200">
                {CAREER_PATH_PROFILES[
                  selectedPaths.reduce((best, pathId) =>
                    CAREER_PATH_PROFILES[pathId].riskReward.stabilityScore >
                    CAREER_PATH_PROFILES[best].riskReward.stabilityScore ? pathId : best
                  )
                ].name}
              </p>
            </div>
          </div>
        )}

        {/* Comparison Component */}
        {showComparison && selectedPaths.length >= 2 && (
          <CareerPathComparison
            selectedPaths={selectedPaths}
            onPathSelection={setSelectedPaths}
          />
        )}

        {/* Help Text */}
        {selectedPaths.length < 2 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-200 mb-2">
              Select at least 2 career paths to start comparing
            </h3>
            <p className="text-gray-400">
              Choose the career paths you&apos;re considering and we&apos;ll show you detailed comparisons
              of lifestyle factors, skill requirements, industry mobility, and growth potential.
            </p>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Understanding the Comparisons</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-200 mb-2">What We Compare</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• <strong>Lifestyle:</strong> Work-life balance, travel, schedule flexibility, stress levels</li>
                <li>• <strong>Skills:</strong> Technical vs. people skills emphasis, learning requirements</li>
                <li>• <strong>Mobility:</strong> Industry transferability, career pivot options</li>
                <li>• <strong>Risk/Reward:</strong> Job stability, growth potential, salary progression</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-200 mb-2">How to Use This Tool</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Select 2-4 career paths you&apos;re considering</li>
                <li>• Use the tabs to explore different comparison aspects</li>
                <li>• Pay attention to trade-offs between different factors</li>
                <li>• Consider which factors matter most to your personal situation</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
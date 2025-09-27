'use client';

import { useState } from 'react';
import { AdaptiveQuestionnaire } from '@/components/AdaptiveQuestionnaire';
import { AdaptiveQuestioningEngine } from '@/lib/adaptive-questions/adaptive-engine';
import { DiscoveredInsight } from '@/lib/adaptive-questions/adaptive-engine';
import Link from 'next/link';

export default function ExplorePage() {
  const [showResults, setShowResults] = useState(false);
  const [profile, setProfile] = useState<ReturnType<AdaptiveQuestioningEngine['exportProfile']> | null>(null);
  const [recentInsight, setRecentInsight] = useState<DiscoveredInsight | null>(null);

  const handleComplete = (exportedProfile: ReturnType<AdaptiveQuestioningEngine['exportProfile']>) => {
    setProfile(exportedProfile);
    setShowResults(true);
  };

  const handleInsightDiscovered = (insight: DiscoveredInsight) => {
    setRecentInsight(insight);
    setTimeout(() => setRecentInsight(null), 5000);
  };

  if (showResults && profile) {
    return (
      <div className="min-h-screen bg-gray-950">
        <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-100">Your Career Profile</h1>
                <p className="text-sm text-gray-400">Based on adaptive exploration</p>
              </div>
              <Link
                href="/career-match"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Find Matching Careers
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {profile.completion}%
              </div>
              <div className="text-sm text-gray-400">Profile Completion</div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {profile.insights.length}
              </div>
              <div className="text-sm text-gray-400">Insights Discovered</div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {profile.analysis.strengths.length}
              </div>
              <div className="text-sm text-gray-400">Identified Strengths</div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="text-3xl font-bold text-orange-400 mb-1">
                {profile.analysis.hiddenInterests.length}
              </div>
              <div className="text-sm text-gray-400">Hidden Interests</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            {profile.analysis.strengths.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                  <span>💪</span>
                  Your Strengths
                </h2>
                <ul className="space-y-3">
                  {profile.analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preferences */}
            {profile.analysis.preferences.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                  <span>⚙️</span>
                  Work Preferences
                </h2>
                <ul className="space-y-3">
                  {profile.analysis.preferences.map((pref, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">→</span>
                      <span className="text-gray-300">{pref}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hidden Interests */}
            {profile.analysis.hiddenInterests.length > 0 && (
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-700/50 p-6">
                <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                  <span>🔮</span>
                  Hidden Interests
                </h2>
                <ul className="space-y-3">
                  {profile.analysis.hiddenInterests.map((interest, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-purple-400 mt-1">✨</span>
                      <span className="text-gray-300">{interest}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {profile.analysis.suggestions.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-orange-700/50 p-6">
                <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                  <span>💡</span>
                  Suggestions
                </h2>
                <ul className="space-y-3">
                  {profile.analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-orange-400 mt-1">→</span>
                      <span className="text-gray-300">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* All Insights */}
          <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-4">All Discovered Insights</h2>
            <div className="space-y-4">
              {profile.insights.map((insight, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                      insight.type === 'hidden-interest'
                        ? 'bg-purple-900/50 text-purple-400'
                        : insight.type === 'strength'
                        ? 'bg-green-900/50 text-green-400'
                        : insight.type === 'preference'
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-orange-900/50 text-orange-400'
                    }`}>
                      {insight.type.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-gray-300">{insight.insight}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Area: {insight.area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => {
                setShowResults(false);
                setProfile(null);
              }}
              className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Restart Exploration
            </button>
            <Link
              href="/career-match"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Find Career Matches
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Career Exploration</h1>
              <p className="text-sm text-gray-400">Discover your hidden interests and strengths</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/careers"
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Browse Careers
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <AdaptiveQuestionnaire
          onComplete={handleComplete}
          onInsightDiscovered={handleInsightDiscovered}
        />
      </main>

      {/* Insight Toast */}
      {recentInsight && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-4 shadow-xl max-w-md animate-slide-up">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <div className="font-semibold mb-1">New Insight Discovered!</div>
              <p className="text-sm opacity-90">{recentInsight.insight}</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
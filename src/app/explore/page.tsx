'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
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
        <Navigation
          title="Your Career Profile"
          subtitle="Based on adaptive exploration"
          actions={
            <Link
              href="/career-match"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Find Matches
            </Link>
          }
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
                {profile.patterns.consistencyPatterns.length}
              </div>
              <div className="text-sm text-gray-400">Pattern Matches</div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="text-3xl font-bold text-orange-400 mb-1">
                {profile.patterns.hiddenMotivations.length}
              </div>
              <div className="text-sm text-gray-400">Core Motivations</div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {Math.round((profile.insights.reduce((sum, i) => sum + i.confidence, 0) / profile.insights.length) * 100) || 0}%
              </div>
              <div className="text-sm text-gray-400">Avg Confidence</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            {profile.analysis.strengths.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-100 mb-4">
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
                <h2 className="text-xl font-bold text-gray-100 mb-4">
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
                <h2 className="text-xl font-bold text-gray-100 mb-4">
                  Hidden Interests
                </h2>
                <ul className="space-y-3">
                  {profile.analysis.hiddenInterests.map((interest, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-purple-400 mt-1">•</span>
                      <span className="text-gray-300">{interest}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {profile.analysis.suggestions.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-orange-700/50 p-6">
                <h2 className="text-xl font-bold text-gray-100 mb-4">
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

          {/* Pattern Analysis Section */}
          {profile.patterns && (
            <div className="mt-8 space-y-6">
              {/* Value Hierarchy */}
              {profile.patterns.valueHierarchy && profile.patterns.valueHierarchy.topValues.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-lg border border-indigo-700/50 p-6">
                  <h2 className="text-xl font-bold text-gray-100 mb-4">
                    Your Core Values
                  </h2>
                  <p className="text-gray-300 mb-4 italic">
                    "{profile.patterns.valueHierarchy.coreMotivation}"
                  </p>
                  <div className="space-y-3">
                    {profile.patterns.valueHierarchy.topValues.map((value, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-indigo-400">#{index + 1}</span>
                          <span className="text-gray-200 capitalize">{value.value}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500"
                              style={{ width: `${value.priority * 10}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-400">{Math.round(value.confidence * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preference Intensities */}
              {profile.patterns.preferenceIntensities && profile.patterns.preferenceIntensities.length > 0 && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h2 className="text-xl font-bold text-gray-100 mb-4">
                    Preference Intensity Analysis
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.patterns.preferenceIntensities.map((intensity, index) => (
                      <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-gray-200">{intensity.preference}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            intensity.intensity === 'strong'
                              ? 'bg-green-900/50 text-green-400'
                              : intensity.intensity === 'moderate'
                              ? 'bg-yellow-900/50 text-yellow-400'
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {intensity.intensity}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {intensity.evidence.length} supporting responses • {Math.round(intensity.confidence * 100)}% confidence
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hidden Motivations */}
              {profile.patterns.hiddenMotivations && profile.patterns.hiddenMotivations.length > 0 && (
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-700/50 p-6">
                  <h2 className="text-xl font-bold text-gray-100 mb-4">
                    Hidden Motivations
                  </h2>
                  <div className="space-y-4">
                    {profile.patterns.hiddenMotivations.map((motivation, index) => (
                      <div key={index} className="bg-gray-900/50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-purple-300">{motivation.motivation}</h3>
                          <span className="text-xs text-gray-400">{Math.round(motivation.confidence * 100)}% confidence</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{motivation.insight}</p>
                        <div className="flex flex-wrap gap-2">
                          {motivation.relatedAreas.map((area, i) => (
                            <span key={i} className="px-2 py-1 bg-purple-900/50 text-purple-400 rounded text-xs">
                              {area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Consistency Patterns */}
              {profile.patterns.consistencyPatterns && profile.patterns.consistencyPatterns.length > 0 && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h2 className="text-xl font-bold text-gray-100 mb-4">
                    Response Consistency Patterns
                  </h2>
                  <div className="space-y-3">
                    {profile.patterns.consistencyPatterns.map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-900 rounded-lg p-3">
                        <div className="flex-1">
                          <span className="text-gray-200 capitalize">{pattern.theme.replace('-', ' ')}</span>
                          <span className="text-xs text-gray-500 ml-2">in {pattern.area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${pattern.consistencyScore * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-400 w-12 text-right">{Math.round(pattern.confidence * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contradictions */}
              {profile.patterns.contradictions && profile.patterns.contradictions.length > 0 && (
                <div className="bg-yellow-900/20 rounded-lg border border-yellow-700/50 p-6">
                  <h2 className="text-xl font-bold text-gray-100 mb-4">
                    Areas for Clarification
                  </h2>
                  <div className="space-y-4">
                    {profile.patterns.contradictions.map((contradiction, index) => (
                      <div key={index} className="bg-gray-900/50 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            contradiction.severity === 'high'
                              ? 'bg-red-900/50 text-red-400'
                              : contradiction.severity === 'medium'
                              ? 'bg-yellow-900/50 text-yellow-400'
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {contradiction.severity}
                          </span>
                        </div>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {contradiction.possibleReasons.map((reason, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-1">•</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* All Insights */}
          <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-4">All Discovered Insights</h2>
            <div className="space-y-4">
              {profile.insights.map((insight, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                      insight.type === 'hidden-interest'
                        ? 'bg-blue-900/50 text-blue-400'
                        : insight.type === 'strength'
                        ? 'bg-blue-800/50 text-blue-300'
                        : insight.type === 'preference'
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-blue-700/50 text-blue-500'
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
      <Navigation
        title="Self Discovery"
        subtitle="Discover your hidden interests and strengths"
      />

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
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
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
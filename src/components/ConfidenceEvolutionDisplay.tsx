'use client';

import { useState } from 'react';
import {
  InsightEvolution,
  ConfidencePattern,
  EvolutionSummary,
} from '@/lib/insights/confidence-evolution';

interface ConfidenceEvolutionDisplayProps {
  evolutions: InsightEvolution[];
  patterns: ConfidencePattern[];
  summary: EvolutionSummary;
}

export function ConfidenceEvolutionDisplay({
  evolutions,
  patterns,
  summary,
}: ConfidenceEvolutionDisplayProps) {
  const [selectedTrend, setSelectedTrend] = useState<'all' | 'strengthening' | 'evolving' | 'validated' | 'changing'>('all');
  const [expandedEvolution, setExpandedEvolution] = useState<string | null>(null);

  const getTrendIcon = (trend: InsightEvolution['trend']) => {
    switch (trend) {
      case 'strengthening':
        return '📈';
      case 'weakening':
        return '📉';
      case 'stable':
        return '➡️';
      case 'fluctuating':
        return '〰️';
    }
  };

  const getTrendColor = (trend: InsightEvolution['trend']) => {
    switch (trend) {
      case 'strengthening':
        return 'text-green-400 bg-green-900/30 border-green-700';
      case 'weakening':
        return 'text-orange-400 bg-orange-900/30 border-orange-700';
      case 'stable':
        return 'text-blue-400 bg-blue-900/30 border-blue-700';
      case 'fluctuating':
        return 'text-purple-400 bg-purple-900/30 border-purple-700';
    }
  };

  const getPatternColor = (type: ConfidencePattern['type']) => {
    switch (type) {
      case 'strengthening':
        return 'border-green-500 bg-green-900/20';
      case 'evolving':
        return 'border-purple-500 bg-purple-900/20';
      case 'validated':
        return 'border-blue-500 bg-blue-900/20';
      case 'changing':
        return 'border-orange-500 bg-orange-900/20';
    }
  };

  const getPatternIcon = (type: ConfidencePattern['type']) => {
    switch (type) {
      case 'strengthening':
        return '💪';
      case 'evolving':
        return '🔄';
      case 'validated':
        return '✓';
      case 'changing':
        return '🔀';
    }
  };

  const filteredEvolutions = evolutions.filter(e => {
    if (selectedTrend === 'all') return true;
    if (selectedTrend === 'strengthening') return e.trend === 'strengthening';
    if (selectedTrend === 'evolving') return e.trend === 'fluctuating';
    if (selectedTrend === 'validated') return e.validated;
    if (selectedTrend === 'changing') return e.trend === 'weakening';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg border-2 border-blue-600/60 p-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-2 flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Your Self-Discovery Journey
        </h2>
        <p className="text-gray-300 text-sm mb-4">
          Watch how your understanding evolves as you explore. Confidence changes reveal strengthening patterns, validated hunches, and shifting priorities.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-800/70 rounded-lg p-4 border border-green-700/50">
            <div className="text-3xl font-bold text-green-400">{summary.strengtheningPatterns}</div>
            <div className="text-xs text-gray-400 mt-1">Strengthening</div>
          </div>
          <div className="bg-gray-800/70 rounded-lg p-4 border border-purple-700/50">
            <div className="text-3xl font-bold text-purple-400">{summary.evolvingPreferences}</div>
            <div className="text-xs text-gray-400 mt-1">Evolving</div>
          </div>
          <div className="bg-gray-800/70 rounded-lg p-4 border border-blue-700/50">
            <div className="text-3xl font-bold text-blue-400">{summary.validatedHunches}</div>
            <div className="text-xs text-gray-400 mt-1">Validated</div>
          </div>
          <div className="bg-gray-800/70 rounded-lg p-4 border border-orange-700/50">
            <div className="text-3xl font-bold text-orange-400">{summary.changingPriorities}</div>
            <div className="text-xs text-gray-400 mt-1">Changing</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Self-Discovery Progress</span>
            <span className="text-blue-400 font-semibold">
              {Math.round(summary.selfDiscoveryProgress * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${summary.selfDiscoveryProgress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {patterns.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-100">Confidence Patterns</h3>
          {patterns.map((pattern, index) => (
            <div
              key={index}
              className={`rounded-lg border-2 p-5 ${getPatternColor(pattern.type)}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{getPatternIcon(pattern.type)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-bold text-gray-100">{pattern.pattern}</h4>
                    <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium">
                      {Math.round(pattern.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm italic mb-3">{pattern.implication}</p>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                {pattern.insights.map((insight, i) => (
                  <div key={i} className="bg-gray-800/50 rounded p-3 text-sm text-gray-200">
                    {insight}
                  </div>
                ))}
              </div>

              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                <div className="text-xs font-semibold text-gray-400 mb-2">Evidence:</div>
                <ul className="space-y-1">
                  {pattern.evidence.map((e, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-100">Insight Evolution Timeline</h3>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'strengthening', 'evolving', 'validated', 'changing'] as const).map(trend => (
              <button
                key={trend}
                onClick={() => setSelectedTrend(trend)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedTrend === trend
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {trend.charAt(0).toUpperCase() + trend.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredEvolutions.map((evolution) => (
            <div
              key={evolution.insightId}
              className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => setExpandedEvolution(
                  expandedEvolution === evolution.insightId ? null : evolution.insightId
                )}
                className="w-full p-4 text-left hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getTrendIcon(evolution.trend)}</span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-gray-200 font-medium flex-1">{evolution.insightText}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTrendColor(evolution.trend)}`}>
                          {evolution.trend}
                        </span>
                        {evolution.validated && (
                          <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
                            Validated
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>
                        {Math.round(evolution.initialConfidence * 100)}% → {Math.round(evolution.currentConfidence * 100)}%
                      </span>
                      <span>•</span>
                      <span>
                        {Math.abs(evolution.trendStrength) > 0
                          ? `${evolution.trend === 'strengthening' ? '+' : ''}${Math.round(evolution.trendStrength * 100)}% change`
                          : 'No change'
                        }
                      </span>
                      <span>•</span>
                      <span>
                        {evolution.confidenceHistory.length} updates
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {expandedEvolution === evolution.insightId && (
                <div className="border-t border-gray-700 p-4 bg-gray-900/50">
                  <h5 className="text-sm font-semibold text-gray-300 mb-3">Confidence History</h5>
                  <div className="space-y-2">
                    {evolution.confidenceHistory.map((snapshot, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-16 text-xs text-gray-500">
                          Q{snapshot.questionCount}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  snapshot.confidence >= 0.8
                                    ? 'bg-green-500'
                                    : snapshot.confidence >= 0.6
                                    ? 'bg-blue-500'
                                    : 'bg-yellow-500'
                                }`}
                                style={{ width: `${snapshot.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-300 w-12 text-right">
                              {Math.round(snapshot.confidence * 100)}%
                            </span>
                          </div>
                          {snapshot.reason && (
                            <p className="text-xs text-gray-400 italic">{snapshot.reason}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredEvolutions.length === 0 && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
              <p className="text-gray-400">No insights match this filter yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
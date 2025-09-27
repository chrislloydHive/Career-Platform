'use client';

import { useState } from 'react';
import { InsightEvolution, ConfidencePattern, EvolutionSummary } from '@/lib/insights/confidence-evolution';

interface ConfidenceEvolutionPanelProps {
  evolutions: InsightEvolution[];
  patterns: ConfidencePattern[];
  summary: EvolutionSummary;
}

export function ConfidenceEvolutionPanel({
  evolutions,
  patterns,
  summary,
}: ConfidenceEvolutionPanelProps) {
  const [expandedEvolution, setExpandedEvolution] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'all' | 'strengthening' | 'weakening' | 'validated'>('all');

  const getTrendColor = (trend: InsightEvolution['trend']) => {
    switch (trend) {
      case 'strengthening':
        return 'text-green-400';
      case 'weakening':
        return 'text-orange-400';
      case 'stable':
        return 'text-blue-400';
      case 'fluctuating':
        return 'text-yellow-400';
    }
  };

  const getTrendIcon = (trend: InsightEvolution['trend']) => {
    switch (trend) {
      case 'strengthening':
        return (
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'weakening':
        return (
          <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'stable':
        return (
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
      case 'fluctuating':
        return (
          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        );
    }
  };

  const getProgressBarColor = (confidence: number) => {
    if (confidence >= 0.85) return 'bg-gradient-to-r from-blue-500 to-green-500';
    if (confidence >= 0.7) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (confidence >= 0.5) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const filteredEvolutions = evolutions.filter(evolution => {
    if (selectedView === 'all') return true;
    if (selectedView === 'strengthening') return evolution.trend === 'strengthening';
    if (selectedView === 'weakening') return evolution.trend === 'weakening';
    if (selectedView === 'validated') return evolution.validated;
    return true;
  });

  const renderConfidenceGraph = (evolution: InsightEvolution) => {
    const history = evolution.confidenceHistory;
    if (history.length < 2) return null;

    const maxPoints = 8;
    const displayHistory = history.length > maxPoints
      ? [history[0], ...history.slice(-maxPoints + 1)]
      : history;

    const graphWidth = 200;
    const graphHeight = 60;
    const padding = 4;

    const xStep = (graphWidth - padding * 2) / (displayHistory.length - 1);
    const yScale = graphHeight - padding * 2;

    const points = displayHistory.map((snapshot, index) => {
      const x = padding + index * xStep;
      const y = graphHeight - padding - (snapshot.confidence * yScale);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs font-semibold text-gray-400 mb-2">Confidence History</div>
        <svg width={graphWidth} height={graphHeight} className="w-full">
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={getTrendColor(evolution.trend)}
          />
          {displayHistory.map((snapshot, index) => {
            const x = padding + index * xStep;
            const y = graphHeight - padding - (snapshot.confidence * yScale);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="currentColor"
                className={getTrendColor(evolution.trend)}
              />
            );
          })}
          <line
            x1={padding}
            y1={graphHeight - padding}
            x2={graphWidth - padding}
            y2={graphHeight - padding}
            stroke="currentColor"
            strokeWidth="1"
            className="text-gray-700"
          />
        </svg>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{Math.round(evolution.initialConfidence * 100)}%</span>
          <span>{Math.round(evolution.currentConfidence * 100)}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border-2 border-blue-500/30 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white mb-1">Confidence Evolution</h3>
        <p className="text-sm text-blue-100">How your insights strengthen over time</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {summary.strengtheningPatterns}
            </div>
            <div className="text-xs text-gray-400">Strengthening</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {summary.validatedHunches}
            </div>
            <div className="text-xs text-gray-400">Validated</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-cyan-400 mb-1">
              {Math.round(summary.selfDiscoveryProgress * 100)}%
            </div>
            <div className="text-xs text-gray-400">Progress</div>
          </div>
        </div>

        <div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedView('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedView === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All ({evolutions.length})
            </button>
            <button
              onClick={() => setSelectedView('strengthening')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedView === 'strengthening'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Strengthening ({evolutions.filter(e => e.trend === 'strengthening').length})
            </button>
            <button
              onClick={() => setSelectedView('validated')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedView === 'validated'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Validated ({evolutions.filter(e => e.validated).length})
            </button>
          </div>

          <div className="space-y-3">
            {filteredEvolutions.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Keep answering to see confidence evolution
              </div>
            ) : (
              filteredEvolutions.map((evolution) => {
                const isExpanded = expandedEvolution === evolution.insightId;
                const confidenceChange = evolution.currentConfidence - evolution.initialConfidence;

                return (
                  <div
                    key={evolution.insightId}
                    className="bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-all"
                  >
                    <button
                      onClick={() => setExpandedEvolution(isExpanded ? null : evolution.insightId)}
                      className="w-full p-4"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0 mt-1">
                          {getTrendIcon(evolution.trend)}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-semibold ${getTrendColor(evolution.trend)}`}>
                              {evolution.trend.toUpperCase()}
                            </span>
                            {evolution.validated && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                                Validated
                              </span>
                            )}
                            {evolution.currentConfidence >= 0.85 && (
                              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                High Confidence
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-200 mb-3">{evolution.insightText}</p>

                          <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden mb-2">
                            <div
                              className={`h-full ${getProgressBarColor(evolution.currentConfidence)} transition-all duration-500`}
                              style={{ width: `${evolution.currentConfidence * 100}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">
                                {Math.round(evolution.initialConfidence * 100)}% → {Math.round(evolution.currentConfidence * 100)}%
                              </span>
                              {confidenceChange !== 0 && (
                                <span className={confidenceChange > 0 ? 'text-green-400' : 'text-orange-400'}>
                                  ({confidenceChange > 0 ? '+' : ''}{Math.round(confidenceChange * 100)}%)
                                </span>
                              )}
                            </div>
                            <span className="text-gray-500">
                              {evolution.confidenceHistory.length} updates
                            </span>
                          </div>
                        </div>

                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 mt-1 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4">
                        {renderConfidenceGraph(evolution)}

                        {evolution.confidenceHistory.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <div className="text-xs font-semibold text-gray-400 mb-2">Confidence Updates</div>
                            <div className="space-y-2">
                              {evolution.confidenceHistory.slice(-4).reverse().map((snapshot, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-gray-300">{Math.round(snapshot.confidence * 100)}%</span>
                                      <span className="text-gray-500">{snapshot.questionCount} questions</span>
                                    </div>
                                    {snapshot.reason && (
                                      <p className="text-gray-400">{snapshot.reason}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {patterns.length > 0 && (
          <div className="pt-6 border-t border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Confidence Patterns</h4>
            <div className="space-y-3">
              {patterns.slice(0, 3).map((pattern, idx) => (
                <div key={idx} className="bg-blue-500/10 border border-blue-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                      {pattern.type.toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-gray-200">{pattern.pattern}</span>
                  </div>
                  <p className="text-xs text-gray-300 mb-2">{pattern.implication}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700/30 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${pattern.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{Math.round(pattern.confidence * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
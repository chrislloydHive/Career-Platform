'use client';

import { useState } from 'react';
import {
  ValuesHierarchy,
  ValueDimension,
  ValueTradeOff,
  ValueConflict,
} from '@/lib/values/values-hierarchy-mapper';

interface ValuesHierarchyVisualizerProps {
  hierarchy: ValuesHierarchy;
  onTradeOffChoice?: (tradeOffIndex: number, choice: 'A' | 'B') => void;
}

export function ValuesHierarchyVisualizer({
  hierarchy,
  onTradeOffChoice,
}: ValuesHierarchyVisualizerProps) {
  const [selectedValue, setSelectedValue] = useState<ValueDimension | null>(null);
  const [showTradeOffs, setShowTradeOffs] = useState(false);

  const getTierColor = (tier: 'core' | 'important' | 'flexible') => {
    switch (tier) {
      case 'core':
        return 'from-blue-600 to-purple-600';
      case 'important':
        return 'from-green-600 to-blue-600';
      case 'flexible':
        return 'from-gray-600 to-gray-500';
    }
  };

  const getTierBorder = (tier: 'core' | 'important' | 'flexible') => {
    switch (tier) {
      case 'core':
        return 'border-blue-500';
      case 'important':
        return 'border-green-500';
      case 'flexible':
        return 'border-gray-500';
    }
  };

  const getConflictTypeColor = (type: ValueConflict['conflictType']) => {
    switch (type) {
      case 'inherent':
        return 'bg-red-900/30 text-red-400 border-red-700';
      case 'situational':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
      case 'developmental':
        return 'bg-purple-900/30 text-purple-400 border-purple-700';
    }
  };

  const renderValueTier = (
    title: string,
    values: ValueDimension[],
    tier: 'core' | 'important' | 'flexible',
    description: string
  ) => {
    if (values.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-100">{title}</h3>
          <span className="text-xs text-gray-500">{values.length} values</span>
        </div>
        <p className="text-sm text-gray-400 mb-4">{description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {values.map((value, index) => (
            <button
              key={value.value}
              onClick={() => setSelectedValue(selectedValue?.value === value.value ? null : value)}
              className={`text-left p-5 rounded-lg border-2 transition-all ${
                selectedValue?.value === value.value
                  ? `${getTierBorder(tier)} bg-gradient-to-r ${getTierColor(tier)}/20`
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`text-2xl font-bold ${
                    tier === 'core' ? 'text-blue-400' :
                    tier === 'important' ? 'text-green-400' :
                    'text-gray-400'
                  }`}>
                    #{index + 1}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-100 capitalize">
                    {value.value.replace('-', ' ')}
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-blue-400">
                    Priority {value.priority}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(value.confidence * 100)}% confidence
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getTierColor(tier)} transition-all`}
                    style={{ width: `${value.confidence * 100}%` }}
                  />
                </div>
              </div>

              {value.tradeOffWins + value.tradeOffLosses > 0 && (
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                  <span className="text-green-400">
                    ✓ {value.tradeOffWins} wins
                  </span>
                  <span className="text-orange-400">
                    ✗ {value.tradeOffLosses} losses
                  </span>
                </div>
              )}

              {selectedValue?.value === value.value && value.evidence.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs font-semibold text-gray-400 mb-2">Evidence:</div>
                  <ul className="space-y-1">
                    {value.evidence.slice(0, 3).map((evidence, i) => (
                      <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span className="line-clamp-2">{evidence}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg border-2 border-blue-600/60 p-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-2 flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Your Values Hierarchy
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed">{hierarchy.systemSummary}</p>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        {renderValueTier(
          '🎯 Core Values',
          hierarchy.coreTier,
          'core',
          'Non-negotiable values that define your career decisions'
        )}

        {renderValueTier(
          '⚖️ Important Values',
          hierarchy.importantTier,
          'important',
          'Significant priorities that influence your choices'
        )}

        {renderValueTier(
          '🔄 Flexible Values',
          hierarchy.flexibleTier,
          'flexible',
          'Values you appreciate but can compromise on'
        )}
      </div>

      {hierarchy.conflicts.length > 0 && (
        <div className="bg-yellow-900/20 rounded-lg border border-yellow-700/50 p-6">
          <h3 className="text-xl font-bold text-gray-100 mb-2 flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Value Conflicts
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Areas where your values create tension that requires trade-offs
          </p>
          <div className="space-y-4">
            {hierarchy.conflicts.map((conflict, index) => (
              <div key={index} className="bg-gray-900/50 rounded-lg p-5 border border-gray-700">
                <div className="flex items-start gap-3 mb-3">
                  <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${getConflictTypeColor(conflict.conflictType)}`}>
                    {conflict.conflictType}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-blue-400 capitalize">
                        {conflict.value1}
                      </span>
                      <span className="text-gray-500">vs</span>
                      <span className="font-semibold text-purple-400 capitalize">
                        {conflict.value2}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{conflict.description}</p>
                    <div className={`rounded-lg p-3 ${
                      conflict.resolutionConfidence > 0.7
                        ? 'bg-green-900/30 border border-green-700/50'
                        : 'bg-gray-800 border border-gray-700'
                    }`}>
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-400">Resolution:</span>
                        <span className="text-xs text-gray-500">
                          {Math.round(conflict.resolutionConfidence * 100)}% confident
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{conflict.resolution}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hierarchy.tradeOffs.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-100">Trade-Off Scenarios</h3>
            <button
              onClick={() => setShowTradeOffs(!showTradeOffs)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {showTradeOffs ? 'Hide' : 'Explore Trade-Offs'}
            </button>
          </div>

          {showTradeOffs && (
            <div className="space-y-4">
              {hierarchy.tradeOffs.map((tradeOff, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        tradeOff.difficulty === 'hard'
                          ? 'bg-red-900/50 text-red-400'
                          : tradeOff.difficulty === 'moderate'
                          ? 'bg-yellow-900/50 text-yellow-400'
                          : 'bg-green-900/50 text-green-400'
                      }`}>
                        {tradeOff.difficulty}
                      </span>
                      {tradeOff.chosenOption && (
                        <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-bold">
                          Answered
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-100">{tradeOff.scenario}</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => !tradeOff.chosenOption && onTradeOffChoice?.(index, 'A')}
                      disabled={!!tradeOff.chosenOption}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        tradeOff.chosenOption === 'A'
                          ? 'border-green-500 bg-green-900/30'
                          : tradeOff.chosenOption
                          ? 'border-gray-700 bg-gray-800 opacity-50'
                          : 'border-gray-700 bg-gray-800 hover:border-blue-500'
                      }`}
                    >
                      <div className="font-semibold text-blue-400 mb-2 capitalize">
                        Option A: {tradeOff.optionA.value}
                      </div>
                      <p className="text-sm text-gray-300">{tradeOff.optionA.description}</p>
                    </button>

                    <button
                      onClick={() => !tradeOff.chosenOption && onTradeOffChoice?.(index, 'B')}
                      disabled={!!tradeOff.chosenOption}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        tradeOff.chosenOption === 'B'
                          ? 'border-green-500 bg-green-900/30'
                          : tradeOff.chosenOption
                          ? 'border-gray-700 bg-gray-800 opacity-50'
                          : 'border-gray-700 bg-gray-800 hover:border-purple-500'
                      }`}
                    >
                      <div className="font-semibold text-purple-400 mb-2 capitalize">
                        Option B: {tradeOff.optionB.value}
                      </div>
                      <p className="text-sm text-gray-300">{tradeOff.optionB.description}</p>
                    </button>
                  </div>

                  {tradeOff.chosenOption && (
                    <div className="mt-4 bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
                      <p className="text-sm text-gray-300">{tradeOff.implication}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
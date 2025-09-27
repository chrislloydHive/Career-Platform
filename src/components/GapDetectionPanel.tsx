'use client';

import { useState } from 'react';
import { IdentifiedGap } from '@/lib/adaptive-questions/adaptive-engine';
import { Contradiction } from '@/lib/adaptive-questions/pattern-recognition';
import { ExplorationArea } from '@/lib/adaptive-questions/question-banks';

interface ExplorationProgress {
  area: ExplorationArea;
  completion: number;
  questionsAnswered: number;
  totalQuestions: number;
  hasInsights: boolean;
  hasGaps: boolean;
}

interface GapDetectionPanelProps {
  gaps: IdentifiedGap[];
  contradictions: Contradiction[];
  explorationProgress: ExplorationProgress[];
  totalResponses: number;
}

export function GapDetectionPanel({
  gaps,
  contradictions,
  explorationProgress,
  totalResponses,
}: GapDetectionPanelProps) {
  const [expandedArea, setExpandedArea] = useState<ExplorationArea | null>(null);
  const [showContradictions, setShowContradictions] = useState(false);

  const overallCompletion = Math.round(
    explorationProgress.reduce((sum, p) => sum + p.completion, 0) / explorationProgress.length
  );

  const criticalGaps = gaps.filter(g => g.importance === 'high');
  const highSeverityContradictions = contradictions.filter(c => c.severity === 'high');

  const getCompletionColor = (completion: number): string => {
    if (completion >= 75) return 'text-green-400';
    if (completion >= 50) return 'text-blue-400';
    if (completion >= 25) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getCompletionGradient = (completion: number): string => {
    if (completion >= 75) return 'from-green-500 to-emerald-600';
    if (completion >= 50) return 'from-blue-500 to-cyan-600';
    if (completion >= 25) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  const getAreaLabel = (area: ExplorationArea): string => {
    switch (area) {
      case 'work-style': return 'Work Style';
      case 'people-interaction': return 'People Interaction';
      case 'problem-solving': return 'Problem Solving';
      case 'creativity': return 'Creativity';
      case 'structure-flexibility': return 'Structure vs Flexibility';
      case 'values': return 'Values';
      case 'environment': return 'Environment';
      case 'learning-growth': return 'Learning & Growth';
    }
  };

  const getImportanceColor = (importance: 'high' | 'medium' | 'low'): string => {
    switch (importance) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-700/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-700/50';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-700/50';
    }
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low'): string => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-700/50';
      case 'medium': return 'bg-orange-500/20 text-orange-400 border-orange-700/50';
      case 'low': return 'bg-yellow-500/20 text-yellow-400 border-yellow-700/50';
    }
  };

  const renderExplorationProgress = () => {
    return (
      <div className="space-y-3">
        {explorationProgress.map((progress) => {
          const isExpanded = expandedArea === progress.area;
          const areaGaps = gaps.filter(g => g.area === progress.area);

          return (
            <div key={progress.area} className="bg-gray-800/50 rounded-lg border border-gray-700">
              <button
                onClick={() => setExpandedArea(isExpanded ? null : progress.area)}
                className="w-full p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-100">{getAreaLabel(progress.area)}</span>
                    {progress.hasGaps && (
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-medium">
                        {areaGaps.length} gap{areaGaps.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {progress.hasInsights && (
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${getCompletionColor(progress.completion)}`}>
                      {Math.round(progress.completion)}%
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getCompletionGradient(progress.completion)} transition-all duration-500`}
                    style={{ width: `${progress.completion}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {progress.questionsAnswered} of {progress.totalQuestions} questions
                  </span>
                </div>
              </button>

              {isExpanded && areaGaps.length > 0 && (
                <div className="px-4 pb-4 space-y-2 border-t border-gray-700/50 pt-3">
                  {areaGaps.map((gap, idx) => (
                    <div key={idx} className={`rounded-lg border p-3 ${getImportanceColor(gap.importance)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase">
                          {gap.importance} priority
                        </span>
                      </div>
                      <p className="text-sm mb-3">{gap.gap}</p>
                      {gap.suggestedQuestions.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold mb-2">Suggested Questions</div>
                          <div className="space-y-1">
                            {gap.suggestedQuestions.map((question, qidx) => (
                              <div key={qidx} className="flex items-start gap-2">
                                <span className="mt-1">•</span>
                                <span className="text-xs">{question}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderContradictions = () => {
    if (contradictions.length === 0) return null;

    return (
      <div className="bg-gray-800/50 rounded-lg border border-orange-700/50 overflow-hidden">
        <button
          onClick={() => setShowContradictions(!showContradictions)}
          className="w-full bg-orange-500/10 px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-orange-300">
              {contradictions.length} Contradiction{contradictions.length > 1 ? 's' : ''} Detected
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-orange-400 transition-transform ${showContradictions ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showContradictions && (
          <div className="p-4 space-y-3">
            {contradictions.map((contradiction, idx) => (
              <div key={idx} className={`rounded-lg border p-4 ${getSeverityColor(contradiction.severity)}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase">
                    {contradiction.severity} severity
                  </span>
                </div>

                <div className="space-y-3 mb-3">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-xs font-semibold mb-1">Question 1</div>
                    <p className="text-sm">{contradiction.question1}</p>
                    <div className="mt-2 text-xs text-gray-400">
                      Response: {String(contradiction.responses[0])}
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-xs font-semibold mb-1">Question 2</div>
                    <p className="text-sm">{contradiction.question2}</p>
                    <div className="mt-2 text-xs text-gray-400">
                      Response: {String(contradiction.responses[1])}
                    </div>
                  </div>
                </div>

                {contradiction.possibleReasons.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold mb-2">Possible Reasons</div>
                    <div className="space-y-1">
                      {contradiction.possibleReasons.map((reason, ridx) => (
                        <div key={ridx} className="flex items-start gap-2">
                          <span className="mt-1">•</span>
                          <span className="text-xs">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCriticalGapsAlert = () => {
    if (criticalGaps.length === 0) return null;

    return (
      <div className="bg-red-500/10 border border-red-700/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <div className="text-sm font-semibold text-red-300 mb-1">Critical Information Missing</div>
            <p className="text-xs text-gray-300 mb-3">
              {criticalGaps.length} critical area{criticalGaps.length > 1 ? 's' : ''} need{criticalGaps.length === 1 ? 's' : ''} more exploration for accurate career matching
            </p>
            <div className="space-y-2">
              {criticalGaps.map((gap, idx) => (
                <div key={idx} className="bg-gray-900/50 rounded-lg p-2">
                  <div className="text-xs font-semibold text-red-300 mb-1">
                    {getAreaLabel(gap.area)}
                  </div>
                  <p className="text-xs text-gray-300">{gap.gap}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border-2 border-purple-500/30 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Discovery Progress</h3>
            <p className="text-sm text-purple-100">Areas needing exploration and resolution</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{overallCompletion}%</div>
            <div className="text-xs text-purple-100">Complete</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {renderCriticalGapsAlert()}

        {highSeverityContradictions.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-700/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="text-sm font-semibold text-orange-300 mb-1">
                  {highSeverityContradictions.length} High-Priority Contradiction{highSeverityContradictions.length > 1 ? 's' : ''}
                </div>
                <p className="text-xs text-gray-300">
                  Some responses conflict with each other. Review them for more accurate insights.
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-300">Exploration Areas</h4>
            <span className="text-xs text-gray-500">{totalResponses} total responses</span>
          </div>
          {renderExplorationProgress()}
        </div>

        {renderContradictions()}

        {gaps.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-700/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="text-sm font-semibold text-blue-300 mb-1">Fill Knowledge Gaps</div>
                <p className="text-xs text-gray-300">
                  Continue answering questions to fill in {gaps.length} identified gap{gaps.length > 1 ? 's' : ''} and improve your career matches.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
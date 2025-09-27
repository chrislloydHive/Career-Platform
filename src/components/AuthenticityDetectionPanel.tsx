'use client';

import { useState } from 'react';
import { AuthenticityProfile, AuthenticPreference, SelfPerceptionGap } from '@/lib/authenticity/authentic-self-detector';
import { AdaptiveQuestion } from '@/lib/adaptive-questions/question-banks';

interface AuthenticityDetectionPanelProps {
  authenticityProfile: AuthenticityProfile;
  onAnswerProbingQuestion?: (questionId: string, answer: string) => void;
}

export function AuthenticityDetectionPanel({
  authenticityProfile,
  onAnswerProbingQuestion,
}: AuthenticityDetectionPanelProps) {
  const [expandedPreference, setExpandedPreference] = useState<string | null>(null);
  const [expandedGap, setExpandedGap] = useState<string | null>(null);

  const { overallAuthenticity, authenticPreferences, perceptionGaps, probingQuestions } = authenticityProfile;

  const getAuthenticityColor = (score: number) => {
    if (score >= 0.7) return 'text-green-400';
    if (score >= 0.5) return 'text-blue-400';
    return 'text-orange-400';
  };

  const getAuthenticityGradient = (score: number) => {
    if (score >= 0.7) return 'from-green-500 to-emerald-600';
    if (score >= 0.5) return 'from-blue-500 to-cyan-600';
    return 'from-orange-500 to-yellow-600';
  };

  const getGapSizeColor = (size: SelfPerceptionGap['gapSize']) => {
    switch (size) {
      case 'large':
        return 'bg-orange-500/20 text-orange-400 border-orange-700/50';
      case 'moderate':
        return 'bg-blue-500/20 text-blue-400 border-blue-700/50';
      case 'small':
        return 'bg-green-500/20 text-green-400 border-green-700/50';
    }
  };

  const renderAuthenticityGauge = () => {
    const percentage = Math.round(overallAuthenticity * 100);
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-32 h-32 mx-auto">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-700"
          />
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={getAuthenticityColor(overallAuthenticity)}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${getAuthenticityColor(overallAuthenticity)}`}>
            {percentage}%
          </span>
          <span className="text-xs text-gray-400">Authenticity</span>
        </div>
      </div>
    );
  };

  const renderPreferenceBreakdown = (preference: AuthenticPreference) => {
    const isExpanded = expandedPreference === preference.preference;

    return (
      <div
        key={preference.preference}
        className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 hover:border-blue-500/50 transition-all"
      >
        <button
          onClick={() => setExpandedPreference(isExpanded ? null : preference.preference)}
          className="w-full text-left"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-100">{preference.preference}</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${getAuthenticityColor(preference.authenticityScore)}`}>
                {Math.round(preference.authenticityScore * 100)}%
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
              className={`h-full rounded-full bg-gradient-to-r ${getAuthenticityGradient(preference.authenticityScore)}`}
              style={{ width: `${preference.authenticityScore * 100}%` }}
            />
          </div>
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-3 pt-3 border-t border-gray-700/50">
            {preference.shouldWantSignals.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-orange-400 mb-2">
                  Should-Want Signals
                </div>
                {preference.shouldWantSignals.map((signal, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-gray-300">{signal}</span>
                  </div>
                ))}
              </div>
            )}

            {preference.actuallyWantSignals.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-green-400 mb-2">
                  Actually-Want Signals
                </div>
                {preference.actuallyWantSignals.map((signal, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-gray-300">{signal}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-700/30 rounded-lg p-3 mt-3">
              <p className="text-xs text-blue-300">{preference.recommendation}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPerceptionGap = (gap: SelfPerceptionGap) => {
    const isExpanded = expandedGap === gap.stated;

    return (
      <div
        key={gap.stated}
        className={`rounded-lg border p-4 ${getGapSizeColor(gap.gapSize)}`}
      >
        <button
          onClick={() => setExpandedGap(isExpanded ? null : gap.stated)}
          className="w-full text-left"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-80">
                {gap.gapSize} gap detected
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-400">You say: </span>
                  <span className="text-sm text-gray-100">{gap.stated}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Behavior suggests: </span>
                  <span className="text-sm text-gray-100">{gap.actual}</span>
                </div>
              </div>
            </div>
            <svg
              className={`w-4 h-4 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isExpanded && (
          <div className="space-y-3 pt-3 border-t border-current border-opacity-20">
            <div>
              <div className="text-xs font-semibold mb-2">Evidence</div>
              <div className="space-y-1">
                {gap.evidence.map((ev, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0 opacity-60" />
                    <span className="text-xs text-gray-300">{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold mb-2">Possible Reasons</div>
              <div className="space-y-1">
                {gap.possibleReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0 opacity-60" />
                    <span className="text-xs text-gray-300">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProbingQuestion = (question: AdaptiveQuestion) => {
    return (
      <div key={question.id} className="bg-gray-800/50 rounded-lg border border-blue-700/50 p-5">
        <h4 className="text-base font-semibold text-gray-100 mb-4">{question.text}</h4>
        <div className="space-y-2">
          {question.options?.map((option) => (
            <button
              key={option.value}
              onClick={() => onAnswerProbingQuestion?.(question.id, option.value)}
              className="w-full text-left bg-gray-900/50 hover:bg-blue-600 hover:border-blue-500 border border-gray-700 rounded-lg p-4 transition-all group"
            >
              <div className="text-sm font-medium text-gray-100 group-hover:text-white">
                {option.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border-2 border-blue-500/30 p-6 space-y-6">
      <div className="border-b border-gray-700/50 pb-4">
        <h3 className="text-xl font-bold text-gray-100 mb-2">Authenticity Analysis</h3>
        <p className="text-sm text-gray-400">
          Understanding the gap between expected and genuine preferences
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800/30 rounded-lg p-6">
          <h4 className="text-sm font-semibold text-gray-300 text-center mb-4">
            Overall Authenticity Score
          </h4>
          {renderAuthenticityGauge()}
          <p className="text-xs text-gray-400 text-center mt-4 max-w-xs mx-auto">
            {overallAuthenticity >= 0.7
              ? 'Strong authenticity signals. You appear clear about your genuine preferences.'
              : overallAuthenticity >= 0.5
              ? 'Mixed signals detected. Some responses may reflect expectations rather than desires.'
              : 'Many obligation-based responses. Consider what you would choose if no one was watching.'}
          </p>
        </div>

        {authenticPreferences.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              Preference Breakdown
              <span className="text-xs font-normal text-gray-500">
                (Click to expand)
              </span>
            </h4>
            <div className="space-y-3">
              {authenticPreferences.map(renderPreferenceBreakdown)}
            </div>
          </div>
        )}

        {perceptionGaps.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">
              Self-Perception Gaps
            </h4>
            <div className="space-y-3">
              {perceptionGaps.map(renderPerceptionGap)}
            </div>
          </div>
        )}

        {probingQuestions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">
              Probing Questions
            </h4>
            <div className="space-y-4">
              {probingQuestions.map(renderProbingQuestion)}
            </div>
          </div>
        )}

        {authenticityProfile.insights.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-700/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-300 mb-3">Key Insights</h4>
            <div className="space-y-2">
              {authenticityProfile.insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
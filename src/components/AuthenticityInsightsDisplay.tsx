'use client';

import { useState } from 'react';
import {
  AuthenticityProfile,
  AuthenticPreference,
  SelfPerceptionGap,
} from '@/lib/authenticity/authentic-self-detector';
import { AdaptiveQuestion } from '@/lib/adaptive-questions/question-banks';

interface AuthenticityInsightsDisplayProps {
  profile: AuthenticityProfile;
  onAnswerProbingQuestion?: (questionId: string, response: unknown) => void;
}

export function AuthenticityInsightsDisplay({
  profile,
  onAnswerProbingQuestion,
}: AuthenticityInsightsDisplayProps) {
  const [expandedGap, setExpandedGap] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  const getAuthenticityColor = (score: number) => {
    if (score >= 0.7) return 'text-green-400';
    if (score >= 0.5) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getAuthenticityBgColor = (score: number) => {
    if (score >= 0.7) return 'bg-green-600';
    if (score >= 0.5) return 'bg-yellow-600';
    return 'bg-orange-600';
  };

  const getGapSizeColor = (size: 'large' | 'moderate' | 'small') => {
    switch (size) {
      case 'large':
        return 'bg-red-900/30 text-red-400 border-red-700';
      case 'moderate':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
      case 'small':
        return 'bg-blue-900/30 text-blue-400 border-blue-700';
    }
  };

  const handleQuestionResponse = (question: AdaptiveQuestion, optionValue: string) => {
    if (onAnswerProbingQuestion) {
      onAnswerProbingQuestion(question.id, optionValue);
      setAnsweredQuestions(new Set([...answeredQuestions, question.id]));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg border-2 border-purple-600/60 p-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-2 flex items-center gap-2">
          <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Authentic Self Discovery
        </h2>
        <p className="text-gray-300 text-sm mb-4">
          Exploring the difference between what you think you should want and what genuinely excites you
        </p>

        <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-400">Overall Authenticity</span>
            <span className={`text-2xl font-bold ${getAuthenticityColor(profile.overallAuthenticity)}`}>
              {Math.round(profile.overallAuthenticity * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getAuthenticityBgColor(profile.overallAuthenticity)} transition-all`}
              style={{ width: `${profile.overallAuthenticity * 100}%` }}
            />
          </div>
        </div>
      </div>

      {profile.insights.length > 0 && (
        <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-5">
          <h3 className="text-lg font-bold text-purple-400 mb-3">Key Insights</h3>
          <ul className="space-y-2">
            {profile.insights.map((insight, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {profile.authenticPreferences.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Your Preferences: Authentic vs Adapted</h3>
          <p className="text-sm text-gray-400 mb-4">
            Understanding which preferences come from genuine excitement vs external expectations
          </p>
          <div className="space-y-4">
            {profile.authenticPreferences.map((pref, index) => (
              <div key={index} className="bg-gray-900/50 rounded-lg p-5 border border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-100 flex-1">{pref.preference}</h4>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${getAuthenticityColor(pref.authenticityScore)}`}>
                      {Math.round(pref.authenticityScore * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">authentic</div>
                  </div>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden mb-4">
                  <div
                    className={`h-full ${getAuthenticityBgColor(pref.authenticityScore)} transition-all`}
                    style={{ width: `${pref.authenticityScore * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  {pref.shouldWantSignals.length > 0 && (
                    <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-orange-400 mb-2">
                        "Should-Want" Signals
                      </div>
                      <ul className="space-y-1">
                        {pref.shouldWantSignals.map((signal, i) => (
                          <li key={i} className="text-xs text-gray-400 flex items-start gap-1">
                            <span className="text-orange-400">⚠</span>
                            <span>{signal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {pref.actuallyWantSignals.length > 0 && (
                    <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-green-400 mb-2">
                        "Actually-Want" Signals
                      </div>
                      <ul className="space-y-1">
                        {pref.actuallyWantSignals.map((signal, i) => (
                          <li key={i} className="text-xs text-gray-400 flex items-start gap-1">
                            <span className="text-green-400">✓</span>
                            <span>{signal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                  <p className="text-sm text-gray-300">{pref.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.perceptionGaps.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-100 mb-2 flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Self-Perception Gaps
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Areas where what you say differs from what your behavior reveals
          </p>
          <div className="space-y-4">
            {profile.perceptionGaps.map((gap, index) => (
              <div key={index} className="bg-gray-900/50 rounded-lg p-5 border border-gray-700">
                <div className="flex items-start gap-3 mb-4">
                  <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${getGapSizeColor(gap.gapSize)}`}>
                    {gap.gapSize} gap
                  </span>
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs font-semibold text-gray-400 mb-1">What you say:</div>
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                          <p className="text-sm text-blue-400">{gap.stated}</p>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-400 mb-1">What behavior suggests:</div>
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                          <p className="text-sm text-purple-400">{gap.actual}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedGap(expandedGap === index ? null : index)}
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium mb-3"
                    >
                      {expandedGap === index ? 'Hide details' : 'Show evidence and possible reasons'}
                    </button>

                    {expandedGap === index && (
                      <div className="space-y-3 mt-3">
                        <div>
                          <div className="text-xs font-semibold text-gray-400 mb-2">Evidence:</div>
                          <ul className="space-y-1">
                            {gap.evidence.map((evidence, i) => (
                              <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                <span className="text-blue-400 mt-0.5">•</span>
                                <span>{evidence}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-400 mb-2">Possible reasons:</div>
                          <ul className="space-y-1">
                            {gap.possibleReasons.map((reason, i) => (
                              <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">→</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.probingQuestions.length > 0 && (
        <div className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 rounded-lg border-2 border-pink-600/60 p-6">
          <h3 className="text-xl font-bold text-gray-100 mb-2">Probing Questions</h3>
          <p className="text-sm text-gray-300 mb-4">
            These questions can help reveal your authentic preferences
          </p>
          <div className="space-y-4">
            {profile.probingQuestions.map((question) => {
              const isAnswered = answeredQuestions.has(question.id);

              return (
                <div key={question.id} className="bg-gray-900/70 rounded-lg p-5 border border-gray-700">
                  <div className="flex items-start gap-2 mb-4">
                    {isAnswered && (
                      <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-bold">
                        Answered
                      </span>
                    )}
                    <h4 className="text-base font-semibold text-gray-100 flex-1">{question.text}</h4>
                  </div>

                  <div className="space-y-3">
                    {question.options?.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleQuestionResponse(question, option.value)}
                        disabled={isAnswered}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          isAnswered
                            ? 'border-gray-700 bg-gray-800 opacity-50 cursor-not-allowed'
                            : 'border-gray-700 bg-gray-800 hover:border-pink-500 hover:bg-gray-750'
                        }`}
                      >
                        <p className="text-sm text-gray-200">{option.label}</p>
                        {option.insight && (
                          <p className="text-xs text-gray-500 mt-1 italic">{option.insight}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
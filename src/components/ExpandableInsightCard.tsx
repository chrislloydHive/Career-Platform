'use client';

import { useState } from 'react';
import { DiscoveredInsight } from '@/lib/adaptive-questions/adaptive-engine';
import { SynthesizedInsight } from '@/lib/adaptive-questions/insight-synthesis';
import { CareerFitScore } from '@/lib/matching/realtime-career-matcher';
import { getQuestionById, ExplorationArea } from '@/lib/adaptive-questions/question-banks';

interface ExpandableInsightCardProps {
  insight: DiscoveredInsight | SynthesizedInsight;
  responses: Record<string, { questionId: string; response: unknown; timestamp: Date }>;
  topCareers?: CareerFitScore[];
  onExpand?: () => void;
  getAreaLabel: (area: ExplorationArea) => string;
}

type TabType = 'evidence' | 'careers' | 'explore';

export function ExpandableInsightCard({
  insight,
  responses,
  topCareers = [],
  onExpand,
  getAreaLabel,
}: ExpandableInsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('evidence');

  const isSynthesized = 'title' in insight;
  const synthInsight = isSynthesized ? (insight as SynthesizedInsight) : null;
  const regularInsight = !isSynthesized ? (insight as DiscoveredInsight) : null;

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && onExpand) {
      onExpand();
    }
  };

  const getEvidence = () => {
    if (!regularInsight) return [];

    return regularInsight.basedOn
      .map(questionId => {
        const question = getQuestionById(questionId);
        const response = responses[questionId];
        if (!question || !response) return null;

        return {
          questionId,
          questionText: question.text,
          responseValue: response.response,
          area: question.area,
        };
      })
      .filter((item): item is { questionId: string; questionText: string; responseValue: unknown; area: ExplorationArea } => item !== null);
  };

  const getRelatedCareers = () => {
    if (!regularInsight) return [];

    const insightText = regularInsight.insight.toLowerCase();

    return topCareers.filter(career => {
      return career.matchFactors.some(factor =>
        factor.basedOn.some(evidence =>
          evidence.toLowerCase().includes(insightText.substring(0, 20)) ||
          insightText.includes(factor.factor.toLowerCase())
        )
      );
    }).slice(0, 5);
  };

  const getFollowUpQuestions = () => {
    if (!regularInsight) return [];

    const followUps = regularInsight.basedOn
      .map(questionId => {
        const question = getQuestionById(questionId);
        return question?.followUpConditions || [];
      })
      .flat()
      .slice(0, 3);

    return followUps.map(condition => ({
      reason: condition.reason,
      questionIds: condition.then,
    }));
  };

  const formatResponse = (response: unknown): string => {
    if (typeof response === 'string') return response;
    if (typeof response === 'number') return response.toString();
    if (typeof response === 'boolean') return response ? 'Yes' : 'No';
    if (Array.isArray(response)) return response.join(', ');
    return JSON.stringify(response);
  };

  const evidence = getEvidence();
  const relatedCareers = getRelatedCareers();
  const followUps = getFollowUpQuestions();

  return (
    <div
      className={`bg-gray-800/60 rounded-lg border-l-4 ${
        isSynthesized ? 'border-purple-500' : 'border-blue-500'
      } transition-all duration-300 ${
        isExpanded ? 'shadow-xl' : 'hover:bg-gray-800/80'
      }`}
    >
      <button
        onClick={handleToggle}
        className="w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              {isSynthesized && (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-600 text-white">
                  CROSS-DOMAIN
                </span>
              )}
              {!isSynthesized && regularInsight?.area && (
                <span className="text-xs font-medium text-blue-400">
                  {getAreaLabel(regularInsight.area)}
                </span>
              )}
              {isExpanded && (
                <span className="text-xs text-gray-500">Click to collapse</span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-100 leading-relaxed">
              {isSynthesized ? synthInsight?.title : regularInsight?.insight}
            </p>
            {isSynthesized && synthInsight && !isExpanded && (
              <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">
                {synthInsight.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-1 rounded">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {Math.round(insight.confidence * 100)}%
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-700/50">
          {/* Tab Navigation */}
          <div className="flex gap-1 p-2 bg-gray-900/50">
            <button
              onClick={() => setActiveTab('evidence')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'evidence'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Evidence ({evidence.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('careers')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'careers'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Careers ({relatedCareers.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'explore'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Explore ({followUps.length})
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'evidence' && (
              <div className="space-y-3">
                {evidence.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No direct evidence available for this insight.</p>
                ) : (
                  evidence.map((item, idx) => (
                    <div key={idx} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="p-1 bg-blue-500/10 rounded">
                          <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 mb-1">{getAreaLabel(item.area)}</p>
                          <p className="text-sm text-gray-300 font-medium mb-2">{item.questionText}</p>
                          <div className="bg-blue-900/20 border-l-2 border-blue-500 pl-3 py-1.5">
                            <p className="text-xs text-gray-400 mb-0.5">Your response:</p>
                            <p className="text-sm text-blue-300 font-medium">{formatResponse(item.responseValue)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'careers' && (
              <div className="space-y-2">
                {relatedCareers.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">This insight doesn&apos;t directly affect any specific careers yet. Keep answering questions to see connections!</p>
                ) : (
                  <>
                    <p className="text-xs text-gray-400 mb-3">This insight affects your match scores for:</p>
                    {relatedCareers.map((career, idx) => (
                      <div key={idx} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 hover:border-green-500/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-semibold text-gray-100">{career.careerTitle}</h5>
                          <span className="text-lg font-bold text-green-400">{Math.round(career.currentScore)}%</span>
                        </div>
                        <div className="space-y-1">
                          {career.matchFactors.slice(0, 2).map((factor, factorIdx) => (
                            <div key={factorIdx} className="text-xs text-gray-400">
                              <span className="text-blue-400 font-medium">{factor.factor}</span>
                              {factor.strength === 'strong' && <span className="ml-1 text-green-400">★★★</span>}
                              {factor.strength === 'moderate' && <span className="ml-1 text-yellow-400">★★</span>}
                              {factor.strength === 'weak' && <span className="ml-1 text-gray-500">★</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {activeTab === 'explore' && (
              <div className="space-y-3">
                {followUps.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No additional follow-up questions available for this insight.</p>
                ) : (
                  <>
                    <p className="text-xs text-gray-400 mb-3">Based on this insight, you could explore:</p>
                    {followUps.map((followUp, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-lg p-3 border border-blue-700/30">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm text-gray-300">{followUp.reason}</p>
                            <p className="text-xs text-cyan-400 mt-1">{followUp.questionIds.length} related question{followUp.questionIds.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
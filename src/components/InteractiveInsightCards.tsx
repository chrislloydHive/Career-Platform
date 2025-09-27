'use client';

import { useState } from 'react';
import { DiscoveredInsight } from '@/lib/adaptive-questions/adaptive-engine';
import {
  InsightExplorer,
  ExploredInsight,
  InsightRefinement,
} from '@/lib/insights/insight-explorer';
import { UserProfile } from '@/types/user-profile';

interface InteractiveInsightCardsProps {
  insights: DiscoveredInsight[];
  userProfile?: UserProfile;
  onAskRelatedQuestion?: (question: string) => void;
  onRefineInsight?: (insight: DiscoveredInsight, refinement: InsightRefinement) => void;
  onExploreCareer?: (careerTitle: string) => void;
}

type TabType = 'evidence' | 'explore' | 'careers' | 'refine';

export function InteractiveInsightCards({
  insights,
  userProfile,
  onAskRelatedQuestion,
  onRefineInsight,
  onExploreCareer,
}: InteractiveInsightCardsProps) {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('evidence');
  const [exploredInsights, setExploredInsights] = useState<Map<string, ExploredInsight>>(new Map());

  const handleCardClick = (insight: DiscoveredInsight) => {
    const insightKey = insight.insight;

    if (expandedInsight === insightKey) {
      setExpandedInsight(null);
      return;
    }

    setExpandedInsight(insightKey);

    if (!exploredInsights.has(insightKey)) {
      const explorer = new InsightExplorer(insight, insights, userProfile);
      const explored = explorer.explore();
      setExploredInsights(new Map(exploredInsights.set(insightKey, explored)));
    }
  };

  const getTypeColor = (type: DiscoveredInsight['type']) => {
    switch (type) {
      case 'strength':
        return 'from-green-600 to-emerald-600';
      case 'preference':
        return 'from-blue-600 to-cyan-600';
      case 'hidden-interest':
        return 'from-purple-600 to-pink-600';
      case 'growth-area':
        return 'from-orange-600 to-yellow-600';
    }
  };

  const getTypeIcon = (type: DiscoveredInsight['type']) => {
    switch (type) {
      case 'strength':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case 'preference':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'hidden-interest':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      case 'growth-area':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 0.7) return 'bg-green-500';
    if (strength >= 0.4) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getStrengthWidth = (strength: number) => {
    return `${Math.round(strength * 100)}%`;
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 0.7) return 'strong';
    if (strength >= 0.4) return 'moderate';
    return 'weak';
  };

  const getStrengthBgClass = (strength: number) => {
    if (strength >= 0.7) return 'bg-green-500/20';
    if (strength >= 0.4) return 'bg-blue-500/20';
    return 'bg-gray-500/20';
  };

  const getStrengthTextClass = (strength: number) => {
    if (strength >= 0.7) return 'text-green-400';
    if (strength >= 0.4) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getStrengthBadgeClass = (strength: number) => {
    if (strength >= 0.7) return 'bg-green-500/20 text-green-400';
    if (strength >= 0.4) return 'bg-blue-500/20 text-blue-400';
    return 'bg-gray-500/20 text-gray-400';
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'evidence',
      label: 'Evidence',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'explore',
      label: 'Explore Further',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'careers',
      label: 'Career Connections',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'refine',
      label: 'Refine',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => {
        const isExpanded = expandedInsight === insight.insight;
        const explored = exploredInsights.get(insight.insight);

        return (
          <div
            key={index}
            className={`group bg-gray-800 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
              isExpanded
                ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <button
              onClick={() => handleCardClick(insight)}
              className="w-full text-left p-5 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${getTypeColor(insight.type)} text-white flex-shrink-0`}>
                    {getTypeIcon(insight.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">
                        {insight.type.replace('-', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-400">
                        {insight.area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </div>
                    <p className="text-gray-100 font-medium leading-relaxed">{insight.insight}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 max-w-xs bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                          style={{ width: `${insight.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-blue-400">
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
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

            {isExpanded && explored && (
              <div className="border-t border-gray-700">
                <div className="flex border-b border-gray-700 bg-gray-800/50">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        activeTab === tab.id
                          ? 'text-blue-400 bg-gray-900 border-b-2 border-blue-500'
                          : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {activeTab === 'evidence' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wide mb-3">
                        What led to this insight
                      </h4>
                      {explored.evidence.map((evidence, idx) => (
                        <div key={idx} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`p-1.5 rounded ${getStrengthBgClass(evidence.strength)}`}>
                              <svg className={`w-4 h-4 ${getStrengthTextClass(evidence.strength)}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                  {evidence.type.replace('-', ' ')}
                                </span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStrengthBadgeClass(evidence.strength)}`}>
                                  {getStrengthLabel(evidence.strength)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300 mb-3">{evidence.description}</p>
                              <div className="w-full bg-gray-800 rounded-full h-2">
                                <div
                                  className={`h-full rounded-full transition-all ${getStrengthColor(evidence.strength)}`}
                                  style={{ width: getStrengthWidth(evidence.strength) }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'explore' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wide mb-3">
                        Deepen your understanding
                      </h4>
                      {explored.relatedQuestions.map((question, idx) => (
                        <div key={idx} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-sm text-gray-200 flex-1">{question.question}</p>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                              question.purpose === 'clarify' ? 'bg-blue-500/20 text-blue-400' :
                              question.purpose === 'deepen' ? 'bg-purple-500/20 text-purple-400' :
                              question.purpose === 'challenge' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {question.purpose}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mb-3">{question.why}</p>
                          <button
                            onClick={() => onAskRelatedQuestion?.(question.question)}
                            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                          >
                            Explore This
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'careers' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wide mb-3">
                        Careers that match this trait
                      </h4>
                      {explored.careerConnections.map((career, idx) => (
                        <div key={idx} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-green-500/50 transition-colors group">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h5 className="text-base font-semibold text-gray-100 group-hover:text-green-400 transition-colors">
                              {career.careerTitle}
                            </h5>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-400">
                                {Math.round(career.connectionStrength * 100)}%
                              </div>
                              <div className="text-xs text-gray-500">match</div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">{career.explanation}</p>
                          {career.roleProgression && career.roleProgression.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs font-semibold text-gray-400 mb-2">Career Path:</div>
                              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                {career.roleProgression.map((role, ridx) => (
                                  <div key={ridx} className="flex items-center gap-2 flex-shrink-0">
                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded whitespace-nowrap">
                                      {role}
                                    </span>
                                    {ridx < career.roleProgression.length - 1 && (
                                      <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => onExploreCareer?.(career.careerTitle)}
                            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                          >
                            Explore This Career
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'refine' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wide mb-3">
                        Challenge or validate this insight
                      </h4>
                      <p className="text-sm text-gray-400 mb-4">
                        Help us understand how accurate this insight feels to you
                      </p>
                      {explored.refinementOptions.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => onRefineInsight?.(insight, option)}
                          className="w-full text-left bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors group"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              option.type === 'agree' ? 'bg-green-500/20 text-green-400' :
                              option.type === 'partially-agree' ? 'bg-blue-500/20 text-blue-400' :
                              option.type === 'disagree' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-purple-500/20 text-purple-400'
                            } group-hover:scale-110 transition-transform`}>
                              {option.type === 'agree' ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : option.type === 'disagree' ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-100 mb-1">
                                {option.label}
                              </div>
                              <p className="text-xs text-gray-400">{option.followUpQuestion}</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
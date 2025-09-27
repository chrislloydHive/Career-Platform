'use client';

import { useState } from 'react';
import { NarrativeInsight, ExperienceConnection } from '@/lib/insights/narrative-insight-generator';

interface NarrativeInsightCardProps {
  narrativeInsights: NarrativeInsight[];
}

export function NarrativeInsightCard({ narrativeInsights }: NarrativeInsightCardProps) {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const getTypeColor = (type: NarrativeInsight['type']) => {
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

  const getTypeLabel = (type: NarrativeInsight['type']) => {
    switch (type) {
      case 'strength':
        return 'Your Strength';
      case 'preference':
        return 'How You Work';
      case 'hidden-interest':
        return 'Hidden Potential';
      case 'growth-area':
        return 'Growth Opportunity';
    }
  };

  if (narrativeInsights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-100">Your Career Story</h3>
        <span className="text-xs text-gray-500">{narrativeInsights.length} narrative{narrativeInsights.length !== 1 ? 's' : ''}</span>
      </div>

      {narrativeInsights.map((narrative, index) => {
        const isExpanded = expandedInsight === narrative.originalInsight;

        return (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all"
          >
            <div className={`h-2 bg-gradient-to-r ${getTypeColor(narrative.type)}`} />

            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${getTypeColor(narrative.type)}`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    {narrative.type === 'strength' && (
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    )}
                    {(narrative.type === 'preference' || narrative.type === 'hidden-interest') && (
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    )}
                    {narrative.type === 'growth-area' && (
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    )}
                  </svg>
                </div>

                <div className="flex-1">
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-gradient-to-r ${getTypeColor(narrative.type)} text-white`}>
                    {getTypeLabel(narrative.type)}
                  </div>
                  <h4 className="text-xl font-bold text-gray-100 mb-3">
                    {narrative.originalInsight.split('.')[0]}
                  </h4>

                  <div className="prose prose-invert max-w-none">
                    <p className="text-base text-gray-300 leading-relaxed">
                      {narrative.narrative}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-400">
                    {Math.round(narrative.confidence * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">confidence</div>
                </div>
              </div>

              {narrative.experienceConnections.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-semibold text-gray-300">Experience Evidence</h5>
                    <button
                      onClick={() => setExpandedInsight(isExpanded ? null : narrative.originalInsight)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      {isExpanded ? 'Show Less' : 'Show More'}
                      <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {isExpanded ? (
                    <div className="space-y-3">
                      {narrative.experienceConnections.map((exp: ExperienceConnection, idx: number) => (
                        <div key={idx} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <div className="font-semibold text-gray-200">{exp.experienceTitle}</div>
                              <div className="text-sm text-gray-400">{exp.company}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <div
                                className="w-16 bg-gray-700 rounded-full h-2"
                                title={`${Math.round(exp.relevance * 100)}% relevant`}
                              >
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                                  style={{ width: `${exp.relevance * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300">{exp.connection}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {narrative.experienceConnections.slice(0, 3).map((exp: ExperienceConnection, idx: number) => (
                        <div key={idx} className="px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                          <div className="text-sm font-medium text-gray-300">{exp.company}</div>
                          <div className="text-xs text-gray-500">{exp.experienceTitle}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {narrative.evidenceStory && narrative.evidenceStory.length > 0 && isExpanded && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h5 className="text-sm font-semibold text-gray-300 mb-3">The Pattern</h5>
                  <div className="space-y-2">
                    {narrative.evidenceStory.map((story, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-400">{story}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
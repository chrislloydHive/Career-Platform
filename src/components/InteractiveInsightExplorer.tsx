'use client';

import { useState } from 'react';
import { DiscoveredInsight } from '@/lib/adaptive-questions/adaptive-engine';
import {
  InsightExplorer,
  ExploredInsight,
  InsightEvidence,
  RelatedQuestion,
  CareerConnection,
  InsightRefinement,
} from '@/lib/insights/insight-explorer';
import { UserProfile } from '@/types/user-profile';

interface InteractiveInsightExplorerProps {
  insights: DiscoveredInsight[];
  userProfile?: UserProfile;
  onAskRelatedQuestion?: (question: string) => void;
  onRefineInsight?: (insight: DiscoveredInsight, refinement: InsightRefinement) => void;
  onExploreCareer?: (careerTitle: string) => void;
}

export function InteractiveInsightExplorer({
  insights,
  userProfile,
  onAskRelatedQuestion,
  onRefineInsight,
  onExploreCareer,
}: InteractiveInsightExplorerProps) {
  const [selectedInsight, setSelectedInsight] = useState<DiscoveredInsight | null>(null);
  const [exploredInsight, setExploredInsight] = useState<ExploredInsight | null>(null);
  const [activeTab, setActiveTab] = useState<'evidence' | 'questions' | 'careers' | 'refine'>('evidence');
  const [refinementFeedback, setRefinementFeedback] = useState('');

  const handleExploreInsight = (insight: DiscoveredInsight) => {
    setSelectedInsight(insight);
    const explorer = new InsightExplorer(insight, insights, userProfile);
    setExploredInsight(explorer.explore());
    setActiveTab('evidence');
  };

  const handleRefine = (refinement: InsightRefinement) => {
    if (!selectedInsight || !exploredInsight) return;

    const explorer = new InsightExplorer(selectedInsight, insights, userProfile);
    const refined = explorer.refineInsight({
      ...refinement,
      userFeedback: refinementFeedback,
    });

    onRefineInsight?.(refined, refinement);
    setRefinementFeedback('');
  };

  const getInsightTypeColor = (type: DiscoveredInsight['type']) => {
    switch (type) {
      case 'strength':
        return 'border-green-500 bg-green-900/20';
      case 'preference':
        return 'border-blue-500 bg-blue-900/20';
      case 'hidden-interest':
        return 'border-purple-500 bg-purple-900/20';
      case 'growth-area':
        return 'border-orange-500 bg-orange-900/20';
    }
  };

  const getEvidenceIcon = (type: InsightEvidence['type']) => {
    switch (type) {
      case 'question-response':
        return '❓';
      case 'behavioral-pattern':
        return '🔁';
      case 'experience':
        return '💼';
      case 'cross-domain':
        return '🔗';
    }
  };

  const getPurposeColor = (purpose: RelatedQuestion['purpose']) => {
    switch (purpose) {
      case 'clarify':
        return 'bg-blue-600';
      case 'deepen':
        return 'bg-purple-600';
      case 'challenge':
        return 'bg-orange-600';
      case 'explore-consequence':
        return 'bg-green-600';
    }
  };

  if (insights.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
        <p className="text-gray-400">No insights discovered yet. Keep answering questions!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Your Discovered Insights</h2>
        <p className="text-gray-400 text-sm">
          Click any insight to explore the evidence, ask follow-up questions, see career connections, or refine the insight.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <button
            key={index}
            onClick={() => handleExploreInsight(insight)}
            className={`text-left p-4 rounded-lg border-2 transition-all ${
              selectedInsight === insight
                ? getInsightTypeColor(insight.type)
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                insight.type === 'strength'
                  ? 'bg-green-900/50 text-green-400'
                  : insight.type === 'hidden-interest'
                  ? 'bg-purple-900/50 text-purple-400'
                  : insight.type === 'growth-area'
                  ? 'bg-orange-900/50 text-orange-400'
                  : 'bg-blue-900/50 text-blue-400'
              }`}>
                {insight.type.replace('-', ' ')}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(insight.confidence * 100)}%
              </span>
            </div>
            <p className="text-gray-200 text-sm">{insight.insight}</p>
            <div className="mt-2 text-xs text-blue-400">
              Click to explore →
            </div>
          </button>
        ))}
      </div>

      {exploredInsight && (
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg border-2 border-blue-600/60 p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-100 mb-2">{exploredInsight.insight.insight}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{exploredInsight.narrativeExplanation}</p>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['evidence', 'questions', 'careers', 'refine'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tab === 'evidence' && '📊 Evidence'}
                {tab === 'questions' && '💬 Explore Further'}
                {tab === 'careers' && '🎯 Career Connections'}
                {tab === 'refine' && '✏️ Refine'}
              </button>
            ))}
          </div>

          {activeTab === 'evidence' && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-100">What led to this insight?</h4>
              {exploredInsight.evidence.map((evidence, index) => (
                <div key={index} className="bg-gray-800/70 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getEvidenceIcon(evidence.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-400">{evidence.source}</span>
                        <div className="flex items-center gap-1">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${evidence.strength * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{Math.round(evidence.strength * 100)}%</span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{evidence.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-100 mb-2">Explore this insight further</h4>
              <p className="text-gray-400 text-sm mb-4">
                These questions can help clarify, deepen, or challenge this insight.
              </p>
              {exploredInsight.relatedQuestions.map((q, index) => (
                <div key={index} className="bg-gray-800/70 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white uppercase ${getPurposeColor(q.purpose)}`}>
                      {q.purpose.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-200 mb-3">{q.question}</p>
                  <button
                    onClick={() => onAskRelatedQuestion?.(q.question)}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Answer this question →
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'careers' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-100 mb-2">Career paths that align with this insight</h4>
              {exploredInsight.careerConnections.length > 0 ? (
                exploredInsight.careerConnections.map((career, index) => (
                  <div key={index} className="bg-gray-800/70 rounded-lg p-5 border border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="text-lg font-bold text-gray-100">{career.careerTitle}</h5>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Match</span>
                        <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-bold">
                          {Math.round(career.connectionStrength * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{career.explanation}</p>
                    <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 mb-3">
                      <div className="text-xs font-semibold text-blue-400 mb-1">Why this matches:</div>
                      <p className="text-sm text-gray-300">{career.insightRelevance}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {career.potentialRoles.map((role, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                          {role}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => onExploreCareer?.(career.careerTitle)}
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Explore {career.careerTitle} →
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No career connections identified yet.</p>
              )}
            </div>
          )}

          {activeTab === 'refine' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-100 mb-2">How accurate is this insight?</h4>
              <p className="text-gray-400 text-sm mb-4">
                Your feedback helps the AI learn and improve its understanding of you.
              </p>

              {exploredInsight.refinementOptions.map((option, index) => (
                <div key={index} className="bg-gray-800/70 rounded-lg p-4 border border-gray-700">
                  <div className="mb-3">
                    <button
                      onClick={() => handleRefine(option)}
                      className="text-lg font-semibold text-gray-100 hover:text-blue-400 transition-colors"
                    >
                      {option.type === 'agree' && '✓ This is accurate'}
                      {option.type === 'partially-agree' && '≈ Partially accurate'}
                      {option.type === 'disagree' && '✗ This doesn\'t feel right'}
                      {option.type === 'needs-context' && '? Needs more context'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {option.followUpQuestions.map((q, i) => (
                      <div key={i} className="text-sm text-gray-400 flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">→</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional thoughts or context (optional):
                </label>
                <textarea
                  value={refinementFeedback}
                  onChange={(e) => setRefinementFeedback(e.target.value)}
                  placeholder="Share your perspective on this insight..."
                  className="w-full px-4 py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-24 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useMemo } from 'react';
import { Navigation } from '@/components/Navigation';
import { AdaptiveQuestionnaire } from '@/components/AdaptiveQuestionnaire';
import { AdaptiveQuestioningEngine } from '@/lib/adaptive-questions/adaptive-engine';
import { CareerFitScore } from '@/lib/matching/realtime-career-matcher';
import { CareerPathVisualization } from '@/components/CareerPathVisualization';
import { generateCareerPaths } from '@/lib/career-paths/career-path-generator';
import { ActionPlan } from '@/components/ActionPlan';
import { generateActionPlan } from '@/lib/action-plan/action-plan-generator';

type ExportedProfile = ReturnType<AdaptiveQuestioningEngine['exportProfile']> & {
  topCareers?: CareerFitScore[];
};

export default function ExplorePage() {
  const [showResults, setShowResults] = useState(false);
  const [profile, setProfile] = useState<ExportedProfile | null>(null);
  const [questionnaireKey, setQuestionnaireKey] = useState(0);
  const [expandedInsights, setExpandedInsights] = useState<Set<number>>(new Set());

  const handleComplete = (exportedProfile: ExportedProfile) => {
    setProfile(exportedProfile);
    setShowResults(true);
  };

  const toggleInsightExpansion = (index: number) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const careerPaths = useMemo(() => {
    if (!profile || !profile.topCareers) return [];
    return generateCareerPaths(
      profile.topCareers,
      profile.insights,
      profile.analysis.strengths
    );
  }, [profile]);

  if (showResults && profile) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation
          title="Your Career Profile"
          subtitle="Based on adaptive exploration"
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {profile.completion}%
              </div>
              <div className="text-sm text-gray-400">Profile Completion</div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {profile.synthesizedInsights.length}
              </div>
              <div className="text-sm text-gray-400">Cross-Domain Insights</div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {profile.patterns.consistencyPatterns.length}
              </div>
              <div className="text-sm text-gray-400">Pattern Matches</div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="text-3xl font-bold text-orange-400 mb-1">
                {profile.patterns.hiddenMotivations.length}
              </div>
              <div className="text-sm text-gray-400">Core Motivations</div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {Math.round((profile.insights.reduce((sum, i) => sum + i.confidence, 0) / profile.insights.length) * 100) || 0}%
              </div>
              <div className="text-sm text-gray-400">Avg Confidence</div>
            </div>
          </div>

          {/* ============ SECTION 1: ASSESSMENT FINDINGS ============ */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-100 mb-2">Your Assessment Findings</h1>
              <p className="text-gray-400 text-lg">Key insights discovered from your responses</p>
            </div>
          </div>

          {/* Cross-Domain Insights - Featured Section */}
          {profile.synthesizedInsights.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Cross-Domain Insights
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {profile.synthesizedInsights.map((insight, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-900/40 to-green-900/40 rounded-lg border-2 border-blue-600/60 p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                            insight.type === 'cross-domain'
                              ? 'bg-blue-600 text-white'
                              : insight.type === 'paradox'
                              ? 'bg-purple-600 text-white'
                              : insight.type === 'nuanced-preference'
                              ? 'bg-green-600 text-white'
                              : 'bg-orange-600 text-white'
                          }`}>
                            {insight.type.replace('-', ' ')}
                          </span>
                          <span className="text-xs font-medium text-gray-400">
                            {Math.round(insight.confidence * 100)}% confidence
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-100 mb-2">{insight.title}</h3>
                        <p className="text-gray-300 leading-relaxed">{insight.description}</p>

                        {/* Expand/Collapse Button */}
                        <button
                          onClick={() => toggleInsightExpansion(index)}
                          className="mt-3 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <span>
                            {expandedInsights.has(index) ? 'Show less' : 'Learn more about this insight type'}
                          </span>
                          <svg
                            className={`w-4 h-4 transition-transform ${expandedInsights.has(index) ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Collapsible Content */}
                        {expandedInsights.has(index) && (
                          <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 space-y-4">
                            <p className="text-sm text-gray-300">
                              <strong>What this means:</strong> {
                                insight.type === 'cross-domain'
                                  ? 'This insight reveals connections between different career areas in your responses, showing how your interests span multiple domains and suggesting hybrid career paths.'
                                  : insight.type === 'paradox'
                                  ? 'This insight identifies contradictory preferences in your responses, which often reveal the depth and complexity of your career interests rather than confusion.'
                                  : insight.type === 'nuanced-preference'
                                  ? 'This insight captures complex preferences that go beyond simple yes/no choices, reflecting the sophisticated way you think about career decisions.'
                                  : 'This insight represents additional behavioral patterns detected in your responses that provide valuable context for your career exploration.'
                              }
                            </p>

                            <div>
                              <h4 className="text-sm font-semibold text-blue-400 mb-2">Source Areas:</h4>
                              <div className="flex flex-wrap gap-2">
                                {insight.sourceAreas.map((area, i) => (
                                  <span key={i} className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs font-medium">
                                    {area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="bg-gray-900/50 rounded-lg p-4 border border-green-700/30">
                              <h4 className="text-sm font-semibold text-green-400 mb-2">Career Implications:</h4>
                              <ul className="space-y-1.5">
                                {insight.implications.map((implication, i) => (
                                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                    <span className="text-green-400 mt-0.5">→</span>
                                    <span>{implication}</span>
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

          {/* 3. Core Values and Hidden Interests Grid */}
          {profile.patterns && (
            <div className="mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Core Values */}
                {profile.patterns.valueHierarchy && profile.patterns.valueHierarchy.topValues.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-900/30 to-green-900/20 rounded-lg border border-blue-700/50 p-5">
                    <h2 className="text-lg font-bold text-blue-400 mb-3">
                      Core Values
                    </h2>
                    <p className="text-gray-400 text-xs mb-3">
                      Your values hierarchy reveals what drives your career decisions and workplace satisfaction.
                    </p>
                    <p className="text-gray-300 mb-4 italic text-sm">
                      &ldquo;{profile.patterns.valueHierarchy.coreMotivation}&rdquo;
                    </p>

                    <div className="space-y-3">
                      {profile.patterns.valueHierarchy.topValues.map((value, index) => (
                        <div key={index} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-indigo-400">#{index + 1}</span>
                              <span className="text-gray-200 capitalize font-medium">{value.value}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500"
                                  style={{ width: `${value.priority * 10}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-400">{Math.round(value.confidence * 100)}%</span>
                            </div>
                          </div>

                          {/* Value explanation */}
                          <div className="text-xs text-gray-400 mb-2">
                            {value.value === 'autonomy' && 'Having control over your work and decisions'}
                            {value.value === 'creativity' && 'Expressing innovation and original thinking'}
                            {value.value === 'stability' && 'Seeking security and predictable outcomes'}
                            {value.value === 'achievement' && 'Accomplishing goals and measurable success'}
                            {value.value === 'collaboration' && 'Working effectively with others toward shared goals'}
                            {value.value === 'impact' && 'Making a meaningful difference in the world'}
                            {value.value === 'learning' && 'Continuous growth and skill development'}
                            {value.value === 'recognition' && 'Receiving acknowledgment for your contributions'}
                            {value.value === 'flexibility' && 'Adapting to change and varied work environments'}
                            {value.value === 'leadership' && 'Guiding and influencing others toward success'}
                            {!['autonomy', 'creativity', 'stability', 'achievement', 'collaboration', 'impact', 'learning', 'recognition', 'flexibility', 'leadership'].includes(value.value) &&
                              'A core principle that guides your career decisions'}
                          </div>

                          {/* Career implications for this value */}
                          <div className="text-xs text-blue-300">
                            <span className="font-medium">Career fit: </span>
                            {value.value === 'autonomy' && 'Freelance, remote work, entrepreneurship, consulting'}
                            {value.value === 'creativity' && 'Design, marketing, arts, innovation roles, R&D'}
                            {value.value === 'stability' && 'Government, education, established corporations, finance'}
                            {value.value === 'achievement' && 'Sales, competitive industries, goal-driven roles'}
                            {value.value === 'collaboration' && 'Team-based roles, project management, cross-functional work'}
                            {value.value === 'impact' && 'Non-profit, healthcare, education, social enterprises'}
                            {value.value === 'learning' && 'Technology, research, training, academic roles'}
                            {value.value === 'recognition' && 'Public-facing roles, awards-based fields, thought leadership'}
                            {value.value === 'flexibility' && 'Consulting, varied project work, dynamic industries'}
                            {value.value === 'leadership' && 'Management, executive roles, team lead positions'}
                            {!['autonomy', 'creativity', 'stability', 'achievement', 'collaboration', 'impact', 'learning', 'recognition', 'flexibility', 'leadership'].includes(value.value) &&
                              'Roles that align with and reinforce this core value'}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Additional context */}
                    <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
                      <h4 className="text-xs font-semibold text-blue-400 mb-2">💡 How to use this information:</h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li>• Prioritize roles that align with your top 3 values</li>
                        <li>• Ask about these values during interviews</li>
                        <li>• Use them to evaluate job offers and career moves</li>
                        <li>• Consider how company culture supports these values</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Hidden Interests */}
                {profile.patterns?.hiddenMotivations && profile.patterns.hiddenMotivations.length > 0 && (
                  <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-lg border border-green-700/50 p-5">
                    <h2 className="text-lg font-bold text-green-400 mb-3">
                      Hidden Interests
                    </h2>
                    <div className="space-y-3">
                      {profile.patterns.hiddenMotivations.map((motivation, index) => (
                        <div key={index} className="bg-gray-900/50 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-green-300 text-sm">{motivation.motivation}</h3>
                            <span className="text-xs text-gray-400">{Math.round(motivation.confidence * 100)}%</span>
                          </div>
                          <p className="text-gray-300 text-xs mb-2">{motivation.insight}</p>
                          <div className="flex flex-wrap gap-1">
                            {motivation.relatedAreas.map((area, i) => (
                              <span key={i} className="px-2 py-0.5 bg-green-900/50 text-green-400 rounded text-xs">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. Preference Intensity Analysis */}
          {profile.patterns && profile.patterns.preferenceIntensities && profile.patterns.preferenceIntensities.length > 0 && (
            <div className="mb-8">
              <div className="bg-gray-800 rounded-lg border border-blue-700/30 p-6">
                <h2 className="text-xl font-bold text-blue-400 mb-4">
                  Preference Intensity Analysis
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.patterns.preferenceIntensities.map((intensity, index) => (
                    <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-gray-200">{intensity.preference}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          intensity.intensity === 'strong'
                            ? 'bg-green-900/50 text-green-400'
                            : intensity.intensity === 'moderate'
                            ? 'bg-yellow-900/50 text-yellow-400'
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          {intensity.intensity}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {intensity.evidence.length} supporting responses • {Math.round(intensity.confidence * 100)}% confidence
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. All Discovered Insights */}
          <div className="mb-8">
            <div className="bg-gray-800 rounded-lg border border-purple-700/30 p-6">
              <h2 className="text-xl font-bold text-purple-400 mb-4">
                All Discovered Insights
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Comprehensive analysis of patterns detected across your responses. Each insight represents a validated discovery about your career preferences and behaviors.
              </p>

              {/* Insights Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-700/50">
                  <div className="text-lg font-bold text-purple-400">{profile.insights.length}</div>
                  <div className="text-xs text-gray-400">Total Insights</div>
                </div>
                <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-700/50">
                  <div className="text-lg font-bold text-purple-400">
                    {Math.round((profile.insights.reduce((sum, i) => sum + i.confidence, 0) / profile.insights.length) * 100) || 0}%
                  </div>
                  <div className="text-xs text-gray-400">Avg Confidence</div>
                </div>
                <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-700/50">
                  <div className="text-lg font-bold text-purple-400">
                    {new Set(profile.insights.map(i => i.area)).size}
                  </div>
                  <div className="text-xs text-gray-400">Areas Explored</div>
                </div>
                <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-700/50">
                  <div className="text-lg font-bold text-purple-400">
                    {profile.insights.filter(i => i.confidence > 0.8).length}
                  </div>
                  <div className="text-xs text-gray-400">High Confidence</div>
                </div>
              </div>

              {/* Insights by Area */}
              {Array.from(new Set(profile.insights.map(i => i.area))).map(area => {
                const areaInsights = profile.insights.filter(i => i.area === area);
                const areaName = area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                return (
                  <div key={area} className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                      <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                      {areaName} ({areaInsights.length} insights)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {areaInsights.map((insight, index) => (
                        <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-200 mb-1">{insight.insight}</div>
                              <div className="text-xs text-gray-400 mb-2">
                                Pattern detected in your responses
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                insight.confidence > 0.8
                                  ? 'bg-green-900/50 text-green-400'
                                  : insight.confidence > 0.6
                                  ? 'bg-yellow-900/50 text-yellow-400'
                                  : 'bg-gray-700 text-gray-400'
                              }`}>
                                {Math.round(insight.confidence * 100)}%
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                insight.type === 'strength'
                                  ? 'bg-blue-900/50 text-blue-400'
                                  : insight.type === 'preference'
                                  ? 'bg-green-900/50 text-green-400'
                                  : insight.type === 'hidden-interest'
                                  ? 'bg-purple-900/50 text-purple-400'
                                  : 'bg-gray-700 text-gray-400'
                              }`}>
                                {insight.type?.replace('-', ' ') || 'insight'}
                              </span>
                            </div>
                          </div>

                          {/* Career implications for this insight */}
                          <div className="text-xs text-purple-300 bg-purple-900/20 rounded p-2 mt-2">
                            <span className="font-medium">💡 Career relevance: </span>
                            {insight.type === 'strength' && 'Leverage this in role selection and skill development'}
                            {insight.type === 'preference' && 'Seek work environments that match this preference'}
                            {insight.type === 'hidden-interest' && 'Explore careers that tap into this emerging interest'}
                            {(!insight.type || !['strength', 'preference', 'hidden-interest'].includes(insight.type)) &&
                              'Consider how this pattern influences your career decisions'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Additional context */}
              <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">🔍 Understanding Your Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300">
                  <div>
                    <p className="font-medium mb-1">Confidence Levels:</p>
                    <ul className="space-y-0.5">
                      <li>• <span className="text-green-400">80-100%</span> - Strong patterns, high reliability</li>
                      <li>• <span className="text-yellow-400">60-79%</span> - Moderate patterns, worth exploring</li>
                      <li>• <span className="text-gray-400">Below 60%</span> - Emerging patterns, needs validation</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">How to Use:</p>
                    <ul className="space-y-0.5">
                      <li>• Focus on high-confidence insights first</li>
                      <li>• Look for patterns across multiple areas</li>
                      <li>• Use insights to guide career exploration</li>
                      <li>• Validate insights through real-world testing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============ SECTION 2: CAREER RECOMMENDATIONS ============ */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-100 mb-2">Your Career Recommendations</h1>
              <p className="text-gray-400 text-lg">Careers that align with your profile and interests</p>
            </div>
          </div>

          {/* Recommended Careers - Primary Focus */}
          {profile.topCareers && profile.topCareers.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                  <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Your Top Career Matches
                </h2>
                <span className="text-sm text-gray-400">Based on {Object.keys(profile.responses).length} responses</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.topCareers.map((career, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg border-2 border-green-600/40 p-6 hover:border-green-500/60 transition-all">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-green-400 bg-green-500/20 px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          <h3 className="text-xl font-bold text-gray-100">{career.careerTitle}</h3>
                        </div>
                        {career.careerCategory && (
                          <p className="text-sm text-gray-400 mb-3">{career.careerCategory}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-400 mb-1">
                          {Math.round(career.currentScore)}%
                        </div>
                        <div className="text-xs text-gray-500">Match Score</div>
                      </div>
                    </div>

                    {/* Match Factors */}
                    <div className="space-y-3 mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Why this fits you:</p>
                      {career.matchFactors.slice(0, 3).map((factor, factorIdx) => (
                        <div key={factorIdx} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                          <div className="flex items-start gap-2">
                            <div className={`p-1 rounded ${
                              factor.strength === 'strong' ? 'bg-green-500/20' :
                              factor.strength === 'moderate' ? 'bg-yellow-500/20' :
                              'bg-gray-500/20'
                            }`}>
                              {factor.strength === 'strong' && (
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                              {factor.strength === 'moderate' && (
                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                                </svg>
                              )}
                              {factor.strength === 'weak' && (
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-200 mb-1">{factor.factor}</p>
                              {factor.basedOn.length > 0 && (
                                <p className="text-xs text-gray-400 line-clamp-2">{factor.basedOn[0]}</p>
                              )}
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              factor.strength === 'strong' ? 'bg-green-500/10 text-green-400' :
                              factor.strength === 'moderate' ? 'bg-yellow-500/10 text-yellow-400' :
                              'bg-gray-500/10 text-gray-400'
                            }`}>
                              {factor.strength === 'strong' ? '★★★' : factor.strength === 'moderate' ? '★★' : '★'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <a
                      href={`/careers?id=${encodeURIComponent(career.careerTitle)}`}
                      className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Explore This Career
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Your Career Roadmap */}
          {careerPaths.length > 0 && (
            <CareerPathVisualization trajectories={careerPaths} />
          )}

          {/* ============ SECTION 3: YOUR ACTION PLAN ============ */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-100 mb-2">Your Action Plan</h1>
              <p className="text-gray-400 text-lg">Concrete next steps to advance your career transition</p>
            </div>
          </div>

          <ActionPlan
            actionPlan={generateActionPlan(profile)}
            onRestartExploration={async () => {
              if (confirm('Are you sure you want to restart? This will clear all your responses and start fresh.')) {
                try {
                  // Clear database state
                  await fetch('/api/questionnaire', { method: 'DELETE' });
                  // Reset local state
                  setShowResults(false);
                  setProfile(null);
                  setQuestionnaireKey(prev => prev + 1);
                } catch (error) {
                  console.error('Failed to clear questionnaire:', error);
                  // Still reset even if delete fails
                  setShowResults(false);
                  setProfile(null);
                  setQuestionnaireKey(prev => prev + 1);
                }
              }
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title="Self Discovery"
        subtitle="Discover your hidden interests and strengths"
      />

      <main>
        <AdaptiveQuestionnaire
          key={questionnaireKey}
          onComplete={handleComplete}
        />
      </main>

    </div>
  );
}
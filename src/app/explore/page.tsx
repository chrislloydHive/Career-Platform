'use client';

import { useState, useMemo } from 'react';
import { Navigation } from '@/components/Navigation';
import { AdaptiveQuestionnaire } from '@/components/AdaptiveQuestionnaire';
import { AdaptiveQuestioningEngine } from '@/lib/adaptive-questions/adaptive-engine';
import { CareerFitScore } from '@/lib/matching/realtime-career-matcher';
import { enrichStrength, enrichPreference, enrichHiddenInterest } from '@/lib/insights/insight-enrichment';
import { CareerPathVisualization } from '@/components/CareerPathVisualization';
import { generateCareerPaths } from '@/lib/career-paths/career-path-generator';

type ExportedProfile = ReturnType<AdaptiveQuestioningEngine['exportProfile']> & {
  topCareers?: CareerFitScore[];
};

export default function ExplorePage() {
  const [showResults, setShowResults] = useState(false);
  const [profile, setProfile] = useState<ExportedProfile | null>(null);
  const [questionnaireKey, setQuestionnaireKey] = useState(0);

  const handleComplete = (exportedProfile: ExportedProfile) => {
    setProfile(exportedProfile);
    setShowResults(true);
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

          {/* Career Path Roadmaps */}
          {careerPaths.length > 0 && (
            <CareerPathVisualization trajectories={careerPaths} />
          )}

          {/* Cross-Domain Insights - Featured Section */}
          {profile.synthesizedInsights.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Your Cross-Domain Insights
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
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {insight.sourceAreas.map((area, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs font-medium">
                            {area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </span>
                        ))}
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
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            {profile.analysis.strengths.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-blue-700/30 p-6">
                <h2 className="text-xl font-bold text-blue-400 mb-4">
                  Your Strengths
                </h2>
                <div className="space-y-4">
                  {profile.analysis.strengths.map((strength, index) => {
                    const enriched = enrichStrength(strength);
                    return (
                      <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-blue-400 mt-1">✓</span>
                          <span className="text-gray-300 font-medium">{strength}</span>
                        </div>

                        <div className="ml-7 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1.5">This means you&apos;d thrive in roles like:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {enriched.roles.map((role, roleIdx) => (
                                <span key={roleIdx} className="px-2 py-1 bg-green-900/30 text-green-300 rounded text-xs">
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1.5">Next steps:</p>
                            <ul className="space-y-1">
                              {enriched.nextSteps.map((step, stepIdx) => (
                                <li key={stepIdx} className="text-xs text-gray-400 flex items-start gap-1.5">
                                  <span className="text-blue-400 mt-0.5">→</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Preferences */}
            {profile.analysis.preferences.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-blue-700/30 p-6">
                <h2 className="text-xl font-bold text-blue-400 mb-4">
                  Work Preferences
                </h2>
                <div className="space-y-4">
                  {profile.analysis.preferences.map((pref, index) => {
                    const enriched = enrichPreference(pref);
                    return (
                      <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-blue-400 mt-1">→</span>
                          <span className="text-gray-300 font-medium">{pref}</span>
                        </div>

                        <div className="ml-7 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1.5">This means you&apos;d thrive in roles like:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {enriched.roles.map((role, roleIdx) => (
                                <span key={roleIdx} className="px-2 py-1 bg-green-900/30 text-green-300 rounded text-xs">
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1.5">Next steps:</p>
                            <ul className="space-y-1">
                              {enriched.nextSteps.map((step, stepIdx) => (
                                <li key={stepIdx} className="text-xs text-gray-400 flex items-start gap-1.5">
                                  <span className="text-blue-400 mt-0.5">→</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hidden Interests */}
            {profile.analysis.hiddenInterests.length > 0 && (
              <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-lg border border-green-700/30 p-6">
                <h2 className="text-xl font-bold text-green-400 mb-4">
                  Hidden Interests
                </h2>
                <div className="space-y-4">
                  {profile.analysis.hiddenInterests.map((interest, index) => {
                    const enriched = enrichHiddenInterest(interest);
                    return (
                      <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-green-700/30">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-green-400 mt-1">•</span>
                          <span className="text-gray-300 font-medium">{interest}</span>
                        </div>

                        <div className="ml-7 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1.5">This means you&apos;d thrive in roles like:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {enriched.roles.map((role, roleIdx) => (
                                <span key={roleIdx} className="px-2 py-1 bg-green-900/30 text-green-300 rounded text-xs">
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1.5">Next steps:</p>
                            <ul className="space-y-1">
                              {enriched.nextSteps.map((step, stepIdx) => (
                                <li key={stepIdx} className="text-xs text-gray-400 flex items-start gap-1.5">
                                  <span className="text-blue-400 mt-0.5">→</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {profile.analysis.suggestions.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-blue-700/30 p-6">
                <h2 className="text-xl font-bold text-blue-400 mb-4">
                  Suggestions
                </h2>
                <ul className="space-y-3">
                  {profile.analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">→</span>
                      <span className="text-gray-300">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Pattern Analysis Section */}
          {profile.patterns && (
            <div className="mt-8 space-y-6">
              {/* Value Hierarchy */}
              {profile.patterns.valueHierarchy && profile.patterns.valueHierarchy.topValues.length > 0 && (
                <div className="bg-gradient-to-br from-blue-900/30 to-green-900/20 rounded-lg border border-blue-700/50 p-6">
                  <h2 className="text-xl font-bold text-blue-400 mb-4">
                    Your Core Values
                  </h2>
                  <p className="text-gray-300 mb-4 italic">
                    &ldquo;{profile.patterns.valueHierarchy.coreMotivation}&rdquo;
                  </p>
                  <div className="space-y-3">
                    {profile.patterns.valueHierarchy.topValues.map((value, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-indigo-400">#{index + 1}</span>
                          <span className="text-gray-200 capitalize">{value.value}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${value.priority * 10}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-400">{Math.round(value.confidence * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preference Intensities */}
              {profile.patterns.preferenceIntensities && profile.patterns.preferenceIntensities.length > 0 && (
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
              )}

              {/* Hidden Motivations */}
              {profile.patterns.hiddenMotivations && profile.patterns.hiddenMotivations.length > 0 && (
                <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-lg border border-green-700/50 p-6">
                  <h2 className="text-xl font-bold text-green-400 mb-4">
                    Hidden Motivations
                  </h2>
                  <div className="space-y-4">
                    {profile.patterns.hiddenMotivations.map((motivation, index) => (
                      <div key={index} className="bg-gray-900/50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-green-300">{motivation.motivation}</h3>
                          <span className="text-xs text-gray-400">{Math.round(motivation.confidence * 100)}% confidence</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{motivation.insight}</p>
                        <div className="flex flex-wrap gap-2">
                          {motivation.relatedAreas.map((area, i) => (
                            <span key={i} className="px-2 py-1 bg-green-900/50 text-green-400 rounded text-xs">
                              {area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Consistency Patterns */}
              {profile.patterns.consistencyPatterns && profile.patterns.consistencyPatterns.length > 0 && (
                <div className="bg-gray-800 rounded-lg border border-blue-700/30 p-6">
                  <h2 className="text-xl font-bold text-blue-400 mb-4">
                    Response Consistency Patterns
                  </h2>
                  <div className="space-y-3">
                    {profile.patterns.consistencyPatterns.map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-900 rounded-lg p-3">
                        <div className="flex-1">
                          <span className="text-gray-200 capitalize">{pattern.theme.replace('-', ' ')}</span>
                          <span className="text-xs text-gray-500 ml-2">in {pattern.area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${pattern.consistencyScore * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-400 w-12 text-right">{Math.round(pattern.confidence * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contradictions */}
              {profile.patterns.contradictions && profile.patterns.contradictions.length > 0 && (
                <div className="bg-yellow-900/20 rounded-lg border border-yellow-700/50 p-6">
                  <h2 className="text-xl font-bold text-gray-100 mb-4">
                    Areas for Clarification
                  </h2>
                  <div className="space-y-4">
                    {profile.patterns.contradictions.map((contradiction, index) => (
                      <div key={index} className="bg-gray-900/50 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            contradiction.severity === 'high'
                              ? 'bg-red-900/50 text-red-400'
                              : contradiction.severity === 'medium'
                              ? 'bg-yellow-900/50 text-yellow-400'
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {contradiction.severity}
                          </span>
                        </div>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {contradiction.possibleReasons.map((reason, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-1">•</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* All Insights */}
          <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-4">All Discovered Insights</h2>
            <div className="space-y-4">
              {profile.insights.map((insight, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                      insight.type === 'hidden-interest'
                        ? 'bg-blue-900/50 text-blue-400'
                        : insight.type === 'strength'
                        ? 'bg-blue-800/50 text-blue-300'
                        : insight.type === 'preference'
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-blue-700/50 text-blue-500'
                    }`}>
                      {insight.type.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-gray-300">{insight.insight}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Area: {insight.area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={async () => {
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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Restart Exploration
            </button>
          </div>
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
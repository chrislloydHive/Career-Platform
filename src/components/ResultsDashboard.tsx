'use client';

import { useState } from 'react';
import { DiscoveredInsight } from '@/lib/adaptive-questions/adaptive-engine';
import { ValidatedStrength, StrengthProfile } from '@/lib/strengths/strength-validation';
import { ExplorationSuggestion } from '@/lib/predictions/hidden-interest-predictor';
import { CareerFitScore } from '@/lib/matching/realtime-career-matcher';
import { FutureSelfProjection } from '@/lib/future-modeling/future-self-projector';
import { NarrativeInsight } from '@/lib/insights/narrative-insight-generator';
import { UserProfile } from '@/types/user-profile';

interface ResultsDashboardProps {
  insights: DiscoveredInsight[];
  narrativeInsights: NarrativeInsight[];
  strengthProfile: StrengthProfile | null;
  hiddenInterests: ExplorationSuggestion[];
  careerMatches: CareerFitScore[];
  futureProjection: FutureSelfProjection | null;
  userProfile?: UserProfile;
  responseCount: number;
}

export function ResultsDashboard({
  insights,
  narrativeInsights,
  strengthProfile,
  hiddenInterests,
  careerMatches,
  futureProjection,
  userProfile,
  responseCount,
}: ResultsDashboardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('dna');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderProfessionalDNA = () => {
    const topInsights = insights.filter(i => i.confidence >= 0.75).slice(0, 5);
    const topStrengths = strengthProfile?.summary.topStrengths || [];
    const completionPercentage = Math.min((responseCount / 20) * 100, 100);

    return (
      <div className="bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-blue-900/20 rounded-xl border-2 border-blue-500/30 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Your Professional DNA</h2>
            <p className="text-sm text-gray-400">The core of who you are as a professional</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-400">{Math.round(completionPercentage)}%</div>
            <div className="text-xs text-gray-500">Discovery Complete</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="text-2xl font-bold text-green-400">{topInsights.length}</div>
            </div>
            <div className="text-xs text-gray-400">Core Insights</div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="text-2xl font-bold text-blue-400">{topStrengths.length}</div>
            </div>
            <div className="text-xs text-gray-400">Validated Strengths</div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <div className="text-2xl font-bold text-purple-400">{hiddenInterests.length}</div>
            </div>
            <div className="text-xs text-gray-400">Hidden Interests</div>
          </div>
        </div>

        {topInsights.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-300 mb-3">Top Discoveries</div>
            {topInsights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-400">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-200">{insight.insight}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-700/50 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${insight.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-blue-400 font-medium">{Math.round(insight.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderValidatedStrengths = () => {
    if (!strengthProfile) return null;

    const validatedStrengths = strengthProfile.validated.slice(0, 6);

    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border-2 border-green-500/30 overflow-hidden">
        <button
          onClick={() => toggleSection('strengths')}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between"
        >
          <div>
            <h3 className="text-xl font-bold text-white text-left">Validated Strengths</h3>
            <p className="text-sm text-green-100 text-left">Backed by evidence from your experiences</p>
          </div>
          <svg
            className={`w-6 h-6 text-white transition-transform ${expandedSection === 'strengths' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSection === 'strengths' && (
          <div className="p-6 space-y-4">
            {validatedStrengths.map((strength, idx) => (
              <div key={idx} className="bg-gray-800/50 rounded-lg border border-gray-700 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-100 mb-1">{strength.name}</h4>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                      {strength.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">{Math.round(strength.confidence * 100)}%</div>
                    <div className="text-xs text-gray-500">confidence</div>
                  </div>
                </div>

                {strength.evidence.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-400 mb-2">Evidence</div>
                    <div className="space-y-2">
                      {strength.evidence.slice(0, 3).map((evidence, eidx) => (
                        <div key={eidx} className="bg-gray-900/50 rounded-lg p-3 border border-green-700/30">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                              {evidence.source}
                            </span>
                            <span className="text-xs text-gray-400">
                              {Math.round(evidence.weight * 100)}% weight
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{evidence.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {strength.insights.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-700/30 rounded-lg p-3">
                    <div className="text-xs font-semibold text-blue-300 mb-2">Key Insights</div>
                    <div className="space-y-1">
                      {strength.insights.map((insight, iidx) => (
                        <div key={iidx} className="flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">→</span>
                          <span className="text-xs text-gray-300">{insight}</span>
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

  const renderHiddenInterests = () => {
    if (hiddenInterests.length === 0) return null;

    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border-2 border-purple-500/30 overflow-hidden">
        <button
          onClick={() => toggleSection('hidden')}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between"
        >
          <div>
            <h3 className="text-xl font-bold text-white text-left">Hidden Interests</h3>
            <p className="text-sm text-purple-100 text-left">Surprising discoveries about your potential</p>
          </div>
          <svg
            className={`w-6 h-6 text-white transition-transform ${expandedSection === 'hidden' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSection === 'hidden' && (
          <div className="p-6 space-y-4">
            {hiddenInterests.slice(0, 5).map((interest, idx) => (
              <div key={idx} className="bg-gray-800/50 rounded-lg border border-gray-700 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-bold text-gray-100">{interest.careerArea}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        interest.explorationType === 'hidden-gem' ? 'bg-purple-500/20 text-purple-400' :
                        interest.explorationType === 'stretch' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {interest.explorationType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{interest.reasoning}</p>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-2xl font-bold text-purple-400">{Math.round(interest.confidence * 100)}%</div>
                    <div className="text-xs text-gray-500">confidence</div>
                  </div>
                </div>

                {interest.specificRoles.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-400 mb-2">Specific Roles</div>
                    <div className="flex flex-wrap gap-2">
                      {interest.specificRoles.map((role, ridx) => (
                        <span key={ridx} className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded text-xs">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-purple-500/10 border border-purple-700/30 rounded-lg p-3">
                  <div className="text-xs font-semibold text-purple-300 mb-1">Why Unexplored</div>
                  <p className="text-xs text-gray-300">{interest.whyUnexplored}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCareerFit = () => {
    const topMatches = careerMatches.slice(0, 8);

    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border-2 border-cyan-500/30 overflow-hidden">
        <button
          onClick={() => toggleSection('careers')}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 flex items-center justify-between"
        >
          <div>
            <h3 className="text-xl font-bold text-white text-left">Career Fit Predictions</h3>
            <p className="text-sm text-cyan-100 text-left">Careers that match your profile</p>
          </div>
          <svg
            className={`w-6 h-6 text-white transition-transform ${expandedSection === 'careers' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSection === 'careers' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topMatches.map((career, idx) => (
                <div key={idx} className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-base font-bold text-gray-100 flex-1">{career.careerTitle}</h4>
                    <div className="text-2xl font-bold text-cyan-400 ml-2">{Math.round(career.currentScore)}%</div>
                  </div>

                  <div className="w-full bg-gray-700/50 rounded-full h-2 mb-3">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${career.currentScore}%` }}
                    />
                  </div>

                  {career.matchFactors.length > 0 && (
                    <div className="space-y-1">
                      {career.matchFactors.slice(0, 2).map((factor, fidx) => (
                        <div key={fidx} className="flex items-start gap-2">
                          <svg className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-300">{factor.factor}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDevelopmentRoadmap = () => {
    if (!futureProjection) return null;

    const topSkills = futureProjection.skillDevelopment.slice(0, 4);

    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border-2 border-orange-500/30 overflow-hidden">
        <button
          onClick={() => toggleSection('roadmap')}
          className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 px-6 py-4 flex items-center justify-between"
        >
          <div>
            <h3 className="text-xl font-bold text-white text-left">Development Roadmap</h3>
            <p className="text-sm text-orange-100 text-left">Your path to growth</p>
          </div>
          <svg
            className={`w-6 h-6 text-white transition-transform ${expandedSection === 'roadmap' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSection === 'roadmap' && (
          <div className="p-6 space-y-4">
            {topSkills.map((skill, idx) => (
              <div key={idx} className="bg-gray-800/50 rounded-lg border border-gray-700 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-100">{skill.skill}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    skill.priority === 'immediate' ? 'bg-red-500/20 text-red-400' :
                    skill.priority === 'short-term' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {skill.priority}
                  </span>
                </div>

                <p className="text-sm text-gray-300 mb-4">{skill.reasoning}</p>

                {skill.learningPath.length > 0 && (
                  <div className="space-y-3">
                    {skill.learningPath.slice(0, 2).map((phase, pidx) => (
                      <div key={pidx} className="bg-gray-900/50 rounded-lg p-3 border border-orange-700/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-orange-300">{phase.phase}</span>
                          <span className="text-xs text-gray-500">{phase.duration}</span>
                        </div>
                        <div className="space-y-1">
                          {phase.activities.slice(0, 2).map((activity, aidx) => (
                            <div key={aidx} className="flex items-start gap-2">
                              <span className="text-orange-400 mt-0.5">•</span>
                              <span className="text-xs text-gray-300">{activity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {skill.quickWins.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="text-xs font-semibold text-green-400 mb-2">Quick Win</div>
                    <p className="text-sm text-gray-300">{skill.quickWins[0]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderOngoingDiscovery = () => {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border-2 border-blue-500/30 p-6">
        <h3 className="text-xl font-bold text-gray-100 mb-4">Continue Your Discovery</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 hover:border-blue-500/50 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-gray-100 mb-2">Answer More Questions</h4>
            <p className="text-xs text-gray-400">Keep refining your profile with deeper questions</p>
          </div>

          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 hover:border-blue-500/50 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-gray-100 mb-2">Explore Careers</h4>
            <p className="text-xs text-gray-400">Research your top career matches in detail</p>
          </div>

          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 hover:border-blue-500/50 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-gray-100 mb-2">Start Learning</h4>
            <p className="text-xs text-gray-400">Begin developing your priority skills</p>
          </div>
        </div>

        <div className="mt-6 bg-blue-500/10 border border-blue-700/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="text-sm font-semibold text-blue-300 mb-1">Your Journey is Just Beginning</div>
              <p className="text-xs text-gray-300">
                These results will continue to evolve as you answer more questions and explore your interests. Return anytime to see updated insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (insights.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-gray-400">Complete more questions to see your results dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderProfessionalDNA()}
      {renderValidatedStrengths()}
      {renderHiddenInterests()}
      {renderCareerFit()}
      {renderDevelopmentRoadmap()}
      {renderOngoingDiscovery()}
    </div>
  );
}
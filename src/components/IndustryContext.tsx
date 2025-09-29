'use client';

import { useState } from 'react';
import { IndustryContext as IIndustryContext, IndustryRoleDifferences, IndustrySalaryVariation, IndustryGrowthProjection, IndustryHiringPatterns } from '@/types/industry-context';

interface IndustryContextProps {
  industryContext: IIndustryContext;
  className?: string;
}

export function IndustryContext({ industryContext, className = '' }: IndustryContextProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'salaries' | 'growth' | 'hiring' | 'transitions'>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '🏢' },
    { id: 'roles' as const, label: 'Role Variations', icon: '👔' },
    { id: 'salaries' as const, label: 'Salary Data', icon: '💰' },
    { id: 'growth' as const, label: 'Growth Outlook', icon: '📈' },
    { id: 'hiring' as const, label: 'Hiring Patterns', icon: '🎯' },
    { id: 'transitions' as const, label: 'Industry Transitions', icon: '🔄' }
  ];

  return (
    <div className={`bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl border border-indigo-600/30 ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-100">Industry Context</h3>
            <p className="text-gray-400 text-sm">How &ldquo;{industryContext.careerTitle}&rdquo; varies across industries</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <IndustryOverview industryContext={industryContext} />
          )}

          {activeTab === 'roles' && (
            <RoleVariations variations={industryContext.industryVariations} />
          )}

          {activeTab === 'salaries' && (
            <SalaryVariations variations={industryContext.salaryVariations} />
          )}

          {activeTab === 'growth' && (
            <GrowthProjections projections={industryContext.growthProjections} />
          )}

          {activeTab === 'hiring' && (
            <HiringPatterns patterns={industryContext.hiringPatterns} />
          )}

          {activeTab === 'transitions' && (
            <IndustryTransitions
              transitions={industryContext.industryTransitionDifficulty}
              topIndustries={industryContext.topIndustries}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function IndustryOverview({ industryContext }: { industryContext: IIndustryContext }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-100 mb-3">🌟 Top Industries for {industryContext.careerTitle}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {industryContext.topIndustries.map((industry, index) => (
            <div key={industry} className="bg-indigo-900/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-indigo-400 mb-1">#{index + 1}</div>
              <div className="text-sm text-gray-300">{industry}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-100 mb-3">💼 Role Diversity</h4>
          <div className="space-y-2">
            {industryContext.industryVariations.slice(0, 3).map(variation => (
              <div key={variation.industry} className="flex items-center justify-between py-2">
                <span className="text-gray-300 text-sm">{variation.industry}</span>
                <span className="text-indigo-400 text-sm font-medium">{variation.roleVariation}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-100 mb-3">💰 Salary Range Overview</h4>
          <div className="space-y-2">
            {industryContext.salaryVariations.slice(0, 3).map(salary => (
              <div key={salary.industry} className="flex items-center justify-between py-2">
                <span className="text-gray-300 text-sm">{salary.industry}</span>
                <span className="text-green-400 text-sm font-medium">
                  ${Math.round(salary.salaryRange.mid.low / 1000)}K-${Math.round(salary.salaryRange.mid.high / 1000)}K
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-lg border border-blue-600/30 p-4">
        <h4 className="text-lg font-semibold text-blue-400 mb-3">🎯 Key Takeaway</h4>
        <p className="text-gray-300 leading-relaxed">
          The <span className="font-semibold text-white">{industryContext.careerTitle}</span> role adapts significantly across industries.
          Technology companies offer the highest compensation but with fast-paced environments, while healthcare provides stability with regulatory complexity.
          Financial services balances high pay with strict compliance, and retail/e-commerce focuses on customer-centric analytics.
        </p>
      </div>
    </div>
  );
}

function RoleVariations({ variations }: { variations: IndustryRoleDifferences[] }) {
  const [expandedIndustry, setExpandedIndustry] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-100 mb-4">👔 How Your Role Differs by Industry</h4>
      {variations.map(variation => (
        <div key={variation.industry} className="bg-gray-800/50 rounded-lg border border-gray-700">
          <button
            onClick={() => setExpandedIndustry(expandedIndustry === variation.industry ? null : variation.industry)}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
          >
            <div>
              <h5 className="font-semibold text-gray-100 mb-1">{variation.industry}</h5>
              <p className="text-indigo-400 text-sm font-medium">{variation.roleVariation}</p>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedIndustry === variation.industry ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedIndustry === variation.industry && (
            <div className="px-4 pb-4 border-t border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div>
                    <h6 className="text-sm font-semibold text-blue-400 mb-2">🔍 Key Differences</h6>
                    <ul className="space-y-1">
                      {variation.keyDifferences.map((diff, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>{diff}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h6 className="text-sm font-semibold text-green-400 mb-2">📋 Specific Responsibilities</h6>
                    <ul className="space-y-1">
                      {variation.specificResponsibilities.slice(0, 3).map((resp, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h6 className="text-sm font-semibold text-orange-400 mb-2">🛠️ Tools & Technologies</h6>
                    <div className="flex flex-wrap gap-1">
                      {variation.toolsAndTechnologies.slice(0, 6).map(tool => (
                        <span key={tool} className="px-2 py-1 bg-orange-900/30 text-orange-300 rounded text-xs">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h6 className="text-sm font-semibold text-purple-400 mb-2">🏢 Work Environment</h6>
                    <p className="text-sm text-gray-300">{variation.workEnvironment}</p>
                  </div>

                  <div>
                    <h6 className="text-sm font-semibold text-pink-400 mb-2">📈 Career Path</h6>
                    <div className="text-sm text-gray-300">
                      {variation.careerProgression[0]}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h6 className="text-sm font-semibold text-red-400 mb-2">⚠️ Challenges</h6>
                  <ul className="space-y-1">
                    {variation.challenges.map((challenge, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h6 className="text-sm font-semibold text-emerald-400 mb-2">✨ Opportunities</h6>
                  <ul className="space-y-1">
                    {variation.opportunities.map((opp, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SalaryVariations({ variations }: { variations: IndustrySalaryVariation[] }) {
  const [selectedLevel, setSelectedLevel] = useState<'junior' | 'mid' | 'senior'>('mid');

  const levels = [
    { id: 'junior' as const, label: 'Junior (0-2 years)', icon: '🌱' },
    { id: 'mid' as const, label: 'Mid-level (3-5 years)', icon: '🚀' },
    { id: 'senior' as const, label: 'Senior (5+ years)', icon: '⭐' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-100">💰 Salary by Industry & Experience Level</h4>
        <div className="flex gap-2">
          {levels.map(level => (
            <button
              key={level.id}
              onClick={() => setSelectedLevel(level.id)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                selectedLevel === level.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{level.icon}</span>
              {level.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {variations.map(variation => {
          const salaryData = variation.salaryRange[selectedLevel];
          const multiplierColor = variation.salaryMultiplier >= 1.2 ? 'text-green-400' :
                                  variation.salaryMultiplier >= 1.0 ? 'text-yellow-400' : 'text-red-400';

          return (
            <div key={variation.industry} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-gray-100">{variation.industry}</h5>
                <span className={`text-xs ${multiplierColor} font-medium`}>
                  {variation.salaryMultiplier > 1 ? '+' : ''}{Math.round((variation.salaryMultiplier - 1) * 100)}%
                </span>
              </div>

              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  ${Math.round(salaryData.low / 1000)}K - ${Math.round(salaryData.high / 1000)}K
                </div>
                <div className="text-xs text-gray-400">Base Salary Range</div>
              </div>

              <div className="space-y-3">
                <div>
                  <h6 className="text-xs font-semibold text-blue-400 mb-1">💎 Equity Potential</h6>
                  <span className={`px-2 py-1 rounded text-xs ${
                    variation.equityPotential === 'high' ? 'bg-green-900/30 text-green-300' :
                    variation.equityPotential === 'moderate' ? 'bg-yellow-900/30 text-yellow-300' :
                    variation.equityPotential === 'low' ? 'bg-orange-900/30 text-orange-300' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {variation.equityPotential === 'none' ? 'No equity' : `${variation.equityPotential} equity`}
                  </span>
                </div>

                <div>
                  <h6 className="text-xs font-semibold text-purple-400 mb-1">🎁 Top Benefits</h6>
                  <div className="flex flex-wrap gap-1">
                    {variation.benefits.slice(0, 3).map(benefit => (
                      <span key={benefit} className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                {variation.totalCompensationNotes.length > 0 && (
                  <div>
                    <h6 className="text-xs font-semibold text-gray-400 mb-1">💡 Compensation Notes</h6>
                    <p className="text-xs text-gray-400">
                      {variation.totalCompensationNotes[0]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg border border-green-600/30 p-4">
        <h5 className="text-sm font-semibold text-green-400 mb-2">💡 Salary Intelligence</h5>
        <p className="text-sm text-gray-300">
          Salaries can vary by 30-50% based on industry, company size, and location. Technology and Financial Services
          typically offer the highest base salaries, while Government and Non-profit sectors may offer better work-life
          balance and job security. Consider total compensation including equity, bonuses, and benefits when comparing offers.
        </p>
      </div>
    </div>
  );
}

function GrowthProjections({ projections }: { projections: IndustryGrowthProjection[] }) {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-100">📈 Industry Growth Outlook (2024-2029)</h4>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projections.map(projection => (
          <div key={projection.industry} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-semibold text-gray-100">{projection.industry}</h5>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">+{projection.overallGrowthRate}%</div>
                <div className="text-xs text-gray-400">Annual Growth</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {Object.entries(projection.roleSpecificGrowth).map(([level, growth]) => (
                <div key={level} className="text-center p-2 bg-gray-700/50 rounded">
                  <div className="text-xs text-gray-400 capitalize">{level} Level</div>
                  <div className={`text-sm font-medium ${
                    growth === 'high' ? 'text-green-400' :
                    growth === 'moderate' ? 'text-yellow-400' :
                    growth === 'slow' ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {growth}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <h6 className="text-xs font-semibold text-blue-400 mb-1">🚀 Driving Factors</h6>
                <ul className="space-y-1">
                  {projection.drivingFactors.map((factor, index) => (
                    <li key={index} className="text-xs text-gray-300 flex items-start gap-1">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h6 className="text-xs font-semibold text-purple-400 mb-1">🔮 Future Outlook</h6>
                <p className="text-xs text-gray-300">{projection.futureOutlook}</p>
              </div>

              <div>
                <h6 className="text-xs font-semibold text-orange-400 mb-1">📚 Recommended Preparation</h6>
                <div className="flex flex-wrap gap-1">
                  {projection.recommendedPreparation.slice(0, 3).map(prep => (
                    <span key={prep} className="px-2 py-1 bg-orange-900/30 text-orange-300 rounded text-xs">
                      {prep}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HiringPatterns({ patterns }: { patterns: IndustryHiringPatterns[] }) {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-100">🎯 Hiring Patterns & Job Market Intelligence</h4>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {patterns.map(pattern => (
          <div key={pattern.industry} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h5 className="font-semibold text-gray-100 mb-4">{pattern.industry}</h5>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h6 className="text-xs font-semibold text-green-400 mb-1">📊 Hiring Volume</h6>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    pattern.hiringVolume === 'very-high' ? 'bg-green-900/30 text-green-300' :
                    pattern.hiringVolume === 'high' ? 'bg-green-800/30 text-green-400' :
                    pattern.hiringVolume === 'moderate' ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-red-900/30 text-red-300'
                  }`}>
                    {pattern.hiringVolume}
                  </span>
                </div>

                <div>
                  <h6 className="text-xs font-semibold text-blue-400 mb-1">🏠 Remote Work</h6>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    pattern.remoteWorkAvailability === 'high' ? 'bg-blue-900/30 text-blue-300' :
                    pattern.remoteWorkAvailability === 'moderate' ? 'bg-blue-800/30 text-blue-400' :
                    pattern.remoteWorkAvailability === 'low' ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-red-900/30 text-red-300'
                  }`}>
                    {pattern.remoteWorkAvailability}
                  </span>
                </div>
              </div>

              <div>
                <h6 className="text-xs font-semibold text-purple-400 mb-1">📅 Seasonality</h6>
                <p className="text-xs text-gray-300">{pattern.seasonality}</p>
              </div>

              <div>
                <h6 className="text-xs font-semibold text-orange-400 mb-1">🏢 Company Types</h6>
                <div className="flex flex-wrap gap-1">
                  {pattern.commonCompanyTypes.map(type => (
                    <span key={type} className="px-2 py-1 bg-orange-900/30 text-orange-300 rounded text-xs">
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h6 className="text-xs font-semibold text-cyan-400 mb-1">📍 Top Locations</h6>
                <div className="flex flex-wrap gap-1">
                  {pattern.locationConcentration.map(location => (
                    <span key={location} className="px-2 py-1 bg-cyan-900/30 text-cyan-300 rounded text-xs">
                      {location}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h6 className="text-xs font-semibold text-pink-400 mb-1">🔍 Interview Process</h6>
                <div className="text-xs text-gray-300">
                  {pattern.interviewProcess.join(' → ')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IndustryTransitions({ transitions, topIndustries }: {
  transitions: Record<string, {
    difficulty: 'easy' | 'moderate' | 'hard' | 'very-hard';
    timeToTransition: string;
    requiredPreparation: string[];
    successTips: string[];
  }>;
  topIndustries: string[];
}) {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-100">🔄 Industry Transition Guide</h4>
      <p className="text-gray-400 text-sm">
        Planning to switch industries? Here&apos;s what you need to know about transitioning into each sector.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topIndustries.map(industry => {
          const transition = transitions[industry];
          if (!transition) return null;

          return (
            <div key={industry} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-semibold text-gray-100">{industry}</h5>
                <div className="text-center">
                  <div className={`text-sm font-bold ${
                    transition.difficulty === 'easy' ? 'text-green-400' :
                    transition.difficulty === 'moderate' ? 'text-yellow-400' :
                    transition.difficulty === 'hard' ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {transition.difficulty}
                  </div>
                  <div className="text-xs text-gray-400">Difficulty</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h6 className="text-xs font-semibold text-blue-400 mb-1">⏱️ Time to Transition</h6>
                  <p className="text-sm text-gray-300">{transition.timeToTransition}</p>
                </div>

                <div>
                  <h6 className="text-xs font-semibold text-orange-400 mb-1">📚 Required Preparation</h6>
                  <ul className="space-y-1">
                    {transition.requiredPreparation.slice(0, 3).map((prep: string, index: number) => (
                      <li key={index} className="text-xs text-gray-300 flex items-start gap-1">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span>{prep}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h6 className="text-xs font-semibold text-green-400 mb-1">💡 Success Tips</h6>
                  <ul className="space-y-1">
                    {transition.successTips.slice(0, 2).map((tip: string, index: number) => (
                      <li key={index} className="text-xs text-gray-300 flex items-start gap-1">
                        <span className="text-green-400 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-lg border border-cyan-600/30 p-4">
        <h5 className="text-sm font-semibold text-cyan-400 mb-2">🎯 Transition Strategy</h5>
        <p className="text-sm text-gray-300">
          The key to successful industry transitions is leveraging your transferable skills while systematically building
          domain knowledge. Start with networking and informational interviews, consider contract work to gain experience,
          and focus on roles where your existing skills provide immediate value while you learn the industry specifics.
        </p>
      </div>
    </div>
  );
}
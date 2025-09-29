'use client';

import { useState } from 'react';
import { CareerPathComparison as ComparisonType, CareerPathProfile } from '@/types/career-comparison';
import { CareerComparisonGenerator } from '@/lib/career-paths/career-comparison-data';

interface CareerPathComparisonProps {
  selectedPaths?: string[];
  onPathSelection?: (paths: string[]) => void;
}

export function CareerPathComparison({
  selectedPaths = ['data-analytics', 'product-management', 'ux-design'],
  onPathSelection
}: CareerPathComparisonProps) {
  const [comparison] = useState<ComparisonType>(() =>
    CareerComparisonGenerator.generateComparison(selectedPaths)
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'lifestyle' | 'skills' | 'mobility' | 'risk-reward'>('overview');

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getScoreColor = (score: number, max: number = 10) => {
    const percentage = score / max;
    if (percentage >= 0.8) return 'text-green-400';
    if (percentage >= 0.6) return 'text-blue-400';
    if (percentage >= 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBarColor = (score: number, max: number = 10) => {
    const percentage = score / max;
    if (percentage >= 0.8) return 'bg-green-500';
    if (percentage >= 0.6) return 'bg-blue-500';
    if (percentage >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const ScoreBar = ({ score, max = 10, label }: { score: number; max?: number; label: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className={`font-medium ${getScoreColor(score, max)}`}>
          {score}/{max}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getScoreBarColor(score, max)}`}
          style={{ width: `${(score / max) * 100}%` }}
        />
      </div>
    </div>
  );

  const SkillWeightBar = ({ weight, label, color }: { weight: number; label: string; color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="font-medium text-gray-200">{weight}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${weight}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Career Path Comparison</h2>
        <p className="text-gray-400">
          Compare lifestyle, skills, mobility, and growth potential across different career paths
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700">
        {[
          { key: 'overview', label: 'Overview', icon: '' },
          { key: 'lifestyle', label: 'Lifestyle', icon: '' },
          { key: 'skills', label: 'Skills', icon: '' },
          { key: 'mobility', label: 'Mobility', icon: '' },
          { key: 'risk-reward', label: 'Risk/Reward', icon: '' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'overview' | 'lifestyle' | 'skills' | 'mobility' | 'risk-reward')}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Path Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparison.paths.map((path) => (
              <div key={path.id} className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-5 border border-gray-600">
                <h3 className="text-xl font-bold text-gray-100 mb-2">{path.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{path.description}</p>

                <div className="space-y-3">
                  <ScoreBar score={path.lifestyle.workLifeBalance.score} label="Work-Life Balance" />
                  <ScoreBar score={path.riskReward.growthPotential} label="Growth Potential" />
                  <ScoreBar score={path.riskReward.stabilityScore} label="Job Stability" />
                  <ScoreBar score={path.industryMobility.transferabilityScore} label="Transferability" />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-600">
                  <div className="text-sm text-gray-400 mb-2">Salary Range (Mid-Level)</div>
                  <div className="font-semibold text-gray-200">
                    {formatSalary(path.riskReward.salaryProgression.midLevel.min)} - {formatSalary(path.riskReward.salaryProgression.midLevel.max)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Key Insights */}
          <div className="bg-blue-900/20 rounded-lg border border-blue-600/30 p-6">
            <h3 className="text-lg font-semibold text-blue-300 mb-4">
              Key Insights & Recommendations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-200 mb-3">Best Choice For:</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-blue-400">Work-Life Balance:</span> <span className="text-gray-300">{comparison.recommendation.bestFor.workLifeBalance}</span></div>
                  <div><span className="text-green-400">Career Growth:</span> <span className="text-gray-300">{comparison.recommendation.bestFor.careerGrowth}</span></div>
                  <div><span className="text-orange-400">Job Stability:</span> <span className="text-gray-300">{comparison.recommendation.bestFor.stability}</span></div>
                  <div><span className="text-purple-400">Creativity:</span> <span className="text-gray-300">{comparison.recommendation.bestFor.creativity}</span></div>
                  <div><span className="text-cyan-400">Technical Focus:</span> <span className="text-gray-300">{comparison.recommendation.bestFor.technicalFocus}</span></div>
                  <div><span className="text-pink-400">People Focus:</span> <span className="text-gray-300">{comparison.recommendation.bestFor.peopleFocus}</span></div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-200 mb-3">Key Trade-offs:</h4>
                <div className="space-y-3">
                  {comparison.recommendation.tradeOffs.map((tradeOff, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-sm text-gray-300">{tradeOff.comparison}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lifestyle Tab */}
      {activeTab === 'lifestyle' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {comparison.paths.map((path) => (
              <div key={path.id} className="bg-gray-700 rounded-lg p-5">
                <h3 className="text-lg font-bold text-gray-100 mb-4">{path.name}</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-200 mb-2">Work-Life Balance</h4>
                    <ScoreBar score={path.lifestyle.workLifeBalance.score} label="Overall Score" />
                    <p className="text-sm text-gray-300 mt-2">{path.lifestyle.workLifeBalance.description}</p>
                    <div className="text-xs text-gray-400 mt-1">
                      Typical: {path.lifestyle.workLifeBalance.typicalHours}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-200 mb-2">Schedule Flexibility</h4>
                    <ScoreBar score={path.lifestyle.scheduleFlexibility.score} label="Flexibility Score" />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Remote: {path.lifestyle.scheduleFlexibility.remoteWork}</span>
                      <span>{path.lifestyle.scheduleFlexibility.flexibleHours ? 'Flexible hours' : 'Fixed hours'}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-200 mb-2">Travel & Stress</h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div>Travel: {path.lifestyle.travelRequirements.frequency} ({path.lifestyle.travelRequirements.percentage}%)</div>
                      <div>Stress Level: <span className={getScoreColor(path.lifestyle.stressLevel.score)}>{path.lifestyle.stressLevel.score}/10</span></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {comparison.paths.map((path) => (
              <div key={path.id} className="bg-gray-700 rounded-lg p-5">
                <h3 className="text-lg font-bold text-gray-100 mb-4">{path.name}</h3>

                <div className="space-y-4">
                  <SkillWeightBar
                    weight={path.skillEmphasis.technicalSkills.weight}
                    label="Technical Skills"
                    color="bg-blue-500"
                  />
                  <SkillWeightBar
                    weight={path.skillEmphasis.peopleSkills.weight}
                    label="People Skills"
                    color="bg-green-500"
                  />
                  <SkillWeightBar
                    weight={path.skillEmphasis.analyticalSkills.weight}
                    label="Analytical Skills"
                    color="bg-purple-500"
                  />
                  <SkillWeightBar
                    weight={path.skillEmphasis.creativeSkills.weight}
                    label="Creative Skills"
                    color="bg-pink-500"
                  />
                  <SkillWeightBar
                    weight={path.skillEmphasis.leadershipSkills.weight}
                    label="Leadership Skills"
                    color="bg-orange-500"
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-600">
                  <h4 className="font-medium text-gray-200 mb-2">Key Skills</h4>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div><span className="text-blue-400">Technical:</span> {path.skillEmphasis.technicalSkills.primarySkills.slice(0, 3).join(', ')}</div>
                    <div><span className="text-green-400">People:</span> {path.skillEmphasis.peopleSkills.primarySkills.slice(0, 3).join(', ')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobility Tab */}
      {activeTab === 'mobility' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {comparison.paths.map((path) => (
              <div key={path.id} className="bg-gray-700 rounded-lg p-5">
                <h3 className="text-lg font-bold text-gray-100 mb-4">{path.name}</h3>

                <div className="space-y-4">
                  <ScoreBar score={path.industryMobility.transferabilityScore} label="Overall Transferability" />

                  <div>
                    <h4 className="font-medium text-gray-200 mb-2">Industry Fit</h4>
                    <div className="space-y-1">
                      {path.industryMobility.industries.map((industry, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-300">{industry.name}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            industry.transferability === 'high'
                              ? 'bg-green-600 text-white'
                              : industry.transferability === 'medium'
                              ? 'bg-orange-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}>
                            {industry.transferability}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-200 mb-2">Career Pivots</h4>
                    <div className="space-y-2">
                      {path.industryMobility.careerPivotOptions.slice(0, 3).map((pivot, index) => (
                        <div key={index} className="bg-gray-600/50 rounded p-2">
                          <div className="text-sm font-medium text-gray-200">{pivot.role}</div>
                          <div className="text-xs text-gray-400">
                            {pivot.difficulty} • {pivot.timeRequired}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk/Reward Tab */}
      {activeTab === 'risk-reward' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {comparison.paths.map((path) => (
              <div key={path.id} className="bg-gray-700 rounded-lg p-5">
                <h3 className="text-lg font-bold text-gray-100 mb-4">{path.name}</h3>

                <div className="space-y-4">
                  <ScoreBar score={path.riskReward.stabilityScore} label="Job Stability" />
                  <ScoreBar score={path.riskReward.growthPotential} label="Growth Potential" />
                  <ScoreBar score={path.riskReward.jobSecurity.score} label="Job Security" />
                  <ScoreBar score={path.riskReward.entrepreneurialOpportunity.score} label="Entrepreneurial Opportunity" />

                  <div>
                    <h4 className="font-medium text-gray-200 mb-2">Salary Progression</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Entry:</span>
                        <span className="text-gray-300">
                          {formatSalary(path.riskReward.salaryProgression.entryLevel.min)} - {formatSalary(path.riskReward.salaryProgression.entryLevel.max)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mid:</span>
                        <span className="text-gray-300">
                          {formatSalary(path.riskReward.salaryProgression.midLevel.min)} - {formatSalary(path.riskReward.salaryProgression.midLevel.max)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Senior:</span>
                        <span className="text-gray-300">
                          {formatSalary(path.riskReward.salaryProgression.seniorLevel.min)} - {formatSalary(path.riskReward.salaryProgression.seniorLevel.max)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-200 mb-2">Market Outlook</h4>
                    <div className="text-sm text-gray-300">
                      <div className={`inline-block px-2 py-1 rounded text-xs ${
                        path.riskReward.jobSecurity.marketOutlook === 'rapidly-growing'
                          ? 'bg-green-600 text-white'
                          : path.riskReward.jobSecurity.marketOutlook === 'growing'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}>
                        {path.riskReward.jobSecurity.marketOutlook.replace('-', ' ')}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Automation Risk: {path.riskReward.jobSecurity.automationRisk}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
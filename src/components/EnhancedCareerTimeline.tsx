'use client';

import { useState, useEffect } from 'react';
import {
  JobMarketSnapshot,
  EnhancedCareerStage,
  UserSkillProfile,
  CareerProgressionTimeline,
  SkillGap,
  HiringCompany
} from '@/types/job-market-data';
import { JobMarketDataService } from '@/lib/job-market/market-data-service';

interface EnhancedCareerTimelineProps {
  careerPath: string;
  userLocation: string;
  userProfile?: UserSkillProfile;
  onStageSelect?: (stage: EnhancedCareerStage) => void;
}

export function EnhancedCareerTimeline({
  careerPath,
  userLocation,
  userProfile,
  onStageSelect
}: EnhancedCareerTimelineProps) {
  const [timeline, setTimeline] = useState<CareerProgressionTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [showMarketDetails, setShowMarketDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadTimelineData();
  }, [careerPath, userLocation, userProfile]);

  const loadTimelineData = async () => {
    setLoading(true);
    try {
      const stages = await generateEnhancedStages();
      const timelineData: CareerProgressionTimeline = {
        userProfile: userProfile || getDefaultUserProfile(),
        stages,
        overallMarketInsights: generateOverallInsights(),
        lastUpdated: new Date(),
        nextUpdateScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      setTimeline(timelineData);
    } catch (error) {
      console.error('Failed to load timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEnhancedStages = async (): Promise<EnhancedCareerStage[]> => {
    const stageNames = getCareerStages(careerPath);
    const stages: EnhancedCareerStage[] = [];

    for (const stageName of stageNames) {
      const marketData = await JobMarketDataService.getJobMarketSnapshot(
        stageName,
        userLocation,
        userProfile
      );

      stages.push({
        id: stageName.toLowerCase().replace(/\s+/g, '-'),
        title: stageName,
        description: getStageDescription(stageName),
        timeframe: getStageTimeframe(stageName),
        marketData,
        recommendations: generateRecommendations(marketData),
        marketReality: assessMarketReality(marketData)
      });
    }

    return stages;
  };

  const toggleMarketDetails = (stageId: string) => {
    setShowMarketDetails(prev => ({
      ...prev,
      [stageId]: !prev[stageId]
    }));
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getViabilityColor = (viability: string) => {
    switch (viability) {
      case 'high': return 'text-green-400 bg-green-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'text-red-400 bg-red-900/30';
      case 'high': return 'text-orange-400 bg-orange-900/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30';
      case 'low': return 'text-blue-400 bg-blue-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getGapSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 border-red-500';
      case 'major': return 'text-orange-400 border-orange-500';
      case 'moderate': return 'text-yellow-400 border-yellow-500';
      case 'minor': return 'text-blue-400 border-blue-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading real-time job market data...</span>
        </div>
      </div>
    );
  }

  if (!timeline) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="text-center text-gray-400">
          Failed to load job market data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-xl border border-blue-600/30 p-6">
        <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
          <span>📊</span>
          Real-Time Market Insights for {careerPath}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Best Markets</div>
            <div className="text-gray-200">
              {timeline.overallMarketInsights.bestLocations.join(', ')}
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Optimal Entry</div>
            <div className="text-gray-200">{timeline.overallMarketInsights.optimalTiming}</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Last Updated</div>
            <div className="text-gray-200">
              {timeline.lastUpdated.toLocaleDateString()} at {timeline.lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          Market data refreshed hourly • Next update: {timeline.nextUpdateScheduled.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Career Stages Timeline */}
      <div className="space-y-6">
        {timeline.stages.map((stage, index) => (
          <div key={stage.id} className="relative">
            {/* Timeline connector */}
            {index < timeline.stages.length - 1 && (
              <div className="absolute left-6 top-20 w-0.5 h-16 bg-gray-600"></div>
            )}

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              {/* Stage Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Timeline dot */}
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-100 mb-2">{stage.title}</h3>
                      <p className="text-gray-300 mb-3">{stage.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-blue-400">Timeline: {stage.timeframe}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getViabilityColor(stage.marketReality.viability)}`}>
                          {stage.marketReality.viability} viability
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleMarketDetails(stage.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    {showMarketDetails[stage.id] ? 'Hide' : 'Show'} Market Data
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-6 bg-gray-700/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {stage.marketData.openPositions}
                    </div>
                    <div className="text-xs text-gray-400">Open Positions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {stage.marketData.hiringCompanies.length}
                    </div>
                    <div className="text-xs text-gray-400">Hiring Companies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">
                      {stage.marketData.experienceRequirements.averageRequired}y
                    </div>
                    <div className="text-xs text-gray-400">Avg Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {formatSalary(stage.marketData.salaryTrends.currentRange.median)}
                    </div>
                    <div className="text-xs text-gray-400">Median Salary</div>
                  </div>
                </div>
              </div>

              {/* Detailed Market Data */}
              {showMarketDetails[stage.id] && (
                <div className="p-6 space-y-6">
                  {/* Hiring Companies */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                      <span>🏢</span>
                      Companies Actively Hiring
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stage.marketData.hiringCompanies.slice(0, 6).map((company, idx) => (
                        <div key={idx} className="bg-gray-700/50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h5 className="font-semibold text-gray-200">{company.name}</h5>
                              <div className="text-sm text-gray-400">{company.industry} • {company.size}</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs ${getUrgencyColor(company.urgency)}`}>
                              {company.urgency}
                            </div>
                          </div>
                          <div className="text-sm text-gray-300 space-y-1">
                            <div>{company.openRoles} open positions</div>
                            <div>Remote: {company.remotePolicy}</div>
                            <div>Hiring {company.hiringTrends.monthlyHires}/month</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skill Gaps Analysis */}
                  {stage.marketData.skillRequirements.skillGaps.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                        <span>⚠️</span>
                        Skill Gaps to Address
                      </h4>
                      <div className="space-y-3">
                        {stage.marketData.skillRequirements.skillGaps.slice(0, 5).map((gap, idx) => (
                          <div key={idx} className={`border-l-4 pl-4 py-2 ${getGapSeverityColor(gap.gapSeverity)}`}>
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium text-gray-200">{gap.skill}</h5>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">Priority: {gap.priority}/10</span>
                                <span className={`px-2 py-0.5 rounded text-xs ${getGapSeverityColor(gap.gapSeverity)}`}>
                                  {gap.gapSeverity}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-300 mb-1">{gap.impact}</div>
                            <div className="text-xs text-gray-400">
                              Your level: {gap.userLevel} • Market demand: {gap.marketDemand} • Time to close: {gap.timeToClose}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience Requirements */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                      <span>📈</span>
                      Experience Requirements
                    </h4>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Average Required</div>
                          <div className="font-semibold text-gray-200">
                            {stage.marketData.experienceRequirements.averageRequired} years
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Range</div>
                          <div className="font-semibold text-gray-200">
                            {stage.marketData.experienceRequirements.range.minimum}-{stage.marketData.experienceRequirements.range.maximum} years
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Entry Level</div>
                          <div className="font-semibold text-gray-200">
                            {stage.marketData.experienceRequirements.distribution.entryLevel}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Senior Level</div>
                          <div className="font-semibold text-gray-200">
                            {stage.marketData.experienceRequirements.distribution.seniorLevel}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Salary Insights */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                      <span>💰</span>
                      Salary Market Data
                    </h4>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Current Range</div>
                          <div className="font-semibold text-gray-200">
                            {formatSalary(stage.marketData.salaryTrends.currentRange.min)} - {formatSalary(stage.marketData.salaryTrends.currentRange.max)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">YoY Growth</div>
                          <div className="font-semibold text-green-400">
                            +{stage.marketData.salaryTrends.yearOverYearChange.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Trend</div>
                          <div className={`font-semibold ${stage.marketData.salaryTrends.trend === 'rising' ? 'text-green-400' : 'text-gray-400'}`}>
                            {stage.marketData.salaryTrends.trend}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                      <span>💡</span>
                      Market-Based Recommendations
                    </h4>
                    <div className="space-y-3">
                      {stage.recommendations.slice(0, 4).map((rec, idx) => (
                        <div key={idx} className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-blue-300">{rec.action}</h5>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                rec.impact === 'high' ? 'bg-green-600 text-white' :
                                rec.impact === 'medium' ? 'bg-yellow-600 text-white' :
                                'bg-gray-600 text-white'
                              }`}>
                                {rec.impact} impact
                              </span>
                              <span className="text-xs text-gray-400">Priority: {rec.priority}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-300 mb-2">{rec.reasoning}</div>
                          <div className="text-xs text-blue-400">Time: {rec.timeToComplete}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Helper functions
  function getDefaultUserProfile(): UserSkillProfile {
    return {
      skills: [],
      totalExperience: 0,
      location: userLocation,
      preferredRemoteWork: true
    };
  }

  function generateOverallInsights() {
    return {
      bestLocations: ['San Francisco, CA', 'New York, NY', 'Remote'],
      optimalTiming: 'Market conditions favorable for entry',
      keyCompetitors: ['Experienced professionals', 'Career changers', 'Recent graduates'],
      marketEntry: 'Focus on in-demand skills and networking',
      riskFactors: ['High competition', 'Rapidly evolving requirements']
    };
  }

  function getCareerStages(path: string): string[] {
    if (path.toLowerCase().includes('data')) {
      return ['Junior Data Analyst', 'Data Analyst', 'Senior Data Analyst', 'Lead Data Scientist'];
    } else if (path.toLowerCase().includes('product')) {
      return ['Associate Product Manager', 'Product Manager', 'Senior Product Manager', 'Director of Product'];
    } else if (path.toLowerCase().includes('design') || path.toLowerCase().includes('ux')) {
      return ['Junior UX Designer', 'UX Designer', 'Senior UX Designer', 'Design Lead'];
    }
    return ['Entry Level', 'Mid Level', 'Senior Level', 'Lead Level'];
  }

  function getStageDescription(stageName: string): string {
    // This would typically come from a more comprehensive database
    return `${stageName} role with responsibilities aligned to this career level`;
  }

  function getStageTimeframe(stageName: string): string {
    if (stageName.toLowerCase().includes('junior') || stageName.toLowerCase().includes('entry')) {
      return '0-2 years';
    } else if (stageName.toLowerCase().includes('senior')) {
      return '3-6 years';
    } else if (stageName.toLowerCase().includes('lead') || stageName.toLowerCase().includes('director')) {
      return '5+ years';
    }
    return '2-4 years';
  }

  function generateRecommendations(marketData: JobMarketSnapshot) {
    return [
      {
        priority: 8,
        type: 'skill-development' as const,
        action: 'Develop top in-demand skills',
        reasoning: 'Market analysis shows high demand for key technical skills',
        impact: 'high' as const,
        timeToComplete: '3-6 months'
      },
      {
        priority: 7,
        type: 'networking' as const,
        action: 'Connect with hiring companies',
        reasoning: `${marketData.hiringCompanies.length} companies actively hiring`,
        impact: 'high' as const,
        timeToComplete: '1-2 months'
      }
    ];
  }

  function assessMarketReality(marketData: JobMarketSnapshot) {
    const viability: 'low' | 'medium' | 'high' = marketData.openPositions > 50 ? 'high' : marketData.openPositions > 20 ? 'medium' : 'low';
    const competitiveness: 'low' | 'medium' | 'high' =
      marketData.skillRequirements.competitionLevel === 'very-high' ? 'high' : marketData.skillRequirements.competitionLevel;

    return {
      viability,
      competitiveness,
      timeToMarket: '3-6 months with focused preparation',
      successFactors: ['Strong technical skills', 'Relevant experience', 'Professional network'],
      alternativeApproaches: ['Remote positions', 'Contract work', 'Freelancing']
    };
  }
}
'use client';

import { useState } from 'react';
import { FutureSelfProjection, TimeHorizon } from '@/lib/future-modeling/future-self-projector';

interface CareerPathNode {
  id: string;
  role: string;
  timeHorizon: TimeHorizon;
  probability: number;
  alignmentScore: number;
  milestones: string[];
  requirements: string[];
  children: CareerPathNode[];
  isDecisionPoint: boolean;
}

interface FutureCareerPathVisualizerProps {
  projection: FutureSelfProjection;
}

export function FutureCareerPathVisualizer({ projection }: FutureCareerPathVisualizerProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const buildCareerPathTree = (): CareerPathNode[] => {
    const pathSteps = projection.idealCareerPath;

    if (pathSteps.length === 0) {
      return [];
    }

    const currentRole = pathSteps[0];
    const root: CareerPathNode = {
      id: 'current',
      role: 'Current Position',
      timeHorizon: 'immediate',
      probability: 1.0,
      alignmentScore: 0.7,
      milestones: ['Complete current role responsibilities'],
      requirements: [],
      children: [],
      isDecisionPoint: false,
    };

    const oneYearPaths: CareerPathNode[] = [];
    const threeYearRole = pathSteps.find(p => p.timeHorizon === '3-year');
    const fiveYearRole = pathSteps.find(p => p.timeHorizon === '5-year');

    const primaryPath: CareerPathNode = {
      id: '1y-primary',
      role: currentRole.role,
      timeHorizon: '1-year',
      probability: 0.75,
      alignmentScore: 0.85,
      milestones: currentRole.preparationNeeded.slice(0, 3),
      requirements: currentRole.preparationNeeded,
      children: [],
      isDecisionPoint: true,
    };

    if (threeYearRole) {
      const threeYearNode: CareerPathNode = {
        id: '3y-primary',
        role: threeYearRole.role,
        timeHorizon: '3-year',
        probability: 0.65,
        alignmentScore: 0.9,
        milestones: threeYearRole.preparationNeeded.slice(0, 3),
        requirements: threeYearRole.preparationNeeded,
        children: [],
        isDecisionPoint: true,
      };

      if (fiveYearRole) {
        threeYearNode.children.push({
          id: '5y-primary',
          role: fiveYearRole.role,
          timeHorizon: '5-year',
          probability: 0.6,
          alignmentScore: 0.95,
          milestones: fiveYearRole.preparationNeeded.slice(0, 3),
          requirements: fiveYearRole.preparationNeeded,
          children: [],
          isDecisionPoint: false,
        });

        threeYearNode.children.push({
          id: '5y-alternate',
          role: `Senior ${threeYearRole.role}`,
          timeHorizon: '5-year',
          probability: 0.4,
          alignmentScore: 0.85,
          milestones: ['Deepen expertise in current domain', 'Lead larger teams', 'Expand strategic influence'],
          requirements: ['Advanced domain knowledge', 'Leadership experience', 'Strategic thinking'],
          children: [],
          isDecisionPoint: false,
        });
      }

      primaryPath.children.push(threeYearNode);
    }

    const alternateOneYear: CareerPathNode = {
      id: '1y-alternate',
      role: `${currentRole.role.split(' ')[0]} Specialist`,
      timeHorizon: '1-year',
      probability: 0.25,
      alignmentScore: 0.75,
      milestones: ['Build specialized expertise', 'Focus on niche skills', 'Establish domain authority'],
      requirements: ['Deep domain knowledge', 'Technical specialization'],
      children: [],
      isDecisionPoint: false,
    };

    if (threeYearRole) {
      alternateOneYear.children.push({
        id: '3y-specialist',
        role: `Lead ${currentRole.role.split(' ')[0]} Specialist`,
        timeHorizon: '3-year',
        probability: 0.55,
        alignmentScore: 0.8,
        milestones: ['Become recognized expert', 'Mentor junior specialists', 'Drive innovation in niche'],
        requirements: ['Expert-level knowledge', 'Thought leadership', 'Mentorship skills'],
        children: [],
        isDecisionPoint: false,
      });
    }

    oneYearPaths.push(primaryPath, alternateOneYear);
    root.children = oneYearPaths;

    return [root];
  };

  const careerTree = buildCareerPathTree();

  const getTimeHorizonLabel = (horizon: TimeHorizon): string => {
    switch (horizon) {
      case 'immediate': return 'Now';
      case '1-year': return '1 Year';
      case '3-year': return '3 Years';
      case '5-year': return '5 Years';
      case '10-year': return '10 Years';
    }
  };

  const getAlignmentColor = (score: number): string => {
    if (score >= 0.9) return 'text-green-400';
    if (score >= 0.8) return 'text-blue-400';
    if (score >= 0.7) return 'text-cyan-400';
    return 'text-gray-400';
  };

  const getAlignmentGradient = (score: number): string => {
    if (score >= 0.9) return 'from-green-500 to-emerald-600';
    if (score >= 0.8) return 'from-blue-500 to-cyan-600';
    if (score >= 0.7) return 'from-cyan-500 to-blue-600';
    return 'from-gray-500 to-gray-600';
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: CareerPathNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedPath === node.id;
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id} className="relative">
        <div
          className={`mb-4 ${depth > 0 ? 'ml-8' : ''}`}
        >
          {depth > 0 && (
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 to-transparent" style={{ left: `${(depth - 1) * 32 + 16}px` }} />
          )}

          <button
            onClick={() => {
              setSelectedPath(isSelected ? null : node.id);
              if (hasChildren) {
                toggleNode(node.id);
              }
            }}
            className={`relative w-full text-left bg-gray-800/50 rounded-lg border transition-all ${
              isSelected
                ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                : 'border-gray-700 hover:border-blue-500/50'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-400">
                      {getTimeHorizonLabel(node.timeHorizon)}
                    </span>
                    {node.isDecisionPoint && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                        </svg>
                        Decision Point
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-gray-100 mb-2">{node.role}</h4>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Probability:</span>
                      <span className="text-sm font-bold text-blue-400">{Math.round(node.probability * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Alignment:</span>
                      <span className={`text-sm font-bold ${getAlignmentColor(node.alignmentScore)}`}>
                        {Math.round(node.alignmentScore * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 mb-1">Probability</div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                          style={{ width: `${node.probability * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 mb-1">Alignment</div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r ${getAlignmentGradient(node.alignmentScore)} h-2 rounded-full transition-all`}
                          style={{ width: `${node.alignmentScore * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {hasChildren && (
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 mt-1 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>

              {node.milestones.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-400 mb-2">Key Milestones</div>
                  <div className="flex flex-wrap gap-2">
                    {node.milestones.slice(0, 3).map((milestone, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-500/10 text-blue-300 rounded text-xs">
                        {milestone}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {isSelected && node.requirements.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="text-xs font-semibold text-gray-400 mb-2">Requirements</div>
                  <div className="space-y-2">
                    {node.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-300">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </button>

          {isExpanded && hasChildren && (
            <div className="mt-4 space-y-4">
              {node.children.map(child => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border-2 border-blue-500/30 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white mb-1">Your 5-Year Career Trajectory</h3>
        <p className="text-sm text-blue-100">Explore different paths and their requirements</p>
      </div>

      <div className="p-6">
        {projection.idealCareerPath.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">Keep answering questions to unlock your career path projection</p>
          </div>
        ) : (
          <div>
            <div className="mb-6 bg-blue-500/10 border border-blue-700/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="text-sm font-semibold text-blue-300 mb-1">How to Use</div>
                  <p className="text-xs text-gray-300">
                    Click on any path to view detailed requirements. Decision points show where paths branch. Probability indicates likelihood based on your profile.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {careerTree.map(node => renderNode(node))}
            </div>

            {projection.skillDevelopment.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <h4 className="text-sm font-semibold text-gray-300 mb-4">Priority Skills to Develop</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projection.skillDevelopment.slice(0, 4).map((skill, idx) => (
                    <div key={idx} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-200">{skill.skill}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          skill.priority === 'immediate' ? 'bg-red-500/20 text-red-400' :
                          skill.priority === 'short-term' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {skill.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{skill.reasoning}</p>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Alignment with strengths</span>
                          <span className="text-blue-400">{Math.round(skill.alignmentWithStrengths * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${skill.alignmentWithStrengths * 100}%` }}
                          />
                        </div>
                      </div>

                      {skill.quickWins.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-700/50">
                          <div className="text-xs font-semibold text-green-400 mb-1">Quick Win</div>
                          <p className="text-xs text-gray-300">{skill.quickWins[0]}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projection.challenges.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <h4 className="text-sm font-semibold text-gray-300 mb-4">Potential Challenges</h4>
                <div className="space-y-3">
                  {projection.challenges.slice(0, 3).map((challenge, idx) => (
                    <div key={idx} className="bg-orange-500/10 border border-orange-700/30 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              challenge.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                              challenge.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {challenge.severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {getTimeHorizonLabel(challenge.timeframe)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-200 mb-2">{challenge.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-400">{Math.round(challenge.likelihood * 100)}%</div>
                          <div className="text-xs text-gray-500">likelihood</div>
                        </div>
                      </div>

                      {challenge.mitigation.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-orange-700/30">
                          <div className="text-xs font-semibold text-green-400 mb-2">How to Mitigate</div>
                          <div className="space-y-1">
                            {challenge.mitigation.slice(0, 2).map((mit, midx) => (
                              <div key={midx} className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                                <span className="text-xs text-gray-300">{mit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { ActionPlan } from '@/lib/action-plan/action-plan-generator';

interface ActionPlanProps {
  actionPlan: ActionPlan;
  onRestartExploration: () => void;
}

export function ActionPlan({ actionPlan, onRestartExploration }: ActionPlanProps) {
  const [activeTab, setActiveTab] = useState<'careers' | 'skills' | 'network' | 'search' | 'timeline'>('careers');

  const tabs = [
    { id: 'careers' as const, label: 'Career Research' },
    { id: 'skills' as const, label: 'Skill Building' },
    { id: 'network' as const, label: 'Networking' },
    { id: 'search' as const, label: 'Job Search' },
    { id: 'timeline' as const, label: 'Timeline' }
  ];

  const priorityColors = {
    high: 'bg-red-900/50 text-red-300',
    medium: 'bg-yellow-900/50 text-yellow-300',
    low: 'bg-green-900/50 text-green-300',
    critical: 'bg-red-900/50 text-red-300',
    important: 'bg-yellow-900/50 text-yellow-300',
    beneficial: 'bg-green-900/50 text-green-300'
  };

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-100 mb-2 flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Your Action Plan
        </h2>
        <p className="text-gray-400">Concrete next steps tailored to your profile and career goals</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all ${
              activeTab === tab.id
                ? 'border-blue-500 bg-blue-900/30 text-blue-100'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        {activeTab === 'careers' && (
          <div>
            <h3 className="text-xl font-bold text-gray-100 mb-4">Careers to Research Next</h3>
            <p className="text-gray-400 mb-6">Based on your strengths and preferences, explore these specific career paths with actionable research steps</p>

            <div className="space-y-6">
              {actionPlan.careersToResearch.map((career, index) => (
                <div key={index} className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-100 text-lg">{career.title}</h4>
                      <p className="text-gray-300 text-sm mt-1">{career.reason}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[career.priority]}`}>
                      {career.priority.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-blue-400 mb-2">Market Information</h5>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-400">Salary Range: </span>
                          <span className="text-gray-200">{career.salaryRange}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Growth Outlook: </span>
                          <span className="text-green-300">{career.growthOutlook}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-green-400 mb-2">Key Research Questions</h5>
                      <ul className="space-y-1">
                        {career.keyQuestions.slice(0, 3).map((question, idx) => (
                          <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                            <span className="text-green-400 mt-1">?</span>
                            <span>{question}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-orange-400 mb-3">Specific Research Actions</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {career.researchActions.map((action, idx) => (
                        <div key={idx} className="text-xs text-gray-300 flex items-start gap-2 bg-gray-800/30 rounded p-2">
                          <span className="text-orange-400 mt-1">•</span>
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={`/careers?search=${career.searchQuery}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Explore in Career Explorer
                    </a>
                    <button
                      onClick={() => {
                        const text = `Career Research: ${career.title}\n\nActions:\n${career.researchActions.map(action => `• ${action}`).join('\n')}\n\nQuestions to explore:\n${career.keyQuestions.map(q => `• ${q}`).join('\n')}`;
                        navigator.clipboard.writeText(text);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      Copy Research Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div>
            <h3 className="text-xl font-bold text-gray-100 mb-4">Skills Development Plan</h3>
            <p className="text-gray-400 mb-6">Prioritized skills to develop based on identified gaps and career goals</p>

            <div className="space-y-4">
              {actionPlan.skillsTodevelop.map((skill, index) => (
                <div key={index} className="bg-gray-900/50 rounded-lg p-5 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-100 text-lg">{skill.skill}</h4>
                      <p className="text-gray-300 text-sm mt-1">{skill.reason}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[skill.priority]}`}>
                        {skill.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">{skill.timeline}</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">Recommended Resources:</h5>
                    <ul className="space-y-1">
                      {skill.resources.map((resource, idx) => (
                        <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div>
            <h3 className="text-xl font-bold text-gray-100 mb-4">Networking Strategy</h3>
            <p className="text-gray-400 mb-6">Industry-specific networking approaches with actionable steps and message templates</p>

            <div className="space-y-6">
              {actionPlan.networkingSuggestions.map((suggestion, index) => (
                <div key={index} className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                  <h4 className="font-semibold text-gray-100 text-lg mb-3">{suggestion.industry}</h4>
                  <p className="text-gray-300 text-sm mb-4">{suggestion.strategy}</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-blue-400 mb-3">Specific Actions to Take</h5>
                      <ul className="space-y-2">
                        {suggestion.specificActions.map((action, idx) => (
                          <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                            <span className="text-blue-400 mt-1">→</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-green-400 mb-3">Event Types to Attend</h5>
                      <ul className="space-y-2">
                        {suggestion.eventTypes.map((event, idx) => (
                          <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                            <span className="text-green-400 mt-1">📅</span>
                            <span>{event}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-orange-400 mb-3">Message Templates</h5>
                    <div className="space-y-3">
                      {suggestion.messageTemplates.map((template, idx) => (
                        <div key={idx} className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                          <p className="text-xs text-gray-300">{template}</p>
                          <button
                            onClick={() => navigator.clipboard.writeText(template)}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                          >
                            Copy template
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-300 mb-2">Platforms to Use:</h5>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.platforms.map((platform, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-semibold text-gray-300 mb-2">Key Titles to Connect With:</h5>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.keyTitles.map((title, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-900/30 text-green-300 rounded text-xs">
                            {title}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <h3 className="text-xl font-bold text-gray-100 mb-4">Job Search Strategies</h3>
            <p className="text-gray-400 mb-6">Effective approaches tailored to your profile and target roles</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actionPlan.jobSearchStrategies.map((strategy, index) => (
                <div key={index} className="bg-gray-900/50 rounded-lg p-5 border border-gray-700">
                  <h4 className="font-semibold text-gray-100 text-lg mb-2">{strategy.strategy}</h4>
                  <p className="text-gray-300 text-sm mb-3">{strategy.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Timeframe:</span>
                      <span className="text-xs text-gray-300">{strategy.timeframe}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Effectiveness:</span>
                      <span className="text-xs text-blue-300">{strategy.effectiveness}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div>
            <h3 className="text-xl font-bold text-gray-100 mb-4">Career Transition Timeline</h3>
            <p className="text-gray-400 mb-6">Structured roadmap for your career transition journey</p>

            <div className="space-y-6">
              {actionPlan.timelineRecommendations.map((phase, index) => (
                <div key={index} className="bg-gray-900/50 rounded-lg p-5 border border-gray-700 relative">
                  <div className="absolute top-4 right-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>

                  <div className="pr-12">
                    <h4 className="font-semibold text-gray-100 text-lg">{phase.phase}</h4>
                    <p className="text-blue-400 text-sm mb-4">{phase.timeframe}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-semibold text-gray-300 mb-2">Key Actions:</h5>
                        <ul className="space-y-1">
                          {phase.actions.map((action, idx) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold text-gray-300 mb-2">Success Milestones:</h5>
                        <ul className="space-y-1">
                          {phase.milestones.map((milestone, idx) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                              <span className="text-green-400 mt-1">✓</span>
                              <span>{milestone}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={onRestartExploration}
          className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Start New Assessment
        </button>
        <a
          href="/careers"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Explore Career Database
        </a>
      </div>
    </div>
  );
}
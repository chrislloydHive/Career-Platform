'use client';

import type { JobCategory } from '@/types/career';
import { useState } from 'react';

interface CareerDetailModalProps {
  career: JobCategory | null;
  onClose: () => void;
}

export function CareerDetailModal({ career, onClose }: CareerDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'progression' | 'skills' | 'insights'>('overview');

  if (!career) return null;

  const getTrendIcon = (trend: 'growing' | 'stable' | 'declining') => {
    if (trend === 'growing') return '📈';
    if (trend === 'declining') return '📉';
    return '📊';
  };

  const getTrendColor = (trend: 'growing' | 'stable' | 'declining') => {
    if (trend === 'growing') return 'text-green-400';
    if (trend === 'declining') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-start justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full my-8 border border-gray-700">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex items-start justify-between rounded-t-lg">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-100 mb-1">{career.title}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                {career.category}
              </span>
              {career.workEnvironment.remote && (
                <span className="px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-sm">
                  Remote Available
                </span>
              )}
              {career.workEnvironment.hybrid && (
                <span className="px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full text-sm">
                  Hybrid Available
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors ml-4"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 bg-gray-850">
          <div className="flex px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'progression', label: 'Career Path' },
              { id: 'skills', label: 'Skills' },
              { id: 'insights', label: 'Industry Insights' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">About This Career</h3>
                <p className="text-gray-300 leading-relaxed">{career.description}</p>
              </div>

              {/* Alternative Titles */}
              {career.alternativeTitles.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">Also Known As</h3>
                  <div className="flex flex-wrap gap-2">
                    {career.alternativeTitles.map((title, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg text-sm">
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Tasks */}
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-3">Daily Responsibilities</h3>
                <div className="space-y-3">
                  {career.dailyTasks.map((task, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-gray-200 flex-1">{task.task}</p>
                        <span className="ml-4 px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                          {task.frequency}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${task.timePercentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{task.timePercentage}% of time</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Environment */}
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-3">Work Environment</h3>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Work Settings</p>
                      <div className="flex flex-wrap gap-2">
                        {career.workEnvironment.remote && (
                          <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">Remote</span>
                        )}
                        {career.workEnvironment.hybrid && (
                          <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">Hybrid</span>
                        )}
                        {career.workEnvironment.onsite && (
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">On-site</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Typical Hours</p>
                      <p className="text-gray-200">{career.workEnvironment.typicalHours}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Travel Required</p>
                      <p className="text-gray-200">{career.workEnvironment.travelRequired ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Outlook */}
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-3">Job Outlook</h3>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Growth Rate</p>
                      <p className="text-xl font-semibold text-green-400">{career.jobOutlook.growthRate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Projected Jobs</p>
                      <p className="text-xl font-semibold text-gray-200">{career.jobOutlook.projectedJobs}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Competition</p>
                      <p className={`text-xl font-semibold capitalize ${
                        career.jobOutlook.competitionLevel === 'low'
                          ? 'text-green-400'
                          : career.jobOutlook.competitionLevel === 'medium'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}>
                        {career.jobOutlook.competitionLevel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Career Progression Tab */}
          {activeTab === 'progression' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Career Progression Path</h3>
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700" />

                  <div className="space-y-6">
                    {career.careerProgression.map((stage, idx) => (
                      <div key={idx} className="relative pl-20">
                        {/* Circle Marker */}
                        <div className={`absolute left-4 w-8 h-8 rounded-full flex items-center justify-center border-4 border-gray-900 ${
                          idx === 0 ? 'bg-green-500' : idx === career.careerProgression.length - 1 ? 'bg-purple-500' : 'bg-blue-500'
                        }`}>
                          <span className="text-xs font-bold text-white">{idx + 1}</span>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-xl font-semibold text-gray-100">{stage.title}</h4>
                              <p className="text-sm text-gray-400 mt-1">{stage.yearsExperience}</p>
                            </div>
                            <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm capitalize">
                              {stage.level}
                            </span>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-gray-400 mb-1">Typical Salary Range</p>
                            <p className="text-lg font-semibold text-green-400">
                              ${stage.typicalSalaryRange.min.toLocaleString()} - ${stage.typicalSalaryRange.max.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-400">Median: ${stage.typicalSalaryRange.median.toLocaleString()}</p>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-300 mb-2">Key Responsibilities</p>
                            <ul className="space-y-1">
                              {stage.keyResponsibilities.map((resp, ridx) => (
                                <li key={ridx} className="text-sm text-gray-400 flex items-start">
                                  <span className="text-blue-400 mr-2">•</span>
                                  {resp}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-300 mb-2">Required Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {stage.requiredSkills.map((skill, sidx) => (
                                <span key={sidx} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Required Skills & Qualifications</h3>

                {/* Skills by Category */}
                {['technical', 'soft', 'certification'].map(category => {
                  const categorySkills = career.requiredSkills.filter(s => s.category === category);
                  if (categorySkills.length === 0) return null;

                  return (
                    <div key={category} className="mb-6">
                      <h4 className="text-md font-semibold text-gray-200 mb-3 capitalize">{category} Skills</h4>
                      <div className="space-y-3">
                        {categorySkills.map((skill, idx) => (
                          <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  skill.importance === 'required'
                                    ? 'bg-red-500'
                                    : skill.importance === 'preferred'
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`} />
                                <p className="text-gray-100 font-medium">{skill.skill}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                skill.importance === 'required'
                                  ? 'bg-red-900/50 text-red-400'
                                  : skill.importance === 'preferred'
                                  ? 'bg-yellow-900/50 text-yellow-400'
                                  : 'bg-green-900/50 text-green-400'
                              }`}>
                                {skill.importance}
                              </span>
                            </div>
                            {skill.description && (
                              <p className="text-sm text-gray-400 mt-2">{skill.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Education Requirements */}
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-200 mb-3">Education Requirements</h4>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {career.education.minimumDegree && (
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Minimum Education</p>
                          <p className="text-gray-200">{career.education.minimumDegree}</p>
                        </div>
                      )}
                      {career.education.preferredDegree && (
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Preferred Education</p>
                          <p className="text-gray-200">{career.education.preferredDegree}</p>
                        </div>
                      )}
                    </div>

                    {career.education.certifications.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-2">Relevant Certifications</p>
                        <div className="flex flex-wrap gap-2">
                          {career.education.certifications.map((cert, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-lg text-sm">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {career.education.alternativePathways.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-2">Alternative Pathways</p>
                        <ul className="space-y-1">
                          {career.education.alternativePathways.map((pathway, idx) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-start">
                              <span className="text-green-400 mr-2">→</span>
                              {pathway}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Industry Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Industry Trends & Insights</h3>
                <div className="space-y-4">
                  {career.industryInsights.map((insight, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg p-5 border border-gray-700">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-100">{insight.topic}</h4>
                        <span className={`flex items-center gap-1 ${getTrendColor(insight.trend)}`}>
                          <span>{getTrendIcon(insight.trend)}</span>
                          <span className="text-sm capitalize">{insight.trend}</span>
                        </span>
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-2">{insight.description}</p>
                      {insight.source && (
                        <p className="text-xs text-gray-500">Source: {insight.source}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Careers */}
              {career.relatedRoles.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-3">Related Careers</h3>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex flex-wrap gap-2">
                      {career.relatedRoles.map((role, idx) => (
                        <span key={idx} className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition-colors cursor-pointer">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 border-t border-gray-700 rounded-b-lg flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
              Save Career
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              View Similar Careers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
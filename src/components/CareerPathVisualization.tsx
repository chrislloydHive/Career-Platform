'use client';

import { useState } from 'react';
import { CareerTrajectory } from '@/lib/career-paths/career-path-generator';

interface CareerPathVisualizationProps {
  trajectories: CareerTrajectory[];
}

export function CareerPathVisualization({ trajectories }: CareerPathVisualizationProps) {
  const [selectedPath, setSelectedPath] = useState(0);

  if (trajectories.length === 0) return null;

  const currentPath = trajectories[selectedPath];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-100 mb-2 flex items-center gap-2">
        <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        Your Career Path Roadmaps
      </h2>
      <p className="text-gray-400 text-sm mb-4">Explore concrete career trajectories based on your profile</p>

      {/* Path Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {trajectories.map((path, index) => (
          <button
            key={index}
            onClick={() => setSelectedPath(index)}
            className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all ${
              selectedPath === index
                ? 'border-purple-500 bg-purple-900/30 text-purple-100'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="text-left">
              <div className="font-semibold text-sm">{path.pathName}</div>
              <div className="text-xs text-gray-400 mt-0.5">{path.matchScore}% match</div>
            </div>
          </button>
        ))}
      </div>

      {/* Path Overview */}
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg border-2 border-purple-700/40 p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-100 mb-2">{currentPath.pathName}</h3>
            <p className="text-gray-300 mb-3">{currentPath.description}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {currentPath.matchScore}%
            </div>
            <div className="text-xs text-gray-400">Match Score</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-900/50 rounded-lg p-3 border border-purple-700/30">
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-2">Timeline</div>
            <div className="text-sm text-gray-300">{currentPath.estimatedTimeline}</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-purple-700/30">
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-2">Industry Demand</div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                currentPath.industryDemand === 'high' ? 'bg-green-900/50 text-green-400' :
                currentPath.industryDemand === 'growing' ? 'bg-blue-900/50 text-blue-400' :
                currentPath.industryDemand === 'stable' ? 'bg-yellow-900/50 text-yellow-400' :
                'bg-orange-900/50 text-orange-400'
              }`}>
                {currentPath.industryDemand.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
          <div className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-2">Why This Path Fits You</div>
          <ul className="space-y-1.5">
            {currentPath.whyThisPath.map((reason, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">✓</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Career Progression Timeline */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Career Progression Timeline
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Starting Role */}
          <div className="bg-gray-800 rounded-lg border border-green-700/50 p-5 relative">
            <div className="absolute top-3 right-3 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <div className="mb-3">
              <div className="text-xs text-green-400 font-semibold uppercase tracking-wide mb-1">
                {currentPath.startingRole.timeframe}
              </div>
              <h4 className="text-lg font-bold text-gray-100">{currentPath.startingRole.title}</h4>
              <p className="text-sm text-green-400 font-semibold mt-1">{currentPath.startingRole.salary}</p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Key Responsibilities</p>
                <ul className="space-y-1">
                  {currentPath.startingRole.keyResponsibilities.map((resp, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-1.5">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Required Skills</p>
                <div className="flex flex-wrap gap-1">
                  {currentPath.startingRole.requiredSkills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-green-900/30 text-green-300 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mid-Career Role */}
          <div className="bg-gray-800 rounded-lg border border-blue-700/50 p-5 relative">
            <div className="absolute top-3 right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              2
            </div>
            <div className="mb-3">
              <div className="text-xs text-blue-400 font-semibold uppercase tracking-wide mb-1">
                {currentPath.midCareer.timeframe}
              </div>
              <h4 className="text-lg font-bold text-gray-100">{currentPath.midCareer.title}</h4>
              <p className="text-sm text-blue-400 font-semibold mt-1">{currentPath.midCareer.salary}</p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Key Responsibilities</p>
                <ul className="space-y-1">
                  {currentPath.midCareer.keyResponsibilities.map((resp, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-1.5">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Required Skills</p>
                <div className="flex flex-wrap gap-1">
                  {currentPath.midCareer.requiredSkills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Senior Role */}
          <div className="bg-gray-800 rounded-lg border border-purple-700/50 p-5 relative">
            <div className="absolute top-3 right-3 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              3
            </div>
            <div className="mb-3">
              <div className="text-xs text-purple-400 font-semibold uppercase tracking-wide mb-1">
                {currentPath.seniorRole.timeframe}
              </div>
              <h4 className="text-lg font-bold text-gray-100">{currentPath.seniorRole.title}</h4>
              <p className="text-sm text-purple-400 font-semibold mt-1">{currentPath.seniorRole.salary}</p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Key Responsibilities</p>
                <ul className="space-y-1">
                  {currentPath.seniorRole.keyResponsibilities.map((resp, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-1.5">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Required Skills</p>
                <div className="flex flex-wrap gap-1">
                  {currentPath.seniorRole.requiredSkills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-purple-900/30 text-purple-300 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Development Roadmap */}
      <div>
        <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Skills Development Roadmap
        </h3>
        <div className="bg-gray-800 rounded-lg border border-purple-700/30 p-5">
          <div className="space-y-3">
            {currentPath.skillDevelopment.map((milestone, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-32">
                  <div className="text-xs font-semibold text-purple-400">{milestone.timeframe}</div>
                  <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                    milestone.importance === 'critical' ? 'bg-red-900/50 text-red-300' :
                    milestone.importance === 'important' ? 'bg-yellow-900/50 text-yellow-300' :
                    'bg-green-900/50 text-green-300'
                  }`}>
                    {milestone.importance.toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                  <div className="font-semibold text-gray-100 mb-1 text-sm">{milestone.skill}</div>
                  <div className="text-xs text-gray-400">{milestone.howToLearn}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import {
  InteractiveCareerPath as ICareerPath,
  InteractiveCareerStage,
  InteractiveSkill,
  TimelinePreference,
  DEFAULT_TIMELINE_PREFERENCES,
  GeographicSalaryData
} from '@/types/interactive-career-path';
import { InteractiveCareerGenerator } from '@/lib/career-paths/interactive-career-generator';
import { IndustryContext } from '@/components/IndustryContext';
import { IndustryContextGenerator } from '@/lib/career-paths/industry-context-generator';

interface InteractiveCareerPathProps {
  initialPath: ICareerPath;
  onSavePath?: (path: ICareerPath) => void;
  onUpdatePath?: (path: ICareerPath) => void;
}

export function InteractiveCareerPath({
  initialPath,
  onSavePath,
  onUpdatePath
}: InteractiveCareerPathProps) {
  const [path, setPath] = useState<ICareerPath>(initialPath);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [selectedSalaryView, setSelectedSalaryView] = useState<'absolute' | 'adjusted'>('absolute');

  useEffect(() => {
    onUpdatePath?.(path);
  }, [path, onUpdatePath]);

  const handleTimelineChange = (preference: TimelinePreference) => {
    const updatedPath = InteractiveCareerGenerator.updateTimelinePreference(path, preference);
    setPath(updatedPath);
  };

  const handleSkillToggle = (skillName: string, userHasSkill: boolean) => {
    const updatedPath = InteractiveCareerGenerator.updateSkillsMarked(path, skillName, userHasSkill);
    setPath(updatedPath);
  };

  const handleGeographyChange = (geography: string) => {
    setPath(prev => ({
      ...prev,
      selectedGeography: geography
    }));
  };

  const handleSavePath = () => {
    const savedPath = {
      ...path,
      isSaved: true
    };
    setPath(savedPath);
    onSavePath?.(savedPath);
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getAdjustedSalary = (salary: number, costOfLivingIndex: number) => {
    return salary / (costOfLivingIndex / 100);
  };

  const renderTimelineControls = () => (
    <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
      <h4 className="text-sm font-semibold text-gray-100 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Career Timeline Preference
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {DEFAULT_TIMELINE_PREFERENCES.map((preference) => (
          <button
            key={preference.speed}
            onClick={() => handleTimelineChange(preference)}
            className={`p-3 rounded-lg text-left transition-colors ${
              path.timelinePreference.speed === preference.speed
                ? 'bg-blue-600 text-white border border-blue-500'
                : 'bg-slate-600 text-gray-300 border border-slate-500 hover:bg-slate-500'
            }`}
          >
            <div className="font-medium text-sm">{preference.label}</div>
            <div className="text-xs opacity-90 mt-1">{preference.description}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderGeographySelector = () => (
    <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Geographic Market
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedSalaryView('absolute')}
            className={`px-2 py-1 rounded text-xs ${
              selectedSalaryView === 'absolute' ? 'bg-green-600 text-white' : 'bg-slate-600 text-gray-300'
            }`}
          >
            Absolute
          </button>
          <button
            onClick={() => setSelectedSalaryView('adjusted')}
            className={`px-2 py-1 rounded text-xs ${
              selectedSalaryView === 'adjusted' ? 'bg-green-600 text-white' : 'bg-slate-600 text-gray-300'
            }`}
          >
            Cost Adjusted
          </button>
        </div>
      </div>
      <select
        value={path.selectedGeography}
        onChange={(e) => handleGeographyChange(e.target.value)}
        className="w-full bg-slate-600 text-gray-100 rounded px-3 py-2 text-sm"
      >
        {path.stages[0]?.salaryData.map((location) => (
          <option key={location.location} value={location.location}>
            {location.location}
          </option>
        ))}
      </select>
    </div>
  );

  const renderStageCard = (stage: InteractiveCareerStage, index: number) => {
    const isExpanded = expandedStage === stage.id;
    const selectedSalaryData = stage.salaryData.find(s => s.location === path.selectedGeography);

    return (
      <div
        key={stage.id}
        className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-600/30 mb-4"
      >
        <div
          className="p-4 cursor-pointer hover:bg-blue-900/10 transition-colors"
          onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-100">{stage.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{stage.timeframe}</span>
                    {selectedSalaryData && (
                      <span className="text-green-400">
                        {selectedSalaryView === 'absolute'
                          ? `${formatSalary(selectedSalaryData.lowRange)} - ${formatSalary(selectedSalaryData.highRange)}`
                          : `${formatSalary(getAdjustedSalary(selectedSalaryData.lowRange, selectedSalaryData.costOfLivingIndex))} - ${formatSalary(getAdjustedSalary(selectedSalaryData.highRange, selectedSalaryData.costOfLivingIndex))} (adjusted)`
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-blue-600/30 p-4 space-y-6">
            {/* Job Description */}
            <div>
              <h5 className="font-semibold text-blue-400 mb-2">Role Overview</h5>
              <p className="text-gray-300 text-sm mb-4">{stage.jobDescription.overview}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h6 className="font-medium text-gray-200 text-sm mb-2">Core Responsibilities:</h6>
                  <ul className="text-gray-300 text-sm space-y-1">
                    {stage.jobDescription.coreResponsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h6 className="font-medium text-gray-200 text-sm mb-2">Typical Projects:</h6>
                  <ul className="text-gray-300 text-sm space-y-1">
                    {stage.jobDescription.typicalProjects.map((project, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>{project}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Day in the Life */}
            <div>
              <h5 className="font-semibold text-purple-400 mb-3">Day in the Life</h5>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="space-y-3">
                  {stage.jobDescription.dayInLife.map((scenario, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="text-purple-400 font-mono text-sm min-w-[60px]">
                        {scenario.timeSlot}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-200 text-sm">{scenario.activity}</div>
                        <div className="text-gray-300 text-sm">{scenario.description}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {scenario.skillsUsed.map((skill, j) => (
                            <span
                              key={j}
                              className="px-2 py-0.5 bg-purple-900/30 text-purple-300 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Salary Comparison */}
            <div>
              <h5 className="font-semibold text-green-400 mb-3">Salary Comparison</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {stage.salaryData.map((location, i) => (
                  <div
                    key={i}
                    className={`bg-slate-700/50 rounded-lg p-3 border ${
                      location.location === path.selectedGeography
                        ? 'border-green-400 bg-green-900/20'
                        : 'border-slate-600'
                    }`}
                  >
                    <div className="font-medium text-gray-200 text-sm">{location.location}</div>
                    <div className="text-green-400 font-semibold">
                      {selectedSalaryView === 'absolute'
                        ? `${formatSalary(location.lowRange)} - ${formatSalary(location.highRange)}`
                        : `${formatSalary(getAdjustedSalary(location.lowRange, location.costOfLivingIndex))} - ${formatSalary(getAdjustedSalary(location.highRange, location.costOfLivingIndex))}`
                      }
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      COL Index: {location.costOfLivingIndex} • {location.marketDemand} demand
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Milestones */}
            <div>
              <h5 className="font-semibold text-yellow-400 mb-3">Key Milestones</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {stage.keyMilestones.map((milestone, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-yellow-400 mt-1">★</span>
                    <span className="text-gray-300">{milestone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSkillDevelopment = () => (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-100">Personalized Skill Development</h4>
        <div className="text-sm text-gray-400">
          {path.developmentPlan.estimatedTotalTime} • {path.developmentPlan.estimatedCost}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-900/20 rounded-lg p-4 border border-green-600/30">
          <h5 className="font-semibold text-green-400 mb-2">Quick Wins</h5>
          <div className="space-y-2">
            {path.developmentPlan.quickWins.map((skill, i) => (
              <div key={i} className="text-sm text-gray-300">{skill.name}</div>
            ))}
          </div>
        </div>

        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
          <h5 className="font-semibold text-blue-400 mb-2">Foundation Skills</h5>
          <div className="space-y-2">
            {path.developmentPlan.foundationSkills.map((skill, i) => (
              <div key={i} className="text-sm text-gray-300">{skill.name}</div>
            ))}
          </div>
        </div>

        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-600/30">
          <h5 className="font-semibold text-purple-400 mb-2">Advanced Skills</h5>
          <div className="space-y-2">
            {path.developmentPlan.advancedSkills.map((skill, i) => (
              <div key={i} className="text-sm text-gray-300">{skill.name}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h5 className="font-semibold text-gray-100 mb-3">All Skills - Mark What You Already Have</h5>
        {path.skillDevelopment.map((skill, i) => (
          <div
            key={i}
            className={`bg-slate-700/50 rounded-lg p-4 border transition-colors ${
              skill.userHasSkill
                ? 'border-green-500 bg-green-900/20'
                : skill.importance === 'critical'
                ? 'border-red-500/50'
                : skill.importance === 'important'
                ? 'border-yellow-500/50'
                : 'border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skill.userHasSkill}
                      onChange={(e) => handleSkillToggle(skill.name, e.target.checked)}
                      className="rounded border-gray-600 bg-slate-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-100">{skill.name}</span>
                  </label>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      skill.importance === 'critical'
                        ? 'bg-red-900/50 text-red-300'
                        : skill.importance === 'important'
                        ? 'bg-yellow-900/50 text-yellow-300'
                        : 'bg-gray-900/50 text-gray-300'
                    }`}
                  >
                    {skill.importance}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mt-1">{skill.timeToLearn} • {skill.cost}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {skill.howToLearn.join(' • ')}
                </div>
              </div>
              {skill.userHasSkill && (
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-100">{path.pathName}</h3>
          <p className="text-gray-400 text-sm">{path.description}</p>
        </div>
        <button
          onClick={handleSavePath}
          disabled={path.isSaved}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            path.isSaved
              ? 'bg-green-600 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {path.isSaved ? 'Saved ✓' : 'Save Path'}
        </button>
      </div>

      {/* Controls */}
      {renderTimelineControls()}
      {renderGeographySelector()}

      {/* Career Stages */}
      <div>
        <h4 className="text-lg font-semibold text-gray-100 mb-4">Career Progression</h4>
        {path.stages.map((stage, index) => renderStageCard(stage, index))}
      </div>

      {/* Skill Development */}
      {renderSkillDevelopment()}

      {/* Industry Context */}
      <div className="mt-8">
        <IndustryContext
          industryContext={IndustryContextGenerator.generateIndustryContext(path.careerTitle)}
        />
      </div>
    </div>
  );
}
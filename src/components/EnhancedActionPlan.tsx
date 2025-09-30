'use client';

import { useState, useEffect } from 'react';
import { EnhancedActionPlanGenerator } from '@/lib/action-plan/enhanced-action-plan-generator';
import {
  EnhancedActionPlan as EnhancedActionPlanType,
  ActionableTask,
  CareerResearchTask,
  SkillBuildingTask,
  NetworkingTask,
  JobSearchTask,
  TaskResource,
  TaskTemplate,
  UnifiedTimelineEvent,
  SkillAlignmentMap
} from '@/types/enhanced-action-plan';
import { AdaptiveQuestioningEngine } from '@/lib/adaptive-questions/adaptive-engine';
import { CareerFitScore } from '@/lib/matching/realtime-career-matcher';
import { IndustryContext } from '@/components/IndustryContext';
import { IndustryContextGenerator } from '@/lib/career-paths/industry-context-generator';

interface EnhancedActionPlanProps {
  profile: ReturnType<AdaptiveQuestioningEngine['exportProfile']> & {
    topCareers?: CareerFitScore[];
  };
  onRestartExploration: () => void;
}

export function EnhancedActionPlan({ profile, onRestartExploration }: EnhancedActionPlanProps) {
  const [actionPlan, setActionPlan] = useState<EnhancedActionPlanType | null>(null);
  const [activeTab, setActiveTab] = useState<'careers' | 'skills' | 'network' | 'search' | 'timeline' | 'overview'>('overview');
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    const plan = EnhancedActionPlanGenerator.generateActionPlan(profile);
    setActionPlan(plan);

    // Load completed tasks from localStorage
    const saved = localStorage.getItem('action_plan_completed_tasks');
    if (saved) {
      setCompletedTasks(new Set(JSON.parse(saved)));
    }
  }, [profile]);

  const toggleTaskCompletion = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
    localStorage.setItem('action_plan_completed_tasks', JSON.stringify([...newCompleted]));
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const openTemplate = (template: TaskTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const copyTemplateToClipboard = (template: TaskTemplate) => {
    navigator.clipboard.writeText(template.content);
    alert('Template copied to clipboard!');
  };

  if (!actionPlan) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '', count: 0 },
    { id: 'careers' as const, label: 'Career Research', icon: '', count: actionPlan.careerResearchTasks.length },
    { id: 'skills' as const, label: 'Skill Building', icon: '', count: actionPlan.skillBuildingTasks.length },
    { id: 'network' as const, label: 'Networking', icon: '', count: actionPlan.networkingTasks.length },
    { id: 'search' as const, label: 'Job Search', icon: '', count: actionPlan.jobSearchTasks.length },
    { id: 'timeline' as const, label: 'Timeline', icon: '', count: actionPlan.unifiedTimeline.length }
  ];

  const allTasks = [
    ...actionPlan.careerResearchTasks,
    ...actionPlan.skillBuildingTasks,
    ...actionPlan.networkingTasks,
    ...actionPlan.jobSearchTasks
  ];

  const completionRate = (completedTasks.size / allTasks.length) * 100;

  return (
    <div className="mt-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-100 mb-2 flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Enhanced Action Plan
            </h2>
            <p className="text-gray-400">Actionable tasks with templates, resources, and progress tracking</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">{Math.round(completionRate)}%</div>
            <div className="text-xs text-gray-400">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-6">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
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
              <span>{tab.icon}</span>
              <span className="font-semibold text-sm">{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 text-xs">
                  {tab.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        {activeTab === 'overview' && (
          <ActionPlanOverview
            actionPlan={actionPlan}
            completedTasks={completedTasks}
            allTasks={allTasks}
          />
        )}

        {activeTab === 'careers' && (
          <CareerResearchSection
            tasks={actionPlan.careerResearchTasks}
            completedTasks={completedTasks}
            expandedTasks={expandedTasks}
            onToggleCompletion={toggleTaskCompletion}
            onToggleExpansion={toggleTaskExpansion}
            onOpenTemplate={openTemplate}
          />
        )}

        {activeTab === 'skills' && (
          <SkillBuildingSection
            tasks={actionPlan.skillBuildingTasks}
            skillAlignmentMap={actionPlan.skillAlignmentMap}
            completedTasks={completedTasks}
            expandedTasks={expandedTasks}
            onToggleCompletion={toggleTaskCompletion}
            onToggleExpansion={toggleTaskExpansion}
            onOpenTemplate={openTemplate}
          />
        )}

        {activeTab === 'network' && (
          <NetworkingSection
            tasks={actionPlan.networkingTasks}
            completedTasks={completedTasks}
            expandedTasks={expandedTasks}
            onToggleCompletion={toggleTaskCompletion}
            onToggleExpansion={toggleTaskExpansion}
            onOpenTemplate={openTemplate}
          />
        )}

        {activeTab === 'search' && (
          <JobSearchSection
            tasks={actionPlan.jobSearchTasks}
            completedTasks={completedTasks}
            expandedTasks={expandedTasks}
            onToggleCompletion={toggleTaskCompletion}
            onToggleExpansion={toggleTaskExpansion}
            onOpenTemplate={openTemplate}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineSection
            timeline={actionPlan.unifiedTimeline}
            allTasks={allTasks}
            completedTasks={completedTasks}
          />
        )}
      </div>

      {/* Template Modal */}
      {showTemplateModal && selectedTemplate && (
        <TemplateModal
          template={selectedTemplate}
          onClose={() => setShowTemplateModal(false)}
          onCopy={() => copyTemplateToClipboard(selectedTemplate)}
        />
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={onRestartExploration}
          className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Start New Assessment
        </button>
        <a
          href="/progress"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Track Progress
        </a>
        <a
          href="/careers"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Explore Careers
        </a>
      </div>
    </div>
  );
}

function ActionPlanOverview({
  actionPlan,
  completedTasks,
  allTasks
}: {
  actionPlan: EnhancedActionPlanType;
  completedTasks: Set<string>;
  allTasks: ActionableTask[];
}) {
  const tasksByPriority = {
    critical: allTasks.filter(t => t.priority === 'critical'),
    high: allTasks.filter(t => t.priority === 'high'),
    medium: allTasks.filter(t => t.priority === 'medium'),
    low: allTasks.filter(t => t.priority === 'low')
  };

  const nextActions = allTasks
    .filter(task => !completedTasks.has(task.id))
    .sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-100">Action Plan Overview</h3>

      {/* Progress Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
          <div className="text-2xl font-bold text-blue-400 mb-1">{allTasks.length}</div>
          <div className="text-xs text-gray-400">Total Tasks</div>
        </div>
        <div className="bg-green-900/30 rounded-lg p-4 border border-green-700/50">
          <div className="text-2xl font-bold text-green-400 mb-1">{completedTasks.size}</div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
        <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-700/50">
          <div className="text-2xl font-bold text-orange-400 mb-1">{allTasks.length - completedTasks.size}</div>
          <div className="text-xs text-gray-400">Remaining</div>
        </div>
        <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-700/50">
          <div className="text-2xl font-bold text-purple-400 mb-1">{tasksByPriority.critical.length}</div>
          <div className="text-xs text-gray-400">Critical Tasks</div>
        </div>
      </div>

      {/* Next Actions */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-gray-100 mb-4">Next Actions</h4>
        <div className="space-y-3">
          {nextActions.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                task.priority === 'critical' ? 'bg-red-500' :
                task.priority === 'high' ? 'bg-orange-500' :
                task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-200">{task.title}</div>
                <div className="text-xs text-gray-400">{task.category} • {task.estimatedTime}</div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                task.priority === 'critical' ? 'bg-red-900/50 text-red-300' :
                task.priority === 'high' ? 'bg-orange-900/50 text-orange-300' :
                task.priority === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                'bg-green-900/50 text-green-300'
              }`}>
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Task Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-gray-100 mb-4">Tasks by Category</h4>
          <div className="space-y-3">
            {[
              { name: 'Career Research', count: actionPlan.careerResearchTasks.length, color: 'text-blue-400' },
              { name: 'Skill Building', count: actionPlan.skillBuildingTasks.length, color: 'text-green-400' },
              { name: 'Networking', count: actionPlan.networkingTasks.length, color: 'text-purple-400' },
              { name: 'Job Search', count: actionPlan.jobSearchTasks.length, color: 'text-orange-400' }
            ].map(category => (
              <div key={category.name} className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">{category.name}</span>
                <span className={`font-semibold ${category.color}`}>{category.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-gray-100 mb-4">Priority Distribution</h4>
          <div className="space-y-3">
            {Object.entries(tasksByPriority).map(([priority, tasks]) => (
              <div key={priority} className="flex items-center justify-between">
                <span className="text-gray-300 text-sm capitalize">{priority}</span>
                <span className={`font-semibold ${
                  priority === 'critical' ? 'text-red-400' :
                  priority === 'high' ? 'text-orange-400' :
                  priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {tasks.length}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Alignment Preview */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-gray-100 mb-4">Skills-Actions Alignment</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actionPlan.skillAlignmentMap.slice(0, 4).map(alignment => (
            <div key={alignment.skillName} className="bg-gray-800/50 rounded-lg p-4">
              <div className="font-medium text-gray-200 mb-2">{alignment.skillName}</div>
              <div className="text-xs text-gray-400 mb-2">
                {alignment.relatedTasks.length} related task{alignment.relatedTasks.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${alignment.progressWeight * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400">{Math.round(alignment.progressWeight * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CareerResearchSection({
  tasks,
  completedTasks,
  expandedTasks,
  onToggleCompletion,
  onToggleExpansion,
  onOpenTemplate
}: {
  tasks: CareerResearchTask[];
  completedTasks: Set<string>;
  expandedTasks: Set<string>;
  onToggleCompletion: (taskId: string) => void;
  onToggleExpansion: (taskId: string) => void;
  onOpenTemplate: (template: TaskTemplate) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-100">Career Research Tasks</h3>
        <div className="text-sm text-gray-400">
          {tasks.filter(t => completedTasks.has(t.id)).length} of {tasks.length} completed
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            isCompleted={completedTasks.has(task.id)}
            isExpanded={expandedTasks.has(task.id)}
            onToggleCompletion={() => onToggleCompletion(task.id)}
            onToggleExpansion={() => onToggleExpansion(task.id)}
            onOpenTemplate={onOpenTemplate}
          >
            {/* Career-specific details */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-blue-400 mb-2">Research Areas</h5>
                <ul className="space-y-1">
                  {task.researchAreas.map(area => (
                    <li key={area} className="text-xs text-gray-300 flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-green-400 mb-2">Interview Questions</h5>
                <div className="text-xs text-gray-300">
                  {task.informationalInterviews.questions.length} questions prepared
                </div>
                <div className="text-xs text-gray-400">
                  Target: {task.informationalInterviews.targetRoles.join(', ')}
                </div>
              </div>
            </div>
          </TaskCard>
        ))}
      </div>

      {/* Industry Context for Top Career */}
      {tasks.length > 0 && (
        <div className="mt-8">
          <IndustryContext
            industryContext={IndustryContextGenerator.generateIndustryContext(tasks[0].careerTitle)}
            className="mt-6"
          />
        </div>
      )}
    </div>
  );
}

function SkillBuildingSection({
  tasks,
  skillAlignmentMap,
  completedTasks,
  expandedTasks,
  onToggleCompletion,
  onToggleExpansion,
  onOpenTemplate
}: {
  tasks: SkillBuildingTask[];
  skillAlignmentMap: SkillAlignmentMap[];
  completedTasks: Set<string>;
  expandedTasks: Set<string>;
  onToggleCompletion: (taskId: string) => void;
  onToggleExpansion: (taskId: string) => void;
  onOpenTemplate: (template: TaskTemplate) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-100">Skill Building Tasks</h3>
        <div className="text-sm text-gray-400">
          {tasks.filter(t => completedTasks.has(t.id)).length} of {tasks.length} completed
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            isCompleted={completedTasks.has(task.id)}
            isExpanded={expandedTasks.has(task.id)}
            onToggleCompletion={() => onToggleCompletion(task.id)}
            onToggleExpansion={() => onToggleExpansion(task.id)}
            onOpenTemplate={onOpenTemplate}
          >
            {/* Skill-specific details */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-blue-400 mb-2">Skill Level</h5>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-300">{task.currentLevel}</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-green-400">{task.targetLevel}</span>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-green-400 mb-2">Learning Path</h5>
                <div className="text-xs text-gray-300">
                  {task.learningPath.courses.length} courses • {task.learningPath.projects.length} projects
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-purple-400 mb-2">Practice Activities</h5>
                <div className="text-xs text-gray-300">
                  {task.practiceActivities.length} activities
                </div>
              </div>
            </div>
          </TaskCard>
        ))}
      </div>
    </div>
  );
}

function NetworkingSection({
  tasks,
  completedTasks,
  expandedTasks,
  onToggleCompletion,
  onToggleExpansion,
  onOpenTemplate
}: {
  tasks: NetworkingTask[];
  completedTasks: Set<string>;
  expandedTasks: Set<string>;
  onToggleCompletion: (taskId: string) => void;
  onToggleExpansion: (taskId: string) => void;
  onOpenTemplate: (template: TaskTemplate) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-100">Networking Tasks</h3>
        <div className="text-sm text-gray-400">
          {tasks.filter(t => completedTasks.has(t.id)).length} of {tasks.length} completed
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            isCompleted={completedTasks.has(task.id)}
            isExpanded={expandedTasks.has(task.id)}
            onToggleCompletion={() => onToggleCompletion(task.id)}
            onToggleExpansion={() => onToggleExpansion(task.id)}
            onOpenTemplate={onOpenTemplate}
          >
            {/* Networking-specific details */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-blue-400 mb-2">Target Network</h5>
                <div className="text-xs text-gray-300 space-y-1">
                  <div>Roles: {task.targetPeople.roles.slice(0, 2).join(', ')}</div>
                  <div>Companies: {task.targetPeople.companies.slice(0, 3).join(', ')}</div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-green-400 mb-2">Platforms</h5>
                <div className="flex flex-wrap gap-1">
                  {task.platforms.map(platform => (
                    <span key={platform} className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </TaskCard>
        ))}
      </div>
    </div>
  );
}

function JobSearchSection({
  tasks,
  completedTasks,
  expandedTasks,
  onToggleCompletion,
  onToggleExpansion,
  onOpenTemplate
}: {
  tasks: JobSearchTask[];
  completedTasks: Set<string>;
  expandedTasks: Set<string>;
  onToggleCompletion: (taskId: string) => void;
  onToggleExpansion: (taskId: string) => void;
  onOpenTemplate: (template: TaskTemplate) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-100">Job Search Tasks</h3>
        <div className="text-sm text-gray-400">
          {tasks.filter(t => completedTasks.has(t.id)).length} of {tasks.length} completed
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            isCompleted={completedTasks.has(task.id)}
            isExpanded={expandedTasks.has(task.id)}
            onToggleCompletion={() => onToggleCompletion(task.id)}
            onToggleExpansion={() => onToggleExpansion(task.id)}
            onOpenTemplate={onOpenTemplate}
          >
            {/* Job search-specific details */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-blue-400 mb-2">Application Materials</h5>
                <div className="space-y-1">
                  {Object.entries(task.applicationMaterials).map(([material, required]) => (
                    <div key={material} className="flex items-center gap-2 text-xs">
                      <span className={required ? 'text-green-400' : 'text-gray-500'}>
                        {required ? 'Required' : 'Optional'}
                      </span>
                      <span className="text-gray-300 capitalize">{material.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-green-400 mb-2">Strategy</h5>
                <div className="text-xs text-gray-300 capitalize">
                  {task.searchStrategy.replace(/_/g, ' ')}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Tracking: {task.trackingMethod}
                </div>
              </div>
            </div>
          </TaskCard>
        ))}
      </div>
    </div>
  );
}

function TimelineSection({
  timeline,
  allTasks,
  completedTasks
}: {
  timeline: UnifiedTimelineEvent[];
  allTasks: ActionableTask[];
  completedTasks: Set<string>;
}) {
  const now = new Date();
  const upcomingEvents = timeline.filter(event => event.date >= now).slice(0, 10);
  const pastEvents = timeline.filter(event => event.date < now).slice(-5);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-100">Unified Timeline</h3>

      {/* Timeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
          <div className="text-2xl font-bold text-blue-400 mb-1">{timeline.length}</div>
          <div className="text-xs text-gray-400">Total Events</div>
        </div>
        <div className="bg-green-900/30 rounded-lg p-4 border border-green-700/50">
          <div className="text-2xl font-bold text-green-400 mb-1">{upcomingEvents.length}</div>
          <div className="text-xs text-gray-400">Upcoming</div>
        </div>
        <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-700/50">
          <div className="text-2xl font-bold text-orange-400 mb-1">
            {timeline.filter(e => e.type === 'milestone').length}
          </div>
          <div className="text-xs text-gray-400">Milestones</div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-gray-100 mb-4">Upcoming Events</h4>
        <div className="space-y-3">
          {upcomingEvents.map(event => (
            <TimelineEventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-gray-100 mb-4">Recent Events</h4>
          <div className="space-y-3">
            {pastEvents.map(event => (
              <TimelineEventCard key={event.id} event={event} isPast={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  isCompleted,
  isExpanded,
  onToggleCompletion,
  onToggleExpansion,
  onOpenTemplate,
  children
}: {
  task: ActionableTask;
  isCompleted: boolean;
  isExpanded: boolean;
  onToggleCompletion: () => void;
  onToggleExpansion: () => void;
  onOpenTemplate: (template: TaskTemplate) => void;
  children?: React.ReactNode;
}) {
  const priorityColors = {
    critical: 'border-red-500 bg-red-900/10',
    high: 'border-orange-500 bg-orange-900/10',
    medium: 'border-yellow-500 bg-yellow-900/10',
    low: 'border-green-500 bg-green-900/10'
  };

  const difficultyIcons = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  };

  return (
    <div className={`rounded-lg border-l-4 p-4 ${priorityColors[task.priority]} ${
      isCompleted ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={onToggleCompletion}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isCompleted
                ? 'bg-green-600 border-green-600 text-white'
                : 'border-gray-400 hover:border-green-400'
            }`}
          >
            {isCompleted && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <div className="flex-1">
            <h4 className={`font-semibold text-gray-200 ${isCompleted ? 'line-through' : ''}`}>
              {task.title}
            </h4>
            <p className="text-gray-400 text-sm mt-1">{task.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <span className="text-gray-500">Duration: {task.estimatedTime}</span>
              <span className="text-gray-500">{difficultyIcons[task.difficulty]}</span>
              <span className={`px-2 py-1 rounded ${
                task.priority === 'critical' ? 'bg-red-900/50 text-red-300' :
                task.priority === 'high' ? 'bg-orange-900/50 text-orange-300' :
                task.priority === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                'bg-green-900/50 text-green-300'
              }`}>
                {task.priority}
              </span>
              {task.dueDate && (
                <span className="text-gray-500">
                  Due: {task.dueDate.toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onToggleExpansion}
          className="text-gray-400 hover:text-gray-200 p-1"
        >
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Prerequisites */}
          {task.prerequisites.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
              <h5 className="text-sm font-semibold text-yellow-400 mb-2">Prerequisites</h5>
              <ul className="space-y-1">
                {task.prerequisites.map(prereq => (
                  <li key={prereq} className="text-xs text-gray-300">• {prereq}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Resources */}
          {task.resources.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-blue-400 mb-3">Resources</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {task.resources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          )}

          {/* Templates */}
          {task.templates.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-green-400 mb-3">Templates</h5>
              <div className="space-y-2">
                {task.templates.map(template => (
                  <div key={template.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                    <span className="text-sm text-gray-200">{template.title}</span>
                    <button
                      onClick={() => onOpenTemplate(template)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {children}
        </div>
      )}
    </div>
  );
}

function ResourceCard({ resource }: { resource: TaskResource }) {
  const typeIcons = {
    article: 'Article',
    video: 'Video',
    tool: 'Tool',
    template: 'Template',
    course: 'Course',
    book: 'Book',
    website: 'Website'
  };

  const costColors = {
    free: 'text-green-400',
    paid: 'text-orange-400',
    freemium: 'text-blue-400'
  };

  return (
    <div className="bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700/70 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 uppercase">{typeIcons[resource.type]}</span>
          <span className="text-sm font-medium text-gray-200">{resource.title}</span>
        </div>
        <span className={`text-xs ${costColors[resource.cost]} capitalize`}>
          {resource.cost}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-2">{resource.description}</p>
      <div className="flex items-center justify-between">
        {resource.provider && (
          <span className="text-xs text-gray-500">{resource.provider}</span>
        )}
        {resource.url && (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            View →
          </a>
        )}
      </div>
    </div>
  );
}

function TimelineEventCard({ event, isPast = false }: { event: UnifiedTimelineEvent; isPast?: boolean }) {
  const typeIcons = {
    skill: 'Skill',
    task: 'Task',
    milestone: 'Milestone',
    application: 'Application',
    networking: 'Networking',
    interview: 'Interview'
  };

  const statusColors = {
    pending: 'text-gray-400',
    in_progress: 'text-blue-400',
    completed: 'text-green-400',
    blocked: 'text-red-400'
  };

  const daysFromNow = Math.ceil((event.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg ${
      isPast ? 'bg-gray-800/30' : 'bg-gray-800/50'
    } border-l-4 ${
      event.priority === 'critical' ? 'border-red-500' :
      event.priority === 'high' ? 'border-orange-500' :
      event.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
    }`}>
      <div className="text-xs text-gray-400 uppercase font-semibold">{typeIcons[event.type]}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h5 className="text-sm font-medium text-gray-200">{event.title}</h5>
          <span className={`text-xs ${statusColors[event.status]} capitalize`}>
            {event.status.replace('_', ' ')}
          </span>
        </div>
        <div className="text-xs text-gray-400 mb-1">{event.description}</div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>Date: {event.date.toLocaleDateString()}</span>
          <span>Duration: {event.duration} day{event.duration !== 1 ? 's' : ''}</span>
          {!isPast && daysFromNow >= 0 && (
            <span className={daysFromNow <= 7 ? 'text-orange-400' : 'text-gray-400'}>
              {daysFromNow === 0 ? 'Today' :
               daysFromNow === 1 ? 'Tomorrow' :
               `${daysFromNow} days`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateModal({
  template,
  onClose,
  onCopy
}: {
  template: TaskTemplate;
  onClose: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-4xl w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">{template.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            Close
          </button>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Instructions</h4>
          <p className="text-sm text-gray-400">{template.instructions}</p>
        </div>

        {template.variables.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Variables</h4>
            <div className="flex flex-wrap gap-1">
              {template.variables.map(variable => (
                <span key={variable} className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs">
                  {`{${variable}}`}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Template Content</h4>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-200 whitespace-pre-wrap overflow-x-auto">
            {template.content}
          </pre>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCopy}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Copy to Clipboard
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useWorkflow } from '@/contexts/WorkflowContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export function WorkflowProgress() {
  const { workflow } = useWorkflow();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  const steps = [
    {
      number: 1,
      label: 'Profile',
      href: '/profile',
      completed: workflow.profileCompleted,
    },
    {
      number: 2,
      label: 'Discover',
      href: '/explore',
      completed: workflow.assessmentCompleted,
    },
    {
      number: 3,
      label: 'Explore',
      href: '/careers',
      completed: workflow.savedCareers > 0,
    },
    {
      number: 4,
      label: 'Search',
      href: '/jobs',
      completed: workflow.savedJobs > 0,
    },
    {
      number: 5,
      label: 'Prep',
      href: '/progress',
      completed: workflow.prepResourcesViewed,
    },
  ];

  const currentStepIndex = steps.findIndex(s => pathname.startsWith(s.href));
  const completedCount = steps.filter(s => s.completed).length;

  // Don't show if no progress yet
  if (workflow.overallProgress === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 mb-4 sm:mb-6">
      {/* Compact Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/30 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {steps.map((step, idx) => {
              const isActive = currentStepIndex === idx;
              const isCompleted = step.completed;

              return (
                <div
                  key={step.number}
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive && isCompleted
                      ? 'bg-green-600 text-white ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800'
                      : isActive
                      ? 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-200">
              {completedCount} of 5 Complete
            </div>
            <div className="text-xs text-gray-400 hidden sm:block">
              {workflow.overallProgress}% through your journey
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-700 pt-4">
          {/* Step Links */}
          <div className="grid grid-cols-5 gap-2">
            {steps.map((step, idx) => {
              const isActive = currentStepIndex === idx;
              const isCompleted = step.completed;

              return (
                <Link
                  key={step.number}
                  href={step.href}
                  className={`text-center p-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600/20 border border-blue-500'
                      : isCompleted
                      ? 'bg-green-900/20 border border-green-600/50 hover:bg-green-900/30'
                      : 'bg-gray-700/30 border border-gray-600 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="text-xs font-semibold text-gray-200">{step.label}</div>
                </Link>
              );
            })}
          </div>

          {/* Quick Stats - Only show if there's something to show */}
          {workflow.overallProgress > 0 && (
            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
              {workflow.hasResume && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Profile set</span>
                </div>
              )}
              {workflow.assessmentCompleted && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Assessment done</span>
                </div>
              )}
              {workflow.savedCareers > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{workflow.savedCareers} careers</span>
                </div>
              )}
              {workflow.savedJobs > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{workflow.savedJobs} jobs saved</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useWorkflow } from '@/contexts/WorkflowContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function WorkflowProgress() {
  const { workflow, getNextStepRecommendation } = useWorkflow();
  const pathname = usePathname();

  const steps = [
    {
      number: 1,
      label: 'Profile',
      href: '/profile',
      completed: workflow.profileCompleted,
      description: 'Share your background',
    },
    {
      number: 2,
      label: 'Discover',
      href: '/explore',
      completed: workflow.assessmentCompleted,
      description: 'Take assessment',
    },
    {
      number: 3,
      label: 'Explore',
      href: '/careers',
      completed: workflow.savedCareers > 0,
      description: 'Find career paths',
    },
    {
      number: 4,
      label: 'Search',
      href: '/jobs',
      completed: workflow.savedJobs > 0,
      description: 'Apply to jobs',
    },
    {
      number: 5,
      label: 'Prep',
      href: '/progress',
      completed: workflow.prepResourcesViewed,
      description: 'Interview prep',
    },
  ];

  const nextStep = getNextStepRecommendation();
  const currentStepIndex = steps.findIndex(s => pathname.startsWith(s.href));

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-300">Your Journey</h3>
          <span className="text-sm text-gray-400">{workflow.overallProgress}% Complete</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${workflow.overallProgress}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {steps.map((step, index) => {
          const isActive = currentStepIndex === index;
          const isCompleted = step.completed;
          const isCurrent = workflow.currentStep === step.number;

          return (
            <Link
              key={step.number}
              href={step.href}
              className={`relative text-center p-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600/20 border-2 border-blue-500'
                  : isCompleted
                  ? 'bg-green-900/20 border border-green-600/50 hover:bg-green-900/30'
                  : isCurrent
                  ? 'bg-yellow-900/20 border border-yellow-600/50 hover:bg-yellow-900/30'
                  : 'bg-gray-700/30 border border-gray-600 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 text-sm font-bold ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isCurrent
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-600 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <div className="text-xs font-semibold text-gray-200 mb-1">{step.label}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Next Step Recommendation */}
      {workflow.overallProgress < 100 && (
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-600/30 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-100 mb-1">Recommended Next Step</h4>
              <p className="text-sm text-gray-300 mb-3">{nextStep.reason}</p>
              <Link
                href={nextStep.href}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {nextStep.label}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* What We've Learned */}
      {workflow.overallProgress > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">What We Know About You</h4>
          <div className="space-y-2 text-sm text-gray-400">
            {workflow.hasResume && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Resume analyzed and profile created</span>
              </div>
            )}
            {workflow.assessmentCompleted && workflow.topCareerArchetypes && workflow.topCareerArchetypes.length > 0 && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Top matches: {workflow.topCareerArchetypes.join(', ')}</span>
              </div>
            )}
            {workflow.savedCareers > 0 && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{workflow.savedCareers} career paths you're interested in</span>
              </div>
            )}
            {workflow.savedJobs > 0 && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{workflow.savedJobs} jobs saved for application</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

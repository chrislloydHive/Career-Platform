'use client';

import { useEffect, useState } from 'react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import Link from 'next/link';

interface StepTransitionProps {
  fromStep: number;
  toStep: number;
  show: boolean;
  onClose: () => void;
}

export function StepTransition({ fromStep, toStep, show, onClose }: StepTransitionProps) {
  const { workflow } = useWorkflow();
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  if (!isVisible) return null;

  const transitions = {
    '1-2': {
      title: 'Building on Your Profile',
      icon: (
        <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      ),
      insights: [
        workflow.hasResume
          ? 'We analyzed your resume and know your background'
          : 'We have your profile information',
        workflow.hasPreferences
          ? 'Your preferences will guide the assessment questions'
          : "We'll tailor questions to your experience level",
        'Get ready to discover work that actually fits you',
      ],
      nextAction: 'Start Assessment',
      nextHref: '/explore',
    },
    '2-3': {
      title: 'Turning Insights into Careers',
      icon: (
        <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      insights: [
        workflow.topCareerArchetypes && workflow.topCareerArchetypes.length > 0
          ? `Your top matches: ${workflow.topCareerArchetypes.slice(0, 2).join(', ')}`
          : "We've identified career paths that match your profile",
        "Now let's explore these careers in detail",
        'See salaries, day-to-day work, and growth paths',
      ],
      nextAction: 'Explore Careers',
      nextHref: '/careers',
    },
    '3-4': {
      title: 'From Exploration to Application',
      icon: (
        <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      insights: [
        workflow.savedCareers > 0
          ? `You've saved ${workflow.savedCareers} career paths`
          : 'Based on the careers you explored',
        "We'll search for real jobs that match",
        'Time to turn research into applications',
      ],
      nextAction: 'Search Jobs',
      nextHref: '/jobs',
    },
    '4-5': {
      title: 'Get Ready to Interview',
      icon: (
        <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      insights: [
        workflow.savedJobs > 0
          ? `You've saved ${workflow.savedJobs} jobs to apply for`
          : "You've been searching for jobs",
        "Let's make sure you're ready to impress",
        'Resume tips, cover letters, and interview prep',
      ],
      nextAction: 'Prep Resources',
      nextHref: '/progress',
    },
  };

  const transitionKey = `${fromStep}-${toStep}` as keyof typeof transitions;
  const transition = transitions[transitionKey];

  if (!transition) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 max-w-2xl w-full p-8 animate-slide-up">
        {/* Icon */}
        <div className="flex justify-center mb-6">{transition.icon}</div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-100 mb-6">
          {transition.title}
        </h2>

        {/* Insights List */}
        <div className="space-y-4 mb-8">
          {transition.insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-300 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all ${
                step <= toStep ? 'w-12 bg-blue-600' : 'w-8 bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Link
            href={transition.nextHref}
            onClick={onClose}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-blue-600/25"
          >
            {transition.nextAction}
          </Link>
          <button
            onClick={onClose}
            className="px-6 py-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
}

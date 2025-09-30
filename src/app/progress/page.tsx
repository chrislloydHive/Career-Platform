'use client';

import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { ProgressTracker } from '@/components/ProgressTracker';
import { ProgressNotifications, WeeklyProgressDigest } from '@/components/ProgressNotifications';

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title="Skills Development Progress"
        subtitle="Track your learning journey and career readiness"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Notifications */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              Your Learning Progress
            </h1>
            <p className="text-gray-400 text-lg">
              Monitor your skill development, track course completion, and measure career readiness
            </p>
          </div>
          <ProgressNotifications />
        </div>

        {/* Getting Started Guide */}
        <div className="mb-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-600/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-blue-300 mb-3">Getting Started with Progress Tracking</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-blue-400 text-lg font-bold">1</span>
              <div>
                <h3 className="font-medium text-gray-200">Add Skills</h3>
                <p className="text-gray-400">Import skills from your assessment results or add them manually</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-400 text-lg font-bold">2</span>
              <div>
                <h3 className="font-medium text-gray-200">Track Courses</h3>
                <p className="text-gray-400">Add learning resources and log your study time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-400 text-lg font-bold">3</span>
              <div>
                <h3 className="font-medium text-gray-200">Monitor Progress</h3>
                <p className="text-gray-400">Watch your career readiness score improve over time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Progress Tracker */}
        <ProgressTracker showFullInterface={true} />

        {/* Quick Links */}
        <div className="mt-12 bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/assessments"
              className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-medium text-gray-200 group-hover:text-gray-100">Take Assessment</h3>
              </div>
              <p className="text-sm text-gray-400">
                Discover your strengths and get personalized career recommendations
              </p>
            </Link>

            <Link
              href="/explore"
              className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="font-medium text-gray-200 group-hover:text-gray-100">Career Explorer</h3>
              </div>
              <p className="text-sm text-gray-400">
                Research different career paths and compare opportunities
              </p>
            </Link>
          </div>
        </div>

        {/* Tips and Best Practices */}
        <div className="mt-8 bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border border-orange-600/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-orange-300 mb-4">Progress Tracking Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-200 mb-2">Effective Learning Habits</h3>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• Set a consistent weekly learning goal (6-10 hours)</li>
                <li>• Log study time immediately after sessions</li>
                <li>• Focus on critical skills first for maximum impact</li>
                <li>• Complete courses rather than starting many at once</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-200 mb-2">Using Your Data</h3>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• Review your career readiness score monthly</li>
                <li>• Share progress updates with mentors quarterly</li>
                <li>• Adjust your learning plan based on job market trends</li>
                <li>• Celebrate milestones to maintain motivation</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Weekly Progress Digest */}
      <WeeklyProgressDigest />
    </div>
  );
}
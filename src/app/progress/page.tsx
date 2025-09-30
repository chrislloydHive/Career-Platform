'use client';

import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { ProgressTracker } from '@/components/ProgressTracker';
import { ProgressNotifications, WeeklyProgressDigest } from '@/components/ProgressNotifications';

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title="Job Search Help"
        subtitle="Everything you need to land your next role"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Let's Get You Hired
          </h1>
          <p className="text-gray-400 text-lg">
            Practical advice for job searching, applications, and landing interviews
          </p>
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Job Search Strategy */}
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-600/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-100">How to Actually Search for Jobs</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-200 mb-2">Use the right keywords</h3>
                <p className="text-sm">Don't search for "I want to work in marketing." Try specific titles like "Marketing Coordinator" or "Social Media Associate." Companies post jobs with exact titles.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-200 mb-2">Apply early</h3>
                <p className="text-sm">Most jobs get hundreds of applications. Apply within the first 24-48 hours of posting. Set up alerts on LinkedIn, Indeed, and company career pages.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-200 mb-2">Don't ignore job requirements</h3>
                <p className="text-sm">Yeah, they might say "2+ years preferred," but if you have relevant internships or projects, apply anyway. The worst they can say is no.</p>
              </div>
              <div className="pt-4 border-t border-blue-600/30">
                <Link href="/jobs" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2">
                  Start Your Job Search →
                </Link>
              </div>
            </div>
          </div>

          {/* Cover Letters */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-600/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-100">Writing Cover Letters That Don't Suck</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-200 mb-2">Keep it short</h3>
                <p className="text-sm">3-4 paragraphs max. Nobody's reading your life story. Intro → Why you fit → One specific example → Close.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-200 mb-2">Actually customize it</h3>
                <p className="text-sm">Don't just swap the company name. Mention something specific about the role or company. "I saw you're expanding into [market]" shows you did 30 seconds of research.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-200 mb-2">Show, don't tell</h3>
                <p className="text-sm">Instead of "I'm a great communicator," say "I managed a team Instagram account that grew 40% in 3 months." Numbers and results beat adjectives.</p>
              </div>
              <div className="pt-4 border-t border-purple-600/30">
                <Link href="/chat" className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-2">
                  Get AI Help with Your Cover Letter →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Resume Tips */}
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-600/30 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-100">Resume Quick Fixes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-200 mb-3">Common Mistakes to Fix Right Now:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Using an objective statement (nobody cares about your "dynamic professional seeking to leverage")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Writing paragraphs instead of bullet points</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Listing "Microsoft Office" as a skill in 2025</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Going over 1 page when you have less than 3 years of experience</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-200 mb-3">What Actually Works:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Start every bullet with an action verb (Led, Created, Analyzed, Managed)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Include numbers whenever possible ("increased engagement by 30%")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Tailor your skills section to match the job posting keywords</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Include relevant projects, freelance work, or side hustles</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Interview Prep */}
        <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-600/30 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-100">Interview Prep (The Stuff That Actually Helps)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-200 mb-3">Pick THE 3 Things About You</h3>
              <p className="text-sm">Choose 3 specific stories that show THE three things you want them to know about you. Not "I'm a team player" - actual examples like "I led a group project where we had to pivot our entire strategy." Your whole interview strategy is finding ways to tell these 3 stories no matter what they ask.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-200 mb-3">Research the Company (5 Minutes)</h3>
              <p className="text-sm">Look at their "About" page, recent news, and LinkedIn. Know their product/service and have 2-3 questions ready. "What does a typical day look like?" works every time.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-200 mb-3">Ask About Next Steps</h3>
              <p className="text-sm">At the end, always ask "What are the next steps in your process?" Shows interest and helps you plan your follow-up. Send a thank you email within 24 hours.</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Keep Going</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/explore"
              className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="font-medium text-gray-200 group-hover:text-gray-100">Take the Assessment</h3>
              </div>
              <p className="text-sm text-gray-400">
                Figure out what roles actually match your skills and interests
              </p>
            </Link>

            <Link
              href="/jobs"
              className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="font-medium text-gray-200 group-hover:text-gray-100">Search Jobs</h3>
              </div>
              <p className="text-sm text-gray-400">
                Start applying to real positions right now
              </p>
            </Link>

            <Link
              href="/chat"
              className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="font-medium text-gray-200 group-hover:text-gray-100">Get AI Help</h3>
              </div>
              <p className="text-sm text-gray-400">
                Ask questions about specific roles or applications
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
'use client';

import { Navigation } from '@/components/Navigation';
import Link from 'next/link';

export default function ResourcesPage() {
  const resources = [
    {
      category: 'Day-in-the-Life Content',
      items: [
        {
          name: 'YouTube',
          url: 'https://www.youtube.com',
          description: 'Search "day in the life [job title]" for authentic video content from real professionals',
          icon: '',
        },
        {
          name: 'TikTok',
          url: 'https://www.tiktok.com',
          description: 'Follow #dayinthelife, #corporatelife for short, unfiltered glimpses into different careers',
          icon: '',
        },
      ],
    },
    {
      category: 'Detailed Job Information',
      items: [
        {
          name: 'O*NET Online',
          url: 'https://www.onetonline.org',
          description: 'Comprehensive official database with detailed work activities, skills, and work context for 1000+ occupations',
          icon: '',
        },
        {
          name: 'Bureau of Labor Statistics',
          url: 'https://www.bls.gov/ooh',
          description: 'Occupational Outlook Handbook with job projections, median pay, and requirements',
          icon: '',
        },
        {
          name: 'Indeed Career Guide',
          url: 'https://www.indeed.com/career-advice',
          description: 'Free articles on job descriptions, requirements, and career exploration',
          icon: '',
        },
      ],
    },
    {
      category: 'Employee Reviews & Reality',
      items: [
        {
          name: 'Glassdoor',
          url: 'https://www.glassdoor.com',
          description: 'Real employee reviews, salary data, interview questions, and work-life balance ratings',
          icon: '',
        },
        {
          name: 'Blind',
          url: 'https://www.teamblind.com',
          description: 'Anonymous professional community with honest discussions about company culture and compensation',
          icon: '',
        },
      ],
    },
    {
      category: 'Community Discussions',
      items: [
        {
          name: 'Reddit - CS Careers',
          url: 'https://www.reddit.com/r/cscareerquestions',
          description: 'Tech and software engineering career discussions',
          icon: '',
        },
        {
          name: 'Reddit - Career Guidance',
          url: 'https://www.reddit.com/r/careerguidance',
          description: 'General career advice and exploration discussions',
          icon: '',
        },
        {
          name: 'Reddit - Jobs',
          url: 'https://www.reddit.com/r/jobs',
          description: 'Job search, career advice, and workplace discussions',
          icon: '',
        },
      ],
    },
    {
      category: 'Salary & Compensation',
      items: [
        {
          name: 'Levels.fyi',
          url: 'https://www.levels.fyi',
          description: 'Tech industry compensation data with total comp (salary + equity + bonus)',
          icon: '',
        },
        {
          name: 'Payscale',
          url: 'https://www.payscale.com',
          description: 'Salary comparison tool with personalized reports and cost of living adjustments',
          icon: '',
        },
        {
          name: 'H1B Salary Database',
          url: 'https://h1bdata.info',
          description: 'Exact salaries for H1B visa positions, great proxy for market rates',
          icon: '',
        },
      ],
    },
    {
      category: 'Learning & Exploration',
      items: [
        {
          name: 'Coursera',
          url: 'https://www.coursera.org',
          description: 'Take intro courses to test if you enjoy the type of work (many free to audit)',
          icon: '',
        },
        {
          name: 'LinkedIn Learning',
          url: 'https://www.linkedin.com/learning',
          description: 'Professional development courses across many industries',
          icon: '',
        },
      ],
    },
  ];

  const researchSteps = [
    {
      step: '1',
      title: 'Browse Broadly',
      time: 'Week 1',
      tasks: [
        'Watch 5-10 "day in the life" videos on YouTube',
        'Read O*NET descriptions for interesting jobs',
        'Scroll through career subreddits',
        'Use our Career Chat to explore options',
      ],
    },
    {
      step: '2',
      title: 'Deep Dive',
      time: 'Week 2-3',
      tasks: [
        'Pick 3-5 careers that seem promising',
        'Read Glassdoor reviews from employees',
        'Join industry-specific communities',
        'Take a Coursera intro course',
        'Reach out for 2-3 informational interviews',
      ],
    },
    {
      step: '3',
      title: 'Reality Test',
      time: 'Week 4+',
      tasks: [
        'Try to do the work (project, freelance, volunteer)',
        'Shadow someone for a day if possible',
        'Talk to people who left that career',
        'Check if your assumptions were correct',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title="Career Research Resources"
        subtitle="Discover what different jobs are really like"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h2 className="text-lg font-semibold text-gray-100 mb-2">Why Research Careers?</h2>
              <p className="text-gray-300 leading-relaxed">
                The best way to know if a career is right for you is to learn what the work is actually like—not just the job title.
                These resources help you discover the day-to-day reality, salary expectations, required skills, and honest pros and cons from real people.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {resources.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-xl font-bold text-gray-100 mb-4">{section.category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((resource, ridx) => (
                  <a
                    key={ridx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-blue-500 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                          {resource.name}
                        </h3>
                      </div>
                      <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{resource.description}</p>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Research Strategy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {researchSteps.map((step) => (
              <div key={step.step} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-100">{step.title}</h3>
                    <p className="text-sm text-gray-400">{step.time}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {step.tasks.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Red Flags to Watch For
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Everyone complains about burnout or poor work-life balance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Big gap between job marketing and reality</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>High turnover - people leave quickly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Gatekeeping: &quot;You need to sacrifice everything&quot;</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Green Flags to Look For
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>People are enthusiastic, even about challenges</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Clear growth path and career progression</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Transferable skills useful beyond this one job</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Sustainable pace - people stay long-term and are healthy</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">Use Our Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/chat" className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <div>
                <div className="font-medium text-gray-100">Career Chat</div>
                <div className="text-xs text-gray-400">Ask AI about any career</div>
              </div>
            </Link>

            <Link href="/careers" className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <div className="font-medium text-gray-100">Career Explorer</div>
                <div className="text-xs text-gray-400">Browse our database</div>
              </div>
            </Link>

            <Link href="/explore" className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <div>
                <div className="font-medium text-gray-100">Self Discovery</div>
                <div className="text-xs text-gray-400">Find your interests</div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
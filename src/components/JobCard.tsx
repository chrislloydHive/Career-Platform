'use client';

import { ScoredJob, JobSource } from '@/types';

interface JobCardProps {
  job: ScoredJob;
  rank?: number;
}

export function JobCard({ job, rank }: JobCardProps) {
  const formatSalary = (salary: typeof job.salary) => {
    if (!salary) return 'Salary not specified';

    const { min, max, currency, period } = salary;
    const periodMap = {
      hourly: '/hr',
      daily: '/day',
      weekly: '/wk',
      monthly: '/mo',
      yearly: '/yr',
    };

    if (min && max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}${periodMap[period]}`;
    } else if (min) {
      return `${currency} ${min.toLocaleString()}+${periodMap[period]}`;
    } else if (max) {
      return `Up to ${currency} ${max.toLocaleString()}${periodMap[period]}`;
    }
    return 'Salary not specified';
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return dateObj.toLocaleDateString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-900/50 border-green-700';
    if (score >= 60) return 'text-blue-400 bg-blue-900/50 border-blue-700';
    if (score >= 40) return 'text-yellow-400 bg-yellow-900/50 border-yellow-700';
    return 'text-gray-400 bg-gray-800 border-gray-700';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const sourceColors: Record<JobSource, string> = {
    linkedin: 'bg-blue-900/50 text-blue-400',
    indeed: 'bg-purple-900/50 text-purple-400',
    google_jobs: 'bg-green-900/50 text-green-400',
    company_scraper: 'bg-orange-900/50 text-orange-400',
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-700">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {rank && (
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-gray-400 bg-gray-800 rounded-full">
                {rank}
              </span>
            )}
            <h3 className="text-xl font-semibold text-gray-100">{job.title}</h3>
          </div>
          <p className="text-lg text-gray-300">{job.company}</p>
        </div>
        <div className={`px-3 py-1 rounded-full border-2 ${getScoreColor(job.score)}`}>
          <span className="text-sm font-bold">{job.score.toFixed(0)}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-400">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.location}
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatSalary(job.salary)}
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Posted {formatDate(job.postedDate)}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-400 line-clamp-3">{job.description}</p>
      </div>

      <div className="space-y-3 mb-4">
        <div className="text-xs font-medium text-gray-300 mb-1">Score Breakdown</div>
        {[
          { label: 'Location', ...job.scoreBreakdown.location, color: 'bg-blue-500' },
          { label: 'Title', ...job.scoreBreakdown.titleRelevance, color: 'bg-green-500' },
          { label: 'Salary', ...job.scoreBreakdown.salary, color: 'bg-purple-500' },
          { label: 'Source', ...job.scoreBreakdown.sourceQuality, color: 'bg-orange-500' },
        ].map(({ label, score, weighted, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-16">{label}</span>
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div
                className={`${color} h-2 rounded-full transition-all`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-12 text-right">
              {weighted.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${sourceColors[job.source]}`}>
          {job.source.charAt(0).toUpperCase() + job.source.slice(1)}
        </span>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          View Job
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import {
  DiscoveryDrivenSearch,
  JobMatch,
  SearchTerm,
  DiscoveryMatch,
} from '@/lib/jobs/discovery-driven-search';

interface DiscoveryDrivenJobResultsProps {
  search: DiscoveryDrivenSearch;
  jobs: JobMatch[];
  onApplyToJob?: (jobId: string) => void;
}

export function DiscoveryDrivenJobResults({
  search,
  jobs,
  onApplyToJob,
}: DiscoveryDrivenJobResultsProps) {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const getCategoryIcon = (category: SearchTerm['category']) => {
    switch (category) {
      case 'role':
        return 'Role';
      case 'skill':
        return 'Skill';
      case 'value':
        return 'Value';
      case 'industry':
        return 'Industry';
      case 'work-style':
        return 'Work Style';
    }
  };

  const getCategoryColor = (category: SearchTerm['category']) => {
    switch (category) {
      case 'role':
        return 'bg-blue-900/30 text-blue-400 border-blue-700';
      case 'skill':
        return 'bg-green-900/30 text-green-400 border-green-700';
      case 'value':
        return 'bg-purple-900/30 text-purple-400 border-purple-700';
      case 'industry':
        return 'bg-orange-900/30 text-orange-400 border-orange-700';
      case 'work-style':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
    }
  };

  const getMatchStrengthColor = (strength: DiscoveryMatch['matchStrength']) => {
    switch (strength) {
      case 'strong':
        return 'bg-green-600 text-white';
      case 'moderate':
        return 'bg-blue-600 text-white';
      case 'potential':
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg border-2 border-blue-600/60 p-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-2 flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Jobs Matched to Your Discoveries
        </h2>
        <p className="text-gray-300 text-sm mb-4">{search.explanation}</p>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Search Terms Generated from Your Insights:</h3>
            <div className="flex flex-wrap gap-2">
              {search.searchTerms.map((term, index) => (
                <div
                  key={index}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${getCategoryColor(term.category)}`}
                >
                  <span className="mr-1">{getCategoryIcon(term.category)}</span>
                  {term.term}
                  <span className="ml-1.5 text-xs opacity-70">
                    {Math.round(term.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {search.filters.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Applied Filters:</h3>
              <div className="space-y-2">
                {search.filters.map((filter, index) => (
                  <div key={index} className="bg-gray-800/70 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-blue-900/50 text-blue-400 rounded text-xs font-medium">
                            {filter.type.replace('-', ' ')}
                          </span>
                          <span className="text-gray-200 font-medium">{filter.value}</span>
                        </div>
                        <p className="text-xs text-gray-400">{filter.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {search.insightsSummary.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-400 mb-2">Based on these discoveries:</h3>
              <ul className="space-y-1">
                {search.insightsSummary.map((insight, index) => (
                  <li key={index} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {jobs.length} Matching Opportunities
        </h3>

        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-blue-600 transition-all"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-100 mb-1">{job.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="font-medium">{job.company}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    {job.remote && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-0.5 bg-green-900/50 text-green-400 rounded text-xs font-medium">
                          Remote
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    {Math.round(job.overallMatch)}%
                  </div>
                  <div className="text-xs text-gray-400">Match</div>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-3">{job.description}</p>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold text-gray-400">
                    Discovery Matches ({job.discoveryMatches.length})
                  </h5>
                </div>
                <div className="space-y-2">
                  {job.discoveryMatches.slice(0, expandedJob === job.id ? undefined : 3).map((match, index) => (
                    <div key={index} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-start gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getMatchStrengthColor(match.matchStrength)}`}>
                          {match.matchStrength}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-300 mb-1">{match.explanation}</p>
                          <div className="bg-gray-800 rounded p-2 border border-gray-700">
                            <p className="text-xs text-gray-400 mb-1 font-medium">Your insight:</p>
                            <p className="text-xs text-blue-400 italic mb-2">&quot;{match.insight}&quot;</p>
                            <p className="text-xs text-gray-400 mb-1 font-medium">Job evidence:</p>
                            <p className="text-xs text-gray-300">&quot;{match.jobEvidence}&quot;</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {job.discoveryMatches.length > 3 && (
                  <button
                    onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                    className="mt-2 text-sm text-blue-400 hover:text-blue-300 font-medium"
                  >
                    {expandedJob === job.id
                      ? 'Show less'
                      : `Show ${job.discoveryMatches.length - 3} more matches`}
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => onApplyToJob?.(job.id)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply Now
                </button>
                <button
                  onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {expandedJob === job.id ? 'Show Less' : 'View Details'}
                </button>
              </div>
            </div>

            {expandedJob === job.id && (
              <div className="border-t border-gray-700 p-6 bg-gray-900/50">
                <h5 className="text-sm font-semibold text-gray-300 mb-3">Requirements:</h5>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
            <p className="text-gray-400">
              No jobs found yet. Keep answering questions to discover more matches!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
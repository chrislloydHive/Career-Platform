'use client';

import { useState, useMemo } from 'react';
import { ScoredJob, JobSource } from '@/types';
import { JobCard } from './JobCard';

interface JobListProps {
  jobs: ScoredJob[];
  isLoading?: boolean;
}

type SortOption = 'score' | 'date' | 'salary' | 'title';
type SortDirection = 'asc' | 'desc';

export function JobList({ jobs, isLoading = false }: JobListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterSource, setFilterSource] = useState<JobSource | 'all'>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...jobs];

    if (filterSource !== 'all') {
      filtered = filtered.filter(job => job.source === filterSource);
    }

    if (minScore > 0) {
      filtered = filtered.filter(job => job.score >= minScore);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'date':
          comparison = a.postedDate.getTime() - b.postedDate.getTime();
          break;
        case 'salary': {
          const aSalary = a.salary?.max || a.salary?.min || 0;
          const bSalary = b.salary?.max || b.salary?.min || 0;
          comparison = aSalary - bSalary;
          break;
        }
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [jobs, sortBy, sortDirection, filterSource, minScore, searchTerm]);

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };

  const sourceStats = useMemo(() => {
    return jobs.reduce((acc, job) => {
      acc[job.source] = (acc[job.source] || 0) + 1;
      return acc;
    }, {} as Record<JobSource, number>);
  }, [jobs]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-400">Loading jobs...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-md p-12 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-100 mb-2">No jobs found</h3>
        <p className="text-gray-400">Try adjusting your search criteria to find more jobs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg shadow-md p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="search" className="text-sm font-medium text-gray-300 mr-2">
                Quick Search:
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by title, company, location..."
                className="px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="source" className="text-sm font-medium text-gray-300">
                Source:
              </label>
              <select
                id="source"
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as JobSource | 'all')}
                className="px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All ({jobs.length})</option>
                <option value="linkedin">LinkedIn ({sourceStats.linkedin || 0})</option>
                <option value="indeed">Indeed ({sourceStats.indeed || 0})</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="minScore" className="text-sm font-medium text-gray-300">
                Min Score:
              </label>
              <input
                id="minScore"
                type="number"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">Sort by:</span>
            <div className="flex gap-1">
              {[
                { value: 'score' as SortOption, label: 'Score' },
                { value: 'date' as SortOption, label: 'Date' },
                { value: 'salary' as SortOption, label: 'Salary' },
                { value: 'title' as SortOption, label: 'Title' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleSortChange(value)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    sortBy === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {label}
                  {sortBy === value && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>
          Showing {filteredAndSortedJobs.length} of {jobs.length} jobs
        </span>
        {filteredAndSortedJobs.length > 0 && (
          <span>
            Average score: {(filteredAndSortedJobs.reduce((sum, job) => sum + job.score, 0) / filteredAndSortedJobs.length).toFixed(1)}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {filteredAndSortedJobs.map((job, index) => (
          <JobCard key={job.id} job={job} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}
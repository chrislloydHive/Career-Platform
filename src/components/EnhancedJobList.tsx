'use client';

import { useState, useMemo } from 'react';
import { ScoredJob, JobSource } from '@/types';
import { JobCard } from './JobCard';

interface EnhancedJobListProps {
  jobs: ScoredJob[];
  isLoading?: boolean;
  onSaveJob?: (job: ScoredJob) => void;
  savedJobIds?: string[];
}

type SortOption = 'score' | 'date' | 'salary' | 'title' | 'company';
type SortDirection = 'asc' | 'desc';

export function EnhancedJobList({
  jobs,
  isLoading = false,
  onSaveJob,
  savedJobIds = [],
}: EnhancedJobListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterSource, setFilterSource] = useState<JobSource | 'all'>('all');
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 500000]);
  const [locationFilter, setLocationFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const uniqueLocations = useMemo(() => {
    const locations = new Set(jobs.map(job => job.location));
    return Array.from(locations).sort();
  }, [jobs]);

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...jobs];

    if (filterSource !== 'all') {
      filtered = filtered.filter(job => job.source === filterSource);
    }

    filtered = filtered.filter(job =>
      job.score >= scoreRange[0] && job.score <= scoreRange[1]
    );

    if (locationFilter && locationFilter !== 'all') {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    filtered = filtered.filter(job => {
      const salary = job.salary?.min || job.salary?.max || 0;
      return salary >= salaryRange[0] && salary <= salaryRange[1];
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term)
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
        case 'company':
          comparison = a.company.localeCompare(b.company);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [jobs, sortBy, sortDirection, filterSource, scoreRange, locationFilter, salaryRange, searchTerm]);

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Company', 'Location', 'Salary', 'Score', 'Source', 'Posted Date', 'URL'];
    const rows = filteredAndSortedJobs.map(job => [
      job.title,
      job.company,
      job.location,
      job.salary ? `${job.salary.min || ''}-${job.salary.max || ''} ${job.salary.currency}` : 'N/A',
      job.score.toFixed(1),
      job.source,
      job.postedDate.toLocaleDateString(),
      job.url,
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-search-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const data = filteredAndSortedJobs.map(job => ({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      score: job.score,
      scoreBreakdown: job.scoreBreakdown,
      source: job.source,
      postedDate: job.postedDate,
      url: job.url,
      description: job.description,
    }));

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-search-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setFilterSource('all');
    setScoreRange([0, 100]);
    setSalaryRange([0, 500000]);
    setLocationFilter('');
    setSearchTerm('');
  };

  const stats = useMemo(() => {
    return {
      total: jobs.length,
      filtered: filteredAndSortedJobs.length,
      avgScore: filteredAndSortedJobs.length > 0
        ? filteredAndSortedJobs.reduce((sum, job) => sum + job.score, 0) / filteredAndSortedJobs.length
        : 0,
      highScore: filteredAndSortedJobs.filter(j => j.score >= 80).length,
      mediumScore: filteredAndSortedJobs.filter(j => j.score >= 50 && j.score < 80).length,
      lowScore: filteredAndSortedJobs.filter(j => j.score < 50).length,
    };
  }, [jobs, filteredAndSortedJobs]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gray-900 rounded-lg shadow-md">
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
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-lg shadow-md p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-100">
              {stats.filtered} {stats.filtered === 1 ? 'Job' : 'Jobs'}
            </h2>
            {stats.filtered !== stats.total && (
              <span className="text-sm text-gray-400">of {stats.total}</span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 text-sm text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters {showFilters ? '▲' : '▼'}
            </button>

            <div className="flex items-center gap-1 border border-gray-600 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-900/50 text-blue-400' : 'text-gray-400 hover:bg-gray-800'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-900/50 text-blue-400' : 'text-gray-400 hover:bg-gray-800'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>

            <button
              onClick={exportToCSV}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>
            <button
              onClick={exportToJSON}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              JSON
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-gray-700 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Title, company, description..."
                  className="w-full px-3 py-2 text-sm bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Source</label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value as JobSource | 'all')}
                  className="w-full px-3 py-2 text-sm bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Sources</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="indeed">Indeed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Score Range: {scoreRange[0]} - {scoreRange[1]}
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoreRange[0]}
                    onChange={(e) => setScoreRange([parseInt(e.target.value), scoreRange[1]])}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoreRange[1]}
                    onChange={(e) => setScoreRange([scoreRange[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Salary Range: ${(salaryRange[0] / 1000).toFixed(0)}k - ${(salaryRange[1] / 1000).toFixed(0)}k
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="10000"
                    value={salaryRange[0]}
                    onChange={(e) => setSalaryRange([parseInt(e.target.value), salaryRange[1]])}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="10000"
                    value={salaryRange[1]}
                    onChange={(e) => setSalaryRange([salaryRange[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-3 py-2 text-sm bg-gray-800 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded"></span>
              High ({stats.highScore})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded"></span>
              Medium ({stats.mediumScore})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-500 rounded"></span>
              Low ({stats.lowScore})
            </span>
            <span className="ml-2">Avg: {stats.avgScore.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-300">Sort by:</span>
            {[
              { value: 'score' as SortOption, label: 'Score' },
              { value: 'date' as SortOption, label: 'Date' },
              { value: 'salary' as SortOption, label: 'Salary' },
              { value: 'title' as SortOption, label: 'Title' },
              { value: 'company' as SortOption, label: 'Company' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleSortChange(value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
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

      <div className={viewMode === 'grid'
        ? 'grid grid-cols-1 lg:grid-cols-2 gap-4'
        : 'space-y-4'
      }>
        {filteredAndSortedJobs.map((job, index) => (
          <div key={job.id} className="relative">
            {onSaveJob && (
              <button
                onClick={() => onSaveJob(job)}
                className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all ${
                  savedJobIds.includes(job.id)
                    ? 'bg-yellow-900/50 text-yellow-400 hover:bg-yellow-900'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-yellow-400'
                }`}
                title={savedJobIds.includes(job.id) ? 'Saved' : 'Save job'}
              >
                <svg className="w-5 h-5" fill={savedJobIds.includes(job.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            )}
            <JobCard job={job} rank={index + 1} />
          </div>
        ))}
      </div>
    </div>
  );
}
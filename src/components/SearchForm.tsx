'use client';

import { useState } from 'react';
import { SearchCriteria, JobSource, JobType } from '@/types';

interface SearchFormProps {
  onSearch: (criteria: SearchCriteria) => void;
  isLoading?: boolean;
}

export function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [selectedSources, setSelectedSources] = useState<JobSource[]>(['linkedin', 'indeed']);
  const [selectedJobTypes, setSelectedJobTypes] = useState<JobType[]>([]);
  const [keywords, setKeywords] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const criteria: SearchCriteria = {
      query,
      location: location || undefined,
      sources: selectedSources.length > 0 ? selectedSources : undefined,
      jobTypes: selectedJobTypes.length > 0 ? selectedJobTypes : undefined,
      salary: minSalary || maxSalary ? {
        min: minSalary ? parseInt(minSalary) : undefined,
        max: maxSalary ? parseInt(maxSalary) : undefined,
        currency: 'USD',
      } : undefined,
      keywords: keywords ? keywords.split(',').map(k => k.trim()).filter(Boolean) : undefined,
    };

    onSearch(criteria);
  };

  const toggleSource = (source: JobSource) => {
    setSelectedSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const toggleJobType = (type: JobType) => {
    setSelectedJobTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg shadow-md p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-300 mb-1">
            Job Title or Keywords
          </label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Software Engineer, Product Manager"
            className="w-full px-4 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. San Francisco, Remote"
            className="w-full px-4 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="minSalary" className="block text-sm font-medium text-gray-300 mb-1">
              Min Salary (USD)
            </label>
            <input
              id="minSalary"
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              placeholder="e.g. 80000"
              className="w-full px-4 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="maxSalary" className="block text-sm font-medium text-gray-300 mb-1">
              Max Salary (USD)
            </label>
            <input
              id="maxSalary"
              type="number"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
              placeholder="e.g. 150000"
              className="w-full px-4 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Job Sources
          </label>
          <div className="flex gap-4">
            {(['linkedin', 'indeed'] as JobSource[]).map(source => (
              <label key={source} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source)}
                  onChange={() => toggleSource(source)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-300 capitalize">{source}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Job Type
          </label>
          <div className="flex flex-wrap gap-3">
            {(['full-time', 'part-time', 'contract', 'temporary', 'internship'] as JobType[]).map(type => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedJobTypes.includes(type)}
                  onChange={() => toggleJobType(type)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-300 capitalize">{type.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-300 mb-1">
            Additional Keywords (comma-separated)
          </label>
          <input
            id="keywords"
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. React, TypeScript, Remote"
            className="w-full px-4 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Searching...' : 'Search Jobs'}
      </button>
    </form>
  );
}
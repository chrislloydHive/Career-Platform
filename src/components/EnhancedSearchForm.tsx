'use client';

import { useState, useEffect, useRef } from 'react';
import { SearchCriteria, JobSource, JobType } from '@/types';
import { CompanyJobScraper } from './CompanyJobScraper';

interface EnhancedSearchFormProps {
  onSearch: (criteria: SearchCriteria) => void;
  isLoading?: boolean;
  error?: string | null;
  onClearError?: () => void;
  initialValues?: Partial<SearchCriteria>;
}

const JOB_TITLE_SUGGESTIONS = [
  'Software Engineer',
  'Senior Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Product Manager',
  'Senior Product Manager',
  'Data Scientist',
  'Data Engineer',
  'DevOps Engineer',
  'UX Designer',
  'UI Designer',
  'Engineering Manager',
  'Technical Lead',
  'Solutions Architect',
  'Business Analyst',
  'QA Engineer',
  'Machine Learning Engineer',
  'Cloud Architect',
  'Cybersecurity Engineer',
];

const POPULAR_LOCATIONS = [
  'Remote',
  'San Francisco, CA',
  'New York, NY',
  'Seattle, WA',
  'Austin, TX',
  'Boston, MA',
  'Los Angeles, CA',
  'Chicago, IL',
  'Denver, CO',
  'Portland, OR',
];

const SALARY_RANGES = [
  { min: 0, max: 60000, label: '0-60k' },
  { min: 60000, max: 80000, label: '60k-80k' },
  { min: 80000, max: 100000, label: '80k-100k' },
  { min: 100000, max: 120000, label: '100k-120k' },
];

export function EnhancedSearchForm({
  onSearch,
  isLoading = false,
  error,
  onClearError,
  initialValues,
}: EnhancedSearchFormProps) {
  const [query, setQuery] = useState(initialValues?.query || '');
  const [location, setLocation] = useState(initialValues?.location || 'Seattle, WA');
  const [showQuerySuggestions, setShowQuerySuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [selectedSources, setSelectedSources] = useState<JobSource[]>(
    initialValues?.sources || ['google_jobs']
  );
  const [selectedJobTypes, setSelectedJobTypes] = useState<JobType[]>(
    initialValues?.jobTypes || []
  );
  const [keywords, setKeywords] = useState(
    initialValues?.keywords?.join(', ') || ''
  );
  const [salaryRange, setSalaryRange] = useState<string>(
    initialValues?.salary ? `${initialValues.salary.min || 0}-${initialValues.salary.max || 999999}` : ''
  );
  const [customMinSalary, setCustomMinSalary] = useState('');
  const [customMaxSalary, setCustomMaxSalary] = useState('');
  const [useCustomSalary, setUseCustomSalary] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const queryInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error && onClearError) {
      const timer = setTimeout(onClearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, onClearError]);

  const filteredQuerySuggestions = JOB_TITLE_SUGGESTIONS.filter(
    suggestion => suggestion.toLowerCase().includes(query.toLowerCase()) && suggestion !== query
  ).slice(0, 6);

  const filteredLocationSuggestions = POPULAR_LOCATIONS.filter(
    loc => loc.toLowerCase().includes(location.toLowerCase()) && loc !== location
  ).slice(0, 6);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!query.trim()) {
      errors.push('Job title or keywords is required');
    }

    if (selectedSources.length === 0) {
      errors.push('Please select at least one job source');
    }

    if (useCustomSalary) {
      const min = parseInt(customMinSalary);
      const max = parseInt(customMaxSalary);

      if (customMinSalary && isNaN(min)) {
        errors.push('Minimum salary must be a valid number');
      }
      if (customMaxSalary && isNaN(max)) {
        errors.push('Maximum salary must be a valid number');
      }
      if (customMinSalary && customMaxSalary && min > max) {
        errors.push('Minimum salary cannot be greater than maximum salary');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    let salaryMin: number | undefined;
    let salaryMax: number | undefined;

    if (useCustomSalary) {
      salaryMin = customMinSalary ? parseInt(customMinSalary) : undefined;
      salaryMax = customMaxSalary ? parseInt(customMaxSalary) : undefined;
    } else if (salaryRange) {
      const range = SALARY_RANGES.find(r => `${r.min}-${r.max}` === salaryRange);
      if (range) {
        salaryMin = range.min > 0 ? range.min : undefined;
        salaryMax = range.max < 999999 ? range.max : undefined;
      }
    }

    const criteria: SearchCriteria = {
      query: query.trim(),
      location: location.trim() || undefined,
      preferredLocations: location.trim() ? [location.trim()] : undefined,
      sources: selectedSources.length > 0 ? selectedSources : undefined,
      jobTypes: selectedJobTypes.length > 0 ? selectedJobTypes : undefined,
      salary: salaryMin || salaryMax ? {
        min: salaryMin,
        max: salaryMax,
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

  const handleReset = () => {
    setQuery('');
    setLocation('');
    setSelectedSources(['linkedin', 'indeed']);
    setSelectedJobTypes([]);
    setKeywords('');
    setSalaryRange('');
    setCustomMinSalary('');
    setCustomMaxSalary('');
    setUseCustomSalary(false);
    setValidationErrors([]);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg shadow-lg p-6 space-y-6">
      {(error || validationErrors.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                {validationErrors.length > 0 ? 'Validation Errors' : 'Search Error'}
              </h3>
              <ul className="mt-1 text-sm text-red-700 space-y-1">
                {validationErrors.length > 0
                  ? validationErrors.map((err, i) => <li key={i}>{err}</li>)
                  : <li>{error}</li>
                }
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="relative">
          <label htmlFor="query" className="block text-sm font-semibold text-gray-300 mb-2">
            Job Title or Keywords <span className="text-red-500">*</span>
          </label>
          <input
            ref={queryInputRef}
            id="query"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowQuerySuggestions(true);
              setValidationErrors([]);
            }}
            onFocus={() => setShowQuerySuggestions(true)}
            onBlur={() => setTimeout(() => setShowQuerySuggestions(false), 200)}
            placeholder="e.g. Software Engineer, Product Manager"
            className="w-full px-4 py-3 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-800 disabled:cursor-not-allowed"
            required
            disabled={isLoading}
          />
          {showQuerySuggestions && filteredQuerySuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredQuerySuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setQuery(suggestion);
                    setShowQuerySuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm text-gray-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label htmlFor="location" className="block text-sm font-semibold text-gray-300 mb-2">
            Location
          </label>
          <input
            ref={locationInputRef}
            id="location"
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowLocationSuggestions(true);
            }}
            onFocus={() => setShowLocationSuggestions(true)}
            onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
            placeholder="e.g. San Francisco, Remote"
            className="w-full px-4 py-3 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-800 disabled:cursor-not-allowed"
            disabled={isLoading}
          />
          {showLocationSuggestions && filteredLocationSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredLocationSuggestions.map((loc, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setLocation(loc);
                    setShowLocationSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm text-gray-300 transition-colors"
                >
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Salary Range (USD/year)
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="preset-salary"
                checked={!useCustomSalary}
                onChange={() => setUseCustomSalary(false)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                disabled={isLoading}
              />
              <label htmlFor="preset-salary" className="text-sm text-gray-300">
                Preset ranges
              </label>
            </div>
            {!useCustomSalary && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pl-6">
                {SALARY_RANGES.map((range) => (
                  <button
                    key={range.label}
                    type="button"
                    onClick={() => setSalaryRange(`${range.min}-${range.max}`)}
                    disabled={isLoading}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      salaryRange === `${range.min}-${range.max}`
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-blue-500'
                    }`}
                  >
                    ${range.label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="custom-salary"
                checked={useCustomSalary}
                onChange={() => setUseCustomSalary(true)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                disabled={isLoading}
              />
              <label htmlFor="custom-salary" className="text-sm text-gray-300">
                Custom range
              </label>
            </div>
            {useCustomSalary && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <input
                    type="number"
                    value={customMinSalary}
                    onChange={(e) => setCustomMinSalary(e.target.value)}
                    placeholder="Min (e.g. 80000)"
                    className="w-full px-4 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-800"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={customMaxSalary}
                    onChange={(e) => setCustomMaxSalary(e.target.value)}
                    placeholder="Max (e.g. 150000)"
                    className="w-full px-4 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-800"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Job Sources <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['google_jobs', 'linkedin', 'indeed', 'company_scraper'] as JobSource[]).map(source => (
              <label
                key={source}
                className={`flex items-center justify-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedSources.includes(source)
                    ? 'border-blue-600 bg-blue-900/50'
                    : 'border-gray-600 hover:border-blue-400'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source)}
                  onChange={() => toggleSource(source)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium text-gray-300 capitalize">
                  {source === 'google_jobs' ? 'Google Jobs' : source === 'company_scraper' ? 'Company Sites' : source}
                </span>
              </label>
            ))}
          </div>
        </div>

        {selectedSources.includes('company_scraper') && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <CompanyJobScraper />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Job Type
          </label>
          <div className="flex flex-wrap gap-2">
            {(['full-time', 'part-time', 'contract', 'temporary', 'internship'] as JobType[]).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => toggleJobType(type)}
                disabled={isLoading}
                className={`px-4 py-2 text-sm rounded-full border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedJobTypes.includes(type)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-blue-500'
                }`}
              >
                {type.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="keywords" className="block text-sm font-semibold text-gray-300 mb-2">
            Additional Keywords
          </label>
          <input
            id="keywords"
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. React, TypeScript, Remote"
            className="w-full px-4 py-3 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-800 disabled:cursor-not-allowed"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-400">Separate multiple keywords with commas</p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Jobs
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className="px-6 py-3 border border-gray-600 rounded-lg font-semibold text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
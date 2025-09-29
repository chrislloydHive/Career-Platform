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
  { min: 120000, max: 150000, label: '120k-150k' },
  { min: 150000, max: 200000, label: '150k-200k' },
  { min: 200000, max: 300000, label: '200k-300k' },
  { min: 300000, max: 999999, label: '300k+' },
];

export function EnhancedSearchForm({
  onSearch,
  isLoading = false,
  error,
  onClearError,
  initialValues,
}: EnhancedSearchFormProps) {
  const [query, setQuery] = useState(initialValues?.query || '');
  const [location, setLocation] = useState(initialValues?.location || '');
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

  // Advanced filters
  const [experienceLevel, setExperienceLevel] = useState(initialValues?.experienceLevel || 'all');
  const [industry, setIndustry] = useState(initialValues?.industry || 'all');
  const [employmentType, setEmploymentType] = useState(initialValues?.employmentType || 'all');
  const [freshnessFilter, setFreshnessFilter] = useState(initialValues?.freshnessFilter || 'all');
  const [additionalKeywords, setAdditionalKeywords] = useState(initialValues?.additionalKeywords || '');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
      // Advanced filters
      experienceLevel: experienceLevel !== 'all' ? experienceLevel : undefined,
      industry: industry !== 'all' ? industry : undefined,
      employmentType: employmentType !== 'all' ? employmentType : undefined,
      freshnessFilter: freshnessFilter !== 'all' ? freshnessFilter : undefined,
      additionalKeywords: additionalKeywords.trim() || undefined,
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
    // Reset advanced filters
    setExperienceLevel('all');
    setIndustry('all');
    setEmploymentType('all');
    setFreshnessFilter('all');
    setAdditionalKeywords('');
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

        {/* Advanced Filters Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-300">
              Advanced Filters
            </label>
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              disabled={isLoading}
            >
              {showAdvancedFilters ? 'Hide' : 'Show'} Filters
              <svg
                className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
              {/* Experience Level */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as 'all' | 'entry' | 'mid' | 'senior' | 'executive')}
                  className="w-full px-3 py-2 text-sm bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-800"
                  disabled={isLoading}
                >
                  <option value="all">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-800"
                  disabled={isLoading}
                >
                  <option value="all">All Industries</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance & Banking</option>
                  <option value="Healthcare">Healthcare & Life Sciences</option>
                  <option value="Education">Education & Training</option>
                  <option value="Retail">Retail & E-commerce</option>
                  <option value="Manufacturing">Manufacturing & Industrial</option>
                  <option value="Consulting">Consulting & Professional Services</option>
                  <option value="Media">Media & Entertainment</option>
                  <option value="Real Estate">Real Estate & Construction</option>
                  <option value="Non-profit">Non-profit & Government</option>
                  <option value="Energy">Energy & Utilities</option>
                  <option value="Transportation">Transportation & Logistics</option>
                  <option value="Telecommunications">Telecommunications</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Aerospace">Aerospace & Defense</option>
                  <option value="Legal">Legal Services</option>
                  <option value="Marketing">Marketing & Advertising</option>
                  <option value="Food">Food & Beverage</option>
                  <option value="Travel">Travel & Hospitality</option>
                  <option value="Sports">Sports & Recreation</option>
                  <option value="Agriculture">Agriculture & Farming</option>
                  <option value="Mining">Mining & Natural Resources</option>
                  <option value="Pharmaceuticals">Pharmaceuticals & Biotech</option>
                  <option value="Fashion">Fashion & Apparel</option>
                  <option value="Gaming">Gaming & Entertainment Tech</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Environmental">Environmental & Sustainability</option>
                  <option value="Research">Research & Development</option>
                </select>
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as 'all' | 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship')}
                  className="w-full px-3 py-2 text-sm bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-800"
                  disabled={isLoading}
                >
                  <option value="all">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              {/* Job Freshness */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Posted Within</label>
                <select
                  value={freshnessFilter}
                  onChange={(e) => setFreshnessFilter(e.target.value as 'all' | 'today' | 'week' | 'month' | 'quarter')}
                  className="w-full px-3 py-2 text-sm bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-800"
                  disabled={isLoading}
                >
                  <option value="all">Any Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">Last 3 Months</option>
                </select>
              </div>

              {/* Additional Keywords */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-300 mb-1">Additional Keywords</label>
                <input
                  type="text"
                  value={additionalKeywords}
                  onChange={(e) => setAdditionalKeywords(e.target.value)}
                  placeholder="e.g. remote, python, startup"
                  className="w-full px-3 py-2 text-sm bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-800"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </div>

        {selectedSources.includes('company_scraper') && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <CompanyJobScraper onClose={() => toggleSource('company_scraper')} />
          </div>
        )}


      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Job Sources <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto border border-gray-600 rounded-lg p-2 bg-gray-800">
          {([
            'google_jobs',
            'linkedin',
            'indeed',
            'company_scraper',
            'glassdoor',
            'monster',
            'ziprecruiter',
            'careerbuilder',
            'dice',
            'stackoverflow',
            'angellist',
            'remoteok',
            'weworkremotely',
            'flexjobs',
            'upwork',
            'freelancer',
            'toptal',
            'hired',
            'vettery',
            'wellfound',
            'crunchbase',
            'builtin',
            'techstars',
            'ycombinator'
          ] as JobSource[]).map(source => {
            const sourceLabels: Record<string, string> = {
              google_jobs: 'Google Jobs',
              linkedin: 'LinkedIn',
              indeed: 'Indeed',
              company_scraper: 'Company Sites',
              glassdoor: 'Glassdoor',
              monster: 'Monster',
              ziprecruiter: 'ZipRecruiter',
              careerbuilder: 'CareerBuilder',
              dice: 'Dice',
              stackoverflow: 'Stack Overflow',
              angellist: 'AngelList',
              remoteok: 'Remote OK',
              weworkremotely: 'We Work Remotely',
              flexjobs: 'FlexJobs',
              upwork: 'Upwork',
              freelancer: 'Freelancer',
              toptal: 'Toptal',
              hired: 'Hired',
              vettery: 'Vettery',
              wellfound: 'Wellfound',
              crunchbase: 'Crunchbase',
              builtin: 'Built In',
              techstars: 'Techstars',
              ycombinator: 'Y Combinator'
            };

            return (
              <label
                key={source}
                className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-all hover:bg-gray-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source)}
                  onChange={() => toggleSource(source)}
                  className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="text-xs text-gray-300">
                  {sourceLabels[source] || source}
                </span>
              </label>
            );
          })}
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
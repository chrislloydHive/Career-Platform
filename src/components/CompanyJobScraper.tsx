'use client';

import { useState } from 'react';
import { COMPANY_CATEGORIES, POPULAR_COMPANIES } from '@/lib/company-lists';

interface CompanyJob {
  title: string;
  location: string;
  description: string;
  url: string;
  company?: string;
  postedDate?: string;
  department?: string;
  employmentType?: string;
}

interface CompanyJobScraperProps {
  onJobsFound?: (jobs: CompanyJob[]) => void;
}

export function CompanyJobScraper({ onJobsFound }: CompanyJobScraperProps) {
  const [mode, setMode] = useState<'single' | 'category' | 'multiple'>('single');
  const [companyUrl, setCompanyUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [jobs, setJobs] = useState<CompanyJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScraping(true);
    setError(null);
    setJobs([]);
    setProgress('');

    try {
      let urlsToScrape: Array<{ name: string; url: string }> = [];

      if (mode === 'single') {
        if (!companyUrl.trim()) {
          setError('Please enter a company careers URL');
          return;
        }
        urlsToScrape = [{ name: 'Company', url: companyUrl.trim() }];
      } else if (mode === 'category') {
        if (!selectedCategory) {
          setError('Please select a company category');
          return;
        }
        urlsToScrape = COMPANY_CATEGORIES[selectedCategory].companies;
      } else if (mode === 'multiple') {
        if (selectedCompanies.length === 0) {
          setError('Please select at least one company');
          return;
        }
        urlsToScrape = POPULAR_COMPANIES.filter(c =>
          selectedCompanies.includes(c.name)
        );
      }

      const keywordList = [
        ...(jobTitle.trim() ? [jobTitle.trim()] : []),
        ...(keywords.trim() ? keywords.split(',').map(k => k.trim()) : [])
      ];

      let allJobs: CompanyJob[] = [];

      for (let i = 0; i < urlsToScrape.length; i++) {
        const company = urlsToScrape[i];
        setProgress(`Scraping ${company.name} (${i + 1}/${urlsToScrape.length})...`);

        try {
          const response = await fetch('/api/scrape-company', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyUrl: company.url,
              keywords: keywordList,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const jobsWithCompany = (data.jobs || []).map((job: CompanyJob) => ({
              ...job,
              company: company.name,
            }));
            allJobs = [...allJobs, ...jobsWithCompany];
          }
        } catch (err) {
          console.error(`Failed to scrape ${company.name}:`, err);
        }
      }

      setJobs(allJobs);
      setProgress('');

      if (onJobsFound) {
        onJobsFound(allJobs);
      }

      if (allJobs.length === 0) {
        setError('No jobs found matching your criteria.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape companies');
    } finally {
      setIsScraping(false);
      setProgress('');
    }
  };

  const toggleCompany = (companyName: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyName)
        ? prev.filter(c => c !== companyName)
        : [...prev, companyName]
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          Scrape Company Career Pages
        </h3>
        <p className="text-sm text-gray-400">
          Search single companies, categories, or multiple companies at once
        </p>
      </div>

      <form onSubmit={handleScrape} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Search Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                mode === 'single'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Single URL
            </button>
            <button
              type="button"
              onClick={() => setMode('category')}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                mode === 'category'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Category
            </button>
            <button
              type="button"
              onClick={() => setMode('multiple')}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                mode === 'multiple'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Multiple
            </button>
          </div>
        </div>

        {mode === 'single' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company Careers URL
            </label>
            <input
              type="url"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              placeholder="https://boards.greenhouse.io/company"
              className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isScraping}
            />
          </div>
        )}

        {mode === 'category' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isScraping}
            >
              <option value="">Select a category...</option>
              {Object.entries(COMPANY_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.name} ({category.companies.length} companies)
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === 'multiple' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Companies
            </label>
            <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {POPULAR_COMPANIES.map((company) => (
                  <label key={company.name} className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company.name)}
                      onChange={() => toggleCompany(company.name)}
                      className="w-4 h-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500"
                      disabled={isScraping}
                    />
                    <span className="text-sm text-gray-300">{company.name}</span>
                  </label>
                ))}
              </div>
            </div>
            {selectedCompanies.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {selectedCompanies.length} companies selected
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Job Title (Optional)
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Software Engineer, Product Manager"
            className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isScraping}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Additional Keywords (Optional)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="senior, backend, remote (comma-separated)"
            className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isScraping}
          />
          <p className="text-xs text-gray-500 mt-1">Filter results by keywords in job title or description</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
        )}

        {progress && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-blue-200">{progress}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isScraping}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
        >
          {isScraping ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Scraping...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Scrape Jobs
            </>
          )}
        </button>
      </form>

      {jobs.length > 0 && (
        <div className="pt-4 border-t border-gray-700">
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-200">Successfully scraped {jobs.length} jobs</p>
                <p className="text-xs text-green-300 mt-1">
                  {mode === 'category' && selectedCategory &&
                    `From ${COMPANY_CATEGORIES[selectedCategory].name}`}
                  {mode === 'multiple' && `From ${selectedCompanies.length} companies`}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-300">Found Jobs:</h4>
            {jobs.map((job, idx) => (
              <div key={idx} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-1">
                  <h5 className="font-medium text-gray-100">{job.title}</h5>
                  {job.company && (
                    <span className="px-2 py-1 bg-blue-900/50 text-blue-400 rounded text-xs ml-2 flex-shrink-0">
                      {job.company}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </span>
                  {job.department && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {job.department}
                    </span>
                  )}
                  {job.employmentType && (
                    <span className="px-2 py-0.5 bg-purple-900/50 text-purple-400 rounded text-xs">
                      {job.employmentType}
                    </span>
                  )}
                </div>
                {job.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{job.description}</p>
                )}
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  View job
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
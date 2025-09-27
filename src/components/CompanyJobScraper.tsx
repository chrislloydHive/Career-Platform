'use client';

import { useState } from 'react';

interface CompanyJob {
  title: string;
  location: string;
  description: string;
  url: string;
  postedDate?: string;
  department?: string;
  employmentType?: string;
}

interface CompanyJobScraperProps {
  onJobsFound?: (jobs: CompanyJob[]) => void;
}

export function CompanyJobScraper({ onJobsFound }: CompanyJobScraperProps) {
  const [companyUrl, setCompanyUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [jobs, setJobs] = useState<CompanyJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyUrl.trim()) {
      setError('Please enter a company careers URL');
      return;
    }

    setIsScraping(true);
    setError(null);
    setJobs([]);
    setSource(null);

    try {
      const response = await fetch('/api/scrape-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyUrl: companyUrl.trim(),
          keywords: keywords.trim() ? keywords.split(',').map(k => k.trim()) : []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scrape jobs');
      }

      const data = await response.json();
      setJobs(data.jobs || []);
      setSource(data.source);

      if (onJobsFound) {
        onJobsFound(data.jobs || []);
      }

      if (data.jobs.length === 0) {
        setError('No jobs found. Try a different URL or remove keyword filters.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape company jobs');
    } finally {
      setIsScraping(false);
    }
  };

  const popularSites = [
    { name: 'Greenhouse', example: 'https://boards.greenhouse.io/company', pattern: 'greenhouse.io' },
    { name: 'Lever', example: 'https://jobs.lever.co/company', pattern: 'lever.co' },
    { name: 'Workday', example: 'Company careers page with Workday', pattern: 'myworkdayjobs.com' },
  ];

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
          Extract job listings directly from company career pages (Greenhouse, Lever, Workday, etc.)
        </p>
      </div>

      <form onSubmit={handleScrape} className="space-y-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Keywords (Optional)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="engineer, senior, backend (comma-separated)"
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

        <button
          type="submit"
          disabled={isScraping || !companyUrl.trim()}
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

      <div className="pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-3">Supported platforms:</p>
        <div className="grid grid-cols-1 gap-2">
          {popularSites.map((site, idx) => (
            <div key={idx} className="text-xs text-gray-500 flex items-center gap-2">
              <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-gray-400">{site.name}</span>
              <span className="text-gray-600">({site.pattern})</span>
            </div>
          ))}
        </div>
      </div>

      {source && jobs.length > 0 && (
        <div className="pt-4 border-t border-gray-700">
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-200">Successfully scraped {jobs.length} jobs</p>
                <p className="text-xs text-green-300 mt-1">Source: {source}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <h4 className="text-sm font-medium text-gray-300">Found Jobs:</h4>
          {jobs.map((job, idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h5 className="font-medium text-gray-100 mb-1">{job.title}</h5>
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
                  <span className="px-2 py-0.5 bg-blue-900/50 text-blue-400 rounded text-xs">
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
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import type { JobCategory } from '@/types/career';

interface CareerComparisonToolProps {
  initialCareers?: JobCategory[];
}

export function CareerComparisonTool({ initialCareers = [] }: CareerComparisonToolProps) {
  const [selectedCareers, setSelectedCareers] = useState<JobCategory[]>(
    initialCareers.slice(0, 3)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [allCareers, setAllCareers] = useState<JobCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserCareers() {
      try {
        const response = await fetch('/api/careers');
        if (response.ok) {
          const data = await response.json();
          setAllCareers(data.careers || []);
        }
      } catch (error) {
        console.error('Failed to load careers:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUserCareers();
  }, []);

  const searchResults = searchQuery.trim()
    ? allCareers.filter(career =>
        career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        career.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 10)
    : [];

  const addCareer = (career: JobCategory) => {
    if (selectedCareers.length < 3 && !selectedCareers.find(c => c.id === career.id)) {
      setSelectedCareers([...selectedCareers, career]);
      setSearchQuery('');
      setIsSearching(false);
    }
  };

  const removeCareer = (careerId: string) => {
    setSelectedCareers(selectedCareers.filter(c => c.id !== careerId));
  };

  const exportComparison = () => {
    const data = selectedCareers.map(career => ({
      title: career.title,
      category: career.category,
      medianSalary: career.salaryRanges[0]?.median || 0,
      growthRate: career.jobOutlook.growthRate,
      competition: career.jobOutlook.competitionLevel,
      requiredSkills: career.requiredSkills.filter(s => s.importance === 'required').length,
    }));

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'career-comparison.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading careers...</div>
          </div>
        </div>
      </div>
    );
  }

  if (allCareers.length === 0) {
    return (
      <div className="bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">Career Comparison Tool</h1>
            <p className="text-gray-400">
              Compare up to 3 careers side-by-side to make informed decisions
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <svg className="w-20 h-20 mx-auto mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-100 mb-3">No Careers Found</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              You don&apos;t have any careers saved yet. Research and save some careers first to use the comparison tool.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCareers.length === 0) {
    return (
      <div className="bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">Career Comparison Tool</h1>
            <p className="text-gray-400">
              Compare up to 3 careers side-by-side to make informed decisions
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <svg className="w-20 h-20 mx-auto mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-100 mb-3">Start Your Comparison</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Search and select careers you want to compare. You can add up to 3 careers from your saved list.
            </p>
            <button
              onClick={() => setIsSearching(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search Careers
            </button>
          </div>

          {isSearching && (
            <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for careers..."
                  autoFocus
                  className="w-full bg-gray-900 text-gray-100 border border-gray-600 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {searchResults.map(career => (
                    <button
                      key={career.id}
                      onClick={() => addCareer(career)}
                      className="w-full text-left bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors"
                    >
                      <p className="font-medium text-gray-100">{career.title}</p>
                      <p className="text-sm text-gray-400 mt-1">{career.category}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Career Comparison</h1>
          <p className="text-gray-400">
            Comparing {selectedCareers.length} career{selectedCareers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Selected Careers Pills */}
        <div className="mb-6 flex flex-wrap gap-3">
          {selectedCareers.map(career => (
            <div
              key={career.id}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              <span className="font-medium">{career.title}</span>
              <button
                onClick={() => removeCareer(career.id)}
                className="hover:bg-blue-700 rounded-full p-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {selectedCareers.length < 3 && (
            <button
              onClick={() => setIsSearching(!isSearching)}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
            >
              + Add Career
            </button>
          )}
        </div>

        {/* Search Box */}
        {isSearching && selectedCareers.length < 3 && (
          <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for another career..."
                autoFocus
                className="w-full bg-gray-900 text-gray-100 border border-gray-600 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2">
                {searchResults.map(career => (
                  <button
                    key={career.id}
                    onClick={() => addCareer(career)}
                    disabled={selectedCareers.some(c => c.id === career.id)}
                    className="w-full text-left bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <p className="font-medium text-gray-100">{career.title}</p>
                    <p className="text-sm text-gray-400">{career.category}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mb-6 flex justify-end gap-3">
          <button
            onClick={exportComparison}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            Export Comparison
          </button>
          <button
            onClick={() => setSelectedCareers([])}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            Clear All
          </button>
        </div>

        {/* Comparison Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 sticky left-0 bg-gray-900 z-10">
                    Category
                  </th>
                  {selectedCareers.map(career => (
                    <th key={career.id} className="px-6 py-4 text-left text-sm font-semibold text-gray-100 min-w-[250px]">
                      {career.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {/* Basic Info */}
                <tr className="bg-gray-850">
                  <td className="px-6 py-4 text-sm font-medium text-gray-300 sticky left-0 bg-gray-850 z-10">
                    Industry
                  </td>
                  {selectedCareers.map(career => (
                    <td key={career.id} className="px-6 py-4 text-sm text-gray-200 capitalize">
                      {career.category}
                    </td>
                  ))}
                </tr>

                {/* Salary */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-300 sticky left-0 bg-gray-800 z-10">
                    Median Salary
                  </td>
                  {selectedCareers.map(career => {
                    const median = career.salaryRanges[0]?.median || 0;
                    const max = Math.max(...selectedCareers.map(c => c.salaryRanges[0]?.median || 0));
                    const isHighest = median === max;

                    return (
                      <td key={career.id} className="px-6 py-4 text-sm">
                        <span className={`font-semibold ${isHighest ? 'text-green-400' : 'text-gray-200'}`}>
                          ${median.toLocaleString()}
                        </span>
                        {isHighest && (
                          <span className="ml-2 px-2 py-0.5 bg-green-900/50 text-green-400 rounded text-xs">
                            Highest
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Salary Range */}
                <tr className="bg-gray-850">
                  <td className="px-6 py-4 text-sm font-medium text-gray-300 sticky left-0 bg-gray-850 z-10">
                    Salary Range
                  </td>
                  {selectedCareers.map(career => {
                    const range = career.salaryRanges[0];
                    return (
                      <td key={career.id} className="px-6 py-4 text-sm text-gray-200">
                        {range ? `$${range.min.toLocaleString()} - $${range.max.toLocaleString()}` : 'N/A'}
                      </td>
                    );
                  })}
                </tr>

                {/* Growth Rate */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-300 sticky left-0 bg-gray-800 z-10">
                    Job Growth
                  </td>
                  {selectedCareers.map(career => (
                    <td key={career.id} className="px-6 py-4 text-sm">
                      <span className="text-green-400 font-semibold">
                        {career.jobOutlook.growthRate}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Competition */}
                <tr className="bg-gray-850">
                  <td className="px-6 py-4 text-sm font-medium text-gray-300 sticky left-0 bg-gray-850 z-10">
                    Competition
                  </td>
                  {selectedCareers.map(career => (
                    <td key={career.id} className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        career.jobOutlook.competitionLevel === 'low'
                          ? 'bg-green-900/50 text-green-400'
                          : career.jobOutlook.competitionLevel === 'medium'
                          ? 'bg-yellow-900/50 text-yellow-400'
                          : 'bg-red-900/50 text-red-400'
                      }`}>
                        {career.jobOutlook.competitionLevel}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Required Skills Count */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-300 sticky left-0 bg-gray-800 z-10">
                    Required Skills
                  </td>
                  {selectedCareers.map(career => (
                    <td key={career.id} className="px-6 py-4 text-sm text-gray-200">
                      {career.requiredSkills.filter(s => s.importance === 'required').length} skills
                    </td>
                  ))}
                </tr>

                {/* Work Environment */}
                <tr className="bg-gray-850">
                  <td className="px-6 py-4 text-sm font-medium text-gray-300 sticky left-0 bg-gray-850 z-10">
                    Work Options
                  </td>
                  {selectedCareers.map(career => (
                    <td key={career.id} className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {career.workEnvironment.remote && (
                          <span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-xs">Remote</span>
                        )}
                        {career.workEnvironment.hybrid && (
                          <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded text-xs">Hybrid</span>
                        )}
                        {career.workEnvironment.onsite && (
                          <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">On-site</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Typical Hours */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-300 sticky left-0 bg-gray-800 z-10">
                    Typical Hours
                  </td>
                  {selectedCareers.map(career => (
                    <td key={career.id} className="px-6 py-4 text-sm text-gray-200">
                      {career.workEnvironment.typicalHours}
                    </td>
                  ))}
                </tr>

                {/* Travel Required */}
                <tr className="bg-gray-850">
                  <td className="px-6 py-4 text-sm font-medium text-gray-300 sticky left-0 bg-gray-850 z-10">
                    Travel Required
                  </td>
                  {selectedCareers.map(career => (
                    <td key={career.id} className="px-6 py-4 text-sm text-gray-200">
                      {career.workEnvironment.travelRequired ? 'Yes' : 'No'}
                    </td>
                  ))}
                </tr>

                {/* Education */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-300 sticky left-0 bg-gray-800 z-10">
                    Min. Education
                  </td>
                  {selectedCareers.map(career => (
                    <td key={career.id} className="px-6 py-4 text-sm text-gray-200">
                      {career.education.minimumDegree || 'Not specified'}
                    </td>
                  ))}
                </tr>

                {/* Certifications */}
                <tr className="bg-gray-850">
                  <td className="px-6 py-4 text-sm font-medium text-gray-300 sticky left-0 bg-gray-850 z-10">
                    Certifications
                  </td>
                  {selectedCareers.map(career => (
                    <td key={career.id} className="px-6 py-4 text-sm text-gray-200">
                      {career.education.certifications.length > 0
                        ? career.education.certifications.length + ' available'
                        : 'None required'}
                    </td>
                  ))}
                </tr>

                {/* Career Progression Levels */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-300 sticky left-0 bg-gray-800 z-10">
                    Career Levels
                  </td>
                  {selectedCareers.map(career => (
                    <td key={career.id} className="px-6 py-4 text-sm text-gray-200">
                      {career.careerProgression.length} progression levels
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Differences Highlight */}
        <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Key Differences</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Highest Salary */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">Highest Salary</p>
              {(() => {
                const highest = selectedCareers.reduce((prev, current) =>
                  ((current.salaryRanges[0]?.median || 0) > (prev.salaryRanges[0]?.median || 0)) ? current : prev
                );
                return (
                  <p className="text-lg font-semibold text-green-400">{highest.title}</p>
                );
              })()}
            </div>

            {/* Best Growth */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">Best Job Growth</p>
              {(() => {
                const bestGrowth = selectedCareers.reduce((prev, current) => {
                  const prevRate = parseInt(prev.jobOutlook.growthRate.match(/(\d+)%/)?.[1] || '0');
                  const currRate = parseInt(current.jobOutlook.growthRate.match(/(\d+)%/)?.[1] || '0');
                  return currRate > prevRate ? current : prev;
                });
                return (
                  <p className="text-lg font-semibold text-green-400">{bestGrowth.title}</p>
                );
              })()}
            </div>

            {/* Least Competition */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">Least Competition</p>
              {(() => {
                const leastCompetitive = selectedCareers.reduce((prev, current) => {
                  const levels = { low: 0, medium: 1, high: 2 };
                  return levels[current.jobOutlook.competitionLevel] < levels[prev.jobOutlook.competitionLevel]
                    ? current : prev;
                });
                return (
                  <p className="text-lg font-semibold text-green-400">{leastCompetitive.title}</p>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
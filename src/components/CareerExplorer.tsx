'use client';

import { useState, useMemo } from 'react';
import type { JobCategory, CareerCategory, ExperienceLevel } from '@/types/career';
import { careerResearchService } from '@/lib/career-research/career-service';

interface CareerExplorerProps {
  onCareerSelect?: (career: JobCategory) => void;
}

export function CareerExplorer({ onCareerSelect }: CareerExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<CareerCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [salaryRange, setSalaryRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 500000,
  });
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | 'all'>('all');

  const categories = careerResearchService.getAllCategories();

  const filteredCareers = useMemo(() => {
    let careers: JobCategory[] = [];

    if (selectedCategory === 'all') {
      careers = categories.flatMap(cat => careerResearchService.findByCategory(cat));
    } else {
      careers = careerResearchService.findByCategory(selectedCategory);
    }

    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      careers = careers.filter(career =>
        career.title.toLowerCase().includes(searchLower) ||
        career.description.toLowerCase().includes(searchLower) ||
        career.keywords.some(k => k.toLowerCase().includes(searchLower)) ||
        career.alternativeTitles.some(t => t.toLowerCase().includes(searchLower))
      );
    }

    if (experienceLevel !== 'all') {
      careers = careers.filter(career =>
        career.salaryRanges.some(range => range.experienceLevel === experienceLevel)
      );
    }

    careers = careers.filter(career => {
      const salariesInRange = career.salaryRanges.filter(
        range => range.median >= salaryRange.min && range.median <= salaryRange.max
      );
      return salariesInRange.length > 0;
    });

    return careers;
  }, [selectedCategory, searchQuery, salaryRange, experienceLevel, categories]);

  const getCategoryIcon = () => {
    return null;
  };

  const getCategoryLabel = (category: CareerCategory | 'all') => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Career Explorer</h1>
          <p className="text-gray-400">
            Discover career paths that match your interests and goals
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-300 mb-3">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All Careers
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
                Search Careers
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Job title or keywords..."
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
            </div>

            {/* Experience Level */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-2">
                Experience Level
              </label>
              <select
                id="experience"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel | 'all')}
                className="w-full bg-gray-900 text-gray-100 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Salary Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={salaryRange.min}
                  onChange={(e) => setSalaryRange({ ...salaryRange, min: Number(e.target.value) })}
                  placeholder="Min"
                  className="w-1/2 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={salaryRange.max}
                  onChange={(e) => setSalaryRange({ ...salaryRange, max: Number(e.target.value) })}
                  placeholder="Max"
                  className="w-1/2 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(searchQuery || experienceLevel !== 'all' || selectedCategory !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-400">Active filters:</span>
                {selectedCategory !== 'all' && (
                  <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                    {getCategoryLabel(selectedCategory)}
                  </span>
                )}
                {experienceLevel !== 'all' && (
                  <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                    {experienceLevel} level
                  </span>
                )}
                {searchQuery && (
                  <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                    &quot;{searchQuery}&quot;
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setExperienceLevel('all');
                    setSelectedCategory('all');
                    setSalaryRange({ min: 0, max: 500000 });
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-400">
            Found <span className="text-gray-100 font-semibold">{filteredCareers.length}</span> career
            {filteredCareers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Career Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map((career) => {
            const medianSalary = career.salaryRanges[0]?.median || 0;
            const growthRate = career.jobOutlook.growthRate;

            return (
              <div
                key={career.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all cursor-pointer group"
                onClick={() => onCareerSelect?.(career)}
              >
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs font-medium">
                    {getCategoryLabel(career.category)}
                  </span>
                  {career.workEnvironment.remote && (
                    <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded text-xs">
                      Remote
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-100 mb-2 group-hover:text-blue-400 transition-colors">
                  {career.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                  {career.description}
                </p>

                {/* Key Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-300">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ${medianSalary.toLocaleString()} median
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {growthRate} growth
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {career.requiredSkills.filter(s => s.importance === 'required').length} required skills
                  </div>
                </div>

                {/* Competition Badge */}
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Competition</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      career.jobOutlook.competitionLevel === 'low'
                        ? 'bg-green-900/50 text-green-400'
                        : career.jobOutlook.competitionLevel === 'medium'
                        ? 'bg-yellow-900/50 text-yellow-400'
                        : 'bg-red-900/50 text-red-400'
                    }`}>
                      {career.jobOutlook.competitionLevel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCareers.length === 0 && (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No careers found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setExperienceLevel('all');
                setSelectedCategory('all');
                setSalaryRange({ min: 0, max: 500000 });
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
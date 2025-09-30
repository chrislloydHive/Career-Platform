'use client';

import { useState, useMemo, useEffect } from 'react';
import type { JobCategory, CareerCategory, ExperienceLevel } from '@/types/career';
import type { SavedItem } from '@/types/saved-items';

interface CareerRecommendation {
  jobTitle: string;
  category: string;
  matchScore: number;
  reasons: Array<{
    factor: string;
    explanation: string;
    confidence: number;
  }>;
  newInsight?: string;
}

interface RecommendationMetadata {
  exploredCount: number;
  searchCount: number;
  chatCount?: number;
  questionnaireCompletion: number;
}

interface CareerExplorerProps {
  onCareerSelect?: (career: JobCategory) => void;
  onTriggerAIResearch?: (searchQuery: string) => void;
  onToggleComparison?: () => void;
  filterCategory?: CareerCategory | 'all';
}

// Uncommon but accessible careers
const UNCOMMON_CAREERS = [
  { title: 'UX Research Assistant', description: 'Test products and talk to users—no design degree needed', degreeRequired: false },
  { title: 'Customer Success Associate', description: 'Help customers succeed (basically problem-solving + people skills)', degreeRequired: false },
  { title: 'Social Media Coordinator', description: 'If you already spend hours online, get paid for it', degreeRequired: false },
  { title: 'Operations Coordinator', description: 'Keep things running smoothly behind the scenes', degreeRequired: false },
  { title: 'Content Creator', description: 'Write, film, or design—companies need content constantly', degreeRequired: false },
  { title: 'Sales Development Representative', description: 'Reach out to potential customers (great for extroverts)', degreeRequired: false },
  { title: 'Junior Data Analyst', description: 'Excel wizardry can be learned—companies will train you', degreeRequired: false },
  { title: 'Technical Writer', description: 'Explain complicated stuff in simple terms', degreeRequired: false },
];

// High demand careers
const HIGH_DEMAND_CAREERS = [
  { title: 'Customer Success Associate', description: 'Companies are desperate for people who can keep customers happy', openings: '15,000+ open roles' },
  { title: 'Sales Development Representative', description: 'Every company needs people reaching out to potential customers', openings: '20,000+ open roles' },
  { title: 'Account Executive', description: 'SaaS companies hiring like crazy for quota-carrying sales roles', openings: '12,000+ open roles' },
  { title: 'Marketing Coordinator', description: 'Brands need help with campaigns, social, and content constantly', openings: '18,000+ open roles' },
  { title: 'Operations Associate', description: 'Someone has to keep the business running smoothly', openings: '10,000+ open roles' },
  { title: 'Executive Assistant', description: 'Execs always need organized people to manage their chaos', openings: '14,000+ open roles' },
  { title: 'HR Coordinator', description: 'Growing companies need help with recruiting and people ops', openings: '8,000+ open roles' },
  { title: 'Data Analyst', description: 'Every team wants someone who can make sense of their data', openings: '16,000+ open roles' },
];

// No experience required careers
const NO_EXPERIENCE_CAREERS = [
  { title: 'Customer Service Representative', description: 'They train you—just need patience and good communication', training: 'Full training provided' },
  { title: 'Sales Development Representative', description: 'Learn on the job, usually with a mentor and scripts', training: '2-4 week bootcamp' },
  { title: 'Administrative Assistant', description: 'Organization and basic computer skills get you in the door', training: 'On-the-job training' },
  { title: 'Social Media Coordinator', description: 'If you already use social media daily, you qualify', training: 'Learn as you go' },
  { title: 'Recruiting Coordinator', description: 'They need people skills more than recruiting experience', training: '1-2 week onboarding' },
  { title: 'Junior Copywriter', description: 'Writing samples matter more than a marketing degree', training: 'Editor will guide you' },
  { title: 'Content Moderator', description: 'Review user content—just need attention to detail', training: 'Policy training included' },
  { title: 'Operations Coordinator', description: 'Organized? Good at spreadsheets? You\'re hired', training: 'Process training provided' },
];

// Emerging careers that didn't exist 5 years ago
const EMERGING_CAREERS = [
  { title: 'AI Prompt Engineer', description: 'Write prompts that make AI tools work better—coding optional', yearEmerged: '2023' },
  { title: 'Creator Economy Manager', description: 'Help influencers and creators turn followers into income', yearEmerged: '2021' },
  { title: 'Sustainability Coordinator', description: 'Make companies greener (finally getting real budgets)', yearEmerged: '2020' },
  { title: 'NFT Community Manager', description: 'Build online communities around digital assets', yearEmerged: '2021' },
  { title: 'Remote Work Coordinator', description: 'Keep distributed teams connected and productive', yearEmerged: '2020' },
  { title: 'TikTok Marketing Specialist', description: 'Create viral content strategies for brands', yearEmerged: '2020' },
  { title: 'Podcast Producer', description: 'Edit, produce, and grow audio content shows', yearEmerged: '2019' },
  { title: 'Diversity & Inclusion Coordinator', description: 'Help companies build more inclusive workplaces', yearEmerged: '2020' },
];

export function CareerExplorer({ onCareerSelect, onTriggerAIResearch, onToggleComparison, filterCategory }: CareerExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<CareerCategory | 'all'>(filterCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKeywords, setFilterKeywords] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | 'all'>('all');
  const [userCareers, setUserCareers] = useState<JobCategory[]>([]);
  const [isLoadingUserCareers, setIsLoadingUserCareers] = useState(true);
  const [savedCareerIds, setSavedCareerIds] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendationMetadata, setRecommendationMetadata] = useState<RecommendationMetadata | null>(null);
  const [showUncommonCareers, setShowUncommonCareers] = useState(false);
  const [showHighDemand, setShowHighDemand] = useState(false);
  const [showNoExperience, setShowNoExperience] = useState(false);
  const [showEmergingCareers, setShowEmergingCareers] = useState(false);

  useEffect(() => {
    async function loadUserCareers() {
      try {
        const response = await fetch('/api/careers');
        if (response.ok) {
          const data = await response.json();
          setUserCareers(data.careers || []);
        }
      } catch (error) {
        console.error('Failed to load user careers:', error);
      } finally {
        setIsLoadingUserCareers(false);
      }
    }
    loadUserCareers();
  }, []);

  useEffect(() => {
    if (filterCategory) {
      setSelectedCategory(filterCategory);
    }
  }, [filterCategory]);

  useEffect(() => {
    async function loadSavedCareers() {
      try {
        const response = await fetch('/api/saved-items');
        if (response.ok) {
          const data = await response.json();
          const careerIds = data.items
            .filter((item: SavedItem) => item.type === 'career')
            .map((item: SavedItem) => item.type === 'career' ? item.career.id : '');
          setSavedCareerIds(careerIds);
        }
      } catch (error) {
        console.error('Failed to load saved careers:', error);
      }
    }
    loadSavedCareers();
  }, []);

  useEffect(() => {
    const shouldShowRecommendations = userCareers.length >= 2 && !isLoadingUserCareers;
    if (shouldShowRecommendations && recommendations.length === 0) {
      loadRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCareers.length, isLoadingUserCareers]);

  const loadRecommendations = async () => {
    try {
      setIsLoadingRecommendations(true);
      const response = await fetch('/api/recommendations');
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setRecommendationMetadata(data.metadata);
        setShowRecommendations(data.recommendations.length > 0);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleSaveCareer = async (career: JobCategory) => {
    const isSaved = savedCareerIds.includes(career.id);

    if (isSaved) {
      try {
        await fetch(`/api/saved-items?id=career-${career.id}`, {
          method: 'DELETE',
        });
        setSavedCareerIds(prev => prev.filter(id => id !== career.id));
      } catch (error) {
        console.error('Failed to remove career:', error);
      }
    } else {
      try {
        await fetch('/api/saved-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'career', item: career }),
        });
        setSavedCareerIds(prev => [...prev, career.id]);
      } catch (error) {
        console.error('Failed to save career:', error);
      }
    }
  };

  const handleDeleteCareer = async (career: JobCategory) => {
    if (!confirm(`Are you sure you want to delete "${career.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/careers/${career.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUserCareers(prev => prev.filter(c => c.id !== career.id));
        setSavedCareerIds(prev => prev.filter(id => id !== career.id));
      } else {
        console.error('Failed to delete career');
        alert('Failed to delete career. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete career:', error);
      alert('Failed to delete career. Please try again.');
    }
  };

  const categories: CareerCategory[] = useMemo(() => {
    const uniqueCategories = new Set<CareerCategory>();
    userCareers.forEach(career => {
      if (career.category) {
        uniqueCategories.add(career.category as CareerCategory);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [userCareers]);

  const { filteredCareers, hasExactMatch } = useMemo(() => {
    let careers: JobCategory[] = userCareers;

    if (selectedCategory !== 'all') {
      careers = careers.filter(c => c.category === selectedCategory);
    }

    let exactMatch = false;

    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase().trim();
      const searchWords = searchLower.split(/\s+/);

      const isFuzzyMatch = (title: string) => {
        const titleLower = title.toLowerCase();
        const titleWords = titleLower.split(/\s+/);

        if (searchWords.length !== titleWords.length) return false;

        return searchWords.every((searchWord, idx) => {
          const titleWord = titleWords[idx];
          const minLen = Math.min(searchWord.length, titleWord.length);
          const commonPrefix = Math.floor(minLen * 0.7);

          return searchWord.substring(0, commonPrefix) === titleWord.substring(0, commonPrefix);
        });
      };

      exactMatch = careers.some(career => {
        if (career.title.toLowerCase() === searchLower) return true;
        if (isFuzzyMatch(career.title)) return true;
        return career.alternativeTitles?.some(t =>
          t.toLowerCase() === searchLower || isFuzzyMatch(t)
        ) ?? false;
      });

      careers = careers.filter(career =>
        career.title.toLowerCase().includes(searchLower) ||
        career.description?.toLowerCase().includes(searchLower) ||
        (career.keywords?.some(k => k.toLowerCase().includes(searchLower)) ?? false) ||
        (career.alternativeTitles?.some(t => t.toLowerCase().includes(searchLower)) ?? false)
      );
    }

    return { filteredCareers: careers, hasExactMatch: exactMatch };
  }, [selectedCategory, searchQuery, userCareers]);


  const getCategoryLabel = (category: CareerCategory | 'all') => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Jobs You Can Actually Get Container */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">Jobs You Can Actually Get</h1>
            <p className="text-gray-400">
              Entry-level roles, weird job titles you&apos;ve never heard of, and where to find them
            </p>
          </div>

          {/* Uncommon Careers - Collapsible */}
          <div className="mb-6">
          <button
            onClick={() => setShowUncommonCareers(!showUncommonCareers)}
            className="w-full bg-gradient-to-r from-purple-900/30 to-pink-900/30 hover:from-purple-900/40 hover:to-pink-900/40 rounded-xl border border-purple-600/40 p-4 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-100">Wait, That's a Real Job?</h3>
                <p className="text-sm text-gray-400">Careers you probably didn't know existed (no degree required)</p>
              </div>
            </div>
            <svg
              className={`w-6 h-6 text-purple-400 transition-transform ${showUncommonCareers ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showUncommonCareers && (
            <div className="mt-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-600/30 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {UNCOMMON_CAREERS.slice(0, 4).map((career, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-colors">
                    <h3 className="text-sm font-bold text-gray-100 mb-2">{career.title}</h3>
                    <p className="text-xs text-gray-400 mb-3">{career.description}</p>
                    <button
                      onClick={() => {
                        setSearchQuery(career.title);
                        setShowSuggestions(false);
                        document.getElementById('find-your-role')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                    >
                      Learn more →
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    // Set a category filter or search term that shows all uncommon careers
                    setSearchQuery('');
                    setSelectedCategory('all');
                    document.getElementById('find-your-role')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  See All {UNCOMMON_CAREERS.length} Jobs →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* High Demand Careers - Collapsible */}
        <div className="mb-6">
          <button
            onClick={() => setShowHighDemand(!showHighDemand)}
            className="w-full bg-gradient-to-r from-orange-900/30 to-red-900/30 hover:from-orange-900/40 hover:to-red-900/40 rounded-xl border border-orange-600/40 p-4 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-100">High Demand Right Now</h3>
                <p className="text-sm text-gray-400">Tons of openings—these companies are actively hiring</p>
              </div>
            </div>
            <svg
              className={`w-6 h-6 text-orange-400 transition-transform ${showHighDemand ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showHighDemand && (
            <div className="mt-4 bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-xl border border-orange-600/30 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {HIGH_DEMAND_CAREERS.slice(0, 4).map((career, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-orange-500/50 transition-colors">
                    <h3 className="text-sm font-bold text-gray-100 mb-2">{career.title}</h3>
                    <p className="text-xs text-gray-400 mb-2">{career.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-orange-600/30 text-orange-300 rounded text-xs font-medium">{career.openings}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery(career.title);
                        setShowSuggestions(false);
                        document.getElementById('find-your-role')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-xs text-orange-400 hover:text-orange-300 font-medium"
                    >
                      Learn more →
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    document.getElementById('find-your-role')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  See All {HIGH_DEMAND_CAREERS.length} Jobs →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* No Experience Required - Collapsible */}
        <div className="mb-6">
          <button
            onClick={() => setShowNoExperience(!showNoExperience)}
            className="w-full bg-gradient-to-r from-blue-900/30 to-cyan-900/30 hover:from-blue-900/40 hover:to-cyan-900/40 rounded-xl border border-blue-600/40 p-4 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-100">No Experience? No Problem.</h3>
                <p className="text-sm text-gray-400">They'll train you—just bring your willingness to learn</p>
              </div>
            </div>
            <svg
              className={`w-6 h-6 text-blue-400 transition-transform ${showNoExperience ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showNoExperience && (
            <div className="mt-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-600/30 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {NO_EXPERIENCE_CAREERS.slice(0, 4).map((career, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition-colors">
                    <h3 className="text-sm font-bold text-gray-100 mb-2">{career.title}</h3>
                    <p className="text-xs text-gray-400 mb-2">{career.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded text-xs font-medium">{career.training}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery(career.title);
                        setShowSuggestions(false);
                        document.getElementById('find-your-role')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Learn more →
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    document.getElementById('find-your-role')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  See All {NO_EXPERIENCE_CAREERS.length} Jobs →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Emerging Careers - Collapsible */}
        <div className="mb-6">
          <button
            onClick={() => setShowEmergingCareers(!showEmergingCareers)}
            className="w-full bg-gradient-to-r from-green-900/30 to-emerald-900/30 hover:from-green-900/40 hover:to-emerald-900/40 rounded-xl border border-green-600/40 p-4 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-100">Jobs That Didn't Exist 5 Years Ago</h3>
                <p className="text-sm text-gray-400">Brand new careers emerging from tech and culture shifts</p>
              </div>
            </div>
            <svg
              className={`w-6 h-6 text-green-400 transition-transform ${showEmergingCareers ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showEmergingCareers && (
            <div className="mt-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-600/30 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {EMERGING_CAREERS.slice(0, 4).map((career, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-green-500/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-bold text-gray-100">{career.title}</h3>
                      <span className="px-2 py-0.5 bg-green-600/30 text-green-300 rounded text-xs">New {career.yearEmerged}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{career.description}</p>
                    <button
                      onClick={() => {
                        setSearchQuery(career.title);
                        setShowSuggestions(false);
                        document.getElementById('find-your-role')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-xs text-green-400 hover:text-green-300 font-medium"
                    >
                      Learn more →
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    document.getElementById('find-your-role')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  See All {EMERGING_CAREERS.length} Jobs →
                </button>
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Find Your Next Role Container */}
        <div id="find-your-role" className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-100 mb-2">Find Your Next Role</h1>
              <p className="text-gray-400">
                Search and filter through our database of entry-level careers
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/careers/compare"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Compare Paths
              </a>
              {onToggleComparison && (
                <button
                  onClick={onToggleComparison}
                  className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Quick Compare
                </button>
              )}
            </div>
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(e.target.value.length > 2);
                  }}
                  onFocus={() => setShowSuggestions(searchQuery.length > 2)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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

                {/* Suggestions Dropdown */}
                {showSuggestions && searchQuery.length > 2 && filteredCareers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCareers.slice(0, 5).map((career) => (
                      <button
                        key={career.id}
                        onClick={() => {
                          setSearchQuery(career.title);
                          setShowSuggestions(false);
                          onCareerSelect?.(career);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                      >
                        <div className="font-medium text-gray-100">{career.title}</div>
                        <div className="text-sm text-gray-400 truncate">{career.description}</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Match - Show AI Research Option */}
                {showSuggestions && searchQuery.length > 2 && filteredCareers.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
                    <button
                      onClick={() => {
                        setShowSuggestions(false);
                        const query = filterKeywords ? `${searchQuery} (${filterKeywords})` : searchQuery;
                        onTriggerAIResearch?.(query);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <div>
                          <div className="font-medium text-gray-100">No matches found</div>
                          <div className="text-sm text-blue-400">
                            Research &quot;{searchQuery}&quot; with AI
                            {filterKeywords && <span className="text-gray-400"> • Filters: {filterKeywords}</span>}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Keywords */}
            <div>
              <label htmlFor="filter-keywords" className="block text-sm font-medium text-gray-300 mb-2">
                Filters
              </label>
              <input
                id="filter-keywords"
                type="text"
                value={filterKeywords}
                onChange={(e) => setFilterKeywords(e.target.value)}
                placeholder="e.g., remote, creative, analytical..."
                className="w-full bg-gray-900 text-gray-100 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
          </div>

          {/* Active Filters Summary */}
          {(searchQuery || experienceLevel !== 'all' || selectedCategory !== 'all' || filterKeywords) && (
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
                {filterKeywords && (
                  <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                    Filters: {filterKeywords}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterKeywords('');
                    setExperienceLevel('all');
                    setSelectedCategory('all');
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

        {/* No Exact Match - AI Research Suggestion */}
        {searchQuery.trim() && !hasExactMatch && (
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  No exact match for &quot;{searchQuery}&quot;
                </h3>
                <p className="text-gray-300 mb-4">
                  {filteredCareers.length > 0
                    ? `We found ${filteredCareers.length} similar career${filteredCareers.length !== 1 ? 's' : ''}, but not an exact match for "${searchQuery}".`
                    : `We couldn't find any careers matching "${searchQuery}".`
                  } Would you like to use AI to research this specific career title?
                  {filterKeywords && <span className="block mt-1 text-sm text-blue-300">Filters: {filterKeywords}</span>}
                </p>
                <button
                  onClick={() => {
                    const query = filterKeywords ? `${searchQuery} (${filterKeywords})` : searchQuery;
                    onTriggerAIResearch?.(query);
                  }}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Research &quot;{searchQuery}&quot; with AI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendations Panel */}
        {showRecommendations && recommendations.length > 0 && (
          <div className="mb-8 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-blue-900/30 rounded-xl border-2 border-blue-500/40 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-100 mb-1">
                    Recommended for You
                  </h3>
                  <p className="text-sm text-gray-400">
                    Based on {recommendationMetadata?.exploredCount || 0} careers explored, {recommendationMetadata?.searchCount || 0} searches, and {recommendationMetadata?.questionnaireCompletion || 0}% self-discovery completion
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadRecommendations}
                  disabled={isLoadingRecommendations}
                  className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  title="Refresh recommendations"
                >
                  <svg className={`w-4 h-4 ${isLoadingRecommendations ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button
                  onClick={() => setShowRecommendations(false)}
                  className="p-2 text-gray-400 hover:text-gray-300 rounded-lg transition-colors"
                  title="Hide recommendations"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="bg-gray-800/60 rounded-lg p-5 border border-blue-500/30 hover:border-blue-500/50 transition-all">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-100">{rec.jobTitle}</h4>
                        <span className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-xs font-semibold">
                          {rec.matchScore}% Match
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mb-3">
                        {getCategoryLabel(rec.category as CareerCategory)}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const query = rec.jobTitle;
                        onTriggerAIResearch?.(query);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Explore
                    </button>
                  </div>

                  <div className="space-y-2 mb-3">
                    {rec.reasons.map((reason: { factor: string; explanation: string }, rIdx: number) => (
                      <div key={rIdx} className="flex items-start gap-2 text-sm">
                        <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <span className="font-semibold text-blue-300">{reason.factor}:</span>
                          <span className="text-gray-300 ml-1">{reason.explanation}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {rec.newInsight && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <p className="text-sm text-gray-300 italic">
                          <span className="font-semibold text-yellow-400">New Insight:</span> {rec.newInsight}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show Recommendations Button (if hidden) */}
        {!showRecommendations && recommendations.length > 0 && !isLoadingUserCareers && (
          <button
            onClick={() => setShowRecommendations(true)}
            className="w-full mb-6 p-4 bg-blue-900/20 hover:bg-blue-900/30 border-2 border-blue-500/40 hover:border-blue-500/60 rounded-lg transition-all flex items-center justify-center gap-2 text-blue-300 hover:text-blue-200 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            View {recommendations.length} AI-Recommended Career{recommendations.length !== 1 ? 's' : ''} for You
          </button>
        )}

        {/* Career Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map((career) => {
            const relevantSalary = experienceLevel !== 'all'
              ? career.salaryRanges?.find(range => range.experienceLevel === experienceLevel)
              : career.salaryRanges?.[0];
            const salaryRange = relevantSalary
              ? `$${relevantSalary.min.toLocaleString()} - $${relevantSalary.max.toLocaleString()}`
              : null;
            const growthRate = career.jobOutlook?.growthRate || 'N/A';

            return (
              <div
                key={career.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all group relative"
              >
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveCareer(career);
                    }}
                    className={`p-2 rounded-lg transition-all ${
                      savedCareerIds.includes(career.id)
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                    title={savedCareerIds.includes(career.id) ? 'Remove from saved' : 'Save career'}
                  >
                    <svg className="w-5 h-5" fill={savedCareerIds.includes(career.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCareer(career);
                    }}
                    className="p-2 rounded-lg transition-all bg-gray-700 text-gray-400 hover:bg-red-600 hover:text-white"
                    title="Delete career"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="cursor-pointer" onClick={() => onCareerSelect?.(career)}>
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-3 pr-24">
                    <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs font-medium">
                      {getCategoryLabel(career.category)}
                    </span>
                    {career.workEnvironment?.remote && (
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
                  {salaryRange && (
                    <div className="flex items-center text-sm text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {salaryRange}
                      {experienceLevel !== 'all' && <span className="ml-1 text-gray-500">({experienceLevel})</span>}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-300">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {growthRate} growth
                  </div>
                  {career.requiredSkills && career.requiredSkills.length > 0 && (
                    <div className="flex items-center text-sm text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {career.requiredSkills.filter(s => s.importance === 'required').length} required skills
                    </div>
                  )}
                </div>

                {/* Competition Badge */}
                {career.jobOutlook?.competitionLevel && (
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
                )}
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
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
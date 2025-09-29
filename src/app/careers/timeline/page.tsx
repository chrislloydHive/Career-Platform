'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { EnhancedCareerTimeline } from '@/components/EnhancedCareerTimeline';
import { UserSkillProfile } from '@/types/job-market-data';

export default function CareerTimelinePage() {
  const [selectedCareer, setSelectedCareer] = useState('Data Analyst');
  const [selectedLocation, setSelectedLocation] = useState('San Francisco, CA');
  const [userProfile, setUserProfile] = useState<UserSkillProfile>({
    skills: [
      { name: 'Python', level: 'intermediate', yearsOfExperience: 2, lastUsed: new Date(), certifications: [] },
      { name: 'SQL', level: 'advanced', yearsOfExperience: 3, lastUsed: new Date(), certifications: [] },
      { name: 'Excel', level: 'expert', yearsOfExperience: 5, lastUsed: new Date(), certifications: [] }
    ],
    totalExperience: 3,
    location: 'San Francisco, CA',
    preferredRemoteWork: true,
    salaryExpectations: {
      min: 90000,
      max: 130000
    }
  });

  const careerOptions = [
    'Data Analyst',
    'Data Scientist',
    'Product Manager',
    'UX Designer',
    'Software Engineer',
    'Marketing Manager',
    'Business Analyst',
    'Project Manager'
  ];

  const locationOptions = [
    'San Francisco, CA',
    'New York, NY',
    'Seattle, WA',
    'Austin, TX',
    'Chicago, IL',
    'Boston, MA',
    'Los Angeles, CA',
    'Denver, CO',
    'Remote'
  ];

  const handleSkillLevelChange = (skillName: string, newLevel: string) => {
    setUserProfile(prev => ({
      ...prev,
      skills: prev.skills.map(skill =>
        skill.name === skillName
          ? { ...skill, level: newLevel as 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert' }
          : skill
      )
    }));
  };

  const addSkill = () => {
    const newSkill = prompt('Enter skill name:');
    if (newSkill) {
      setUserProfile(prev => ({
        ...prev,
        skills: [...prev.skills, {
          name: newSkill,
          level: 'beginner',
          yearsOfExperience: 0,
          lastUsed: new Date(),
          certifications: []
        }]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title="Market-Grounded Career Timeline"
        subtitle="Real-time job market data integrated with career progression"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/careers"
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Explorer
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-4">
            Real-Time Career Progression Timeline
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Get a realistic view of your career path with live job market data, hiring trends,
            skill gaps analysis, and salary insights for each stage of your progression.
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Customize Your Timeline</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Career Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Career Path
              </label>
              <select
                value={selectedCareer}
                onChange={(e) => setSelectedCareer(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {careerOptions.map(career => (
                  <option key={career} value={career}>{career}</option>
                ))}
              </select>
            </div>

            {/* Location Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Market Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {locationOptions.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Experience Level */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Total Experience
            </label>
            <div className="flex gap-4">
              <input
                type="range"
                min="0"
                max="15"
                value={userProfile.totalExperience}
                onChange={(e) => setUserProfile(prev => ({
                  ...prev,
                  totalExperience: parseInt(e.target.value)
                }))}
                className="flex-1"
              />
              <span className="text-gray-100 min-w-20">{userProfile.totalExperience} years</span>
            </div>
          </div>

          {/* Skills Profile */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Your Skills (affects gap analysis)
              </label>
              <button
                onClick={addSkill}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                Add Skill
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProfile.skills.map((skill, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-3">
                  <div className="font-medium text-gray-200 mb-2">{skill.name}</div>
                  <select
                    value={skill.level}
                    onChange={(e) => handleSkillLevelChange(skill.name, e.target.value)}
                    className="w-full bg-gray-600 border border-gray-500 text-gray-100 rounded px-2 py-1 text-sm"
                  >
                    <option value="none">None</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-Time Market Notice */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-blue-300 font-medium">Live Market Data</span>
          </div>
          <p className="text-blue-200 text-sm">
            This timeline uses real-time job market data including current open positions,
            hiring companies, salary trends, and skill requirements. Data refreshes hourly.
          </p>
        </div>

        {/* Enhanced Timeline */}
        <EnhancedCareerTimeline
          careerPath={selectedCareer}
          userLocation={selectedLocation}
          userProfile={userProfile}
        />

        {/* Information Panel */}
        <div className="mt-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Understanding the Market Data</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-200 mb-2">What We Track</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• <strong>Open Positions:</strong> Current job postings from major job boards</li>
                <li>• <strong>Hiring Companies:</strong> Companies actively recruiting for each role</li>
                <li>• <strong>Experience Requirements:</strong> Actual years of experience from job postings</li>
                <li>• <strong>Skill Gaps:</strong> Comparison between your skills and market requirements</li>
                <li>• <strong>Salary Data:</strong> Current compensation ranges and trends</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-200 mb-2">How to Use This Data</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Focus on high-priority skill gaps for maximum impact</li>
                <li>• Target companies with &apos;high&apos; or &apos;urgent&apos; hiring needs</li>
                <li>• Consider market timing - some stages may have better opportunities</li>
                <li>• Use salary data to negotiate compensation packages</li>
                <li>• Plan your career moves based on market viability scores</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <h3 className="text-yellow-400 font-medium mb-2">Market Reality Check</h3>
            <p className="text-yellow-200 text-sm">
              This timeline shows both aspirational career progression and current market realities.
              Pay attention to viability scores and market competition levels to set realistic expectations
              and timelines for your career advancement.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
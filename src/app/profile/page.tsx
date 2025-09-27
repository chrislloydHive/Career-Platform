'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { UserProfile } from '@/types/user-profile';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'insights'>('overview');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation title="Your Profile" subtitle="Manage your career profile and preferences" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation title="Your Profile" subtitle="Manage your career profile and preferences" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
            <p className="text-gray-400">Failed to load profile</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation title="Your Profile" subtitle="AI learns about you with every interaction" />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="hidden sm:inline">Interaction </span>History
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'insights'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="hidden sm:inline">AI </span>Insights ({profile.aiInsights.length})
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-100">{profile.name}</h2>
                  <p className="text-gray-400">{profile.location}</p>
                  {profile.linkedInUrl && (
                    <a
                      href={profile.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn Profile
                    </a>
                  )}
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Education</h3>
              <div className="space-y-4">
                {profile.education.map((edu, idx) => (
                  <div key={idx} className="border-l-2 border-blue-500 pl-4">
                    <div className="font-medium text-gray-100">
                      {edu.degree} {edu.major && `in ${edu.major}`} {edu.minor && `(${edu.minor})`}
                    </div>
                    <div className="text-sm text-gray-400">{edu.institution} • {edu.graduationYear}</div>
                    {edu.honors && edu.honors.length > 0 && (
                      <div className="text-sm text-blue-400 mt-1">{edu.honors.join(', ')}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Professional Experience</h3>
              <div className="space-y-6">
                {profile.experience.map((exp, idx) => (
                  <div key={idx} className="border-l-2 border-green-500 pl-4">
                    <div className="font-medium text-gray-100">{exp.title}</div>
                    <div className="text-sm text-gray-400">{exp.company} • {exp.startDate} - {exp.endDate || 'Present'}</div>
                    <ul className="mt-2 space-y-1">
                      {exp.description.map((desc, i) => (
                        <li key={i} className="text-sm text-gray-300">• {desc}</li>
                      ))}
                    </ul>
                    {exp.skills && exp.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {exp.skills.map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Core Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Strengths</h3>
                <ul className="space-y-2">
                  {profile.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-900/50 text-purple-400 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Values</h3>
                <ul className="space-y-2">
                  {profile.values.map((value, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">★</span>
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Career Goals</h3>
              <ul className="space-y-2">
                {profile.careerGoals.map((goal, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-1">→</span>
                    {goal}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Preferred Industries</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredIndustries.map((industry, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-sm">
                      {industry}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Preferred Locations</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredLocations.map((location, idx) => (
                    <span key={idx} className="px-3 py-1 bg-orange-900/50 text-orange-400 rounded-full text-sm">
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Recent Interactions</h3>
            <div className="space-y-4">
              {profile.interactionHistory.slice(-50).reverse().map((interaction, idx) => (
                <div key={idx} className="border-l-2 border-gray-600 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-100 text-sm">{interaction.action}</div>
                      <div className="text-sm text-gray-400 mt-1">{interaction.context}</div>
                      {interaction.aiLearning && (
                        <div className="text-sm text-blue-400 mt-2 bg-blue-900/20 rounded p-2">
                          💡 AI Learning: {interaction.aiLearning}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {new Date(interaction.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {profile.interactionHistory.length === 0 && (
                <p className="text-gray-500 text-center py-8">No interactions yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">AI Insights</h3>
            <div className="space-y-4">
              {profile.aiInsights.slice().reverse().map((insight, idx) => (
                <div key={idx} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs text-gray-500">
                      {new Date(insight.timestamp).toLocaleDateString()} • {insight.source}
                    </div>
                    <div className="text-xs font-medium text-blue-400">
                      {Math.round(insight.confidence * 100)}% confidence
                    </div>
                  </div>
                  <p className="text-gray-200">{insight.insight}</p>
                </div>
              ))}
              {profile.aiInsights.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No AI insights yet. Keep using the platform and AI will learn about your preferences!
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { UserProfile, CareerPreferences } from '@/types/user-profile';
import { CareerPreferencesEditor } from '@/components/CareerPreferencesEditor';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'overview' | 'preferences' | 'history' | 'insights'>('overview');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

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

  async function handleSavePreferences(preferences: CareerPreferences) {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerPreferences: preferences }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
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
            onClick={() => setActiveTab('preferences')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'preferences'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Preferences
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
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Upload
          </button>
        </div>

        {activeTab === 'upload' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Intro Section */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-600/30 p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                Upload your resume, share your LinkedIn, and add any other documents (certifications, portfolios, transcripts, etc.).
                The more we know about you, the better our AI can understand your skills, experience, and career potential.
              </p>
              <p className="text-sm text-gray-400">
                Once you upload your information, our AI will analyze everything and build a comprehensive profile that gets smarter with every interaction.
              </p>
            </div>

            {/* Resume Upload */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-100">Resume</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Upload your resume (PDF or DOCX). This is the foundation of your profile.
              </p>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  id="resume-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadStatus(`Selected: ${file.name}`);
                    }
                  }}
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-300 font-medium mb-2">Click to upload your resume</p>
                  <p className="text-sm text-gray-500">PDF or DOCX up to 10MB</p>
                </label>
              </div>
              {uploadStatus && (
                <p className="text-sm text-blue-400 mt-3">{uploadStatus}</p>
              )}
            </div>

            {/* LinkedIn URL */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <h3 className="text-lg font-semibold text-gray-100">LinkedIn Profile</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Share your LinkedIn profile URL so we can see your full professional history and network.
              </p>
              <input
                type="url"
                placeholder="https://www.linkedin.com/in/yourprofile"
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Additional Documents */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-100">Additional Documents</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Upload certifications, portfolios, transcripts, or any other documents that showcase your skills and achievements.
              </p>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  className="hidden"
                  id="documents-upload"
                />
                <label htmlFor="documents-upload" className="cursor-pointer">
                  <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-300 font-medium mb-2">Click to upload documents</p>
                  <p className="text-sm text-gray-500">PDFs, images, Word docs up to 10MB each</p>
                </label>
              </div>
            </div>

            {/* Additional Info Text Area */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-100">Tell Us More</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Add any additional context about yourself, your career interests, side projects, or anything else you want us to know.
              </p>
              <textarea
                rows={6}
                placeholder="I'm currently interested in... I've been working on... I'm good at... I want to explore careers in..."
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Analyze Button */}
            <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl border border-green-600/30 p-6">
              <button
                disabled={uploading}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  'Let AI Analyze My Profile'
                )}
              </button>
              <p className="text-sm text-gray-400 text-center mt-3">
                Our AI will review everything you uploaded and build a comprehensive profile in seconds
              </p>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Intro Section */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-600/30 p-6">
              <p className="text-gray-300 leading-relaxed">
                This is your current profile based on everything we know about you - your uploaded documents, assessment responses, and all your interactions with MyNextRole. This profile continuously evolves as you use the platform, getting more accurate with every conversation and choice you make.
              </p>
            </div>

            {/* Saved Assessments */}
            {profile.assessmentResults && profile.assessmentResults.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Saved Assessments</h3>
                <div className="space-y-3">
                  {profile.assessmentResults.map((assessment: any) => (
                    <div key={assessment.id} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-100">{assessment.title}</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(assessment.saved_at).toLocaleDateString()}
                        </span>
                      </div>
                      {assessment.description && (
                        <p className="text-sm text-gray-400 mb-2">{assessment.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500">{assessment.completion_percentage}% complete</div>
                        <a
                          href={`/assessments/${assessment.id}`}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          View Results →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-100">{profile.name}</h2>
                  <p className="text-sm sm:text-base text-gray-400">{profile.location}</p>
                  {profile.linkedInUrl && (
                    <a
                      href={profile.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn Profile
                    </a>
                  )}
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{profile.bio}</p>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Education</h3>
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

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Professional Experience</h3>
              <div className="space-y-4 sm:space-y-6">
                {profile.experience.map((exp, idx) => (
                  <div key={idx} className="border-l-2 border-green-500 pl-3 sm:pl-4">
                    <div className="text-sm sm:text-base font-medium text-gray-100">{exp.title}</div>
                    <div className="text-xs sm:text-sm text-gray-400">{exp.company} • {exp.startDate} - {exp.endDate || 'Present'}</div>
                    <ul className="mt-2 space-y-1">
                      {exp.description.map((desc, i) => (
                        <li key={i} className="text-xs sm:text-sm text-gray-300">• {desc}</li>
                      ))}
                    </ul>
                    {exp.skills && exp.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Core Skills</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {profile.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 sm:px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full text-xs sm:text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Strengths</h3>
                <ul className="space-y-2">
                  {profile.strengths.map((strength, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Interests</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {profile.interests.map((interest, idx) => (
                    <span key={idx} className="px-2 sm:px-3 py-1 bg-purple-900/50 text-purple-400 rounded-full text-xs sm:text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Values</h3>
                <ul className="space-y-2">
                  {profile.values.map((value, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">★</span>
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Career Goals</h3>
              <ul className="space-y-2">
                {profile.careerGoals.map((goal, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-1">→</span>
                    {goal}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Preferred Industries</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {profile.preferredIndustries.map((industry, idx) => (
                    <span key={idx} className="px-2 sm:px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-xs sm:text-sm">
                      {industry}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Preferred Locations</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {profile.preferredLocations.map((location, idx) => (
                    <span key={idx} className="px-2 sm:px-3 py-1 bg-orange-900/50 text-orange-400 rounded-full text-xs sm:text-sm">
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Intro Section */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-600/30 p-6">
              <p className="text-gray-300 leading-relaxed">
                Tell us what you're looking for in your next role. These preferences help our AI match you with the right opportunities and provide more relevant recommendations. You can update these anytime as your priorities change.
              </p>
            </div>
            <CareerPreferencesEditor
              preferences={profile.careerPreferences}
              onSave={handleSavePreferences}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Intro Section */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-600/30 p-6">
              <p className="text-gray-300 leading-relaxed">
                Every action you take on MyNextRole helps our AI understand you better. This is your complete interaction history - assessments you've taken, jobs you've viewed, conversations you've had. We use this to continuously refine your profile and recommendations.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Recent Interactions</h3>
            <div className="space-y-3 sm:space-y-4">
              {profile.interactionHistory.slice(-50).reverse().map((interaction, idx) => (
                <div key={idx} className="border-l-2 border-gray-600 pl-3 sm:pl-4 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-100 text-xs sm:text-sm">{interaction.action}</div>
                      <div className="text-xs sm:text-sm text-gray-400 mt-1">{interaction.context}</div>
                      {interaction.aiLearning && (
                        <div className="text-xs sm:text-sm text-blue-400 mt-2 bg-blue-900/20 rounded p-2">
                          AI Learning: {interaction.aiLearning}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex-shrink-0">
                      {new Date(interaction.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {profile.interactionHistory.length === 0 && (
                <p className="text-xs sm:text-sm text-gray-500 text-center py-8">No interactions yet</p>
              )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Intro Section */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-600/30 p-6">
              <p className="text-gray-300 leading-relaxed">
                These are the key insights our AI has learned about you - your strengths, interests, work style preferences, and career patterns. Each insight includes a confidence level showing how certain we are based on the data you've shared. These insights power your job recommendations and help us give you better advice.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">AI Insights</h3>
            <div className="space-y-3 sm:space-y-4">
              {profile.aiInsights.slice().reverse().map((insight, idx) => (
                <div key={idx} className="bg-gray-900 border border-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
                    <div className="text-xs text-gray-500">
                      {new Date(insight.timestamp).toLocaleDateString()} • {insight.source}
                    </div>
                    <div className="text-xs font-medium text-blue-400">
                      {Math.round(insight.confidence * 100)}% confidence
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-200">{insight.insight}</p>
                </div>
              ))}
              {profile.aiInsights.length === 0 && (
                <p className="text-xs sm:text-sm text-gray-500 text-center py-8">
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
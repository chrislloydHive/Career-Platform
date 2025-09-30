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
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [insightMessage, setInsightMessage] = useState<string>('');

  // Share tab form state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [linkedInUrl, setLinkedInUrl] = useState<string>('');
  const [additionalDocs, setAdditionalDocs] = useState<File[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState<string>('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const response = await fetch('/api/profile');
      if (response.status === 401) {
        // Redirect to login if not authenticated
        window.location.href = '/api/auth/signin?callbackUrl=/profile';
        return;
      }
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
      // Save preferences
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerPreferences: preferences }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);

        // Show insight generation message
        setGeneratingInsights(true);
        setInsightMessage('Generating personalized insights from your preferences...');

        // Trigger insight generation
        fetch('/api/profile/generate-insights', {
          method: 'POST',
        }).then(async (insightRes) => {
          if (insightRes.ok) {
            const insightData = await insightRes.json();
            setInsightMessage(`✓ Generated ${insightData.count} new insights! Check the AI Insights tab.`);
            // Reload profile to get new insights
            await loadProfile();
            // Auto-switch to insights tab after a moment
            setTimeout(() => {
              setActiveTab('insights');
              setInsightMessage('');
              setGeneratingInsights(false);
            }, 2000);
          } else {
            setInsightMessage('Failed to generate insights. Your preferences were saved.');
            setTimeout(() => {
              setInsightMessage('');
              setGeneratingInsights(false);
            }, 3000);
          }
        }).catch(err => {
          console.error('Failed to generate insights:', err);
          setInsightMessage('Failed to generate insights. Your preferences were saved.');
          setTimeout(() => {
            setInsightMessage('');
            setGeneratingInsights(false);
          }, 3000);
        });
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    }
  }

  async function handleAnalyzeProfile() {
    if (!resumeFile && !linkedInUrl && !additionalInfo) {
      setUploadStatus('Please provide at least your resume, LinkedIn URL, or some information about yourself');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading files...');

    try {
      // Upload files to Vercel Blob
      const formData = new FormData();
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }
      additionalDocs.forEach((doc, index) => {
        formData.append(`doc_${index}`, doc);
      });
      formData.append('linkedInUrl', linkedInUrl);
      formData.append('additionalInfo', additionalInfo);

      const uploadResponse = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload files');
      }

      const uploadData = await uploadResponse.json();
      setUploadStatus('Analyzing with AI...');

      // Trigger AI analysis
      const analyzeResponse = await fetch('/api/profile/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentUrls: uploadData.documentUrls,
          linkedInUrl,
          additionalInfo,
        }),
      });

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze profile');
      }

      const analyzeData = await analyzeResponse.json();
      setUploadStatus('Profile updated successfully!');

      // Reload profile to show updated data
      await loadProfile();

      // Switch to overview tab
      setActiveTab('overview');

      // Clear form only on success
      setResumeFile(null);
      setLinkedInUrl('');
      setAdditionalDocs([]);
      setAdditionalInfo('');

    } catch (error: any) {
      console.error('Failed to analyze profile:', error);
      const errorMessage = error.message || 'Failed to analyze profile. Please try again.';
      setUploadStatus(`Error: ${errorMessage}`);
      // Don't clear the form on error so user can try again
    } finally {
      setUploading(false);
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

      {/* Insight Generation Toast */}
      {insightMessage && (
        <div className="fixed top-20 right-4 z-50 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg border border-blue-500 max-w-md animate-slide-in">
          <div className="flex items-center gap-3">
            {generatingInsights && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            )}
            <p className="text-sm font-medium">{insightMessage}</p>
          </div>
        </div>
      )}

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
            Insights
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
            onClick={() => setActiveTab('upload')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Share
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
                      setResumeFile(file);
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
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
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
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setAdditionalDocs(files);
                    if (files.length > 0) {
                      setUploadStatus(`Selected ${files.length} document(s)`);
                    }
                  }}
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
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Analyze Button */}
            <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl border border-green-600/30 p-6">
              <button
                onClick={handleAnalyzeProfile}
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
                  'Analyze My Profile'
                )}
              </button>
              <p className="text-sm text-gray-400 text-center mt-3">
                Our AI will review everything you shared and build a comprehensive profile in seconds
              </p>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Intro Section */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-600/30 p-6">
              <p className="text-gray-300 leading-relaxed">
                Based on everything we know about you, here's what our AI sees and recommends. These insights update as you use the platform, take assessments, and refine your preferences.
              </p>
            </div>

            {/* Profile Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Your Profile Summary */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6 lg:col-span-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3">Who You Are</h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-4">{profile.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.slice(0, 5).map((skill, idx) => (
                    <span key={idx} className="px-2 sm:px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                  {profile.skills.length > 5 && (
                    <span className="px-2 sm:px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-xs">
                      +{profile.skills.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Career Pattern Analysis */}
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-600/30 p-4 sm:p-6">
                <div className="flex items-start gap-3 mb-3">
                  <svg className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-2">Your Unique Combination</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {profile.skills.length > 0 && profile.interests.length > 0 ? (
                        <>Your background in <span className="text-blue-400 font-medium">{profile.skills[0]}</span> combined with your interest in <span className="text-purple-400 font-medium">{profile.interests[0]}</span> opens up opportunities in roles that blend technical skills with creative thinking.</>
                      ) : (
                        <>Upload your resume or share more about yourself to see personalized insights about your unique skill combinations.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* What to Develop Next */}
              {profile.strengths && profile.strengths.length > 0 && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-2">Your Edge</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        These strengths set you apart and will help you stand out in your target roles:
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {profile.strengths.slice(0, 4).map((strength, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-green-400 mt-0.5">✓</span>
                            <span>{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Where People Like You Succeed */}
              {profile.careerGoals && profile.careerGoals.length > 0 && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6 lg:col-span-2">
                  <div className="flex items-start gap-3 mb-4">
                    <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-2">Career Path Recommendations</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Based on your goals and background, here are paths that align with what you're looking for:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {profile.careerGoals.slice(0, 3).map((goal, idx) => (
                          <div key={idx} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <span className="text-green-400 mt-1">→</span>
                              <span className="text-sm text-gray-300">{goal}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI-Generated Insights */}
            {profile.aiInsights.length === 0 ? (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
                <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">No AI insights yet</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Add your preferences, upload your resume, or take the assessment to start generating personalized insights and recommendations.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Add Preferences
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
                  >
                    Upload Resume
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Group insights by type */}
                {(() => {
                  const groupedInsights = profile.aiInsights.reduce((acc, insight) => {
                    let insightData;
                    try {
                      insightData = typeof insight.insight === 'string' ? JSON.parse(insight.insight) : insight.insight;
                    } catch {
                      insightData = { content: insight.insight, type: 'recommendation' };
                    }
                    const type = insightData.type || 'recommendation';
                    if (!acc[type]) acc[type] = [];
                    acc[type].push({ ...insight, parsed: insightData });
                    return acc;
                  }, {} as Record<string, any[]>);

                  const typeConfig = {
                    opportunity: {
                      title: 'Opportunities',
                      description: 'Career paths and roles well-suited to your profile',
                      color: 'border-green-600/30 bg-green-900/20',
                      headerColor: 'text-green-400',
                    },
                    strength: {
                      title: 'Strengths',
                      description: 'What makes you stand out',
                      color: 'border-blue-600/30 bg-blue-900/20',
                      headerColor: 'text-blue-400',
                    },
                    recommendation: {
                      title: 'Recommendations',
                      description: 'Actions to take to reach your goals',
                      color: 'border-purple-600/30 bg-purple-900/20',
                      headerColor: 'text-purple-400',
                    },
                    caution: {
                      title: 'Considerations',
                      description: 'Things to be aware of as you plan your path',
                      color: 'border-yellow-600/30 bg-yellow-900/20',
                      headerColor: 'text-yellow-400',
                    },
                  };

                  const typeOrder = ['opportunity', 'strength', 'recommendation', 'caution'];

                  return typeOrder.map(type => {
                    if (!groupedInsights[type] || groupedInsights[type].length === 0) return null;
                    const config = typeConfig[type as keyof typeof typeConfig];

                    return (
                      <div key={type} className="space-y-3">
                        <div>
                          <h3 className={`text-base sm:text-lg font-semibold ${config.headerColor} mb-1`}>
                            {config.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">{config.description}</p>
                        </div>
                        <div className="space-y-3">
                          {groupedInsights[type].slice().reverse().map((insight: any, idx: number) => (
                            <div key={idx} className={`rounded-lg border p-4 ${config.color}`}>
                              <div className="flex-1">
                                {insight.parsed.title && (
                                  <h4 className="font-semibold text-gray-100 mb-2 text-sm sm:text-base">{insight.parsed.title}</h4>
                                )}
                                <p className="text-sm text-gray-300 leading-relaxed mb-3">{insight.parsed.content}</p>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                  <span>{new Date(insight.timestamp).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span className="capitalize">{insight.source.replace('_', ' ')}</span>
                                  {insight.confidence && (
                                    <>
                                      <span>•</span>
                                      <span className="text-blue-400 font-medium">
                                        {Math.round(insight.confidence * 100)}% confidence
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </>
            )}

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-blue-900/30 to-green-900/30 rounded-lg border border-blue-600/30 p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-2">Recommended Next Steps</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">1.</span>
                      <span>Complete the <a href="/explore" className="text-blue-400 hover:text-blue-300 underline">career assessment</a> to refine your profile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">2.</span>
                      <span>Explore <a href="/careers" className="text-blue-400 hover:text-blue-300 underline">career paths</a> that match your profile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">3.</span>
                      <span>Update your <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('preferences'); }} className="text-blue-400 hover:text-blue-300 underline">preferences</a> to see more targeted recommendations</span>
                    </li>
                  </ul>
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
                These are personalized insights our AI has generated based on your profile, preferences, and interactions. These insights help identify opportunities, highlight your unique strengths, and guide your career exploration.
              </p>
            </div>

            {profile.aiInsights.length === 0 ? (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
                <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-gray-400 mb-4">No AI insights yet</p>
                <p className="text-sm text-gray-500 mb-6">
                  Add your preferences, upload your resume, or take the assessment to start generating personalized insights.
                </p>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Add Preferences
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {profile.aiInsights.slice().reverse().map((insight, idx) => {
                  // Parse insight if it's JSON
                  let insightData;
                  try {
                    insightData = typeof insight.insight === 'string' ? JSON.parse(insight.insight) : insight.insight;
                  } catch {
                    insightData = { content: insight.insight };
                  }

                  const typeColors = {
                    opportunity: 'border-green-600/30 bg-green-900/20',
                    strength: 'border-blue-600/30 bg-blue-900/20',
                    caution: 'border-yellow-600/30 bg-yellow-900/20',
                    recommendation: 'border-purple-600/30 bg-purple-900/20',
                  };

                  const typeIcons = {
                    opportunity: '🚀',
                    strength: '💪',
                    caution: '⚠️',
                    recommendation: '💡',
                  };

                  const typeColor = typeColors[insightData.type as keyof typeof typeColors] || 'border-gray-700 bg-gray-900';
                  const typeIcon = typeIcons[insightData.type as keyof typeof typeIcons] || '📊';

                  return (
                    <div key={idx} className={`rounded-lg border p-4 sm:p-5 ${typeColor}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{typeIcon}</span>
                        <div className="flex-1">
                          {insightData.title && (
                            <h4 className="font-semibold text-gray-100 mb-2">{insightData.title}</h4>
                          )}
                          <p className="text-sm text-gray-300 leading-relaxed mb-3">{insightData.content}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span>{new Date(insight.timestamp).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="capitalize">{insight.source.replace('_', ' ')}</span>
                            <span>•</span>
                            <span className="text-blue-400 font-medium">
                              {Math.round(insight.confidence * 100)}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
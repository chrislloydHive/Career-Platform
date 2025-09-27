'use client';

import { useState } from 'react';
import { JobCategory } from '@/types/career';

interface CareerResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCareer: (career: JobCategory) => void;
  initialJobTitle?: string;
}

export function CareerResearchModal({ isOpen, onClose, onSaveCareer, initialJobTitle = '' }: CareerResearchModalProps) {
  const [jobTitle, setJobTitle] = useState(initialJobTitle);
  const [searchResults, setSearchResults] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [generatedCareer, setGeneratedCareer] = useState<JobCategory | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResearch = async () => {
    if (!jobTitle.trim()) {
      setError('Please enter a job title');
      return;
    }

    setIsResearching(true);
    setError(null);

    try {
      const response = await fetch('/api/research-career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          searchResults: searchResults.trim(),
          additionalContext: 'Generate comprehensive career data based on current market conditions.'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to research career');
      }

      const data = await response.json();
      setGeneratedCareer(data.career);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to research career');
    } finally {
      setIsResearching(false);
    }
  };

  const handleSave = async () => {
    if (!generatedCareer) return;

    try {
      const response = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedCareer),
      });

      if (!response.ok) {
        throw new Error('Failed to save career');
      }

      onSaveCareer(generatedCareer);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save career');
    }
  };

  const handleClose = () => {
    setJobTitle(initialJobTitle);
    setSearchResults('');
    setGeneratedCareer(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  if (isOpen && jobTitle !== initialJobTitle) {
    setJobTitle(initialJobTitle);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-100">AI Career Research</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!generatedCareer ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Data Scientist, Physical Therapist, etc."
                  className="w-full px-4 py-3 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isResearching}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Research Information (Optional)
                </label>
                <textarea
                  value={searchResults}
                  onChange={(e) => setSearchResults(e.target.value)}
                  placeholder="Paste information you've found about this career (job descriptions, salary data, etc.)"
                  rows={8}
                  className="w-full px-4 py-3 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isResearching}
                />
                <p className="text-sm text-gray-400 mt-2">
                  AI will generate comprehensive career data even without additional information, but providing context helps create more accurate profiles.
                </p>
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

              <div className="flex gap-3">
                <button
                  onClick={handleResearch}
                  disabled={isResearching || !jobTitle.trim()}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isResearching ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Researching...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Generate Career Profile
                    </>
                  )}
                </button>
                <button
                  onClick={handleClose}
                  disabled={isResearching}
                  className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-100 mb-2">{generatedCareer.title}</h3>
                  <p className="text-sm text-blue-400 mb-4">{generatedCareer.category}</p>
                  <p className="text-gray-300">{generatedCareer.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                  <div>
                    <p className="text-sm text-gray-400">Salary Range (Entry)</p>
                    <p className="text-lg font-semibold text-gray-100">
                      ${generatedCareer.salaryRanges[0]?.min.toLocaleString()} - ${generatedCareer.salaryRanges[0]?.max.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Growth Rate</p>
                    <p className="text-lg font-semibold text-gray-100">{generatedCareer.jobOutlook.growthRate}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">Required Skills ({generatedCareer.requiredSkills.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {generatedCareer.requiredSkills.slice(0, 6).map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                        {skill.skill}
                      </span>
                    ))}
                    {generatedCareer.requiredSkills.length > 6 && (
                      <span className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-sm">
                        +{generatedCareer.requiredSkills.length - 6} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">Daily Tasks ({generatedCareer.dailyTasks.length})</p>
                  <ul className="space-y-2">
                    {generatedCareer.dailyTasks.slice(0, 5).map((task, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{task.task} ({task.timePercentage}%)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-200 font-medium">AI-Generated Profile</p>
                    <p className="text-sm text-blue-300 mt-1">
                      This profile was generated by AI. Review the information and save it to add it to your career database.
                    </p>
                  </div>
                </div>
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

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Career Profile
                </button>
                <button
                  onClick={() => setGeneratedCareer(null)}
                  className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Start Over
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
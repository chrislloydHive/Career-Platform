'use client';

import { useProfile } from '@/contexts/ProfileContext';
import { useState } from 'react';

export function ProfileSwitcher() {
  const { userId, userName, switchProfile, availableProfiles, clearProfileData } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSwitch = (newUserId: string) => {
    if (newUserId !== userId) {
      switchProfile(newUserId);
      setIsOpen(false);
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await clearProfileData();
      setShowClearConfirm(false);
      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('Failed to clear data. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="hidden sm:inline">{userName}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20">
            <div className="p-3 border-b border-gray-700">
              <p className="text-xs text-gray-400 font-medium uppercase">Switch Profile</p>
            </div>

            <div className="py-2">
              {availableProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleSwitch(profile.id)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors flex items-center justify-between ${
                    profile.id === userId ? 'bg-gray-700/50' : ''
                  }`}
                >
                  <span className="text-sm text-gray-200">{profile.name}</span>
                  {profile.id === userId && (
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="p-2 border-t border-gray-700">
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={isClearing}
                className="w-full px-3 py-2 text-left text-sm text-orange-400 hover:bg-gray-700 rounded transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear {userName}&apos;s Data
              </button>
            </div>
          </div>
        </>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">Clear All Data?</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    This will permanently delete all saved data for <span className="font-medium text-gray-200">{currentProfile.name}</span>, including:
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1 mb-4 ml-4">
                    <li>• Questionnaire responses</li>
                    <li>• Discovered insights</li>
                    <li>• Saved jobs and searches</li>
                    <li>• Career assessment results</li>
                  </ul>
                  <p className="text-sm text-orange-400 font-medium">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-gray-700/50 rounded-b-lg">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
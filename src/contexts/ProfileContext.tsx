'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProfileContextType {
  userId: string;
  userName: string;
  switchProfile: (userId: string) => void;
  availableProfiles: { id: string; name: string }[];
  clearProfileData: () => Promise<void>;
}

const AVAILABLE_PROFILES = [
  { id: 'louisa', name: 'Louisa Lloyd' },
  { id: 'test', name: 'Test User' }
];

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string>('louisa');
  const [userName, setUserName] = useState<string>('Louisa Lloyd');

  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
      const profile = AVAILABLE_PROFILES.find(p => p.id === savedUserId);
      if (profile) {
        setUserId(profile.id);
        setUserName(profile.name);
      }
    }
  }, []);

  const switchProfile = (newUserId: string) => {
    const profile = AVAILABLE_PROFILES.find(p => p.id === newUserId);
    if (profile) {
      setUserId(profile.id);
      setUserName(profile.name);
      localStorage.setItem('currentUserId', profile.id);
      window.location.reload();
    }
  };

  const clearProfileData = async () => {
    try {
      await fetch(`/api/user-data?userId=${userId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error clearing profile data:', error);
      throw error;
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        userId,
        userName,
        switchProfile,
        availableProfiles: AVAILABLE_PROFILES,
        clearProfileData
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
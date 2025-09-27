'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { CareerMatchingQuestionnaire } from '@/components/CareerMatchingQuestionnaire';
import { CareerMatchResults } from '@/components/CareerMatchResults';
import { UserProfile, CareerMatch } from '@/types/career-matching';

export default function CareerMatchPage() {
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);
  const [matches, setMatches] = useState<CareerMatch[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const handleQuestionnaireComplete = (careerMatches: CareerMatch[]) => {
    setMatches(careerMatches);
    setShowQuestionnaire(false);
  };

  const handleRetakeQuestionnaire = () => {
    setShowQuestionnaire(true);
    setMatches([]);
    setUserProfile(null);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title="Career Match"
        subtitle={showQuestionnaire
          ? 'Answer questions to find your perfect career match'
          : 'Your personalized career matches'}
        actions={
          !showQuestionnaire ? (
            <button
              onClick={handleRetakeQuestionnaire}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Retake
            </button>
          ) : null
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {showQuestionnaire ? (
          <CareerMatchingQuestionnaire
            onComplete={handleQuestionnaireComplete}
            enableRealTimeMatching={true}
          />
        ) : (
          <CareerMatchResults matches={matches} userProfile={userProfile || undefined} />
        )}
      </div>
    </div>
  );
}
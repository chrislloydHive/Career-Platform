'use client';

import { useState } from 'react';
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Career Matching System
          </h1>
          <p className="text-lg text-gray-600">
            {showQuestionnaire
              ? 'Answer questions about your interests, skills, and preferences to find your perfect career match'
              : 'Your personalized career matches based on your profile'}
          </p>
        </div>

        {showQuestionnaire ? (
          <CareerMatchingQuestionnaire
            onComplete={handleQuestionnaireComplete}
            enableRealTimeMatching={true}
          />
        ) : (
          <>
            <div className="mb-6 flex justify-end">
              <button
                onClick={handleRetakeQuestionnaire}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Retake Questionnaire
              </button>
            </div>
            <CareerMatchResults matches={matches} userProfile={userProfile || undefined} />
          </>
        )}
      </div>
    </div>
  );
}
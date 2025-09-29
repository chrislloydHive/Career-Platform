'use client';

import { useState, useEffect } from 'react';
import {
  CareerFitScore,
  LiveCareerUpdate,
  MatchFactor,
} from '@/lib/matching/realtime-career-matcher';

interface LiveCareerMatchesProps {
  topCareers: CareerFitScore[];
  risingCareers: CareerFitScore[];
  recentUpdate?: LiveCareerUpdate;
  onExploreCareer?: (careerTitle: string) => void;
}

export function LiveCareerMatches({
  topCareers,
  risingCareers,
  recentUpdate,
  onExploreCareer,
}: LiveCareerMatchesProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [displayedUpdate, setDisplayedUpdate] = useState<LiveCareerUpdate | null>(null);

  useEffect(() => {
    if (recentUpdate && recentUpdate.isSignificant) {
      setDisplayedUpdate(recentUpdate);
      setShowAnimation(true);

      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [recentUpdate]);

  const getTrendIcon = (trend: CareerFitScore['trend']) => {
    switch (trend) {
      case 'rising':
        return '↗';
      case 'falling':
        return '↘';
      case 'stable':
        return '→';
      case 'new':
        return 'NEW';
    }
  };

  const getStrengthColor = (strength: MatchFactor['strength']) => {
    switch (strength) {
      case 'strong':
        return 'text-green-400 bg-green-900/30';
      case 'moderate':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'weak':
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  return (
    <div className="space-y-6">
      {displayedUpdate && showAnimation && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-bold text-white text-lg mb-1">
                {displayedUpdate.change > 0 ? 'Career Match Updated!' : 'Match Updated'}
              </div>
              <p className="text-white/90 text-sm">{displayedUpdate.message}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-white/70">
                  {displayedUpdate.oldScore.toFixed(0)}%
                </span>
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="text-xs font-bold text-white">
                  {displayedUpdate.newScore.toFixed(0)}%
                </span>
                <span className={`text-xs font-bold ${displayedUpdate.change > 0 ? 'text-green-300' : 'text-orange-300'}`}>
                  ({displayedUpdate.change > 0 ? '+' : ''}{displayedUpdate.change.toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg border-2 border-blue-600/60 p-6">
        <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          Your Top Career Matches
        </h3>

        <div className="space-y-4">
          {topCareers.map((career, index) => (
            <div
              key={career.careerTitle}
              className="bg-gray-800/70 rounded-lg p-5 border border-gray-700 transition-all hover:border-blue-500"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{getTrendIcon(career.trend)}</span>
                    <h4 className="text-lg font-bold text-gray-100">{career.careerTitle}</h4>
                    {career.trend === 'rising' && career.change > 5 && (
                      <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
                        Hot!
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{career.careerCategory}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-400">
                    {Math.round(career.currentScore)}%
                  </div>
                  {career.change !== 0 && (
                    <div className={`text-xs font-semibold ${
                      career.change > 0 ? 'text-green-400' : 'text-orange-400'
                    }`}>
                      {career.change > 0 ? '+' : ''}{career.change.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
                    style={{ width: `${career.currentScore}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="text-xs font-semibold text-gray-400">Match Factors:</div>
                {career.matchFactors.slice(0, 3).map((factor, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStrengthColor(factor.strength)}`}>
                        {factor.strength}
                      </span>
                      <span className="text-gray-300">{factor.factor}</span>
                    </div>
                    <span className="text-blue-400 font-medium">
                      +{factor.contribution.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              {career.recentBoost && (
                <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 mb-3">
                  <div className="text-xs font-semibold text-blue-400 mb-1">Recent Boost:</div>
                  <p className="text-sm text-gray-300">{career.recentBoost.reason}</p>
                </div>
              )}

              <button
                onClick={() => onExploreCareer?.(career.careerTitle)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Explore This Career →
              </button>
            </div>
          ))}
        </div>
      </div>

      {risingCareers.length > 0 && (
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg border border-green-700/50 p-6">
          <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-400">+</span>
            Rising Matches
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            These careers are gaining momentum based on your recent responses
          </p>
          <div className="space-y-3">
            {risingCareers.map((career) => (
              <div
                key={career.careerTitle}
                className="bg-gray-800/70 rounded-lg p-4 border border-green-700/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-100">{career.careerTitle}</h4>
                    <p className="text-xs text-gray-400">{career.careerCategory}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-400">
                      {Math.round(career.currentScore)}%
                    </div>
                    <div className="text-xs font-semibold text-green-400">
                      +{career.change.toFixed(1)}%
                    </div>
                  </div>
                </div>
                {career.matchFactors[0] && (
                  <p className="text-xs text-gray-400">
                    Strongest: {career.matchFactors[0].factor}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.01);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
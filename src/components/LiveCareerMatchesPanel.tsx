'use client';

import { useState, useEffect } from 'react';
import { CareerFitScore, LiveCareerUpdate } from '@/lib/matching/realtime-career-matcher';

interface LiveCareerMatchesPanelProps {
  topCareers: CareerFitScore[];
  risingCareers: CareerFitScore[];
  latestUpdate?: LiveCareerUpdate;
  dataCompleteness?: number;
}

export function LiveCareerMatchesPanel({
  topCareers,
  risingCareers,
  latestUpdate,
  dataCompleteness = 0,
}: LiveCareerMatchesPanelProps) {
  const [animatingScores, setAnimatingScores] = useState<Set<string>>(new Set());
  const [previousScores, setPreviousScores] = useState<Map<string, number>>(new Map());
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  useEffect(() => {
    if (latestUpdate) {
      setShowUpdateBanner(true);
      const timer = setTimeout(() => setShowUpdateBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [latestUpdate]);

  useEffect(() => {
    const newAnimating = new Set<string>();
    const newPreviousScores = new Map(previousScores);

    topCareers.forEach(career => {
      const prevScore = previousScores.get(career.careerTitle);
      if (prevScore !== undefined && prevScore !== career.currentScore) {
        newAnimating.add(career.careerTitle);
        setTimeout(() => {
          setAnimatingScores(prev => {
            const next = new Set(prev);
            next.delete(career.careerTitle);
            return next;
          });
        }, 800);
      }
      newPreviousScores.set(career.careerTitle, career.currentScore);
    });

    setAnimatingScores(newAnimating);
    setPreviousScores(newPreviousScores);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topCareers]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 85) return 'from-green-500 to-emerald-600';
    if (score >= 70) return 'from-blue-500 to-cyan-600';
    if (score >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-gray-500 to-gray-600';
  };

  const getTrendIcon = (trend: CareerFitScore['trend']) => {
    switch (trend) {
      case 'rising':
        return (
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'falling':
        return (
          <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'new':
        return (
          <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getChangeIndicator = (change: number) => {
    if (Math.abs(change) < 0.5) return null;

    const isPositive = change > 0;
    return (
      <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-orange-400'}`}>
        {isPositive ? '+' : ''}{Math.round(change)}%
      </span>
    );
  };

  return (
    <div className="lg:sticky lg:top-4 space-y-4">
      {showUpdateBanner && latestUpdate && (
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-3 sm:p-4 shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-sm text-white font-medium">{latestUpdate.message}</p>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg sm:rounded-xl border-2 border-blue-500/30 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 sm:px-5 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white">Live Career Matches</h3>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/90 font-medium hidden sm:inline">Updating</span>
            </div>
          </div>
          <p className="text-xs text-blue-100 mt-1 mb-2 hidden sm:block">Building your profile dynamically</p>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
            <span className="text-white/80">Data Quality</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${dataCompleteness}%` }}
                />
              </div>
              <span className="text-white font-medium">{dataCompleteness}%</span>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-5 space-y-2 sm:space-y-3">
          {topCareers.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm text-gray-400">Keep answering to see your matches!</p>
            </div>
          ) : (
            topCareers.map((career, index) => (
              <div
                key={career.careerTitle}
                className={`group relative bg-gray-800/50 hover:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 ${
                  animatingScores.has(career.careerTitle) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${getScoreColor(career.currentScore)}`}>
                        #{index + 1}
                      </span>
                      {getTrendIcon(career.trend)}
                      {career.trend === 'rising' && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                          Trending Up
                        </span>
                      )}
                      {career.trend === 'new' && (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs font-medium">
                          New
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-gray-100 truncate group-hover:text-blue-400 transition-colors">
                      {career.careerTitle}
                    </h4>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getScoreColor(career.currentScore)} transition-all ${
                        animatingScores.has(career.careerTitle) ? 'scale-110' : 'scale-100'
                      }`}>
                        {Math.round(career.currentScore)}%
                      </span>
                    </div>
                    {getChangeIndicator(career.change)}
                  </div>
                </div>

                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className={`h-full bg-gradient-to-r ${getScoreGradient(career.currentScore)} transition-all duration-800 ease-out`}
                    style={{ width: `${career.currentScore}%` }}
                  />
                </div>

                {career.matchFactors.length > 0 && (
                  <div className="space-y-1.5">
                    {career.matchFactors.slice(0, 2).map((factor, idx) => {
                      const barColor = idx === 0 ? 'bg-gray-400' : 'bg-gray-500';
                      return (
                        <div key={idx} className="flex items-start gap-2">
                          <svg className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-300 leading-tight">
                              <span className="font-medium text-blue-400">{factor.factor}</span>
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="flex-1 bg-gray-700/30 rounded-full h-1">
                                <div
                                  className={`h-full rounded-full transition-all ${barColor}`}
                                  style={{
                                    width: factor.strength === 'strong' ? '100%' :
                                           factor.strength === 'moderate' ? '66%' : '33%'
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {career.recentBoost && (
                  <div className="mt-2 pt-2 border-t border-gray-700/50">
                    <p className="text-xs text-cyan-400 italic">
                      ↗ Recent boost from: {career.recentBoost.reason}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {risingCareers.length > 0 && (
          <div className="border-t border-gray-700/50 bg-gradient-to-br from-green-900/10 to-emerald-900/10 px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              <h4 className="text-sm font-bold text-green-400">Rising Stars</h4>
            </div>
            <div className="space-y-2">
              {risingCareers.map(career => (
                <div key={career.careerTitle} className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 truncate">{career.careerTitle}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-bold">+{Math.round(career.change)}%</span>
                    <span className="text-gray-400">{Math.round(career.currentScore)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
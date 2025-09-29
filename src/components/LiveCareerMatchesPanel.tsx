'use client';

import { useState, useEffect, useRef } from 'react';
import { CareerFitScore, LiveCareerUpdate } from '@/lib/matching/realtime-career-matcher';
import { ExplorationArea } from '@/lib/adaptive-questions/question-banks';
import { IdentifiedGap } from '@/lib/adaptive-questions/adaptive-engine';

interface ExplorationProgress {
  area: ExplorationArea;
  depth: number;
  totalQuestions: number;
  label: string;
}

interface LiveCareerMatchesPanelProps {
  topCareers: CareerFitScore[];
  risingCareers: CareerFitScore[];
  latestUpdate?: LiveCareerUpdate;
  dataCompleteness?: number;
  explorationProgress?: ExplorationProgress[];
  gaps?: IdentifiedGap[];
  totalResponses?: number;
}

function AnimatedNumber({ value, duration = 600 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const frameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const startValueRef = useRef(value);

  useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - (startTimeRef.current || now);
      const progress = Math.min(elapsed / duration, 1);

      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const current = startValueRef.current + (value - startValueRef.current) * easeOutCubic;

      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  return <>{Math.round(displayValue)}</>;
}

export function LiveCareerMatchesPanel({
  topCareers,
  risingCareers,
  latestUpdate,
  dataCompleteness = 0,
  explorationProgress = [],
  gaps = [],
  totalResponses = 0,
}: LiveCareerMatchesPanelProps) {
  const [animatingScores, setAnimatingScores] = useState<Set<string>>(new Set());
  const [previousScores, setPreviousScores] = useState<Map<string, number>>(new Map());
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [scoreChanges, setScoreChanges] = useState<Map<string, number>>(new Map());
  const [showDataQualityDetail, setShowDataQualityDetail] = useState(false);

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
    const newScoreChanges = new Map<string, number>();

    topCareers.forEach(career => {
      const prevScore = previousScores.get(career.careerTitle);
      if (prevScore !== undefined && prevScore !== career.currentScore) {
        newAnimating.add(career.careerTitle);
        newScoreChanges.set(career.careerTitle, career.currentScore - prevScore);
        setTimeout(() => {
          setAnimatingScores(prev => {
            const next = new Set(prev);
            next.delete(career.careerTitle);
            return next;
          });
        }, 1200);
      }
      newPreviousScores.set(career.careerTitle, career.currentScore);
    });

    setAnimatingScores(newAnimating);
    setPreviousScores(newPreviousScores);
    setScoreChanges(newScoreChanges);
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
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-3 sm:p-4 shadow-lg">
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
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full" />
              <span className="text-xs text-white/90 font-medium hidden sm:inline">Updating</span>
            </div>
          </div>
          <p className="text-xs text-blue-100 mt-1 mb-2 hidden sm:block">Building your profile dynamically</p>
          <button
            onClick={() => setShowDataQualityDetail(!showDataQualityDetail)}
            className="w-full flex items-center justify-between text-xs pt-2 border-t border-white/10 hover:bg-white/5 -mx-4 sm:-mx-5 px-4 sm:px-5 py-2 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-white/80">Data Quality</span>
              <svg className={`w-3 h-3 text-white/60 transition-transform ${showDataQualityDetail ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${dataCompleteness}%` }}
                />
              </div>
              <span className="text-white font-medium">{dataCompleteness}%</span>
            </div>
          </button>
        </div>

        {/* Enhanced Data Quality Breakdown */}
        {showDataQualityDetail && (
          <div className="px-4 sm:px-5 py-4 bg-gray-900/50 border-b border-gray-700/50">
            <div className="space-y-4">
              {/* Overall Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-300">Overall Progress</span>
                  <span className="text-xs text-gray-400">{totalResponses} responses</span>
                </div>
                <div className="space-y-1.5 text-xs text-gray-400">
                  {totalResponses < 10 && (
                    <p className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Answer <strong className="text-yellow-300">{Math.max(0, 10 - totalResponses)} more</strong> to see initial matches
                    </p>
                  )}
                  {totalResponses >= 10 && totalResponses < 20 && (
                    <p className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Answer <strong className="text-blue-300">{Math.max(0, 20 - totalResponses)} more</strong> for better accuracy
                    </p>
                  )}
                  {totalResponses >= 20 && totalResponses < 35 && (
                    <p className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Good progress! <strong className="text-green-300">{Math.max(0, 35 - totalResponses)} more</strong> for high confidence
                    </p>
                  )}
                  {totalResponses >= 35 && (
                    <p className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-300 font-semibold">Excellent data coverage!</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Exploration Areas */}
              {explorationProgress.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-300 mb-2">Exploration Areas</h4>
                  <div className="space-y-2">
                    {explorationProgress
                      .sort((a, b) => {
                        const aPercent = a.totalQuestions > 0 ? a.depth / a.totalQuestions : 0;
                        const bPercent = b.totalQuestions > 0 ? b.depth / b.totalQuestions : 0;
                        return aPercent - bPercent;
                      })
                      .slice(0, 4)
                      .map((area) => {
                        const percentage = area.totalQuestions > 0 ? Math.min(100, (area.depth / area.totalQuestions) * 100) : 0;
                        const isLow = percentage < 30;
                        const isMedium = percentage >= 30 && percentage < 70;

                        return (
                          <div key={area.area} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className={`font-medium ${isLow ? 'text-orange-300' : isMedium ? 'text-blue-300' : 'text-green-300'}`}>
                                {area.label}
                              </span>
                              <span className="text-gray-500">{area.depth}/{area.totalQuestions}</span>
                            </div>
                            <div className="h-1 bg-gray-700/50 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  isLow ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                                  isMedium ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                  'bg-gradient-to-r from-green-500 to-emerald-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Priority Areas to Explore */}
              {gaps.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Priority Questions
                  </h4>
                  <div className="space-y-2">
                    {gaps.slice(0, 2).map((gap, idx) => (
                      <div key={idx} className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-2.5">
                        <div className="flex items-start gap-2">
                          <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                            gap.importance === 'high' ? 'bg-red-500/20 text-red-300' :
                            gap.importance === 'medium' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {gap.importance}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-300 leading-relaxed">{gap.gap}</p>
                            <p className="text-[10px] text-gray-500 mt-1">Would improve {gap.suggestedQuestions.length} match factor{gap.suggestedQuestions.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendation */}
              <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-700/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div className="text-xs text-gray-300 leading-relaxed">
                    {explorationProgress.length > 0 && explorationProgress.some(a => a.depth === 0) ? (
                      <span>Focus on <strong className="text-cyan-300">{explorationProgress.find(a => a.depth === 0)?.label}</strong> to unlock new career matches</span>
                    ) : gaps.length > 0 ? (
                      <span>Answer <strong className="text-cyan-300">{gaps[0].area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</strong> questions for better matching accuracy</span>
                    ) : (
                      <span>Keep answering questions to refine your matches!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
            topCareers.map((career, index) => {
              const isAnimating = animatingScores.has(career.careerTitle);
              const scoreChange = scoreChanges.get(career.careerTitle) || 0;
              const isIncreasing = scoreChange > 0;
              const isRapidlyRising = career.trend === 'rising' && scoreChange >= 8;

              return (
              <div
                key={career.careerTitle}
                className={`group relative bg-gray-800/50 hover:bg-gray-800 rounded-lg p-3 sm:p-4 border transition-all duration-500 ${
                  isAnimating
                    ? isIncreasing
                      ? 'border-green-400/60 ring-2 ring-green-400/30 shadow-lg shadow-green-400/20 animate-glow-green'
                      : 'border-orange-400/60 ring-2 ring-orange-400/30 shadow-lg shadow-orange-400/20'
                    : 'border-gray-700 hover:border-blue-500/50'
                }`}
              >
                {/* Animated background glow for rapidly rising careers */}
                {isRapidlyRising && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/5 to-transparent animate-shimmer rounded-lg pointer-events-none" />
                )}

                <div className="flex items-start justify-between gap-3 mb-3 relative">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-bold ${getScoreColor(career.currentScore)}`}>
                        #{index + 1}
                      </span>
                      {getTrendIcon(career.trend)}
                      {career.trend === 'rising' && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                          </svg>
                          {isRapidlyRising ? 'Hot' : 'Trending'}
                        </span>
                      )}
                      {career.trend === 'new' && (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs font-medium">
                          ✨ New
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-gray-100 truncate group-hover:text-blue-400 transition-colors">
                      {career.careerTitle}
                    </h4>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      {/* Animated arrow indicator */}
                      {isAnimating && Math.abs(scoreChange) >= 1 && (
                        <div className={`animate-bounce ${isIncreasing ? 'text-green-400' : 'text-orange-400'}`}>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            {isIncreasing ? (
                              <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            ) : (
                              <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            )}
                          </svg>
                        </div>
                      )}
                      <span className={`text-2xl font-bold ${getScoreColor(career.currentScore)} transition-all ${
                        isAnimating ? 'scale-110' : 'scale-100'
                      }`}>
                        <AnimatedNumber value={career.currentScore} />%
                      </span>
                    </div>
                    {/* Enhanced change indicator */}
                    {Math.abs(scoreChange) >= 0.5 && (
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        isIncreasing
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-orange-500/20 text-orange-300'
                      }`}>
                        {isIncreasing ? '↗' : '↘'} {isIncreasing ? '+' : ''}{Math.round(scoreChange)}%
                      </div>
                    )}
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
              );
            })
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
                <div key={career.careerTitle} className="flex items-center justify-between text-xs bg-gray-800/30 rounded-lg p-2 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-200 truncate font-medium">{career.careerTitle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-bold px-2 py-0.5 bg-green-500/10 rounded-full">
                      +<AnimatedNumber value={career.change} />%
                    </span>
                    <span className="text-gray-300 font-semibold">
                      <AnimatedNumber value={career.currentScore} />%
                    </span>
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
'use client';

import { useState } from 'react';
import { CareerMatch } from '@/types/career-matching';
import { CareerDetailModal } from './CareerDetailModal';

interface CareerMatchResultsProps {
  matches: CareerMatch[];
  userProfile?: {
    name?: string;
    questionnaire?: Record<string, unknown>;
  };
}

export function CareerMatchResults({ matches, userProfile }: CareerMatchResultsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<CareerMatch | null>(null);

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Matches Found</h2>
        <p className="text-gray-600">
          We couldn&apos;t find any careers matching your criteria. Try adjusting your preferences or completing more questions.
        </p>
      </div>
    );
  }

  const toggleExpanded = (careerId: string) => {
    setExpandedMatch(expandedMatch === careerId ? null : careerId);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Moderate Confidence';
    return 'Lower Confidence';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Career Matches
        </h1>
        <p className="text-gray-600">
          We found {matches.length} career{matches.length !== 1 ? 's' : ''} that match your profile
        </p>
      </div>

      <div className="mb-6 flex justify-end gap-2">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-4 py-2 rounded-lg ${
            viewMode === 'grid'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Grid
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-lg ${
            viewMode === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          List
        </button>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
        {matches.map((match, index) => (
          <div
            key={match.career.id}
            className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {match.career.title}
                      </h3>
                      <p className="text-sm text-gray-500">{match.career.category}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round(match.overallScore)}
                  </div>
                  <div className="text-xs text-gray-500">Match Score</div>
                  <div className={`text-xs font-semibold mt-1 ${getConfidenceColor(match.confidence)}`}>
                    {getConfidenceLabel(match.confidence)}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">
                {match.career.description}
              </p>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Salary Range</span>
                  <span className="font-semibold">
                    ${match.career.salaryRanges[0]?.min.toLocaleString() || 'N/A'} - ${match.career.salaryRanges[0]?.max.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Experience Level</span>
                  <span className="font-semibold capitalize">{match.career.salaryRanges[0]?.experienceLevel || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Interests Alignment</span>
                    <span>{Math.round(match.reasoning.interestsAlignment.score)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getScoreColor(match.reasoning.interestsAlignment.score)}`}
                      style={{ width: `${match.reasoning.interestsAlignment.score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Skills Match</span>
                    <span>{Math.round(match.reasoning.skillsMatch.score)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getScoreColor(match.reasoning.skillsMatch.score)}`}
                      style={{ width: `${match.reasoning.skillsMatch.score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Experience Alignment</span>
                    <span>{Math.round(match.reasoning.experienceAlignment.score)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getScoreColor(match.reasoning.experienceAlignment.score)}`}
                      style={{ width: `${match.reasoning.experienceAlignment.score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Personality Fit</span>
                    <span>{Math.round(match.reasoning.personalityFit.score)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getScoreColor(match.reasoning.personalityFit.score)}`}
                      style={{ width: `${match.reasoning.personalityFit.score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Preferences Match</span>
                    <span>{Math.round(match.reasoning.preferencesMatch.score)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getScoreColor(match.reasoning.preferencesMatch.score)}`}
                      style={{ width: `${match.reasoning.preferencesMatch.score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Education Fit</span>
                    <span>{Math.round(match.reasoning.educationFit.score)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getScoreColor(match.reasoning.educationFit.score)}`}
                      style={{ width: `${match.reasoning.educationFit.score}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => toggleExpanded(match.career.id)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {expandedMatch === match.career.id ? 'Hide Details' : 'Show Details'}
                </button>
                <button
                  onClick={() => setSelectedCareer(match)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Full Profile
                </button>
              </div>

              {expandedMatch === match.career.id && (
                <div className="border-t border-gray-200 pt-4 space-y-4">
                  {match.strengths.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">✓ Strengths</h4>
                      <ul className="space-y-1">
                        {match.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {match.concerns.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-orange-700 mb-2">⚠ Considerations</h4>
                      <ul className="space-y-1">
                        {match.concerns.map((concern, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-orange-600 mr-2">•</span>
                            <span>{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {match.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-2">→ Recommendations</h4>
                      <ul className="space-y-1">
                        {match.recommendations.map((recommendation, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 mb-1">Interests Alignment</h5>
                      <p className="text-xs text-gray-600">{match.reasoning.interestsAlignment.explanation}</p>
                      {match.reasoning.interestsAlignment.matchedItems.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {match.reasoning.interestsAlignment.matchedItems.map((item, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 mb-1">Skills Match</h5>
                      <p className="text-xs text-gray-600">{match.reasoning.skillsMatch.explanation}</p>
                      {match.reasoning.skillsMatch.matchedSkills.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Matched Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {match.reasoning.skillsMatch.matchedSkills.map((skill, i) => (
                              <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {match.reasoning.skillsMatch.missingSkills.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Skills to Develop:</p>
                          <div className="flex flex-wrap gap-1">
                            {match.reasoning.skillsMatch.missingSkills.map((skill, i) => (
                              <span key={i} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 mb-1">Personality Fit</h5>
                      <p className="text-xs text-gray-600">{match.reasoning.personalityFit.explanation}</p>
                    </div>

                    {match.reasoning.educationFit.pathways.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Education Pathways</h5>
                        <p className="text-xs text-gray-600 mb-2">{match.reasoning.educationFit.explanation}</p>
                        <ul className="space-y-1">
                          {match.reasoning.educationFit.pathways.map((pathway, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start">
                              <span className="text-blue-600 mr-2">→</span>
                              <span>{pathway}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedCareer && (
        <CareerDetailModal
          career={selectedCareer.career}
          onClose={() => setSelectedCareer(null)}
        />
      )}
    </div>
  );
}
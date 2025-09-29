import { useState, useEffect } from 'react';

interface PersonalizedInsight {
  primaryInsight: string;
  secondaryInsight: string;
  cognitivePattern: string;
  uniqueStrength: string;
  careerDirection: string;
  careerImplication: string;
  opportunityTease: string;
}

interface UsePersonalizedInsightsProps {
  profile: any;
  careerRecommendations?: any;
  assessmentId?: string | number;
}

export function usePersonalizedInsights({
  profile,
  careerRecommendations,
  assessmentId
}: UsePersonalizedInsightsProps) {
  const [insights, setInsights] = useState<PersonalizedInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile || !profile.responses) return;

    const generateInsights = async () => {
      // Create a unique fingerprint based on actual assessment data
      const assessmentFingerprint = createAssessmentFingerprint(profile, careerRecommendations);
      const cacheKey = `personalized_insights_${assessmentId}_${assessmentFingerprint}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          // Only use cache if fingerprint matches AND it's less than 24 hours old
          if (parsedCache.fingerprint === assessmentFingerprint &&
              Date.now() - parsedCache.timestamp < 24 * 60 * 60 * 1000) {
            setInsights(parsedCache.insights);
            return;
          }
        } catch (e) {
          // Invalid cache, continue with generation
        }
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/insights/personalized', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile,
            careerRecommendations,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || 'Failed to generate insights');
        }

        const data = await response.json();

        if (data.success && data.insights) {
          setInsights(data.insights);

          // Cache the results with fingerprint
          if (assessmentId) {
            localStorage.setItem(cacheKey, JSON.stringify({
              insights: data.insights,
              timestamp: Date.now(),
              fingerprint: assessmentFingerprint
            }));
          }
        } else {
          console.warn('Invalid response format from insights API, using fallback');
          setInsights(generateFallbackInsights(profile));
        }

      } catch (err) {
        console.error('Error generating insights:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');

        // Fallback to default insights
        setInsights(generateFallbackInsights(profile));
      } finally {
        setLoading(false);
      }
    };

    generateInsights();
  }, [profile, careerRecommendations, assessmentId]);

  return { insights, loading, error };
}

// Create a unique fingerprint based on assessment responses and results
function createAssessmentFingerprint(profile: any, careerRecommendations?: any): string {
  const data = {
    // Core response data
    responses: profile.responses,
    completion: profile.completion,

    // Insights and patterns
    synthesizedInsights: profile.synthesizedInsights?.map((i: any) => ({
      type: i.type,
      title: i.title,
      description: i.description
    })),

    // Analysis results
    strengths: profile.analysis?.strengths,
    topCareers: profile.topCareers?.map((c: any) => ({
      title: c.title,
      match: c.match
    })),

    // Authenticity markers
    authenticityProfile: profile.authenticityProfile,

    // Career recommendations
    recommendations: careerRecommendations?.topRecommendations?.map((r: any) => ({
      jobTitle: r.jobTitle,
      matchScore: r.matchScore,
      reasons: r.reasons?.slice(0, 2) // First 2 reasons only for fingerprint
    }))
  };

  // Create a simple hash of the JSON string
  return simpleHash(JSON.stringify(data));
}

// Simple hash function for creating fingerprints
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

function generateFallbackInsights(profile: any): PersonalizedInsight {
  const hasHighCompletion = profile.completion >= 80;
  const hasCrossDomain = profile.synthesizedInsights?.some((i: any) => i.type === 'cross-domain');

  return {
    primaryInsight: hasHighCompletion
      ? "Your comprehensive responses reveal a mind that thrives on connecting disparate concepts. You don't just solve problems—you reframe them entirely, which explains why conventional career paths have felt constraining."
      : "Your thoughtful approach shows you're someone who processes decisions through multiple lenses. This deliberate, multi-perspective thinking style makes you both thorough and innovative.",

    secondaryInsight: hasCrossDomain
      ? "Your responses reveal intellectual restlessness—you're energized by variety and complexity, not content with surface-level engagement."
      : "Your focused response pattern indicates you value deep expertise, suggesting you're driven by mastery and meaningful contribution.",

    cognitivePattern: "You approach complex situations by gathering comprehensive information, then synthesizing it into actionable insights.",

    uniqueStrength: hasCrossDomain
      ? "Your ability to bridge different fields and find unexpected connections is your professional superpower."
      : "Your capacity for deep, sustained focus combined with systems thinking sets you apart.",

    careerDirection: "Your recommended careers aren't just skill matches—they're designed around how your mind naturally operates and what secretly energizes you.",

    careerImplication: hasCrossDomain
      ? "This psychological profile tells us something crucial—you need roles where this cognitive complexity is an asset, not a liability. You're built for positions that reward intellectual agility and systems-level thinking."
      : "Here's what this means for your career: you belong in roles that value thoughtful analysis over quick decisions, where your deliberate approach becomes your competitive advantage.",

    opportunityTease: hasCrossDomain
      ? "You're positioned for roles that don't exist in traditional job descriptions—the kind where organizations create positions around exceptional talent."
      : "The career paths opening up for you are where deep expertise meets high impact, where mastery translates directly into industry influence."
  };
}
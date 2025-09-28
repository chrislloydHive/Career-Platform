import { anthropicClient } from './anthropic-client';
import { JobCategory } from '@/types/career';

export interface RecommendationReason {
  factor: string;
  explanation: string;
  confidence: number;
}

export interface CareerRecommendation {
  jobTitle: string;
  category: string;
  matchScore: number;
  reasons: RecommendationReason[];
  newInsight?: string;
}

export class CareerRecommendationsAI {
  async generateRecommendations(
    userContext: string,
    activityData: {
      searchedJobs: string[];
      exploredCareers: JobCategory[];
      chatHistory: Array<{ query: string; timestamp: Date }>;
      questionnaireCompletion: number;
    }
  ): Promise<CareerRecommendation[]> {
    if (!anthropicClient.isAvailable()) {
      return [];
    }

    const prompt = `Based on the user's comprehensive career exploration data, generate 3-5 personalized career recommendations that they haven't explored yet or should reconsider.

User Profile Context:
${userContext}

Recent Activity Analysis:
- Searched Jobs (${activityData.searchedJobs.length} searches): ${activityData.searchedJobs.join(', ') || 'None yet'}
- Explored Careers (${activityData.exploredCareers.length} careers): ${activityData.exploredCareers.map(c => c.title).join(', ') || 'None yet'}
- Chat Queries (${activityData.chatHistory.length} messages): ${activityData.chatHistory.slice(-5).map(h => h.query).join('; ') || 'None yet'}
- Self-Discovery Completion: ${activityData.questionnaireCompletion}%

INSTRUCTIONS:
1. Analyze patterns in their searches, explorations, and discovered insights
2. Identify career paths they might not have considered but align with their profile
3. Look for connections between their stated preferences and unexplored opportunities
4. Consider career progressions from their current explorations
5. Generate 3-5 specific career recommendations with detailed reasoning

Return ONLY a valid JSON array in this exact format:
[
  {
    "jobTitle": "Specific job title",
    "category": "one of: healthcare, tech, marketing, finance, wellness, design, education, business",
    "matchScore": 85,
    "reasons": [
      {
        "factor": "Self-Discovery Insight",
        "explanation": "Your questionnaire revealed strong analytical thinking combined with desire for creative work",
        "confidence": 0.9
      },
      {
        "factor": "Search Pattern",
        "explanation": "You've explored project management and technical roles, suggesting interest in bridging technical and leadership",
        "confidence": 0.85
      }
    ],
    "newInsight": "Optional: A new perspective or connection the user might not have considered"
  }
]

IMPORTANT:
- Recommend careers they haven't already explored extensively
- Base recommendations on actual data from their profile and activity
- Be specific and actionable
- Match scores should be 70-95 (high confidence recommendations only)
- Each recommendation needs 2-4 specific reasons with explanations`;

    try {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            jobTitle: { type: 'string' },
            category: { type: 'string' },
            matchScore: { type: 'number' },
            reasons: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  factor: { type: 'string' },
                  explanation: { type: 'string' },
                  confidence: { type: 'number' }
                }
              }
            },
            newInsight: { type: 'string' }
          }
        }
      };

      const recommendations = await anthropicClient.generateStructuredResponse<CareerRecommendation[]>(
        'You are a career recommendation AI assistant. Analyze user profiles and activity to suggest personalized career paths.',
        prompt,
        schema
      );

      return recommendations.filter(r => r.matchScore >= 70);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return [];
    }
  }
}

export const careerRecommendationsAI = new CareerRecommendationsAI();
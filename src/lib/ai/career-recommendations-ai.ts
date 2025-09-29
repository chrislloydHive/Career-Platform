import { anthropicClient } from './anthropic-client';
import { JobCategory } from '@/types/career';

export interface RecommendationReason {
  factor: string;
  explanation: string;
  confidence: number;
}

export interface BackgroundConnection {
  aspect: string;
  connection: string;
  transferableValue: string;
}

export interface IndustryApplication {
  industry: string;
  application: string;
  specificExample: string;
}

export interface AlternativePath {
  jobTitle: string;
  category: string;
  matchScore: number;
  appealReason: string;
  personalityAspect: string;
  industryApplications?: IndustryApplication[];
}

export interface CareerRecommendation {
  jobTitle: string;
  category: string;
  matchScore: number;
  reasons: RecommendationReason[];
  backgroundConnections?: BackgroundConnection[];
  industryApplications: IndustryApplication[];
  newInsight?: string;
}

export interface CareerRecommendationsResponse {
  topRecommendations: CareerRecommendation[];
  alternativePaths: AlternativePath[];
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
  ): Promise<CareerRecommendationsResponse> {
    if (!anthropicClient.isAvailable()) {
      return {
        topRecommendations: [],
        alternativePaths: []
      };
    }

    const prompt = `Based on the user's comprehensive career exploration data, generate personalized career recommendations and alternative paths.

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
5. CRITICALLY IMPORTANT: Analyze their actual work experience, education, and skills to show how their background connects to each recommended career
6. Generate 3-5 TOP career recommendations (85-95% match) with detailed reasoning AND background connections
7. Generate 2-3 ALTERNATIVE PATHS (70-85% match) that appeal to different personality aspects or interests they've shown
8. For EACH career recommendation, provide 4-5 industry applications showing how the role works across different sectors

Return ONLY a valid JSON object in this exact format:
{
  "topRecommendations": [
    {
      "jobTitle": "Specific job title",
      "category": "one of: healthcare, tech, marketing, finance, wellness, design, education, business",
      "matchScore": 92,
      "reasons": [
        {
          "factor": "Self-Discovery Insight",
          "explanation": "Your questionnaire revealed strong analytical thinking combined with desire for creative work",
          "confidence": 0.9
        }
      ],
      "backgroundConnections": [
        {
          "aspect": "Marketing Experience",
          "connection": "Your marketing background at Hey Advertising and Lululemon",
          "transferableValue": "Would be valuable for understanding customer needs, campaign strategy, and growth marketing in a data-driven environment"
        }
      ],
      "industryApplications": [
        {
          "industry": "Healthcare",
          "application": "Patient outcomes analysis and healthcare data visualization",
          "specificExample": "Designing interfaces for electronic health records and patient monitoring systems"
        },
        {
          "industry": "Finance",
          "application": "Financial data visualization and trading platform design",
          "specificExample": "Creating dashboards for portfolio management and risk assessment tools"
        },
        {
          "industry": "E-commerce",
          "application": "Customer journey optimization and conversion analysis",
          "specificExample": "Designing checkout flows and product discovery interfaces"
        },
        {
          "industry": "Education",
          "application": "Learning platform design and student engagement tools",
          "specificExample": "Creating interactive learning modules and progress tracking interfaces"
        }
      ],
      "newInsight": "Optional: A new perspective or connection the user might not have considered"
    }
  ],
  "alternativePaths": [
    {
      "jobTitle": "Alternative career title",
      "category": "healthcare, tech, marketing, finance, wellness, design, education, or business",
      "matchScore": 78,
      "appealReason": "This role would satisfy your creative side while leveraging your analytical skills",
      "personalityAspect": "Creative Problem-Solving",
      "industryApplications": [
        {
          "industry": "Tech",
          "application": "Product marketing and user engagement",
          "specificExample": "Creating campaigns for software products and analyzing user behavior"
        }
      ]
    },
    {
      "jobTitle": "Another alternative career",
      "category": "healthcare, tech, marketing, finance, wellness, design, education, or business",
      "matchScore": 75,
      "appealReason": "Appeals to your desire for people connection and systematic thinking",
      "personalityAspect": "Interpersonal Leadership",
      "industryApplications": [
        {
          "industry": "Healthcare",
          "application": "Team leadership and process improvement",
          "specificExample": "Managing clinical teams and optimizing patient care workflows"
        }
      ]
    }
  ]
}

IMPORTANT:
- topRecommendations: 3-5 careers with 85-95% match scores, detailed reasons and background connections
- alternativePaths: 2-3 careers with 70-85% match scores, focusing on different personality aspects
- Base all recommendations on actual data from their profile and activity
- Be specific and actionable
- Each recommendation needs 2-4 specific reasons with explanations`;

    try {
      const schema = {
        type: 'object',
        properties: {
          topRecommendations: {
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
                backgroundConnections: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      aspect: { type: 'string' },
                      connection: { type: 'string' },
                      transferableValue: { type: 'string' }
                    }
                  }
                },
                industryApplications: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      industry: { type: 'string' },
                      application: { type: 'string' },
                      specificExample: { type: 'string' }
                    }
                  }
                },
                newInsight: { type: 'string' }
              }
            }
          },
          alternativePaths: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                jobTitle: { type: 'string' },
                category: { type: 'string' },
                matchScore: { type: 'number' },
                appealReason: { type: 'string' },
                personalityAspect: { type: 'string' },
                industryApplications: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      industry: { type: 'string' },
                      application: { type: 'string' },
                      specificExample: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const response = await anthropicClient.generateStructuredResponse<CareerRecommendationsResponse>(
        'You are a career recommendation AI assistant. Analyze user profiles and activity to suggest personalized career paths.',
        prompt,
        schema
      );

      return {
        topRecommendations: response.topRecommendations.filter(r => r.matchScore >= 70),
        alternativePaths: response.alternativePaths.filter(r => r.matchScore >= 70 && r.matchScore <= 85)
      };
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return {
        topRecommendations: [],
        alternativePaths: []
      };
    }
  }
}

export const careerRecommendationsAI = new CareerRecommendationsAI();
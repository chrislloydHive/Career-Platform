import { JobCategory } from '@/types/career';
import { anthropicClient } from './anthropic-client';

export class CareerResearchAI {
  private readonly systemPrompt = `You are an expert career research assistant. Your role is to analyze information about job roles and generate comprehensive, accurate career profiles.

When generating career data:
- Be specific and realistic about job responsibilities, skills, and requirements
- Provide accurate salary ranges based on current market data
- Include realistic daily tasks with time percentages that add up to 100%
- List both technical and soft skills with appropriate importance levels
- Create logical career progression paths
- Base job outlook on current market trends
- Be thorough but concise in descriptions`;

  async generateCareerProfile(
    jobTitle: string,
    searchResults: string,
    additionalContext?: string
  ): Promise<JobCategory> {
    if (!anthropicClient.isAvailable()) {
      throw new Error('AI service not available. Please configure ANTHROPIC_API_KEY.');
    }

    const prompt = `Based on the following information about "${jobTitle}", generate a complete career profile.

Search Results:
${searchResults}

${additionalContext ? `Additional Context:\n${additionalContext}\n\n` : ''}

Generate a comprehensive career profile with the following structure:
{
  "id": "unique-slug-id",
  "category": "one of: healthcare, tech, marketing, finance, wellness, design, education, business",
  "title": "Official Job Title",
  "description": "2-3 sentence overview of the role",
  "alternativeTitles": ["array", "of", "alternative", "titles"],
  "dailyTasks": [
    {
      "task": "Description of task",
      "frequency": "daily or weekly",
      "timePercentage": 25
    }
  ],
  "requiredSkills": [
    {
      "skill": "Skill name",
      "category": "technical, soft, or certification",
      "importance": "required, preferred, or nice-to-have",
      "description": "Optional description"
    }
  ],
  "salaryRanges": [
    {
      "min": 50000,
      "max": 70000,
      "median": 60000,
      "currency": "USD",
      "period": "yearly",
      "experienceLevel": "entry, mid, senior, or executive"
    }
  ],
  "careerProgression": [
    {
      "level": "entry, mid, senior, or executive",
      "title": "Job title at this level",
      "yearsExperience": "X-Y years",
      "typicalSalaryRange": { salary object },
      "keyResponsibilities": ["array of responsibilities"],
      "requiredSkills": ["array of skills"]
    }
  ],
  "industryInsights": [
    {
      "topic": "Insight topic",
      "description": "Description of trend or insight",
      "trend": "growing, stable, or declining"
    }
  ],
  "workEnvironment": {
    "remote": true/false,
    "hybrid": true/false,
    "onsite": true/false,
    "travelRequired": true/false,
    "typicalHours": "Description of typical work hours"
  },
  "jobOutlook": {
    "growthRate": "X% (timeframe, description)",
    "projectedJobs": "Number of openings per year",
    "competitionLevel": "low, medium, or high"
  },
  "education": {
    "minimumDegree": "Description",
    "preferredDegree": "Description",
    "certifications": ["array of certifications"],
    "alternativePathways": ["array of alternative paths"]
  },
  "relatedRoles": ["array", "of", "related", "job", "titles"],
  "keywords": ["searchable", "keywords", "for", "this", "role"]
}

IMPORTANT: Respond with ONLY the JSON object. Ensure all daily task timePercentages add up to 100.`;

    const careerProfile = await anthropicClient.generateStructuredResponse<JobCategory>(
      this.systemPrompt,
      prompt,
      {}
    );

    return careerProfile;
  }

  async enhanceCareerProfile(
    existingProfile: Partial<JobCategory>,
    additionalResearch: string
  ): Promise<JobCategory> {
    if (!anthropicClient.isAvailable()) {
      throw new Error('AI service not available. Please configure ANTHROPIC_API_KEY.');
    }

    const prompt = `Enhance the following career profile with additional research data:

Existing Profile:
${JSON.stringify(existingProfile, null, 2)}

Additional Research:
${additionalResearch}

Generate a complete, enhanced career profile in the same JSON format as before. Merge the existing data with new insights, filling in any missing fields and improving accuracy.`;

    const enhancedProfile = await anthropicClient.generateStructuredResponse<JobCategory>(
      this.systemPrompt,
      prompt,
      {}
    );

    return enhancedProfile;
  }
}

export const careerResearchAI = new CareerResearchAI();
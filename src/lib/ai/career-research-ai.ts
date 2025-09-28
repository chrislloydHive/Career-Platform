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
    additionalContext?: string,
    userContext?: string
  ): Promise<JobCategory> {
    if (!anthropicClient.isAvailable()) {
      throw new Error('AI service not available. Please configure ANTHROPIC_API_KEY.');
    }

    const prompt = `Based on the following information about "${jobTitle}", generate a complete career profile.

${userContext ? `User Context (tailor recommendations to this person):\n${userContext}\n\n` : ''}

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
      "experienceLevel": "entry"
    },
    {
      "min": 70000,
      "max": 100000,
      "median": 85000,
      "currency": "USD",
      "period": "yearly",
      "experienceLevel": "mid"
    },
    {
      "min": 100000,
      "max": 150000,
      "median": 125000,
      "currency": "USD",
      "period": "yearly",
      "experienceLevel": "senior"
    },
    {
      "min": 150000,
      "max": 250000,
      "median": 200000,
      "currency": "USD",
      "period": "yearly",
      "experienceLevel": "executive"
    }
  ],
  "careerProgression": [
    {
      "level": "entry",
      "title": "Entry-level job title",
      "yearsExperience": "0-2 years",
      "typicalSalaryRange": {
        "min": 50000,
        "max": 70000,
        "median": 60000,
        "currency": "USD",
        "period": "yearly",
        "experienceLevel": "entry"
      },
      "keyResponsibilities": ["responsibility 1", "responsibility 2", "responsibility 3"],
      "requiredSkills": ["skill 1", "skill 2", "skill 3"]
    },
    {
      "level": "mid",
      "title": "Mid-level job title",
      "yearsExperience": "3-5 years",
      "typicalSalaryRange": {
        "min": 70000,
        "max": 100000,
        "median": 85000,
        "currency": "USD",
        "period": "yearly",
        "experienceLevel": "mid"
      },
      "keyResponsibilities": ["responsibility 1", "responsibility 2", "responsibility 3"],
      "requiredSkills": ["skill 1", "skill 2", "skill 3"]
    },
    {
      "level": "senior",
      "title": "Senior-level job title",
      "yearsExperience": "6-10 years",
      "typicalSalaryRange": {
        "min": 100000,
        "max": 150000,
        "median": 125000,
        "currency": "USD",
        "period": "yearly",
        "experienceLevel": "senior"
      },
      "keyResponsibilities": ["responsibility 1", "responsibility 2", "responsibility 3"],
      "requiredSkills": ["skill 1", "skill 2", "skill 3"]
    },
    {
      "level": "executive",
      "title": "Executive-level job title",
      "yearsExperience": "10+ years",
      "typicalSalaryRange": {
        "min": 150000,
        "max": 250000,
        "median": 200000,
        "currency": "USD",
        "period": "yearly",
        "experienceLevel": "executive"
      },
      "keyResponsibilities": ["responsibility 1", "responsibility 2", "responsibility 3"],
      "requiredSkills": ["skill 1", "skill 2", "skill 3"]
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

CRITICAL REQUIREMENTS:
1. Respond with ONLY the JSON object, no other text
2. Ensure all daily task timePercentages add up to 100
3. MUST include salary ranges for ALL FOUR experience levels (entry, mid, senior, executive)
4. MUST include complete careerProgression array with all 4 levels
5. Each careerProgression entry MUST have typicalSalaryRange with all fields (min, max, median, currency, period, experienceLevel)
6. Each careerProgression entry MUST have keyResponsibilities array (minimum 3 items)
7. Each careerProgression entry MUST have requiredSkills array (minimum 3 items)
8. Use realistic, current market salary data based on ${jobTitle}
9. Salary ranges should increase appropriately with experience level`;

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
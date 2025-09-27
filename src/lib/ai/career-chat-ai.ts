import { anthropicClient } from './anthropic-client';
import { QueryIntent, ChatMessage } from '@/types/chat';
import { JobCategory } from '@/types/career';

interface EnhancedQueryIntent extends QueryIntent {
  userGoals?: string[];
  emotionalTone?: 'excited' | 'uncertain' | 'frustrated' | 'curious';
  clarificationsNeeded?: string[];
}

interface AICareerAnalysis {
  reasoning: string;
  strengths: string[];
  considerations: string[];
  nextSteps: string[];
}

export class CareerChatAI {
  private readonly systemPrompt = `You are a knowledgeable and empathetic career advisor helping people discover fulfilling career paths. Your role is to:

1. Understand the user's interests, skills, values, and constraints
2. Ask thoughtful clarifying questions to better understand their needs
3. Provide personalized career suggestions with clear reasoning
4. Help users think through trade-offs and considerations
5. Be encouraging while also being realistic about career paths

Guidelines:
- Be conversational and warm, not robotic
- Ask one question at a time to avoid overwhelming users
- Acknowledge uncertainty and help users explore options
- Consider work-life balance, growth potential, and personal fulfillment
- Provide specific, actionable advice
- When discussing careers, focus on day-to-day realities, not just titles`;

  async enhanceQueryUnderstanding(
    query: string,
    conversationHistory: ChatMessage[],
    userContext?: string
  ): Promise<EnhancedQueryIntent> {
    const historyContext = this.buildHistoryContext(conversationHistory);

    const prompt = `Analyze this career-related query and extract detailed intent:

Query: "${query}"

${userContext ? `\n${userContext}\n` : ''}

${historyContext}

Return a JSON object with:
{
  "type": "career_search" | "information" | "comparison" | "exploration",
  "keywords": ["keyword1", "keyword2"],
  "filters": {
    "categories": ["category1"],
    "skills": ["skill1"],
    "interests": ["interest1"],
    "workEnvironment": ["remote", "hybrid", "onsite"]
  },
  "constraints": {
    "remote": true/false,
    "salary": {"min": number, "max": number},
    "education": "level"
  },
  "userGoals": ["what the user hopes to achieve"],
  "emotionalTone": "excited" | "uncertain" | "frustrated" | "curious",
  "clarificationsNeeded": ["questions to ask if intent is unclear"]
}`;

    try {
      return await anthropicClient.generateStructuredResponse<EnhancedQueryIntent>(
        this.systemPrompt,
        prompt,
        {}
      );
    } catch (error) {
      console.error('AI query enhancement failed:', error);
      return {
        type: 'career_search',
        keywords: [],
        filters: {},
        userGoals: [],
        emotionalTone: 'curious',
        clarificationsNeeded: [],
      };
    }
  }

  async generatePersonalizedResponse(
    query: string,
    intent: EnhancedQueryIntent,
    matchedCareers: JobCategory[],
    conversationHistory: ChatMessage[],
    userContext?: string
  ): Promise<{
    message: string;
    followUpQuestions: string[];
    careerAnalyses: Map<string, AICareerAnalysis>;
  }> {
    const historyContext = this.buildHistoryContext(conversationHistory);

    const careersContext = matchedCareers.slice(0, 5).map(career => ({
      title: career.title,
      description: career.description,
      category: career.category,
      skills: career.requiredSkills.slice(0, 5).map(s => s.skill),
      salary: career.salaryRanges[0],
      workEnvironment: career.workEnvironment,
    }));

    const prompt = `The user asked: "${query}"

${userContext ? `\n${userContext}\n` : ''}

${historyContext}

Extracted intent:
- Type: ${intent.type}
- Keywords: ${intent.keywords.join(', ')}
- Goals: ${intent.userGoals?.join(', ') || 'Not specified'}
- Emotional tone: ${intent.emotionalTone}

Matched careers:
${JSON.stringify(careersContext, null, 2)}

Generate a warm, personalized response that:
1. Acknowledges their query and goals
2. Introduces the matched careers naturally (don't just list them)
3. Provides context about why these careers might fit
4. Addresses their emotional tone appropriately

Return JSON:
{
  "message": "your personalized response (2-3 paragraphs)",
  "followUpQuestions": ["3 relevant questions to deepen understanding"],
  "careerAnalyses": {
    "career_title": {
      "reasoning": "why this career matches their needs",
      "strengths": ["what makes this a good fit"],
      "considerations": ["things to think about"],
      "nextSteps": ["concrete actions they could take"]
    }
  }
}`;

    try {
      const response = await anthropicClient.generateStructuredResponse<{
        message: string;
        followUpQuestions: string[];
        careerAnalyses: Record<string, AICareerAnalysis>;
      }>(this.systemPrompt, prompt, {});

      return {
        ...response,
        careerAnalyses: new Map(Object.entries(response.careerAnalyses)),
      };
    } catch (error) {
      console.error('AI response generation failed:', error);
      return {
        message: this.generateFallbackMessage(matchedCareers.length),
        followUpQuestions: this.generateFallbackQuestions(intent),
        careerAnalyses: new Map(),
      };
    }
  }

  async generateClarifyingQuestions(
    query: string,
    intent: EnhancedQueryIntent,
    conversationHistory: ChatMessage[]
  ): Promise<string[]> {
    const historyContext = this.buildHistoryContext(conversationHistory);

    const prompt = `The user asked: "${query}"

${historyContext}

Their query is unclear or needs more information. Generate 3 thoughtful, specific clarifying questions to better understand their career needs. Focus on:
- What matters most to them (growth, impact, flexibility, income)
- Their background and experience level
- Specific constraints or preferences
- What they're trying to avoid or move towards

Return JSON array of strings:
["question 1", "question 2", "question 3"]`;

    try {
      return await anthropicClient.generateStructuredResponse<string[]>(
        this.systemPrompt,
        prompt,
        {}
      );
    } catch (error) {
      console.error('AI clarification generation failed:', error);
      return [
        'What aspects of your work are most important to you?',
        'Can you tell me about your background and experience?',
        'Are there any specific requirements or constraints for your next role?',
      ];
    }
  }

  private buildHistoryContext(history: ChatMessage[]): string {
    if (history.length === 0) return 'This is the start of the conversation.';

    const recentHistory = history.slice(-6);
    const context = recentHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    return `Conversation history:\n${context}`;
  }

  private generateFallbackMessage(careerCount: number): string {
    if (careerCount === 0) {
      return "I couldn't find careers that exactly match your criteria, but let's explore some related options. Could you tell me more about what you're looking for?";
    }

    if (careerCount === 1) {
      return "I found one career that matches your interests. Let me share why this might be a good fit for you.";
    }

    return `I found ${careerCount} careers that could be great matches for you. Let me walk you through why each of these might align with what you're looking for.`;
  }

  private generateFallbackQuestions(intent: EnhancedQueryIntent): string[] {
    const questions: string[] = [];

    if (!intent.filters.skills || intent.filters.skills.length === 0) {
      questions.push('What are your strongest skills or areas of expertise?');
    }

    if (!intent.constraints?.salary) {
      questions.push('Do you have any salary expectations or requirements?');
    }

    if (!intent.filters.workEnvironment || intent.filters.workEnvironment.length === 0) {
      questions.push('Do you prefer remote work, in-office, or a hybrid setup?');
    }

    if (questions.length < 3) {
      questions.push('What matters most to you in your next career move?');
    }

    return questions.slice(0, 3);
  }
}

export const careerChatAI = new CareerChatAI();
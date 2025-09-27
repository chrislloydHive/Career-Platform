import { NextRequest, NextResponse } from 'next/server';
import { queryProcessor } from '@/lib/chat/query-processor';
import { careerMatcher } from '@/lib/chat/career-matcher';
import { careerChatAI } from '@/lib/ai/career-chat-ai';
import { anthropicClient } from '@/lib/ai/anthropic-client';
import { ChatQuery, ChatResponse } from '@/types/chat';
import { getUserProfile, buildUserContextPrompt, addInteraction } from '@/lib/storage/user-profile';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ChatQuery;
    const { text, context } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query text is required' },
        { status: 400 }
      );
    }

    const conversationHistory = context?.previousMessages || [];
    const useAI = anthropicClient.isAvailable();

    const userProfile = await getUserProfile();
    const userContext = buildUserContextPrompt(userProfile);

    await addInteraction('chat_query', text);

    let intent;
    let message: string;
    let followUpQuestions: string[];
    let suggestions;
    let aiEnhanced = false;

    if (useAI) {
      try {
        const enhancedIntent = await careerChatAI.enhanceQueryUnderstanding(
          text,
          conversationHistory,
          userContext
        );

        intent = enhancedIntent;
        suggestions = await careerMatcher.findMatchingCareers(intent);

        if (suggestions.length === 0 && enhancedIntent.clarificationsNeeded && enhancedIntent.clarificationsNeeded.length > 0) {
          message = "I'd like to understand your needs better to find the right careers for you.";
          followUpQuestions = enhancedIntent.clarificationsNeeded;
        } else {
          const aiResponse = await careerChatAI.generatePersonalizedResponse(
            text,
            enhancedIntent,
            suggestions.map(s => s.career),
            conversationHistory,
            userContext
          );

          message = aiResponse.message;
          followUpQuestions = aiResponse.followUpQuestions;

          suggestions = suggestions.map(suggestion => {
            const analysis = aiResponse.careerAnalyses.get(suggestion.career.title);
            if (analysis) {
              return {
                ...suggestion,
                reasoning: analysis.reasoning,
              };
            }
            return suggestion;
          });
        }

        aiEnhanced = true;
      } catch (error) {
        console.error('AI enhancement failed, falling back to rule-based:', error);
        intent = queryProcessor.processQuery(text);
        suggestions = await careerMatcher.findMatchingCareers(intent);
        message = queryProcessor.generateResponseMessage(intent, suggestions.length);
        followUpQuestions = queryProcessor.generateFollowUpQuestions(intent, suggestions.length);
      }
    } else {
      intent = queryProcessor.processQuery(text);
      suggestions = await careerMatcher.findMatchingCareers(intent);
      message = queryProcessor.generateResponseMessage(intent, suggestions.length);
      followUpQuestions = queryProcessor.generateFollowUpQuestions(intent, suggestions.length);
    }

    const response: ChatResponse = {
      message,
      suggestions,
      followUpQuestions,
      clarificationNeeded: suggestions.length === 0,
      extractedIntent: intent,
      aiEnhanced,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
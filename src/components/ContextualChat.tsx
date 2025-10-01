'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChatMessage } from '@/types/chat';
import { InteractionTracker } from '@/lib/adaptive-questions/interaction-tracker';

interface ContextualChatProps {
  context: 'assessment' | 'careers' | 'jobs';
  contextData?: {
    careerTitle?: string;
    jobTitle?: string;
    questionNumber?: number;
    totalQuestions?: number;
    searchQuery?: string;
    location?: string;
  };
}

export function ContextualChat({ context, contextData }: ContextualChatProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with context-specific welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = getWelcomeMessage(context, contextData);
      setMessages([welcomeMessage]);
    }
  }, [context, contextData, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function getWelcomeMessage(ctx: string, data?: typeof contextData): ChatMessage {
    let content = '';
    let followUpQuestions: string[] = [];

    switch (ctx) {
      case 'assessment':
        content = `Hey! I'm here to help you with the assessment. ${data?.questionNumber ? `You're on question ${data.questionNumber} of ${data.totalQuestions}.` : ''}\n\nFeel free to ask me anything about the questions, what they mean, or what happens next!`;
        followUpQuestions = [
          'What if I\'m not sure how to answer this?',
          'Can I change my answers later?',
          'How will my answers be used?',
        ];
        break;
      case 'careers':
        content = data?.careerTitle
          ? `I see you're looking at **${data.careerTitle}**. Want to know more about what this role actually involves day-to-day? Ask me anything!`
          : 'Exploring careers? I can help you understand what different roles actually involve, what skills you need, and how to get started. What would you like to know?';
        followUpQuestions = [
          data?.careerTitle ? `What does a ${data.careerTitle} do all day?` : 'What are good entry-level careers?',
          'What skills do I need to develop?',
          'What\'s the career growth path like?',
        ];
        break;
      case 'jobs':
        content = data?.searchQuery
          ? `Looking for "${data.searchQuery}" jobs${data.location ? ` in ${data.location}` : ''}? I can help you understand if roles are right for you, how to apply, and interview prep.`
          : 'Job searching can be overwhelming. I\'m here to help you evaluate roles, craft applications, and prepare for interviews. What do you need help with?';
        followUpQuestions = [
          'Is this role actually entry-level?',
          'How do I know if I\'m qualified?',
          'What should I include in my application?',
        ];
        break;
    }

    return {
      id: '1',
      role: 'assistant',
      content,
      timestamp: new Date(),
      followUpQuestions,
    };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    InteractionTracker.trackChatTopic(input);

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context message to send to API
      let contextMessage = `User is on the ${context} page. `;
      if (contextData?.careerTitle) contextMessage += `Viewing career: ${contextData.careerTitle}. `;
      if (contextData?.jobTitle) contextMessage += `Viewing job: ${contextData.jobTitle}. `;
      if (contextData?.questionNumber) contextMessage += `On assessment question ${contextData.questionNumber} of ${contextData.totalQuestions}. `;
      if (contextData?.searchQuery) contextMessage += `Searching for: ${contextData.searchQuery}${contextData.location ? ` in ${contextData.location}` : ''}. `;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: input,
          context: {
            page: context,
            pageData: contextData,
            contextMessage,
            previousMessages: messages.slice(-6).map(m => ({
              role: m.role,
              content: m.content,
            })),
          },
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to use chat');
        }
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        suggestions: data.suggestions,
        followUpQuestions: data.followUpQuestions,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof Error && error.message.includes('sign in')
          ? "Please sign in to chat with me!"
          : "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpClick = (question: string) => {
    setInput(question);
  };

  const getContextIcon = () => {
    switch (context) {
      case 'assessment':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'careers':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'jobs':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
    }
  };

  // Don't render for unauthenticated users
  if (!session) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all ${
          isOpen
            ? 'bg-gray-700 text-gray-300'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        title={isOpen ? 'Close chat' : 'Ask AI for help'}
      >
        {getContextIcon()}
        {!isOpen && <span className="font-medium hidden sm:inline">Ask AI</span>}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-gray-800 rounded-lg border-2 border-gray-700 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              {getContextIcon()}
              <h3 className="font-semibold text-gray-100">AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
                  <div className={`rounded-lg p-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.followUpQuestions.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleFollowUpClick(question)}
                          className="block w-full text-left text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-gray-700/50 transition-colors"
                        >
                          → {question}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 bg-gray-700 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

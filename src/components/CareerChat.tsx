'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, CareerSuggestion } from '@/types/chat';
import Link from 'next/link';
import { InteractionTracker } from '@/lib/adaptive-questions/interaction-tracker';

export function CareerChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI career advisor. I'm here to help you discover careers that match your unique interests, skills, and goals.\n\nI can help you explore questions like:\n• What careers combine my interests in marketing and healthcare?\n• I want to work remotely but still help people—what are my options?\n• Show me roles where I can use my training and teaching background\n• What careers offer good work-life balance in tech?\n\nJust ask naturally, and I'll guide you toward careers that could be a great fit.",
      timestamp: new Date(),
      followUpQuestions: [
        'What are your strongest skills or interests?',
        'What matters most to you in a career?',
        'Tell me about your background and experience',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: input,
          context: {
            previousMessages: messages.slice(-6).map(m => ({
              role: m.role,
              content: m.content,
            })),
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

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
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
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

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl ${message.role === 'user' ? 'ml-12' : 'mr-12'}`}>
              <div className={`rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>

              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-400 font-medium">Career Suggestions:</p>
                  {message.suggestions.map((suggestion, idx) => (
                    <CareerSuggestionCard key={idx} suggestion={suggestion} />
                  ))}
                </div>
              )}

              {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-400 font-medium">You might also ask:</p>
                  <div className="flex flex-wrap gap-2">
                    {message.followUpQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleFollowUpClick(question)}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors text-left"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about careers... I'll understand natural language!"
            className="flex-1 px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function CareerSuggestionCard({ suggestion }: { suggestion: CareerSuggestion }) {
  const { career, relevanceScore, reasoning, matchedKeywords } = suggestion;

  const handleCareerClick = () => {
    InteractionTracker.trackCareerViewed(career.title, {
      industry: career.category,
      skills: career.requiredSkills?.map(s => s.skill) || [],
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-blue-500 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <Link
            href={`/careers?id=${career.id}`}
            onClick={handleCareerClick}
            className="text-lg font-semibold text-gray-100 hover:text-blue-400 transition-colors"
          >
            {career.title}
          </Link>
          <p className="text-sm text-gray-400 mt-1">{career.category}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
            relevanceScore >= 70
              ? 'bg-blue-900/50 text-blue-300'
              : relevanceScore >= 50
              ? 'bg-blue-800/50 text-blue-400'
              : 'bg-blue-700/50 text-blue-500'
          }`}>
            {relevanceScore}% Match
          </div>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{career.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {matchedKeywords.map((keyword, idx) => (
            <span key={idx} className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded">
              {keyword}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-400 italic">{reasoning}</p>
      </div>

      {career.salaryRanges && career.salaryRanges.length > 0 && (
        <div className="mt-2 text-sm text-gray-400">
          Salary: ${career.salaryRanges[0].min.toLocaleString()} - ${career.salaryRanges[0].max.toLocaleString()}
        </div>
      )}
    </div>
  );
}
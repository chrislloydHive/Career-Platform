'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { CareerChat } from '@/components/CareerChat';

export default function ChatPage() {
  const { data: session, status } = useSession();

  // Show sign-in prompt for guest users
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation title="Career Chat" subtitle="AI-powered career guidance" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-100 mb-3">Sign in to Chat with AI</h2>
              <p className="text-gray-400 mb-6">
                Create an account or sign in to get personalized career guidance from our AI assistant.
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/login"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title="Career Chat"
        subtitle="Got questions? I've got answers (and probably some bad jokes)"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CareerChat />
      </main>
    </div>
  );
}
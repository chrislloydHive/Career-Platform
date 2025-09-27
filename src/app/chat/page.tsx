'use client';

import { Navigation } from '@/components/Navigation';
import { CareerChat } from '@/components/CareerChat';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title="Career Chat"
        subtitle="Ask me anything about careers and get personalized suggestions"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CareerChat />
      </main>
    </div>
  );
}
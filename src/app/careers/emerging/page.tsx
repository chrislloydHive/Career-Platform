'use client';

import { EmergingRolesDiscovery } from '@/components/EmergingRolesDiscovery';
import Link from 'next/link';

export default function EmergingRolesPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Emerging Roles Discovery</h1>
              <p className="text-sm text-gray-400">Explore cutting-edge career opportunities</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/careers"
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Careers
              </Link>
              <Link
                href="/career-match"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Career Matching
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmergingRolesDiscovery />
      </main>
    </div>
  );
}
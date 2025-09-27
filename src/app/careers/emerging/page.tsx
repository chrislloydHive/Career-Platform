'use client';

import { Navigation } from '@/components/Navigation';
import { EmergingRolesDiscovery } from '@/components/EmergingRolesDiscovery';
import Link from 'next/link';

export default function EmergingRolesPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title="Emerging Roles"
        subtitle="Discover cutting-edge career opportunities"
        actions={
          <Link
            href="/career-match"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Career Match
          </Link>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmergingRolesDiscovery />
      </main>
    </div>
  );
}
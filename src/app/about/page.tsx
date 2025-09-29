import Link from 'next/link';
import { Navigation } from '@/components/Navigation';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-100 mb-6">
            About Career Platform
          </h1>
          <p className="text-xl text-gray-400">
            Empowering professionals to discover their ideal career path through AI-driven insights
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Career Platform leverages artificial intelligence and behavioral science to help professionals
              make informed career decisions. We believe that everyone deserves to find work that aligns
              with their unique strengths, interests, and values.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Through our adaptive assessment technology and comprehensive career research tools, we provide
              personalized guidance that goes beyond traditional career advice to deliver actionable insights
              for your professional journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-bold text-blue-400 mb-3">Science-Based Approach</h3>
              <p className="text-gray-400">
                Our assessments are built on validated psychological frameworks and continuously
                refined using machine learning to provide the most accurate career insights.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-bold text-green-400 mb-3">Personalized Experience</h3>
              <p className="text-gray-400">
                Every recommendation is tailored to your unique profile, considering your background,
                goals, and preferences to provide relevant career guidance.
              </p>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold text-blue-300 mb-4">Ready to Get Started?</h3>
            <p className="text-gray-300 mb-6">
              Join thousands of professionals who have discovered their ideal career path with our platform.
            </p>
            <Link
              href="/signup"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Start Your Career Discovery
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
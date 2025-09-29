'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';

export default function Homepage() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('currentUser');
    setCurrentUser(user);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-100 mb-6 leading-tight">
              Discover Your Ideal
              <span className="block text-blue-400">Career Path</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Through AI-powered assessment and personalized research, find the career that
              truly aligns with your skills, interests, and aspirations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={currentUser ? "/explore" : "/signup"}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-blue-600/25"
              >
                Start Your Career Discovery
              </Link>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-gray-200 rounded-lg text-lg font-semibold transition-colors"
              >
                Learn How It Works
              </button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-green-600/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              Three Steps to Career Clarity
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Our AI-driven platform guides you through a comprehensive career discovery process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center hover:border-blue-600/50 transition-colors">
              <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-4">
                Adaptive Self Discovery Assessment
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Take our intelligent assessment that adapts to your responses, uncovering your unique
                strengths, interests, and work preferences with scientific precision.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center hover:border-blue-600/50 transition-colors">
              <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-4">
                AI Career Research Assistant
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Get comprehensive insights into career paths, including industry trends, salary data,
                required skills, and growth opportunities tailored to your profile.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center hover:border-blue-600/50 transition-colors">
              <div className="w-16 h-16 bg-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-4">
                Personalized Job Matching
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Discover opportunities that align with your career goals, skills, and preferences
                through our intelligent matching algorithm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              A simple, science-backed process to unlock your career potential
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-3">
                Complete Assessment
              </h3>
              <p className="text-gray-400 text-sm">
                Take our adaptive questionnaire that learns about your personality, skills, and career preferences
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-3">
                Receive Matches
              </h3>
              <p className="text-gray-400 text-sm">
                Get personalized career recommendations based on your unique profile and market data
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-3">
                Explore Insights
              </h3>
              <p className="text-gray-400 text-sm">
                Dive deep into career paths with industry context, salary data, and skill requirements
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-3">
                Take Action
              </h3>
              <p className="text-gray-400 text-sm">
                Follow your personalized action plan with concrete next steps and resources
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">
              Trusted by Career Changers
            </h2>
            <p className="text-gray-400 mb-12">
              Join those who have discovered their ideal career path
            </p>

            {/* Placeholder for testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                  <img
                    src="/images/louisa-testimonial.png"
                    alt="Louisa"
                    className="w-full h-full object-cover scale-150"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) parent.className = 'w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center';
                      const fallback = document.createElement('span');
                      fallback.textContent = 'L';
                      fallback.className = 'text-3xl font-bold text-gray-300';
                      if (parent) parent.appendChild(fallback);
                    }}
                  />
                </div>
                <p className="text-gray-400 italic mb-4">
                  &quot;I discovered a career I didn&apos;t know existed and found my future on Career Platform.&quot;
                </p>
                <p className="text-gray-300 font-semibold">Louisa</p>
                <p className="text-gray-500 text-sm">Career Discovery Success</p>
              </div>

              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400 italic mb-4">
                  &quot;The industry insights and salary data helped me make an informed career decision.&quot;
                </p>
                <p className="text-gray-300 font-semibold">Coming Soon</p>
                <p className="text-gray-500 text-sm">User Testimonials</p>
              </div>

              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400 italic mb-4">
                  &quot;Finally found a platform that understands career change isn&apos;t just about jobs—it&apos;s about fit.&quot;
                </p>
                <p className="text-gray-300 font-semibold">Coming Soon</p>
                <p className="text-gray-500 text-sm">User Testimonials</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-100 mb-6">
            Ready to Discover Your Path?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Start your career discovery journey today with our free assessment
          </p>
          <Link
            href={currentUser ? "/explore" : "/signup"}
            className="inline-block px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xl font-semibold transition-colors shadow-lg hover:shadow-blue-600/25"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">
                Career Platform
              </h3>
              <p className="text-gray-400 mb-4 max-w-md">
                AI-powered career discovery platform helping professionals find their ideal career path
                through scientific assessment and personalized insights.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-100 mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/explore" className="hover:text-gray-300 transition-colors">Assessment</Link></li>
                <li><Link href="/careers" className="hover:text-gray-300 transition-colors">Career Explorer</Link></li>
                <li><Link href="/progress" className="hover:text-gray-300 transition-colors">Progress Tracking</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-100 mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-gray-300 transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; 2024 Career Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
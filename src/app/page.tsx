'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Logo } from '@/components/Logo';

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
              <span className="block text-gray-400 text-3xl md:text-4xl mb-2">&ldquo;I have no idea what I want to do&rdquo;</span>
              <span className="block mt-4">Yeah, we hear that a lot.</span>
              <span className="block text-blue-400 mt-2">Let&apos;s figure it out together.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
              You graduated (congrats!). Maybe you took the first job you could get. Maybe you hate it. Maybe you&apos;re just... confused about what comes next. That&apos;s why you&apos;re here.
            </p>

            <p className="text-lg text-blue-400 mb-8 max-w-2xl mx-auto font-medium">
              You don&apos;t need it all figured out. Your first role doesn&apos;t define your career. It&apos;s totally okay to explore.
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

      {/* Pain Points Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              Sound Familiar?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              You're not alone in the "what now?" moment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Pain Point 1 */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center hover:border-blue-600/50 transition-colors">
              <div className="text-5xl mb-4">😬</div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">
                "Hate your first job?"
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Well, I thought I wanted to be an accountant... until I started working as an accountant. Now what?
              </p>
            </div>

            {/* Pain Point 2 */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center hover:border-blue-600/50 transition-colors">
              <div className="text-5xl mb-4">🤷</div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">
                "Not sure what to apply for?"
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Your degree said "career options" but forgot to mention what those actually are. Plot twist: there are jobs you've never even heard of.
              </p>
            </div>

            {/* Pain Point 3 */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center hover:border-blue-600/50 transition-colors">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">
                "Don't know what jobs match your degree?"
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Spoiler alert: your psychology degree can lead to way more than just being a therapist. Who knew?
              </p>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              Here's How We Help
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Build your profile → AI analyzes → Take assessment (optional) → Get matched → Search for jobs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center hover:border-blue-600/50 transition-colors">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-4">
                Build Your Profile
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Upload your resume, share your LinkedIn, tell us about yourself. The more we know, the better we can help.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center hover:border-blue-600/50 transition-colors">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-4">
                AI Analyzes You
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Our AI reads everything you shared and builds a comprehensive profile of your skills, interests, and potential career paths.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center hover:border-blue-600/50 transition-colors">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-4">
                Get Matched to Roles
              </h3>
              <p className="text-gray-400 leading-relaxed">
                See job functions and specific titles that actually match your profile (not just what your degree says you should do).
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center hover:border-green-600/50 transition-colors">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-lg">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-4">
                Search for Jobs
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Start applying to roles that fit. Your profile keeps learning from every interaction to get better recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">
              Real Talk from Recent Grads
            </h2>
            <p className="text-gray-400 mb-12">
              You're not the only one figuring this out
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
                  &quot;Turns out there are jobs that let me do the parts of marketing I like without the parts I hate. Who knew that was a thing?&quot;
                </p>
                <p className="text-gray-300 font-semibold">Louisa</p>
                <p className="text-gray-500 text-sm">Recent Grad, Now UX Researcher</p>
              </div>

              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-300">M</span>
                </div>
                <p className="text-gray-400 italic mb-4">
                  &quot;My English degree apparently qualifies me for like 50 different jobs. This actually helped me narrow it down.&quot;
                </p>
                <p className="text-gray-300 font-semibold">Marcus</p>
                <p className="text-gray-500 text-sm">1 Year Out, Content Strategist</p>
              </div>

              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-300">S</span>
                </div>
                <p className="text-gray-400 italic mb-4">
                  &quot;Six months into my first job I was like 'this is it?' Now I'm actually excited about Mondays. Plot twist.&quot;
                </p>
                <p className="text-gray-300 font-semibold">Sarah</p>
                <p className="text-gray-500 text-sm">Career Switcher, Product Analyst</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-100 mb-6">
            Ready to Figure Out What's Next?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Takes about 10 minutes. Free. No more "I guess I'll just apply to everything and see what happens."
          </p>
          <Link
            href={currentUser ? "/explore" : "/signup"}
            className="inline-block px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xl font-semibold transition-colors shadow-lg hover:shadow-blue-600/25"
          >
            Start the Assessment
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="mb-4">
                <Logo size="lg" linkToHome={false} />
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Helping recent grads and early career professionals answer the "what now?" question.
                Because your first job doesn't have to be your forever job.
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
            <p>&copy; 2024 MyNextRole. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
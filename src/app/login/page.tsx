'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

const INSPIRING_QUOTES = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Choose a job you love, and you will never have to work a day in your life.",
    author: "Confucius"
  },
  {
    text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    author: "Steve Jobs"
  },
  {
    text: "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.",
    author: "Albert Schweitzer"
  },
  {
    text: "Find out what you like doing best and get someone to pay you for doing it.",
    author: "Katharine Whitehorn"
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi"
  },
  {
    text: "Your career is a journey, not a destination. Enjoy the ride.",
    author: "Anonymous"
  },
  {
    text: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller"
  }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState(INSPIRING_QUOTES[0]);
  const router = useRouter();

  useEffect(() => {
    const randomQuote = INSPIRING_QUOTES[Math.floor(Math.random() * INSPIRING_QUOTES.length)];
    setQuote(randomQuote);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
            <Logo size="lg" />
            <div className="w-16"></div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              Sign In
            </h1>
            <p className="text-gray-400 text-sm">
              Continue your career journey
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <svg className="w-6 h-6 text-blue-400 mb-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <p className="text-gray-300 text-center text-sm leading-relaxed mb-2 italic">
              &ldquo;{quote.text}&rdquo;
            </p>
            <p className="text-blue-400 text-center text-xs font-medium">
              — {quote.author}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 text-gray-100 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
                  autoFocus
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 text-gray-100 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-800/50 text-gray-400">New here?</span>
                </div>
              </div>

              <Link
                href="/signup"
                className="block w-full text-center px-4 py-3 bg-gray-700/50 text-gray-200 rounded-xl hover:bg-gray-700 font-medium transition-all active:scale-[0.98]"
              >
                Create Account
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
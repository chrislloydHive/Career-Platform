import { Navigation } from '@/components/Navigation';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-100 mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-400">
            Last updated: December 2024
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none space-y-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Account information (name, email address)</li>
              <li>Assessment responses and career preferences</li>
              <li>Professional background and education details</li>
              <li>Resume and profile information (when provided)</li>
              <li>Usage data and platform interactions</li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Provide personalized career recommendations and insights</li>
              <li>Improve our assessment algorithms and matching accuracy</li>
              <li>Send you relevant career opportunities and platform updates</li>
              <li>Analyze usage patterns to enhance our services</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Information Sharing</h2>
            <p className="text-gray-300 leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties
              without your consent, except as described in this policy. We may share your information
              with trusted service providers who assist us in operating our platform, conducting
              business, or serving you.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement appropriate security measures to protect your personal information against
              unauthorized access, alteration, disclosure, or destruction. This includes encryption
              of sensitive data and regular security assessments.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
              <li>Lodge a complaint with supervisory authorities</li>
            </ul>
          </div>

          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-300 mb-3">Contact Us</h3>
            <p className="text-gray-300">
              If you have any questions about this Privacy Policy or our data practices,
              please contact us at privacy@careerplatform.com
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
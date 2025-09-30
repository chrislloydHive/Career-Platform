import { Navigation } from '@/components/Navigation';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-100 mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-400">
            Last updated: December 2024
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none space-y-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using MyNextRole, you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to abide by the above, please do
              not use this service.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Use License</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Permission is granted to temporarily use MyNextRole for personal, non-commercial
              transitory viewing only. This is the grant of a license, not a transfer of title, and
              under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to decompile or reverse engineer any software contained on the platform</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">User Account</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              To access certain features of our platform, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your password and identification</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Content and Conduct</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You are responsible for all content you submit to the platform. You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Submit false or misleading information</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Interfere with the platform&apos;s operation or security</li>
              <li>Use the platform for any unlawful purposes</li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Service Availability</h2>
            <p className="text-gray-300 leading-relaxed">
              We strive to provide continuous service availability but do not guarantee uninterrupted
              access. We reserve the right to modify, suspend, or discontinue the service at any time
              without notice. We are not liable for any interruption of service.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Disclaimer</h2>
            <p className="text-gray-300 leading-relaxed">
              MyNextRole provides career guidance and recommendations for informational purposes only.
              We do not guarantee employment outcomes or career success. Users are responsible for making
              their own career decisions based on their personal circumstances and professional judgment.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              In no event shall MyNextRole or its suppliers be liable for any damages (including,
              without limitation, damages for loss of data or profit, or due to business interruption)
              arising out of the use or inability to use the materials on our platform.
            </p>
          </div>

          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-300 mb-3">Contact Information</h3>
            <p className="text-gray-300">
              If you have any questions about these Terms of Service, please contact us at
              legal@mynextrole.com
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingData, ONBOARDING_STEPS, CAREER_GOALS } from '@/types/onboarding';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({
    workExperience: {},
    education: {},
    location: {},
    stepsCompleted: [],
    isComplete: false
  });

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('currentUser');
    if (!user) {
      router.push('/login');
    }

    // Check if onboarding was already completed
    const existingData = localStorage.getItem('onboardingData');
    if (existingData) {
      const parsed = JSON.parse(existingData);
      if (parsed.isComplete) {
        router.push('/explore');
      } else {
        setOnboardingData(parsed);
        setCurrentStep(parsed.stepsCompleted.length + 1);
      }
    }
  }, [router]);

  const saveProgress = (data: Partial<OnboardingData>) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    localStorage.setItem('onboardingData', JSON.stringify(updatedData));
  };

  const completeStep = (stepData: Record<string, unknown>) => {
    const updatedData = {
      ...onboardingData,
      ...stepData,
      stepsCompleted: [...(onboardingData.stepsCompleted || []), currentStep]
    };

    setOnboardingData(updatedData);
    localStorage.setItem('onboardingData', JSON.stringify(updatedData));

    if (currentStep < ONBOARDING_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const skipStep = () => {
    const updatedData = {
      ...onboardingData,
      stepsCompleted: [...(onboardingData.stepsCompleted || []), currentStep]
    };

    setOnboardingData(updatedData);
    localStorage.setItem('onboardingData', JSON.stringify(updatedData));

    if (currentStep < ONBOARDING_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const completeOnboarding = () => {
    const completedData = {
      ...onboardingData,
      completedAt: new Date(),
      isComplete: true,
      stepsCompleted: ONBOARDING_STEPS.map(step => step.id)
    };

    setOnboardingData(completedData);
    localStorage.setItem('onboardingData', JSON.stringify(completedData));

    // Redirect to main platform
    router.push('/explore');
  };

  const currentStepData = ONBOARDING_STEPS.find(step => step.id === currentStep);
  const progress = (currentStep / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header with Progress */}
      <header className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-400">Career Platform</h1>
              <p className="text-gray-400">Getting Started</p>
            </div>
            <div className="text-sm text-gray-400">
              Step {currentStep} of {ONBOARDING_STEPS.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {currentStep === 1 && (
            <WelcomeStep onNext={() => completeStep({})} />
          )}

          {currentStep === 2 && (
            <BackgroundStep
              data={onboardingData}
              onNext={completeStep}
              onSkip={skipStep}
            />
          )}

          {currentStep === 3 && (
            <ProfileStep
              data={onboardingData}
              onNext={completeStep}
              onSkip={skipStep}
            />
          )}

          {currentStep === 4 && (
            <GoalsStep
              data={onboardingData}
              onNext={completeStep}
            />
          )}

          {currentStep === 5 && (
            <CompletionStep onComplete={completeOnboarding} />
          )}
        </div>
      </main>
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-8">
        <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <h2 className="text-4xl font-bold text-gray-100 mb-6">
        Welcome to Your Career Journey
      </h2>

      <p className="text-xl text-gray-300 mb-8 leading-relaxed">
        We&apos;ll help you discover your ideal career path through personalized assessment and research.
        This quick setup will take about 3-5 minutes and will help us provide better recommendations.
      </p>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8 text-left">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">What to Expect:</h3>
        <ul className="space-y-3 text-gray-300">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
            <span>Share your background and experience (optional)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
            <span>Upload resume or LinkedIn for better personalization (optional)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</span>
            <span>Tell us about your career goals</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">4</span>
            <span>Start your personalized career discovery</span>
          </li>
        </ul>
      </div>

      <button
        onClick={onNext}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold transition-colors shadow-lg"
      >
        Let&apos;s Get Started
      </button>
    </div>
  );
}

function BackgroundStep({
  data,
  onNext,
  onSkip
}: {
  data: Partial<OnboardingData>;
  onNext: (data: Record<string, unknown>) => void;
  onSkip: () => void;
}) {
  const [formData, setFormData] = useState({
    workExperience: {
      yearsOfExperience: data.workExperience?.yearsOfExperience || '',
      currentRole: data.workExperience?.currentRole || '',
      currentCompany: data.workExperience?.currentCompany || '',
      industry: data.workExperience?.industry || ''
    },
    education: {
      highestDegree: data.education?.highestDegree || '',
      fieldOfStudy: data.education?.fieldOfStudy || '',
      graduationYear: data.education?.graduationYear || ''
    },
    location: {
      currentLocation: data.location?.currentLocation || '',
      willingToRelocate: data.location?.willingToRelocate || false,
      preferredLocations: data.location?.preferredLocations || []
    }
  });

  const handleSubmit = () => {
    onNext(formData);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-100 mb-4">
          Tell Us About Your Background
        </h2>
        <p className="text-gray-400">
          This information helps us provide more personalized career recommendations. All fields are optional.
        </p>
      </div>

      <div className="space-y-8">
        {/* Work Experience */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Work Experience</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Years of Experience
              </label>
              <select
                value={formData.workExperience.yearsOfExperience}
                onChange={(e) => setFormData({
                  ...formData,
                  workExperience: { ...formData.workExperience, yearsOfExperience: e.target.value }
                })}
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="0-1">0-1 years</option>
                <option value="2-5">2-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="11-15">11-15 years</option>
                <option value="16+">16+ years</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Role
              </label>
              <input
                type="text"
                value={formData.workExperience.currentRole}
                onChange={(e) => setFormData({
                  ...formData,
                  workExperience: { ...formData.workExperience, currentRole: e.target.value }
                })}
                placeholder="e.g. Software Engineer, Marketing Manager"
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Company
              </label>
              <input
                type="text"
                value={formData.workExperience.currentCompany}
                onChange={(e) => setFormData({
                  ...formData,
                  workExperience: { ...formData.workExperience, currentCompany: e.target.value }
                })}
                placeholder="Company name"
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Industry
              </label>
              <input
                type="text"
                value={formData.workExperience.industry}
                onChange={(e) => setFormData({
                  ...formData,
                  workExperience: { ...formData.workExperience, industry: e.target.value }
                })}
                placeholder="e.g. Technology, Healthcare, Finance"
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Education</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Highest Degree
              </label>
              <select
                value={formData.education.highestDegree}
                onChange={(e) => setFormData({
                  ...formData,
                  education: { ...formData.education, highestDegree: e.target.value }
                })}
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="high_school">High School</option>
                <option value="associates">Associate&apos;s Degree</option>
                <option value="bachelors">Bachelor&apos;s Degree</option>
                <option value="masters">Master&apos;s Degree</option>
                <option value="doctorate">Doctorate/PhD</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Field of Study
              </label>
              <input
                type="text"
                value={formData.education.fieldOfStudy}
                onChange={(e) => setFormData({
                  ...formData,
                  education: { ...formData.education, fieldOfStudy: e.target.value }
                })}
                placeholder="e.g. Computer Science, Business"
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Graduation Year
              </label>
              <input
                type="text"
                value={formData.education.graduationYear}
                onChange={(e) => setFormData({
                  ...formData,
                  education: { ...formData.education, graduationYear: e.target.value }
                })}
                placeholder="e.g. 2020"
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Location Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Location
              </label>
              <input
                type="text"
                value={formData.location.currentLocation}
                onChange={(e) => setFormData({
                  ...formData,
                  location: { ...formData.location, currentLocation: e.target.value }
                })}
                placeholder="e.g. San Francisco, CA"
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="relocate"
                checked={formData.location.willingToRelocate}
                onChange={(e) => setFormData({
                  ...formData,
                  location: { ...formData.location, willingToRelocate: e.target.checked }
                })}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="relocate" className="text-gray-300">
                I&apos;m willing to relocate for the right opportunity
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onSkip}
          className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg font-medium hover:border-gray-500 hover:text-gray-200 transition-colors"
        >
          Skip This Step
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function ProfileStep({
  data,
  onNext,
  onSkip
}: {
  data: Partial<OnboardingData>;
  onNext: (data: Record<string, unknown>) => void;
  onSkip: () => void;
}) {
  const [formData, setFormData] = useState({
    resumeUrl: data.resumeUrl || '',
    linkedinUrl: data.linkedinUrl || '',
    hasUploadedResume: data.hasUploadedResume || false
  });

  const handleSubmit = () => {
    onNext(formData);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-100 mb-4">
          Enhance Your Profile
        </h2>
        <p className="text-gray-400">
          Upload your resume or share your LinkedIn profile for more personalized recommendations.
          This step is optional but highly recommended.
        </p>
      </div>

      <div className="space-y-6">
        {/* Resume Upload */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Resume Upload</h3>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-200 mb-2">Upload Your Resume</h4>
            <p className="text-gray-400 text-sm mb-4">
              PDF, DOC, or DOCX files up to 5MB
            </p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Choose File
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Coming soon - File upload functionality will be available in the next update
            </p>
          </div>
        </div>

        {/* LinkedIn Profile */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">LinkedIn Profile</h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              We&apos;ll use this to better understand your professional background
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-300 mb-3">
            Why share your profile?
          </h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-600 rounded-full flex-shrink-0"></span>
              <span>More accurate career recommendations</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-600 rounded-full flex-shrink-0"></span>
              <span>Personalized skill gap analysis</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-600 rounded-full flex-shrink-0"></span>
              <span>Better job matching based on your experience</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-600 rounded-full flex-shrink-0"></span>
              <span>Customized learning path suggestions</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onSkip}
          className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg font-medium hover:border-gray-500 hover:text-gray-200 transition-colors"
        >
          Skip For Now
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function GoalsStep({
  data,
  onNext
}: {
  data: Partial<OnboardingData>;
  onNext: (data: Record<string, unknown>) => void;
}) {
  const [selectedGoal, setSelectedGoal] = useState<string>(data.primaryGoal || '');
  const [timeframe, setTimeframe] = useState<string>(data.timeframe || '');

  const handleSubmit = () => {
    if (!selectedGoal) return;

    onNext({
      primaryGoal: selectedGoal,
      timeframe: timeframe
    });
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-100 mb-4">
          What Brings You Here?
        </h2>
        <p className="text-gray-400">
          Help us understand your career goals so we can provide the most relevant guidance.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Select your primary goal:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CAREER_GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  selectedGoal === goal.id
                    ? 'border-blue-600 bg-blue-600/10 text-blue-300'
                    : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                }`}
              >
                <h4 className="font-medium mb-2">{goal.label}</h4>
                <p className="text-sm opacity-80">{goal.description}</p>
              </button>
            ))}
          </div>
        </div>

        {selectedGoal && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Timeline</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What&apos;s your timeframe for achieving this goal?
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select timeframe...</option>
                <option value="immediate">Immediately (within 1 month)</option>
                <option value="short_term">Short-term (1-6 months)</option>
                <option value="medium_term">Medium-term (6 months - 1 year)</option>
                <option value="long_term">Long-term (1-2 years)</option>
                <option value="exploring">Just exploring options</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          disabled={!selectedGoal}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function CompletionStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="text-center">
      <div className="w-24 h-24 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-8">
        <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h2 className="text-4xl font-bold text-gray-100 mb-6">
        Your Platform is Ready!
      </h2>

      <p className="text-xl text-gray-300 mb-8 leading-relaxed">
        Thank you for sharing that information. We&apos;ve personalized your career discovery
        platform based on your background and goals. You&apos;re ready to begin exploring!
      </p>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">What&apos;s Next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
            <h4 className="font-medium text-blue-300 mb-2">Start Self Discovery Assessment</h4>
            <p className="text-sm text-gray-400">
              Take our adaptive assessment to uncover your strengths, interests, and ideal career matches.
            </p>
          </div>
          <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/30">
            <h4 className="font-medium text-green-300 mb-2">Explore Career Database</h4>
            <p className="text-sm text-gray-400">
              Browse career paths, industry insights, and salary data to understand your options.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onComplete}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold transition-colors shadow-lg"
        >
          Start Self Discovery Assessment
        </button>
        <button
          onClick={() => window.location.href = '/careers'}
          className="px-8 py-4 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-gray-200 rounded-lg text-lg font-semibold transition-colors"
        >
          Explore Career Database
        </button>
      </div>
    </div>
  );
}
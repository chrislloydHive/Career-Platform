'use client';

import { useState } from 'react';
import { CareerFitScore } from '@/lib/matching/realtime-career-matcher';

interface SkillsGapAnalysisProps {
  topCareers: CareerFitScore[];
  userStrengths: string[];
  userExperience: string[];
}

interface SkillData {
  name: string;
  category: 'technical' | 'soft' | 'industry' | 'certification';
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  importance: 'critical' | 'important' | 'beneficial';
  timeToAcquire: string;
  resources: LearningResource[];
}

interface LearningResource {
  name: string;
  type: 'course' | 'certification' | 'book' | 'practice' | 'bootcamp';
  provider: string;
  duration: string;
  cost: 'free' | 'low' | 'medium' | 'high';
  url?: string;
}

interface SkillAnalysis {
  transferableSkills: SkillData[];
  skillsToAcquire: SkillData[];
  skillGapScore: number;
  readinessLevel: 'ready' | 'nearly-ready' | 'development-needed' | 'significant-gaps';
  estimatedTimeToReady: string;
}

const getSkillAnalysisForCareer = (career: CareerFitScore, userStrengths: string[]): SkillAnalysis => {
  const careerSkillsDatabase = getRequiredSkillsForCareer(career.careerTitle);

  // Analyze transferable skills
  const transferableSkills = careerSkillsDatabase.filter(skill =>
    userStrengths.some(strength =>
      isSkillTransferable(strength, skill.name)
    )
  );

  // Identify skills to acquire
  const skillsToAcquire = careerSkillsDatabase.filter(skill =>
    !transferableSkills.includes(skill)
  );

  // Calculate skill gap score (0-100, higher is better)
  const totalSkills = careerSkillsDatabase.length;
  const transferableCount = transferableSkills.length;
  const skillGapScore = Math.round((transferableCount / totalSkills) * 100);

  // Determine readiness level
  let readinessLevel: SkillAnalysis['readinessLevel'];
  if (skillGapScore >= 80) readinessLevel = 'ready';
  else if (skillGapScore >= 60) readinessLevel = 'nearly-ready';
  else if (skillGapScore >= 40) readinessLevel = 'development-needed';
  else readinessLevel = 'significant-gaps';

  // Estimate time to readiness
  const criticalSkillsToAcquire = skillsToAcquire.filter(s => s.importance === 'critical');
  const estimatedMonths = criticalSkillsToAcquire.reduce((total, skill) => {
    const months = skill.timeToAcquire.includes('month')
      ? parseInt(skill.timeToAcquire)
      : skill.timeToAcquire.includes('week')
        ? Math.ceil(parseInt(skill.timeToAcquire) / 4)
        : 6; // default
    return total + months;
  }, 0);

  const estimatedTimeToReady = estimatedMonths > 12
    ? `${Math.ceil(estimatedMonths / 12)} year${estimatedMonths > 24 ? 's' : ''}`
    : `${estimatedMonths} month${estimatedMonths > 1 ? 's' : ''}`;

  return {
    transferableSkills,
    skillsToAcquire,
    skillGapScore,
    readinessLevel,
    estimatedTimeToReady
  };
};

const getRequiredSkillsForCareer = (careerTitle: string): SkillData[] => {
  const skillsDatabase: Record<string, SkillData[]> = {
    'Software Engineer': [
      {
        name: 'Programming Languages (Python/JavaScript)',
        category: 'technical',
        proficiencyLevel: 'intermediate',
        importance: 'critical',
        timeToAcquire: '6 months',
        resources: [
          { name: 'Python for Everybody', type: 'course', provider: 'Coursera', duration: '8 weeks', cost: 'low' },
          { name: 'JavaScript: The Complete Guide', type: 'course', provider: 'Udemy', duration: '52 hours', cost: 'low' },
          { name: 'LeetCode Practice', type: 'practice', provider: 'LeetCode', duration: 'Ongoing', cost: 'free' }
        ]
      },
      {
        name: 'System Design',
        category: 'technical',
        proficiencyLevel: 'intermediate',
        importance: 'important',
        timeToAcquire: '4 months',
        resources: [
          { name: 'System Design Interview', type: 'book', provider: 'Amazon', duration: '3 weeks', cost: 'low' },
          { name: 'Designing Data-Intensive Applications', type: 'book', provider: 'Amazon', duration: '8 weeks', cost: 'low' }
        ]
      },
      {
        name: 'Problem Solving',
        category: 'soft',
        proficiencyLevel: 'intermediate',
        importance: 'critical',
        timeToAcquire: '3 months',
        resources: [
          { name: 'Algorithmic Thinking', type: 'course', provider: 'edX', duration: '6 weeks', cost: 'free' }
        ]
      }
    ],
    'Data Scientist': [
      {
        name: 'Statistical Analysis',
        category: 'technical',
        proficiencyLevel: 'intermediate',
        importance: 'critical',
        timeToAcquire: '4 months',
        resources: [
          { name: 'Statistics for Data Science', type: 'course', provider: 'Coursera', duration: '12 weeks', cost: 'medium' },
          { name: 'Introduction to Statistical Learning', type: 'book', provider: 'Free PDF', duration: '10 weeks', cost: 'free' }
        ]
      },
      {
        name: 'Machine Learning',
        category: 'technical',
        proficiencyLevel: 'intermediate',
        importance: 'critical',
        timeToAcquire: '6 months',
        resources: [
          { name: 'Machine Learning Course', type: 'course', provider: 'Coursera (Andrew Ng)', duration: '11 weeks', cost: 'medium' },
          { name: 'Hands-On Machine Learning', type: 'book', provider: 'Amazon', duration: '12 weeks', cost: 'low' }
        ]
      },
      {
        name: 'Python for Data Science',
        category: 'technical',
        proficiencyLevel: 'intermediate',
        importance: 'critical',
        timeToAcquire: '3 months',
        resources: [
          { name: 'Python Data Science Handbook', type: 'book', provider: 'Free Online', duration: '8 weeks', cost: 'free' }
        ]
      }
    ],
    'Product Manager': [
      {
        name: 'Product Strategy',
        category: 'industry',
        proficiencyLevel: 'intermediate',
        importance: 'critical',
        timeToAcquire: '4 months',
        resources: [
          { name: 'Product Management Fundamentals', type: 'course', provider: 'Google', duration: '6 weeks', cost: 'free' },
          { name: 'Inspired: How to Create Products Customers Love', type: 'book', provider: 'Amazon', duration: '3 weeks', cost: 'low' }
        ]
      },
      {
        name: 'User Research',
        category: 'industry',
        proficiencyLevel: 'intermediate',
        importance: 'important',
        timeToAcquire: '3 months',
        resources: [
          { name: 'UX Research Methods', type: 'course', provider: 'Coursera', duration: '8 weeks', cost: 'medium' }
        ]
      },
      {
        name: 'Cross-functional Leadership',
        category: 'soft',
        proficiencyLevel: 'intermediate',
        importance: 'critical',
        timeToAcquire: '6 months',
        resources: [
          { name: 'Leadership in Product Management', type: 'course', provider: 'LinkedIn Learning', duration: '4 weeks', cost: 'low' }
        ]
      }
    ]
    // Add more careers as needed
  };

  return skillsDatabase[careerTitle] || [
    {
      name: 'Industry Knowledge',
      category: 'industry',
      proficiencyLevel: 'intermediate',
      importance: 'important',
      timeToAcquire: '3 months',
      resources: [
        { name: 'Industry Research', type: 'practice', provider: 'Various', duration: 'Ongoing', cost: 'free' }
      ]
    }
  ];
};

const isSkillTransferable = (userStrength: string, requiredSkill: string): boolean => {
  const transferabilityMap: Record<string, string[]> = {
    'analytical thinking': ['Statistical Analysis', 'Data Analysis', 'Problem Solving'],
    'problem solving': ['System Design', 'Algorithmic Thinking', 'Product Strategy'],
    'communication': ['Cross-functional Leadership', 'User Research', 'Technical Writing'],
    'leadership': ['Cross-functional Leadership', 'Team Management', 'Project Management'],
    'creativity': ['Product Strategy', 'Design Thinking', 'Innovation'],
    'technical aptitude': ['Programming Languages', 'System Design', 'Technical Skills']
  };

  const userSkillLower = userStrength.toLowerCase();
  return Object.entries(transferabilityMap).some(([key, skills]) =>
    userSkillLower.includes(key) && skills.some(skill =>
      requiredSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );
};

export function SkillsGapAnalysis({ topCareers, userStrengths }: SkillsGapAnalysisProps) {
  const [selectedCareerIndex, setSelectedCareerIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'transferable' | 'develop' | 'resources'>('overview');

  if (!topCareers || topCareers.length === 0) return null;

  const selectedCareer = topCareers[selectedCareerIndex];
  const analysis = getSkillAnalysisForCareer(selectedCareer, userStrengths);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
        <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Skills Gap Analysis
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        Compare your current abilities with requirements for your top career matches and get a personalized development roadmap.
      </p>

      {/* Career Selector */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-3">Select Career to Analyze:</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {topCareers.slice(0, 5).map((career, index) => (
            <button
              key={index}
              onClick={() => setSelectedCareerIndex(index)}
              className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all ${
                selectedCareerIndex === index
                  ? 'border-purple-500 bg-purple-900/30 text-purple-100'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
              }`}
            >
              <div className="text-left">
                <div className="font-semibold text-sm">{career.careerTitle}</div>
                <div className="text-xs text-gray-400 mt-0.5">{Math.round(career.currentScore)}% match</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-700/50">
          <div className="text-2xl font-bold text-purple-400 mb-1">{analysis.skillGapScore}%</div>
          <div className="text-xs text-gray-400">Skills Readiness</div>
        </div>
        <div className="bg-green-900/30 rounded-lg p-4 border border-green-700/50">
          <div className="text-2xl font-bold text-green-400 mb-1">{analysis.transferableSkills.length}</div>
          <div className="text-xs text-gray-400">Transferable Skills</div>
        </div>
        <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-700/50">
          <div className="text-2xl font-bold text-orange-400 mb-1">{analysis.skillsToAcquire.length}</div>
          <div className="text-xs text-gray-400">Skills to Develop</div>
        </div>
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
          <div className="text-2xl font-bold text-blue-400 mb-1">{analysis.estimatedTimeToReady}</div>
          <div className="text-xs text-gray-400">Time to Ready</div>
        </div>
      </div>

      {/* Readiness Level Indicator */}
      <div className="mb-6">
        <div className={`p-4 rounded-lg border-2 ${
          analysis.readinessLevel === 'ready'
            ? 'bg-green-900/30 border-green-700/50'
            : analysis.readinessLevel === 'nearly-ready'
            ? 'bg-yellow-900/30 border-yellow-700/50'
            : analysis.readinessLevel === 'development-needed'
            ? 'bg-orange-900/30 border-orange-700/50'
            : 'bg-red-900/30 border-red-700/50'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`text-lg font-bold ${
              analysis.readinessLevel === 'ready' ? 'text-green-400'
              : analysis.readinessLevel === 'nearly-ready' ? 'text-yellow-400'
              : analysis.readinessLevel === 'development-needed' ? 'text-orange-400'
              : 'text-red-400'
            }`}>
              {analysis.readinessLevel === 'ready' && '🎯 Ready to Apply'}
              {analysis.readinessLevel === 'nearly-ready' && '⚡ Nearly Ready'}
              {analysis.readinessLevel === 'development-needed' && '📚 Development Needed'}
              {analysis.readinessLevel === 'significant-gaps' && '🏗️ Significant Preparation Required'}
            </span>
          </div>
          <p className="text-gray-300 text-sm mt-2">
            {analysis.readinessLevel === 'ready' && 'You have most of the skills needed for this role. Focus on showcasing your transferable skills and gaining industry-specific knowledge.'}
            {analysis.readinessLevel === 'nearly-ready' && 'You\'re close to being ready! Focus on developing a few key skills to strengthen your candidacy.'}
            {analysis.readinessLevel === 'development-needed' && 'Several important skills need development. Create a learning plan focusing on critical skills first.'}
            {analysis.readinessLevel === 'significant-gaps' && 'This role requires substantial skill development. Consider starting with foundational skills or exploring related roles first.'}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-800 rounded-lg p-1">
        {[
          { key: 'overview', label: 'Overview', icon: '📊' },
          { key: 'transferable', label: 'Transferable Skills', icon: '✅' },
          { key: 'develop', label: 'Skills to Develop', icon: '📈' },
          { key: 'resources', label: 'Learning Resources', icon: '📚' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'overview' | 'transferable' | 'develop' | 'resources')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 rounded-lg border border-purple-700/30 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-100">Career Readiness Overview</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-3">Your Strengths ({analysis.transferableSkills.length})</h4>
                <div className="space-y-2">
                  {analysis.transferableSkills.slice(0, 3).map((skill, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-900/20 rounded-lg border border-green-700/30">
                      <span className="text-green-400">✓</span>
                      <div>
                        <div className="text-sm font-medium text-gray-200">{skill.name}</div>
                        <div className="text-xs text-gray-400">{skill.category} • {skill.importance}</div>
                      </div>
                    </div>
                  ))}
                  {analysis.transferableSkills.length > 3 && (
                    <div className="text-sm text-gray-400 text-center py-2">
                      +{analysis.transferableSkills.length - 3} more transferable skills
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-orange-400 mb-3">Priority Development Areas</h4>
                <div className="space-y-2">
                  {analysis.skillsToAcquire
                    .filter(skill => skill.importance === 'critical')
                    .slice(0, 3)
                    .map((skill, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-orange-900/20 rounded-lg border border-orange-700/30">
                        <span className="text-orange-400">📚</span>
                        <div>
                          <div className="text-sm font-medium text-gray-200">{skill.name}</div>
                          <div className="text-xs text-gray-400">{skill.timeToAcquire} • {skill.importance}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transferable' && (
          <div>
            <h3 className="text-xl font-bold text-gray-100 mb-4">Skills You Already Have</h3>
            <p className="text-gray-400 text-sm mb-6">
              These skills from your background transfer well to {selectedCareer.careerTitle} roles.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.transferableSkills.map((skill, index) => (
                <div key={index} className="bg-green-900/20 rounded-lg p-4 border border-green-700/30">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-semibold text-green-400">{skill.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      skill.importance === 'critical' ? 'bg-red-900/50 text-red-300'
                      : skill.importance === 'important' ? 'bg-yellow-900/50 text-yellow-300'
                      : 'bg-green-900/50 text-green-300'
                    }`}>
                      {skill.importance}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 mb-3">
                    Category: {skill.category} • Level: {skill.proficiencyLevel}
                  </div>
                  <div className="text-xs text-green-300 bg-green-900/30 rounded p-2">
                    💡 <strong>How to leverage:</strong> Highlight this skill in your resume and interviews.
                    Consider getting certified or creating portfolio examples to demonstrate proficiency.
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'develop' && (
          <div>
            <h3 className="text-xl font-bold text-gray-100 mb-4">Skills to Develop</h3>
            <p className="text-gray-400 text-sm mb-6">
              Focus on these skills to become a competitive candidate for {selectedCareer.careerTitle}.
            </p>

            <div className="space-y-4">
              {['critical', 'important', 'beneficial'].map(importance => {
                const skillsForImportance = analysis.skillsToAcquire.filter(skill => skill.importance === importance);
                if (skillsForImportance.length === 0) return null;

                return (
                  <div key={importance}>
                    <h4 className={`text-lg font-semibold mb-3 ${
                      importance === 'critical' ? 'text-red-400'
                      : importance === 'important' ? 'text-yellow-400'
                      : 'text-blue-400'
                    }`}>
                      {importance.charAt(0).toUpperCase() + importance.slice(1)} Skills
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                      {skillsForImportance.map((skill, index) => (
                        <div key={index} className={`rounded-lg p-4 border ${
                          importance === 'critical' ? 'bg-red-900/20 border-red-700/30'
                          : importance === 'important' ? 'bg-yellow-900/20 border-yellow-700/30'
                          : 'bg-blue-900/20 border-blue-700/30'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="text-md font-semibold text-gray-200">{skill.name}</h5>
                            <span className="text-xs text-gray-400">{skill.timeToAcquire}</span>
                          </div>
                          <div className="text-sm text-gray-300 mb-3">
                            Category: {skill.category} • Target: {skill.proficiencyLevel}
                          </div>
                          <div className="text-xs text-gray-400">
                            {skill.resources.length} learning resource{skill.resources.length > 1 ? 's' : ''} available
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div>
            <h3 className="text-xl font-bold text-gray-100 mb-4">Learning Resources & Roadmap</h3>
            <p className="text-gray-400 text-sm mb-6">
              Curated learning resources to develop the skills needed for {selectedCareer.careerTitle}.
            </p>

            <div className="space-y-6">
              {analysis.skillsToAcquire.map((skill, skillIndex) => (
                <div key={skillIndex} className="bg-gray-900/50 rounded-lg p-5 border border-gray-700/50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-200">{skill.name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          skill.importance === 'critical' ? 'bg-red-900/50 text-red-300'
                          : skill.importance === 'important' ? 'bg-yellow-900/50 text-yellow-300'
                          : 'bg-green-900/50 text-green-300'
                        }`}>
                          {skill.importance}
                        </span>
                        <span className="text-xs text-gray-400">Est. {skill.timeToAcquire}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {skill.resources.map((resource, resourceIndex) => (
                      <div key={resourceIndex} className="bg-gray-800/50 rounded-lg p-3 border border-gray-600/30">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="text-sm font-semibold text-gray-200">{resource.name}</h5>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            resource.cost === 'free' ? 'bg-green-900/50 text-green-400'
                            : resource.cost === 'low' ? 'bg-blue-900/50 text-blue-400'
                            : resource.cost === 'medium' ? 'bg-yellow-900/50 text-yellow-400'
                            : 'bg-red-900/50 text-red-400'
                          }`}>
                            {resource.cost}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mb-2">
                          {resource.type} • {resource.provider}
                        </div>
                        <div className="text-xs text-gray-300">
                          Duration: {resource.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Learning Timeline */}
            <div className="mt-8 p-5 bg-purple-900/20 rounded-lg border border-purple-700/30">
              <h4 className="text-lg font-semibold text-purple-400 mb-3">Suggested Learning Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</span>
                  <div>
                    <div className="text-sm font-medium text-gray-200">Months 1-3: Critical Skills</div>
                    <div className="text-xs text-gray-400">Focus on the most important skills for immediate impact</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</span>
                  <div>
                    <div className="text-sm font-medium text-gray-200">Months 4-6: Important Skills</div>
                    <div className="text-xs text-gray-400">Build on your foundation with complementary skills</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</span>
                  <div>
                    <div className="text-sm font-medium text-gray-200">Months 7+: Beneficial Skills & Portfolio</div>
                    <div className="text-xs text-gray-400">Round out your skillset and build demonstrable projects</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
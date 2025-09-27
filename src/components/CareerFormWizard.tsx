'use client';

import { useState } from 'react';
import { JobCategory, CareerCategory } from '@/types/career';

interface CareerFormWizardProps {
  onSave: (career: JobCategory) => void;
  onCancel: () => void;
}

export function CareerFormWizard({ onSave, onCancel }: CareerFormWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<JobCategory>>({
    id: `career-${Date.now()}`,
    category: 'tech',
    alternativeTitles: [],
    dailyTasks: [],
    requiredSkills: [],
    salaryRanges: [],
    careerProgression: [],
    industryInsights: [],
    workEnvironment: {
      remote: false,
      hybrid: false,
      onsite: true,
      travelRequired: false,
      typicalHours: '9-5',
    },
    jobOutlook: {
      growthRate: 'Average',
      projectedJobs: 'Growing',
      competitionLevel: 'medium',
    },
    education: {
      certifications: [],
      alternativePathways: [],
    },
    relatedRoles: [],
    keywords: [],
  });

  const [currentTask, setCurrentTask] = useState('');
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentKeyword, setCurrentKeyword] = useState('');

  const categories: CareerCategory[] = ['healthcare', 'tech', 'marketing', 'finance', 'education', 'business', 'wellness', 'design'];

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const response = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSave(formData as JobCategory);
      } else {
        alert('Failed to save career');
      }
    } catch (error) {
      console.error('Error saving career:', error);
      alert('Error saving career');
    }
  };

  const addTask = () => {
    if (currentTask.trim()) {
      setFormData({
        ...formData,
        dailyTasks: [
          ...(formData.dailyTasks || []),
          { task: currentTask, frequency: 'daily', timePercentage: 20 },
        ],
      });
      setCurrentTask('');
    }
  };

  const addSkill = () => {
    if (currentSkill.trim()) {
      setFormData({
        ...formData,
        requiredSkills: [
          ...(formData.requiredSkills || []),
          { skill: currentSkill, category: 'technical', importance: 'required', description: '' },
        ],
      });
      setCurrentSkill('');
    }
  };

  const addKeyword = () => {
    if (currentKeyword.trim()) {
      setFormData({
        ...formData,
        keywords: [...(formData.keywords || []), currentKeyword],
      });
      setCurrentKeyword('');
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
              s === step
                ? 'bg-blue-600 text-white'
                : s < step
                ? 'bg-blue-800 text-blue-300'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {s}
          </div>
          {s < 5 && (
            <div
              className={`w-16 h-1 ${
                s < step ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
        {renderStepIndicator()}

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as CareerCategory })}
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-32"
                placeholder="Describe what this role involves..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Alternative Job Titles (comma-separated)
              </label>
              <input
                type="text"
                value={formData.alternativeTitles?.join(', ') || ''}
                onChange={(e) => setFormData({ ...formData, alternativeTitles: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Developer, Programmer, Coder"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Daily Tasks & Skills</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Daily Tasks
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  className="flex-1 px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a daily task..."
                />
                <button
                  onClick={addTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.dailyTasks?.map((task, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg">
                    <span className="text-gray-300">{task.task}</span>
                    <button
                      onClick={() => {
                        const tasks = [...(formData.dailyTasks || [])];
                        tasks.splice(idx, 1);
                        setFormData({ ...formData, dailyTasks: tasks });
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Required Skills
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1 px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a required skill..."
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requiredSkills?.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-blue-900/30 text-blue-400 px-3 py-1 rounded-lg">
                    <span>{skill.skill}</span>
                    <button
                      onClick={() => {
                        const skills = [...(formData.requiredSkills || [])];
                        skills.splice(idx, 1);
                        setFormData({ ...formData, requiredSkills: skills });
                      }}
                      className="hover:text-blue-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Keywords (for search)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentKeyword}
                  onChange={(e) => setCurrentKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                  className="flex-1 px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add keywords..."
                />
                <button
                  onClick={addKeyword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.keywords?.map((keyword, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-700 text-gray-300 px-3 py-1 rounded-lg">
                    <span>{keyword}</span>
                    <button
                      onClick={() => {
                        const keywords = [...(formData.keywords || [])];
                        keywords.splice(idx, 1);
                        setFormData({ ...formData, keywords: keywords });
                      }}
                      className="hover:text-gray-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Work Environment</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Work Location Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.workEnvironment?.remote}
                    onChange={(e) => setFormData({
                      ...formData,
                      workEnvironment: { ...formData.workEnvironment!, remote: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Remote</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.workEnvironment?.hybrid}
                    onChange={(e) => setFormData({
                      ...formData,
                      workEnvironment: { ...formData.workEnvironment!, hybrid: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Hybrid</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.workEnvironment?.onsite}
                    onChange={(e) => setFormData({
                      ...formData,
                      workEnvironment: { ...formData.workEnvironment!, onsite: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-300">On-site</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Typical Working Hours
              </label>
              <input
                type="text"
                value={formData.workEnvironment?.typicalHours || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  workEnvironment: { ...formData.workEnvironment!, typicalHours: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 9-5, Flexible, Shift work"
              />
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.workEnvironment?.travelRequired}
                  onChange={(e) => setFormData({
                    ...formData,
                    workEnvironment: { ...formData.workEnvironment!, travelRequired: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-300">Travel Required</span>
              </label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Education & Requirements</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Minimum Degree
              </label>
              <select
                value={formData.education?.minimumDegree || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  education: { ...formData.education!, minimumDegree: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">None</option>
                <option value="High School">High School</option>
                <option value="Associate's">Associate&apos;s</option>
                <option value="Bachelor's">Bachelor&apos;s</option>
                <option value="Master's">Master&apos;s</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Certifications (comma-separated)
              </label>
              <input
                type="text"
                value={formData.education?.certifications?.join(', ') || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  education: { ...formData.education!, certifications: e.target.value.split(',').map(s => s.trim()) }
                })}
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., PMP, AWS Certified, CPA"
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Job Outlook</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Growth Rate
              </label>
              <input
                type="text"
                value={formData.jobOutlook?.growthRate || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  jobOutlook: { ...formData.jobOutlook!, growthRate: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Fast growing, Average, Declining"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Competition Level
              </label>
              <select
                value={formData.jobOutlook?.competitionLevel || 'medium'}
                onChange={(e) => setFormData({
                  ...formData,
                  jobOutlook: { ...formData.jobOutlook!, competitionLevel: e.target.value as 'low' | 'medium' | 'high' }
                })}
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Projected Jobs
              </label>
              <input
                type="text"
                value={formData.jobOutlook?.projectedJobs || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  jobOutlook: { ...formData.jobOutlook!, projectedJobs: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Growing, Stable, Declining"
              />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div>
            {step < 5 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Career
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
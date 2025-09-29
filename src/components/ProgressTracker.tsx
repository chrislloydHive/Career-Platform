'use client';

import { useState, useEffect } from 'react';
import { ProgressTrackingService } from '@/lib/progress-tracking/progress-service';
import {
  ProgressTrackingState,
  SkillProgress,
  CourseProgress,
  ProgressPreferences,
  CareerReadinessScore
} from '@/types/progress-tracking';

interface ProgressTrackerProps {
  initialCareerPath?: string;
  showFullInterface?: boolean;
}

export function ProgressTracker({ initialCareerPath = '', showFullInterface = true }: ProgressTrackerProps) {
  const [state, setState] = useState<ProgressTrackingState | null>(null);
  const [preferences, setPreferences] = useState<ProgressPreferences | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'courses' | 'opportunities' | 'sharing'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [service] = useState(() => ProgressTrackingService.getInstance());

  useEffect(() => {
    const loadData = () => {
      setState(service.getState());
      setPreferences(service.getPreferences());
      setIsLoading(false);

      if (initialCareerPath && !service.getPreferences().targetCareerPath) {
        service.updatePreferences({ targetCareerPath: initialCareerPath });
        setPreferences(service.getPreferences());
      }
    };

    loadData();
    const unsubscribe = service.subscribe(setState);

    return unsubscribe;
  }, [service, initialCareerPath]);

  if (isLoading || !state || !preferences) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const readinessScore = service.calculateCareerReadinessScore(preferences.targetCareerPath);

  if (!showFullInterface) {
    return <ProgressOverview state={state} preferences={preferences} readinessScore={readinessScore} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Skills Development Progress
          </h2>
          <p className="text-gray-400 text-sm">
            Track your learning journey for {preferences.targetCareerPath || 'your career goals'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">{readinessScore.overall}%</div>
          <div className="text-xs text-gray-400">Career Ready</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
        {[
          { key: 'overview', label: 'Overview', icon: '' },
          { key: 'skills', label: 'Skills', icon: '' },
          { key: 'courses', label: 'Courses', icon: '' },
          { key: 'opportunities', label: 'Opportunities', icon: '' },
          { key: 'sharing', label: 'Share Progress', icon: '' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'overview' | 'skills' | 'courses' | 'opportunities' | 'sharing')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        {activeTab === 'overview' && (
          <ProgressOverview state={state} preferences={preferences} readinessScore={readinessScore} />
        )}
        {activeTab === 'skills' && (
          <SkillsManagement state={state} service={service} />
        )}
        {activeTab === 'courses' && (
          <CoursesManagement state={state} service={service} />
        )}
        {activeTab === 'opportunities' && (
          <OpportunitiesManagement state={state} service={service} />
        )}
        {activeTab === 'sharing' && (
          <ProgressSharing state={state} service={service} />
        )}
      </div>
    </div>
  );
}

function ProgressOverview({
  state,
  preferences,
  readinessScore
}: {
  state: ProgressTrackingState;
  preferences: ProgressPreferences;
  readinessScore: CareerReadinessScore;
}) {
  const thisWeekTime = state.summary.weeklyProgress[state.summary.weeklyProgress.length - 1]?.timeSpent || 0;
  const weeklyGoalProgress = (thisWeekTime / preferences.weeklyTimeGoal) * 100;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
          <div className="text-2xl font-bold text-blue-400 mb-1">{Math.round(state.summary.totalTimeSpent / 60)}h</div>
          <div className="text-xs text-gray-400">Total Learning Time</div>
        </div>
        <div className="bg-green-900/30 rounded-lg p-4 border border-green-700/50">
          <div className="text-2xl font-bold text-green-400 mb-1">{state.summary.coursesCompleted}</div>
          <div className="text-xs text-gray-400">Courses Completed</div>
        </div>
        <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-700/50">
          <div className="text-2xl font-bold text-purple-400 mb-1">{state.summary.skillsImproved}</div>
          <div className="text-xs text-gray-400">Skills Developing</div>
        </div>
        <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-700/50">
          <div className="text-2xl font-bold text-orange-400 mb-1">{state.summary.coursesInProgress}</div>
          <div className="text-xs text-gray-400">Courses In Progress</div>
        </div>
      </div>

      {/* Career Readiness Score */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Career Readiness Score</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-3">
              {Object.entries(readinessScore.breakdown).map(([category, score]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-gray-400">{score}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        score >= 80 ? 'bg-green-500' :
                        score >= 60 ? 'bg-yellow-500' :
                        score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Next Steps</h4>
            <ul className="space-y-1">
              {readinessScore.nextSteps.map((step, index) => (
                <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">This Week&apos;s Progress</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Time Goal</span>
              <span className="text-gray-400">{Math.round(thisWeekTime / 60)}h / {Math.round(preferences.weeklyTimeGoal / 60)}h</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  weeklyGoalProgress >= 100 ? 'bg-green-500' :
                  weeklyGoalProgress >= 75 ? 'bg-blue-500' :
                  weeklyGoalProgress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(100, weeklyGoalProgress)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-400">{Math.round(weeklyGoalProgress)}%</div>
            <div className="text-xs text-gray-400">Complete</div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Recent Achievements</h3>
        {state.summary.recentAchievements.length > 0 ? (
          <div className="space-y-3">
            {state.summary.recentAchievements.slice(0, 5).map((achievement, index) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  achievement.type === 'course_completed' ? 'bg-green-600 text-white' :
                  achievement.type === 'skill_improved' ? 'bg-blue-600 text-white' :
                  'bg-purple-600 text-white'
                }`}>
                  {achievement.type === 'course_completed' ? '✓' :
                   achievement.type === 'skill_improved' ? '↗' : '○'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-200">{achievement.title}</div>
                  <div className="text-xs text-gray-400">{achievement.description}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(achievement.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">↗</div>
            <p>Start your learning journey to see achievements here!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SkillsManagement({ state, service }: { state: ProgressTrackingState; service: ProgressTrackingService }) {
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skillName: '',
    category: 'technical' as const,
    currentLevel: 'none' as const,
    targetLevel: 'intermediate' as const,
    importance: 'important' as const,
    timeToAcquire: '3 months'
  });

  const handleAddSkill = () => {
    if (newSkill.skillName.trim()) {
      service.addSkill(newSkill);
      setNewSkill({
        skillName: '',
        category: 'technical',
        currentLevel: 'none',
        targetLevel: 'intermediate',
        importance: 'important',
        timeToAcquire: '3 months'
      });
      setShowAddSkill(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-100">Skill Development Roadmap</h3>
        <button
          onClick={() => setShowAddSkill(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Add Skill
        </button>
      </div>

      {showAddSkill && (
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-md font-semibold text-gray-200 mb-4">Add New Skill</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Skill Name</label>
              <input
                type="text"
                value={newSkill.skillName}
                onChange={(e) => setNewSkill({...newSkill, skillName: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Python Programming"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill({...newSkill, category: e.target.value as any})}
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="technical">Technical</option>
                <option value="soft">Soft Skills</option>
                <option value="industry">Industry Knowledge</option>
                <option value="certification">Certification</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Current Level</label>
              <select
                value={newSkill.currentLevel}
                onChange={(e) => setNewSkill({...newSkill, currentLevel: e.target.value as any})}
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Level</label>
              <select
                value={newSkill.targetLevel}
                onChange={(e) => setNewSkill({...newSkill, targetLevel: e.target.value as any})}
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddSkill}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Skill
            </button>
            <button
              onClick={() => setShowAddSkill(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.skills.map((skill, index) => (
          <SkillCard key={index} skill={skill} service={service} />
        ))}
      </div>

      {state.skills.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-4">○</div>
          <h3 className="text-lg font-medium mb-2">No skills added yet</h3>
          <p className="text-sm">Add skills to start tracking your development progress</p>
        </div>
      )}
    </div>
  );
}

function SkillCard({ skill, service }: { skill: SkillProgress; service: ProgressTrackingService }) {
  const [showAddCourse, setShowAddCourse] = useState(false);

  const progressPercentage = {
    'none': 0,
    'beginner': 25,
    'intermediate': 50,
    'advanced': 75,
    'expert': 100
  }[skill.currentLevel];

  const targetPercentage = {
    'beginner': 25,
    'intermediate': 50,
    'advanced': 75,
    'expert': 100
  }[skill.targetLevel];

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-200">{skill.skillName}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <span className="capitalize">{skill.category}</span>
            <span>•</span>
            <span className={`px-2 py-0.5 rounded ${
              skill.importance === 'critical' ? 'bg-red-900/50 text-red-300' :
              skill.importance === 'important' ? 'bg-yellow-900/50 text-yellow-300' :
              'bg-green-900/50 text-green-300'
            }`}>
              {skill.importance}
            </span>
          </div>
        </div>
        <div className="text-right text-xs text-gray-400">
          {Math.round(skill.totalTimeSpent / 60)}h
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Progress</span>
          <span className="text-gray-400">{skill.currentLevel} → {skill.targetLevel}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 relative">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
          <div
            className="absolute top-0 h-2 w-0.5 bg-yellow-400"
            style={{ left: `${targetPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {skill.courses.length} course{skill.courses.length !== 1 ? 's' : ''}
        </div>
        <button
          onClick={() => setShowAddCourse(!showAddCourse)}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          Add Course
        </button>
      </div>

      {showAddCourse && (
        <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-600">
          <AddCourseForm skillName={skill.skillName} service={service} onComplete={() => setShowAddCourse(false)} />
        </div>
      )}
    </div>
  );
}

function AddCourseForm({
  skillName,
  service,
  onComplete
}: {
  skillName: string;
  service: ProgressTrackingService;
  onComplete: () => void;
}) {
  const [course, setCourse] = useState({
    title: '',
    provider: '',
    type: 'course' as const,
    duration: '',
    cost: 'free' as const,
    url: '',
    priority: 'important' as const
  });

  const handleSubmit = () => {
    if (course.title.trim()) {
      service.addCourseToSkill(skillName, {
        ...course,
        skillArea: skillName
      });
      onComplete();
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Course title"
        value={course.title}
        onChange={(e) => setCourse({...course, title: e.target.value})}
        className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Provider"
          value={course.provider}
          onChange={(e) => setCourse({...course, provider: e.target.value})}
          className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Duration"
          value={course.duration}
          onChange={(e) => setCourse({...course, duration: e.target.value})}
          className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
        >
          Add
        </button>
        <button
          onClick={onComplete}
          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function CoursesManagement({ state, service }: { state: ProgressTrackingState; service: ProgressTrackingService }) {
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [timeModal, setTimeModal] = useState<{courseId: string; title: string} | null>(null);
  const [timeToLog, setTimeToLog] = useState('');

  const filteredCourses = state.courses.filter(course => {
    if (filter === 'in-progress') return course.dateStarted && !course.isCompleted;
    if (filter === 'completed') return course.isCompleted;
    return true;
  });

  const handleLogTime = () => {
    if (timeModal && timeToLog) {
      const minutes = parseInt(timeToLog);
      if (!isNaN(minutes) && minutes > 0) {
        service.logTime(timeModal.courseId, minutes);
        setTimeModal(null);
        setTimeToLog('');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-100">Course Management</h3>
        <div className="flex gap-2">
          {(['all', 'in-progress', 'completed'] as const).map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filterType === 'all' ? 'All' :
               filterType === 'in-progress' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            service={service}
            onLogTime={(courseId, title) => setTimeModal({courseId, title})}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-4">□</div>
          <h3 className="text-lg font-medium mb-2">
            {filter === 'all' ? 'No courses added yet' :
             filter === 'in-progress' ? 'No courses in progress' :
             'No completed courses'}
          </h3>
          <p className="text-sm">Add courses to your skills to start tracking progress</p>
        </div>
      )}

      {/* Time Logging Modal */}
      {timeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Log Study Time</h3>
            <p className="text-gray-300 text-sm mb-4">{timeModal.title}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Minutes Studied</label>
              <input
                type="number"
                value={timeToLog}
                onChange={(e) => setTimeToLog(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="60"
                min="1"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleLogTime}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Log Time
              </button>
              <button
                onClick={() => setTimeModal(null)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CourseCard({
  course,
  service,
  onLogTime
}: {
  course: CourseProgress;
  service: ProgressTrackingService;
  onLogTime: (courseId: string, title: string) => void;
}) {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');

  const handleComplete = () => {
    service.completeCourse(course.id, rating, notes);
    setShowCompleteModal(false);
  };

  const handleStart = () => {
    service.startCourse(course.id);
  };

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-200">{course.title}</h4>
          <p className="text-sm text-gray-400">{course.provider}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          course.isCompleted ? 'bg-green-900/50 text-green-300' :
          course.dateStarted ? 'bg-blue-900/50 text-blue-300' :
          'bg-gray-700/50 text-gray-400'
        }`}>
          {course.isCompleted ? 'Completed' :
           course.dateStarted ? 'In Progress' : 'Not Started'}
        </div>
      </div>

      <div className="text-xs text-gray-400 mb-3 space-y-1">
        <div>Duration: {course.duration} • {course.type}</div>
        <div>Time spent: {Math.round(course.timeSpent / 60)}h {course.timeSpent % 60}m</div>
        {course.isCompleted && course.rating && (
          <div className="flex items-center gap-1">
            Rating:
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < course.rating! ? 'text-yellow-400' : 'text-gray-600'}>★</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!course.dateStarted && (
          <button
            onClick={handleStart}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Start
          </button>
        )}
        {course.dateStarted && !course.isCompleted && (
          <>
            <button
              onClick={() => onLogTime(course.id, course.title)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              Log Time
            </button>
            <button
              onClick={() => setShowCompleteModal(true)}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
            >
              Complete
            </button>
          </>
        )}
        {course.url && (
          <a
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
          >
            Open
          </a>
        )}
      </div>

      {/* Complete Course Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Complete Course</h3>
            <p className="text-gray-300 text-sm mb-4">{course.title}</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-300`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="What did you learn? Any feedback?"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleComplete}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Complete
              </button>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OpportunitiesManagement({ state, service }: { state: ProgressTrackingState; service: ProgressTrackingService }) {
  const opportunities = state.opportunities.filter(opp => !opp.isDismissed);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-100">Learning Opportunities</h3>

      {opportunities.length > 0 ? (
        <div className="space-y-4">
          {opportunities.map(opportunity => (
            <div key={opportunity.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-200">{opportunity.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{opportunity.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => service.bookmarkOpportunity(opportunity.id)}
                    className={`p-1 rounded ${
                      opportunity.isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                    }`}
                  >
                    {opportunity.isBookmarked ? '★' : '☆'}
                  </button>
                  <button
                    onClick={() => service.dismissOpportunity(opportunity.id)}
                    className="p-1 text-gray-400 hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                <span className="capitalize">{opportunity.type}</span>
                <span>•</span>
                <span>{opportunity.provider}</span>
                <span>•</span>
                <span>{opportunity.duration}</span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded ${
                  opportunity.cost === 'free' ? 'bg-green-900/50 text-green-400' :
                  opportunity.cost === 'low' ? 'bg-blue-900/50 text-blue-400' :
                  opportunity.cost === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                  'bg-red-900/50 text-red-400'
                }`}>
                  {opportunity.cost}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {opportunity.skillAreas.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
                {opportunity.url && (
                  <a
                    href={opportunity.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-4">•</div>
          <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
          <p className="text-sm">We'll notify you when relevant learning opportunities become available</p>
        </div>
      )}
    </div>
  );
}

function ProgressSharing({ state, service }: { state: ProgressTrackingState; service: ProgressTrackingService }) {
  const [shareType, setShareType] = useState<'progress_summary' | 'skill_roadmap' | 'achievement' | 'help_request'>('progress_summary');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [helpAreas, setHelpAreas] = useState<string[]>([]);

  const handleShare = () => {
    if (recipientEmail && recipientName && message) {
      const additionalData = shareType === 'help_request' ? { helpWith: helpAreas } : undefined;
      service.sharewithMentor(recipientEmail, recipientName, shareType, message, additionalData);

      // Reset form
      setRecipientEmail('');
      setRecipientName('');
      setMessage('');
      setHelpAreas([]);

      alert('Progress shared successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-100">Share Progress with Mentors</h3>

      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Share Type</label>
            <select
              value={shareType}
              onChange={(e) => setShareType(e.target.value as any)}
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="progress_summary">Progress Summary</option>
              <option value="skill_roadmap">Skill Roadmap</option>
              <option value="achievement">Recent Achievements</option>
              <option value="help_request">Request Help</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mentor Name</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Mentor Email</label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="mentor@example.com"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Hi [Name], I wanted to share my learning progress with you..."
          />
        </div>

        {shareType === 'help_request' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Areas where you need help</label>
            <div className="flex flex-wrap gap-2">
              {state.skills.map(skill => (
                <label key={skill.skillName} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={helpAreas.includes(skill.skillName)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setHelpAreas([...helpAreas, skill.skillName]);
                      } else {
                        setHelpAreas(helpAreas.filter(area => area !== skill.skillName));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">{skill.skillName}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleShare}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Share Progress
        </button>
      </div>

      {/* Recent Shares */}
      {state.mentorShares.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-200 mb-3">Recent Shares</h4>
          <div className="space-y-3">
            {state.mentorShares.slice(0, 5).map(share => (
              <div key={share.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-200">{share.recipientName}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(share.dateShared).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm text-gray-400 mb-2 capitalize">
                  {share.shareType.replace('_', ' ')}
                </div>
                <div className="text-sm text-gray-300">
                  {share.message.slice(0, 100)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
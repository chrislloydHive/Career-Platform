'use client';

import { useState, useEffect } from 'react';
import { ProgressTrackingService } from '@/lib/progress-tracking/progress-service';
import { LearningOpportunityService } from '@/lib/progress-tracking/opportunity-service';
import {
  LearningOpportunity,
  ProgressEntry,
  CareerReadinessScore,
  ProgressPreferences
} from '@/types/progress-tracking';

interface Notification {
  id: string;
  type: 'opportunity' | 'milestone' | 'readiness_change' | 'weekly_progress' | 'course_deadline';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

export function ProgressNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [service] = useState(() => ProgressTrackingService.getInstance());

  useEffect(() => {
    const checkForNotifications = () => {
      const state = service.getState();
      const preferences = service.getPreferences();
      const newNotifications: Notification[] = [];

      // Check for new learning opportunities
      if (preferences.notifications.newOpportunities) {
        const recentOpportunities = state.opportunities.filter(
          opp => !opp.isDismissed &&
          (new Date().getTime() - new Date(opp.dateAdded).getTime()) < 24 * 60 * 60 * 1000 // Last 24 hours
        );

        recentOpportunities.forEach(opportunity => {
          if (LearningOpportunityService.shouldNotifyUser(opportunity, preferences)) {
            newNotifications.push({
              id: `opp_${opportunity.id}`,
              type: 'opportunity',
              title: 'New Learning Opportunity',
              message: LearningOpportunityService.getNotificationMessage(opportunity),
              data: { opportunity },
              timestamp: new Date(opportunity.dateAdded),
              isRead: false,
              priority: opportunity.relevanceScore > 90 ? 'high' : 'medium'
            });
          }
        });
      }

      // Check for recent milestones/achievements
      if (preferences.notifications.milestoneReminders) {
        const recentAchievements = state.progressEntries.filter(
          entry => ['course_completed', 'skill_improved', 'milestone_achieved'].includes(entry.type) &&
          (new Date().getTime() - new Date(entry.date).getTime()) < 7 * 24 * 60 * 60 * 1000 // Last 7 days
        );

        recentAchievements.forEach(achievement => {
          newNotifications.push({
            id: `achievement_${achievement.id}`,
            type: 'milestone',
            title: 'Achievement Unlocked!',
            message: achievement.title,
            data: { achievement },
            timestamp: new Date(achievement.date),
            isRead: false,
            priority: 'medium'
          });
        });
      }

      // Check for career readiness score changes
      if (preferences.notifications.readinessScoreChanges) {
        const currentScore = service.calculateCareerReadinessScore(preferences.targetCareerPath);
        if (state.summary.previousReadinessScore) {
          const scoreDiff = currentScore.overall - state.summary.previousReadinessScore.overall;
          if (Math.abs(scoreDiff) >= 5) {
            newNotifications.push({
              id: `readiness_${Date.now()}`,
              type: 'readiness_change',
              title: scoreDiff > 0 ? 'Career Readiness Improved!' : 'Career Readiness Updated',
              message: `Your career readiness score ${scoreDiff > 0 ? 'increased' : 'changed'} by ${Math.abs(scoreDiff)} points to ${currentScore.overall}%`,
              data: { currentScore, previousScore: state.summary.previousReadinessScore },
              timestamp: new Date(),
              isRead: false,
              priority: scoreDiff > 0 ? 'high' : 'medium'
            });
          }
        }
      }

      // Check for weekly progress notifications
      if (preferences.notifications.weeklyProgress) {
        const weeklyData = state.summary.weeklyProgress[state.summary.weeklyProgress.length - 1];
        if (weeklyData) {
          const weeklyGoal = preferences.weeklyTimeGoal;
          const progressPercentage = (weeklyData.timeSpent / weeklyGoal) * 100;

          if (progressPercentage >= 100) {
            newNotifications.push({
              id: `weekly_goal_${weeklyData.week}`,
              type: 'weekly_progress',
              title: 'Weekly Goal Achieved!',
              message: `Congratulations! You've completed your weekly learning goal of ${Math.round(weeklyGoal / 60)} hours.`,
              data: { weeklyData, progressPercentage },
              timestamp: new Date(),
              isRead: false,
              priority: 'high'
            });
          } else if (progressPercentage >= 75) {
            newNotifications.push({
              id: `weekly_progress_${weeklyData.week}`,
              type: 'weekly_progress',
              title: 'Great Progress This Week!',
              message: `You're ${Math.round(progressPercentage)}% of the way to your weekly learning goal. Keep it up!`,
              data: { weeklyData, progressPercentage },
              timestamp: new Date(),
              isRead: false,
              priority: 'medium'
            });
          }
        }
      }

      // Check for course deadlines (simulated)
      if (preferences.notifications.courseDeadlines) {
        const inProgressCourses = state.courses.filter(
          course => course.dateStarted && !course.isCompleted
        );

        inProgressCourses.forEach(course => {
          // Simulate a deadline check - in a real app, courses would have actual deadlines
          const daysSinceStart = Math.floor(
            (new Date().getTime() - new Date(course.dateStarted!).getTime()) / (24 * 60 * 60 * 1000)
          );

          if (daysSinceStart > 14 && daysSinceStart % 7 === 0) { // Remind every week after 2 weeks
            newNotifications.push({
              id: `deadline_${course.id}_${daysSinceStart}`,
              type: 'course_deadline',
              title: '⏰ Course Progress Reminder',
              message: `Don&apos;t forget to continue working on "${course.title}". You&apos;ve been learning for ${daysSinceStart} days.`,
              data: { course, daysSinceStart },
              timestamp: new Date(),
              isRead: false,
              priority: 'low'
            });
          }
        });
      }

      // Filter out notifications that already exist and sort by priority and timestamp
      const existingIds = new Set(notifications.map(n => n.id));
      const filteredNew = newNotifications.filter(n => !existingIds.has(n.id));

      if (filteredNew.length > 0) {
        setNotifications(prev =>
          [...filteredNew, ...prev]
            .sort((a, b) => {
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
              }
              return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            })
            .slice(0, 20) // Keep only 20 most recent notifications
        );
      }
    };

    // Initial check
    checkForNotifications();

    // Check every hour
    const interval = setInterval(checkForNotifications, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [service, notifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    // Handle different types of notifications
    switch (notification.type) {
      case 'opportunity':
        if (notification.data?.opportunity) {
          const opportunity = notification.data.opportunity as LearningOpportunity;
          if (opportunity.url) {
            window.open(opportunity.url, '_blank');
          }
        }
        break;
      case 'milestone':
        // Could navigate to achievements page
        break;
      case 'readiness_change':
        // Could navigate to progress overview
        break;
      case 'weekly_progress':
        // Could navigate to weekly progress view
        break;
      case 'course_deadline':
        // Could navigate to courses page
        break;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-400 hover:text-gray-200 transition-colors"
        title="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5c-.3-.3-.5-.8-.5-1.3V9c0-6.6-4.4-11-11-11S0 2.4 0 9v3.2c0 .5-.2 1-.5 1.3L-5 17h5m2 3v1c0 1.1.9 2 2 2s2-.9 2-2v-1m-4 0h4" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-gray-800 rounded-lg border border-gray-700 shadow-xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-100">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-80">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors ${
                    !notification.isRead ? 'bg-blue-900/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-100' : 'text-gray-300'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleDateString()} at{' '}
                        {new Date(notification.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(notification.id);
                      }}
                      className="ml-2 text-gray-500 hover:text-gray-300 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  We&apos;ll notify you about learning opportunities and progress updates
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-700 text-center">
              <button
                onClick={() => setShowNotifications(false)}
                className="text-sm text-gray-400 hover:text-gray-300"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function WeeklyProgressDigest() {
  const [service] = useState(() => ProgressTrackingService.getInstance());
  const [digest, setDigest] = useState<Record<string, unknown> | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const generateDigest = () => {
      const state = service.getState();
      const opportunities = LearningOpportunityService.generateOpportunities(
        state.skills,
        service.getPreferences()
      );

      const weeklyDigest = LearningOpportunityService.generateWeeklyOpportunityDigest(
        opportunities,
        state.skills
      );

      setDigest(weeklyDigest);

      // Show digest on Sundays or if it's been a week since last shown
      const today = new Date();
      const lastShown = localStorage.getItem('lastDigestShown');
      const shouldShow = !lastShown ||
        (new Date().getTime() - new Date(lastShown).getTime()) > 7 * 24 * 60 * 60 * 1000;

      if (shouldShow && today.getDay() === 0) { // Sunday
        setIsVisible(true);
      }
    };

    generateDigest();
  }, [service]);

  const dismissDigest = () => {
    setIsVisible(false);
    localStorage.setItem('lastDigestShown', new Date().toISOString());
  };

  if (!isVisible || !digest) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-100">{String(digest.title)}</h2>
          <button
            onClick={dismissDigest}
            className="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-300 mb-6">{String(digest.summary)}</p>

        {Array.isArray(digest.skillFocus) && digest.skillFocus.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">🎯 Focus This Week</h3>
            <div className="flex flex-wrap gap-2">
              {digest.skillFocus.map((skill: string) => (
                <span key={skill} className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-3">🚀 Top Opportunities</h3>
          <div className="space-y-3">
            {Array.isArray(digest.topOpportunities) && digest.topOpportunities.map((opportunity: LearningOpportunity) => (
              <div key={opportunity.id} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-200">{opportunity.title}</h4>
                  <span className="text-xs text-gray-400">{opportunity.relevanceScore}% match</span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{opportunity.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{opportunity.provider} • {opportunity.duration}</span>
                  {opportunity.url && (
                    <a
                      href={opportunity.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={dismissDigest}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it, thanks!
          </button>
          <button
            onClick={() => {
              dismissDigest();
              // Could navigate to opportunities page
            }}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            View All Opportunities
          </button>
        </div>
      </div>
    </div>
  );
}
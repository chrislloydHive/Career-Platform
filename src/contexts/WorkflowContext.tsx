'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WorkflowState {
  // Profile (Step 1)
  profileCompleted: boolean;
  hasResume: boolean;
  hasPreferences: boolean;
  profileLastUpdated?: Date;

  // Discover (Step 2)
  assessmentCompleted: boolean;
  assessmentId?: number;
  topCareerArchetypes?: string[];
  assessmentDate?: Date;

  // Explore (Step 3)
  careersExplored: number;
  savedCareers: number;

  // Search (Step 4)
  jobSearchesPerformed: number;
  savedJobs: number;

  // Prep (Step 5)
  prepResourcesViewed: boolean;

  // Overall progress
  overallProgress: number;
  currentStep: number;
  recommendedNextStep: number;
}

interface WorkflowContextType {
  workflow: WorkflowState;
  refreshWorkflow: () => Promise<void>;
  updateWorkflow: (partial: Partial<WorkflowState>) => void;
  getNextStepRecommendation: () => {
    step: number;
    label: string;
    reason: string;
    href: string;
  };
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [workflow, setWorkflow] = useState<WorkflowState>({
    profileCompleted: false,
    hasResume: false,
    hasPreferences: false,
    assessmentCompleted: false,
    careersExplored: 0,
    savedCareers: 0,
    jobSearchesPerformed: 0,
    savedJobs: 0,
    prepResourcesViewed: false,
    overallProgress: 0,
    currentStep: 1,
    recommendedNextStep: 1,
  });

  const refreshWorkflow = async () => {
    try {
      const response = await fetch('/api/workflow/status');
      if (response.ok) {
        const data = await response.json();
        setWorkflow(data.workflow);
      }
    } catch (error) {
      console.error('Failed to refresh workflow status:', error);
    }
  };

  useEffect(() => {
    refreshWorkflow();
  }, []);

  const updateWorkflow = (partial: Partial<WorkflowState>) => {
    setWorkflow(prev => ({ ...prev, ...partial }));
  };

  const getNextStepRecommendation = () => {
    // Logic to determine what user should do next
    if (!workflow.profileCompleted) {
      return {
        step: 1,
        label: 'Complete Your Profile',
        reason: 'Share your background so we can personalize your experience',
        href: '/profile?tab=upload',
      };
    }

    if (!workflow.assessmentCompleted) {
      return {
        step: 2,
        label: 'Take the Assessment',
        reason: 'Discover what types of work match your profile',
        href: '/explore',
      };
    }

    if (workflow.savedCareers === 0 && workflow.careersExplored < 5) {
      return {
        step: 3,
        label: 'Explore Career Paths',
        reason: 'Based on your assessment, explore careers that fit',
        href: '/careers',
      };
    }

    if (workflow.savedJobs === 0) {
      return {
        step: 4,
        label: 'Search for Jobs',
        reason: 'Start applying to positions that match your top careers',
        href: '/jobs',
      };
    }

    return {
      step: 5,
      label: 'Prepare for Interviews',
      reason: 'Get ready to ace your interviews',
      href: '/progress',
    };
  };

  return (
    <WorkflowContext.Provider
      value={{
        workflow,
        refreshWorkflow,
        updateWorkflow,
        getNextStepRecommendation,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}

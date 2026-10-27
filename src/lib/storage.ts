'use client';

import { useState, useEffect } from 'react';
import { UserProgress, UserSettings, ProblemMeta, DayPlan } from '@/types';
import initialPlanData from '@/data/plan.json';
import initialProgressData from '@/data/initial_progress.json';

const STORAGE_KEY = 'striver_a2z_dsa_tracker_progress';

export const DEFAULT_SETTINGS: UserSettings = {
  startDate: '2026-10-27',
  problemsPerDay: 3,
  restDay: 'Sunday',
  theme: 'dark'
};

export const INITIAL_PROGRESS: UserProgress = initialProgressData as unknown as UserProgress;

export function getStoredProgress(): UserProgress {
  if (typeof window === 'undefined') return INITIAL_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStoredProgress(INITIAL_PROGRESS);
      return INITIAL_PROGRESS;
    }
    const parsed = JSON.parse(raw);
    // If parsed has empty problems, migrate to INITIAL_PROGRESS
    if (!parsed.problems || Object.keys(parsed.problems).length === 0) {
      saveStoredProgress(INITIAL_PROGRESS);
      return INITIAL_PROGRESS;
    }
    return {
      problems: parsed.problems || INITIAL_PROGRESS.problems,
      plan: parsed.plan && parsed.plan.length > 0 ? parsed.plan : (initialPlanData as DayPlan[]),
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      lastActiveDate: parsed.lastActiveDate || INITIAL_PROGRESS.lastActiveDate
    };
  } catch (e) {
    console.error('Error loading stored progress', e);
    return INITIAL_PROGRESS;
  }
}

export function saveStoredProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving progress', e);
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = getStoredProgress();
    setProgress(loaded);
    setIsLoaded(true);

    // Sync theme on initial load
    if (loaded.settings.theme === 'dark' || (loaded.settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const updateProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveStoredProgress(next);
      return next;
    });
  };

  const toggleSolved = (problemId: string) => {
    updateProgress((prev) => {
      const currentMeta = prev.problems[problemId] || { solved: false };
      const nextSolved = !currentMeta.solved;
      const nowIso = new Date().toISOString();

      return {
        ...prev,
        lastActiveDate: nowIso.split('T')[0],
        problems: {
          ...prev.problems,
          [problemId]: {
            ...currentMeta,
            solved: nextSolved,
            solvedAt: nextSolved ? nowIso : null
          }
        }
      };
    });
  };

  const toggleStar = (problemId: string) => {
    updateProgress((prev) => {
      const currentMeta = prev.problems[problemId] || { solved: false };
      return {
        ...prev,
        problems: {
          ...prev.problems,
          [problemId]: {
            ...currentMeta,
            starred: !currentMeta.starred
          }
        }
      };
    });
  };

  const updateNotes = (problemId: string, notes: string) => {
    updateProgress((prev) => {
      const currentMeta = prev.problems[problemId] || { solved: false };
      return {
        ...prev,
        problems: {
          ...prev.problems,
          [problemId]: {
            ...currentMeta,
            notes
          }
        }
      };
    });
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    updateProgress((prev) => {
      const nextSettings = { ...prev.settings, ...newSettings };
      if (nextSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (nextSettings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      }
      return {
        ...prev,
        settings: nextSettings
      };
    });
  };

  const updatePlan = (newPlan: DayPlan[]) => {
    updateProgress((prev) => ({
      ...prev,
      plan: newPlan
    }));
  };

  const exportProgressJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(progress, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dsa_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importProgressJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        const validated: UserProgress = {
          problems: parsed.problems || {},
          plan: Array.isArray(parsed.plan) && parsed.plan.length > 0 ? parsed.plan : (initialPlanData as DayPlan[]),
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          lastActiveDate: parsed.lastActiveDate
        };
        setProgress(validated);
        saveStoredProgress(validated);
        return true;
      }
    } catch (e) {
      console.error('Failed to import JSON', e);
    }
    return false;
  };

  const resetAllProgress = () => {
    const fresh: UserProgress = {
      problems: {},
      plan: initialPlanData as DayPlan[],
      settings: DEFAULT_SETTINGS
    };
    setProgress(fresh);
    saveStoredProgress(fresh);
  };

  return {
    progress,
    isLoaded,
    toggleSolved,
    toggleStar,
    updateNotes,
    updateSettings,
    updatePlan,
    exportProgressJson,
    importProgressJson,
    resetAllProgress
  };
}

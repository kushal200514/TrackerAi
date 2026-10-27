'use client';

import { useState } from 'react';
import { useProgress } from '@/lib/storage';
import { generatePlan } from '@/lib/planGenerator';
import allProblems from '@/data/sheet.json';
import allContests from '@/data/contests.json';
import { Problem, Contest, UserSettings } from '@/types';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Moon,
  Sun,
  Laptop,
  Check,
  AlertTriangle,
  Database,
  Calendar,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

const problemsTyped = allProblems as unknown as Problem[];
const contestsTyped = allContests as unknown as Contest[];

export default function SettingsPage() {
  const {
    progress,
    isLoaded,
    updateSettings,
    updatePlan,
    exportProgressJson,
    importProgressJson,
    resetAllProgress
  } = useProgress();

  const [startDate, setStartDate] = useState(progress.settings.startDate);
  const [problemsPerDay, setProblemsPerDay] = useState(progress.settings.problemsPerDay);
  const [restDay, setRestDay] = useState(progress.settings.restDay);
  const [theme, setTheme] = useState(progress.settings.theme);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveAndRegenerate = () => {
    const updatedSettings: UserSettings = {
      startDate,
      problemsPerDay: Number(problemsPerDay),
      restDay: restDay as any,
      theme
    };

    updateSettings(updatedSettings);

    // Regenerate the plan with new parameters
    // We only plan for unsolved problems if some are solved, or all problems
    const solvedIds = new Set(
      Object.entries(progress.problems)
        .filter(([, m]) => m.solved)
        .map(([id]) => id)
    );

    const problemsToSchedule = problemsTyped.filter((p) => !solvedIds.has(p.id));
    const newPlan = generatePlan(
      problemsToSchedule.length > 0 ? problemsToSchedule : problemsTyped,
      contestsTyped,
      updatedSettings
    );

    updatePlan(newPlan);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importProgressJson(content);
      if (ok) {
        setImportStatus('Progress imported successfully!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Invalid JSON backup file.');
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    resetAllProgress();
    setShowResetConfirm(false);
  };

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-slate-400 font-medium text-sm">
          Loading preferences...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
            Preferences & Data
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">
          Settings & Customization
        </h1>
      </div>

      {/* Plan Schedule Customization */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Study Plan Configuration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize your pace and regenerate the schedule anytime
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {/* Problems Per Day */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Problems Per Day
            </label>
            <select
              value={problemsPerDay}
              onChange={(e) => setProblemsPerDay(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
            >
              <option value={1}>1 Problem / Day (Light)</option>
              <option value={2}>2 Problems / Day</option>
              <option value={3}>3 Problems / Day (Relaxed)</option>
              <option value={4}>4 Problems / Day (Standard)</option>
              <option value={5}>5 Problems / Day (Intensive)</option>
              <option value={6}>6 Problems / Day (Hardcore)</option>
            </select>
          </div>

          {/* Rest Day */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Weekly Rest Day
            </label>
            <select
              value={restDay}
              onChange={(e) => setRestDay(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="Sunday">Sunday (Default)</option>
              <option value="Saturday">Saturday</option>
              <option value="Monday">Monday</option>
              <option value="Friday">Friday</option>
              <option value="None">None (7 Days / Week)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={handleSaveAndRegenerate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Save & Regenerate Plan</span>
          </button>

          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" /> Plan updated and rescheduled!
            </span>
          )}
        </div>
      </div>

      {/* Theme Selection */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Interface Appearance
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => {
              setTheme('dark');
              updateSettings({ theme: 'dark' });
            }}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
              progress.settings.theme === 'dark'
                ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-xs">Dark Mode</span>
          </button>

          <button
            onClick={() => {
              setTheme('light');
              updateSettings({ theme: 'light' });
            }}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
              progress.settings.theme === 'light'
                ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span className="text-xs">Light Mode</span>
          </button>

          <button
            onClick={() => {
              setTheme('system');
              updateSettings({ theme: 'system' });
            }}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
              progress.settings.theme === 'system'
                ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Laptop className="w-5 h-5" />
            <span className="text-xs">System Theme</span>
          </button>
        </div>
      </div>

      {/* Data Backup & Export/Import */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Data Management & Backup
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your solved checkmarks, notes, and plan stay in localStorage. Export a backup or transfer to another computer.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={exportProgressJson}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span>Export Progress (JSON)</span>
          </button>

          {/* Import JSON */}
          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-purple-500" />
            <span>Import Backup (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {importStatus && (
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 pt-1">
            {importStatus}
          </div>
        )}

        {/* Reset All Data */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400">
              Reset Progress
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Clear all solved checkboxes and start fresh
            </p>
          </div>

          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirmReset}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
              >
                Yes, Reset All
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-900/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset All Progress</span>
            </button>
          )}
        </div>
      </div>

      {/* Dataset & Sheet Verification Card */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Verified Dataset Specification</span>
        </div>
        <p>
          Extracted directly from Striver&apos;s A2Z DSA Sheet at takeuforward.org:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
          <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            Total Problems: <span className="font-bold text-slate-900 dark:text-white">495</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            Basic: <span className="font-bold text-emerald-500">84</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            Core: <span className="font-bold text-amber-500">287</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            Pro: <span className="font-bold text-rose-500">109</span>
          </div>
        </div>
      </div>
    </div>
  );
}

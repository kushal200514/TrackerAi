'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useProgress } from '@/lib/storage';
import { calculateStats } from '@/lib/streak';
import { formatDate } from '@/lib/planGenerator';
import allProblems from '@/data/sheet.json';
import { Problem } from '@/types';
import Heatmap from '@/components/Heatmap';
import {
  CheckCircle2,
  Flame,
  Star,
  FileText,
  TrendingUp,
  Award,
  ArrowRight,
  Target,
  BarChart3
} from 'lucide-react';

const problemsTyped = allProblems as unknown as Problem[];

export default function DashboardPage() {
  const { progress, isLoaded } = useProgress();
  const [todayStr, setTodayStr] = useState<string>('');

  useEffect(() => {
    setTodayStr(formatDate(new Date()));
  }, []);

  const stats = calculateStats(problemsTyped, progress, todayStr);

  // Per-topic statistics
  const topicStats = useMemo(() => {
    const map = new Map<string, { total: number; solved: number; slug: string }>();

    problemsTyped.forEach((p) => {
      const current = map.get(p.topic) || { total: 0, solved: 0, slug: p.topicSlug };
      current.total++;
      if (progress.problems[p.id]?.solved) {
        current.solved++;
      }
      map.set(p.topic, current);
    });

    return Array.from(map.entries()).map(([topic, data]) => ({
      topic,
      slug: data.slug,
      total: data.total,
      solved: data.solved,
      percent: data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0
    }));
  }, [progress.problems]);

  // Forecast ETA
  const etaDays = useMemo(() => {
    const remaining = stats.totalProblems - stats.totalSolved;
    const pace = progress.settings.problemsPerDay || 3;
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / pace);
  }, [stats.totalProblems, stats.totalSolved, progress.settings.problemsPerDay]);

  if (!isLoaded) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-slate-400 font-medium text-sm">
          Loading analytics dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
            Analytics & Progress
          </span>
          <span className="text-xs text-slate-400 font-medium">
            • Striver&apos;s A2Z DSA Mastery
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">
          Progress Dashboard
        </h1>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Solved */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Solved
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalSolved}
              <span className="text-base font-normal text-slate-400"> / {stats.totalProblems}</span>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stats.overallPercentage}% Completed</span>
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Streak
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.currentStreak}
              <span className="text-base font-normal text-slate-400"> Days</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Best record: {stats.longestStreak} days
            </div>
          </div>
        </div>

        {/* Starred Problems */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Starred
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.starredCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Queued for revision days
            </div>
          </div>
        </div>

        {/* Forecast ETA */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Est. Completion
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              ~{etaDays}
              <span className="text-base font-normal text-slate-400"> Days</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              At {progress.settings.problemsPerDay} problems / day pace
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown (Basic / Core / Pro) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span>Difficulty Breakdown</span>
          </h2>
          <span className="text-xs text-slate-400">
            Matches TakeUForward official classification
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Basic */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Basic
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {stats.basicSolved} / {stats.basicTotal} ({stats.basicTotal > 0 ? Math.round((stats.basicSolved / stats.basicTotal) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${stats.basicTotal > 0 ? (stats.basicSolved / stats.basicTotal) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Core */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Core
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {stats.coreSolved} / {stats.coreTotal} ({stats.coreTotal > 0 ? Math.round((stats.coreSolved / stats.coreTotal) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${stats.coreTotal > 0 ? (stats.coreSolved / stats.coreTotal) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Pro */}
          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                Pro
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {stats.proSolved} / {stats.proTotal} ({stats.proTotal > 0 ? Math.round((stats.proSolved / stats.proTotal) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all"
                style={{ width: `${stats.proTotal > 0 ? (stats.proSolved / stats.proTotal) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* GitHub-style Heatmap */}
      <Heatmap activityDates={stats.activityDates} />

      {/* Per-Topic Breakdown Cards */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Topic-by-Topic Mastery
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track completion across all 20 syllabus sections
            </p>
          </div>
          <Link
            href="/sheet"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Open Full Sheet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {topicStats.map((item) => (
            <div
              key={item.topic}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {item.topic}
                  </h4>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 shrink-0">
                    {item.percent}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.solved} of {item.total} solved
                </div>
              </div>

              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-3">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

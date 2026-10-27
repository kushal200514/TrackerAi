'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useProgress } from '@/lib/storage';
import { formatDate, autoReschedulePlan } from '@/lib/planGenerator';
import allProblems from '@/data/sheet.json';
import allContests from '@/data/contests.json';
import { Problem, Contest, DayPlan } from '@/types';
import {
  Calendar as CalendarIcon,
  List,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Coffee,
  ArrowRight,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';

const problemsTyped = allProblems as unknown as Problem[];
const contestsTyped = allContests as unknown as Contest[];

const problemsById = new Map<string, Problem>();
problemsTyped.forEach((p) => problemsById.set(p.id, p));

export default function PlanPage() {
  const { progress, isLoaded, updatePlan } = useProgress();
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [filterStatus, setFilterStatus] = useState<'all' | 'missed' | 'done' | 'upcoming'>('all');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [todayStr, setTodayStr] = useState<string>('');

  useEffect(() => {
    setTodayStr(formatDate(new Date()));
  }, []);

  const plan = progress.plan;

  // Compute status for each day
  const daysWithStatus = useMemo(() => {
    return plan.map((day) => {
      if (day.type === 'rest') {
        return { ...day, status: 'rest' as const, solvedCount: 0, totalCount: 0 };
      }
      if (day.type === 'revision') {
        return { ...day, status: 'revision' as const, solvedCount: 0, totalCount: 0 };
      }

      const total = day.problemIds.length;
      const solved = day.problemIds.filter((pid) => progress.problems[pid]?.solved).length;

      let status: 'done' | 'in_progress' | 'missed' | 'upcoming' = 'upcoming';

      if (total > 0 && solved === total) {
        status = 'done';
      } else if (day.date < todayStr) {
        status = solved > 0 ? 'in_progress' : 'missed';
      } else if (day.date === todayStr) {
        status = solved > 0 ? 'in_progress' : 'upcoming';
      } else {
        status = 'upcoming';
      }

      return {
        ...day,
        status,
        solvedCount: solved,
        totalCount: total
      };
    });
  }, [plan, todayStr, progress.problems]);

  // Filtered days
  const filteredDays = useMemo(() => {
    if (filterStatus === 'all') return daysWithStatus;
    if (filterStatus === 'missed') return daysWithStatus.filter((d) => d.status === 'missed' || d.status === 'in_progress');
    if (filterStatus === 'done') return daysWithStatus.filter((d) => d.status === 'done');
    if (filterStatus === 'upcoming') return daysWithStatus.filter((d) => d.status === 'upcoming');
    return daysWithStatus;
  }, [daysWithStatus, filterStatus]);

  const missedCount = useMemo(() => {
    return daysWithStatus.filter((d) => d.status === 'missed').length;
  }, [daysWithStatus]);

  const handleAutoReschedule = () => {
    setIsRescheduling(true);
    const newPlan = autoReschedulePlan(
      problemsTyped,
      contestsTyped,
      progress.plan,
      progress,
      todayStr
    );
    updatePlan(newPlan);
    setIsRescheduling(false);

    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.5 }
    });
  };

  if (!isLoaded) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-slate-400 font-medium text-sm">
          Loading your study plan...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Plan Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
              Personalized Roadmap
            </span>
            <span className="text-xs text-slate-400 font-medium">
              • {plan.length} Total Days ({progress.settings.problemsPerDay} Problems/Day)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            Full Schedule Plan
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Auto Reschedule CTA */}
          <button
            onClick={handleAutoReschedule}
            disabled={isRescheduling}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
              missedCount > 0
                ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Auto-Reschedule Plan</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 p-0.5">
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Days ({daysWithStatus.length})
          </button>
          <button
            onClick={() => setFilterStatus('missed')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterStatus === 'missed'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Missed / Overdue ({missedCount})
          </button>
          <button
            onClick={() => setFilterStatus('done')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterStatus === 'done'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Completed ({daysWithStatus.filter((d) => d.status === 'done').length})
          </button>
          <button
            onClick={() => setFilterStatus('upcoming')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterStatus === 'upcoming'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Upcoming
          </button>
        </div>
      </div>

      {/* View Mode: Timeline List */}
      {viewMode === 'timeline' && (
        <div className="space-y-3">
          {filteredDays.map((day) => {
            const isToday = day.date === todayStr;

            let badge = null;
            if (day.status === 'done') {
              badge = (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Done
                </span>
              );
            } else if (day.status === 'missed') {
              badge = (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <AlertCircle className="w-3 h-3" /> Missed
                </span>
              );
            } else if (day.status === 'in_progress') {
              badge = (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Clock className="w-3 h-3" /> In Progress ({day.solvedCount}/{day.totalCount})
                </span>
              );
            } else if (day.type === 'revision') {
              badge = (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Sparkles className="w-3 h-3" /> Revision
                </span>
              );
            } else if (day.type === 'rest') {
              badge = (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20">
                  <Coffee className="w-3 h-3" /> Rest Day
                </span>
              );
            }

            return (
              <div
                key={day.dayNumber}
                className={`p-4 rounded-xl border transition-all ${
                  isToday
                    ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-500/5 ring-1 ring-blue-500/40'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {day.dayOfWeek.slice(0, 3)}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                        D{day.dayNumber}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {day.date}
                        </span>
                        {isToday && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-blue-500 text-white">
                            TODAY
                          </span>
                        )}
                        {badge}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {day.type === 'new' && (
                          <span>
                            {day.problemIds.length} Problems
                            {day.contest ? ` + ${day.contest.title}` : ''}
                          </span>
                        )}
                        {day.type === 'revision' && <span>Revision Day (Starred & Weak topics)</span>}
                        {day.type === 'rest' && <span>Rest Day</span>}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/?date=${day.date}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors self-end sm:self-center"
                  >
                    <span>View Day</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Mode: Calendar Grid */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {daysWithStatus.map((day) => {
            const isToday = day.date === todayStr;

            let bgColor = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800';
            if (day.status === 'done') {
              bgColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300';
            } else if (day.status === 'missed') {
              bgColor = 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300';
            } else if (day.status === 'in_progress') {
              bgColor = 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300';
            } else if (day.type === 'revision') {
              bgColor = 'bg-purple-500/10 border-purple-500/30 text-purple-800 dark:text-purple-300';
            } else if (day.type === 'rest') {
              bgColor = 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 opacity-80';
            }

            return (
              <Link
                key={day.dayNumber}
                href={`/?date=${day.date}`}
                className={`p-3 rounded-xl border flex flex-col justify-between min-h-[90px] transition-all hover:scale-102 ${bgColor} ${
                  isToday ? 'ring-2 ring-blue-500 shadow-md' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {day.dayOfWeek.slice(0, 3)}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Day {day.dayNumber}
                  </span>
                </div>

                <div className="my-1.5">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {day.date.slice(5)}
                  </div>
                  <div className="text-xs font-bold truncate">
                    {day.type === 'new' ? `${day.solvedCount}/${day.totalCount} done` : day.type}
                  </div>
                </div>

                <div className="text-[10px] text-right font-semibold text-blue-600 dark:text-blue-400">
                  Open →
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

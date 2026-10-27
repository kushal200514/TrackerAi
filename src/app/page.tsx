'use client';

import { useState, useMemo, useEffect } from 'react';
import { useProgress } from '@/lib/storage';
import { formatDate, autoReschedulePlan } from '@/lib/planGenerator';
import { calculateStats } from '@/lib/streak';
import allProblems from '@/data/sheet.json';
import allContests from '@/data/contests.json';
import { Problem, Contest, DayPlan } from '@/types';
import ProblemCard from '@/components/ProblemCard';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  Flame,
  Award,
  Sparkles,
  Coffee,
  Trophy,
  ExternalLink,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';

const problemsTyped = allProblems as unknown as Problem[];
const contestsTyped = allContests as unknown as Contest[];

const problemsById = new Map<string, Problem>();
problemsTyped.forEach((p) => problemsById.set(p.id, p));

export default function TodayPage() {
  const {
    progress,
    isLoaded,
    toggleSolved,
    toggleStar,
    updateNotes,
    updatePlan
  } = useProgress();

  const [todayStr, setTodayStr] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  useEffect(() => {
    const current = formatDate(new Date());
    setTodayStr(current);
    setSelectedDate(current);
  }, []);

  // Find the day plan for selected date
  const plan = progress.plan;
  const currentDayIndex = useMemo(() => {
    const idx = plan.findIndex((d) => d.date === selectedDate);
    if (idx !== -1) return idx;
    // If selectedDate is not in plan, find closest or first
    const todayIdx = plan.findIndex((d) => d.date >= todayStr);
    return todayIdx !== -1 ? todayIdx : 0;
  }, [plan, selectedDate, todayStr]);

  const currentDay: DayPlan | undefined = plan[currentDayIndex];

  // Overdue problems from past days
  const overdueProblems = useMemo(() => {
    const overdueList: Problem[] = [];
    const seen = new Set<string>();

    plan.forEach((d) => {
      if (d.date < todayStr && d.type === 'new') {
        d.problemIds.forEach((pid) => {
          if (!progress.problems[pid]?.solved && !seen.has(pid)) {
            const p = problemsById.get(pid);
            if (p) {
              overdueList.push(p);
              seen.add(pid);
            }
          }
        });
      }
    });

    return overdueList;
  }, [plan, todayStr, progress.problems]);

  // Starred problems for revision days
  const starredProblems = useMemo(() => {
    return problemsTyped.filter((p) => progress.problems[p.id]?.starred);
  }, [progress.problems]);

  // Current day problem objects
  const dayProblems = useMemo(() => {
    if (!currentDay || currentDay.type !== 'new') return [];
    return currentDay.problemIds
      .map((id) => problemsById.get(id))
      .filter((p): p is Problem => !!p);
  }, [currentDay]);

  // Solved count for selected day
  const daySolvedCount = useMemo(() => {
    return dayProblems.filter((p) => progress.problems[p.id]?.solved).length;
  }, [dayProblems, progress.problems]);

  const dayTotalCount = dayProblems.length;
  const isDayCompleted = dayTotalCount > 0 && daySolvedCount === dayTotalCount;

  // Streak stats
  const stats = calculateStats(problemsTyped, progress, todayStr);

  const handlePrevDay = () => {
    if (currentDayIndex > 0) {
      setSelectedDate(plan[currentDayIndex - 1].date);
    }
  };

  const handleNextDay = () => {
    if (currentDayIndex < plan.length - 1) {
      setSelectedDate(plan[currentDayIndex + 1].date);
    }
  };

  const handleJumpToToday = () => {
    setSelectedDate(todayStr);
  };

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
    setSelectedDate(todayStr);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (!isLoaded || !currentDay) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-slate-400 font-medium text-sm">
          Loading your study plan...
        </div>
      </div>
    );
  }

  const isToday = currentDay.date === todayStr;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Top Banner: Date Nav & Jump to Today */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
              {currentDay.dayOfWeek}
            </span>
            {isToday && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                TODAY
              </span>
            )}
            <span className="text-xs text-slate-400 font-medium">
              • Day {currentDay.dayNumber} of {plan.length}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            {new Date(currentDay.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </h1>
        </div>

        {/* Date Navigator buttons */}
        <div className="flex items-center gap-2">
          {!isToday && (
            <button
              onClick={handleJumpToToday}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Back to Today
            </button>
          )}

          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
            <button
              onClick={handlePrevDay}
              disabled={currentDayIndex === 0}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
            <button
              onClick={handleNextDay}
              disabled={currentDayIndex === plan.length - 1}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Overdue Problems Alert Banner */}
      {overdueProblems.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-900 dark:text-white">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-amber-800 dark:text-amber-300">
                  {overdueProblems.length} Overdue Problem{overdueProblems.length === 1 ? '' : 's'} From Earlier Days
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  You have unfinished tasks from previous dates. Solve them below or click Auto-Reschedule to shift your plan forward.
                </p>
              </div>
            </div>

            <button
              onClick={handleAutoReschedule}
              disabled={isRescheduling}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Auto-Reschedule Plan</span>
            </button>
          </div>

          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
            {overdueProblems.map((prob) => (
              <ProblemCard
                key={prob.id}
                problem={prob}
                meta={progress.problems[prob.id]}
                onToggleSolved={toggleSolved}
                onToggleStar={toggleStar}
                onSaveNotes={updateNotes}
              />
            ))}
          </div>
        </div>
      )}

      {/* Progress Card for Current Day */}
      {currentDay.type === 'new' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Daily Completion
              </span>
              {isDayCompleted && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1">
                  <Award className="w-3 h-3" /> All Done!
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {daySolvedCount} of {dayTotalCount} Solved ({dayTotalCount > 0 ? Math.round((daySolvedCount / dayTotalCount) * 100) : 0}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300 rounded-full"
              style={{
                width: `${dayTotalCount > 0 ? (daySolvedCount / dayTotalCount) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Day Content: New Problem List OR Revision Day OR Rest Day */}
      {currentDay.type === 'new' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today&apos;s Problem Checklist
            </h2>
            <span className="text-xs text-slate-400">
              {dayTotalCount} Problem{dayTotalCount === 1 ? '' : 's'} assigned
            </span>
          </div>

          <div className="space-y-3">
            {dayProblems.map((prob) => (
              <ProblemCard
                key={prob.id}
                problem={prob}
                meta={progress.problems[prob.id]}
                onToggleSolved={toggleSolved}
                onToggleStar={toggleStar}
                onSaveNotes={updateNotes}
              />
            ))}
          </div>

          {/* Contest Block (if assigned to this topic end) */}
          {currentDay.contest && (
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-blue-900/10 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-blue-950/40 border border-indigo-500/30">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Topic Milestone Contest
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                        {currentDay.contest.problemCount} Problems
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {currentDay.contest.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Estimated duration: {currentDay.contest.estimatedTime}. Test your mastery on Striver&apos;s platform.
                    </p>
                  </div>
                </div>

                <a
                  href={currentDay.contest.practiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <span>Start Contest</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revision Day View */}
      {currentDay.type === 'revision' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Weekly Revision Day
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                No new problems are scheduled today. Spend this session revising your starred problems, weak areas, and notes.
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Your Starred Problems for Review ({starredProblems.length})</span>
              </h3>
            </div>

            {starredProblems.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  You haven&apos;t starred any problems yet. Click the star icon on any problem to queue it for your revision days!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {starredProblems.map((prob) => (
                  <ProblemCard
                    key={prob.id}
                    problem={prob}
                    meta={progress.problems[prob.id]}
                    onToggleSolved={toggleSolved}
                    onToggleStar={toggleStar}
                    onSaveNotes={updateNotes}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rest Day View */}
      {currentDay.type === 'rest' && (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Coffee className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Scheduled Rest Day
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">
              Consistency includes resting! Recharge your energy for the upcoming week. If you still want to practice, explore the Sheet tab.
            </p>
          </div>
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Current Streak Protected: {stats.currentStreak} Days</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

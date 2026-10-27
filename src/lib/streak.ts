import { Problem, UserProgress } from '@/types';
import { formatDate } from './planGenerator';

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalSolved: number;
  totalProblems: number;
  overallPercentage: number;
  basicSolved: number;
  basicTotal: number;
  coreSolved: number;
  coreTotal: number;
  proSolved: number;
  proTotal: number;
  starredCount: number;
  notesCount: number;
  activityDates: Record<string, number>; // dateStr -> count
}

export function calculateStats(
  problems: Problem[],
  progress: UserProgress,
  referenceDateStr?: string
): StreakStats {
  const totalProblems = problems.length; // 495
  const activityDates: Record<string, number> = {};

  let totalSolved = 0;
  let basicSolved = 0;
  let basicTotal = 0;
  let coreSolved = 0;
  let coreTotal = 0;
  let proSolved = 0;
  let proTotal = 0;
  let starredCount = 0;
  let notesCount = 0;

  problems.forEach((p) => {
    if (p.difficulty === 'Basic') basicTotal++;
    else if (p.difficulty === 'Core') coreTotal++;
    else if (p.difficulty === 'Pro') proTotal++;

    const meta = progress.problems[p.id];
    if (meta?.solved) {
      totalSolved++;
      if (p.difficulty === 'Basic') basicSolved++;
      else if (p.difficulty === 'Core') coreSolved++;
      else if (p.difficulty === 'Pro') proSolved++;

      if (meta.solvedAt) {
        const solvedDate = meta.solvedAt.split('T')[0];
        activityDates[solvedDate] = (activityDates[solvedDate] || 0) + 1;
      }
    }

    if (meta?.starred) starredCount++;
    if (meta?.notes && meta.notes.trim().length > 0) notesCount++;
  });

  // Calculate streaks
  const activeDateStrings = Object.keys(activityDates).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  activeDateStrings.forEach((dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const curDate = new Date(y, m - 1, d);

    if (prevDate) {
      const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = curDate;
  });

  // Calculate current streak
  let currentStreak = 0;
  if (referenceDateStr) {
    const [y, m, d] = referenceDateStr.split('-').map(Number);
    const today = new Date(y, m - 1, d);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    if (activityDates[referenceDateStr]) {
      let checkDate = new Date(today);
      while (activityDates[formatDate(checkDate)]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else if (activityDates[yesterdayStr]) {
      let checkDate = new Date(yesterday);
      while (activityDates[formatDate(checkDate)]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
  }

  const overallPercentage = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  return {
    currentStreak,
    longestStreak,
    totalSolved,
    totalProblems,
    overallPercentage,
    basicSolved,
    basicTotal,
    coreSolved,
    coreTotal,
    proSolved,
    proTotal,
    starredCount,
    notesCount,
    activityDates
  };
}

'use client';

import { useMemo } from 'react';
import { formatDate } from '@/lib/planGenerator';

interface HeatmapProps {
  activityDates: Record<string, number>; // YYYY-MM-DD -> count
}

export default function Heatmap({ activityDates }: HeatmapProps) {
  // Generate the last 20 weeks (140 days) ending today
  const weeks = useMemo(() => {
    const result: { dateStr: string; count: number; dayOfWeek: number }[][] = [];
    const today = new Date();
    
    // Find the end of the current week (Saturday)
    const endDate = new Date(today);
    const dayOfWeek = endDate.getDay();
    endDate.setDate(endDate.getDate() + (6 - dayOfWeek));

    // 20 weeks back
    const totalDays = 20 * 7;
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - totalDays + 1);

    let currentWeek: { dateStr: string; count: number; dayOfWeek: number }[] = [];
    const iter = new Date(startDate);

    while (iter <= endDate) {
      const dStr = formatDate(iter);
      const count = activityDates[dStr] || 0;

      currentWeek.push({
        dateStr: dStr,
        count,
        dayOfWeek: iter.getDay()
      });

      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }

      iter.setDate(iter.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }

    return result;
  }, [activityDates]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-800';
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-800 text-emerald-800';
    if (count === 2) return 'bg-emerald-400 dark:bg-emerald-600 border-emerald-500 text-white';
    return 'bg-emerald-600 dark:bg-emerald-400 border-emerald-700 text-white';
  };

  const totalActiveDays = Object.values(activityDates).filter((c) => c > 0).length;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Daily Activity Heatmap
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {totalActiveDays} active study days recorded
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Less</span>
          <div className="w-3 h-3 rounded-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <div className="w-3 h-3 rounded-xs bg-emerald-200 dark:bg-emerald-900" />
          <div className="w-3 h-3 rounded-xs bg-emerald-400 dark:bg-emerald-600" />
          <div className="w-3 h-3 rounded-xs bg-emerald-600 dark:bg-emerald-400" />
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-1.5 min-w-full">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => (
                <div
                  key={day.dateStr}
                  title={`${day.dateStr}: ${day.count} problem${day.count === 1 ? '' : 's'} solved`}
                  className={`w-3.5 h-3.5 rounded-xs border transition-transform hover:scale-125 cursor-pointer ${getColor(
                    day.count
                  )}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

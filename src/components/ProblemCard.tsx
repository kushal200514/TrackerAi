'use client';

import { useState } from 'react';
import { Problem, ProblemMeta } from '@/types';
import {
  Check,
  Star,
  ExternalLink,
  BookOpen,
  Video,
  Code2,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ProblemModal from './ProblemModal';

interface ProblemCardProps {
  problem: Problem;
  meta?: ProblemMeta;
  onToggleSolved: (id: string) => void;
  onToggleStar: (id: string) => void;
  onSaveNotes: (id: string, notes: string) => void;
  showTopic?: boolean;
}

export default function ProblemCard({
  problem,
  meta,
  onToggleSolved,
  onToggleStar,
  onSaveNotes,
  showTopic = true
}: ProblemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isSolved = !!meta?.solved;
  const isStarred = !!meta?.starred;
  const hasNotes = !!meta?.notes && meta.notes.trim().length > 0;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSolved) {
      // Fire confetti burst!
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });
    }
    onToggleSolved(problem.id);
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStar(problem.id);
  };

  const diffBadgeColor =
    problem.difficulty === 'Basic'
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      : problem.difficulty === 'Core'
      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      : problem.difficulty === 'Pro'
      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={`group p-4 rounded-xl border transition-all cursor-pointer ${
          isSolved
            ? 'bg-emerald-500/5 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox Button */}
          <button
            onClick={handleCheckboxClick}
            aria-label={isSolved ? 'Mark as unsolved' : 'Mark as solved'}
            className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              isSolved
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs shadow-emerald-500/30 animate-check'
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 bg-white dark:bg-slate-950'
            }`}
          >
            {isSolved && <Check className="w-4 h-4 stroke-[2.5]" />}
          </button>

          {/* Title & Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] font-mono text-slate-400">
                #{problem.order}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diffBadgeColor}`}>
                {problem.difficulty || (problem.layoutType === 'learning' ? 'Theory' : 'Basic')}
              </span>
              {problem.duration && (
                <span className="text-[11px] text-slate-400">
                  {problem.duration}
                </span>
              )}
              {showTopic && (
                <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                  {problem.topic} {problem.subtopic ? `› ${problem.subtopic}` : ''}
                </span>
              )}
            </div>

            <h4
              className={`text-sm sm:text-base font-semibold leading-tight line-clamp-2 transition-colors ${
                isSolved
                  ? 'text-slate-500 dark:text-slate-400 line-through'
                  : 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }`}
            >
              {problem.title}
            </h4>

            {/* Direct Links Toolbar */}
            <div
              className="mt-2.5 flex items-center gap-2 flex-wrap"
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href={problem.practiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Practice on TakeUForward"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Practice</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>

              {problem.leetcodeUrl && (
                <a
                  href={problem.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LeetCode Problem"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                >
                  <span className="font-bold text-[10px]">LC</span>
                  <span>LeetCode</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}

              {problem.articleUrl && (
                <a
                  href={problem.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Striver's Article"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Article</span>
                </a>
              )}

              {problem.videoUrl && (
                <a
                  href={problem.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Video Editorial"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                >
                  <Video className="w-3 h-3" />
                  <span>Video</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Action Icons (Star & Notes) */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {hasNotes && (
              <button
                onClick={() => setIsModalOpen(true)}
                title="View Notes"
                className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
              >
                <FileText className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleStarClick}
              aria-label={isStarred ? 'Remove star' : 'Star for revision'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Star
                className={`w-4 h-4 ${
                  isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <ProblemModal
        problem={problem}
        meta={meta}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onToggleSolved={onToggleSolved}
        onToggleStar={onToggleStar}
        onSaveNotes={onSaveNotes}
      />
    </>
  );
}

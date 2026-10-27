'use client';

import { useState, useEffect } from 'react';
import { Problem, ProblemMeta } from '@/types';
import {
  X,
  Star,
  ExternalLink,
  BookOpen,
  Video,
  Code2,
  CheckCircle2,
  Clock,
  Tag
} from 'lucide-react';

interface ProblemModalProps {
  problem: Problem | null;
  meta?: ProblemMeta;
  isOpen: boolean;
  onClose: () => void;
  onToggleSolved: (id: string) => void;
  onToggleStar: (id: string) => void;
  onSaveNotes: (id: string, notes: string) => void;
}

export default function ProblemModal({
  problem,
  meta,
  isOpen,
  onClose,
  onToggleSolved,
  onToggleStar,
  onSaveNotes
}: ProblemModalProps) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setNotes(meta?.notes || '');
  }, [meta?.notes, problem?.id]);

  if (!isOpen || !problem) return null;

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    onSaveNotes(problem.id, val);
  };

  const isSolved = !!meta?.solved;
  const isStarred = !!meta?.starred;

  const diffBadgeColor =
    problem.difficulty === 'Basic'
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      : problem.difficulty === 'Core'
      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      : problem.difficulty === 'Pro'
      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                #{problem.order}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${diffBadgeColor}`}>
                {problem.difficulty || (problem.layoutType === 'learning' ? 'Theory' : 'Uncategorized')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {problem.topic} {problem.subtopic ? `› ${problem.subtopic}` : ''}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {problem.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Actions & Status */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex-wrap gap-3">
            <button
              onClick={() => onToggleSolved(problem.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                isSolved
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isSolved ? 'animate-check' : ''}`} />
              {isSolved ? 'Solved' : 'Mark as Solved'}
            </button>

            <button
              onClick={() => onToggleStar(problem.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer border ${
                isStarred
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-400'
              }`}
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
              {isStarred ? 'Starred for Revision' : 'Star for Revision'}
            </button>

            {meta?.solvedAt && (
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 w-full sm:w-auto">
                <Clock className="w-3.5 h-3.5" />
                Solved on {new Date(meta.solvedAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Practice & Learning Resources
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={problem.practiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:shadow-xs transition-all text-sm font-medium text-slate-900 dark:text-white group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <span>TakeUForward Practice</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </a>

              {problem.leetcodeUrl && (
                <a
                  href={problem.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-xs transition-all text-sm font-medium text-slate-900 dark:text-white group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                      LC
                    </div>
                    <span>LeetCode Problem</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                </a>
              )}

              {problem.articleUrl && (
                <a
                  href={problem.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 hover:shadow-xs transition-all text-sm font-medium text-slate-900 dark:text-white group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span>Striver Article / Guide</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
                </a>
              )}

              {problem.videoUrl && (
                <a
                  href={problem.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-red-500 hover:shadow-xs transition-all text-sm font-medium text-slate-900 dark:text-white group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                      <Video className="w-4 h-4" />
                    </div>
                    <span>Video Editorial</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
                </a>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Personal Notes & Code Observations
              </h3>
              <span className="text-[11px] text-slate-400">Auto-saved to device</span>
            </div>
            <textarea
              value={notes}
              onChange={handleNotesChange}
              placeholder="Record your approach, time complexity, edge cases, and key takeaways for quick revision..."
              rows={5}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

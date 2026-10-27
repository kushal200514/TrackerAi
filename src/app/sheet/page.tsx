'use client';

import { useState, useMemo } from 'react';
import { useProgress } from '@/lib/storage';
import allProblems from '@/data/sheet.json';
import { Problem } from '@/types';
import ProblemCard from '@/components/ProblemCard';
import {
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Filter,
  Star,
  Layers,
  FolderOpen,
  Folder
} from 'lucide-react';

const problemsTyped = allProblems as unknown as Problem[];

export default function SheetPage() {
  const {
    progress,
    isLoaded,
    toggleSolved,
    toggleStar,
    updateNotes
  } = useProgress();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unsolved' | 'solved'>('all');
  const [starredOnly, setStarredOnly] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Group problems by Topic -> Subtopic
  const topicHierarchy = useMemo(() => {
    const map = new Map<string, Map<string, Problem[]>>();

    problemsTyped.forEach((p) => {
      const topic = p.topic || 'General';
      const subtopic = p.subtopic || 'General';

      if (!map.has(topic)) {
        map.set(topic, new Map());
      }
      const subMap = map.get(topic)!;
      if (!subMap.has(subtopic)) {
        subMap.set(subtopic, []);
      }
      subMap.get(subtopic)!.push(p);
    });

    return map;
  }, []);

  // Filter problems based on user controls
  const filteredProblems = useMemo(() => {
    return problemsTyped.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesTopic = p.topic.toLowerCase().includes(q);
        const matchesSubtopic = p.subtopic.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTopic && !matchesSubtopic) return false;
      }

      // Difficulty
      if (selectedDifficulty !== 'all') {
        if (p.difficulty?.toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
      }

      // Status
      const isSolved = !!progress.problems[p.id]?.solved;
      if (selectedStatus === 'solved' && !isSolved) return false;
      if (selectedStatus === 'unsolved' && isSolved) return false;

      // Starred
      if (starredOnly && !progress.problems[p.id]?.starred) return false;

      return true;
    });
  }, [searchQuery, selectedDifficulty, selectedStatus, starredOnly, progress.problems]);

  // Set of filtered problem IDs for fast lookup
  const filteredProblemIds = useMemo(() => {
    return new Set(filteredProblems.map((p) => p.id));
  }, [filteredProblems]);

  const toggleTopic = (topic: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  const expandAll = () => {
    const allExp: Record<string, boolean> = {};
    Array.from(topicHierarchy.keys()).forEach((t) => (allExp[t] = true));
    setExpandedTopics(allExp);
  };

  const collapseAll = () => {
    setExpandedTopics({});
  };

  // Per-topic statistics
  const topicStats = useMemo(() => {
    const stats: Record<string, { total: number; solved: number; percent: number }> = {};
    Array.from(topicHierarchy.entries()).forEach(([topic, subMap]) => {
      let total = 0;
      let solved = 0;
      subMap.forEach((probs) => {
        probs.forEach((p) => {
          total++;
          if (progress.problems[p.id]?.solved) solved++;
        });
      });
      stats[topic] = {
        total,
        solved,
        percent: total > 0 ? Math.round((solved / total) * 100) : 0
      };
    });
    return stats;
  }, [topicHierarchy, progress.problems]);

  if (!isLoaded) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-slate-400 font-medium text-sm">
          Loading Striver&apos;s A2Z sheet...
        </div>
      </div>
    );
  }

  const allTopics = Array.from(topicHierarchy.keys());

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                Complete Syllabus
              </span>
              <span className="text-xs text-slate-400 font-medium">
                • 495 Problems across 20 Topics
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Striver&apos;s A2Z DSA Sheet
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problem or topic..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="all">All Difficulties</option>
            <option value="basic">Basic</option>
            <option value="core">Core</option>
            <option value="pro">Pro</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="all">All Status</option>
            <option value="unsolved">Unsolved Only</option>
            <option value="solved">Solved Only</option>
          </select>

          {/* Starred Toggle */}
          <button
            onClick={() => setStarredOnly((prev) => !prev)}
            className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              starredOnly
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${starredOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Starred Only</span>
          </button>
        </div>

        {/* Results summary if filtered */}
        {(searchQuery || selectedDifficulty !== 'all' || selectedStatus !== 'all' || starredOnly) && (
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              Showing {filteredProblems.length} of {problemsTyped.length} problems matching filters
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDifficulty('all');
                setSelectedStatus('all');
                setStarredOnly(false);
              }}
              className="text-blue-500 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Accordion List of All 20 Topics */}
      <div className="space-y-4">
        {allTopics.map((topic) => {
          const subMap = topicHierarchy.get(topic)!;
          const stats = topicStats[topic] || { total: 0, solved: 0, percent: 0 };

          // Count matching problems in this topic
          let matchingCount = 0;
          subMap.forEach((probs) => {
            probs.forEach((p) => {
              if (filteredProblemIds.has(p.id)) matchingCount++;
            });
          });

          // If filtering active and topic has no matches, hide
          if (filteredProblems.length < problemsTyped.length && matchingCount === 0) {
            return null;
          }

          // Auto-expand if search/filter is active
          const isFilterActive = searchQuery || selectedDifficulty !== 'all' || selectedStatus !== 'all' || starredOnly;
          const isExpanded = isFilterActive ? true : !!expandedTopics[topic];

          return (
            <div
              key={topic}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
            >
              {/* Topic Header Accordion Button */}
              <button
                onClick={() => toggleTopic(topic)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                    {isExpanded ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                      {topic}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {stats.solved}/{stats.total} Solved ({stats.percent}%)
                      {matchingCount < stats.total && ` • ${matchingCount} match filters`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Mini Progress Bar */}
                  <div className="w-16 sm:w-28 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${stats.percent}%` }}
                    />
                  </div>

                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Subtopics and Problems Container */}
              {isExpanded && (
                <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-6">
                  {Array.from(subMap.entries()).map(([subtopic, probs]) => {
                    const matchingSubProbs = probs.filter((p) => filteredProblemIds.has(p.id));
                    if (matchingSubProbs.length === 0) return null;

                    return (
                      <div key={subtopic} className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-blue-500" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                            {subtopic}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            ({matchingSubProbs.length})
                          </span>
                        </div>

                        <div className="space-y-2">
                          {matchingSubProbs.map((prob) => (
                            <ProblemCard
                              key={prob.id}
                              problem={prob}
                              meta={progress.problems[prob.id]}
                              onToggleSolved={toggleSolved}
                              onToggleStar={toggleStar}
                              onSaveNotes={updateNotes}
                              showTopic={false}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

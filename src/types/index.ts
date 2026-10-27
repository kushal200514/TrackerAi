export type Difficulty = 'Basic' | 'Core' | 'Pro' | null;

export interface Problem {
  id: string;
  slug: string;
  title: string;
  topic: string;
  topicSlug: string;
  subtopic: string;
  subtopicSlug: string;
  difficulty: Difficulty;
  rawDifficulty?: string | null;
  layoutType: 'practice' | 'learning';
  duration?: string;
  practiceUrl: string;
  articleUrl?: string | null;
  leetcodeUrl?: string | null;
  videoUrl?: string | null;
  order: number;
}

export interface Contest {
  id: string;
  slug: string;
  title: string;
  topic: string;
  topicSlug: string;
  problemCount: number;
  estimatedTime: string;
  practiceUrl: string;
  afterOrder?: number;
}

export type DayType = 'new' | 'revision' | 'rest';

export interface DayPlan {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  dayOfWeek: string;
  type: DayType;
  problemIds: string[];
  title?: string;
  description?: string;
  contest?: {
    id: string;
    title: string;
    problemCount: number;
    estimatedTime: string;
    practiceUrl: string;
  };
}

export interface ProblemMeta {
  solved: boolean;
  solvedAt?: string | null; // ISO string
  starred?: boolean;
  notes?: string;
  difficultyRating?: 'easy' | 'medium' | 'hard';
}

export interface UserProgress {
  problems: Record<string, ProblemMeta>; // problemId -> meta
  plan: DayPlan[];
  settings: UserSettings;
  lastActiveDate?: string;
}

export interface UserSettings {
  startDate: string; // YYYY-MM-DD
  problemsPerDay: number;
  restDay: 'Sunday' | 'Saturday' | 'None' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  theme: 'dark' | 'light' | 'system';
}

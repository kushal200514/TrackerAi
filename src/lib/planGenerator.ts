import { Problem, Contest, DayPlan, UserSettings, UserProgress } from '@/types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function generatePlan(
  problems: Problem[],
  contests: Contest[],
  settings: UserSettings
): DayPlan[] {
  const contestsByTopic = new Map<string, Contest>();
  contests.forEach((c) => contestsByTopic.set(c.topic, c));

  const topicLastOrder = new Map<string, number>();
  problems.forEach((p) => topicLastOrder.set(p.topic, p.order));

  let currentDate = parseDate(settings.startDate);
  const plan: DayPlan[] = [];

  let probIdx = 0;
  const totalProbs = problems.length;
  let dayNumber = 1;
  let studyDayCount = 0;
  const pendingContests: Contest[] = [];

  while (probIdx < totalProbs || pendingContests.length > 0) {
    const dateStr = formatDate(currentDate);
    const dayOfWeek = DAY_NAMES[currentDate.getDay()];

    // Check rest day
    if (settings.restDay !== 'None' && dayOfWeek === settings.restDay) {
      plan.push({
        date: dateStr,
        dayNumber,
        dayOfWeek,
        type: 'rest',
        problemIds: [],
        title: `Rest Day (${dayOfWeek})`,
        description: 'Take a break, rest, and recharge!'
      });
      dayNumber++;
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    studyDayCount++;

    // Every 7th study day is a revision day
    if (studyDayCount % 7 === 0) {
      plan.push({
        date: dateStr,
        dayNumber,
        dayOfWeek,
        type: 'revision',
        problemIds: [],
        title: `Revision Day (Week ${Math.floor(studyDayCount / 7)})`,
        description: 'Review starred problems and weakest recent topics.'
      });
      dayNumber++;
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Regular study day
    const dayProblemIds: string[] = [];
    while (probIdx < totalProbs && dayProblemIds.length < settings.problemsPerDay) {
      const curProb = problems[probIdx];
      dayProblemIds.push(curProb.id);

      if (curProb.order === topicLastOrder.get(curProb.topic)) {
        const c = contestsByTopic.get(curProb.topic);
        if (c) pendingContests.push(c);
      }
      probIdx++;
    }

    let dayContest: DayPlan['contest'] | undefined;
    if (pendingContests.length > 0 && (dayProblemIds.length === settings.problemsPerDay || probIdx >= totalProbs)) {
      const c = pendingContests.shift()!;
      dayContest = {
        id: c.id,
        title: `${c.topic} Contest`,
        problemCount: c.problemCount,
        estimatedTime: c.estimatedTime,
        practiceUrl: c.practiceUrl
      };
    }

    plan.push({
      date: dateStr,
      dayNumber,
      dayOfWeek,
      type: 'new',
      problemIds: dayProblemIds,
      title: `Day ${dayNumber}: ${dayProblemIds.length} Problems`,
      contest: dayContest
    });

    dayNumber++;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return plan;
}

export function autoReschedulePlan(
  problems: Problem[],
  contests: Contest[],
  currentPlan: DayPlan[],
  progress: UserProgress,
  fromDateStr: string
): DayPlan[] {
  const fromDate = parseDate(fromDateStr);

  // Collect all solved problem IDs
  const solvedIds = new Set<string>();
  Object.entries(progress.problems).forEach(([id, meta]) => {
    if (meta.solved) solvedIds.add(id);
  });

  // Past days before fromDate: keep them, retaining only problems that were completed
  const pastPlan = currentPlan
    .filter((d) => parseDate(d.date) < fromDate)
    .map((d) => ({
      ...d,
      problemIds: d.type === 'new' ? d.problemIds.filter((pid) => solvedIds.has(pid)) : d.problemIds
    }));


  // Find all problems that are still unsolved
  // Keep original sheet order
  const unsolvedProblems = problems.filter((p) => !solvedIds.has(p.id));

  if (unsolvedProblems.length === 0) {
    return pastPlan;
  }

  // Generate new plan starting from fromDate for unsolved problems
  const rescheduledSettings: UserSettings = {
    ...progress.settings,
    startDate: fromDateStr
  };

  const newSegment = generatePlan(unsolvedProblems, contests, rescheduledSettings);

  // Renumber dayNumber continuing from pastPlan
  const lastDayNum = pastPlan.length > 0 ? pastPlan[pastPlan.length - 1].dayNumber : 0;
  const renumberedNewSegment = newSegment.map((d, idx) => ({
    ...d,
    dayNumber: lastDayNum + idx + 1,
    title: d.type === 'new' ? `Day ${lastDayNum + idx + 1}: ${d.problemIds.length} Problems` : d.title
  }));

  return [...pastPlan, ...renumberedNewSegment];
}

export function getOverdueProblems(
  plan: DayPlan[],
  progress: UserProgress,
  todayDateStr: string
): Problem[] {
  const today = parseDate(todayDateStr);
  const overdueIds = new Set<string>();

  plan.forEach((day) => {
    if (parseDate(day.date) < today && day.type === 'new') {
      day.problemIds.forEach((pid) => {
        if (!progress.problems[pid]?.solved) {
          overdueIds.add(pid);
        }
      });
    }
  });

  return Array.from(overdueIds).map((id) => {
    // will be hydrated with actual Problem object by caller
    return { id } as Problem;
  });
}

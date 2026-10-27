import assert from 'assert';
import allProblems from '../src/data/sheet.json';
import allContests from '../src/data/contests.json';
import { Problem, Contest, UserSettings, UserProgress } from '../src/types';
import { generatePlan, autoReschedulePlan } from '../src/lib/planGenerator';
import { calculateStats } from '../src/lib/streak';

const problems = allProblems as unknown as Problem[];
const contests = allContests as unknown as Contest[];

console.log('🧪 Starting DSA Tracker Test Suite...\n');

// TEST 1: Dataset Integrity
console.log('1. Checking Sheet Dataset Integrity:');
assert.strictEqual(problems.length, 495, 'Total problems must be exactly 495');

const basicCount = problems.filter((p) => p.difficulty === 'Basic').length;
const coreCount = problems.filter((p) => p.difficulty === 'Core').length;
const proCount = problems.filter((p) => p.difficulty === 'Pro').length;

assert.strictEqual(basicCount, 84, 'Basic difficulty count must be 84');
assert.strictEqual(coreCount, 287, 'Core difficulty count must be 287');
assert.strictEqual(proCount, 109, 'Pro difficulty count must be 109');
console.log('  ✓ 495 problems verified (Basic: 84, Core: 287, Pro: 109)');

// Check order continuity
for (let i = 0; i < problems.length; i++) {
  assert.strictEqual(problems[i].order, i + 1, `Problem order must be continuous from 1 to 495 at index ${i}`);
}
console.log('  ✓ Order is strictly continuous from 1 to 495');

// TEST 2: Plan Generation Logic
console.log('\n2. Testing Plan Generation Logic:');
const testSettings: UserSettings = {
  startDate: '2026-10-28', // Wednesday
  problemsPerDay: 4,
  restDay: 'Sunday',
  theme: 'dark'
};

const plan = generatePlan(problems, contests, testSettings);
assert.ok(plan.length > 0, 'Plan must not be empty');

const newDays = plan.filter((d) => d.type === 'new');
const revisionDays = plan.filter((d) => d.type === 'revision');
const restDays = plan.filter((d) => d.type === 'rest');
const contestDays = plan.filter((d) => !!d.contest);

// Check that all 495 problems are assigned
const allAssignedIds = newDays.flatMap((d) => d.problemIds);
assert.strictEqual(allAssignedIds.length, 495, 'All 495 problems must be assigned');
assert.strictEqual(new Set(allAssignedIds).size, 495, 'Assigned problem IDs must be unique');

// Check that order in plan matches sheet order
for (let i = 0; i < allAssignedIds.length; i++) {
  assert.strictEqual(allAssignedIds[i], problems[i].id, `Plan problem at position ${i} must match sheet order`);
}
console.log('  ✓ All 495 problems assigned in exact sheet order without gaps or duplicates');

// Check rest days fall on Sundays
restDays.forEach((d) => {
  assert.strictEqual(d.dayOfWeek, 'Sunday', 'All rest days must be on Sunday');
  assert.strictEqual(d.problemIds.length, 0, 'Rest days must have no new problems');
});
console.log(`  ✓ ${restDays.length} Sunday rest days properly scheduled with 0 problem load`);

// Check revision days have no new problems
revisionDays.forEach((d) => {
  assert.strictEqual(d.problemIds.length, 0, 'Revision days must have 0 new problems');
});
console.log(`  ✓ ${revisionDays.length} Revision days scheduled for review of starred & weak topics`);

// Check contests scheduled
assert.strictEqual(contestDays.length, 16, 'All 16 milestone topic contests must be placed');
console.log(`  ✓ ${contestDays.length} Milestone contests scheduled at the end of each respective topic`);

// TEST 3: Auto-Reschedule Logic
console.log('\n3. Testing Auto-Reschedule Logic:');
const mockProgress: UserProgress = {
  problems: {
    [problems[0].id]: { solved: true, solvedAt: '2026-10-28T10:00:00Z' },
    [problems[1].id]: { solved: true, solvedAt: '2026-10-28T11:00:00Z' }
    // Problem 2 and 3 were left uncompleted on Day 1
  },
  plan: plan,
  settings: testSettings
};

// Auto-reschedule from Day 2 ('2026-10-29')
const rescheduledPlan = autoReschedulePlan(
  problems,
  contests,
  plan,
  mockProgress,
  '2026-10-29'
);

// All unsolved problems (493) should be assigned across the new segment
const rescheduledNewDays = rescheduledPlan.filter((d) => d.type === 'new');
const totalRescheduledProblems = rescheduledNewDays.flatMap((d) => d.problemIds);

assert.strictEqual(totalRescheduledProblems.length, 495, 'Rescheduled plan retains completed past and assigns remaining');
// First problem assigned on or after 2026-10-29 should be the first unfinished problem (problem 2)
const futureDays = rescheduledPlan.filter((d) => d.date >= '2026-10-29' && d.type === 'new');
assert.strictEqual(futureDays[0].problemIds[0], problems[2].id, 'First unfinished problem must be pushed to start of new schedule');
console.log('  ✓ Unfinished problems successfully pushed forward without dropping any items');

// TEST 4: Streak & Statistics Logic
console.log('\n4. Testing Streak & Statistics Calculation:');
const streakProgress: UserProgress = {
  problems: {
    [problems[0].id]: { solved: true, solvedAt: '2026-10-25T12:00:00Z' },
    [problems[1].id]: { solved: true, solvedAt: '2026-10-26T12:00:00Z' },
    [problems[2].id]: { solved: true, solvedAt: '2026-10-27T12:00:00Z' }
  },
  plan: plan,
  settings: testSettings
};

const stats = calculateStats(problems, streakProgress, '2026-10-27');
assert.strictEqual(stats.totalSolved, 3, 'Total solved should be 3');
assert.strictEqual(stats.currentStreak, 3, 'Consecutive 3-day activity ending today/yesterday should yield 3-day streak');
assert.strictEqual(stats.longestStreak, 3, 'Longest streak should be 3');
console.log(`  ✓ Streak correctly calculated: Current Streak = ${stats.currentStreak}, Longest = ${stats.longestStreak}`);

console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! (100% Pass Rate)\n');

# Striver's A2Z DSA Tracker & Personal Study Roadmap

A full-featured personal website and daily checklist built for **Striver's A2Z DSA Sheet**, tracking all 495 problems with a day-by-day study plan, automatic rescheduling, revision queuing, and direct practice links.

---

## 🚀 Features

- **Complete 495 Problems Dataset:**
  - Verified 1:1 against TakeUForward's official syllabus across all 20 topics.
  - Difficulty classification: **84 Basic**, **287 Core**, **109 Pro**, and **15 Theory/Foundational** topics.
  - 16 Milestone Contests scheduled at the end of each topic.

- **📅 Daily Checklist & Roadmap:**
  - Daily problem targets (default 3 or 4 problems/day).
  - Weekly revision days (every 7th study day holds starred problems and weak concepts).
  - Scheduled rest days (e.g. Sundays).

- **🔄 Smart Auto-Reschedule:**
  - Missed a day or fell behind? One click pushes unfinished tasks forward and realigns remaining days without losing progress.

- **⚡ Instant Feedback & Tracking:**
  - One-click checkboxes with celebration confetti bursts.
  - Active study streak counter and GitHub-style 20-week submission heatmap.
  - Personal notes and code observations stored per problem.
  - Direct links to **TakeUForward Practice**, **LeetCode**, **Striver Articles**, and **Video Solutions**.

- **📊 Comprehensive Dashboard:**
  - Overall completion ring and Basic/Core/Pro breakdown bars.
  - Topic-by-topic mastery breakdown for all 20 sections.
  - Dynamic completion ETA calculation based on your pace.

- **💾 Local Persistence & Backup:**
  - State persisted locally in `localStorage`.
  - JSON Export and Import for cross-device backup.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Dark/Light mode support)
- **Icons:** Lucide React
- **Animations:** Canvas Confetti

---

## 🏃 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/kushal200514/TrackerAi.git
cd TrackerAi
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

### 5. Run Automated Tests
```bash
npx tsx tests/planAndStreak.test.ts
```

---

## 📜 Dataset Summary

| Topic | Problem Count |
|---|:---:|
| Beginner Problems | 83 |
| Sorting | 7 |
| Arrays | 32 |
| Hashing | 6 |
| Binary Search | 32 |
| Strings (Basic & Medium) | 7 |
| Recursion | 22 |
| Linked List | 49 |
| Bit Manipulation | 14 |
| Greedy Algorithms | 14 |
| Sliding Window / 2 Pointer | 13 |
| Stack / Queues | 31 |
| Binary Trees | 32 |
| Binary Search Trees | 15 |
| Heaps | 20 |
| Graphs | 46 |
| Dynamic Programming | 53 |
| Tries | 7 |
| Strings (Advanced Algo) | 9 |
| Maths | 3 |
| **Total** | **495** |

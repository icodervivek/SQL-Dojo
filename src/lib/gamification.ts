// XP, levels, streaks, badges and the daily challenge.
// Everything here is *derived* from saved progress (solve and lesson timestamps), so there is
// no extra state to store or sync, and it can never get out of step with the real progress.
import { lessons } from "./content/lessons";
import { problems, type Difficulty, type Problem, type Topic } from "./content/problems";
import { datasetList } from "./datasets";
import type { Progress } from "./progress";

export const XP_BY_DIFFICULTY: Record<Difficulty, number> = { Easy: 10, Medium: 20, Hard: 40 };
export const LESSON_XP = 15;

const LEVEL_TITLES = [
  "SQL Newbie",
  "Query Apprentice",
  "SELECT Specialist",
  "JOIN Journeyman",
  "Data Wrangler",
  "Query Wizard",
  "SQL Master",
  "Database Legend",
];

/** Total XP needed to reach `level` (level 1 starts at 0). Each level takes 80 XP more than the last. */
export function xpForLevel(level: number) {
  return 40 * level * (level - 1);
}

/** Local calendar day, e.g. "2026-10-11". */
export function dayKey(date: Date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

function addDays(date: Date, n: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export interface Stats {
  xp: number;
  level: number;
  levelTitle: string;
  /** XP earned inside the current level, and XP needed to finish it. */
  levelXp: number;
  levelSpan: number;
  solved: number;
  solvedByDifficulty: Record<Difficulty, number>;
  lessonsDone: number;
  /** Solves + completed lessons per local day. */
  activity: Map<string, number>;
  currentStreak: number;
  bestStreak: number;
  activeToday: boolean;
}

/**
 * `today` is a local day key from the browser (see useToday). Pass null while server-rendering:
 * pages are prerendered at build time, so the server's "today" would be stale. Streak values
 * that depend on today are then 0 until the browser takes over.
 */
export function computeStats(progress: Progress, today: string | null): Stats {
  const activity = new Map<string, number>();
  const bump = (iso?: string) => {
    if (!iso) return;
    const key = dayKey(new Date(iso));
    activity.set(key, (activity.get(key) ?? 0) + 1);
  };

  let xp = 0;
  const solvedByDifficulty: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
  for (const p of problems) {
    const entry = progress.problems[p.slug];
    if (entry?.status !== "solved") continue;
    xp += XP_BY_DIFFICULTY[p.difficulty];
    solvedByDifficulty[p.difficulty]++;
    bump(entry.solvedAt);
  }
  let lessonsDone = 0;
  for (const l of lessons) {
    const at = progress.lessons[l.slug];
    if (!at) continue;
    xp += LESSON_XP;
    lessonsDone++;
    bump(at);
  }

  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;

  // Streaks: consecutive days with at least one solve or lesson.
  const activeToday = today !== null && activity.has(today);
  let currentStreak = 0;
  if (today) {
    const now = new Date(`${today}T12:00:00`);
    let cursor = activeToday ? now : addDays(now, -1); // a streak survives until today ends
    while (activity.has(dayKey(cursor))) {
      currentStreak++;
      cursor = addDays(cursor, -1);
    }
  }
  let bestStreak = 0;
  for (const key of activity.keys()) {
    const start = new Date(`${key}T12:00:00`);
    if (activity.has(dayKey(addDays(start, -1)))) continue; // not the start of a run
    let run = 0;
    for (let d = start; activity.has(dayKey(d)); d = addDays(d, 1)) run++;
    bestStreak = Math.max(bestStreak, run);
  }

  return {
    xp,
    level,
    levelTitle: LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1],
    levelXp: xp - xpForLevel(level),
    levelSpan: xpForLevel(level + 1) - xpForLevel(level),
    solved: solvedByDifficulty.Easy + solvedByDifficulty.Medium + solvedByDifficulty.Hard,
    solvedByDifficulty,
    lessonsDone,
    activity,
    currentStreak,
    bestStreak,
    activeToday,
  };
}

/** The same problem for everyone on a given day. */
export function dailyChallenge(date = new Date()): Problem {
  const key = dayKey(date);
  let hash = 2166136261;
  for (const ch of key) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619);
  return problems[(hash >>> 0) % problems.length];
}

/** True if the user solved that day's challenge on that same day. */
function solvedAnyDailyChallenge(progress: Progress) {
  return Object.entries(progress.problems).some(([slug, p]) => {
    if (p.status !== "solved" || !p.solvedAt) return false;
    return dailyChallenge(new Date(p.solvedAt)).slug === slug;
  });
}

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earned: (progress: Progress, stats: Stats) => boolean;
}

const isSolved = (progress: Progress, p: Problem) => progress.problems[p.slug]?.status === "solved";
const allInTopics = (progress: Progress, ts: Topic[]) =>
  problems.filter((p) => ts.includes(p.topic)).every((p) => isSolved(progress, p));
const fraction = (stats: Stats) => stats.solved / problems.length;

export const badges: Badge[] = [
  { id: "first-solve", emoji: "🎯", name: "First Query", description: "Solve your first problem.", earned: (_, s) => s.solved >= 1 },
  { id: "ten-solves", emoji: "🔟", name: "Getting Warm", description: "Solve 10 problems.", earned: (_, s) => s.solved >= 10 },
  { id: "first-lesson", emoji: "📖", name: "Bookworm", description: "Complete your first lesson.", earned: (_, s) => s.lessonsDone >= 1 },
  { id: "streak-3", emoji: "🔥", name: "On Fire", description: "Practice 3 days in a row.", earned: (_, s) => s.bestStreak >= 3 },
  { id: "streak-7", emoji: "⚡", name: "Unstoppable", description: "Practice 7 days in a row.", earned: (_, s) => s.bestStreak >= 7 },
  { id: "daily", emoji: "📅", name: "Daily Challenger", description: "Solve a daily challenge on its day.", earned: (p) => solvedAnyDailyChallenge(p) },
  {
    id: "crud",
    emoji: "🛠️",
    name: "CRUD Complete",
    description: "Solve at least one CREATE TABLE, INSERT, SELECT, UPDATE and DELETE problem.",
    earned: (p) =>
      (["Create Table", "Insert", "Basics", "Update", "Delete"] as Topic[]).every((t) =>
        problems.some((q) => q.topic === t && isSolved(p, q)),
      ),
  },
  { id: "joins", emoji: "🔗", name: "JOIN Master", description: "Solve every Joins problem.", earned: (p) => allInTopics(p, ["Joins"]) },
  { id: "windows", emoji: "🪟", name: "Window Wizard", description: "Solve every Window Functions problem.", earned: (p) => allInTopics(p, ["Window Functions"]) },
  { id: "hard-5", emoji: "💪", name: "Hard Hitter", description: "Solve 5 Hard problems.", earned: (_, s) => s.solvedByDifficulty.Hard >= 5 },
  {
    id: "explorer",
    emoji: "🌍",
    name: "Data Explorer",
    description: "Solve a problem in every dataset.",
    earned: (p) => datasetList.every((d) => problems.some((q) => q.dataset === d.id && isSolved(p, q))),
  },
  { id: "scholar", emoji: "🎓", name: "Scholar", description: "Complete every lesson.", earned: (_, s) => s.lessonsDone === lessons.length },
  { id: "quarter", emoji: "🥉", name: "Bronze", description: "Solve 25% of all problems.", earned: (_, s) => fraction(s) >= 0.25 },
  { id: "half", emoji: "🥈", name: "Silver", description: "Solve 50% of all problems.", earned: (_, s) => fraction(s) >= 0.5 },
  { id: "all", emoji: "🏆", name: "Gold", description: "Solve every problem.", earned: (_, s) => s.solved === problems.length },
];

export function earnedBadgeIds(progress: Progress, stats: Stats): Set<string> {
  return new Set(badges.filter((b) => b.earned(progress, stats)).map((b) => b.id));
}

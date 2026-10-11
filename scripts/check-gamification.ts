// Tests for streaks, levels, XP and badges (src/lib/gamification.ts).
import { problems } from "../src/lib/content/problems";
import { computeStats, dailyChallenge, earnedBadgeIds, xpForLevel } from "../src/lib/gamification";
import type { Progress } from "../src/lib/progress";

let failed = 0;
function expect(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : ` (got ${JSON.stringify(got)}, want ${JSON.stringify(want)})`}`);
}

/** Progress where problem i was solved at local noon on the given day. */
function solvedOn(days: string[]): Progress {
  const p: Progress = { problems: {}, lessons: {} };
  days.forEach((day, i) => {
    p.problems[problems[i].slug] = { status: "solved", solvedAt: new Date(`${day}T12:00:00`).toISOString() };
  });
  return p;
}

const easyXp = (n: number) => problems.slice(0, n).reduce((s, p) => s + ({ Easy: 10, Medium: 20, Hard: 40 } as const)[p.difficulty], 0);

// Streaks
const s1 = computeStats(solvedOn(["2026-10-09", "2026-10-10", "2026-10-11"]), "2026-10-11");
expect("3 days in a row ending today → streak 3", [s1.currentStreak, s1.bestStreak, s1.activeToday], [3, 3, true]);

const s2 = computeStats(solvedOn(["2026-10-09", "2026-10-10"]), "2026-10-11");
expect("streak survives until today ends", [s2.currentStreak, s2.activeToday], [2, false]);

const s3 = computeStats(solvedOn(["2026-10-08", "2026-10-09"]), "2026-10-11");
expect("missing yesterday breaks the streak", [s3.currentStreak, s3.bestStreak], [0, 2]);

const s4 = computeStats(solvedOn(["2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02", "2026-10-11"]), "2026-10-11");
expect("best streak across a month boundary", [s4.currentStreak, s4.bestStreak], [1, 4]);

const s5 = computeStats(solvedOn(["2026-10-11", "2026-10-11"]), "2026-10-11");
expect("two solves on one day count as one streak day", [s5.currentStreak, s5.activity.get("2026-10-11")], [1, 2]);

const s6 = computeStats(solvedOn(["2026-10-10", "2026-10-11"]), null);
expect("no 'today' during server render → no streak", [s6.currentStreak, s6.activeToday], [0, false]);

// XP and levels
expect("level thresholds", [xpForLevel(1), xpForLevel(2), xpForLevel(3), xpForLevel(4)], [0, 80, 240, 480]);
const s7 = computeStats(solvedOn(Array(8).fill("2026-10-11")), "2026-10-11");
expect("XP adds up by difficulty", s7.xp, easyXp(8));
const lv = computeStats({ problems: {}, lessons: Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`l${i}`, "2026-10-11T12:00:00Z"])) }, "2026-10-11");
expect("unknown lesson slugs are ignored", lv.xp, 0);
const s8 = computeStats(solvedOn(Array(problems.length).fill("2026-10-11")), "2026-10-11");
expect("solving everything reaches a high level", s8.level >= 6, true);

// Badges
const empty: Progress = { problems: {}, lessons: {} };
expect("no badges for a new user", [...earnedBadgeIds(empty, computeStats(empty, "2026-10-11"))], []);
const three = solvedOn(["2026-10-09", "2026-10-10", "2026-10-11"]);
const b = earnedBadgeIds(three, computeStats(three, "2026-10-11"));
expect("first solve + 3-day streak badges", [b.has("first-solve"), b.has("streak-3"), b.has("streak-7")], [true, true, false]);

// Daily challenge
expect("daily challenge is stable for a day", dailyChallenge(new Date("2026-10-11T08:00:00")).slug, dailyChallenge(new Date("2026-10-11T20:00:00")).slug);
const week = new Set(Array.from({ length: 7 }, (_, i) => dailyChallenge(new Date(2026, 9, 11 + i, 12)).slug));
expect("daily challenge varies across a week", week.size >= 5, true);

process.exit(failed ? 1 : 0);

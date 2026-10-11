"use client";

import { BookOpen, Flame, Lock, RotateCcw, Trophy, Zap } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { lessons } from "@/lib/content/lessons";
import { problems, type Difficulty } from "@/lib/content/problems";
import { badges, computeStats, dayKey, earnedBadgeIds, type Stats } from "@/lib/gamification";
import { resetProgress, useProgressState, type AppUser } from "@/lib/progress";
import { useToday } from "@/lib/useToday";
import { DailyChallenge } from "./DailyChallenge";
import { ProgressRing } from "./ProgressRing";

const difficultyColors: Record<Difficulty, string> = {
  Easy: "from-emerald-400 to-teal-500",
  Medium: "from-amber-400 to-orange-500",
  Hard: "from-rose-400 to-pink-600",
};

export function ProfileView() {
  const { progress, user } = useProgressState();
  const today = useToday();
  const stats = useMemo(() => computeStats(progress, today), [progress, today]);
  const earned = useMemo(() => earnedBadgeIds(progress, stats), [progress, stats]);

  return (
    <div className="space-y-6">
      {/* Level card */}
      <section className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="bg-brand absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-25 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-6">
          <ProgressRing value={stats.levelXp / stats.levelSpan} size={120} stroke={11}>
            <span className="text-center leading-tight">
              <span className="block text-xs font-semibold text-muted">LEVEL</span>
              <span className="text-gradient block text-4xl font-black">{stats.level}</span>
            </span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              {user?.imageUrl && (
                <Image
                  src={user.imageUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 rounded-full ring-2 ring-fuchsia-500/40"
                />
              )}
              <div className="min-w-0">
                <h1 className="truncate text-3xl font-extrabold tracking-tight">{displayName(user)}</h1>
                {user?.name && user.email && <p className="truncate text-sm text-muted">{user.email}</p>}
              </div>
            </div>
            <p className="mt-3">
              <span className="bg-brand inline-flex rounded-full px-3 py-1 text-sm font-bold text-white shadow-md shadow-fuchsia-500/25">
                {stats.levelTitle}
              </span>
            </p>
            <p className="mt-2 text-muted">
              <strong className="text-fg">{stats.xp} XP</strong> · {stats.levelSpan - stats.levelXp} XP to level {stats.level + 1}
            </p>
            <div className="mt-3 h-2.5 max-w-md overflow-hidden rounded-full bg-panel-2">
              <div className="bg-brand h-full rounded-full transition-all duration-700" style={{ width: `${(stats.levelXp / stats.levelSpan) * 100}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<Flame size={20} />} color="from-orange-400 to-red-500" label="Current streak" value={`${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"}`} note={stats.activeToday ? "Practiced today ✓" : stats.currentStreak > 0 ? "Practice today to keep it!" : "Solve something to start one"} />
        <StatTile icon={<Zap size={20} />} color="from-amber-400 to-yellow-500" label="Best streak" value={`${stats.bestStreak} day${stats.bestStreak === 1 ? "" : "s"}`} />
        <StatTile icon={<Trophy size={20} />} color="from-violet-500 to-fuchsia-500" label="Problems solved" value={`${stats.solved} / ${problems.length}`} />
        <StatTile icon={<BookOpen size={20} />} color="from-cyan-400 to-blue-600" label="Lessons done" value={`${stats.lessonsDone} / ${lessons.length}`} />
      </div>

      <DailyChallenge />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Heatmap */}
        <section className="glass rounded-3xl p-5">
          <h2 className="mb-1 font-extrabold">Activity</h2>
          <p className="mb-4 text-sm text-muted">Problems solved and lessons completed per day, over the last 20 weeks.</p>
          {today ? <Heatmap stats={stats} today={today} /> : <div className="h-32 animate-pulse rounded-xl bg-panel-2" />}
        </section>

        {/* By difficulty */}
        <section className="glass space-y-4 rounded-3xl p-5">
          <h2 className="font-extrabold">By difficulty</h2>
          {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => {
            const total = problems.filter((p) => p.difficulty === d).length;
            const done = stats.solvedByDifficulty[d];
            return (
              <div key={d}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold">{d}</span>
                  <span className="text-muted">
                    {done} / {total}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-panel-2">
                  <div className={`h-full rounded-full bg-gradient-to-r ${difficultyColors[d]}`} style={{ width: `${(done / total) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {/* Badges */}
      <section className="glass rounded-3xl p-5">
        <h2 className="mb-1 font-extrabold">
          Badges <span className="text-muted">· {earned.size} of {badges.length}</span>
        </h2>
        <p className="mb-4 text-sm text-muted">Earn them by solving problems, finishing lessons and keeping your streak alive.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((b) => {
            const has = earned.has(b.id);
            return (
              <div
                key={b.id}
                className={`relative rounded-2xl border p-4 text-center transition ${
                  has ? "border-accent/40 bg-gradient-to-b from-violet-500/15 to-fuchsia-500/5 shadow-lg shadow-fuchsia-500/10" : "border-border bg-panel-2 opacity-60"
                }`}
              >
                {!has && <Lock size={12} className="absolute top-2 right-2 text-muted" />}
                <div className={`text-4xl ${has ? "" : "grayscale"}`}>{b.emoji}</div>
                <p className="mt-2 text-sm font-bold">{b.name}</p>
                <p className="mt-0.5 text-xs text-muted">{b.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <ResetButton />
    </div>
  );
}

/** The user's name, or the part of their email before the @ if they haven't set one. */
function displayName(user: AppUser | null) {
  return user?.name || user?.email?.split("@")[0] || "Your profile";
}

function StatTile({ icon, color, label, value, note }: { icon: React.ReactNode; color: string; label: string; value: string; note?: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <span className={`mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg ${color}`}>{icon}</span>
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="text-2xl font-extrabold">{value}</p>
      {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
    </div>
  );
}

const WEEKS = 20;
const LEVEL_CLASSES = ["bg-panel-2", "bg-violet-500/35", "bg-violet-500/60", "bg-fuchsia-500/80", "bg-fuchsia-500"];

function Heatmap({ stats, today }: { stats: Stats; today: string }) {
  // Columns are weeks (Sunday → Saturday), ending with the current week.
  const end = new Date(`${today}T12:00:00`);
  const start = new Date(end);
  start.setDate(end.getDate() - end.getDay() - (WEEKS - 1) * 7);

  const weeks: { key: string; count: number; future: boolean }[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const key = dayKey(date);
      days.push({ key, count: stats.activity.get(key) ?? 0, future: date > end });
    }
    weeks.push(days);
  }
  const level = (n: number) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4);

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[420px] gap-1" style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}>
        {weeks.map((days, i) => (
          <div key={i} className="flex flex-col gap-1">
            {days.map((d) => (
              <div
                key={d.key}
                title={d.future ? "" : `${d.key}: ${d.count} ${d.count === 1 ? "activity" : "activities"}`}
                className={`aspect-square w-full rounded-[4px] ${d.future ? "opacity-0" : LEVEL_CLASSES[level(d.count)]} ${d.key === today ? "ring-2 ring-accent" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1 text-xs text-muted">
        Less
        {LEVEL_CLASSES.map((c) => (
          <span key={c} className={`h-3 w-3 rounded-[3px] ${c}`} />
        ))}
        More
      </div>
    </div>
  );
}

/** Two-step confirm in the page itself, so no browser dialog is needed. */
function ResetButton() {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
      {confirming ? (
        <>
          <span className="text-muted">This erases all solved problems, lessons, XP and badges.</span>
          <button onClick={() => setConfirming(false)} className="btn-ghost rounded-lg px-3 py-1.5">
            Cancel
          </button>
          <button
            onClick={() => {
              resetProgress();
              setConfirming(false);
            }}
            className="rounded-lg bg-rose-600 px-3 py-1.5 font-semibold text-white hover:bg-rose-700"
          >
            Yes, reset everything
          </button>
        </>
      ) : (
        <button onClick={() => setConfirming(true)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-muted hover:text-danger">
          <RotateCcw size={14} /> Reset progress
        </button>
      )}
    </div>
  );
}

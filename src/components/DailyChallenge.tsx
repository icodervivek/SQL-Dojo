"use client";

import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { datasets } from "@/lib/datasets";
import { dailyChallenge, dayKey, XP_BY_DIFFICULTY } from "@/lib/gamification";
import { useProgressState } from "@/lib/progress";
import { useToday } from "@/lib/useToday";
import { DifficultyBadge, TopicIcon } from "./Badges";

export function DailyChallenge() {
  const today = useToday();
  const { progress } = useProgressState();
  if (!today) return <div className="glass h-[116px] animate-pulse rounded-3xl" />;

  const problem = dailyChallenge(new Date(`${today}T12:00:00`));
  const entry = progress.problems[problem.slug];
  const doneToday = entry?.status === "solved" && entry.solvedAt && dayKey(new Date(entry.solvedAt)) === today;

  return (
    <section className="glass relative overflow-hidden rounded-3xl p-5 sm:p-6">
      <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="relative flex flex-wrap items-center gap-4">
        <TopicIcon topic={problem.topic} size={52} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-amber-500 uppercase">
            <CalendarDays size={14} /> Daily challenge
          </p>
          <h2 className="truncate text-xl font-extrabold">{problem.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            <DifficultyBadge difficulty={problem.difficulty} />
            <span>
              {datasets[problem.dataset].emoji} {datasets[problem.dataset].name}
            </span>
            <span className="font-semibold text-amber-500">+{XP_BY_DIFFICULTY[problem.difficulty]} XP</span>
          </div>
        </div>
        {doneToday ? (
          <span className="inline-flex items-center gap-2 rounded-xl bg-success-bg px-4 py-2.5 text-sm font-semibold text-success">
            <CheckCircle2 size={16} /> Done for today!
          </span>
        ) : (
          <Link href={`/problems/${problem.slug}`} className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
            Solve it <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </section>
  );
}

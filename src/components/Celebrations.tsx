"use client";

import { Sparkles, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { badges, computeStats, dayKey, earnedBadgeIds } from "@/lib/gamification";
import { onLocalProgressChange } from "@/lib/progress";

interface Toast {
  id: number;
  kind: "xp" | "level" | "badge" | "streak";
  title: string;
  body?: string;
  emoji: string;
}

let nextId = 1;

/** Pops up toasts for XP gains, level-ups, new badges and streak milestones. */
export function Celebrations() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(
    () =>
      onLocalProgressChange((before, after) => {
        const today = dayKey(new Date()); // runs in an event handler, never during render
        const a = computeStats(before, today);
        const b = computeStats(after, today);
        const fresh: Toast[] = [];
        if (b.xp > a.xp) fresh.push({ id: nextId++, kind: "xp", emoji: "✨", title: `+${b.xp - a.xp} XP`, body: `${b.xp} XP total` });
        if (b.level > a.level) {
          fresh.push({ id: nextId++, kind: "level", emoji: "⬆️", title: `Level ${b.level}!`, body: `You're now a ${b.levelTitle}.` });
        }
        if (b.currentStreak > a.currentStreak && b.currentStreak > 1) {
          fresh.push({ id: nextId++, kind: "streak", emoji: "🔥", title: `${b.currentStreak}-day streak!`, body: "Come back tomorrow to keep it going." });
        }
        const had = earnedBadgeIds(before, a);
        for (const id of earnedBadgeIds(after, b)) {
          if (had.has(id)) continue;
          const badge = badges.find((x) => x.id === id)!;
          fresh.push({ id: nextId++, kind: "badge", emoji: badge.emoji, title: `Badge unlocked: ${badge.name}`, body: badge.description });
        }
        if (fresh.length === 0) return;
        setToasts((t) => [...t, ...fresh].slice(-5));
        for (const toast of fresh) {
          setTimeout(() => setToasts((t) => t.filter((x) => x.id !== toast.id)), toast.kind === "xp" ? 3500 : 6000);
        }
      }),
    [],
  );

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-80 flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-pop pointer-events-auto flex items-start gap-3 rounded-2xl border p-3 shadow-2xl backdrop-blur-xl ${
            t.kind === "badge" || t.kind === "level"
              ? "bg-brand border-transparent text-white shadow-fuchsia-500/30"
              : "border-border bg-panel-solid"
          }`}
        >
          <span className="text-2xl leading-none">{t.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">{t.title}</p>
            {t.body && <p className={`text-sm ${t.kind === "badge" || t.kind === "level" ? "text-white/85" : "text-muted"}`}>{t.body}</p>}
            {(t.kind === "badge" || t.kind === "level") && (
              <Link href="/profile" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold underline-offset-2 hover:underline">
                {t.kind === "badge" ? <Trophy size={12} /> : <Sparkles size={12} />} View profile
              </Link>
            )}
          </div>
          <button
            onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
            aria-label="Dismiss"
            className="opacity-60 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

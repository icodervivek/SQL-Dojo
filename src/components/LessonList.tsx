"use client";

import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { lessons } from "@/lib/content/lessons";
import { topicMeta } from "@/lib/content/topicMeta";
import { useProgressState } from "@/lib/progress";
import { ProgressRing } from "./ProgressRing";

export function LessonList() {
  const { progress } = useProgressState();
  const done = lessons.filter((l) => progress.lessons[l.slug]).length;
  const nextIndex = lessons.findIndex((l) => !progress.lessons[l.slug]);

  return (
    <div className="space-y-8">
      <div className="glass flex items-center gap-5 rounded-3xl p-5">
        <ProgressRing value={done / lessons.length} size={72} stroke={8}>
          <span className="text-sm font-extrabold">
            {done}/{lessons.length}
          </span>
        </ProgressRing>
        <div>
          <p className="font-bold">Your progress</p>
          <p className="text-sm text-muted">
            {done === lessons.length
              ? "You finished the whole path. Amazing! 🎉"
              : done === 0
                ? "Start with lesson 1. Each one takes about 5 minutes."
                : `${lessons.length - done} lessons to go. Keep it up!`}
          </p>
        </div>
      </div>

      <ol className="relative space-y-4">
        {/* Timeline line */}
        <span className="absolute top-6 bottom-6 left-[27px] w-0.5 bg-gradient-to-b from-violet-500 via-fuchsia-500 to-cyan-500 opacity-40" />
        {lessons.map((l, i) => {
          const complete = !!progress.lessons[l.slug];
          const isNext = i === nextIndex;
          const meta = topicMeta[l.topic];
          const Icon = meta.icon;
          return (
            <li key={l.slug} className="relative">
              <Link
                href={`/learn/${l.slug}`}
                className={`glass card-hover group flex items-center gap-4 rounded-2xl p-3 pr-5 ${isNext ? "ring-2 ring-accent" : ""}`}
              >
                <span
                  className={`relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${meta.gradient}`}
                >
                  {complete ? <Check size={26} strokeWidth={3} /> : <Icon size={24} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-xs font-semibold text-muted">
                    Lesson {i + 1}
                    {complete && <span className="rounded-full bg-success-bg px-2 py-0.5 text-success">Completed</span>}
                    {isNext && <span className="bg-brand rounded-full px-2 py-0.5 text-white">Up next</span>}
                  </span>
                  <span className="block truncate text-lg font-bold group-hover:text-accent">{l.title}</span>
                  <span className="block text-sm text-muted">{l.summary}</span>
                </span>
                <ChevronRight size={20} className="text-muted transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

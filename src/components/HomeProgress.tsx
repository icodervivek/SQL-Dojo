"use client";

import { ArrowRight, BookOpen, Trophy } from "lucide-react";
import Link from "next/link";
import { lessons } from "@/lib/content/lessons";
import { problems } from "@/lib/content/problems";
import { useProgressState } from "@/lib/progress";
import { ProgressRing } from "./ProgressRing";

/** Shows a "continue where you left off" card once the user has made some progress. */
export function HomeProgress() {
  const { progress } = useProgressState();
  const solved = problems.filter((p) => progress.problems[p.slug]?.status === "solved").length;
  const lessonsDone = lessons.filter((l) => progress.lessons[l.slug]).length;
  if (solved === 0 && lessonsDone === 0 && Object.keys(progress.problems).length === 0) return null;

  const nextLesson = lessons.find((l) => !progress.lessons[l.slug]);
  const nextProblem = problems.find((p) => progress.problems[p.slug]?.status !== "solved");

  return (
    <section className="glass animate-pop relative overflow-hidden rounded-3xl p-6 sm:p-8">
      <div className="bg-brand absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-20 blur-3xl" />
      <div className="relative grid items-center gap-6 md:grid-cols-[auto_1fr_auto]">
        <ProgressRing value={solved / problems.length} size={96}>
          <span className="text-2xl font-extrabold">{Math.round((solved / problems.length) * 100)}%</span>
        </ProgressRing>
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-extrabold">
            Welcome back! <Trophy size={22} className="text-amber-500" />
          </h2>
          <p className="mt-1 text-muted">
            <strong className="text-fg">{solved}</strong> of {problems.length} problems solved ·{" "}
            <strong className="text-fg">{lessonsDone}</strong> of {lessons.length} lessons done
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {nextLesson && (
            <Link href={`/learn/${nextLesson.slug}`} className="btn-ghost inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
              <BookOpen size={16} /> {nextLesson.title}
            </Link>
          )}
          {nextProblem && (
            <Link href={`/problems/${nextProblem.slug}`} className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
              Continue: {nextProblem.title} <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

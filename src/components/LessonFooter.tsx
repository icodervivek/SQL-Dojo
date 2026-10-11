"use client";

import { ArrowRight, CheckCircle2, Target } from "lucide-react";
import Link from "next/link";
import type { Problem } from "@/lib/content/problems";
import { completeLesson, useProgressState } from "@/lib/progress";
import { useRequireSignIn } from "@/lib/requireSignIn";
import { DifficultyBadge, StatusIcon, TopicIcon } from "./Badges";

export function LessonFooter({ slug, practice, next }: { slug: string; practice: Problem[]; next?: { slug: string; title: string } }) {
  const { progress } = useProgressState();
  const done = !!progress.lessons[slug];
  const { signedIn, requireSignIn } = useRequireSignIn();

  return (
    <div className="space-y-8">
      {practice.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-xl font-extrabold">
            <Target size={20} className="text-fuchsia-500" /> Practice what you learned
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {practice.map((p) => (
              <Link key={p.slug} href={`/problems/${p.slug}`} className="glass card-hover flex items-center gap-3 rounded-2xl p-3">
                <TopicIcon topic={p.topic} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{p.title}</span>
                  <DifficultyBadge difficulty={p.difficulty} />
                </span>
                <StatusIcon status={progress.problems[p.slug]?.status} />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="glass flex flex-wrap items-center gap-4 rounded-2xl p-4">
        {done ? (
          <span className="inline-flex items-center gap-2 rounded-xl bg-success-bg px-4 py-2.5 font-semibold text-success">
            <CheckCircle2 size={18} /> Lesson complete
          </span>
        ) : (
          <button
            onClick={() => requireSignIn() && completeLesson(slug)}
            className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5"
          >
            <CheckCircle2 size={18} /> {signedIn ? "Mark lesson complete" : "Sign in to save your progress"}
          </button>
        )}
        {next && (
          <Link href={`/learn/${next.slug}`} className="group ml-auto inline-flex items-center gap-2 font-semibold text-accent">
            Next: {next.title}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { LessonList } from "@/components/LessonList";

export const metadata: Metadata = { title: "Learn · SQL Dojo" };

export default function LearnPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <p className="text-gradient text-sm font-bold tracking-widest uppercase">Learning path</p>
      <h1 className="mt-1 text-4xl font-extrabold tracking-tight">From zero to SQL hero</h1>
      <p className="mt-2 mb-8 text-muted">Go from your first SELECT to window functions, one step at a time.</p>
      <LessonList />
    </div>
  );
}

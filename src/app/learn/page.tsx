import type { Metadata } from "next";
import { LessonList } from "@/components/LessonList";
import { lessons } from "@/lib/content/lessons";
import { SITE_NAME } from "@/lib/seo";

const TITLE = "Learn SQL step by step";
const DESCRIPTION = `A free SQL learning path: ${lessons.length} short lessons from CREATE TABLE and SELECT to JOINs, CTEs and window functions, each with a live editor to try it yourself.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/learn" },
  openGraph: { title: `${TITLE} · ${SITE_NAME}`, description: DESCRIPTION, url: "/learn" },
};

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

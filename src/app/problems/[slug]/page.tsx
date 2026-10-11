import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Workspace } from "@/components/Workspace";
import { problemBySlug, problems } from "@/lib/content/problems";

export function generateStaticParams() {
  return problems.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/problems/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${problemBySlug.get(slug)?.title ?? "Problem"} · SQL Dojo` };
}

export default function ProblemPage({ params }: PageProps<"/problems/[slug]">) {
  return (
    <Suspense fallback={<p className="p-10 text-center text-sm text-muted">Loading problem…</p>}>
      <ProblemWorkspace params={params} />
    </Suspense>
  );
}

async function ProblemWorkspace({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = problemBySlug.get(slug);
  if (!problem) notFound();

  const i = problems.indexOf(problem);
  return <Workspace key={problem.slug} problem={problem} prev={problems[i - 1]?.slug} next={problems[i + 1]?.slug} />;
}

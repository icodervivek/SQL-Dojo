import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Workspace } from "@/components/Workspace";
import { problemBySlug, problems } from "@/lib/content/problems";
import { datasets } from "@/lib/datasets";
import { plainText, truncate } from "@/lib/seo";

export function generateStaticParams() {
  return problems.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/problems/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const problem = problemBySlug.get(slug);
  if (!problem) return { title: "Problem not found" };
  const title = `${problem.title}: ${problem.topic} SQL Problem`;
  const description = truncate(
    `${problem.difficulty} ${problem.topic} SQL problem on the ${datasets[problem.dataset].name} dataset. ${plainText(problem.description)}`,
  );
  return {
    title,
    description,
    alternates: { canonical: `/problems/${slug}` },
    openGraph: { title, description, url: `/problems/${slug}` },
  };
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

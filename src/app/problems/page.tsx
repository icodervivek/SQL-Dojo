import type { Metadata } from "next";
import { ProblemList } from "@/components/ProblemList";
import { problems } from "@/lib/content/problems";
import { datasetList } from "@/lib/datasets";
import { SITE_NAME } from "@/lib/seo";

const TITLE = "SQL Practice Problems";
const DESCRIPTION = `${problems.length} SQL practice problems from easy to hard on realistic datasets (${datasetList
  .map((d) => d.name.toLowerCase())
  .join(", ")}), graded instantly in your browser.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/problems" },
  openGraph: { title: `${TITLE} · ${SITE_NAME}`, description: DESCRIPTION, url: "/problems" },
};

export default function ProblemsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="text-gradient text-sm font-bold tracking-widest uppercase">Practice</p>
      <h1 className="mt-1 text-4xl font-extrabold tracking-tight">Problems</h1>
      <p className="mt-2 mb-8 text-muted">Write a query, hit Submit and get graded instantly.</p>
      <ProblemList />
    </div>
  );
}

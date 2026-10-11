import type { Metadata } from "next";
import { ProblemList } from "@/components/ProblemList";

export const metadata: Metadata = { title: "Problems · SQL Dojo" };

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

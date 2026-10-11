"use client";

import { AlertTriangle, Loader2, Play, Terminal } from "lucide-react";
import { useCallback, useState } from "react";
import type { DatasetId } from "@/lib/datasets";
import type { QueryResult } from "@/lib/sql/types";
import { useRequireSignIn } from "@/lib/requireSignIn";
import { useEngine } from "@/lib/sql/useEngine";
import { ResultTable } from "./ResultTable";
import { SqlEditor } from "./SqlEditor";

/** A small editor + results box embedded in lessons. */
export function TryIt({ dataset, initial }: { dataset: DatasetId; initial: string }) {
  const { engine, ready, tables } = useEngine(dataset);
  const [query, setQuery] = useState(initial);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { signedIn, requireSignIn } = useRequireSignIn();

  const run = useCallback(async () => {
    if (!engine || !requireSignIn()) return;
    setError(null);
    try {
      // Rolled back after every run, so lesson examples (INSERT, DELETE...) can be re-run safely.
      setResult(await engine.queryIsolated(query));
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [engine, query, requireSignIn]);

  return (
    <div className="relative">
      <div className="bg-brand absolute -inset-1 rounded-[1.4rem] opacity-30 blur-xl" />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-panel-solid shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="flex items-center gap-2 text-sm font-bold">
            <Terminal size={16} className="text-fuchsia-500" /> Try it yourself
          </span>
          <button onClick={run} disabled={!ready} className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm">
            {ready ? <Play size={14} fill="currentColor" /> : <Loader2 size={14} className="animate-spin" />}
            {ready ? (signedIn ? "Run" : "Sign in to run") : "Loading"}
          </button>
        </div>
        <div className="h-44">
          <SqlEditor value={query} onChange={setQuery} onRun={run} tables={tables ?? undefined} />
        </div>
        {(result || error) && (
          <div className="animate-pop max-h-72 overflow-auto border-t border-border">
            {error ? (
              <p className="flex items-start gap-2 bg-danger-bg p-4 font-mono text-sm text-danger">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
              </p>
            ) : (
              <ResultTable result={result!} compact />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

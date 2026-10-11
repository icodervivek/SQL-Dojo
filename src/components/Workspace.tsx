"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  LogIn,
  Bot,
  CheckCircle2,
  Database,
  Eye,
  FileText,
  KeyRound,
  Lightbulb,
  LayoutList,
  Loader2,
  Play,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Problem } from "@/lib/content/problems";
import { datasets } from "@/lib/datasets";
import { recordAttempt, recordSolved, useProgressState } from "@/lib/progress";
import { compareResults, mismatchedRows, type Verdict } from "@/lib/sql/grade";
import type { QueryResult } from "@/lib/sql/types";
import { getGrader } from "@/lib/sql/engine";
import { useEngine } from "@/lib/sql/useEngine";
import { requestAiHint, useAiHintsEnabled } from "@/lib/aiHints";
import { clearDraft, readDraft, saveDraft, useRequireSignIn } from "@/lib/requireSignIn";
import { DifficultyBadge, StatusIcon, TopicBadge, TopicIcon } from "./Badges";
import { ResultTable } from "./ResultTable";
import { RichText } from "./RichText";
import { SchemaPanel } from "./SchemaPanel";
import { CodeWindow } from "./SqlCode";
import { SqlEditor } from "./SqlEditor";

const STARTER = "-- Write your query below, then press Run (Ctrl+Enter) or Submit\n";

type Output =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "error"; message: string }
  /** `note` is set when the statement changed data and `result` shows the table afterwards. */
  | { kind: "result"; result: QueryResult; note?: string }
  | { kind: "verdict"; verdict: Verdict; user: QueryResult; expected: QueryResult };

type Tab = "description" | "schema" | "solution";

const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: "description", label: "Description", icon: FileText },
  { id: "schema", label: "Schema", icon: Database },
  { id: "solution", label: "Solution", icon: KeyRound },
];

export function Workspace({ problem, prev, next }: { problem: Problem; prev?: string; next?: string }) {
  const { engine, ready, tables, error: engineError, reset, refreshSchema } = useEngine(problem.dataset);
  const { progress, loaded } = useProgressState();
  const status = progress.problems[problem.slug]?.status;

  const [query, setQuery] = useState(STARTER);
  const [output, setOutput] = useState<Output>({ kind: "idle" });
  const [tab, setTab] = useState<Tab>("description");
  const [hintsShown, setHintsShown] = useState(0);
  const [expected, setExpected] = useState<QueryResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const aiEnabled = useAiHintsEnabled();
  const { signedIn, authReady, requireSignIn, signInHref } = useRequireSignIn();
  const [ai, setAi] = useState<AiHintState>({ status: "idle" });

  // Restore the user's query once saved progress has loaded: something typed just before
  // signing in wins over the last saved attempt.
  const [restored, setRestored] = useState(false);
  if (loaded && !restored) {
    setRestored(true);
    const restore = readDraft(problem.slug) ?? progress.problems[problem.slug]?.lastQuery;
    if (restore) setQuery(restore);
  }

  /** Running and submitting need an account; keep the visitor's query while they sign in. */
  const ensureSignedIn = useCallback(() => {
    if (requireSignIn()) return true;
    saveDraft(problem.slug, query);
    return false;
  }, [requireSignIn, problem.slug, query]);

  // Data-changing problems (INSERT/UPDATE/DELETE/CREATE) are graded by the table they leave behind.
  const changesData = problem.check !== undefined;

  useEffect(() => {
    getGrader(problem.dataset)
      .queryIsolated(problem.solution, problem.check)
      .then(setExpected, () => setExpected(null));
  }, [problem]);

  // Ctrl+Enter bypasses the disabled buttons, so guard here too.
  const busy = output.kind === "running";

  const run = useCallback(async () => {
    if (!engine || busy || !ensureSignedIn()) return;
    clearDraft(problem.slug);
    setOutput({ kind: "running" });
    try {
      const result = await engine.query(query);
      if (changesData && result.columns.length === 0) {
        // Show what the statement did to the table, not just "N rows affected".
        setOutput({ kind: "result", result: await engine.query(problem.check!), note: result.message });
      } else {
        setOutput({ kind: "result", result });
      }
    } catch (err) {
      setOutput({ kind: "error", message: err instanceof Error ? err.message : String(err) });
    }
    // The query may have changed the data, so keep the Schema tab's row counts accurate.
    void refreshSchema(engine);
  }, [engine, busy, ensureSignedIn, query, refreshSchema, changesData, problem.check, problem.slug]);

  const submit = useCallback(async () => {
    if (!engine || busy || !ensureSignedIn()) return;
    clearDraft(problem.slug);
    setOutput({ kind: "running" });
    try {
      // Graded on a separate, untouched copy of the data, so earlier Runs can't affect the result.
      const { user, expected } = await getGrader(problem.dataset).grade(query, problem.solution, problem.check);
      const verdict = compareResults(user, expected, problem.orderMatters, changesData ? "table" : "query");
      if (verdict.correct) recordSolved(problem.slug, query);
      else recordAttempt(problem.slug, query);
      setOutput({ kind: "verdict", verdict, user, expected });
    } catch (err) {
      recordAttempt(problem.slug, query);
      setOutput({ kind: "error", message: err instanceof Error ? err.message : String(err) });
    }
  }, [engine, busy, ensureSignedIn, query, problem, changesData]);

  const askAi = useCallback(async () => {
    if (!ensureSignedIn()) return;
    setAi({ status: "loading" });
    try {
      setAi({ status: "done", text: await requestAiHint(problem.slug, query, describeOutput(output)) });
    } catch (err) {
      setAi({ status: "error", text: err instanceof Error ? err.message : String(err) });
    }
  }, [ensureSignedIn, problem.slug, query, output]);

  const resetDb = async () => {
    setOutput({ kind: "running" });
    await reset();
    setOutput({ kind: "idle" });
  };

  const highlight = useMemo(
    () => (output.kind === "verdict" && !output.verdict.correct ? mismatchedRows(output.user.rows, output.expected.rows) : undefined),
    [output],
  );

  return (
    <div className="grid flex-1 grid-cols-1 gap-3 p-3 lg:h-[calc(100vh-4rem)] lg:min-h-0 lg:flex-none lg:grid-cols-[minmax(360px,2fr)_3fr] lg:grid-rows-[minmax(0,1fr)]">
      {/* Left: problem */}
      <section className="glass flex min-h-0 flex-col overflow-hidden rounded-2xl">
        <div className="flex gap-1 border-b border-border p-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                tab === id ? "bg-brand text-white shadow-md shadow-fuchsia-500/25" : "text-muted hover:bg-panel-2 hover:text-fg"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {tab === "description" && (
            <div className="animate-pop space-y-5">
              <div className="flex items-start gap-4">
                <TopicIcon topic={problem.topic} size={48} />
                <div className="min-w-0">
                  <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
                    {problem.title}
                    <StatusIcon status={status} size={20} />
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <DifficultyBadge difficulty={problem.difficulty} />
                    <TopicBadge topic={problem.topic} />
                    <span className="inline-flex items-center gap-1 rounded-full bg-panel-2 px-2.5 py-0.5 text-xs font-semibold text-muted">
                      {datasets[problem.dataset].emoji} {datasets[problem.dataset].name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-[0.97rem] leading-relaxed">
                <RichText text={problem.description} />
              </div>

              <p className="rounded-xl border border-dashed border-border px-3 py-2 text-xs text-muted">
                {changesData
                  ? "Run changes your practice database (Reset DB undoes it). Submit always checks your statement against a fresh copy of the data."
                  : problem.orderMatters
                    ? "↕ Row order matters for this problem."
                    : "Row order doesn't matter. Column names and column order don't need to match."}
              </p>

              <div>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <LayoutList size={15} className="text-fuchsia-500" />
                  {changesData ? "Expected result after your statement" : "Expected output"}
                </h2>
                <div className="max-h-72 overflow-auto rounded-xl border border-border bg-panel-solid">
                  {expected ? <ResultTable result={expected} compact /> : <p className="p-3 text-sm text-muted">Loading…</p>}
                </div>
              </div>

              <div className="space-y-2">
                {problem.hints.slice(0, hintsShown).map((h, i) => (
                  <div key={i} className="animate-pop flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm">
                    <Lightbulb size={18} className="shrink-0 text-amber-500" />
                    <div>
                      <span className="font-bold text-amber-600 dark:text-amber-400">Hint {i + 1}: </span>
                      <RichText text={h} className="inline" />
                    </div>
                  </div>
                ))}
                {aiEnabled && (
                  <button
                    onClick={askAi}
                    disabled={ai.status === "loading"}
                    className="mr-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-violet-500 hover:bg-violet-500/10 disabled:opacity-50"
                  >
                    <Bot size={15} /> Ask the AI tutor about my query
                  </button>
                )}
                {hintsShown < problem.hints.length && (
                  <button
                    onClick={() => setHintsShown(hintsShown + 1)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-amber-500 hover:bg-amber-500/10"
                  >
                    <Lightbulb size={15} /> {hintsShown === 0 ? "Need a hint?" : "Show another hint"}
                  </button>
                )}
              </div>
            </div>
          )}

          {tab === "schema" && <SchemaPanel tables={tables} />}

          {tab === "solution" &&
            (status === "solved" || revealed ? (
              <div className="animate-pop space-y-4">
                <p className="text-sm text-muted">One correct answer. There are often several valid ways to write it.</p>
                <CodeWindow sql={problem.solution} title="solution.sql" />
                <button onClick={() => setQuery(problem.solution)} className="btn-ghost rounded-lg px-3 py-1.5 text-sm">
                  Copy into editor
                </button>
              </div>
            ) : (
              <div className="grid place-items-center gap-4 py-10 text-center">
                <span className="bg-brand grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg shadow-fuchsia-500/30">
                  <KeyRound size={28} />
                </span>
                <div>
                  <p className="font-bold">The solution is locked</p>
                  <p className="text-sm text-muted">Try solving it first. You learn more by struggling a little! 💪</p>
                </div>
                <button onClick={() => setRevealed(true)} className="btn-ghost inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm">
                  <Eye size={15} /> I give up, show me
                </button>
              </div>
            ))}
        </div>

        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-sm font-medium">
          {prev ? (
            <Link href={`/problems/${prev}`} className="flex items-center gap-1 rounded-lg px-2 py-1 text-muted hover:bg-panel-2 hover:text-fg">
              <ArrowLeft size={15} /> Prev
            </Link>
          ) : (
            <span />
          )}
          <Link href="/problems" className="rounded-lg px-2 py-1 text-muted hover:bg-panel-2 hover:text-fg">
            All problems
          </Link>
          {next ? (
            <Link href={`/problems/${next}`} className="flex items-center gap-1 rounded-lg px-2 py-1 text-muted hover:bg-panel-2 hover:text-fg">
              Next <ArrowRight size={15} />
            </Link>
          ) : (
            <span />
          )}
        </div>
      </section>

      {/* Right: editor + output */}
      <section className="flex min-h-0 flex-col gap-3">
        <div className="flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-border bg-panel-solid shadow-xl lg:min-h-0 lg:flex-[3]">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <span className="mr-1 hidden items-center gap-1.5 sm:flex">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </span>
            <span className="hidden font-mono text-xs text-muted md:inline">solution.sql</span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={resetDb}
                disabled={!ready || busy}
                title="Undo any changes you made to the data"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:bg-panel-2 hover:text-fg disabled:opacity-50"
              >
                <RotateCcw size={14} /> <span className="hidden sm:inline">Reset DB</span>
              </button>
              <button
                onClick={run}
                disabled={!ready || busy}
                title="Run (Ctrl+Enter)"
                className="btn-ghost inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm"
              >
                <Play size={14} className="text-emerald-500" fill="currentColor" /> Run
              </button>
              <button onClick={submit} disabled={!ready || busy} className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm">
                <Send size={14} /> Submit
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1">
            <SqlEditor value={query} onChange={setQuery} onRun={run} tables={tables ?? undefined} minHeight="220px" />
          </div>
        </div>

        <div className="glass flex min-h-[260px] flex-col overflow-hidden rounded-2xl lg:min-h-0 lg:flex-[2]">
          <div className="flex-1 overflow-auto">
            <AiHintCard state={ai} onClose={() => setAi({ status: "idle" })} />
            <OutputView
              output={output}
              ready={ready}
              engineError={engineError}
              highlight={highlight}
              changesData={changesData}
              onAskAi={aiEnabled && ai.status !== "loading" ? askAi : undefined}
              signInHref={authReady && !signedIn ? signInHref() : undefined}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function OutputView({
  output,
  ready,
  engineError,
  highlight,
  changesData,
  onAskAi,
  signInHref,
}: {
  output: Output;
  ready: boolean;
  engineError: string | null;
  highlight?: Set<number>;
  changesData: boolean;
  /** Set when AI hints are available: shows an "Ask the AI tutor" button on errors and wrong answers. */
  onAskAi?: () => void;
  /** Set for signed-out visitors: the empty output panel invites them to sign in. */
  signInHref?: string;
}) {
  if (engineError) return <Banner tone="danger" title="Database failed to start" body={engineError} />;
  if (!ready) return <Placeholder spinning text="Starting PostgreSQL in your browser…" />;

  switch (output.kind) {
    case "idle":
      if (signInHref) return <SignInPrompt href={signInHref} />;
      return <Placeholder text="Run a query to see the results here. Press Ctrl+Enter as a shortcut." />;
    case "running":
      return <Placeholder spinning text="Running…" />;
    case "error":
      return (
        <>
          <Banner tone="danger" title="Error" body={output.message} />
          {onAskAi && <AskAiButton onClick={onAskAi} label="Ask the AI tutor what this error means" />}
        </>
      );
    case "result":
      return (
        <div className="animate-pop">
          <p className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs font-semibold text-muted">
            <span className="rounded-full bg-success-bg px-2 py-0.5 text-success">
              {output.result.columns.length ? `${output.result.rows.length} row(s)` : "Done"}
            </span>
            {output.note ? `${output.note} The table now looks like this:` : `${output.result.durationMs} ms`}
          </p>
          <ResultTable result={output.result} />
        </div>
      );
    case "verdict":
      return output.verdict.correct ? (
        <div className="animate-pop">
          <Banner
            tone="success"
            title="Correct! 🎉"
            body={
              changesData
                ? "Your statement leaves the data exactly as expected. Nice work!"
                : "Your query returns exactly the expected result. Nice work!"
            }
          />
          <ResultTable result={output.user} />
        </div>
      ) : (
        <div className="animate-pop">
          <Banner tone="danger" title="Not quite" body={output.verdict.reason ?? ""} />
          {onAskAi && <AskAiButton onClick={onAskAi} label="Ask the AI tutor why it's wrong" />}
          <div className="grid gap-px bg-border md:grid-cols-2">
            <div className="bg-panel-solid">
              <p className="px-4 py-2 text-xs font-bold text-rose-500">{changesData ? "After your statement" : "Your output"} · {output.user.rows.length} rows</p>
              <ResultTable result={output.user} highlight={highlight} compact />
            </div>
            <div className="bg-panel-solid">
              <p className="px-4 py-2 text-xs font-bold text-emerald-500">Expected{changesData ? " after the solution" : ""} · {output.expected.rows.length} rows</p>
              <ResultTable result={output.expected} compact />
            </div>
          </div>
        </div>
      );
  }
}

function Placeholder({ text, spinning = false }: { text: string; spinning?: boolean }) {
  return (
    <div className="grid h-full min-h-40 place-items-center p-6 text-center text-sm text-muted">
      <div className="flex flex-col items-center gap-3">
        {spinning ? (
          <Loader2 size={28} className="animate-spin text-fuchsia-500" />
        ) : (
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-panel-2">
            <Play size={20} className="text-fuchsia-500" />
          </span>
        )}
        {text}
      </div>
    </div>
  );
}

function Banner({ tone, title, body }: { tone: "success" | "danger"; title: string; body: string }) {
  const success = tone === "success";
  const Icon = success ? CheckCircle2 : body && title === "Error" ? AlertTriangle : XCircle;
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 ${
        success
          ? "bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent text-success"
          : "bg-gradient-to-r from-rose-500/20 via-pink-500/10 to-transparent text-danger"
      }`}
    >
      <Icon size={22} className="mt-0.5 shrink-0" />
      <div>
        <p className="text-base font-extrabold">{title}</p>
        {body && <p className="mt-0.5 font-mono text-sm whitespace-pre-wrap opacity-90">{body}</p>}
      </div>
    </div>
  );
}

type AiHintState = { status: "idle" | "loading" | "done" | "error"; text?: string };

const MAX_SAMPLE_ROWS = 8;
const sample = (r: QueryResult) => JSON.stringify([r.columns, ...r.rows.slice(0, MAX_SAMPLE_ROWS)]);

/** A short description of the last run, so the AI tutor knows what the student saw. */
function describeOutput(output: Output): string {
  switch (output.kind) {
    case "error":
      return `It failed with this error: ${output.message}`;
    case "result":
      return output.result.columns.length
        ? `The student ran it (not submitted yet). It returned ${output.result.rows.length} rows. First rows as [columns, ...rows]: ${sample(output.result)}`
        : `The student ran it (not submitted yet): ${output.result.message ?? "no rows returned"}`;
    case "verdict":
      if (output.verdict.correct) return "The student submitted it and it was graded correct.";
      return [
        `The student submitted it and it was graded wrong: ${output.verdict.reason ?? ""}`,
        `Student's result (${output.user.rows.length} rows), first rows as [columns, ...rows]: ${sample(output.user)}`,
        `Expected result (${output.expected.rows.length} rows), first rows: ${sample(output.expected)}`,
      ].join("\n");
    default:
      return "";
  }
}

function AskAiButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div className="border-b border-border px-4 py-2">
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500/10 px-3 py-1.5 text-sm font-semibold text-violet-500 hover:bg-violet-500/20"
      >
        <Bot size={15} /> {label}
      </button>
    </div>
  );
}

function AiHintCard({ state, onClose }: { state: AiHintState; onClose: () => void }) {
  if (state.status === "idle") return null;
  return (
    <div className="animate-pop m-3 flex gap-3 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-500/15 to-fuchsia-500/10 p-3 text-sm">
      <span className="bg-brand grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white">
        {state.status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-violet-600 dark:text-violet-300">AI tutor</p>
        {state.status === "loading" && <p className="text-muted">Looking at your query…</p>}
        {state.status === "done" && <RichText text={state.text ?? ""} className="leading-relaxed" />}
        {state.status === "error" && <p className="text-danger">{state.text}</p>}
      </div>
      {state.status !== "loading" && (
        <button onClick={onClose} aria-label="Close hint" className="self-start text-muted hover:text-fg">
          ✕
        </button>
      )}
    </div>
  );
}

function SignInPrompt({ href }: { href: string }) {
  return (
    <div className="grid h-full min-h-40 place-items-center p-6 text-center">
      <div className="flex max-w-xs flex-col items-center gap-3">
        <span className="bg-brand grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg shadow-fuchsia-500/30">
          <LogIn size={20} />
        </span>
        <p className="font-bold">Sign in to run your query</p>
        <p className="text-sm text-muted">
          Write your SQL now. Running, submitting and saving your progress need a free account. Your query will still be here
          after you sign in.
        </p>
        <Link href={href} className="btn-primary rounded-xl px-5 py-2 text-sm">
          Sign in
        </Link>
      </div>
    </div>
  );
}

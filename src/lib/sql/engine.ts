"use client";

import { datasets, type DatasetId } from "@/lib/datasets";
import type { GradeResult, QueryResult, TableInfo, WorkerRequest, WorkerResponse } from "./types";

const QUERY_TIMEOUT_MS = 8000;
const INIT_TIMEOUT_MS = 15000;
const INIT_ATTEMPTS = 3;

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void };
type RequestBody = WorkerRequest extends infer R ? (R extends { id: number } ? Omit<R, "id"> : never) : never;

export class TimeoutError extends Error {}

/** One isolated in-browser Postgres database, loaded with a practice dataset. */
export class SqlEngine {
  private worker!: Worker;
  private nextId = 1;
  private pending = new Map<number, Pending>();
  private ready!: Promise<void>;

  /**
   * @param startAfter Wait for this before starting the first worker. Used to start the grading
   * copy after the main database, so on a cold start two workers don't download and compile
   * the WebAssembly at the same time.
   */
  constructor(
    readonly datasetId: DatasetId,
    private startAfter?: Promise<unknown>,
  ) {
    this.start();
  }

  private start() {
    this.ready = this.boot(1);
  }

  /**
   * Starts a worker and loads the dataset. Starting normally takes 1–2 seconds, but on a busy
   * machine a worker occasionally hangs while starting up, so a slow start is retried with a
   * fresh worker.
   */
  private async boot(attempt: number): Promise<void> {
    if (this.startAfter) {
      await this.startAfter.catch(() => {}); // start anyway if the other database failed
      this.startAfter = undefined;
    }
    this.spawnWorker();
    try {
      await this.request({ type: "init", setupSql: datasets[this.datasetId].sql }, INIT_TIMEOUT_MS);
    } catch (err) {
      this.worker.terminate();
      this.failPending(new Error("Database restarted"));
      // Browsers starve background tabs, so a slow start there isn't a failure: keep trying
      // without using up an attempt until the user comes back to the tab.
      const hidden = typeof document !== "undefined" && document.hidden;
      if (hidden || attempt < INIT_ATTEMPTS) return this.boot(hidden ? attempt : attempt + 1);
      const reason = err instanceof TimeoutError ? "it took too long to start" : (err as Error).message;
      throw new Error(`Couldn't start the database (${reason}). Try reloading the page.`);
    }
  }

  private spawnWorker() {
    this.worker = new Worker(new URL("./sql.worker.ts", import.meta.url), { type: "module" });
    this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const p = this.pending.get(e.data.id);
      if (!p) return;
      this.pending.delete(e.data.id);
      if (e.data.ok) p.resolve(e.data.result);
      else p.reject(new Error(e.data.error));
    };
    // A crashed worker (e.g. out of memory) never replies, so fail every waiting request
    // instead of leaving the page stuck on "Starting PostgreSQL…".
    this.worker.onerror = (e) => {
      e.preventDefault();
      this.failPending(new Error(`The database stopped unexpectedly${e.message ? `: ${e.message}` : ""}.`));
    };
  }

  private failPending(err: Error) {
    for (const p of this.pending.values()) p.reject(err);
    this.pending.clear();
  }

  /** Sends one message to the worker. Rejects with TimeoutError if there's no reply in time. */
  private request(body: RequestBody, timeoutMs: number): Promise<unknown> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new TimeoutError(`No reply after ${timeoutMs / 1000}s`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (v) => (clearTimeout(timer), resolve(v)),
        reject: (e) => (clearTimeout(timer), reject(e)),
      });
      this.worker.postMessage({ ...body, id });
    });
  }

  private async send(body: RequestBody, timeoutMs = QUERY_TIMEOUT_MS): Promise<unknown> {
    try {
      return await this.request(body, timeoutMs);
    } catch (err) {
      if (!(err instanceof TimeoutError)) throw err;
      // The only way to stop a runaway query is to kill the worker and start fresh.
      this.restart();
      throw new TimeoutError(`Query took longer than ${timeoutMs / 1000}s and was stopped. The database has been reset.`);
    }
  }

  private restart() {
    this.worker.terminate();
    this.failPending(new Error("Database was reset"));
    this.start();
  }

  whenReady() {
    return this.ready;
  }

  async query(sql: string): Promise<QueryResult> {
    await this.ready;
    return (await this.send({ type: "query", sql })) as QueryResult;
  }

  async schema(): Promise<TableInfo[]> {
    await this.ready;
    return (await this.send({ type: "schema" })) as TableInfo[];
  }

  /** Runs `sql` (then `checkSql`, if given) and rolls everything back afterwards. */
  async queryIsolated(sql: string, checkSql?: string): Promise<QueryResult> {
    rejectTransactionControl(sql);
    await this.ready;
    return (await this.send({ type: "isolated", sql, checkSql })) as QueryResult;
  }

  async grade(sql: string, expectedSql: string, checkSql?: string): Promise<GradeResult> {
    rejectTransactionControl(sql);
    await this.ready;
    return (await this.send({ type: "grade", sql, expectedSql, checkSql }, QUERY_TIMEOUT_MS * 2)) as GradeResult;
  }

  /** Throws away every change and reloads the original dataset. */
  async reset() {
    this.restart();
    await this.ready;
  }
}

/**
 * Isolated runs wrap the user's SQL in BEGIN ... ROLLBACK. A COMMIT inside it would make
 * changes permanent, so transaction commands are refused there.
 */
function rejectTransactionControl(sql: string) {
  const withoutStringsAndComments = sql.replace(/'(?:[^']|'')*'/g, "''").replace(/--[^\n]*/g, "");
  if (/\b(BEGIN|COMMIT|ROLLBACK|SAVEPOINT|START\s+TRANSACTION)\b/i.test(withoutStringsAndComments)) {
    throw new Error("Transaction commands (BEGIN, COMMIT, ROLLBACK) aren't needed here. Remove them and try again.");
  }
}

const engines = new Map<DatasetId, SqlEngine>();
const graders = new Map<DatasetId, SqlEngine>();

/** The database the user plays with: Run, Reset and the Schema tab use this one. */
export function getEngine(datasetId: DatasetId): SqlEngine {
  let engine = engines.get(datasetId);
  if (!engine) {
    engine = new SqlEngine(datasetId);
    engines.set(datasetId, engine);
  }
  return engine;
}

/**
 * A separate, never-modified copy of the dataset used for grading. Without it, a user who
 * Runs an INSERT and then Submits it would be graded against data that already has the row.
 */
export function getGrader(datasetId: DatasetId): SqlEngine {
  let engine = graders.get(datasetId);
  if (!engine) {
    engine = new SqlEngine(datasetId, getEngine(datasetId).whenReady());
    graders.set(datasetId, engine);
  }
  return engine;
}

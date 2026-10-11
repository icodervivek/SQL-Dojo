"use client";

import { datasets, type DatasetId } from "@/lib/datasets";
import type { GradeResult, QueryResult, TableInfo, WorkerRequest, WorkerResponse } from "./types";

const QUERY_TIMEOUT_MS = 8000;

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void };
type RequestBody = WorkerRequest extends infer R ? (R extends { id: number } ? Omit<R, "id"> : never) : never;

export class TimeoutError extends Error {}

/** One isolated in-browser Postgres database, loaded with a practice dataset. */
export class SqlEngine {
  private worker!: Worker;
  private nextId = 1;
  private pending = new Map<number, Pending>();
  private ready!: Promise<void>;

  constructor(readonly datasetId: DatasetId) {
    this.start();
  }

  private start() {
    this.worker = new Worker(new URL("./sql.worker.ts", import.meta.url), { type: "module" });
    this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const p = this.pending.get(e.data.id);
      if (!p) return;
      this.pending.delete(e.data.id);
      if (e.data.ok) p.resolve(e.data.result);
      else p.reject(new Error(e.data.error));
    };
    this.ready = this.send({ type: "init", setupSql: datasets[this.datasetId].sql }, 60000).then(() => undefined);
  }

  private send(body: RequestBody, timeoutMs = QUERY_TIMEOUT_MS): Promise<unknown> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        // The only way to stop a runaway query is to kill the worker and start fresh.
        this.restart();
        reject(new TimeoutError(`Query took longer than ${timeoutMs / 1000}s and was stopped. The database has been reset.`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (v) => (clearTimeout(timer), resolve(v)),
        reject: (e) => (clearTimeout(timer), reject(e)),
      });
      this.worker.postMessage({ ...body, id });
    });
  }

  private restart() {
    this.worker.terminate();
    for (const p of this.pending.values()) p.reject(new Error("Database was reset"));
    this.pending.clear();
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

  async grade(sql: string, expectedSql: string): Promise<GradeResult> {
    await this.ready;
    return (await this.send({ type: "grade", sql, expectedSql }, QUERY_TIMEOUT_MS * 2)) as GradeResult;
  }

  /** Throws away every change and reloads the original dataset. */
  async reset() {
    this.restart();
    await this.ready;
  }
}

const engines = new Map<DatasetId, SqlEngine>();

export function getEngine(datasetId: DatasetId): SqlEngine {
  let engine = engines.get(datasetId);
  if (!engine) {
    engine = new SqlEngine(datasetId);
    engines.set(datasetId, engine);
  }
  return engine;
}

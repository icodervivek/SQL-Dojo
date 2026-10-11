/// <reference lib="webworker" />
// Runs a private PostgreSQL (PGlite / WebAssembly) database off the main thread,
// so a slow query never freezes the page and can be killed by terminating the worker.
import { PGlite } from "@electric-sql/pglite";
import type { Cell, QueryResult, TableInfo, WorkerRequest, WorkerResponse } from "./types";

let db: PGlite | null = null;

function toCell(value: unknown): Cell {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return Number(value);
  if (value instanceof Date) {
    const iso = value.toISOString();
    return iso.endsWith("T00:00:00.000Z") ? iso.slice(0, 10) : iso.replace("T", " ").replace(".000Z", "");
  }
  if (value instanceof Uint8Array) {
    return "\\x" + Array.from(value, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return JSON.stringify(value);
}

async function run(sql: string): Promise<QueryResult> {
  if (!db) throw new Error("Database is not ready yet");
  const start = performance.now();
  const results = await db.exec(sql, { rowMode: "array" });
  const durationMs = Math.round(performance.now() - start);

  // Show the last statement that returned columns (like most SQL clients do).
  const last = [...results].reverse().find((r) => r.fields.length > 0);
  if (!last) {
    const affected = results.reduce((sum, r) => sum + (r.affectedRows ?? 0), 0);
    return {
      columns: [],
      rows: [],
      message: `Statement executed successfully. ${affected} row(s) affected.`,
      durationMs,
    };
  }
  return {
    columns: last.fields.map((f) => f.name),
    rows: (last.rows as unknown[][]).map((row) => row.map(toCell)),
    durationMs,
  };
}

/**
 * Runs `sql` and always rolls back, so the data never changes. With `checkSql`
 * (used for INSERT/UPDATE/DELETE/CREATE problems) the result is what `checkSql`
 * returns after `sql` has run, i.e. the state of the table.
 */
async function runIsolated(sql: string, checkSql?: string): Promise<QueryResult> {
  await db!.exec("BEGIN");
  try {
    if (!checkSql) return await run(sql);
    await db!.exec(sql);
    return await run(checkSql);
  } finally {
    await db!.exec("ROLLBACK");
  }
}

async function schema(): Promise<TableInfo[]> {
  const cols = await db!.query<{ table_name: string; column_name: string; data_type: string }>(
    `SELECT table_name, column_name, data_type
       FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position`,
  );
  const byTable = new Map<string, TableInfo>();
  for (const c of cols.rows) {
    if (!byTable.has(c.table_name)) {
      byTable.set(c.table_name, { name: c.table_name, columns: [], rowCount: 0, sample: { columns: [], rows: [], durationMs: 0 } });
    }
    byTable.get(c.table_name)!.columns.push({ name: c.column_name, type: c.data_type });
  }
  for (const t of byTable.values()) {
    const count = await db!.query<{ n: number }>(`SELECT count(*)::int AS n FROM "${t.name}"`);
    t.rowCount = count.rows[0].n;
    t.sample = await run(`SELECT * FROM "${t.name}" LIMIT 5`);
  }
  return [...byTable.values()];
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const req = event.data;
  let response: WorkerResponse;
  try {
    let result: unknown;
    switch (req.type) {
      case "init":
        db = new PGlite();
        await db.exec(req.setupSql);
        result = true;
        break;
      case "query":
        result = await run(req.sql);
        break;
      case "schema":
        result = await schema();
        break;
      case "isolated":
        result = await runIsolated(req.sql, req.checkSql);
        break;
      case "grade": {
        const user = await runIsolated(req.sql, req.checkSql);
        const expected = await runIsolated(req.expectedSql, req.checkSql);
        result = { user, expected };
        break;
      }
    }
    response = { id: req.id, ok: true, result };
  } catch (err) {
    response = { id: req.id, ok: false, error: err instanceof Error ? err.message : String(err) };
  }
  self.postMessage(response);
};

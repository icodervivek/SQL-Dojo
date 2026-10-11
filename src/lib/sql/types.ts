export type Cell = string | number | boolean | null;

export interface QueryResult {
  columns: string[];
  rows: Cell[][];
  /** Set when the last statement returned no rows (INSERT, CREATE, ...). */
  message?: string;
  durationMs: number;
}

export interface ColumnInfo {
  name: string;
  type: string;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  rowCount: number;
  sample: QueryResult;
}

export interface GradeResult {
  user: QueryResult;
  expected: QueryResult;
}

export type WorkerRequest =
  | { id: number; type: "init"; setupSql: string }
  | { id: number; type: "query"; sql: string }
  | { id: number; type: "schema" }
  | { id: number; type: "isolated"; sql: string; checkSql?: string }
  | { id: number; type: "grade"; sql: string; expectedSql: string; checkSql?: string };

export type WorkerResponse =
  | { id: number; ok: true; result: unknown }
  | { id: number; ok: false; error: string };

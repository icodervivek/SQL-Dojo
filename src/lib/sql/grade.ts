import type { Cell, QueryResult } from "./types";

export interface Verdict {
  correct: boolean;
  reason?: string;
}

/** Makes values that "mean the same" compare equal: 5 vs "5.00", rounding noise, etc. */
function normalize(cell: Cell): string {
  if (cell === null) return "∅";
  if (typeof cell === "number") return String(Math.round(cell * 100) / 100);
  if (typeof cell === "string" && /^-?\d+(\.\d+)?$/.test(cell.trim())) {
    return String(Math.round(Number(cell) * 100) / 100);
  }
  // Trim so padded output (CHAR columns, TO_CHAR(..., 'Day')) matches its unpadded equivalent.
  return String(cell).trim();
}

const rowKey = (row: Cell[]) => JSON.stringify(row.map(normalize));

/**
 * If the user selected the right columns in a different order, returns their rows with the
 * columns rearranged to match `expected`. Columns are paired up by their (sorted) values.
 */
function alignColumns(user: QueryResult, expected: QueryResult): Cell[][] | null {
  const signature = (rows: Cell[][], col: number) => rows.map((r) => normalize(r[col])).sort().join("\u0000");
  const userSigs = user.columns.map((_, i) => signature(user.rows, i));
  const used = new Set<number>();
  const mapping: number[] = [];
  for (let j = 0; j < expected.columns.length; j++) {
    const sig = signature(expected.rows, j);
    const i = userSigs.findIndex((s, idx) => !used.has(idx) && s === sig);
    if (i === -1) return null;
    used.add(i);
    mapping.push(i);
  }
  return user.rows.map((r) => mapping.map((i) => r[i]));
}

/**
 * What is being compared: a SELECT's result, or (for INSERT/UPDATE/DELETE/CREATE problems)
 * the state of the table after the user's statements ran. Only changes the wording.
 */
export type Subject = "query" | "table";

/**
 * Compares a user's result to the expected one. Column names and column order are ignored
 * (aliases are a matter of taste); row order only matters when the problem asks for it.
 */
export function compareResults(
  user: QueryResult,
  expected: QueryResult,
  orderMatters: boolean,
  subject: Subject = "query",
): Verdict {
  const verdict = compareRows(user, expected, orderMatters, subject);
  if (verdict.correct || user.columns.length !== expected.columns.length || user.rows.length !== expected.rows.length) {
    return verdict;
  }
  const aligned = alignColumns(user, expected);
  if (aligned && compareRows({ ...user, rows: aligned }, expected, orderMatters, subject).correct) return { correct: true };
  return verdict;
}

function compareRows(user: QueryResult, expected: QueryResult, orderMatters: boolean, subject: Subject): Verdict {
  if (subject === "table") {
    if (user.rows.length !== expected.rows.length) {
      return {
        correct: false,
        reason: `After your statement, the check found ${user.rows.length} row(s), but ${expected.rows.length} were expected.`,
      };
    }
  } else {
    if (user.columns.length === 0) {
      return { correct: false, reason: "Your query didn't return any columns. Make sure it ends with a SELECT." };
    }
    if (user.columns.length !== expected.columns.length) {
      return {
        correct: false,
        reason: `Expected ${expected.columns.length} column(s) but your query returned ${user.columns.length}.`,
      };
    }
    if (user.rows.length !== expected.rows.length) {
      return {
        correct: false,
        reason: `Expected ${expected.rows.length} row(s) but your query returned ${user.rows.length}.`,
      };
    }
  }

  const a = user.rows.map(rowKey);
  const b = expected.rows.map(rowKey);
  if (orderMatters) {
    const i = a.findIndex((k, idx) => k !== b[idx]);
    if (i === -1) return { correct: true };
    const sameSet = [...a].sort().join("\n") === [...b].sort().join("\n");
    return {
      correct: false,
      reason: sameSet
        ? "You have the right rows, but in the wrong order. Check your ORDER BY."
        : `Row ${i + 1} doesn't match the expected output.`,
    };
  }
  if ([...a].sort().join("\n") === [...b].sort().join("\n")) return { correct: true };
  return {
    correct: false,
    reason:
      subject === "table"
        ? "The table doesn't look as expected after your statement. Compare the highlighted rows."
        : "Some values in your result don't match the expected output.",
  };
}

/** Indexes of rows that don't appear in the other result (used to highlight the diff). */
export function mismatchedRows(rows: Cell[][], other: Cell[][]): Set<number> {
  const pool = new Map<string, number>();
  for (const r of other) pool.set(rowKey(r), (pool.get(rowKey(r)) ?? 0) + 1);
  const bad = new Set<number>();
  rows.forEach((r, i) => {
    const k = rowKey(r);
    const n = pool.get(k) ?? 0;
    if (n > 0) pool.set(k, n - 1);
    else bad.add(i);
  });
  return bad;
}

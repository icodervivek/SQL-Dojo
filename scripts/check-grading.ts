// Sanity checks for the result comparison used by Submit.
import { compareResults } from "../src/lib/sql/grade";
import type { QueryResult } from "../src/lib/sql/types";

const r = (columns: string[], rows: (string | number | null)[][]): QueryResult => ({ columns, rows, durationMs: 0 });
const expected = r(["first_name", "salary"], [["Ananya", "320000.00"], ["Rahul", "210000.00"]]);

const cases: [string, QueryResult, boolean, boolean][] = [
  ["exact match", expected, false, true],
  ["rows reordered (order not required)", r(["a", "b"], [["Rahul", "210000.00"], ["Ananya", "320000.00"]]), false, true],
  ["rows reordered (order required)", r(["a", "b"], [["Rahul", "210000.00"], ["Ananya", "320000.00"]]), true, false],
  ["columns swapped", r(["salary", "first_name"], [["320000.00", "Ananya"], [210000, "Rahul"]]), true, true],
  ["numeric formatting differs", r(["n", "s"], [["Ananya", 320000], ["Rahul", 210000.0]]), true, true],
  ["wrong value", r(["n", "s"], [["Ananya", 320000], ["Rahul", 1]]), false, false],
  ["missing row", r(["n", "s"], [["Ananya", 320000]]), false, false],
  ["extra column", r(["n", "s", "x"], [["Ananya", 320000, 1], ["Rahul", 210000, 2]]), false, false],
];

let failed = 0;
for (const [name, user, orderMatters, want] of cases) {
  const got = compareResults(user, expected, orderMatters).correct;
  if (got !== want) failed++;
  console.log(`${got === want ? "ok  " : "FAIL"} ${name}`);
}
process.exit(failed ? 1 : 0);

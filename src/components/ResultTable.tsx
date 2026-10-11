import type { Cell, QueryResult } from "@/lib/sql/types";

const MAX_ROWS = 500;

function render(cell: Cell) {
  if (cell === null) return <span className="rounded bg-panel-2 px-1 text-[0.9em] text-muted italic">NULL</span>;
  if (typeof cell === "boolean") return <span className="text-violet-500">{cell ? "true" : "false"}</span>;
  if (typeof cell === "number") return <span className="text-orange-500 dark:text-orange-300">{cell}</span>;
  return String(cell);
}

export function ResultTable({
  result,
  highlight,
  compact = false,
}: {
  result: QueryResult;
  /** Row indexes to mark as wrong. */
  highlight?: Set<number>;
  compact?: boolean;
}) {
  if (result.columns.length === 0) {
    return <p className="p-4 text-sm text-muted">{result.message ?? "No columns returned."}</p>;
  }
  const rows = result.rows.slice(0, MAX_ROWS);
  const pad = compact ? "px-3 py-1.5" : "px-4 py-2";
  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse font-mono text-xs">
        <thead className="sticky top-0 z-10">
          <tr className="bg-panel-solid">
            {result.columns.map((c, i) => (
              <th
                key={i}
                className={`${pad} border-b-2 border-violet-500/30 text-left font-sans text-[11px] font-bold tracking-wider whitespace-nowrap text-violet-600 uppercase dark:text-violet-300`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={
                highlight?.has(i)
                  ? "bg-danger-bg text-danger"
                  : "transition-colors even:bg-panel-2 hover:bg-violet-500/10"
              }
            >
              {row.map((cell, j) => (
                <td key={j} className={`${pad} border-b border-border whitespace-nowrap`}>
                  {render(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {result.rows.length === 0 && <p className="p-4 text-sm text-muted">Query returned 0 rows.</p>}
      {result.rows.length > MAX_ROWS && (
        <p className="p-3 text-xs text-muted">
          Showing the first {MAX_ROWS} of {result.rows.length} rows.
        </p>
      )}
    </div>
  );
}

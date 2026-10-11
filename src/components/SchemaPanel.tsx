"use client";

import { ChevronDown, Hash, KeyRound, Table2, Type as TypeIcon, Calendar } from "lucide-react";
import { useState } from "react";
import type { TableInfo } from "@/lib/sql/types";
import { ResultTable } from "./ResultTable";

const tableColors = [
  "from-violet-500 to-indigo-600",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
];

function typeIcon(type: string, name: string) {
  if (name === "id" || name.endsWith("_id")) return <KeyRound size={12} className="text-amber-500" />;
  if (/int|numeric|double|real/.test(type)) return <Hash size={12} className="text-orange-500" />;
  if (/date|time/.test(type)) return <Calendar size={12} className="text-teal-500" />;
  return <TypeIcon size={12} className="text-emerald-500" />;
}

export function SchemaPanel({ tables }: { tables: TableInfo[] | null }) {
  const [open, setOpen] = useState<string | null>(null);

  if (!tables) return <p className="text-sm text-muted">Loading schema…</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">Click a table to see sample rows.</p>
      {tables.map((t, i) => (
        <div key={t.name} className="overflow-hidden rounded-2xl border border-border bg-panel-2">
          <button onClick={() => setOpen(open === t.name ? null : t.name)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
            <span className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br text-white ${tableColors[i % tableColors.length]}`}>
              <Table2 size={16} />
            </span>
            <span className="flex-1 font-mono text-sm font-bold">{t.name}</span>
            <span className="rounded-full bg-panel-solid px-2 py-0.5 text-xs font-medium text-muted">{t.rowCount} rows</span>
            <ChevronDown size={16} className={`text-muted transition-transform ${open === t.name ? "rotate-180" : ""}`} />
          </button>
          <ul className="border-t border-border px-4 py-2 font-mono text-xs">
            {t.columns.map((c) => (
              <li key={c.name} className="flex items-center gap-2 py-1">
                {typeIcon(c.type, c.name)}
                <span className="flex-1">{c.name}</span>
                <span className="text-muted">{c.type}</span>
              </li>
            ))}
          </ul>
          {open === t.name && (
            <div className="animate-pop border-t border-border bg-panel-solid">
              <ResultTable result={t.sample} compact />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

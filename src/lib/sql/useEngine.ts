"use client";

import { useCallback, useEffect, useState } from "react";
import type { DatasetId } from "@/lib/datasets";
import { getEngine, type SqlEngine } from "./engine";
import type { TableInfo } from "./types";

/** Starts (or reuses) the in-browser database for a dataset and loads its schema. */
export function useEngine(datasetId: DatasetId) {
  const [engine, setEngine] = useState<SqlEngine | null>(null);
  const [tables, setTables] = useState<TableInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshSchema = useCallback(async (e: SqlEngine) => {
    try {
      setTables(await e.schema());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    const e = getEngine(datasetId);
    let cancelled = false;
    e.whenReady()
      .then(() => {
        if (cancelled) return;
        setEngine(e);
        return refreshSchema(e);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)));
    return () => {
      cancelled = true;
    };
  }, [datasetId, refreshSchema]);

  const reset = useCallback(async () => {
    if (!engine) return;
    await engine.reset();
    await refreshSchema(engine);
  }, [engine, refreshSchema]);

  return { engine, ready: engine !== null, tables, error, reset, refreshSchema };
}

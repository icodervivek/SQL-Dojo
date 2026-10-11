"use client";

import { useMemo, useSyncExternalStore } from "react";
import CodeMirror, { keymap, Prec } from "@uiw/react-codemirror";
import { PostgreSQL, sql } from "@codemirror/lang-sql";
import { githubLight } from "@uiw/codemirror-theme-github";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import type { TableInfo } from "@/lib/sql/types";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribeColorScheme(onChange: () => void) {
  const mq = window.matchMedia(DARK_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function usePrefersDark() {
  return useSyncExternalStore(
    subscribeColorScheme,
    () => window.matchMedia(DARK_QUERY).matches,
    () => false,
  );
}

export function SqlEditor({
  value,
  onChange,
  onRun,
  tables,
  minHeight,
}: {
  value: string;
  onChange: (v: string) => void;
  /** Called on Ctrl/Cmd+Enter. */
  onRun?: () => void;
  /** Enables autocomplete for table and column names. */
  tables?: TableInfo[];
  minHeight?: string;
}) {
  const dark = usePrefersDark();

  const extensions = useMemo(() => {
    const schema = Object.fromEntries((tables ?? []).map((t) => [t.name, t.columns.map((c) => c.name)]));
    return [
      sql({ dialect: PostgreSQL, schema, upperCaseKeywords: true }),
      Prec.highest(
        keymap.of([
          {
            key: "Mod-Enter",
            run: () => {
              onRun?.();
              return true;
            },
          },
        ]),
      ),
    ];
  }, [tables, onRun]);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme={dark ? tokyoNight : githubLight}
      height="100%"
      minHeight={minHeight}
      className="h-full"
      basicSetup={{ foldGutter: false, highlightActiveLineGutter: true }}
    />
  );
}

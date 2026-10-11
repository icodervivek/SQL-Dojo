"use client";

import { useEffect, useState } from "react";

let enabledPromise: Promise<boolean> | null = null;

/** Whether the server has AI hints configured (checked once per page load). */
export function useAiHintsEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    enabledPromise ??= fetch("/api/hint")
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((d: { enabled?: boolean }) => Boolean(d.enabled))
      .catch(() => false);
    let cancelled = false;
    enabledPromise.then((v) => !cancelled && setEnabled(v));
    return () => {
      cancelled = true;
    };
  }, []);
  return enabled;
}

export async function requestAiHint(slug: string, query: string, feedback: string): Promise<string> {
  const res = await fetch("/api/hint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, query, feedback }),
  });
  const data: { hint?: string; error?: string } = await res.json().catch(() => ({}));
  if (!res.ok || !data.hint) throw new Error(data.error ?? "Couldn't get a hint right now.");
  return data.hint;
}

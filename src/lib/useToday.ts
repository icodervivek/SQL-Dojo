"use client";

import { useSyncExternalStore } from "react";
import { dayKey } from "./gamification";

const noop = () => () => {};

/**
 * Today's date key on the client, or null while server-rendering. Pages are prerendered at
 * build time, so anything that depends on "today" (daily challenge, streaks) must come from
 * the browser to avoid showing a stale day.
 */
export function useToday(): string | null {
  return useSyncExternalStore(noop, () => dayKey(new Date()), () => null);
}

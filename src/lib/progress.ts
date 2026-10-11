"use client";

// Progress belongs to a signed-in (Clerk) account. It is saved to the `user_progress` table in Supabase
// (so it follows the user across devices) and cached in localStorage under the user's id, so the
// app is fast and keeps working offline. Each account has its own cache key, so people sharing
// a computer never see each other's progress.
import { useSyncExternalStore } from "react";
import { supabase } from "./supabase";

/** The signed-in user, as reported by Clerk (see ClerkBridge). */
export interface AppUser {
  id: string;
  email: string | null;
  /** Full name from the Clerk profile, if the user has set one. */
  name: string | null;
  imageUrl: string | null;
}

export type ProblemStatus = "attempted" | "solved";

export interface ProblemProgress {
  status: ProblemStatus;
  lastQuery?: string;
  solvedAt?: string;
}

export interface Progress {
  problems: Record<string, ProblemProgress>;
  lessons: Record<string, string>; // slug -> completed at (ISO)
}

interface State {
  progress: Progress;
  user: AppUser | null;
  /** True once the signed-in user's progress has been read. */
  loaded: boolean;
  /** True once we know whether someone is signed in (the session check is async). */
  authReady: boolean;
}

const STORAGE_PREFIX = "sqlpractice.progress.v1";
/** Progress saved before accounts were required. Moved into the first account that signs in. */
const LEGACY_GUEST_KEY = STORAGE_PREFIX;
const storageKey = (userId: string) => `${STORAGE_PREFIX}:${userId}`;
const empty: Progress = { problems: {}, lessons: {} };
const serverState: State = { progress: empty, user: null, loaded: false, authReady: false };

let state: State = serverState;
const listeners = new Set<() => void>();
let started = false;
let syncTimer: ReturnType<typeof setTimeout> | undefined;

function emit() {
  for (const l of listeners) l();
}

function readLocal(key: string): Progress {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...empty, ...JSON.parse(raw) };
  } catch {}
  return empty;
}

function writeLocal(p: Progress) {
  if (!state.user) return;
  try {
    localStorage.setItem(storageKey(state.user.id), JSON.stringify(p));
  } catch {}
}

/** The user's cached progress, plus any progress saved before sign-in was required. */
function loadForUser(userId: string): Progress {
  let progress = readLocal(storageKey(userId));
  try {
    if (localStorage.getItem(LEGACY_GUEST_KEY)) {
      progress = merge(progress, readLocal(LEGACY_GUEST_KEY));
      localStorage.removeItem(LEGACY_GUEST_KEY);
    }
  } catch {}
  return progress;
}

/** Merges two progress records. Solved beats attempted, so nothing is ever lost. */
function merge(a: Progress, b: Progress): Progress {
  const problems = { ...a.problems };
  for (const [slug, p] of Object.entries(b.problems)) {
    const mine = problems[slug];
    if (!mine || (mine.status !== "solved" && p.status === "solved")) problems[slug] = p;
  }
  return { problems, lessons: { ...b.lessons, ...a.lessons } };
}

async function pullRemote(user: AppUser) {
  if (!supabase) return;
  const { data, error } = await supabase.from("user_progress").select("data").eq("user_id", user.id).maybeSingle();
  if (error) return console.error("Could not load progress", error);
  const merged = merge(state.progress, (data?.data as Progress) ?? empty);
  state = { ...state, progress: merged };
  writeLocal(merged);
  emit();
  void pushRemote();
}

async function pushRemote() {
  if (!supabase || !state.user) return;
  const { error } = await supabase
    .from("user_progress")
    .upsert({ user_id: state.user.id, data: state.progress, updated_at: new Date().toISOString() });
  if (error) console.error("Could not save progress", error);
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;

  // Keep several open tabs in sync.
  window.addEventListener("storage", (e) => {
    if (state.user && e.key === storageKey(state.user.id)) {
      state = { ...state, progress: readLocal(e.key) };
      emit();
    }
  });
}

/**
 * Called by ClerkBridge whenever Clerk's signed-in user changes (and once it has loaded).
 * Switching to a different person (or to nobody) never carries progress across accounts.
 */
export function setAuthUser(user: AppUser | null) {
  start();
  if (state.authReady && user?.id === state.user?.id) {
    const same = (a: AppUser | null, b: AppUser | null) =>
      a?.email === b?.email && a?.name === b?.name && a?.imageUrl === b?.imageUrl;
    if (!same(user, state.user)) {
      state = { ...state, user };
      emit();
    }
    return;
  }
  state = user
    ? { progress: loadForUser(user.id), user, loaded: true, authReady: true }
    : { progress: empty, user: null, loaded: false, authReady: true };
  emit();
  if (user) void pullRemote(user);
}

type ChangeListener = (before: Progress, after: Progress) => void;
const changeListeners = new Set<ChangeListener>();

/**
 * Called after each change the user makes in this tab (not for syncs from other tabs or
 * the server), so celebrations only fire for things the user just did.
 */
export function onLocalProgressChange(listener: ChangeListener) {
  changeListeners.add(listener);
  return () => void changeListeners.delete(listener);
}

function update(fn: (p: Progress) => Progress) {
  start();
  if (!state.user) return; // progress is only recorded for signed-in users
  const before = state.progress;
  state = { ...state, progress: fn(before) };
  writeLocal(state.progress);
  emit();
  for (const l of changeListeners) l(before, state.progress);
  clearTimeout(syncTimer);
  syncTimer = setTimeout(pushRemote, 1000);
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useProgressState(): State {
  return useSyncExternalStore(subscribe, () => state, () => serverState);
}

export function recordAttempt(slug: string, query: string) {
  update((p) => {
    const prev = p.problems[slug];
    const next: ProblemProgress =
      prev?.status === "solved" ? { ...prev, lastQuery: query } : { status: "attempted", lastQuery: query };
    return { ...p, problems: { ...p.problems, [slug]: next } };
  });
}

export function recordSolved(slug: string, query: string) {
  update((p) => {
    const prev = p.problems[slug];
    const solvedAt = prev?.solvedAt ?? new Date().toISOString();
    return { ...p, problems: { ...p.problems, [slug]: { status: "solved", lastQuery: query, solvedAt } } };
  });
}

export function completeLesson(slug: string) {
  update((p) => (p.lessons[slug] ? p : { ...p, lessons: { ...p.lessons, [slug]: new Date().toISOString() } }));
}

export function resetProgress() {
  update(() => empty);
}

"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useProgressState } from "./progress";

const draftKey = (slug: string) => `sqlpractice.draft:${slug}`;

/** Keeps a signed-out visitor's query so it's still in the editor after they sign in. */
export function saveDraft(slug: string, query: string) {
  try {
    sessionStorage.setItem(draftKey(slug), query);
  } catch {}
}

/** A query saved before signing in, if any. */
export function readDraft(slug: string): string | null {
  try {
    return sessionStorage.getItem(draftKey(slug));
  } catch {
    return null;
  }
}

export function clearDraft(slug: string) {
  try {
    sessionStorage.removeItem(draftKey(slug));
  } catch {}
}

/**
 * Pages are public, but running, submitting and saving progress need an account.
 * `requireSignIn()` returns true for signed-in users; otherwise it sends the visitor to sign in
 * (coming back to this page afterwards) and returns false.
 */
export function useRequireSignIn() {
  const { user, authReady } = useProgressState();
  const router = useRouter();

  const signInHref = () =>
    typeof window === "undefined" ? "/sign-in" : `/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`;

  const requireSignIn = useCallback(() => {
    if (user) return true;
    router.push(signInHref());
    return false;
  }, [user, router]);

  return { signedIn: !!user, authReady, requireSignIn, signInHref };
}

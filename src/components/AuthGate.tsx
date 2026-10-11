"use client";

import { Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgressState } from "@/lib/progress";

/**
 * Shows its children only to signed-in users.
 *
 * Signed-out visitors never reach these pages: the server (src/proxy.ts) redirects them to
 * sign in first. So if the browser still thinks nobody is signed in (e.g. after signing out in
 * another tab, or stale cookies), we show a button instead of redirecting automatically. An
 * automatic redirect could bounce forever between this page and /sign-in, because the sign-in
 * page sends users with a server-side session straight back here.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, authReady } = useProgressState();
  const pathname = usePathname();

  if (!authReady) {
    return (
      <div className="grid flex-1 place-items-center p-10 text-sm text-muted">
        <span className="flex items-center gap-2">
          <Loader2 size={18} className="animate-spin text-fuchsia-500" />
          Checking your account…
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid flex-1 place-items-center p-10">
        <div className="glass max-w-sm space-y-3 rounded-2xl p-6 text-center">
          <p className="text-lg font-extrabold">Please sign in again</p>
          <p className="text-sm text-muted">Your session has ended. Sign in to continue where you left off.</p>
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}
            className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
          >
            <LogIn size={16} /> Sign in
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

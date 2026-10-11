"use client";

import { useClerk } from "@clerk/nextjs";
import { ChevronDown, LogOut, Settings, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AppUser } from "@/lib/progress";

/**
 * The signed-in user's menu in the top bar. Our own Profile page is the profile; Clerk is only
 * used for account settings (email, password, connected accounts) and for signing out.
 */
export function AccountMenu({ user }: { user: AppUser }) {
  const { openUserProfile, signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const name = user.name || user.email?.split("@")[0] || "Account";
  const initial = name.charAt(0).toUpperCase();
  const item = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-panel-2";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full p-0.5 pr-2 transition-colors hover:bg-panel-2"
      >
        {user.imageUrl ? (
          <Image src={user.imageUrl} alt="" width={36} height={36} className="h-9 w-9 rounded-full ring-2 ring-fuchsia-500/40" />
        ) : (
          <span className="bg-brand grid h-9 w-9 place-items-center rounded-full font-bold text-white">{initial}</span>
        )}
        <ChevronDown size={14} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-pop absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-panel-solid p-1.5 shadow-2xl"
        >
          <div className="border-b border-border px-3 pt-2 pb-3">
            <p className="truncate font-bold">{name}</p>
            {user.email && <p className="truncate text-xs text-muted">{user.email}</p>}
          </div>
          <div className="py-1">
            <Link href="/profile" role="menuitem" onClick={() => setOpen(false)} className={item}>
              <Trophy size={16} className="text-fuchsia-500" /> Your journey
            </Link>
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                openUserProfile();
              }}
              className={item}
            >
              <Settings size={16} className="text-muted" /> Account settings
            </button>
          </div>
          <div className="border-t border-border pt-1">
            <button
              role="menuitem"
              disabled={signingOut}
              onClick={async () => {
                setSigningOut(true);
                await signOut({ redirectUrl: "/" });
              }}
              className={`${item} text-danger disabled:opacity-60`}
            >
              <LogOut size={16} /> {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { BookOpen, Code2, Database } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { computeStats } from "@/lib/gamification";
import { useToday } from "@/lib/useToday";
import { useProgressState } from "@/lib/progress";
import { AccountMenu } from "./AccountMenu";

const links = [
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/problems", label: "Problems", icon: Code2 },
];

export function Nav() {
  const pathname = usePathname();
  const { user, progress } = useProgressState();
  const today = useToday();
  const stats = useMemo(() => computeStats(progress, today), [progress, today]);

  return (
    <header className="sticky top-0 z-40 h-16 shrink-0 border-b border-border bg-bg/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="bg-brand grid h-9 w-9 place-items-center rounded-xl text-white shadow-lg shadow-fuchsia-500/30 transition-transform group-hover:rotate-6">
            <Database size={18} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            SQL<span className="text-gradient">Dojo</span>
          </span>
        </Link>

        <nav className="flex gap-1 rounded-full border border-border bg-panel-2 p-1 text-sm">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 font-medium transition-colors ${
                  active ? "bg-brand text-white shadow-md shadow-fuchsia-500/25" : "text-muted hover:text-fg"
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {/* Display only: the profile is reached from the account menu ("Your journey"). */}
          {user && (
            <div
              className="hidden cursor-default items-center gap-2 rounded-full border border-border bg-panel-2 py-1 pr-3 pl-1 font-semibold md:flex"
              title={`Level ${stats.level} · ${stats.xp} XP · ${stats.currentStreak}-day streak`}
            >
              <span className="bg-brand rounded-full px-2 py-0.5 text-xs text-white">Lv {stats.level}</span>
              <span className={stats.activeToday ? "text-orange-500" : "text-muted"}>🔥 {stats.currentStreak}</span>
              <span className="text-muted">{stats.xp} XP</span>
            </div>
          )}
          {user ? (
            <AccountMenu user={user} />
          ) : (
            <Link href="/sign-in" className="btn-primary rounded-full px-4 py-1.5">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

import { Bot, Database, Flame, Trophy } from "lucide-react";
import Link from "next/link";
import { lessons } from "@/lib/content/lessons";
import { problems } from "@/lib/content/problems";
import { datasetList } from "@/lib/datasets";
import { SqlCode } from "./SqlCode";

const perks = [
  { icon: Trophy, color: "from-amber-400 to-orange-500", text: "Save your progress, XP and badges on every device" },
  { icon: Flame, color: "from-rose-400 to-pink-600", text: "Build a daily streak with a new challenge every day" },
  { icon: Bot, color: "from-violet-400 to-indigo-600", text: "Get hints from the AI tutor when you're stuck" },
];

/** The two-column frame around Clerk's sign-in and sign-up forms. */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  switchText,
  switchHref,
  switchLabel,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  switchText: string;
  switchHref: string;
  switchLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex-1 overflow-x-clip">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid w-full max-w-6xl items-stretch gap-6 px-4 py-8 lg:grid-cols-[1.05fr_1fr] lg:py-14">
        {/* Brand panel */}
        <aside className="bg-brand relative hidden overflow-hidden rounded-3xl p-10 text-white shadow-2xl shadow-fuchsia-500/25 lg:flex lg:flex-col">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -right-16 -bottom-28 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl" />

          <Link href="/" className="relative flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur">
              <Database size={20} strokeWidth={2.5} />
            </span>
            <span className="text-xl font-extrabold tracking-tight">SQL Dojo</span>
          </Link>

          <h2 className="relative mt-10 text-4xl leading-tight font-extrabold tracking-tight">
            Learn SQL by writing SQL.
          </h2>
          <p className="relative mt-3 max-w-md text-white/80">
            {problems.length} problems, {lessons.length} lessons and {datasetList.length} real-world datasets, running on a real
            PostgreSQL database right in your browser.
          </p>

          <ul className="relative mt-8 space-y-3">
            {perks.map(({ icon: Icon, color, text }) => (
              <li key={text} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
                  <Icon size={18} />
                </span>
                <span className="text-sm font-medium">{text}</span>
              </li>
            ))}
          </ul>

          <div className="relative mt-auto pt-10">
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#12121f]/90 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-xs text-white/50">daily-challenge.sql</span>
              </div>
              <pre className="p-4 font-mono text-[13px] leading-relaxed text-white">
                <SqlCode sql={"SELECT name, COUNT(*) AS wins\nFROM matches m\nJOIN teams t ON t.id = m.winner_id\nGROUP BY name\nORDER BY wins DESC;"} />
              </pre>
            </div>
          </div>
        </aside>

        {/* Form panel */}
        <section className="glass flex flex-col justify-center rounded-3xl p-6 sm:p-10">
          <div className="mx-auto w-full max-w-sm">
            <p className="text-gradient text-sm font-bold tracking-widest uppercase">{eyebrow}</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{title}</h1>
            <p className="mt-2 mb-7 text-sm text-muted">{subtitle}</p>
            {children}
            <p className="mt-6 text-center text-sm text-muted">
              {switchText}{" "}
              <Link href={switchHref} className="font-semibold text-fuchsia-500 hover:text-fuchsia-400">
                {switchLabel}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

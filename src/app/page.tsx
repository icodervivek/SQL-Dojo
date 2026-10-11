import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Cpu, Gauge, GraduationCap, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { TopicIcon } from "@/components/Badges";
import { DailyChallenge } from "@/components/DailyChallenge";
import { HomeProgress } from "@/components/HomeProgress";
import { CodeWindow } from "@/components/SqlCode";
import { lessons } from "@/lib/content/lessons";
import { problems, topics } from "@/lib/content/problems";
import { HOME_TITLE, SITE_DESCRIPTION } from "@/lib/seo";
import { datasetList } from "@/lib/datasets";

export const metadata: Metadata = {
  // `absolute` skips the "%s · SQL Dojo" template, since the brand is already in the title.
  title: { absolute: HOME_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: HOME_TITLE, description: SITE_DESCRIPTION, url: "/" },
  twitter: { title: HOME_TITLE, description: SITE_DESCRIPTION },
};

const heroQuery = `SELECT d.name AS department,
       COUNT(*) AS people,
       ROUND(AVG(e.salary)) AS avg_salary
FROM employees e
JOIN departments d ON d.id = e.department_id
GROUP BY d.name
ORDER BY avg_salary DESC;`;

const heroResult = [
  ["Research", 1, "200000"],
  ["Engineering", 6, "168000"],
  ["Finance", 3, "123333"],
  ["Sales", 4, "111250"],
];

const features = [
  {
    icon: Cpu,
    color: "from-violet-500 to-indigo-600",
    title: "Real Postgres in your browser",
    body: "Every query runs on a private PostgreSQL database inside your tab. It's instant, works offline, and nothing you do can break anything.",
  },
  {
    icon: Zap,
    color: "from-pink-500 to-rose-600",
    title: "Instant auto-grading",
    body: "Hit Submit and know right away whether you're correct, with a side-by-side diff of your output and the expected one.",
  },
  {
    icon: GraduationCap,
    color: "from-cyan-500 to-blue-600",
    title: "Zero to window functions",
    body: "Bite-sized lessons with live examples, each followed by practice problems on the same topic.",
  },
  {
    icon: ShieldCheck,
    color: "from-emerald-500 to-teal-600",
    title: "Safe to experiment",
    body: "DELETE everything if you like. One click on Reset brings the data back, and runaway queries are stopped automatically.",
  },
];

const steps = [
  { title: "Pick a problem", body: "Choose by topic or difficulty, or follow the learning path." },
  { title: "Write your query", body: "Autocomplete knows every table and column in the dataset." },
  { title: "Submit & level up", body: "Get instant feedback, hints when stuck, and track your progress." },
];

export default function Home() {
  return (
    <div className="relative overflow-x-clip">
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[720px]" />

      {/* Hero */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-16 pb-20 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
        <div className="animate-pop space-y-7">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
            <Sparkles size={15} className="text-fuchsia-500" />
            Real PostgreSQL, right in your browser
          </span>
          <h1 className="text-5xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Master SQL by <span className="text-gradient">writing SQL.</span>
          </h1>
          <p className="max-w-xl text-lg text-muted">
            Hands-on problems and short lessons on realistic datasets. Nothing to install: sign in with your email and start
            querying in seconds. Your progress, XP and badges follow you to any device.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/learn" className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base">
              Start learning <ArrowRight size={18} />
            </Link>
            <Link href="/problems" className="btn-ghost inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base">
              Browse problems
            </Link>
          </div>
          <dl className="grid max-w-lg grid-cols-3 gap-3 pt-2">
            {[
              { n: problems.length, label: "Problems" },
              { n: lessons.length, label: "Lessons" },
              { n: topics.length, label: "Topics" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl px-4 py-3">
                <dt className="text-gradient text-3xl font-extrabold">{s.n}</dt>
                <dd className="text-xs font-medium text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Floating editor mock */}
        <div className="relative pb-24">
          <div className="bg-brand absolute -inset-6 rounded-[2rem] opacity-25 blur-3xl" />
          <div className="animate-float relative">
            <CodeWindow sql={heroQuery} title="practice.sql" />
            <div className="absolute right-2 -bottom-24 w-72 overflow-hidden rounded-2xl border border-border bg-panel-solid shadow-2xl shadow-black/30">
              <div className="flex items-center gap-2 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-500">
                <CheckCircle2 size={16} /> Correct! 6 rows
              </div>
              <table className="w-full font-mono text-xs">
                <tbody>
                  {heroResult.map((r) => (
                    <tr key={r[0]} className="border-t border-border">
                      {r.map((c, i) => (
                        <td key={i} className="px-3 py-1.5">
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-7xl space-y-24 px-4 pb-24">
        <div className="space-y-4">
          <HomeProgress />
          <DailyChallenge />
        </div>

        {/* Topics */}
        <section>
          <SectionTitle eyebrow="Curriculum" title="Full CRUD, from CREATE TABLE to window functions" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {topics.map((t) => {
              const count = problems.filter((p) => p.topic === t).length;
              return (
                <Link key={t} href="/problems" className="glass card-hover flex items-center gap-3 rounded-2xl p-4">
                  <TopicIcon topic={t} />
                  <span>
                    <span className="block font-semibold">{t}</span>
                    <span className="text-xs text-muted">
                      {count} problem{count === 1 ? "" : "s"}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Datasets */}
        <section>
          <SectionTitle eyebrow="Real-world data" title={`${datasetList.length} datasets to explore`} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {datasetList.map((d) => {
              const count = problems.filter((p) => p.dataset === d.id).length;
              return (
                <Link key={d.id} href="/problems" className="glass card-hover rounded-2xl p-5">
                  <span className="text-4xl">{d.emoji}</span>
                  <h3 className="mt-3 font-bold">{d.name}</h3>
                  <p className="mt-1 text-sm text-muted">{d.description}</p>
                  <p className="text-gradient mt-3 text-sm font-bold">{count} problems →</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section>
          <SectionTitle eyebrow="Why it works" title="Built for learning by doing" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, color, title, body }) => (
              <div key={title} className="glass card-hover rounded-2xl p-6">
                <span className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${color}`}>
                  <Icon size={22} />
                </span>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section>
          <SectionTitle eyebrow="How it works" title="Three steps. That's it." />
          <ol className="grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="glass relative overflow-hidden rounded-2xl p-6">
                <span className="text-gradient absolute -top-4 right-3 text-8xl font-black opacity-20">{i + 1}</span>
                <span className="bg-brand mb-4 grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section className="bg-brand relative overflow-hidden rounded-3xl px-8 py-14 text-center text-white shadow-2xl shadow-fuchsia-500/30">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -right-10 -bottom-24 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
          <Gauge className="relative mx-auto mb-4" size={40} />
          <h2 className="relative text-3xl font-extrabold sm:text-4xl">Your first query is 10 seconds away</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/80">Start with the basics, or jump straight into interview-style problems.</p>
          <Link
            href="/problems/list-departments"
            className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-fuchsia-700 shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Solve your first problem <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8 text-center">
      <p className="text-gradient text-sm font-bold tracking-widest uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}

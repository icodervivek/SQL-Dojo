"use client";

import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { problems, topics, type Difficulty, type Topic } from "@/lib/content/problems";
import { datasetList, datasets, type DatasetId } from "@/lib/datasets";
import { topicMeta } from "@/lib/content/topicMeta";
import { useProgressState } from "@/lib/progress";
import { DifficultyBadge, StatusIcon, TopicIcon } from "./Badges";
import { ProgressRing } from "./ProgressRing";

type StatusFilter = "all" | "solved" | "unsolved" | "attempted";

const difficulties: { id: Difficulty; bar: string; text: string }[] = [
  { id: "Easy", bar: "from-emerald-400 to-teal-500", text: "text-emerald-500" },
  { id: "Medium", bar: "from-amber-400 to-orange-500", text: "text-amber-500" },
  { id: "Hard", bar: "from-rose-400 to-pink-600", text: "text-rose-500" },
];

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unsolved", label: "To do" },
  { id: "attempted", label: "Attempted" },
  { id: "solved", label: "Solved" },
];

export function ProblemList() {
  const { progress } = useProgressState();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [topic, setTopic] = useState<Topic | "all">("all");
  const [dataset, setDataset] = useState<DatasetId | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const isSolved = (slug: string) => progress.problems[slug]?.status === "solved";

  const filtered = useMemo(
    () =>
      problems.filter((p) => {
        const s = progress.problems[p.slug]?.status;
        if (difficulty !== "all" && p.difficulty !== difficulty) return false;
        if (topic !== "all" && p.topic !== topic) return false;
        if (dataset !== "all" && p.dataset !== dataset) return false;
        if (status === "solved" && s !== "solved") return false;
        if (status === "attempted" && s !== "attempted") return false;
        if (status === "unsolved" && s === "solved") return false;
        if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [progress, search, difficulty, topic, dataset, status],
  );

  const solved = problems.filter((p) => isSolved(p.slug)).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="glass flex items-center gap-5 rounded-3xl p-5">
          <ProgressRing value={solved / problems.length} size={88}>
            <span className="text-center leading-tight">
              <span className="block text-xl font-extrabold">{solved}</span>
              <span className="text-[10px] text-muted">/ {problems.length}</span>
            </span>
          </ProgressRing>
          <div>
            <p className="text-sm text-muted">Problems solved</p>
            <p className="text-gradient text-3xl font-extrabold">{Math.round((solved / problems.length) * 100)}%</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {difficulties.map((d) => {
            const all = problems.filter((p) => p.difficulty === d.id);
            const done = all.filter((p) => isSolved(p.slug)).length;
            const active = difficulty === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDifficulty(active ? "all" : d.id)}
                className={`glass card-hover rounded-3xl p-5 text-left ${active ? "ring-2 ring-accent" : ""}`}
              >
                <p className={`text-sm font-bold ${d.text}`}>{d.id}</p>
                <p className="mt-1 text-2xl font-extrabold">
                  {done}
                  <span className="text-base font-medium text-muted"> / {all.length}</span>
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-panel-2">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${d.bar}`}
                    style={{ width: `${all.length ? (done / all.length) * 100 : 0}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTopic("all")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
            topic === "all" ? "bg-brand text-white shadow-md shadow-fuchsia-500/25" : "glass text-muted hover:text-fg"
          }`}
        >
          All topics
        </button>
        {topics.map((t) => {
          const meta = topicMeta[t];
          const Icon = meta.icon;
          const active = topic === t;
          return (
            <button
              key={t}
              onClick={() => setTopic(active ? "all" : t)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                active ? `bg-gradient-to-r text-white shadow-md ${meta.gradient}` : "glass text-muted hover:text-fg"
              }`}
            >
              <Icon size={14} className={active ? "" : meta.text} />
              {t}
            </button>
          );
        })}
      </div>

      {/* Dataset chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-bold tracking-wider text-muted uppercase">Dataset</span>
        {[{ id: "all" as const, label: "All", emoji: "✨" }, ...datasetList.map((d) => ({ id: d.id, label: d.name, emoji: d.emoji }))].map(
          (d) => {
            const active = dataset === d.id;
            const count = d.id === "all" ? problems.length : problems.filter((p) => p.dataset === d.id).length;
            return (
              <button
                key={d.id}
                onClick={() => setDataset(active && d.id !== "all" ? "all" : d.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  active ? "bg-panel-solid text-fg shadow ring-2 ring-accent" : "glass text-muted hover:text-fg"
                }`}
              >
                <span>{d.emoji}</span>
                {d.label}
                <span className="rounded-full bg-panel-2 px-1.5 text-[11px]">{count}</span>
              </button>
            );
          },
        )}
      </div>

      {/* Search + status */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="glass flex min-w-60 flex-1 items-center gap-2 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-accent">
          <Search size={16} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </label>
        <div className="glass flex rounded-xl p-1">
          {statusFilters.map((s) => (
            <button
              key={s.id}
              onClick={() => setStatus(s.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                status === s.id ? "bg-panel-solid text-fg shadow" : "text-muted hover:text-fg"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="glass overflow-hidden rounded-3xl">
        {filtered.map((p, i) => (
          <Link
            key={p.slug}
            href={`/problems/${p.slug}`}
            className={`group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-panel-2 ${i > 0 ? "border-t border-border" : ""}`}
          >
            <StatusIcon status={progress.problems[p.slug]?.status} size={20} />
            <TopicIcon topic={p.topic} size={36} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold group-hover:text-accent">{p.title}</span>
              <span className="text-xs font-medium">
                <span className={topicMeta[p.topic].text}>{p.topic}</span>
                <span className="text-muted"> · {datasets[p.dataset].emoji} {datasets[p.dataset].name}</span>
              </span>
            </span>
            <DifficultyBadge difficulty={p.difficulty} />
            <ChevronRight size={18} className="text-muted transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="p-10 text-center text-muted">No problems match these filters. Try clearing one. 🔍</p>
        )}
      </div>
    </div>
  );
}

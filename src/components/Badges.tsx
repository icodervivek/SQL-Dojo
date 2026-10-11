import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import type { Difficulty, Topic } from "@/lib/content/problems";
import { topicMeta } from "@/lib/content/topicMeta";
import type { ProblemStatus } from "@/lib/progress";

const difficultyStyle: Record<Difficulty, string> = {
  Easy: "text-emerald-500 bg-emerald-500/10 ring-emerald-500/25",
  Medium: "text-amber-500 bg-amber-500/10 ring-amber-500/25",
  Hard: "text-rose-500 bg-rose-500/10 ring-rose-500/25",
};

const difficultyDot: Record<Difficulty, string> = {
  Easy: "bg-emerald-500",
  Medium: "bg-amber-500",
  Hard: "bg-rose-500",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${difficultyStyle[difficulty]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${difficultyDot[difficulty]}`} />
      {difficulty}
    </span>
  );
}

export function TopicBadge({ topic }: { topic: Topic }) {
  const meta = topicMeta[topic];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.soft} ${meta.text}`}>
      <Icon size={12} strokeWidth={2.5} />
      {topic}
    </span>
  );
}

/** A colorful rounded square with the topic's icon. */
export function TopicIcon({ topic, size = 40 }: { topic: Topic; size?: number }) {
  const meta = topicMeta[topic];
  const Icon = meta.icon;
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg shadow-black/10 ${meta.gradient}`}
      style={{ width: size, height: size }}
    >
      <Icon size={size * 0.48} strokeWidth={2.25} />
    </span>
  );
}

export function StatusIcon({ status, size = 18 }: { status?: ProblemStatus; size?: number }) {
  if (status === "solved") return <CheckCircle2 size={size} className="text-emerald-500" aria-label="Solved" />;
  if (status === "attempted") return <CircleDot size={size} className="text-amber-500" aria-label="Attempted" />;
  return <Circle size={size} className="text-muted/40" aria-label="Not started" />;
}

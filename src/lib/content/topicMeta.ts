import {
  ArrowUpDown,
  BarChart3,
  Calendar,
  Filter,
  GitBranch,
  Layers,
  Link2,
  ListTree,
  type LucideIcon,
  MousePointerClick,
  PencilLine,
  Sigma,
  SquareFunction,
  SquarePlus,
  TableProperties,
  Trash2,
  Type,
} from "lucide-react";
import type { Topic } from "./problems";

export interface TopicMeta {
  icon: LucideIcon;
  /** Tailwind gradient stops, used with bg-gradient-to-br. */
  gradient: string;
  /** Text color for small labels. */
  text: string;
  /** Soft tinted background for chips. */
  soft: string;
}

export const topicMeta: Record<Topic, TopicMeta> = {
  "Create Table": { icon: TableProperties, gradient: "from-blue-400 to-indigo-600", text: "text-blue-500", soft: "bg-blue-500/10" },
  Insert: { icon: SquarePlus, gradient: "from-green-400 to-emerald-600", text: "text-green-500", soft: "bg-green-500/10" },
  Update: { icon: PencilLine, gradient: "from-yellow-400 to-amber-600", text: "text-yellow-500", soft: "bg-yellow-500/10" },
  Delete: { icon: Trash2, gradient: "from-red-400 to-rose-600", text: "text-red-500", soft: "bg-red-500/10" },
  Basics: { icon: MousePointerClick, gradient: "from-sky-400 to-blue-600", text: "text-sky-500", soft: "bg-sky-500/10" },
  Filtering: { icon: Filter, gradient: "from-emerald-400 to-teal-600", text: "text-emerald-500", soft: "bg-emerald-500/10" },
  Sorting: { icon: ArrowUpDown, gradient: "from-amber-400 to-orange-600", text: "text-amber-500", soft: "bg-amber-500/10" },
  Aggregates: { icon: Sigma, gradient: "from-rose-400 to-pink-600", text: "text-rose-500", soft: "bg-rose-500/10" },
  "Group By": { icon: Layers, gradient: "from-fuchsia-400 to-purple-600", text: "text-fuchsia-500", soft: "bg-fuchsia-500/10" },
  Joins: { icon: Link2, gradient: "from-violet-400 to-indigo-600", text: "text-violet-500", soft: "bg-violet-500/10" },
  Subqueries: { icon: ListTree, gradient: "from-cyan-400 to-sky-600", text: "text-cyan-500", soft: "bg-cyan-500/10" },
  CTEs: { icon: GitBranch, gradient: "from-lime-400 to-green-600", text: "text-lime-500", soft: "bg-lime-500/10" },
  "Window Functions": { icon: BarChart3, gradient: "from-indigo-400 to-violet-700", text: "text-indigo-400", soft: "bg-indigo-500/10" },
  CASE: { icon: SquareFunction, gradient: "from-orange-400 to-red-600", text: "text-orange-500", soft: "bg-orange-500/10" },
  Dates: { icon: Calendar, gradient: "from-teal-400 to-cyan-600", text: "text-teal-500", soft: "bg-teal-500/10" },
  Strings: { icon: Type, gradient: "from-pink-400 to-rose-600", text: "text-pink-500", soft: "bg-pink-500/10" },
};

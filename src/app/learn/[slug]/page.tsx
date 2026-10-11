import type { Metadata } from "next";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonFooter } from "@/components/LessonFooter";
import { RichText } from "@/components/RichText";
import { CodeWindow } from "@/components/SqlCode";
import { TryIt } from "@/components/TryIt";
import { lessonBySlug, lessons } from "@/lib/content/lessons";
import { problems } from "@/lib/content/problems";
import { plainText, truncate } from "@/lib/seo";
import { topicMeta } from "@/lib/content/topicMeta";
import { datasets } from "@/lib/datasets";

export function generateStaticParams() {
  return lessons.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lesson = lessonBySlug.get(slug);
  if (!lesson) return { title: "Lesson not found" };
  const firstParagraph = lesson.body.find((b) => b.type === "p");
  const description = truncate(
    `${lesson.summary} ${firstParagraph?.type === "p" ? plainText(firstParagraph.text) : ""} Free SQL lesson with a live editor.`,
  );
  return {
    title: `${lesson.title}: SQL Lesson`,
    description,
    alternates: { canonical: `/learn/${slug}` },
    openGraph: { title: `${lesson.title}: SQL Lesson`, description, url: `/learn/${slug}` },
  };
}

export default function LessonPage({ params }: PageProps<"/learn/[slug]">) {
  return (
    <Suspense fallback={<p className="p-10 text-center text-sm text-muted">Loading lesson…</p>}>
      <LessonContent params={params} />
    </Suspense>
  );
}

async function LessonContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = lessonBySlug.get(slug);
  if (!lesson) notFound();

  const i = lessons.indexOf(lesson);
  const next = lessons[i + 1];
  const practiceTopics = lesson.slug === "dates-and-strings" ? ["Dates", "Strings"] : [lesson.topic];
  const practice = problems.filter((p) => practiceTopics.includes(p.topic));

  const meta = topicMeta[lesson.topic];
  const Icon = meta.icon;

  return (
    <article className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10">
      <div>
        <Link href="/learn" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-fg">
          <ArrowLeft size={15} /> Learning path
        </Link>
        <div className="glass relative mt-5 overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className={`absolute -top-16 -right-16 h-56 w-56 rounded-full bg-gradient-to-br opacity-30 blur-3xl ${meta.gradient}`} />
          <div className="relative flex items-center gap-5">
            <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-xl ${meta.gradient}`}>
              <Icon size={30} />
            </span>
            <div>
              <p className="text-sm font-semibold text-muted">
                Lesson {i + 1} of {lessons.length}
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{lesson.title}</h1>
              <p className="mt-1 text-muted">{lesson.summary}</p>
            </div>
          </div>
          <div className="relative mt-6 h-1.5 overflow-hidden rounded-full bg-panel-2">
            <div className="bg-brand h-full rounded-full" style={{ width: `${((i + 1) / lessons.length) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-5 text-[1.05rem] leading-relaxed">
        {lesson.body.map((block, j) =>
          block.type === "p" ? <RichText key={j} text={block.text} /> : <CodeWindow key={j} sql={block.sql} title="example.sql" />,
        )}
      </div>

      <div>
        <p className="mb-3 flex items-center gap-2 text-sm text-muted">
          <Sparkles size={15} className="text-fuchsia-500" />
          You&apos;re querying the <strong className="text-fg">{datasets[lesson.dataset].name}</strong> database. Edit the
          query and run it!
        </p>
        <TryIt key={lesson.slug} dataset={lesson.dataset} initial={lesson.tryIt} />
      </div>

      <LessonFooter slug={lesson.slug} practice={practice} next={next && { slug: next.slug, title: next.title }} />
    </article>
  );
}

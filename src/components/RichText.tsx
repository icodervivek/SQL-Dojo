import { Fragment } from "react";

/** Renders the tiny markup used in content: `code` and **bold**. Blank lines split paragraphs. */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <>
      {text.split(/\n\s*\n/).map((para, i) => (
        <p key={i} className={className}>
          {para.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, j) => {
            if (part.startsWith("`") && part.endsWith("`")) {
              return (
                <code
                  key={j}
                  className="rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[0.88em] font-medium text-violet-600 dark:text-violet-300"
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={j} className="font-bold text-fg">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <Fragment key={j}>{part}</Fragment>;
          })}
        </p>
      ))}
    </>
  );
}

import { Fragment } from "react";

const KEYWORDS = new Set(
  `select from where and or not in is null as join left right inner outer full cross on group by order having limit offset
   distinct with case when then else end asc desc between like ilike exists union all insert into values update set delete
   create table primary key references over partition rows range true false`.split(/\s+/),
);

const TOKEN = /(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)(\()?|([\s\S])/g;

type Token = { text: string; className?: string };

function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  for (const [, comment, str, num, word, paren, other] of sql.matchAll(TOKEN)) {
    if (comment) tokens.push({ text: comment, className: "sql-cmt" });
    else if (str) tokens.push({ text: str, className: "sql-str" });
    else if (num) tokens.push({ text: num, className: "sql-num" });
    else if (word) {
      const className = KEYWORDS.has(word.toLowerCase()) ? "sql-kw" : paren ? "sql-fn" : undefined;
      tokens.push({ text: word, className });
      if (paren) tokens.push({ text: paren });
    } else tokens.push({ text: other });
  }
  return tokens;
}

/** Lightweight SQL syntax highlighting for read-only code blocks. */
export function SqlCode({ sql }: { sql: string }) {
  return (
    <>
      {tokenize(sql).map((t, i) =>
        t.className ? (
          <span key={i} className={t.className}>
            {t.text}
          </span>
        ) : (
          <Fragment key={i}>{t.text}</Fragment>
        ),
      )}
    </>
  );
}

/** A code block styled like a little editor window. */
export function CodeWindow({ sql, title = "query.sql" }: { sql: string; title?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-panel-solid shadow-xl shadow-black/5">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-rose-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <span className="ml-2 font-mono text-xs text-muted">{title}</span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
        <SqlCode sql={sql} />
      </pre>
    </div>
  );
}

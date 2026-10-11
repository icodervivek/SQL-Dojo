# SQL Dojo

A free platform for learning and practicing SQL. Every query runs on a real
PostgreSQL database ([PGlite](https://pglite.dev), Postgres compiled to WebAssembly)
inside the user's browser tab. There's no database server to pay for or secure, and
users can't break anything for anyone else.

## Features

- **Problems**: 87 problems (Easy, Medium and Hard) across 16 topics and 7 datasets (Company, Online Shop, Cricket League, Hospital, Bank, Movies, School), covering full CRUD (CREATE TABLE, INSERT, SELECT, UPDATE, DELETE), with instant auto-grading
  - Grading ignores column names, column order and row order (unless the problem asks for an order)
  - On a wrong answer, it shows your output and the expected output side by side, with mismatched rows highlighted
  - Hints are revealed one at a time, and the solution unlocks after you solve the problem or give up
  - Filter by difficulty, topic, solved status and search
- **Learning path**: 15 lessons from `CREATE TABLE` to window functions, each with a live "Try it" editor and linked practice problems
- **Editor**: CodeMirror with SQL highlighting, autocomplete for table and column names, and Ctrl/Cmd+Enter to run
- **Schema panel**: tables, columns, types, row counts and sample rows
- **Safety**: queries run in a Web Worker, so the page never freezes. Queries over 8 seconds are stopped. **Reset database** undoes any changes.
- **Accounts (required)**: sign-in is handled by [Clerk](https://clerk.com), so any provider enabled in the Clerk dashboard (Google, GitHub, email, …) appears on the sign-in page automatically. Lessons and problems are public to read; running or submitting SQL, saving progress and AI hints require signing in (a typed query is kept while the visitor signs in). The profile page is protected on the server by `src/proxy.ts`. Progress is saved to Supabase (which trusts Clerk's tokens) and cached in `localStorage` per account, so people sharing a computer never see each other's progress.
- **Motivation**: XP (Easy 10, Medium 20, Hard 40, lessons 15), levels with titles, daily streaks, a daily challenge, 15 badges and celebration toasts. The `/profile` page has an activity heatmap. All of it is derived from saved progress (`src/lib/gamification.ts`), so nothing extra needs storing or syncing.
- **AI tutor (optional)**: "Ask the AI tutor" explains what's wrong with your query in 2–4 sentences without revealing the solution. It uses [Groq](https://groq.com) (`openai/gpt-oss-120b` by default, low reasoning effort) through `src/app/api/hint/route.ts`, rate-limited per IP.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run lint
npm run check      # runs every problem/lesson SQL against the datasets + grading tests
```

## Enable AI hints (optional)

Create a free Groq API key at [console.groq.com/keys](https://console.groq.com/keys), add it to `.env.local` and restart the server:

```
GROQ_API_KEY=gsk_...
# Optional: use a different model (see https://console.groq.com/docs/models)
# GROQ_MODEL=llama-3.3-70b-versatile
```

The key stays on the server. The browser only talks to `/api/hint`. Without a key, the AI tutor buttons are hidden.

## Enable accounts (required)

Sign-in uses **Clerk**; progress is stored in **Supabase**, which is set up to trust Clerk's sign-ins.

1. **Clerk:** create an application at [clerk.com](https://clerk.com) and enable the sign-in methods you want
   (Google, GitHub, email…). From **API keys**, add to `.env.local`:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   ```

2. **Connect Clerk to Supabase:** in Clerk open [Integrations → Supabase](https://dashboard.clerk.com/setup/supabase),
   activate it and copy the **Clerk domain**. In Supabase go to **Authentication → Sign In / Providers → Add provider →
   Clerk** and paste that domain.
3. **Supabase database:** create a project at [supabase.com](https://supabase.com), then in the SQL editor run
   [`supabase/schema.sql`](supabase/schema.sql). If your project was set up before the move to Clerk, run
   [`supabase/migrate-to-clerk.sql`](supabase/migrate-to-clerk.sql) instead. Then add to `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Restart the server.

## Adding content

- **Problems**: add an entry to `src/lib/content/problems.ts`. The grader compares the
  user's result with the result of your `solution` query, so no expected output needs
  to be written by hand. For problems that change data (INSERT/UPDATE/DELETE/CREATE TABLE),
  also add a `check` SELECT. It runs after the statement, and the table state it returns is
  what gets compared. The list is sorted automatically by topic order (`topics`) and then
  by difficulty. Run `npm run check` afterwards.
- **Lessons**: add an entry to `src/lib/content/lessons.ts`.
- **Datasets**: add a SQL file to `src/lib/datasets/` and register it in `index.ts`. All data is fictional.

## How it works

| Piece | File |
| --- | --- |
| Postgres in a Web Worker | `src/lib/sql/sql.worker.ts` |
| Worker client (timeouts, reset) | `src/lib/sql/engine.ts` |
| Result comparison | `src/lib/sql/grade.ts` |
| Progress store + Supabase sync | `src/lib/progress.ts` |
| Sign-in (Clerk) → app + Supabase token | `src/components/ClerkBridge.tsx`, `src/proxy.ts` |
| Problem page | `src/components/Workspace.tsx` |

Note: problem solutions ship in the client bundle, because grading runs in the browser.
That's fine for a practice site. If you later add contests or certificates, move grading to a server.

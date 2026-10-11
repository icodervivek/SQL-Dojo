-- Run this once in the Supabase SQL editor (new projects).
-- Sign-in is handled by Clerk: Supabase trusts Clerk's session tokens via
-- Authentication → Sign In / Providers → Clerk ("Third-Party Auth"), and the Clerk user id
-- (e.g. "user_2abc...") arrives as auth.jwt()->>'sub'.
create table if not exists public.user_progress (
  user_id     text primary key default (auth.jwt()->>'sub'),
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.user_progress enable row level security;

-- Each user can only see and change their own progress.
create policy "read own progress" on public.user_progress
  for select to authenticated
  using ((select auth.jwt()->>'sub') = user_id);
create policy "insert own progress" on public.user_progress
  for insert to authenticated
  with check ((select auth.jwt()->>'sub') = user_id);
create policy "update own progress" on public.user_progress
  for update to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

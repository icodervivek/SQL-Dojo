-- One-time migration for projects created before sign-in moved to Clerk.
-- The old table keyed progress by Supabase Auth user ids (uuid); Clerk ids are text
-- (e.g. "user_2abc..."), and the old rows can't be matched to Clerk accounts, so the table is
-- recreated. Progress saved before sign-in was required is still merged into the first account
-- that signs in on that browser; progress made under the old Supabase sign-in starts fresh.
drop table if exists public.user_progress;

create table public.user_progress (
  user_id     text primary key default (auth.jwt()->>'sub'),
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.user_progress enable row level security;

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

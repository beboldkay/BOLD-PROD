-- BOLD Daily Briefer — initial schema
-- Mirrors the Claude-Artifact data model from daily-briefer-source.html:
--   checkins/{YYYY-MM-DD}, tasks/{id}, digest/latest
-- ...plus the two tables the standalone version needs: Google refresh tokens
-- and Web Push subscriptions.

create extension if not exists "pgcrypto";

-- ─── Daily check-ins ─────────────────────────────────────────────────────────
-- One row per (user, local Asia/Jerusalem date). A new day simply means a new
-- row, which is what makes the strip "reset" at local midnight.
create table if not exists public.checkins (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  date       date        not null,
  pills      boolean     not null default false,
  water      integer     not null default 0 check (water >= 0 and water <= 40),
  teeth_am   boolean     not null default false,
  teeth_pm   boolean     not null default false,
  clean      boolean     not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

-- ─── Missions ────────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  text       text        not null check (char_length(text) between 1 and 280),
  done       boolean     not null default false,
  source     text        not null default 'manual' check (source in ('seed', 'manual')),
  category   text        not null default 'work'   check (category in ('work', 'personal')),
  -- Stable identity for auto-suggested tasks so the digest job can insert them
  -- idempotently (ON CONFLICT DO NOTHING) and never touch one you already have.
  seed_key   text,
  created_at timestamptz not null default now()
);

-- Plain (non-partial) unique constraint: Postgres treats NULLs as distinct, so
-- manual tasks with seed_key = NULL never collide, while ON CONFLICT inference
-- still resolves cleanly for the digest job's idempotent inserts.
create unique index if not exists tasks_user_seed_key_uniq
  on public.tasks (user_id, seed_key);

create index if not exists tasks_user_created_idx
  on public.tasks (user_id, created_at);

-- ─── Digest (one row per user; the old `digest/latest` document) ─────────────
create table if not exists public.digest (
  user_id        uuid        primary key references auth.users(id) on delete cascade,
  refreshed_at   timestamptz,
  calendar_today jsonb       not null default '[]'::jsonb,
  timeline       jsonb       not null default '[]'::jsonb,
  inbox          jsonb       not null default '[]'::jsonb,
  noise          text        not null default '',
  -- Fingerprint of whatever we last pushed about, so a routine refresh that
  -- surfaces the same urgent item does not notify twice.
  push_signature text,
  last_error     text
);

-- ─── Google OAuth refresh tokens (service-role only) ────────────────────────
create table if not exists public.google_tokens (
  user_id       uuid        primary key references auth.users(id) on delete cascade,
  refresh_token text        not null,
  scope         text,
  updated_at    timestamptz not null default now()
);

-- ─── Web Push subscriptions ─────────────────────────────────────────────────
create table if not exists public.push_subscriptions (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  endpoint   text        not null unique,
  p256dh     text        not null,
  auth       text        not null,
  created_at timestamptz not null default now()
);

-- ─── Row Level Security ─────────────────────────────────────────────────────
alter table public.checkins           enable row level security;
alter table public.tasks              enable row level security;
alter table public.digest             enable row level security;
alter table public.google_tokens      enable row level security;
alter table public.push_subscriptions enable row level security;

do $$
declare t text;
begin
  foreach t in array array['checkins', 'tasks', 'digest', 'push_subscriptions'] loop
    execute format('drop policy if exists %I on public.%I', t || '_own', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t || '_own', t
    );
  end loop;
end $$;

-- google_tokens deliberately has RLS on and *no* policies: nothing but the
-- service role can read it, so a stolen anon key can never lift the refresh
-- token. The UI asks this function instead of reading the table.
create or replace function public.google_is_connected()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.google_tokens where user_id = auth.uid());
$$;

revoke all on function public.google_is_connected() from public;
grant execute on function public.google_is_connected() to authenticated;

-- ─── Realtime ───────────────────────────────────────────────────────────────
-- Drives the live cross-device updates the Artifact got from onSnapshot().
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'checkins'
    ) then execute 'alter publication supabase_realtime add table public.checkins'; end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tasks'
    ) then execute 'alter publication supabase_realtime add table public.tasks'; end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'digest'
    ) then execute 'alter publication supabase_realtime add table public.digest'; end if;
  end if;
end $$;

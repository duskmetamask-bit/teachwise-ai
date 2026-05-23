create table if not exists public.workspace_snapshots (
  user_id uuid primary key references auth.users (id) on delete cascade,
  prefs jsonb not null default '{}'::jsonb,
  messages jsonb not null default '[]'::jsonb,
  saved_outputs jsonb not null default '[]'::jsonb,
  email_logs jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now()),
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.workspace_snapshots enable row level security;

create policy "users can read their own workspace"
on public.workspace_snapshots
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can insert their own workspace"
on public.workspace_snapshots
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update their own workspace"
on public.workspace_snapshots
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update on public.workspace_snapshots to authenticated;

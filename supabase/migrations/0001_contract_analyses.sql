create extension if not exists pgcrypto;

create table if not exists public.contract_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  contract_text text not null,
  analysis_json jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists contract_analyses_user_created_idx
  on public.contract_analyses (user_id, created_at desc);

alter table public.contract_analyses enable row level security;

drop policy if exists "Users can read own analyses" on public.contract_analyses;
create policy "Users can read own analyses"
  on public.contract_analyses
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own analyses" on public.contract_analyses;
create policy "Users can insert own analyses"
  on public.contract_analyses
  for insert
  with check (auth.uid() = user_id);

-- Tree V1: business onboarding — shops table + RLS (owner-scoped reads/writes).
create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null,
  entity text not null references public.entities(did),
  name text not null,
  place text not null,
  accepts_mly boolean not null default true,
  accepts_cash boolean not null default true,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
alter table public.shops enable row level security;
create policy shops_owner on public.shops for all using (auth.uid() = owner) with check (auth.uid() = owner);

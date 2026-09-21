-- MiLyfe Tree V1 slice: trunk + MiMoney + MiForge tables, RLS, atomic transfer RPC.
-- Money: integer minor units in NUMERIC, CHECK >= 0 everywhere. No negative ever.

-- ---------- Trunk ----------
create table if not exists public.entities (
  did text primary key,
  owner uuid not null,
  type text not null default 'person',
  status text not null default 'invited',
  created_at timestamptz not null default now()
);

create table if not exists public.names (
  scope text not null,
  label text not null,
  entity text not null references public.entities(did),
  status text not null default 'active',
  history jsonb not null default '[]'::jsonb,
  primary key (scope, label)
);

create table if not exists public.data_spaces (
  id text primary key,
  owner uuid not null,
  kind text not null,
  policy text not null default 'owner-only',
  created_at timestamptz not null default now()
);

create table if not exists public.grants (
  id uuid primary key,
  grant jsonb not null,
  subject uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.quarantines (
  id text primary key,
  target text not null,
  reason text not null,
  expires timestamptz not null,
  reviewer text,
  released_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.idempotency_keys (
  key text primary key,
  op text not null,
  receipt jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.receipts (
  id text primary key,
  owner uuid,
  receipt jsonb not null,
  created_at timestamptz not null default now()
);

-- ---------- MiMoney (sole ledger) ----------
create table if not exists public.wallets (
  entity text primary key references public.entities(did),
  owner uuid not null,
  spending numeric not null default 0 check (spending >= 0),
  savings numeric not null default 0 check (savings >= 0),
  community numeric not null default 0 check (community >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.postings (
  id uuid primary key,
  entries jsonb not null,
  state text not null,
  purpose text not null,
  approval text not null,
  receipt_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.crypto_deposits (
  id uuid primary key,
  entity text not null references public.entities(did),
  owner uuid not null,
  asset text not null check (asset in ('USDC','USDT','SOL','BTC','ETH','XRP')),
  amount text not null,
  tx text not null,
  confirmations int not null default 0,
  status text not null default 'announced',
  credited_mly text not null default '0',
  receipt_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.cash_exchanges (
  id uuid primary key,
  node text not null,
  member text not null references public.entities(did),
  owner uuid not null,
  fiat_amount text not null,
  fiat_code text not null,
  mly_credited text not null,
  node_confirmed boolean not null default false,
  member_confirmed boolean not null default false,
  receipt_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.swap_listings (
  id uuid primary key,
  maker text not null references public.entities(did),
  owner uuid not null,
  offer text not null,
  terms text not null,
  meeting_policy text not null,
  status text not null default 'listed',
  receipt_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.finance_cards (
  id uuid primary key,
  entity text not null references public.entities(did),
  owner uuid not null,
  form_factor text not null check (form_factor in ('digital-nfc','digital-ble','digital-qr')),
  key_ref text not null,
  limits text not null,
  status text not null default 'active',
  receipt_id text,
  created_at timestamptz not null default now()
);

-- ---------- MiForge (11 cohort tables) ----------
create table if not exists public.cohorts (
  id text primary key, kind text not null, target int not null,
  budget_minor text not null default '0', credited_minor text not null default '0',
  created_at timestamptz not null default now()
);
create table if not exists public.members (
  id text primary key, cohort text not null references public.cohorts(id),
  kind text not null, entity text not null, status text not null default 'invited',
  step text not null default 'welcome', last_active_at timestamptz not null default now(),
  nudges int not null default 0
);
create table if not exists public.onboarding_flows (id text primary key, kind text not null, steps jsonb not null, version text not null);
create table if not exists public.progress (flow_id text primary key, member text not null, step text not null, state jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table if not exists public.status_snapshots (id text primary key, cohort text not null, counts jsonb not null, at timestamptz not null default now());
create table if not exists public.cron_jobs (id text primary key, schedule text not null, owner text not null, last_run timestamptz, last_receipt text);
create table if not exists public.key_rotations (id text primary key, scope text not null, rotated_at timestamptz not null default now(), receipt text);
create table if not exists public.sentinel_checks (id text primary key, check text not null, verdict text not null, at timestamptz not null default now());
create table if not exists public.webhooks (id text primary key, url text not null, events jsonb not null, secret_ref text not null, active boolean not null default true);
create table if not exists public.emails (id text primary key, to_entity text not null, template text not null, sent_at timestamptz);
create table if not exists public.dashboard_metrics (id text primary key, metric text not null, value text not null, at timestamptz not null default now());

-- ---------- Atomic transfer RPC (sole mutation path for balances) ----------
create or replace function public.transfer_mly(
  p_sender text, p_recipient text, p_amount_minor text, p_pot text, p_reason text default ''
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount numeric;
  v_balance numeric;
begin
  if p_pot not in ('spending','savings','community') then raise exception 'Invalid pot'; end if;
  if p_sender = p_recipient then raise exception 'Cannot send to yourself'; end if;
  v_amount := p_amount_minor::numeric;
  if v_amount is null or v_amount <= 0 then raise exception 'Amount must be positive'; end if;

  execute format('select %I from public.wallets where entity = $1 for update', p_pot)
    into v_balance using p_sender;
  if v_balance is null then raise exception 'Sender wallet not found'; end if;
  if v_balance < v_amount then raise exception 'Insufficient balance'; end if;

  perform 1 from public.wallets where entity = p_recipient for update;
  if not found then raise exception 'Recipient wallet not found'; end if;

  execute format('update public.wallets set %I = %I - $1, updated_at = now() where entity = $2', p_pot, p_pot)
    using v_amount, p_sender;
  execute format('update public.wallets set %I = %I + $1, updated_at = now() where entity = $2', p_pot, p_pot)
    using v_amount, p_recipient;

  insert into public.postings (id, entries, state, purpose, approval)
  values (gen_random_uuid(),
    jsonb_build_array(
      jsonb_build_object('account', p_sender || ':' || p_pot, 'entity', p_sender, 'delta', (-v_amount)::text),
      jsonb_build_object('account', p_recipient || ':' || p_pot, 'entity', p_recipient, 'delta', v_amount::text)
    ),
    'settled', coalesce(nullif(p_reason, ''), 'transfer'), 'api:money.transfer');
end;
$$;

-- ---------- RLS (per-table; absence of policy = deny; service role bypasses) ----------
alter table public.entities enable row level security;
alter table public.names enable row level security;
alter table public.data_spaces enable row level security;
alter table public.grants enable row level security;
alter table public.quarantines enable row level security;
alter table public.idempotency_keys enable row level security;
alter table public.receipts enable row level security;
alter table public.wallets enable row level security;
alter table public.postings enable row level security;
alter table public.crypto_deposits enable row level security;
alter table public.cash_exchanges enable row level security;
alter table public.swap_listings enable row level security;
alter table public.finance_cards enable row level security;
alter table public.cohorts enable row level security;
alter table public.members enable row level security;
alter table public.onboarding_flows enable row level security;
alter table public.progress enable row level security;
alter table public.status_snapshots enable row level security;
alter table public.cron_jobs enable row level security;
alter table public.key_rotations enable row level security;
alter table public.sentinel_checks enable row level security;
alter table public.webhooks enable row level security;
alter table public.emails enable row level security;
alter table public.dashboard_metrics enable row level security;

-- Owner-scoped reads/writes where safe; money mutated ONLY via RPC (no client write policies).
create policy entities_owner on public.entities for all using (auth.uid() = owner) with check (auth.uid() = owner);
create policy names_read on public.names for select using (true);
create policy spaces_owner on public.data_spaces for all using (auth.uid() = owner) with check (auth.uid() = owner);
create policy grants_subject on public.grants for select using (auth.uid() = subject);
create policy receipts_owner on public.receipts for select using (owner is null or auth.uid() = owner);
create policy wallets_owner_read on public.wallets for select using (auth.uid() = owner);
create policy postings_read on public.postings for select using (true);
create policy deposits_owner on public.crypto_deposits for select using (auth.uid() = owner);
create policy exchanges_owner on public.cash_exchanges for select using (auth.uid() = owner);
create policy swaps_read on public.swap_listings for select using (true);
create policy cards_owner on public.finance_cards for select using (auth.uid() = owner);
create policy cohorts_read on public.cohorts for select using (true);
-- members/flows/progress/snapshots/ops/webhooks/emails/metrics/quarantines/idempotency: service-role only (no policies).

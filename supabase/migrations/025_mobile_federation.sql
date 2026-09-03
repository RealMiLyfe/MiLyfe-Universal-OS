-- ============================================================================
-- MiLyfe Phase 8 — Mobile & Federation
-- Migration 025
--
-- Developer API clients (no PaymentEndpoint/AdsEndpoint), federation peers
-- (fork compatibility), and place-level recovery. True external infra (native
-- app stores, live federation peers) is stubbed; the in-app model is complete.
-- ============================================================================

-- Developer API clients (OAuth-style keys for native apps / integrations).
CREATE TABLE public.api_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_id TEXT NOT NULL UNIQUE DEFAULT ('mic_' || replace(gen_random_uuid()::text, '-', '')),
  scopes TEXT[] NOT NULL DEFAULT '{read}',   -- read, write, media, commerce (NEVER payments/ads)
  redirect_uris TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_api_clients_owner ON public.api_clients(owner_id);

-- Federation peers (other MiLyfe instances / forks this instance can talk to).
CREATE TABLE public.federation_peers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  protocol TEXT NOT NULL DEFAULT 'activitypub' CHECK (protocol IN ('activitypub','matrix','milyfe')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','trusted','blocked')),
  -- What travels between forks and what happens to it.
  allows_messaging BOOLEAN NOT NULL DEFAULT FALSE,
  allows_profile_move BOOLEAN NOT NULL DEFAULT FALSE,
  protocol_version TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Place-level recovery (instance loss, key loss, keeper collusion drills).
CREATE TABLE public.place_recovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place TEXT NOT NULL,
  scenario TEXT NOT NULL,                 -- 'instance_lost','key_lost','keeper_collusion','physical_destruction'
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','drilled','recovered')),
  quorum_required INTEGER,                -- keeper quorum to recover
  last_drill_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.api_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.federation_peers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_recovery ENABLE ROW LEVEL SECURITY;

-- API clients: owner manages own.
CREATE POLICY "api_clients_own" ON public.api_clients
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Federation peers + place recovery: public read (transparency); writes admin-side.
CREATE POLICY "federation_peers_read" ON public.federation_peers FOR SELECT USING (TRUE);
CREATE POLICY "place_recovery_read" ON public.place_recovery FOR SELECT USING (TRUE);

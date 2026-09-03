-- ============================================================================
-- MiLyfe Phase 0 — Trust & Coordination Foundation
-- Migration 017
--
-- The layer no existing product provides: a rights-aware action envelope,
-- a relationship/consent graph, human-readable receipts, and a Sybil-resistant
-- verification ladder that gates economy payouts.
--
-- Internal names (builder-facing): MiAction, MiScope, MiReceipt.
-- Members never see these names directly.
-- ============================================================================

-- ============================================================================
-- MiAction — the common action envelope
-- Every consequential action (money move, vote, publish, role grant, share)
-- is recorded here with its full human-rights semantics.
-- ============================================================================
CREATE TABLE public.mi_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_role TEXT NOT NULL DEFAULT 'self',
  kind TEXT NOT NULL,                     -- 'transfer','vote','publish','role_grant','share','consent'...
  surface TEXT,                           -- 'wallet','voice','media','justice',...
  audience TEXT NOT NULL DEFAULT 'private'
    CHECK (audience IN ('public','community','friends','private','custom')),
  purpose TEXT,
  sensitivity TEXT NOT NULL DEFAULT 'normal'
    CHECK (sensitivity IN ('low','normal','high','critical')),
  state TEXT NOT NULL DEFAULT 'draft'
    CHECK (state IN ('draft','pending_approval','walking','arrived','failed','reversed','expired')),
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  reversible BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  offline_rule TEXT NOT NULL DEFAULT 'reject'  -- how to resolve if done offline: 'merge','reject','reserve','review'
    CHECK (offline_rule IN ('merge','reject','reserve','review')),
  explanation TEXT,                       -- plain-English "why / what happens"
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  policy_version TEXT NOT NULL DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mi_actions_actor ON public.mi_actions(actor_id, created_at DESC);
CREATE INDEX idx_mi_actions_state ON public.mi_actions(state);

-- ============================================================================
-- MiScope — relationship / permission / consent graph
-- ============================================================================
CREATE TABLE public.mi_scope_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,   -- null = to an object/place
  object_ref TEXT,                        -- e.g. 'case:<uuid>', 'household:<uuid>'
  relation TEXT NOT NULL,                 -- 'guardian_of','proxy_for','attorney_for','care_for','household_member','delegate','advocate','translator'
  scope TEXT,                             -- topic/area the relation covers
  requires_second_approval BOOLEAN NOT NULL DEFAULT FALSE,
  youth_assent BOOLEAN,                   -- for guardian/minor relations
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  conflict_of_interest BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mi_scope_from ON public.mi_scope_edges(from_id) WHERE revoked = FALSE;
CREATE INDEX idx_mi_scope_to ON public.mi_scope_edges(to_id) WHERE revoked = FALSE;

-- ============================================================================
-- MiReceipt — human-readable proof of every consequential action
-- ============================================================================
CREATE TABLE public.mi_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID REFERENCES public.mi_actions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  what_happened TEXT NOT NULL,
  what_did_not TEXT,
  who_can_see TEXT NOT NULL DEFAULT 'Only you',
  policy_applied TEXT,
  reversible BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  appeal_path TEXT,                       -- how to challenge it
  verify_hash TEXT,                       -- optional integrity hash
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mi_receipts_user ON public.mi_receipts(user_id, created_at DESC);

-- ============================================================================
-- Verification ladder — Sybil resistance that gates economy payouts
-- ============================================================================
CREATE TABLE public.mi_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'none'
    CHECK (level IN ('none','auto','peer_attested','steward_reviewed')),
  method TEXT,                            -- 'email','phone','peer','steward','doc'
  attested_by UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','revoked','pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, level)
);
CREATE INDEX idx_mi_verifications_user ON public.mi_verifications(user_id, status);

-- Peer attestations (who vouches for whom) — anti-circular by design (checked in app)
CREATE TABLE public.mi_attestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'real_person',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(subject_id, attester_id, kind),
  CHECK (subject_id <> attester_id)       -- no self-attestation
);
CREATE INDEX idx_mi_attestations_subject ON public.mi_attestations(subject_id);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.mi_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mi_scope_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mi_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mi_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mi_attestations ENABLE ROW LEVEL SECURITY;

-- Actions: actor owns; audience 'public'/'community' readable by authenticated.
CREATE POLICY "mi_actions_own" ON public.mi_actions
  FOR ALL USING (auth.uid() = actor_id) WITH CHECK (auth.uid() = actor_id);
CREATE POLICY "mi_actions_public_read" ON public.mi_actions
  FOR SELECT USING (audience IN ('public','community') AND auth.uid() IS NOT NULL);

-- Scope edges: either side can read their own; the from side manages.
CREATE POLICY "mi_scope_from" ON public.mi_scope_edges
  FOR ALL USING (auth.uid() = from_id) WITH CHECK (auth.uid() = from_id);
CREATE POLICY "mi_scope_to_read" ON public.mi_scope_edges
  FOR SELECT USING (auth.uid() = to_id);

-- Receipts: owner only.
CREATE POLICY "mi_receipts_own" ON public.mi_receipts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Verifications: owner reads own; verification level readable by authenticated
-- (needed so the economy can check eligibility) — but only the level, via a view.
CREATE POLICY "mi_verifications_own" ON public.mi_verifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mi_verifications_insert" ON public.mi_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Attestations: subject + attester can read; attester creates.
CREATE POLICY "mi_attestations_read" ON public.mi_attestations
  FOR SELECT USING (auth.uid() = subject_id OR auth.uid() = attester_id);
CREATE POLICY "mi_attestations_insert" ON public.mi_attestations
  FOR INSERT WITH CHECK (auth.uid() = attester_id);
CREATE POLICY "mi_attestations_delete" ON public.mi_attestations
  FOR DELETE USING (auth.uid() = attester_id);

-- Public view of verification level (no PII) so payouts can check eligibility.
CREATE OR REPLACE VIEW public.mi_verification_status AS
  SELECT user_id, MAX(
    CASE level WHEN 'steward_reviewed' THEN 3 WHEN 'peer_attested' THEN 2
               WHEN 'auto' THEN 1 ELSE 0 END
  ) AS level_rank
  FROM public.mi_verifications WHERE status = 'active' GROUP BY user_id;

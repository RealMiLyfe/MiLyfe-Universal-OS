-- ============================================================================
-- MiLyfe Phase 7 — Continuity & Community Trust
-- Migration 024
--
-- The rest of the coordination layer: MiSource (provenance/freshness),
-- MiHandoff (help->human), MiAppeal (due process), MiKinship (household/care),
-- MiDelegate (topic-scoped liquid democracy), MiWalk (offline conflict).
-- Builder-facing names; members see plain surfaces.
-- ============================================================================

-- MiSource — provenance / freshness for resources, law packs, shelters, facts.
CREATE TABLE public.mi_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_type TEXT NOT NULL,                 -- 'resource','statute','shelter','fact','agency'
  ref_id TEXT,
  title TEXT NOT NULL,
  source_name TEXT,
  maintainer_id UUID REFERENCES public.profiles(id),
  jurisdiction TEXT,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  confidence TEXT NOT NULL DEFAULT 'unverified' CHECK (confidence IN ('unverified','low','medium','high')),
  stale_behavior TEXT NOT NULL DEFAULT 'warn' CHECK (stale_behavior IN ('warn','hide','show_with_notice')),
  correction_of UUID REFERENCES public.mi_sources(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mi_sources_ref ON public.mi_sources(ref_type, ref_id);

-- MiHandoff — help request routed to a real human.
CREATE TABLE public.mi_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,                  -- 'legal','medical','safety','financial','emotional','housing','employment'
  urgency TEXT NOT NULL DEFAULT 'routine' CHECK (urgency IN ('routine','soon','urgent','emergency')),
  language TEXT,
  jurisdiction TEXT,
  min_context TEXT,                        -- minimum necessary info shared
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','matched','in_progress','closed','escalated')),
  helper_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);
CREATE INDEX idx_mi_handoffs_status ON public.mi_handoffs(status, urgency);

-- MiAppeal — due-process case flow for any adverse decision.
CREATE TABLE public.mi_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appellant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL,            -- 'moderation','standing','ban','shop_dispute','contribution_reject','role_removal'
  decision_ref TEXT,
  reason TEXT NOT NULL,
  evidence TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','upheld','overturned','remedied','escalated')),
  reviewer_id UUID REFERENCES public.profiles(id),
  reviewer_conflict BOOLEAN NOT NULL DEFAULT FALSE,
  decision_note TEXT,
  interim_restriction TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at TIMESTAMPTZ
);
CREATE INDEX idx_mi_appeals_appellant ON public.mi_appeals(appellant_id, status);

-- MiKinship — household / guardian / care graph (no "head of household" superuser).
CREATE TABLE public.mi_households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE public.mi_kinship (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES public.mi_households(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relation TEXT NOT NULL,                 -- 'member','guardian','youth','caregiver','dependent'
  guardian_of UUID REFERENCES public.profiles(id),
  youth_assent BOOLEAN,
  abuse_safe_split BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(household_id, person_id)
);
CREATE INDEX idx_mi_kinship_person ON public.mi_kinship(person_id);

-- MiDelegate — topic-scoped, expiring, revocable liquid democracy.
CREATE TABLE public.mi_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delegator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delegate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL DEFAULT 'all',      -- topic scope
  place TEXT,
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  no_redelegation BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (delegator_id <> delegate_id)
);
CREATE INDEX idx_mi_delegations_delegator ON public.mi_delegations(delegator_id) WHERE revoked = FALSE;

-- MiWalk — offline pending actions + conflict resolution.
CREATE TABLE public.mi_pending_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_kind TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  offline_rule TEXT NOT NULL DEFAULT 'review' CHECK (offline_rule IN ('merge','reject','reserve','review')),
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','applied','conflicted','rejected','needs_review')),
  conflict_note TEXT,
  created_offline_at TIMESTAMPTZ,
  reconciled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mi_pending_user ON public.mi_pending_actions(user_id, state);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.mi_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mi_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mi_appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mi_households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mi_kinship ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mi_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mi_pending_actions ENABLE ROW LEVEL SECURITY;

-- Sources: public read (freshness is public trust), maintainer writes.
CREATE POLICY "mi_sources_read" ON public.mi_sources FOR SELECT USING (TRUE);
CREATE POLICY "mi_sources_write" ON public.mi_sources
  FOR ALL USING (auth.uid() = maintainer_id) WITH CHECK (auth.uid() = maintainer_id);

-- Handoffs: requester + assigned helper.
CREATE POLICY "mi_handoffs_requester" ON public.mi_handoffs
  FOR ALL USING (auth.uid() = requester_id) WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "mi_handoffs_helper_read" ON public.mi_handoffs
  FOR SELECT USING (auth.uid() = helper_id);

-- Appeals: appellant owns; reviewer reads assigned.
CREATE POLICY "mi_appeals_own" ON public.mi_appeals
  FOR ALL USING (auth.uid() = appellant_id) WITH CHECK (auth.uid() = appellant_id);
CREATE POLICY "mi_appeals_reviewer_read" ON public.mi_appeals
  FOR SELECT USING (auth.uid() = reviewer_id);

-- Households + kinship: members read; creator/person manage own.
CREATE POLICY "mi_households_member" ON public.mi_households
  FOR SELECT USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM public.mi_kinship k WHERE k.household_id = id AND k.person_id = auth.uid()));
CREATE POLICY "mi_households_write" ON public.mi_households
  FOR ALL USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "mi_kinship_read" ON public.mi_kinship
  FOR SELECT USING (auth.uid() = person_id OR auth.uid() = guardian_of);
CREATE POLICY "mi_kinship_write" ON public.mi_kinship
  FOR ALL USING (auth.uid() = person_id OR auth.uid() = guardian_of)
  WITH CHECK (auth.uid() = person_id OR auth.uid() = guardian_of);

-- Delegations: delegator manages; delegate reads incoming.
CREATE POLICY "mi_delegations_delegator" ON public.mi_delegations
  FOR ALL USING (auth.uid() = delegator_id) WITH CHECK (auth.uid() = delegator_id);
CREATE POLICY "mi_delegations_delegate_read" ON public.mi_delegations
  FOR SELECT USING (auth.uid() = delegate_id);

-- Pending actions: owner only.
CREATE POLICY "mi_pending_own" ON public.mi_pending_actions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

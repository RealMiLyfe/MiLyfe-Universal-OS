-- ============================================================================
-- MiLyfe — consolidated migrations 014 -> 026
-- Paste this whole file into the Supabase SQL Editor and Run once.
-- Project: uwozuhmiahytjwfmudia. Idempotent-ish (guards where possible).
-- ============================================================================


-- >>>>>>>>>>>>>>>>>>>> 014_audit_log.sql <<<<<<<<<<<<<<<<<<<<
-- ============================================================================
-- Audit Log — tamper-evident record of sensitive actions
-- Migration 014
-- ============================================================================
-- The application logs privileged/state-changing actions here via
-- src/lib/security/audit.ts (logAudit). Writes are performed with the Supabase
-- service role, which bypasses RLS. RLS below governs READ access only.
--
-- NOTE: This table was referenced in application code (audit_log) but had no
-- migration. Without it, every audit insert failed silently. This migration
-- creates it so the audit trail actually persists.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Query patterns: by actor, by resource, and recent-first listing.
CREATE INDEX IF NOT EXISTS idx_audit_log_actor      ON public.audit_log (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource   ON public.audit_log (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action     ON public.audit_log (action);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Members may read their own audit entries.
CREATE POLICY "audit_log_select_own" ON public.audit_log
  FOR SELECT USING (actor_id = auth.uid());

-- Admins/stewards may read the full audit trail.
CREATE POLICY "audit_log_select_admin" ON public.audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'steward')
    )
  );

-- No INSERT/UPDATE/DELETE policies: only the service role (which bypasses RLS)
-- writes here, and the audit trail is append-only by design. The absence of an
-- UPDATE/DELETE policy means authenticated users can never mutate audit records.


-- >>>>>>>>>>>>>>>>>>>> 015_justice_schema.sql <<<<<<<<<<<<<<<<<<<<
-- ============================================================================
-- MiJustice — The People's Constitutional Justice OS (Phase 1 schema)
-- Migration 015
-- "We The People are not asking. We are REMEMBERING who we are."
--
-- Scope of this migration (guardrails-first, Florida/Duval-first):
--   * Reference/content tables (public read): jurisdictions, statutes,
--     rights guides, constitution, agencies/contacts.
--   * User/case tables (owner-scoped RLS): cases, consent.
-- Legal-document GENERATION is intentionally NOT enabled here — it stays
-- behind the human advisory-board sign-off gate (see docs/planning v2 1.6).
-- ============================================================================

-- ============================================================================
-- 1. JUSTICE_JURISDICTIONS — hierarchical coverage (country > state > circuit > county)
-- ============================================================================
CREATE TABLE public.justice_jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('country', 'state', 'circuit', 'county', 'municipality')),
  parent_id UUID REFERENCES public.justice_jurisdictions(id),
  -- Coverage status controls what the UI promises (accuracy over reach).
  coverage_status TEXT NOT NULL DEFAULT 'coming_soon'
    CHECK (coverage_status IN ('live', 'general_info_only', 'coming_soon')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_justice_jurisdictions_parent ON public.justice_jurisdictions(parent_id);
CREATE INDEX idx_justice_jurisdictions_status ON public.justice_jurisdictions(coverage_status);

-- ============================================================================
-- 2. JUSTICE_STATUTES — statute/rule library (provenance-dated)
-- ============================================================================
CREATE TABLE public.justice_statutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID REFERENCES public.justice_jurisdictions(id),
  citation TEXT NOT NULL,                 -- e.g. "Fla. Stat. 943.0585"
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'statute' CHECK (kind IN ('statute', 'rule', 'constitutional')),
  plain_english TEXT NOT NULL,            -- summary in plain language
  full_text_url TEXT,                     -- link to authoritative source
  source_name TEXT,                       -- e.g. "Florida Legislature"
  as_of_date DATE,                        -- provenance: content "as of"
  last_verified_at TIMESTAMPTZ,           -- freshness (see v3 4.1 / v2 6.6)
  lang TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_justice_statutes_juris ON public.justice_statutes(jurisdiction_id);
CREATE INDEX idx_justice_statutes_citation ON public.justice_statutes(citation);

-- ============================================================================
-- 3. JUSTICE_CONSTITUTION — articles + amendments, decoded (public content)
-- ============================================================================
CREATE TABLE public.justice_constitution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('preamble', 'article', 'amendment')),
  number TEXT,                            -- "I", "1st", etc.
  title TEXT NOT NULL,
  ratified_year INTEGER,
  plain_english TEXT NOT NULL,
  real_world_example TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  lang TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_justice_constitution_sort ON public.justice_constitution(sort_order);

-- ============================================================================
-- 4. JUSTICE_RIGHTS_GUIDES — Know-Your-Rights by situation (public, offline)
-- ============================================================================
CREATE TABLE public.justice_rights_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,                     -- "traffic-stop", "ice-at-your-door"
  situation TEXT NOT NULL,
  summary TEXT NOT NULL,
  -- Ordered steps stored as JSON: [{say, do, dont, note}]
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  jurisdiction_id UUID REFERENCES public.justice_jurisdictions(id),
  as_of_date DATE,
  last_verified_at TIMESTAMPTZ,
  lang TEXT NOT NULL DEFAULT 'en',
  translation_reviewed BOOLEAN NOT NULL DEFAULT FALSE,  -- human-reviewed legal translation (v3 4.2)
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(slug, lang)
);

CREATE INDEX idx_justice_rights_guides_slug ON public.justice_rights_guides(slug, lang);

-- ============================================================================
-- 5. JUSTICE_AGENCIES — courts, clerks, defenders, sheriffs, agencies (public)
-- ============================================================================
CREATE TABLE public.justice_agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID REFERENCES public.justice_jurisdictions(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL,                     -- "court", "clerk", "public_defender", "sheriff", "state_attorney", "agency"
  address TEXT,
  phone TEXT,
  website TEXT,
  notes TEXT,
  last_verified_at TIMESTAMPTZ,           -- re-verify on cadence (v2 6.6)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_justice_agencies_juris ON public.justice_agencies(jurisdiction_id);

-- ============================================================================
-- 6. JUSTICE_CASES — a user's case (owner-scoped, sensitive)
-- ============================================================================
CREATE TABLE public.justice_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  jurisdiction_id UUID REFERENCES public.justice_jurisdictions(id),
  title TEXT,                             -- short label (charge summary)
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'analyzed', 'referred', 'filed', 'resolved', 'closed')),
  -- Structured intake answers (charges, flags). NOT the sensitive free-text.
  intake JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Most sensitive free-text (narrative, immigration status) is CLIENT-SIDE
  -- ENCRYPTED before storage; server stores ciphertext it cannot read (v2 1.4).
  encrypted_narrative TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_justice_cases_user ON public.justice_cases(user_id, status, created_at DESC);

-- ============================================================================
-- 7. JUSTICE_CONSENT — UPL / not-legal-advice acknowledgment (per user)
-- ============================================================================
CREATE TABLE public.justice_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'not_legal_advice'
    CHECK (kind IN ('not_legal_advice', 'privacy', 'proxy_authorization')),
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  version TEXT NOT NULL DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, kind, version)
);

CREATE INDEX idx_justice_consent_user ON public.justice_consent(user_id, kind);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Reference/content tables: readable by everyone (incl. anon), writable only by admins.
ALTER TABLE public.justice_jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_statutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_constitution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_rights_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "justice_jurisdictions_read" ON public.justice_jurisdictions
  FOR SELECT USING (TRUE);
CREATE POLICY "justice_statutes_read" ON public.justice_statutes
  FOR SELECT USING (TRUE);
CREATE POLICY "justice_constitution_read" ON public.justice_constitution
  FOR SELECT USING (TRUE);
CREATE POLICY "justice_rights_guides_read" ON public.justice_rights_guides
  FOR SELECT USING (TRUE);
CREATE POLICY "justice_agencies_read" ON public.justice_agencies
  FOR SELECT USING (TRUE);

-- User/case tables: strictly owner-scoped.
ALTER TABLE public.justice_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "justice_cases_select" ON public.justice_cases
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "justice_cases_insert" ON public.justice_cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "justice_cases_update" ON public.justice_cases
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "justice_cases_delete" ON public.justice_cases
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "justice_consent_select" ON public.justice_consent
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "justice_consent_insert" ON public.justice_consent
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "justice_consent_update" ON public.justice_consent
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- SEED — Florida / Duval County (launch jurisdiction) + priority statutes
-- Public-record contacts; re-verify on cadence (v2 6.6). URLs are informational.
-- ============================================================================

-- Jurisdictions: USA > Florida > 4th Judicial Circuit > Duval County
INSERT INTO public.justice_jurisdictions (id, slug, name, level, parent_id, coverage_status, notes) VALUES
  ('11111111-0000-0000-0000-000000000001', 'usa', 'United States', 'country', NULL, 'general_info_only', 'Federal constitutional content applies nationwide.'),
  ('11111111-0000-0000-0000-000000000002', 'florida', 'Florida', 'state', '11111111-0000-0000-0000-000000000001', 'general_info_only', NULL),
  ('11111111-0000-0000-0000-000000000003', 'fl-4th-circuit', 'Fourth Judicial Circuit', 'circuit', '11111111-0000-0000-0000-000000000002', 'general_info_only', 'Covers Duval, Clay, and Nassau counties.'),
  ('11111111-0000-0000-0000-000000000004', 'duval', 'Duval County (Jacksonville)', 'county', '11111111-0000-0000-0000-000000000003', 'live', 'Launch jurisdiction.')
ON CONFLICT (slug) DO NOTHING;

-- Priority statutes (plain-English summaries; verify text/date against source).
INSERT INTO public.justice_statutes (jurisdiction_id, citation, title, kind, plain_english, full_text_url, source_name, as_of_date) VALUES
  ('11111111-0000-0000-0000-000000000002', 'Fla. Stat. 943.0585', 'Court-Ordered Expunction of Criminal History Records', 'statute', 'Lets an eligible person ask a court to destroy (expunge) a criminal history record. You must first get a Certificate of Eligibility from FDLE, and you are entitled to only one court-ordered sealing or expunction in a lifetime.', 'https://www.flsenate.gov/Laws/Statutes', 'Florida Legislature', NULL),
  ('11111111-0000-0000-0000-000000000002', 'Fla. Stat. 943.059', 'Court-Ordered Sealing of Criminal History Records', 'statute', 'Lets an eligible person ask a court to seal a criminal history record from public view. Like expunction, it requires an FDLE Certificate of Eligibility first and is limited to one in a lifetime.', 'https://www.flsenate.gov/Laws/Statutes', 'Florida Legislature', NULL),
  ('11111111-0000-0000-0000-000000000002', 'Fla. R. Crim. P. 3.191', 'Speedy Trial', 'rule', 'Sets time limits within which the state must bring a person to trial after arrest. Missing these limits can be a basis to seek discharge.', 'https://www.floridabar.org/rules/', 'The Florida Bar', NULL),
  ('11111111-0000-0000-0000-000000000002', 'Fla. R. Crim. P. 3.850', 'Motion to Vacate, Set Aside, or Correct Sentence', 'rule', 'The main post-conviction motion in Florida to challenge a conviction or sentence based on things like constitutional violations or ineffective counsel.', 'https://www.floridabar.org/rules/', 'The Florida Bar', NULL)
ON CONFLICT DO NOTHING;

-- Duval agencies (public-record contacts; re-verify at build).
INSERT INTO public.justice_agencies (jurisdiction_id, name, role, address, phone, website) VALUES
  ('11111111-0000-0000-0000-000000000004', 'Fourth Judicial Circuit Court', 'court', '501 W. Adams St., Jacksonville, FL 32202', NULL, 'https://www.jud4.org'),
  ('11111111-0000-0000-0000-000000000004', 'Duval County Clerk of Courts', 'clerk', '501 W. Adams St., Jacksonville, FL 32202', NULL, 'https://www.duvalclerk.com'),
  ('11111111-0000-0000-0000-000000000004', 'State Attorney, Fourth Judicial Circuit', 'state_attorney', NULL, NULL, 'https://sao4th.com'),
  ('11111111-0000-0000-0000-000000000004', 'Public Defender, Fourth Judicial Circuit', 'public_defender', NULL, '904-255-4673', 'https://www.pd4th.org'),
  ('11111111-0000-0000-0000-000000000004', 'Jacksonville Sheriff''s Office', 'sheriff', '501 E. Bay St., Jacksonville, FL 32202', '904-630-2209', 'https://www.jaxsheriff.org'),
  ('11111111-0000-0000-0000-000000000002', 'FDLE — Seal & Expunge Section', 'agency', NULL, NULL, 'https://www.fdle.state.fl.us/Seal-and-Expunge-Process.aspx')
ON CONFLICT DO NOTHING;


-- >>>>>>>>>>>>>>>>>>>> 016_justice_expansion.sql <<<<<<<<<<<<<<<<<<<<
-- ============================================================================
-- MiJustice — Expansion schema (Phases 3-7)
-- Migration 016
--
-- Adds: violations, filings + templates + advisory sign-off, class actions +
-- members, coalition partners/attorneys/referrals, AI agent logs, knowledge
-- graph, outcomes, rapid-response contacts, case roles/shares, petitions.
--
-- GUARDRAIL: generated legal filings are gated by justice_template_reviews.
-- A filing type is only "enabled" once a licensed attorney signs off. This is
-- enforced in app logic + the review console; the schema records the gate.
-- ============================================================================

-- ============================================================================
-- 1. VIOLATIONS — per-case constitutional issues found by the Defender
-- ============================================================================
CREATE TABLE public.justice_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.justice_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amendment TEXT NOT NULL,               -- "4th", "14th", etc.
  title TEXT NOT NULL,
  explanation TEXT NOT NULL,             -- plain English
  citations JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{cite, verified, url}]
  confidence TEXT NOT NULL DEFAULT 'needs_review'
    CHECK (confidence IN ('high', 'needs_review', 'uncertain')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_justice_violations_case ON public.justice_violations(case_id);

-- ============================================================================
-- 2. TEMPLATES — filing templates (metadata; body in repo/content)
-- ============================================================================
CREATE TABLE public.justice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  kind TEXT NOT NULL,                    -- "motion_suppress", "expungement", etc.
  jurisdiction_id UUID REFERENCES public.justice_jurisdictions(id),
  description TEXT,
  -- Enabled only after human attorney sign-off (see reviews).
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. TEMPLATE_REVIEWS — advisory-board sign-off gate (the accuracy gate)
-- ============================================================================
CREATE TABLE public.justice_template_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.justice_templates(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id),
  reviewer_bar_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'needs_changes')),
  notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_justice_template_reviews_tpl ON public.justice_template_reviews(template_id);

-- ============================================================================
-- 4. FILINGS — a user's generated document instances (DRAFT until reviewed)
-- ============================================================================
CREATE TABLE public.justice_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.justice_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.justice_templates(id),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'attorney_review', 'reviewed', 'filed', 'outcome')),
  -- The assembled document is client-side encrypted (sensitive).
  encrypted_body TEXT,
  outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_justice_filings_case ON public.justice_filings(case_id);

-- ============================================================================
-- 5. CLASS_ACTIONS + members (the 20 lawsuits)
-- ============================================================================
CREATE TABLE public.justice_class_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL,
  name TEXT NOT NULL,
  defendants TEXT NOT NULL,
  basis TEXT NOT NULL,                    -- amendments / statutes
  description TEXT,
  status TEXT NOT NULL DEFAULT 'building'
    CHECK (status IN ('building', 'filed', 'certified', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.justice_class_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_action_id UUID NOT NULL REFERENCES public.justice_class_actions(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.justice_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lead_plaintiff_score NUMERIC,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_action_id, case_id)
);
CREATE INDEX idx_justice_class_members_user ON public.justice_class_members(user_id);

-- ============================================================================
-- 6. PARTNERS / ATTORNEYS / MEDIA / REFERRALS (coalition + network)
-- ============================================================================
CREATE TABLE public.justice_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,                    -- legal, reentry, immigrant, media, tech, tribal...
  coverage_area TEXT,
  services TEXT,
  website TEXT,
  contact TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.justice_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.justice_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.justice_partners(id),
  status TEXT NOT NULL DEFAULT 'suggested'
    CHECK (status IN ('suggested', 'contacted', 'accepted', 'declined', 'no_match')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_justice_referrals_user ON public.justice_referrals(user_id);

-- ============================================================================
-- 7. AGENT_LOGS — AI agent auditability (harm-vs-help metric)
-- ============================================================================
CREATE TABLE public.justice_agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.justice_cases(id) ON DELETE SET NULL,
  agent_role TEXT NOT NULL,              -- scanner, verifier, drafter, ...
  action TEXT NOT NULL,
  citations_checked INTEGER NOT NULL DEFAULT 0,
  citations_dropped INTEGER NOT NULL DEFAULT 0,
  flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence TEXT,
  human_review_required BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_justice_agent_logs_case ON public.justice_agent_logs(case_id);

-- ============================================================================
-- 8. KNOWLEDGE GRAPH — pattern detection (public aggregates only)
-- ============================================================================
CREATE TABLE public.justice_kb_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type TEXT NOT NULL,               -- judge, prosecutor, officer, court, agency, statute...
  label TEXT NOT NULL,
  jurisdiction_id UUID REFERENCES public.justice_jurisdictions(id),
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT,                            -- public-record source (defamation guardrail)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.justice_kb_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_node UUID NOT NULL REFERENCES public.justice_kb_nodes(id) ON DELETE CASCADE,
  to_node UUID NOT NULL REFERENCES public.justice_kb_nodes(id) ON DELETE CASCADE,
  edge_type TEXT NOT NULL,               -- presided_over, prosecuted_by, resulted_in...
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_justice_kb_edges_from ON public.justice_kb_edges(from_node);

-- ============================================================================
-- 9. OUTCOMES — impact metrics (aggregatable, no PII in public views)
-- ============================================================================
CREATE TABLE public.justice_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.justice_cases(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,                    -- released, dismissed, recovered, sealed, matched
  amount NUMERIC,
  jurisdiction_id UUID REFERENCES public.justice_jurisdictions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. RAPID-RESPONSE CONTACTS — for Encounter Mode alerts
-- ============================================================================
CREATE TABLE public.justice_rapid_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  relationship TEXT,
  is_attorney BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_justice_rapid_contacts_user ON public.justice_rapid_contacts(user_id, sort_order);

-- ============================================================================
-- 11. CASE ROLES + SHARES — proxy / attorney access (revocable)
-- ============================================================================
CREATE TABLE public.justice_case_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.justice_cases(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shared_with_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'advocate'
    CHECK (role IN ('proxy', 'attorney', 'advocate', 'translator')),
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(case_id, shared_with_id)
);
CREATE INDEX idx_justice_case_shares_shared ON public.justice_case_shares(shared_with_id) WHERE revoked = FALSE;

-- ============================================================================
-- 12. PETITIONS + signatures (Political Pressure Engine)
-- ============================================================================
CREATE TABLE public.justice_petitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target TEXT,                            -- who it's addressed to
  goal INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.justice_petition_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id UUID NOT NULL REFERENCES public.justice_petitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(petition_id, user_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.justice_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_template_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_class_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_kb_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_kb_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_rapid_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_case_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justice_petition_signatures ENABLE ROW LEVEL SECURITY;

-- Helper: does the current user own or have an active share on a case?
CREATE OR REPLACE FUNCTION public.justice_can_access_case(p_case_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.justice_cases c WHERE c.id = p_case_id AND c.user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.justice_case_shares s
                  WHERE s.case_id = p_case_id AND s.shared_with_id = auth.uid() AND s.revoked = FALSE);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Public-read reference tables (no PII): class actions, partners, petitions, kb, templates.
CREATE POLICY "justice_class_actions_read" ON public.justice_class_actions FOR SELECT USING (TRUE);
CREATE POLICY "justice_partners_read" ON public.justice_partners FOR SELECT USING (TRUE);
CREATE POLICY "justice_petitions_read" ON public.justice_petitions FOR SELECT USING (TRUE);
CREATE POLICY "justice_kb_nodes_read" ON public.justice_kb_nodes FOR SELECT USING (TRUE);
CREATE POLICY "justice_kb_edges_read" ON public.justice_kb_edges FOR SELECT USING (TRUE);
CREATE POLICY "justice_templates_read" ON public.justice_templates FOR SELECT USING (TRUE);

-- Owner/share-scoped case data.
CREATE POLICY "justice_violations_access" ON public.justice_violations
  FOR ALL USING (public.justice_can_access_case(case_id)) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "justice_filings_access" ON public.justice_filings
  FOR ALL USING (public.justice_can_access_case(case_id)) WITH CHECK (auth.uid() = user_id);

-- Class members: own only.
CREATE POLICY "justice_class_members_select" ON public.justice_class_members
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "justice_class_members_insert" ON public.justice_class_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "justice_class_members_delete" ON public.justice_class_members
  FOR DELETE USING (auth.uid() = user_id);

-- Referrals: own only.
CREATE POLICY "justice_referrals_select" ON public.justice_referrals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "justice_referrals_insert" ON public.justice_referrals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "justice_referrals_update" ON public.justice_referrals
  FOR UPDATE USING (auth.uid() = user_id);

-- Outcomes: own row read/insert (aggregates exposed via a view, not this table).
CREATE POLICY "justice_outcomes_select" ON public.justice_outcomes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "justice_outcomes_insert" ON public.justice_outcomes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Rapid contacts: own only.
CREATE POLICY "justice_rapid_contacts_all" ON public.justice_rapid_contacts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Case shares: the owner manages; the sharee can see their own row.
CREATE POLICY "justice_case_shares_owner" ON public.justice_case_shares
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "justice_case_shares_sharee" ON public.justice_case_shares
  FOR SELECT USING (auth.uid() = shared_with_id);

-- Petition signatures: own only.
CREATE POLICY "justice_petition_sig_select" ON public.justice_petition_signatures
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "justice_petition_sig_insert" ON public.justice_petition_signatures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Agent logs + template reviews: readable by board attorneys (role check in app),
-- selectable by authenticated for transparency of aggregate counts.
CREATE POLICY "justice_agent_logs_read" ON public.justice_agent_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "justice_template_reviews_read" ON public.justice_template_reviews
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- PUBLIC AGGREGATE VIEW — tracker dashboards (no PII)
-- ============================================================================
CREATE OR REPLACE VIEW public.justice_impact_stats AS
  SELECT
    (SELECT COUNT(*) FROM public.justice_cases) AS total_cases,
    (SELECT COUNT(*) FROM public.justice_violations) AS total_violations,
    (SELECT COUNT(*) FROM public.justice_filings) AS total_filings,
    (SELECT COUNT(*) FROM public.justice_referrals WHERE status = 'accepted') AS total_matches,
    (SELECT COUNT(*) FROM public.justice_outcomes WHERE kind = 'released') AS total_released,
    (SELECT COUNT(*) FROM public.justice_outcomes WHERE kind = 'dismissed') AS total_dismissed,
    (SELECT COUNT(*) FROM public.justice_outcomes WHERE kind = 'sealed') AS total_sealed;

-- ============================================================================
-- SEED — the 20 class actions, coalition partners, expungement template, petitions
-- ============================================================================
INSERT INTO public.justice_class_actions (number, name, defendants, basis, description) VALUES
  (1, 'Victimless-Crime Mass Incarceration', 'Federal & State Governments', '8th, 9th, 14th', 'Challenges mass incarceration for offenses with no victim.'),
  (2, 'Coercive Plea Bargaining', 'DOJ, State Prosecutors', '5th, 6th, 14th', 'Challenges plea practices that bypass the right to trial.'),
  (3, 'Cash Bail as Wealth Discrimination', 'States Using Cash Bail', '8th, 14th', 'Challenges wealth-based pretrial detention.'),
  (4, 'Police Brutality & Wrongful Death', 'Officers + Departments', '4th, 14th, Sec 1983', 'Excessive force and wrongful death.'),
  (5, 'Prison-Labor Exploitation', 'Bureau of Prisons, State DOCs', '13th', 'Challenges uncompensated forced prison labor.'),
  (6, 'Collateral-Consequences Life Sentence', 'Federal & State Governments', '8th, 14th', 'Post-release punishments that never end.'),
  (7, 'ICE Warrantless Home Entries', 'DHS, ICE', '4th', 'Home entries without a judicial warrant.'),
  (8, 'ICE Deportation of U.S. Citizens', 'DHS, ICE', '5th, 14th', 'Wrongful deportation of citizens.'),
  (9, 'ICE Unconstitutional Fines', 'DHS, ICE', '5th, 7th, 8th', 'Excessive administrative fines.'),
  (10, 'ICE Racial Profiling', 'DHS, ICE, CBP', '4th, 14th', 'Enforcement based on race/ethnicity.'),
  (11, 'Native Treaty Violations', 'Federal Government', 'Article VI', 'Broken treaties as supreme law.'),
  (12, 'Wrongful Incarceration - Active Cases', 'All Jurisdictions', 'Sec 1983, 4th, 5th, 6th, 14th', 'People currently held unconstitutionally.'),
  (13, 'Civil Asset Forfeiture', 'Federal & State Governments', '4th, 5th, 8th, 14th', 'Property seized without conviction.'),
  (14, 'School-to-Prison Pipeline', 'School Districts, States', '14th, Title VI', 'Discriminatory school discipline.'),
  (15, 'Modern Debtors Prisons', 'States + Municipalities', '8th, 14th', 'Jailing people for inability to pay.'),
  (16, 'Solitary Confinement as Torture', 'Bureau of Prisons, State DOCs', '8th, Sec 1983, Intl Law', 'Prolonged isolation as torture.'),
  (17, 'AI Surveillance & Predictive Policing', 'Departments Using These Tools', '1st, 4th, 14th', 'Algorithmic policing and misidentification.'),
  (18, 'Juvenile Justice Abuse', 'Juvenile Courts, States', '8th, 14th', 'Trying/holding children as adults.'),
  (19, 'Medical Neglect & Deaths in Custody', 'Prisons, Jails, ICE Facilities', '8th, Sec 1983', 'Deaths from treatable conditions.'),
  (20, 'For-Profit Probation Companies', 'Private Probation Companies + States', '8th, 14th', 'Charging people for their own supervision.')
ON CONFLICT DO NOTHING;

INSERT INTO public.justice_partners (name, type, coverage_area, services, website, verified) VALUES
  ('ACLU of Florida', 'legal', 'Florida', 'Constitutional & immigrant rights litigation', 'https://www.aclufl.org', FALSE),
  ('Jacksonville Area Legal Aid', 'legal', 'Duval County', 'Free civil legal aid for low-income residents', 'https://www.jaxlegalaid.org', FALSE),
  ('Public Defender, 4th Judicial Circuit', 'legal', 'Duval/Clay/Nassau', 'Indigent criminal defense', 'https://www.pd4th.org', FALSE),
  ('Innocence Project of Florida', 'legal', 'Florida', 'Wrongful conviction exonerations', 'https://www.floridainnocence.org', FALSE),
  ('RESTORE', 'reentry', 'Jacksonville', 'Transitional housing & wraparound for women', NULL, FALSE),
  ('Operation New Hope', 'reentry', 'Jacksonville', 'Ready4Work job placement & reentry', 'https://www.operationnewhope.org', FALSE),
  ('The Tributary', 'media', 'Jacksonville', 'Nonprofit investigative journalism', 'https://jaxtrib.org', FALSE),
  ('Jacksonville Today', 'media', 'Jacksonville', 'Nonprofit accountability journalism', 'https://jaxtoday.org', FALSE)
ON CONFLICT DO NOTHING;

INSERT INTO public.justice_templates (slug, title, kind, jurisdiction_id, description, enabled) VALUES
  ('fl-expungement-packet', 'Florida Sealing / Expungement Packet', 'expungement',
    (SELECT id FROM public.justice_jurisdictions WHERE slug = 'florida'),
    'FDLE Certificate of Eligibility walkthrough + certified-disposition request + petition. Requires attorney sign-off before enabling.',
    FALSE)
ON CONFLICT DO NOTHING;

INSERT INTO public.justice_petitions (slug, title, description, target, goal) VALUES
  ('close-13th-loophole', 'Close the 13th Amendment Slavery Loophole', 'Demand an end to the exception that permits forced labor as punishment for crime.', 'U.S. Congress', 1000000),
  ('end-cash-bail-fl', 'End Cash Bail in Florida', 'Stop wealth-based pretrial detention in Florida.', 'Florida Legislature', 100000),
  ('warrants-for-ice', 'Require Judicial Warrants for All ICE Actions', 'No home entry without a warrant signed by a judge.', 'U.S. Congress & DHS', 500000)
ON CONFLICT DO NOTHING;


-- >>>>>>>>>>>>>>>>>>>> 017_trust_foundation.sql <<<<<<<<<<<<<<<<<<<<
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


-- >>>>>>>>>>>>>>>>>>>> 018_economy_loop.sql <<<<<<<<<<<<<<<<<<<<
-- ============================================================================
-- MiLyfe Phase 1 — Economy Loop: Contributions <-> Rewards <-> Treasury
-- Migration 018
--
-- Connective tissue for the economy that already exists (UBI, decay, standing,
-- treasury, rewards). Adds a unified contribution primitive, streaks, treasury
-- health, and the governed loop. No processors, no ads — $MLY only.
-- ============================================================================

-- ============================================================================
-- Contributions — the unified primitive. Every "give" is one typed object,
-- mapped to a standing facet, verified before it pays.
-- ============================================================================
CREATE TABLE public.contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,                     -- 'quest','course_taught','media_upload','vote','help','translate','moderate','case_help'...
  surface TEXT NOT NULL,                  -- 'street','learn','media','voice','justice','connect'...
  facet TEXT NOT NULL,                    -- neighbor|carer|maker|teacher|keeper|voice|shop|helper
  title TEXT NOT NULL,
  description TEXT,
  mly_reward NUMERIC NOT NULL DEFAULT 0,
  facet_points NUMERIC NOT NULL DEFAULT 0,
  verification TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification IN ('pending','auto','peer_attested','steward_reviewed','rejected')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','verified','paid','rejected','appealed')),
  reference TEXT,                         -- link/ref to the thing done
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);
CREATE INDEX idx_contributions_user ON public.contributions(user_id, created_at DESC);
CREATE INDEX idx_contributions_status ON public.contributions(status);

-- Streaks — reward consistency (gentle multiplier), not whales.
CREATE TABLE public.contribution_streaks (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_weeks INTEGER NOT NULL DEFAULT 0,
  longest_weeks INTEGER NOT NULL DEFAULT 0,
  last_active_week TEXT,                   -- ISO week key
  multiplier NUMERIC NOT NULL DEFAULT 1.0, -- capped, gentle
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Milestone badges (one-time achievements + optional one-time $MLY).
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  facet TEXT,
  mly_bonus NUMERIC NOT NULL DEFAULT 0,
  icon TEXT
);
CREATE TABLE public.user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);
CREATE INDEX idx_user_milestones_user ON public.user_milestones(user_id);

-- Treasury health snapshots (runway = weeks of UBI funded at current burn).
CREATE TABLE public.treasury_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  balance NUMERIC NOT NULL DEFAULT 0,
  weekly_inflow NUMERIC NOT NULL DEFAULT 0,
  weekly_outflow NUMERIC NOT NULL DEFAULT 0,
  runway_weeks NUMERIC,                    -- balance / (outflow - inflow) when burning
  ubi_weekly_cost NUMERIC NOT NULL DEFAULT 0,
  allocation JSONB NOT NULL DEFAULT '{}'::jsonb,  -- {ubi:%, rewards:%, community:%}
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Community-directed treasury spending (proposals in Voice allocate $MLY).
CREATE TABLE public.treasury_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID,                        -- links to governance proposal
  title TEXT NOT NULL,
  purpose TEXT,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed','approved','funded','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contributions_own" ON public.contributions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contributions_insert" ON public.contributions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "streaks_own" ON public.contribution_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "milestones_read" ON public.milestones FOR SELECT USING (TRUE);
CREATE POLICY "user_milestones_own" ON public.user_milestones
  FOR SELECT USING (auth.uid() = user_id);

-- Treasury health + allocations are public (transparency).
CREATE POLICY "treasury_health_read" ON public.treasury_health FOR SELECT USING (TRUE);
CREATE POLICY "treasury_allocations_read" ON public.treasury_allocations FOR SELECT USING (TRUE);

-- ============================================================================
-- Public aggregate view of contribution impact (no PII)
-- ============================================================================
CREATE OR REPLACE VIEW public.contribution_stats AS
  SELECT
    (SELECT COUNT(*) FROM public.contributions WHERE status = 'paid') AS total_contributions,
    (SELECT COALESCE(SUM(mly_reward),0) FROM public.contributions WHERE status = 'paid') AS total_mly_paid,
    (SELECT COUNT(DISTINCT user_id) FROM public.contributions WHERE status = 'paid') AS active_contributors;

-- ============================================================================
-- Seed milestones
-- ============================================================================
INSERT INTO public.milestones (slug, title, description, facet, mly_bonus, icon) VALUES
  ('first_quest', 'First Quest', 'Completed your first community quest.', 'helper', 25, 'Zap'),
  ('first_course', 'First Lesson Taught', 'Taught your first lesson.', 'teacher', 50, 'GraduationCap'),
  ('first_upload', 'First Creation', 'Shared your first media.', 'maker', 25, 'Music'),
  ('first_vote', 'First Vote', 'Cast your first vote in the community.', 'voice', 10, 'Landmark'),
  ('ten_helps', 'Ten Helps', 'Helped ten neighbors.', 'neighbor', 100, 'Heart'),
  ('first_case_help', 'Justice Helper', 'Helped on your first MiJustice case.', 'helper', 50, 'Scale')
ON CONFLICT DO NOTHING;


-- >>>>>>>>>>>>>>>>>>>> 019_media.sql <<<<<<<<<<<<<<<<<<<<
-- ============================================================================
-- MiLyfe Phase 2 — Media Vertical (Audio + Video + Shorts + Live + Radio)
-- Migration 019
--
-- The shine. Creators share; the community vibes. $MLY only (tips + optional
-- premium + royalty pool). NO ADS, NO PROCESSORS, NO DARK THEME.
-- External infra (transcode farm, live servers) is stubbed at the edge; the
-- in-app product (catalog, player, channels, playlists, earnings) is complete.
-- ============================================================================

-- Channels — a creator's home for their media.
CREATE TABLE public.media_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  subscriber_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_media_channels_owner ON public.media_channels(owner_id);

-- Media items — the universal object (audio track, video, short, episode).
CREATE TABLE public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.media_channels(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('audio','video','short','live','radio','podcast')),
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  -- Source: hosted file OR remote embed (no hosting required).
  source_type TEXT NOT NULL DEFAULT 'hosted' CHECK (source_type IN ('hosted','youtube','soundcloud','vimeo','hls','mp4')),
  source_url TEXT,                        -- media URL or embed id
  duration_seconds INTEGER,
  -- Discovery
  genres TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  language TEXT,
  -- Access
  visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public','unlisted','private','subscribers')),
  age_restricted BOOLEAN NOT NULL DEFAULT FALSE,
  -- Monetization ($MLY only)
  premium BOOLEAN NOT NULL DEFAULT FALSE,
  price_mly NUMERIC NOT NULL DEFAULT 0,
  -- Counters
  play_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  -- Live/processing state
  status TEXT NOT NULL DEFAULT 'ready'
    CHECK (status IN ('processing','ready','live','ended','failed')),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_media_items_kind ON public.media_items(kind, published_at DESC);
CREATE INDEX idx_media_items_channel ON public.media_items(channel_id);

-- Playlists (create, collaborative, shareable).
CREATE TABLE public.media_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  collaborative BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE public.media_playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.media_playlists(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(playlist_id, media_id)
);
CREATE INDEX idx_media_playlist_items_pl ON public.media_playlist_items(playlist_id, position);

-- Subscriptions (follow a channel).
CREATE TABLE public.media_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.media_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Likes + watch progress + play history.
CREATE TABLE public.media_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(media_id, user_id)
);
CREATE TABLE public.media_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(media_id, user_id)
);
CREATE INDEX idx_media_progress_user ON public.media_progress(user_id, updated_at DESC);

-- Creator support ($MLY tips) — the no-ads revenue path.
CREATE TABLE public.media_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES public.media_items(id) ON DELETE SET NULL,
  channel_id UUID REFERENCES public.media_channels(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_mly NUMERIC NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Radio schedule (OnAir2 face).
CREATE TABLE public.radio_shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.media_channels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  host TEXT,
  day_of_week INTEGER,                    -- 0-6
  start_minute INTEGER,                   -- minutes from midnight
  end_minute INTEGER,
  cover_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_radio_shows_day ON public.radio_shows(day_of_week, start_minute);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.media_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_shows ENABLE ROW LEVEL SECURITY;

-- Channels: public read, owner writes.
CREATE POLICY "media_channels_read" ON public.media_channels FOR SELECT USING (TRUE);
CREATE POLICY "media_channels_write" ON public.media_channels
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Items: public/unlisted readable by all; private/subscribers by uploader (subscriber gating in app).
CREATE POLICY "media_items_read" ON public.media_items
  FOR SELECT USING (visibility IN ('public','unlisted') OR auth.uid() = uploader_id);
CREATE POLICY "media_items_write" ON public.media_items
  FOR ALL USING (auth.uid() = uploader_id) WITH CHECK (auth.uid() = uploader_id);

-- Playlists: public read or owner; owner writes.
CREATE POLICY "media_playlists_read" ON public.media_playlists
  FOR SELECT USING (is_public OR auth.uid() = owner_id);
CREATE POLICY "media_playlists_write" ON public.media_playlists
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "media_playlist_items_read" ON public.media_playlist_items FOR SELECT USING (TRUE);
CREATE POLICY "media_playlist_items_write" ON public.media_playlist_items
  FOR ALL USING (EXISTS (SELECT 1 FROM public.media_playlists p WHERE p.id = playlist_id AND (p.owner_id = auth.uid() OR p.collaborative)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.media_playlists p WHERE p.id = playlist_id AND (p.owner_id = auth.uid() OR p.collaborative)));

-- Subscriptions / likes / progress: own.
CREATE POLICY "media_subs_read" ON public.media_subscriptions FOR SELECT USING (TRUE);
CREATE POLICY "media_subs_write" ON public.media_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "media_likes_read" ON public.media_likes FOR SELECT USING (TRUE);
CREATE POLICY "media_likes_write" ON public.media_likes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "media_progress_own" ON public.media_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tips: sender creates; channel owner + sender read.
CREATE POLICY "media_tips_insert" ON public.media_tips
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "media_tips_read" ON public.media_tips
  FOR SELECT USING (auth.uid() = from_user_id OR EXISTS (SELECT 1 FROM public.media_channels c WHERE c.id = channel_id AND c.owner_id = auth.uid()));

-- Radio shows: public read, channel owner writes.
CREATE POLICY "radio_shows_read" ON public.radio_shows FOR SELECT USING (TRUE);
CREATE POLICY "radio_shows_write" ON public.radio_shows
  FOR ALL USING (EXISTS (SELECT 1 FROM public.media_channels c WHERE c.id = channel_id AND c.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.media_channels c WHERE c.id = channel_id AND c.owner_id = auth.uid()));


-- >>>>>>>>>>>>>>>>>>>> 020_social.sql <<<<<<<<<<<<<<<<<<<<
-- ============================================================================
-- MiLyfe Phase 3 — Social Depth
-- Migration 020
--
-- Stories/reels, groups, pages, events, MiBlog, threaded reactions.
-- No ads. No paid boosts. Reactions/feature use $MLY or standing, never ad buys.
-- ============================================================================

-- Stories (24h ephemeral) + views
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_url TEXT,
  caption TEXT,
  kind TEXT NOT NULL DEFAULT 'image' CHECK (kind IN ('image','video','text')),
  background TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_stories_active ON public.stories(user_id, expires_at) WHERE expires_at > NOW();

CREATE TABLE public.story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- Groups
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  privacy TEXT NOT NULL DEFAULT 'public' CHECK (privacy IN ('public','private','hidden')),
  cover_url TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);
CREATE INDEX idx_group_members_user ON public.group_members(user_id);

-- Pages (public-facing entities with likers + reviews)
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  cover_url TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE public.page_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(page_id, user_id)
);

-- Events + calendar
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  location_name TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_events_time ON public.events(starts_at);
CREATE TABLE public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going','interested','declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- MiBlog (long-form)
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,                     -- rich text (HTML/markdown)
  cover_url TEXT,
  series TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  like_count INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_blog_posts_pub ON public.blog_posts(published, published_at DESC);

-- Threaded comment reactions (generic: works on posts, blog, media, etc.)
CREATE TABLE public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,              -- 'post','comment','blog','media','story'
  target_id UUID NOT NULL,
  kind TEXT NOT NULL DEFAULT 'like' CHECK (kind IN ('like','love','celebrate','support','insightful')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);
CREATE INDEX idx_reactions_target ON public.reactions(target_type, target_id);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Stories: active ones readable by all authenticated; owner writes.
CREATE POLICY "stories_read" ON public.stories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "stories_write" ON public.stories
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "story_views_read" ON public.story_views
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid()) OR auth.uid() = viewer_id);
CREATE POLICY "story_views_insert" ON public.story_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Groups: public/private readable; hidden by members. Owner writes.
CREATE POLICY "groups_read" ON public.groups
  FOR SELECT USING (privacy IN ('public','private') OR EXISTS (SELECT 1 FROM public.group_members m WHERE m.group_id = id AND m.user_id = auth.uid()));
CREATE POLICY "groups_write" ON public.groups
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "group_members_read" ON public.group_members FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "group_members_write" ON public.group_members
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Pages: public read, owner writes; reviews by any authenticated (own row).
CREATE POLICY "pages_read" ON public.pages FOR SELECT USING (TRUE);
CREATE POLICY "pages_write" ON public.pages
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "page_reviews_read" ON public.page_reviews FOR SELECT USING (TRUE);
CREATE POLICY "page_reviews_write" ON public.page_reviews
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Events: public read; host writes; RSVPs own.
CREATE POLICY "events_read" ON public.events FOR SELECT USING (TRUE);
CREATE POLICY "events_write" ON public.events
  FOR ALL USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);
CREATE POLICY "event_rsvps_read" ON public.event_rsvps FOR SELECT USING (TRUE);
CREATE POLICY "event_rsvps_write" ON public.event_rsvps
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Blog: published readable by all, drafts by author; author writes.
CREATE POLICY "blog_read" ON public.blog_posts
  FOR SELECT USING (published OR auth.uid() = author_id);
CREATE POLICY "blog_write" ON public.blog_posts
  FOR ALL USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

-- Reactions: readable by all authenticated; own writes.
CREATE POLICY "reactions_read" ON public.reactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "reactions_write" ON public.reactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- >>>>>>>>>>>>>>>>>>>> 021_learn_lms.sql <<<<<<<<<<<<<<<<<<<<
-- ============================================================================
-- MiLyfe Phase 4 — Learn → full LMS
-- Migration 021 (extends existing learn_paths/modules/enrollments/progress/badges/classes)
--
-- Quizzes, assignments, certificates, cohorts, instructor tools.
-- ============================================================================

-- Quizzes attached to a module
CREATE TABLE public.learn_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.learn_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER,             -- null = untimed
  passing_score INTEGER NOT NULL DEFAULT 70,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  is_practice BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questions (8 types) + a question bank
CREATE TABLE public.learn_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.learn_quizzes(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('mcq_single','mcq_multi','match','sort','fill_blank','dropdown','free_text','essay')),
  prompt TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,   -- [{id,text}]
  correct JSONB NOT NULL DEFAULT '[]'::jsonb,   -- correct option ids / answer(s)
  points INTEGER NOT NULL DEFAULT 1,
  auto_graded BOOLEAN NOT NULL DEFAULT TRUE,    -- essay/free_text = manual
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_learn_questions_quiz ON public.learn_questions(quiz_id, position);

-- Quiz attempts + answers
CREATE TABLE public.learn_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.learn_quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,   -- {question_id: answer}
  score NUMERIC,
  passed BOOLEAN,
  needs_manual_grade BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);
CREATE INDEX idx_learn_attempts_user ON public.learn_quiz_attempts(user_id, quiz_id);

-- Assignments (file upload -> instructor review -> graded)
CREATE TABLE public.learn_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.learn_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT,
  max_points INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE public.learn_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.learn_assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT,
  text_body TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','reviewed','returned')),
  grade NUMERIC,
  instructor_remarks TEXT,
  corrected_file_url TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(assignment_id, user_id)
);

-- Certificates (issued on completion, unique validation code)
CREATE TABLE public.learn_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  path_id UUID REFERENCES public.learn_paths(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  validation_code TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_learn_certs_user ON public.learn_certificates(user_id);

-- Cohorts / batches (group enrollment with start/end)
CREATE TABLE public.learn_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES public.learn_paths(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  starts_on DATE,
  ends_on DATE,
  instructor_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE public.learn_cohort_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES public.learn_cohorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cohort_id, user_id)
);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.learn_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_cohort_members ENABLE ROW LEVEL SECURITY;

-- Quizzes/questions/assignments/cohorts: public read (content); admin-managed writes handled server-side.
CREATE POLICY "learn_quizzes_read" ON public.learn_quizzes FOR SELECT USING (TRUE);
-- Questions: hide the correct answers by reading through a view in app; row-read allowed for authed.
CREATE POLICY "learn_questions_read" ON public.learn_questions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "learn_assignments_read" ON public.learn_assignments FOR SELECT USING (TRUE);
CREATE POLICY "learn_cohorts_read" ON public.learn_cohorts FOR SELECT USING (TRUE);

-- Attempts / submissions / certificates / cohort membership: owner-scoped.
CREATE POLICY "learn_attempts_own" ON public.learn_quiz_attempts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "learn_submissions_own" ON public.learn_submissions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "learn_certs_own" ON public.learn_certificates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "learn_cohort_members_own" ON public.learn_cohort_members
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Public certificate validation (verify a code without exposing user).
CREATE OR REPLACE VIEW public.learn_certificate_validation AS
  SELECT validation_code, title, issued_at FROM public.learn_certificates;


-- >>>>>>>>>>>>>>>>>>>> 022_commerce.sql <<<<<<<<<<<<<<<<<<<<
-- ============================================================================
-- MiLyfe Phase 5 — Commerce & Services Depth
-- Migration 022
--
-- Catalog + variants, cart, orders, vendor dashboard, delivery tracking,
-- service verticals. $MLY ONLY. No processors. No ads. No sponsored listings.
-- ============================================================================

-- Vendors (a member's store)
CREATE TABLE public.shop_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  section TEXT NOT NULL DEFAULT 'goods'
    CHECK (section IN ('goods','food','grocery','pharmacy','flowers','digital','service','rental','parcel')),
  self_delivery BOOLEAN NOT NULL DEFAULT FALSE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  rating NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_shop_vendors_owner ON public.shop_vendors(owner_id);

-- Products (with variants/attributes)
CREATE TABLE public.shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.shop_vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  price_mly NUMERIC NOT NULL DEFAULT 0,   -- base price in $MLY
  is_digital BOOLEAN NOT NULL DEFAULT FALSE,
  attributes JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{name:'Size', values:['S','M','L']}]
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,    -- [{id, label, price_mly, stock}]
  stock INTEGER,                          -- null = unlimited/digital
  rating NUMERIC NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','out_of_stock','hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_shop_products_vendor ON public.shop_products(vendor_id);
CREATE INDEX idx_shop_products_cat ON public.shop_products(category, status);

-- Product reviews
CREATE TABLE public.shop_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.shop_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Cart (persistent, per user)
CREATE TABLE public.shop_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.shop_products(id) ON DELETE CASCADE,
  variant_id TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id, variant_id)
);

-- Saved delivery addresses
CREATE TABLE public.shop_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT,
  region TEXT,
  postal TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders (settled in $MLY via the internal wallet — no processor)
CREATE TABLE public.shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.shop_vendors(id) ON DELETE SET NULL,
  total_mly NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'placed'
    CHECK (status IN ('placed','accepted','preparing','ready','out_for_delivery','delivered','completed','cancelled','refunded')),
  address_id UUID REFERENCES public.shop_addresses(id) ON DELETE SET NULL,
  scheduled_for TIMESTAMPTZ,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_shop_orders_buyer ON public.shop_orders(buyer_id, placed_at DESC);
CREATE INDEX idx_shop_orders_vendor ON public.shop_orders(vendor_id, status);

CREATE TABLE public.shop_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.shop_products(id) ON DELETE SET NULL,
  title TEXT NOT NULL,                    -- snapshot
  variant_label TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_mly NUMERIC NOT NULL DEFAULT 0
);

-- Deliveries (courier flow + tracking)
CREATE TABLE public.shop_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  courier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','assigned','picked_up','en_route','delivered','failed')),
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  eta_minutes INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service bookings (on-demand services / rides / rentals)
CREATE TABLE public.service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.shop_vendors(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,             -- 'service','ride','rental','parcel'
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  price_mly NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','accepted','in_progress','completed','cancelled')),
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_service_bookings_customer ON public.service_bookings(customer_id);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.shop_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

-- Vendors + products + reviews: public read; owner writes.
CREATE POLICY "shop_vendors_read" ON public.shop_vendors FOR SELECT USING (TRUE);
CREATE POLICY "shop_vendors_write" ON public.shop_vendors
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "shop_products_read" ON public.shop_products FOR SELECT USING (TRUE);
CREATE POLICY "shop_products_write" ON public.shop_products
  FOR ALL USING (EXISTS (SELECT 1 FROM public.shop_vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.shop_vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid()));
CREATE POLICY "shop_reviews_read" ON public.shop_reviews FOR SELECT USING (TRUE);
CREATE POLICY "shop_reviews_write" ON public.shop_reviews
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Cart + addresses: owner only.
CREATE POLICY "shop_cart_own" ON public.shop_cart_items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "shop_addresses_own" ON public.shop_addresses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Orders: buyer + the vendor owner can read; buyer creates.
CREATE POLICY "shop_orders_buyer" ON public.shop_orders
  FOR ALL USING (auth.uid() = buyer_id) WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "shop_orders_vendor_read" ON public.shop_orders
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.shop_vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid()));
CREATE POLICY "shop_order_items_read" ON public.shop_order_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.shop_orders o WHERE o.id = order_id AND (o.buyer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.shop_vendors v WHERE v.id = o.vendor_id AND v.owner_id = auth.uid()))));
CREATE POLICY "shop_order_items_insert" ON public.shop_order_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.shop_orders o WHERE o.id = order_id AND o.buyer_id = auth.uid()));

-- Deliveries: buyer + vendor + courier can read.
CREATE POLICY "shop_deliveries_read" ON public.shop_deliveries
  FOR SELECT USING (
    auth.uid() = courier_id OR
    EXISTS (SELECT 1 FROM public.shop_orders o WHERE o.id = order_id AND (o.buyer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.shop_vendors v WHERE v.id = o.vendor_id AND v.owner_id = auth.uid())))
  );

-- Service bookings: customer + vendor owner.
CREATE POLICY "service_bookings_customer" ON public.service_bookings
  FOR ALL USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "service_bookings_vendor_read" ON public.service_bookings
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.shop_vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid()));


-- >>>>>>>>>>>>>>>>>>>> 023_cross_cutting.sql <<<<<<<<<<<<<<<<<<<<
-- ============================================================================
-- MiLyfe Phase 6 — Cross-Cutting Depth
-- Migration 023
--
-- Notification preferences (granular + privacy-aware), unified moderation
-- reports, and universal comments (works on any target). Search uses the
-- existing /api/search; this adds a saved-search + a proper /search surface.
-- ============================================================================

-- Granular notification preferences (per event type + channel).
CREATE TABLE public.notification_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,               -- 'ubi','reward','message','governance','media','justice','commerce','social','safety'
  in_app BOOLEAN NOT NULL DEFAULT TRUE,
  push BOOLEAN NOT NULL DEFAULT TRUE,
  email BOOLEAN NOT NULL DEFAULT FALSE,
  quiet_hours_start INTEGER,              -- minutes from midnight (null = none)
  quiet_hours_end INTEGER,
  neutral_preview BOOLEAN NOT NULL DEFAULT FALSE,  -- shared-device: hide sensitive text
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_type)
);

-- Web-push subscriptions (VAPID). Native push handled separately.
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT,
  auth TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Unified moderation reports (any surface: post, media, product, comment, profile...).
CREATE TABLE public.moderation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,              -- 'post','media','product','comment','profile','story','blog'
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,                   -- 'spam','harassment','illegal','child_safety','other'
  detail TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal','high','child_safety','immediate_threat')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','actioned','dismissed','escalated')),
  resolution TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
CREATE INDEX idx_moderation_reports_status ON public.moderation_reports(status, priority, created_at DESC);

-- Universal comments (threaded, works on any target).
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_comments_target ON public.comments(target_type, target_id, created_at);

-- Cross-surface block (one block, everywhere).
CREATE TABLE public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
CREATE INDEX idx_blocks_blocker ON public.blocks(blocker_id);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_prefs_own" ON public.notification_prefs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "push_subs_own" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reports: reporter creates + reads own; review handled server-side by stewards.
CREATE POLICY "moderation_reports_insert" ON public.moderation_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "moderation_reports_own_read" ON public.moderation_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Comments: public read; own write.
CREATE POLICY "comments_read" ON public.comments FOR SELECT USING (TRUE);
CREATE POLICY "comments_write" ON public.comments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Blocks: own.
CREATE POLICY "blocks_own" ON public.blocks
  FOR ALL USING (auth.uid() = blocker_id) WITH CHECK (auth.uid() = blocker_id);


-- >>>>>>>>>>>>>>>>>>>> 024_continuity_trust.sql <<<<<<<<<<<<<<<<<<<<
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


-- >>>>>>>>>>>>>>>>>>>> 025_mobile_federation.sql <<<<<<<<<<<<<<<<<<<<
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
  client_id TEXT NOT NULL UNIQUE DEFAULT ('mic_' || encode(gen_random_bytes(9), 'hex')),
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


-- >>>>>>>>>>>>>>>>>>>> 026_media_demo_seed.sql <<<<<<<<<<<<<<<<<<<<
-- ============================================================================
-- MiLyfe — Media demo seed (so the Vibe Bar has something to play)
-- Migration 026
--
-- Seeds a "MiLyfe Radio" channel + a few public-domain / freely-embeddable
-- sample items so the media pages and the global Vibe Bar are visible out of
-- the box. Uses a well-known public-domain audio file and YouTube embeds.
-- Owner is set to the first profile if one exists; otherwise left null-safe.
-- Safe to run once; ON CONFLICT guards re-runs.
-- ============================================================================

DO $$
DECLARE
  v_owner UUID;
  v_channel UUID := '22222222-0000-0000-0000-000000000001';
BEGIN
  -- Pick any existing profile as the demo channel owner (optional).
  SELECT id INTO v_owner FROM public.profiles ORDER BY created_at LIMIT 1;

  IF v_owner IS NOT NULL THEN
    INSERT INTO public.media_channels (id, owner_id, slug, name, bio, verified)
    VALUES (v_channel, v_owner, 'milyfe-radio', 'MiLyfe Radio', 'Community vibes, curated by the people.', TRUE)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.media_items (channel_id, uploader_id, kind, title, description, source_type, source_url, duration_seconds, genres, visibility, status)
    VALUES
      (v_channel, v_owner, 'audio', 'Sample Vibe (Demo)', 'A short public-domain audio sample to show the player.', 'mp4', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 372, ARRAY['Demo'], 'public', 'ready'),
      (v_channel, v_owner, 'audio', 'Evening Set (Demo)', 'Another demo track.', 'mp4', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 425, ARRAY['Demo'], 'public', 'ready'),
      (v_channel, v_owner, 'video', 'Welcome to MiLyfe (Demo)', 'A demo video card.', 'youtube', 'aqz-KE-bpKQ', 60, ARRAY['Demo'], 'public', 'ready')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;


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

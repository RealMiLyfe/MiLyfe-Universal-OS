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

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

-- ============================================================================
-- 011: Voter Registration Status
-- Adds civic engagement tracking to profiles.
-- Privacy: voter_status is PRIVATE by default (only visible to the user).
-- ============================================================================

-- Add voter status column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS voter_status TEXT NOT NULL DEFAULT 'unknown'
CHECK (voter_status IN ('registered', 'not_registered', 'unsure', 'prefer_not_to_say', 'unknown'));

-- Add voter metadata (county, party, registration date) in the existing JSONB column
-- Usage: metadata->>'voter_county', metadata->>'voter_party', metadata->>'voter_registered_date'
-- No new column needed — we use the existing metadata JSONB

-- Index for campaign analytics (how many registered voters do we have)
CREATE INDEX IF NOT EXISTS idx_profiles_voter_status ON public.profiles(voter_status)
WHERE voter_status != 'unknown' AND voter_status != 'prefer_not_to_say';

-- RLS: Only the user can see their own voter_status
-- (The existing profiles RLS already limits reads to own profile for private fields,
--  but let's be explicit with a policy for voter data)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'voter_status_own_only'
  ) THEN
    CREATE POLICY voter_status_own_only ON public.profiles
      FOR SELECT
      USING (
        auth.uid() = id
        OR voter_status IS NULL
      );
  END IF;
END
$$;

-- ============================================================================
-- Voter Journey tracking table
-- Records each step a citizen takes toward voter registration
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.voter_journey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  step TEXT NOT NULL CHECK (step IN (
    'prompted',           -- Saw the voter question during onboarding
    'checked_status',     -- Clicked to check their registration
    'started_registration', -- Clicked to register
    'confirmed_registered', -- Updated profile to registered
    'declined'            -- Said prefer not to say
  )),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voter_journey_user ON public.voter_journey(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.voter_journey ENABLE ROW LEVEL SECURITY;

CREATE POLICY voter_journey_own ON public.voter_journey
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- Badge: "Civic Ready" — awarded when voter_status = 'registered'
-- ============================================================================
INSERT INTO public.badges (name, description, icon, category, criteria)
VALUES (
  'Civic Ready',
  'Registered to vote and ready to shape Jacksonville.',
  '🗳️',
  'general',
  '{"voter_status": "registered"}'::jsonb
)
ON CONFLICT (name) DO NOTHING;

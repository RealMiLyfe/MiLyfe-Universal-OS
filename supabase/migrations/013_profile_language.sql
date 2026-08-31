-- ============================================================================
-- 013_profile_language.sql
-- Add per-user language preference (MiLyfe is universal — people choose their
-- own language). Stores an IETF/BCP-47-ish code (e.g. 'en', 'es', 'fr').
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en';

COMMENT ON COLUMN public.profiles.preferred_language IS
  'User-selected UI language (BCP-47 code). Defaults to English. Universal from day one.';

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

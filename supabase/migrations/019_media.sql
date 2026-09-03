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

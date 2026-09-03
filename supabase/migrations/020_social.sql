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
CREATE INDEX idx_stories_active ON public.stories(user_id, expires_at);

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

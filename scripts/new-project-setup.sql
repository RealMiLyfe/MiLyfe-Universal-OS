-- ============================================================================
-- MiLyfe Live Database Unified Migration Script
-- Safe & Idempotent: Run in Supabase SQL Editor
-- Includes:
--  - All 25 Core MVP Tables + Extended Action/Safety/Learn/Street Tables
--  - Row Level Security (RLS) & Indexes
--  - Community Treasury ($10,000,000.00 $MLY Global Baseline)
--  - Atomic Welcome Grant Trigger (handle_new_user)
--  - Atomic UBI Distribution (execute_weekly_ubi)
--  - Atomic Reward Claim (claim_reward_atomic)
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES & USERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  neighborhood TEXT,
  city TEXT DEFAULT 'Jacksonville',
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen','moderator','steward','admin')),
  safety_mode BOOLEAN DEFAULT FALSE,
  health_streak INTEGER DEFAULT 0,
  trust_score INTEGER DEFAULT 50,
  mly_balance NUMERIC(12,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist if table was partially created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Jacksonville';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'citizen';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS safety_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS health_streak INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 50;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mly_balance NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_neighborhood ON public.profiles(neighborhood);

-- ============================================================================
-- 2. WALLETS ($MLY 3-Pot System)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  spending_balance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (spending_balance >= 0),
  savings_balance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (savings_balance >= 0),
  community_balance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (community_balance >= 0),
  total_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_ubi_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user ON public.wallets(user_id);

-- ============================================================================
-- 3. TRANSACTIONS (Public Ledger)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES public.profiles(id),
  to_user_id UUID REFERENCES public.profiles(id),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL,
  pot TEXT NOT NULL DEFAULT 'spending' CHECK (pot IN ('spending','savings','community')),
  description TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expand transactions type check constraint
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check 
  CHECK (type IN (
    'ubi',
    'transfer',
    'reward',
    'spend',
    'burn',
    'community_contribution',
    'treasury_fee',
    'quest_reward',
    'proposal_fund'
  ));

CREATE INDEX IF NOT EXISTS idx_transactions_from ON public.transactions(from_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_to ON public.transactions(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type, created_at DESC);

-- ============================================================================
-- 4. STANDING & ATTESTATIONS (8-Facet Reputation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.standing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  neighbor NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (neighbor BETWEEN 0 AND 100),
  carer NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (carer BETWEEN 0 AND 100),
  maker NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (maker BETWEEN 0 AND 100),
  teacher NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (teacher BETWEEN 0 AND 100),
  keeper NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (keeper BETWEEN 0 AND 100),
  voice NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (voice BETWEEN 0 AND 100),
  shop NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (shop BETWEEN 0 AND 100),
  helper NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (helper BETWEEN 0 AND 100),
  overall NUMERIC(4,2) GENERATED ALWAYS AS (
    (neighbor + carer + maker + teacher + keeper + voice + shop + helper) / 8
  ) STORED,
  last_decay_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES public.profiles(id),
  to_user_id UUID NOT NULL REFERENCES public.profiles(id),
  facet TEXT NOT NULL CHECK (facet IN ('neighbor','carer','maker','teacher','keeper','voice','shop','helper')),
  weight NUMERIC(3,1) NOT NULL DEFAULT 1.0 CHECK (weight BETWEEN 0.1 AND 5.0),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attestations_to ON public.attestations(to_user_id, created_at DESC);

-- ============================================================================
-- 5. REWARDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ubi','quest','attestation','contribution','milestone','welcome')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  claimed BOOLEAN NOT NULL DEFAULT FALSE,
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rewards_user ON public.rewards(user_id, claimed, created_at DESC);

-- ============================================================================
-- 6. COMMUNITY TREASURY
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.community_treasury (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  balance NUMERIC(14,2) NOT NULL DEFAULT 10000000.00,
  total_burned NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_distributed NUMERIC(14,2) NOT NULL DEFAULT 0,
  citizen_count INTEGER NOT NULL DEFAULT 0,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. GOVERNANCE (Proposals & Votes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  creator_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general','treasury','policy','amendment','recall')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','passed','rejected','expired')),
  votes_for INTEGER NOT NULL DEFAULT 0,
  votes_against INTEGER NOT NULL DEFAULT 0,
  quorum_required INTEGER NOT NULL DEFAULT 10,
  opens_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  direction TEXT NOT NULL CHECK (direction IN ('for','against','abstain')),
  weight NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(proposal_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.proposal_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. FORUM
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.forum_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '💬',
  post_count INTEGER NOT NULL DEFAULT 0,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.forum_spaces(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  locked BOOLEAN NOT NULL DEFAULT FALSE,
  upvotes INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  body TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  parent_reply_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. WIKI
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wiki_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  last_editor_id UUID REFERENCES public.profiles(id),
  revision_count INTEGER NOT NULL DEFAULT 1,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wiki_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  editor_id UUID NOT NULL REFERENCES public.profiles(id),
  body TEXT NOT NULL,
  summary TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. HEALTH
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.health_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
  energy INTEGER CHECK (energy BETWEEN 1 AND 5),
  sleep_hours NUMERIC(3,1),
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.health_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('clinic','mental_health','crisis','harm_reduction','wellness','pharmacy')),
  description TEXT DEFAULT '',
  address TEXT,
  phone TEXT,
  url TEXT,
  accepts_mly BOOLEAN DEFAULT FALSE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  hours JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 11. NEWS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  body TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  cover_image TEXT,
  category TEXT NOT NULL DEFAULT 'community' CHECK (category IN ('community','governance','economy','safety','culture','events')),
  published BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.news_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.news_articles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 12. CONNECT & MESSAGING
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  receiver_id UUID NOT NULL REFERENCES public.profiles(id),
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 13. APPS & NOTIFICATIONS & BADGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  icon_url TEXT,
  url TEXT,
  category TEXT NOT NULL DEFAULT 'utility' CHECK (category IN ('utility','social','economy','governance','health','education','safety','media')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published','suspended')),
  install_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info','ubi','social','safety','governance','reward','system')),
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '🏅',
  category TEXT DEFAULT 'general',
  criteria JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================================================
-- 14. LEARN & EDUCATION MODULES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.learn_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '📚',
  difficulty TEXT DEFAULT 'beginner',
  estimated_hours INTEGER DEFAULT 2,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learn_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES public.learn_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT DEFAULT '',
  order_index INTEGER DEFAULT 0,
  reward_mly NUMERIC(8,2) DEFAULT 10.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learn_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  path_id UUID NOT NULL REFERENCES public.learn_paths(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','dropped')),
  progress_percent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, path_id)
);

CREATE TABLE IF NOT EXISTS public.user_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.learn_modules(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- ============================================================================
-- 15. STREET, QUESTS & ART
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.street_art (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_name TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_mly NUMERIC(10,2) NOT NULL DEFAULT 25.00,
  category TEXT DEFAULT 'community',
  difficulty TEXT DEFAULT 'easy',
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','completed','cancelled')),
  escrow_tx_id UUID,
  location_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','submitted','verified','abandoned')),
  evidence_url TEXT,
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(quest_id, user_id)
);

-- ============================================================================
-- 16. SAFETY MODULE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.safety_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT DEFAULT 'trusted_contact',
  notify_on_alert BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.safety_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'safe' CHECK (status IN ('safe','needs_checkin','alert_triggered')),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 17. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_treasury ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_contacts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_public_read' AND tablename = 'profiles') THEN
    CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_self_update' AND tablename = 'profiles') THEN
    CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Wallets
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'wallets_self_select' AND tablename = 'wallets') THEN
    CREATE POLICY "wallets_self_select" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Transactions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'transactions_user_select' AND tablename = 'transactions') THEN
    CREATE POLICY "transactions_user_select" ON public.transactions FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
  END IF;

  -- Standing
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'standing_public_read' AND tablename = 'standing') THEN
    CREATE POLICY "standing_public_read" ON public.standing FOR SELECT USING (true);
  END IF;

  -- Treasury
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'treasury_public_read' AND tablename = 'community_treasury') THEN
    CREATE POLICY "treasury_public_read" ON public.community_treasury FOR SELECT USING (true);
  END IF;

  -- Proposals & Votes
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'proposals_public_read' AND tablename = 'proposals') THEN
    CREATE POLICY "proposals_public_read" ON public.proposals FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'votes_public_read' AND tablename = 'votes') THEN
    CREATE POLICY "votes_public_read" ON public.votes FOR SELECT USING (true);
  END IF;

  -- Forum
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'forum_spaces_read' AND tablename = 'forum_spaces') THEN
    CREATE POLICY "forum_spaces_read" ON public.forum_spaces FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'forum_posts_read' AND tablename = 'forum_posts') THEN
    CREATE POLICY "forum_posts_read" ON public.forum_posts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'forum_replies_read' AND tablename = 'forum_replies') THEN
    CREATE POLICY "forum_replies_read" ON public.forum_replies FOR SELECT USING (true);
  END IF;

  -- Rewards
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rewards_self_read' AND tablename = 'rewards') THEN
    CREATE POLICY "rewards_self_read" ON public.rewards FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Notifications
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notifications_self_read' AND tablename = 'notifications') THEN
    CREATE POLICY "notifications_self_read" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Learn & Quests
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'learn_paths_read' AND tablename = 'learn_paths') THEN
    CREATE POLICY "learn_paths_read" ON public.learn_paths FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'quests_read' AND tablename = 'quests') THEN
    CREATE POLICY "quests_read" ON public.quests FOR SELECT USING (true);
  END IF;
END $$;

-- ============================================================================
-- 18. INITIALIZE / SEED COMMUNITY TREASURY ($10,000,000.00 $MLY)
-- ============================================================================
DO $$
DECLARE
  v_existing_id UUID;
  v_total_distributed NUMERIC(14,2);
BEGIN
  SELECT id, total_distributed INTO v_existing_id, v_total_distributed
  FROM public.community_treasury
  ORDER BY snapshot_at DESC
  LIMIT 1;

  IF v_existing_id IS NULL THEN
    INSERT INTO public.community_treasury (
      balance,
      total_burned,
      total_distributed,
      citizen_count,
      snapshot_at
    ) VALUES (
      10000000.00,
      0,
      0,
      (SELECT COUNT(*) FROM public.profiles WHERE onboarding_complete = true),
      NOW()
    );
  ELSE
    UPDATE public.community_treasury
    SET balance = 10000000.00 - COALESCE(v_total_distributed, 0),
        citizen_count = (SELECT COUNT(*) FROM public.profiles WHERE onboarding_complete = true),
        snapshot_at = NOW()
    WHERE id = v_existing_id;
  END IF;
END $$;

-- ============================================================================
-- 19. ATOMIC WELCOME GRANT ON USER SIGNUP TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_treasury_id UUID;
  v_initial_grant NUMERIC(12,2) := 50.00;
  v_username TEXT;
  v_display_name TEXT;
BEGIN
  v_username := COALESCE(NULLIF(NEW.raw_user_meta_data->>'username', ''), 'citizen_' || substr(NEW.id::text, 1, 8));
  v_display_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name', ''), 'New Citizen');

  -- 1. Upsert Profile
  INSERT INTO public.profiles (id, username, display_name, onboarding_complete)
  VALUES (NEW.id, v_username, v_display_name, false)
  ON CONFLICT (id) DO UPDATE
  SET username = EXCLUDED.username,
      display_name = EXCLUDED.display_name;

  -- 2. Create Wallet with 50 $MLY starting balance
  INSERT INTO public.wallets (
    user_id,
    spending_balance,
    savings_balance,
    community_balance,
    total_earned,
    total_spent
  ) VALUES (
    NEW.id,
    v_initial_grant,
    0,
    0,
    v_initial_grant,
    0
  ) ON CONFLICT (user_id) DO NOTHING;

  -- 3. Initialize Standing
  INSERT INTO public.standing (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- 4. Record Claimed Welcome Reward
  INSERT INTO public.rewards (
    user_id,
    type,
    amount,
    title,
    description,
    claimed,
    claimed_at
  ) VALUES (
    NEW.id,
    'welcome',
    v_initial_grant,
    'Welcome to MiLyfe!',
    'Your 50 $MLY seed grant to participate from day one.',
    true,
    NOW()
  ) ON CONFLICT DO NOTHING;

  -- 5. Insert Transaction into Public Ledger
  INSERT INTO public.transactions (
    from_user_id,
    to_user_id,
    amount,
    type,
    pot,
    description
  ) VALUES (
    NULL,
    NEW.id,
    v_initial_grant,
    'reward',
    'spending',
    'Welcome grant upon registration'
  );

  -- 6. Atomically Debit Community Treasury
  SELECT id INTO v_treasury_id 
  FROM public.community_treasury 
  ORDER BY snapshot_at DESC 
  LIMIT 1;

  IF v_treasury_id IS NOT NULL THEN
    UPDATE public.community_treasury
    SET balance = balance - v_initial_grant,
        total_distributed = total_distributed + v_initial_grant,
        snapshot_at = NOW()
    WHERE id = v_treasury_id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 20. ATOMIC WEEKLY UBI DISTRIBUTION STORED PROCEDURE
-- ============================================================================
CREATE OR REPLACE FUNCTION public.execute_weekly_ubi(p_amount NUMERIC DEFAULT 100.00)
RETURNS JSONB AS $$
DECLARE
  v_treasury RECORD;
  v_distributed_count INTEGER := 0;
  v_total_payout NUMERIC(14,2) := 0;
  v_active_citizens INTEGER := 0;
  v_now TIMESTAMPTZ := NOW();
  v_six_days_ago TIMESTAMPTZ := NOW() - INTERVAL '6 days';
  v_wallet RECORD;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'UBI amount must be positive');
  END IF;

  SELECT id, balance, total_distributed INTO v_treasury
  FROM public.community_treasury
  ORDER BY snapshot_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_treasury.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Community treasury not found');
  END IF;

  SELECT COUNT(*) INTO v_active_citizens
  FROM public.profiles
  WHERE onboarding_complete = true;

  FOR v_wallet IN
    SELECT w.id, w.user_id, w.spending_balance, w.total_earned
    FROM public.wallets w
    JOIN public.profiles p ON p.id = w.user_id
    WHERE p.onboarding_complete = true
      AND (w.last_ubi_at IS NULL OR w.last_ubi_at < v_six_days_ago)
    FOR UPDATE OF w
  LOOP
    UPDATE public.wallets
    SET spending_balance = spending_balance + p_amount,
        total_earned = total_earned + p_amount,
        last_ubi_at = v_now,
        updated_at = v_now
    WHERE id = v_wallet.id;

    INSERT INTO public.transactions (
      from_user_id,
      to_user_id,
      amount,
      type,
      pot,
      description,
      metadata
    ) VALUES (
      NULL,
      v_wallet.user_id,
      p_amount,
      'ubi',
      'spending',
      'Weekly UBI distribution',
      jsonb_build_object('timestamp', v_now)
    );

    INSERT INTO public.rewards (
      user_id,
      type,
      amount,
      title,
      description,
      claimed,
      claimed_at
    ) VALUES (
      v_wallet.user_id,
      'ubi',
      p_amount,
      'Weekly UBI',
      format('Your weekly %s $MLY has arrived.', p_amount),
      true,
      v_now
    );

    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      body,
      link
    ) VALUES (
      v_wallet.user_id,
      'ubi',
      format('Received %s $MLY UBI', p_amount),
      'Your weekly basic income is in your wallet.',
      '/wallet'
    );

    v_distributed_count := v_distributed_count + 1;
    v_total_payout := v_total_payout + p_amount;
  END LOOP;

  IF v_distributed_count > 0 THEN
    UPDATE public.community_treasury
    SET balance = balance - v_total_payout,
        total_distributed = total_distributed + v_total_payout,
        citizen_count = v_active_citizens,
        snapshot_at = v_now
    WHERE id = v_treasury.id;
  ELSE
    UPDATE public.community_treasury
    SET citizen_count = v_active_citizens,
        snapshot_at = v_now
    WHERE id = v_treasury.id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'distributed_count', v_distributed_count,
    'total_amount', v_total_payout,
    'active_citizens', v_active_citizens,
    'new_balance', v_treasury.balance - v_total_payout,
    'timestamp', v_now
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 21. ATOMIC REWARD CLAIM PROCEDURE
-- ============================================================================
CREATE OR REPLACE FUNCTION public.claim_reward_atomic(p_reward_id UUID, p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_reward RECORD;
  v_wallet RECORD;
  v_treasury_id UUID;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  SELECT id, user_id, type, amount, title, claimed, expires_at
  INTO v_reward
  FROM public.rewards
  WHERE id = p_reward_id
  FOR UPDATE;

  IF v_reward.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward not found');
  END IF;

  IF v_reward.user_id != p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized reward claim');
  END IF;

  IF v_reward.claimed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward already claimed');
  END IF;

  IF v_reward.expires_at IS NOT NULL AND v_reward.expires_at < v_now THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward has expired');
  END IF;

  SELECT id, spending_balance, total_earned INTO v_wallet
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_wallet.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;

  UPDATE public.rewards
  SET claimed = true,
      claimed_at = v_now
  WHERE id = v_reward.id;

  UPDATE public.wallets
  SET spending_balance = spending_balance + v_reward.amount,
      total_earned = total_earned + v_reward.amount,
      updated_at = v_now
  WHERE id = v_wallet.id;

  INSERT INTO public.transactions (
    from_user_id,
    to_user_id,
    amount,
    type,
    pot,
    description
  ) VALUES (
    NULL,
    p_user_id,
    v_reward.amount,
    'reward',
    'spending',
    v_reward.title
  );

  SELECT id INTO v_treasury_id 
  FROM public.community_treasury 
  ORDER BY snapshot_at DESC 
  LIMIT 1;

  IF v_treasury_id IS NOT NULL THEN
    UPDATE public.community_treasury
    SET balance = balance - v_reward.amount,
        total_distributed = total_distributed + v_reward.amount,
        snapshot_at = v_now
    WHERE id = v_treasury_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'amount', v_reward.amount,
    'title', v_reward.title,
    'new_balance', v_wallet.spending_balance + v_reward.amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ═══════════════════════════════════════════════════════════════
-- Migration 012 additions (treasury = Jacksonville budget + quest_refund)
-- ═══════════════════════════════════════════════════════════════
-- ============================================================================
-- 012_treasury_budget_and_quest_refund.sql
-- 1. Allow 'quest_refund' transaction type (for removing a quest + refunding escrow)
-- 2. Set the community treasury balance to the City of Jacksonville budget
--    ($5.3 billion) so the platform models the real municipal budget it aims
--    to return to the people.
-- ============================================================================

-- 1. Extend the transactions type constraint to include quest_refund
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check
  CHECK (type IN (
    'ubi',
    'transfer',
    'reward',
    'spend',
    'burn',
    'community_contribution',
    'treasury_fee',
    'quest_reward',
    'quest_refund',
    'proposal_fund'
  ));

-- 2. Set treasury balance to the Jacksonville budget ($5,300,000,000).
--    Preserve real distribution history; only reset the headline balance.
DO $$
DECLARE
  v_id UUID;
  v_jax_budget NUMERIC(14,2) := 5300000000.00; -- $5.3B City of Jacksonville budget
BEGIN
  SELECT id INTO v_id
  FROM public.community_treasury
  ORDER BY snapshot_at DESC
  LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO public.community_treasury (balance, total_burned, total_distributed, citizen_count, snapshot_at)
    VALUES (
      v_jax_budget,
      0,
      0,
      (SELECT COUNT(*) FROM public.profiles WHERE onboarding_complete = true),
      NOW()
    );
  ELSE
    UPDATE public.community_treasury
    SET balance = v_jax_budget,
        citizen_count = (SELECT COUNT(*) FROM public.profiles WHERE onboarding_complete = true),
        snapshot_at = NOW()
    WHERE id = v_id;
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════════════════
-- COMPLETE SCHEMA ADDENDUM
-- Tables, columns, seeds, and policies that complete the platform so a fresh
-- setup matches production. Idempotent (CREATE TABLE IF NOT EXISTS / ADD COLUMN
-- IF NOT EXISTS / DROP POLICY IF EXISTS + CREATE). Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════
-- ═══════════════════════════════════════════════════════════════════════════
-- FIX_ALL_BUGS.sql — one-shot, idempotent fix for every bug found in E2E test.
-- Run this ONCE in the Supabase SQL Editor for project uwozuhmiahytjwfmudia.
-- Fixes: onboarding (voter_status/interests), quests columns, marketplace,
--        surplus, quest_claims, delegations, proposal stages, citizen count.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. PROFILES: onboarding columns (migration 011 + interests + language) ──
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS voter_status TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en';

-- ── 2. QUESTS: existing table is an OLD version — add every missing column ──
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS reward_source TEXT NOT NULL DEFAULT 'creator';
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS time_estimate_minutes INTEGER;
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS location_text TEXT;
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS max_completions INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS current_completions INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS requires_verification BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS verifier_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';

-- ── 3. QUEST_CLAIMS ──
CREATE TABLE IF NOT EXISTS public.quest_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  claimer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed','submitted','verified','rejected')),
  evidence_text TEXT,
  evidence_images TEXT[] DEFAULT '{}',
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (quest_id, claimer_id)
);

-- ── 4. MARKETPLACE_LISTINGS ──
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'goods' CHECK (category IN ('food','services','rides','goods','education','housing','jobs')),
  price_mly NUMERIC(12,2) NOT NULL DEFAULT 0,
  price_type TEXT NOT NULL DEFAULT 'fixed' CHECK (price_type IN ('fixed','negotiable','free','trade')),
  condition TEXT CHECK (condition IN ('new','like_new','good','fair','parts')),
  location_text TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  images TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold','removed')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. SURPLUS_ITEMS ──
CREATE TABLE IF NOT EXISTS public.surplus_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('food','goods','clothing','furniture','other')),
  quantity TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  images TEXT[] NOT NULL DEFAULT '{}',
  available_until TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','claimed','expired')),
  claimed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. GOVERNANCE: proposal stages (migration 008) + delegations ──
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'deliberation'
  CHECK (stage IN ('draft','deliberation','voting','passed','rejected','enacted'));
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS votes_for INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS votes_against INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delegator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delegate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL DEFAULT 'general',
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (delegator_id, delegate_id, topic)
);

-- ── 7. INDEXES ──
CREATE INDEX IF NOT EXISTS idx_quests_status ON public.quests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quests_creator ON public.quests(creator_id);
CREATE INDEX IF NOT EXISTS idx_quest_claims_quest ON public.quest_claims(quest_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON public.marketplace_listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_surplus_status ON public.surplus_items(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_delegations_delegator ON public.delegations(delegator_id);

-- ── 8. ROW-LEVEL SECURITY ──
ALTER TABLE public.quest_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surplus_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegations ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "read marketplace" ON public.marketplace_listings;
CREATE POLICY "read marketplace" ON public.marketplace_listings FOR SELECT USING (true);
DROP POLICY IF EXISTS "read surplus" ON public.surplus_items;
CREATE POLICY "read surplus" ON public.surplus_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "read quest_claims" ON public.quest_claims;
CREATE POLICY "read quest_claims" ON public.quest_claims FOR SELECT USING (true);
DROP POLICY IF EXISTS "read delegations" ON public.delegations;
CREATE POLICY "read delegations" ON public.delegations FOR SELECT USING (true);

-- Owner write
DROP POLICY IF EXISTS "write marketplace" ON public.marketplace_listings;
CREATE POLICY "write marketplace" ON public.marketplace_listings FOR ALL TO authenticated USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());
DROP POLICY IF EXISTS "write surplus" ON public.surplus_items;
CREATE POLICY "write surplus" ON public.surplus_items FOR ALL TO authenticated USING (donor_id = auth.uid()) WITH CHECK (donor_id = auth.uid());
DROP POLICY IF EXISTS "write quest_claims" ON public.quest_claims;
CREATE POLICY "write quest_claims" ON public.quest_claims FOR ALL TO authenticated USING (claimer_id = auth.uid()) WITH CHECK (claimer_id = auth.uid());
DROP POLICY IF EXISTS "write delegations" ON public.delegations;
CREATE POLICY "write delegations" ON public.delegations FOR ALL TO authenticated USING (delegator_id = auth.uid()) WITH CHECK (delegator_id = auth.uid());

-- ── 9. STORAGE POLICIES (buckets 'public' + 'quests' created via API) ──
DROP POLICY IF EXISTS "storage public read" ON storage.objects;
CREATE POLICY "storage public read" ON storage.objects FOR SELECT USING (bucket_id IN ('public','quests'));
DROP POLICY IF EXISTS "storage auth upload" ON storage.objects;
CREATE POLICY "storage auth upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('public','quests'));
DROP POLICY IF EXISTS "storage owner update" ON storage.objects;
CREATE POLICY "storage owner update" ON storage.objects FOR UPDATE TO authenticated USING (owner = auth.uid());
DROP POLICY IF EXISTS "storage owner delete" ON storage.objects;
CREATE POLICY "storage owner delete" ON storage.objects FOR DELETE TO authenticated USING (owner = auth.uid());

-- ── DONE. Every bug from the E2E test is addressed. ──


-- ═══════════════════════════════════════════════════════════════════════════
-- PART 2 — additional gaps found by the FULL platform test
-- ═══════════════════════════════════════════════════════════════════════════

-- ── SAFETY: actions + journal tables (migration 005 never ran) ──
CREATE TABLE IF NOT EXISTS public.safety_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('leave_now','freeze','unfreeze','hide_location','reveal_location')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','resolved','expired')),
  freeze_jars BOOLEAN NOT NULL DEFAULT FALSE,
  hide_location BOOLEAN NOT NULL DEFAULT FALSE,
  remove_devices BOOLEAN NOT NULL DEFAULT FALSE,
  contacts_notified TEXT[] DEFAULT '{}',
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.safety_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  encrypted_content TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'note' CHECK (content_type IN ('note','evidence','plan','log')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.safety_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_journal ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own safety_actions" ON public.safety_actions;
CREATE POLICY "own safety_actions" ON public.safety_actions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "own safety_journal" ON public.safety_journal;
CREATE POLICY "own safety_journal" ON public.safety_journal FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_safety_journal_user ON public.safety_journal(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_safety_actions_user ON public.safety_actions(user_id, created_at DESC);

-- ── FORUM: seed default spaces (empty → forum broken) ──
INSERT INTO public.forum_spaces (name, slug, description, icon)
SELECT * FROM (VALUES
  ('General','general','Open discussion for the community','💬'),
  ('Governance','governance','Proposals, voting, and civic discussion','🏛️'),
  ('Economy','economy','$MLY, contribution, and community commerce','💰'),
  ('Neighborhood','neighborhood','Local, place-based conversation','🏘️'),
  ('Help','help','Questions and mutual support','🤝')
) AS v(name,slug,description,icon)
WHERE NOT EXISTS (SELECT 1 FROM public.forum_spaces);

-- ── VOTER: some code reads voter_registrations; ensure column-based approach works ──
-- (voter_status column added in PART 1; no separate table needed — safe no-op guard)


-- PART 3 — safety_contacts alignment + learn schema reconciliation + seeds

-- ── safety_contacts: add columns the app code uses ──
ALTER TABLE public.safety_contacts ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.safety_contacts ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.safety_contacts ADD COLUMN IF NOT EXISTS contact_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.safety_contacts ADD COLUMN IF NOT EXISTS notify_on_timer_expire BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.safety_contacts ADD COLUMN IF NOT EXISTS notify_on_leave_now BOOLEAN NOT NULL DEFAULT TRUE;
UPDATE public.safety_contacts SET contact_name = name WHERE contact_name IS NULL AND name IS NOT NULL;
UPDATE public.safety_contacts SET contact_phone = phone WHERE contact_phone IS NULL AND phone IS NOT NULL;

-- ── learn_paths: reconcile OLD (001) schema → 003 schema the code expects ──
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS helper_name TEXT NOT NULL DEFAULT 'Guide';
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '#6366f1';
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS target_audience TEXT NOT NULL DEFAULT 'everyone';
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS duration_weeks TEXT NOT NULL DEFAULT 'Self-paced';
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS completion_badge TEXT NOT NULL DEFAULT 'Completion';
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS module_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS enrolled_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.learn_paths ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE public.learn_paths ALTER COLUMN description DROP NOT NULL;

-- ── learn_modules: reconcile → 003 schema ──
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'lesson';
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS content_markdown TEXT NOT NULL DEFAULT '';
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 30;
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS assessment_type TEXT DEFAULT 'completion';
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS offline_available BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.learn_modules ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
-- unique constraint for ON CONFLICT (path_id, slug)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'learn_modules_path_slug_key') THEN
    ALTER TABLE public.learn_modules ADD CONSTRAINT learn_modules_path_slug_key UNIQUE (path_id, slug);
  END IF;
END $$;

-- ── learn_badges: create (code reads it, missing) ──
CREATE TABLE IF NOT EXISTS public.learn_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  path_id UUID NOT NULL REFERENCES public.learn_paths(id),
  badge_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  badge_icon TEXT NOT NULL DEFAULT '🏅',
  evidence_summary TEXT,
  issued_by TEXT NOT NULL DEFAULT 'system',
  portable BOOLEAN NOT NULL DEFAULT TRUE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.learn_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own learn_badges" ON public.learn_badges;
CREATE POLICY "own learn_badges" ON public.learn_badges FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_learn_badges_user ON public.learn_badges(user_id, earned_at DESC);

-- ── SEED paths ──
INSERT INTO public.learn_paths (slug, title, description, helper_name, icon, color, target_audience, duration_weeks, completion_badge, sort_order) VALUES
  ('rights-and-papers', 'Rights and Papers', 'Navigate legal systems, understand your rights, prepare documents, and access legal aid resources.', 'Rue', '⚖️', '#dc2626', 'Anyone needing legal navigation', '4-12 weeks', 'Rights Navigator', 1),
  ('parenting', 'Parenting', 'Build parenting skills, coordinate childcare, find resources, and connect with other parents.', 'Kin', '👨‍👩‍👧', '#ea580c', 'Parents, guardians, caregivers', 'Ongoing', 'Community Parent', 2),
  ('reentry', 'Reentry', 'Build your path from incarceration to community integration. Housing, work, documents, support.', 'Tide', '🌅', '#0891b2', 'Formerly incarcerated, probation', '12 weeks', 'New Chapter', 3),
  ('peace', 'Peace', 'Learn conflict resolution, de-escalation, mediation, and community protection through service.', 'Bridge', '🕊️', '#7c3aed', 'Gang/crew members, conflict-involved', '16 weeks', 'Peacemaker', 4),
  ('food-and-first-aid', 'Food and First Aid', 'Master cooking, food safety, nutrition, basic first aid, and emergency response skills.', 'Terra', '🍎', '#16a34a', 'Everyone (essential skills)', '6 weeks', 'Community First Responder', 5),
  ('repair', 'Repair', 'Fix things instead of replacing them. Electronics, plumbing, carpentry, bikes, and clothes.', 'Spark', '🔧', '#ca8a04', 'Anyone wanting to fix things', '8 weeks', 'Repair Specialist', 6),
  ('money-not-casino', 'Money (Not a Casino)', 'Understand money, budgeting, debt, savings, and community economics without the gambling mindset.', 'Nia', '💰', '#059669', 'Everyone (financial literacy)', '4 weeks', 'Money Navigator', 7),
  ('literacy', 'Read / Write / Numbers / Languages', 'Build reading, writing, math, and language skills at your own pace with patient support.', 'Sage', '📖', '#2563eb', 'Literacy learners, ESL', 'Self-paced', 'Literate', 8),
  ('the-trade', 'The Trade This Place Lacks', 'Learn a skilled trade that your community needs. Apprenticeship-based, real projects.', 'Forge', '🏗️', '#9333ea', 'Workers, career changers', '12-24 weeks', 'Tradesperson', 9),
  ('run-a-street', 'How to Run a Street', 'Learn community organizing, governance, facilitation, and stewardship.', 'Vox', '🏘️', '#e11d48', 'Community leaders, organizers', '8 weeks', 'Street Steward', 10)
ON CONFLICT (slug) DO NOTHING;

-- ── SEED modules for Rights and Papers ──
INSERT INTO public.learn_modules (path_id, slug, title, description, type, duration_minutes, sort_order, assessment_type) VALUES
  ((SELECT id FROM public.learn_paths WHERE slug = 'rights-and-papers'), 'know-your-rights', 'Know Your Rights', 'Understand your fundamental rights in everyday situations: police encounters, housing, employment, healthcare.', 'lesson', 45, 1, 'completion'),
  ((SELECT id FROM public.learn_paths WHERE slug = 'rights-and-papers'), 'documents-checklist', 'Documents Checklist', 'What documents you need, how to get them, and how to keep them safe.', 'exercise', 60, 2, 'completion'),
  ((SELECT id FROM public.learn_paths WHERE slug = 'rights-and-papers'), 'court-preparation', 'Court Preparation', 'What to expect, how to dress, what to say, and your rights in court.', 'lesson', 30, 3, 'completion'),
  ((SELECT id FROM public.learn_paths WHERE slug = 'rights-and-papers'), 'legal-aid-resources', 'Finding Legal Aid', 'How to find free legal help, what legal aid covers, and when you need a paid lawyer.', 'exercise', 45, 4, 'completion'),
  ((SELECT id FROM public.learn_paths WHERE slug = 'rights-and-papers'), 'housing-rights', 'Housing Rights', 'Tenant rights, eviction process, fair housing, Section 8, and illegal lockouts.', 'lesson', 60, 5, 'quiz'),
  ((SELECT id FROM public.learn_paths WHERE slug = 'rights-and-papers'), 'employment-rights', 'Employment Rights', 'Worker rights, wage theft, discrimination, OSHA, unemployment.', 'lesson', 45, 6, 'completion'),
  ((SELECT id FROM public.learn_paths WHERE slug = 'rights-and-papers'), 'benefits-navigation', 'Benefits Navigation', 'SNAP, Medicaid, SSI/SSDI, TANF, WIC. Eligibility, applications, appeals.', 'exercise', 60, 7, 'portfolio'),
  ((SELECT id FROM public.learn_paths WHERE slug = 'rights-and-papers'), 'community-project', 'Rights Navigator Project', 'Help one person navigate a legal or documents challenge. Document the process.', 'project', 120, 8, 'project')
ON CONFLICT (path_id, slug) DO NOTHING;

-- ── update module_count ──
UPDATE public.learn_paths p SET module_count = (SELECT count(*) FROM public.learn_modules m WHERE m.path_id = p.id);


-- ═══════════════════════════════════════════════════════════════════════════
-- ATOMIC WALLET TRANSFER RPC (transfer_mly)
-- Called by src/app/api/wallet/transfer/route.ts. Without it, transfers fall
-- back to a non-atomic manual path. This makes transfers race-safe.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.transfer_mly(
  p_sender_id UUID, p_recipient_id UUID, p_amount NUMERIC, p_pot TEXT, p_reason TEXT DEFAULT ''
) RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_sender_balance NUMERIC; v_new_sender_balance NUMERIC;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  IF p_sender_id = p_recipient_id THEN RAISE EXCEPTION 'Cannot send to yourself'; END IF;
  IF p_pot NOT IN ('spending','savings','community') THEN RAISE EXCEPTION 'Invalid pot'; END IF;
  EXECUTE format('SELECT %I FROM public.wallets WHERE user_id = $1 FOR UPDATE', p_pot || '_balance')
    INTO v_sender_balance USING p_sender_id;
  IF v_sender_balance IS NULL THEN RAISE EXCEPTION 'Sender wallet not found'; END IF;
  IF v_sender_balance < p_amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
  PERFORM 1 FROM public.wallets WHERE user_id = p_recipient_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Recipient wallet not found'; END IF;
  EXECUTE format('UPDATE public.wallets SET %I = %I - $1, total_spent = total_spent + $1, updated_at = NOW() WHERE user_id = $2', p_pot || '_balance', p_pot || '_balance') USING p_amount, p_sender_id;
  UPDATE public.wallets SET spending_balance = spending_balance + p_amount, total_earned = total_earned + p_amount, updated_at = NOW() WHERE user_id = p_recipient_id;
  INSERT INTO public.transactions (from_user_id, to_user_id, amount, type, pot, description)
  VALUES (p_sender_id, p_recipient_id, p_amount, 'transfer', p_pot, COALESCE(NULLIF(p_reason, ''), 'Transfer'));
  EXECUTE format('SELECT %I FROM public.wallets WHERE user_id = $1', p_pot || '_balance') INTO v_new_sender_balance USING p_sender_id;
  RETURN v_new_sender_balance;
END; $$;
REVOKE ALL ON FUNCTION public.transfer_mly(UUID,UUID,NUMERIC,TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transfer_mly(UUID,UUID,NUMERIC,TEXT,TEXT) TO service_role;

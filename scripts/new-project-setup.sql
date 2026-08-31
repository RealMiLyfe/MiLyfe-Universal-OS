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

-- ============================================================================
-- Migration 010: Treasury, Rewards & UBI Synergy
-- Global-Scale Seed (10,000,000 $MLY), Atomic Procedures, and Transaction Constraints
-- ============================================================================

-- 1. EXPAND TRANSACTIONS TYPE CONSTRAINT
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

-- 2. INITIALIZE / NORMALIZE COMMUNITY TREASURY (10,000,000.00 $MLY SEED)
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
    -- Keep real historical distributions if any, but seed baseline to 10M
    UPDATE public.community_treasury
    SET balance = 10000000.00 - COALESCE(v_total_distributed, 0),
        citizen_count = (SELECT COUNT(*) FROM public.profiles WHERE onboarding_complete = true),
        snapshot_at = NOW()
    WHERE id = v_existing_id;
  END IF;
END $$;

-- 3. ATOMIC WELCOME GRANT ON USER REGISTRATION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_treasury_id UUID;
  v_initial_grant NUMERIC(12,2) := 50.00;
  v_username TEXT;
  v_display_name TEXT;
BEGIN
  -- Generate fallback username and display name safely
  v_username := COALESCE(NULLIF(NEW.raw_user_meta_data->>'username', ''), 'citizen_' || substr(NEW.id::text, 1, 8));
  v_display_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name', ''), 'New Citizen');

  -- 1. Insert Profile (uncompleted onboarding initially)
  INSERT INTO public.profiles (id, username, display_name, onboarding_complete)
  VALUES (NEW.id, v_username, v_display_name, false)
  ON CONFLICT (id) DO UPDATE
  SET username = EXCLUDED.username,
      display_name = EXCLUDED.display_name;

  -- 2. Insert Wallet with 50 $MLY starting balance
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

  -- 3. Insert Standing Facets
  INSERT INTO public.standing (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- 4. Insert Welcome Reward record (marked claimed)
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

  -- 5. Insert Transaction entry into public ledger
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

  -- 6. Debit Treasury atomically
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
    -- Fallback safety so signup never fails on unexpected constraint
    RAISE WARNING 'handle_new_user trigger encountered error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ATOMIC WEEKLY UBI DISTRIBUTION STORED PROCEDURE
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

  -- Lock treasury row
  SELECT id, balance, total_distributed INTO v_treasury
  FROM public.community_treasury
  ORDER BY snapshot_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_treasury.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Community treasury not found');
  END IF;

  -- Count verified active citizens
  SELECT COUNT(*) INTO v_active_citizens
  FROM public.profiles
  WHERE onboarding_complete = true;

  -- Process eligible wallets
  FOR v_wallet IN
    SELECT w.id, w.user_id, w.spending_balance, w.total_earned
    FROM public.wallets w
    JOIN public.profiles p ON p.id = w.user_id
    WHERE p.onboarding_complete = true
      AND (w.last_ubi_at IS NULL OR w.last_ubi_at < v_six_days_ago)
    FOR UPDATE OF w
  LOOP
    -- 1. Credit wallet
    UPDATE public.wallets
    SET spending_balance = spending_balance + p_amount,
        total_earned = total_earned + p_amount,
        last_ubi_at = v_now,
        updated_at = v_now
    WHERE id = v_wallet.id;

    -- 2. Insert transaction record
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

    -- 3. Insert reward record
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

    -- 4. Notification
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

  -- 5. Debit Treasury atomically
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

-- 5. ATOMIC REWARD CLAIM PROCEDURE
CREATE OR REPLACE FUNCTION public.claim_reward_atomic(p_reward_id UUID, p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_reward RECORD;
  v_wallet RECORD;
  v_treasury_id UUID;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Lock reward row
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

  -- Lock wallet
  SELECT id, spending_balance, total_earned INTO v_wallet
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_wallet.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;

  -- 1. Mark claimed
  UPDATE public.rewards
  SET claimed = true,
      claimed_at = v_now
  WHERE id = v_reward.id;

  -- 2. Credit wallet
  UPDATE public.wallets
  SET spending_balance = spending_balance + v_reward.amount,
      total_earned = total_earned + v_reward.amount,
      updated_at = v_now
  WHERE id = v_wallet.id;

  -- 3. Insert transaction
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

  -- 4. Debit Treasury
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

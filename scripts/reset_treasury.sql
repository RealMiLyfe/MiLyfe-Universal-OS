-- Reset community_treasury to genesis, reconciled to REAL transactions only.
-- Genesis balance = City of Jacksonville budget = $5,300,000,000 (per migration 012).
-- Real distributions to date: mi@milyfe.fun welcome grant = 50 $MLY.
-- All test-user grants were deleted, so we recompute from the real ledger.
DO $$
DECLARE
  v_id UUID;
  v_genesis NUMERIC(14,2) := 5300000000.00;
  v_distributed NUMERIC(14,2);
  v_citizens INTEGER;
BEGIN
  -- Real distributed = sum of all reward/grant transactions currently in the ledger
  SELECT COALESCE(SUM(amount), 0) INTO v_distributed
  FROM public.transactions
  WHERE type IN ('reward','ubi','quest_reward','proposal_fund','community_contribution')
    AND to_user_id IS NOT NULL;

  SELECT COUNT(*) INTO v_citizens
  FROM public.profiles WHERE onboarding_complete = true;

  SELECT id INTO v_id FROM public.community_treasury ORDER BY snapshot_at DESC LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO public.community_treasury (balance, total_burned, total_distributed, citizen_count, snapshot_at)
    VALUES (v_genesis - v_distributed, 0, v_distributed, v_citizens, NOW());
  ELSE
    UPDATE public.community_treasury
    SET balance = v_genesis - v_distributed,
        total_burned = 0,
        total_distributed = v_distributed,
        citizen_count = v_citizens,
        snapshot_at = NOW()
    WHERE id = v_id;
  END IF;

  -- Collapse to a single genesis snapshot row (remove stale test snapshots)
  DELETE FROM public.community_treasury WHERE id <> v_id;
END $$;

SELECT balance, total_distributed, total_burned, citizen_count FROM public.community_treasury;

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

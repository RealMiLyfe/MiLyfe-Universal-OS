-- Atomic peer-to-peer $MLY transfer RPC.
-- Matches the call in src/app/api/wallet/transfer/route.ts:
--   rpc('transfer_mly', { p_sender_id, p_recipient_id, p_amount, p_pot, p_reason })
-- Row-locks both wallets (FOR UPDATE) to prevent race conditions, validates
-- balance, moves funds, records a 'transfer' transaction. Returns sender's new
-- balance in the debited pot. SECURITY DEFINER so it runs with table privileges;
-- the API already authenticates the caller and passes the authed user as sender.
CREATE OR REPLACE FUNCTION public.transfer_mly(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_amount NUMERIC,
  p_pot TEXT,
  p_reason TEXT DEFAULT ''
) RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_balance NUMERIC;
  v_new_sender_balance NUMERIC;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  IF p_sender_id = p_recipient_id THEN
    RAISE EXCEPTION 'Cannot send to yourself';
  END IF;
  IF p_pot NOT IN ('spending','savings','community') THEN
    RAISE EXCEPTION 'Invalid pot';
  END IF;

  -- Lock sender wallet, read the chosen pot balance
  EXECUTE format('SELECT %I FROM public.wallets WHERE user_id = $1 FOR UPDATE', p_pot || '_balance')
    INTO v_sender_balance USING p_sender_id;
  IF v_sender_balance IS NULL THEN
    RAISE EXCEPTION 'Sender wallet not found';
  END IF;
  IF v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Lock recipient wallet (ensure it exists)
  PERFORM 1 FROM public.wallets WHERE user_id = p_recipient_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recipient wallet not found';
  END IF;

  -- Debit sender from the chosen pot
  EXECUTE format(
    'UPDATE public.wallets SET %I = %I - $1, total_spent = total_spent + $1, updated_at = NOW() WHERE user_id = $2',
    p_pot || '_balance', p_pot || '_balance'
  ) USING p_amount, p_sender_id;

  -- Credit recipient into spending pot
  UPDATE public.wallets
  SET spending_balance = spending_balance + p_amount,
      total_earned = total_earned + p_amount,
      updated_at = NOW()
  WHERE user_id = p_recipient_id;

  -- Ledger entry
  INSERT INTO public.transactions (from_user_id, to_user_id, amount, type, pot, description)
  VALUES (p_sender_id, p_recipient_id, p_amount, 'transfer', p_pot, COALESCE(NULLIF(p_reason, ''), 'Transfer'));

  -- New sender balance in the debited pot
  EXECUTE format('SELECT %I FROM public.wallets WHERE user_id = $1', p_pot || '_balance')
    INTO v_new_sender_balance USING p_sender_id;

  RETURN v_new_sender_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_mly(UUID,UUID,NUMERIC,TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transfer_mly(UUID,UUID,NUMERIC,TEXT,TEXT) TO service_role;

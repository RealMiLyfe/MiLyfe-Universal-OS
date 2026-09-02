'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// ─── Claim Reward ────────────────────────────────────────────────────────────
const claimRewardSchema = z.object({
  rewardId: z.string().uuid(),
});

export async function claimReward(formData: { rewardId: string }) {
  const parsed = claimRewardSchema.safeParse(formData);
  if (!parsed.success) return { error: 'Invalid reward ID' };

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Try atomic stored procedure first
  try {
    const { data: rpcResult, error: rpcError } = await supabase.rpc('claim_reward_atomic', {
      p_reward_id: parsed.data.rewardId,
      p_user_id: user.id,
    });

    if (!rpcError && rpcResult && (rpcResult as any).success) {
      revalidatePath('/wallet');
      revalidatePath('/rewards');
      revalidatePath('/treasury');
      revalidatePath('/home');
      return { success: true, amount: (rpcResult as any).amount };
    }
  } catch {
    // Proceed to fallback if RPC is not yet applied
  }

  // Fallback: Transactional claim
  const { data: reward, error: fetchErr } = await supabase
    .from('rewards')
    .select('*')
    .eq('id', parsed.data.rewardId)
    .eq('user_id', user.id)
    .eq('claimed', false)
    .single();

  if (fetchErr || !reward) return { error: 'Reward not found or already claimed' };

  if (reward.expires_at && new Date(reward.expires_at) < new Date()) {
    return { error: 'Reward has expired' };
  }

  const { error: claimErr } = await supabase
    .from('rewards')
    .update({ claimed: true, claimed_at: new Date().toISOString() })
    .eq('id', reward.id);

  if (claimErr) return { error: 'Failed to claim reward' };

  const { data: wallet } = await supabase
    .from('wallets')
    .select('spending_balance, total_earned')
    .eq('user_id', user.id)
    .single();

  if (wallet) {
    await supabase
      .from('wallets')
      .update({
        spending_balance: wallet.spending_balance + reward.amount,
        total_earned: (wallet.total_earned || 0) + reward.amount,
      })
      .eq('user_id', user.id);
  }

  await supabase.from('transactions').insert({
    from_user_id: null,
    to_user_id: user.id,
    amount: reward.amount,
    type: 'reward',
    pot: 'spending',
    description: reward.title,
  });

  // Debit treasury
  const { data: treasuryData } = await supabase
    .from('community_treasury')
    .select('id, balance, total_distributed')
    .order('snapshot_at', { ascending: false })
    .limit(1)
    .single();

  if (treasuryData?.id) {
    await supabase
      .from('community_treasury')
      .update({
        balance: (treasuryData.balance || 0) - reward.amount,
        total_distributed: (treasuryData.total_distributed || 0) + reward.amount,
        snapshot_at: new Date().toISOString(),
      })
      .eq('id', treasuryData.id);
  }

  revalidatePath('/wallet');
  revalidatePath('/rewards');
  revalidatePath('/treasury');
  revalidatePath('/home');

  return { success: true, amount: reward.amount };
}

// ─── Transfer $MLY ───────────────────────────────────────────────────────────
const transferSchema = z.object({
  toUsername: z.string().min(3).max(24),
  amount: z.number().positive().max(10000),
  pot: z.enum(['spending', 'savings', 'community']).default('spending'),
});

export async function transferMLY(formData: {
  toUsername: string;
  amount: number;
  pot?: 'spending' | 'savings' | 'community';
}) {
  const parsed = transferSchema.safeParse(formData);
  if (!parsed.success) return { error: 'Invalid transfer data' };

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { toUsername, amount, pot } = parsed.data;

  const { data: recipient } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', toUsername)
    .single();

  if (!recipient) return { error: 'Recipient not found' };
  if (recipient.id === user.id) return { error: 'Cannot transfer to yourself' };

  const { data: result, error: rpcError } = await supabase.rpc('atomic_transfer', {
    p_from_user_id: user.id,
    p_to_user_id: recipient.id,
    p_amount: amount,
    p_from_pot: pot || 'spending',
    p_description: `Transfer to @${toUsername}`,
  });

  if (rpcError) return { error: rpcError.message };

  const rpcResult = result as any;
  if (!rpcResult?.success) return { error: rpcResult?.error || 'Transfer failed' };

  revalidatePath('/wallet');
  return { success: true, amount, to: toUsername };
}

// ─── Move Between Pots ───────────────────────────────────────────────────────
const movePotSchema = z.object({
  from: z.enum(['spending', 'savings', 'community']),
  to: z.enum(['spending', 'savings', 'community']),
  amount: z.number().positive(),
});

export async function moveBetweenPots(formData: {
  from: 'spending' | 'savings' | 'community';
  to: 'spending' | 'savings' | 'community';
  amount: number;
}) {
  const parsed = movePotSchema.safeParse(formData);
  if (!parsed.success) return { error: 'Invalid data' };

  const { from, to, amount } = parsed.data;
  if (from === to) return { error: 'Source and destination must differ' };

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!wallet) return { error: 'Wallet not found' };

  const fromField = `${from}_balance` as keyof typeof wallet;
  const toField = `${to}_balance` as keyof typeof wallet;

  if ((wallet as any)[fromField] < amount) {
    return { error: `Insufficient ${from} balance` };
  }

  await supabase
    .from('wallets')
    .update({
      [fromField]: (wallet as any)[fromField] - amount,
      [toField]: (wallet as any)[toField] + amount,
    })
    .eq('user_id', user.id);

  revalidatePath('/wallet');
  return { success: true };
}

// ─── Distribute UBI (Manual / Server Action Trigger) ─────────────────────────
export async function distributeUBI(secret: string) {
  if (secret !== process.env.CRON_SECRET && secret !== process.env.UBI_CRON_SECRET) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createServerSupabase();

  try {
    const { data: result, error } = await supabase.rpc('execute_weekly_ubi', {
      p_amount: 100,
    });

    if (!error && result) {
      return { success: true, ...(result as any) };
    }
  } catch {}

  return { error: 'Failed to execute UBI distribution RPC' };
}

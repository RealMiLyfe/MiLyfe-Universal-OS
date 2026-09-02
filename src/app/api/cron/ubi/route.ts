import { createServiceSupabase } from '@/lib/supabase/server';
import { isAuthorizedCronRequest } from '@/lib/security/cron';
import { logAudit } from '@/lib/security/audit';
import { NextResponse } from 'next/server';

/**
 * UBI Distribution Cron
 *
 * Runs weekly (Mondays 06:00 UTC).
 * Distributes 100 $MLY to every verified member's spending pot.
 *
 * Protected by CRON_SECRET (Bearer token or x-cron-secret header).
 */

const WEEKLY_UBI_AMOUNT = 100;

export async function GET(request: Request) {
  // Verify cron authorization
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceSupabase();

  // Primary: Execute atomic PostgreSQL RPC procedure
  try {
    const { data: rpcResult, error: rpcError } = await supabase.rpc('execute_weekly_ubi', {
      p_amount: WEEKLY_UBI_AMOUNT,
    });

    if (!rpcError && rpcResult && (rpcResult as any).success) {
      await logAudit(null, 'ubi.distribute', 'community_treasury', null, {
        method: 'rpc_atomic',
        amount_per_member: WEEKLY_UBI_AMOUNT,
        ...(rpcResult as any),
      });
      return NextResponse.json({
        success: true,
        method: 'rpc_atomic',
        ...(rpcResult as any),
      });
    }
  } catch {
    // Fall back to direct batch handler if RPC is pending migration
  }

  // Fallback: Direct batch distribution
  const now = new Date().toISOString();
  const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();

  // Get active citizens with verified onboarding
  const { data: eligibleWallets, error: fetchError } = await supabase
    .from('wallets')
    .select('id, user_id, spending_balance, total_earned, last_ubi_at, profiles!inner(onboarding_complete)')
    .eq('profiles.onboarding_complete', true)
    .or(`last_ubi_at.is.null,last_ubi_at.lt.${sixDaysAgo}`);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!eligibleWallets || eligibleWallets.length === 0) {
    return NextResponse.json({ distributed: 0, message: 'No eligible verified members' });
  }

  let distributed = 0;
  let errors = 0;

  for (let i = 0; i < eligibleWallets.length; i += 50) {
    const batch = eligibleWallets.slice(i, i + 50);

    for (const wallet of batch) {
      try {
        const { error: updateError } = await supabase
          .from('wallets')
          .update({
            spending_balance: wallet.spending_balance + WEEKLY_UBI_AMOUNT,
            total_earned: (wallet.total_earned || 0) + WEEKLY_UBI_AMOUNT,
            last_ubi_at: now,
            updated_at: now,
          })
          .eq('id', wallet.id);

        if (updateError) {
          errors++;
          continue;
        }

        await supabase.from('transactions').insert({
          from_user_id: null,
          to_user_id: wallet.user_id,
          amount: WEEKLY_UBI_AMOUNT,
          type: 'ubi',
          pot: 'spending',
          description: 'Weekly UBI distribution',
          metadata: { week: getISOWeek(new Date()) },
        });

        await supabase.from('rewards').insert({
          user_id: wallet.user_id,
          type: 'ubi',
          amount: WEEKLY_UBI_AMOUNT,
          title: 'Weekly UBI',
          description: `Your weekly ${WEEKLY_UBI_AMOUNT} $MLY has arrived.`,
          claimed: true,
          claimed_at: now,
        });

        await supabase.from('notifications').insert({
          user_id: wallet.user_id,
          type: 'ubi',
          title: `Received ${WEEKLY_UBI_AMOUNT} $MLY UBI`,
          body: 'Your weekly universal basic income is in your wallet.',
          link: '/wallet',
        });

        distributed++;
      } catch {
        errors++;
      }
    }
  }

  // Update existing treasury row atomically
  const { data: treasuryData } = await supabase
    .from('community_treasury')
    .select('id, balance, total_distributed')
    .order('snapshot_at', { ascending: false })
    .limit(1)
    .single();

  if (treasuryData?.id) {
    const totalPayout = distributed * WEEKLY_UBI_AMOUNT;
    const { count: actualCitizenCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('onboarding_complete', true);

    await supabase
      .from('community_treasury')
      .update({
        balance: (treasuryData.balance || 0) - totalPayout,
        total_distributed: (treasuryData.total_distributed || 0) + totalPayout,
        citizen_count: actualCitizenCount || 0,
        snapshot_at: now,
      })
      .eq('id', treasuryData.id);
  }

  await logAudit(null, 'ubi.distribute', 'community_treasury', null, {
    method: 'batch_fallback',
    distributed,
    errors,
    total_eligible: eligibleWallets.length,
    amount_per_member: WEEKLY_UBI_AMOUNT,
  });

  return NextResponse.json({
    success: true,
    method: 'batch_fallback',
    distributed,
    errors,
    total_eligible: eligibleWallets.length,
    amount_per_member: WEEKLY_UBI_AMOUNT,
    timestamp: now,
  });
}

function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { TreasuryView } from './treasury-view';

export const metadata: Metadata = { title: 'Treasury' };

export default async function TreasuryPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Parallel fetch: Treasury snapshot, real citizen count, recent transactions, 30-day stats
  const [treasuryRes, citizenCountRes, transactionsRes, weeklyStatsRes] = await Promise.all([
    supabase
      .from('community_treasury')
      .select('*')
      .order('snapshot_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('onboarding_complete', true),
    supabase
      .from('transactions')
      .select('id, from_user_id, to_user_id, amount, type, description, created_at')
      .or('type.eq.ubi,type.eq.treasury_fee,type.eq.quest_reward,type.eq.proposal_fund,type.eq.reward,type.eq.community_contribution')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('transactions')
      .select('amount, type, created_at')
      .eq('type', 'ubi')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false }),
  ]);

  const treasury = treasuryRes.data ? {
    ...treasuryRes.data,
    citizen_count: citizenCountRes.count ?? treasuryRes.data.citizen_count ?? 0,
  } : {
    balance: 10000000,
    total_distributed: 0,
    total_burned: 0,
    citizen_count: citizenCountRes.count ?? 0,
    snapshot_at: new Date().toISOString(),
  };

  return (
    <TreasuryView
      treasury={treasury}
      transactions={transactionsRes.data || []}
      weeklyStats={weeklyStatsRes.data || []}
    />
  );
}

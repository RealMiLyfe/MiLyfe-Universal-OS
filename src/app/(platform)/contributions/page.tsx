import type { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ContributionsView } from './contributions-view';

export const metadata: Metadata = { title: 'Your Impact · MiLyfe' };

export default async function ContributionsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/contributions');

  const [standingRes, streakRes] = await Promise.all([
    supabase.from('standing').select('*').eq('user_id', user.id).single(),
    // contribution_streaks / contributions are loose (not in Database type); fetch via any-cast client
    (supabase as unknown as { from: (t: string) => any })
      .from('contribution_streaks').select('*').eq('user_id', user.id).maybeSingle(),
  ]);

  return (
    <ContributionsView
      standing={standingRes.data}
      streak={streakRes.data ?? null}
    />
  );
}

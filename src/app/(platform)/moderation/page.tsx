import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, Lock } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Moderation · MiLyfe' };

/**
 * Cross-surface moderation queue. Steward/admin only. Child-safety and
 * immediate-threat reports bubble to the top. Independent appeal via MiJustice/MiAppeal.
 */
export default async function ModerationPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  let role: string | null = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    role = (data as { role?: string } | null)?.role ?? null;
  }
  const isMod = role === 'moderator' || role === 'steward' || role === 'admin';

  if (!isMod) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link href="/home" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-center">
          <Lock className="mx-auto mb-3 h-8 w-8 text-harbor-400" />
          <h1 className="text-lg font-bold text-harbor-800">Moderators only</h1>
          <p className="mt-1 text-sm text-gray-500">This queue is for community moderators and stewards.</p>
        </div>
      </div>
    );
  }

  const { data: reports } = await (supabase as unknown as { from: (t: string) => any })
    .from('moderation_reports').select('*')
    .in('status', ['open', 'reviewing', 'escalated'])
    .order('priority', { ascending: false }).order('created_at', { ascending: false }).limit(50);

  const PRIORITY_STYLE: Record<string, string> = {
    child_safety: 'bg-red-100 text-red-700',
    immediate_threat: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    normal: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/home" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><ShieldAlert className="h-6 w-6 text-teal-600" /> Moderation Queue</h1>
      <p className="text-gray-500">Child-safety and immediate-threat reports bubble to the top. Actions are proportional; every subject can appeal.</p>

      {!reports || reports.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
          No open reports. The community is calm.
        </div>
      ) : (
        <div className="space-y-2">
          {(reports as { id: string; target_type: string; reason: string; detail: string | null; priority: string; status: string; created_at: string }[]).map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLE[r.priority] ?? PRIORITY_STYLE.normal}`}>
                  {r.priority.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-400 capitalize">{r.target_type} · {r.reason}</span>
              </div>
              {r.detail && <p className="text-sm text-gray-700">{r.detail}</p>}
              <p className="mt-1 text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

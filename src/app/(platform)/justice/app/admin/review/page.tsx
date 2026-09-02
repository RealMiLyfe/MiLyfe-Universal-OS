import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Gavel, ShieldCheck, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { createServerSupabase } from '@/lib/supabase/server';
import { AGENTS } from '@/lib/justice/agents';

export const metadata: Metadata = { title: 'Advisory Review — MiJustice' };

/**
 * Advisory-board review console. Board-only.
 * A user qualifies if their profile role is 'steward' or 'admin' (the platform's
 * elevated roles). Actual attorney bar-verification is recorded per review.
 */
export default async function AdminReviewPage() {
  const supabase = await createServerSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;

  let role: string | null = null;
  if (uid) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', uid).single();
    role = (profile as { role?: string } | null)?.role ?? null;
  }
  const isBoard = role === 'steward' || role === 'admin';

  if (!isBoard) {
    return (
      <div className="space-y-6">
        <Link href="/justice/app/home" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> MiJustice
        </Link>
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <Lock className="mx-auto mb-3 h-8 w-8 text-harbor-400" />
          <h1 className="text-lg font-bold text-harbor-800">Advisory Board Only</h1>
          <p className="mt-1 text-sm text-gray-500">
            This console is for the legal advisory board. If you&rsquo;re a licensed
            attorney who wants to help review MiJustice templates, reach out through
            the Coalition page.
          </p>
          <Link href="/justice/app/coalition" className="mt-3 inline-block text-sm font-medium text-teal-600 hover:underline">
            Join the coalition &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/justice/app/home" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> MiJustice
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <Gavel className="h-6 w-6 text-harbor-800" />
          <h1 className="page-title">Advisory Review Console</h1>
          <Badge variant="mly">Board</Badge>
        </div>
        <p className="page-subtitle">Agents draft and check. You hold the sign-off.</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-teal-600" />
          <h2 className="font-bold text-harbor-800">The review gates</h2>
        </div>
        <p className="text-sm text-gray-600">
          No filing template is enabled for users until a licensed attorney signs
          off here. Flagged AI output (low confidence, UPL language, crisis
          signals) is routed to this queue.
        </p>
      </div>

      <section>
        <h2 className="section-header border-b-2 border-mly-500 pb-1">The AI agents you supervise</h2>
        <div className="mt-4 space-y-2">
          {AGENTS.map((a) => (
            <div key={a.role} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="font-bold text-harbor-800">{a.name}</p>
              <p className="text-sm text-gray-600">{a.focus}</p>
              <p className="mt-1 text-xs text-teal-700">Human gate: {a.humanGate}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-gray-100 bg-surface-light p-4 text-sm text-gray-600">
        <p className="font-medium text-harbor-800">Review queue</p>
        <p className="mt-1">
          The pending-template and flagged-output queues populate as templates are
          submitted and cases are analyzed. Approvals are recorded with your bar
          number in the audit log.
        </p>
      </div>
    </div>
  );
}

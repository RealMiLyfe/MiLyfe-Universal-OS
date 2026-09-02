'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, FileText, ShieldAlert, Clock, Share2, Lock, CheckCircle2, ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';
import { justiceBrowserDb } from '@/lib/justice/db';
import type { JusticeCase, JusticeViolation } from '@/lib/justice/types';

type Tab = 'overview' | 'violations' | 'filings' | 'deadlines' | 'share';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'violations', label: 'Issues' },
  { key: 'filings', label: 'Filings' },
  { key: 'deadlines', label: 'Deadlines' },
  { key: 'share', label: 'Share' },
];

export default function CaseWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [caseRow, setCaseRow] = useState<JusticeCase | null>(null);
  const [violations, setViolations] = useState<JusticeViolation[]>([]);

  useEffect(() => {
    (async () => {
      const db = justiceBrowserDb();
      const { data: c } = await db.from('justice_cases').select('*').eq('id', id).single();
      const { data: v } = await db.from('justice_violations').select('*').eq('case_id', id).order('created_at', { ascending: true });
      setCaseRow(c ?? null);
      setViolations(v ?? []);
      setLoading(false);
    })();
  }, [id]);

  return (
    <div className="space-y-6">
      <Link href="/justice/app/home" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> MiJustice
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="page-title">{caseRow?.title || 'Case'}</h1>
          {caseRow && <Badge variant="harbor">{caseRow.status}</Badge>}
        </div>
        <p className="page-subtitle">Your private case workspace</p>
      </div>

      <LegalDisclaimer />

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1 scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              'flex-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ' +
              (tab === t.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
      ) : !caseRow ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-gray-500">
          Case not found, or you don&rsquo;t have access.
        </div>
      ) : (
        <>
          {tab === 'overview' && (
            <div className="space-y-3">
              <Row icon={ShieldAlert} label="Possible issues" value={`${violations.length}`} />
              <Row icon={FileText} label="Filings" value="0 (none yet)" />
              <Row icon={Clock} label="Status" value={caseRow.status} />
              <p className="text-xs text-gray-400">
                Created {new Date(caseRow.created_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {tab === 'violations' && (
            <div className="space-y-3">
              {violations.length === 0 ? (
                <Empty text="No issues recorded on this case." />
              ) : violations.map((v) => (
                <div key={v.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Badge variant="harbor">{v.amendment}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{v.confidence.replace('_', ' ')}</Badge>
                  </div>
                  <p className="font-bold text-harbor-800">{v.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{v.explanation}</p>
                  {v.citations?.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
                      {v.citations.map((c, j) => (
                        <a key={j} href={c.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-teal-600 hover:underline">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> {c.cite}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'filings' && (
            <div className="rounded-xl border border-gray-100 bg-surface-light p-5 text-sm text-gray-600">
              <FileText className="mb-2 h-6 w-6 text-harbor-400" />
              <p className="font-medium text-harbor-800">No filings yet.</p>
              <p className="mt-1">
                Document generation unlocks after a licensed attorney reviews each
                filing type for your jurisdiction. This protects you from filing
                something wrong.
              </p>
            </div>
          )}

          {tab === 'deadlines' && (
            <div className="rounded-xl border border-mly-200 bg-mly-50 p-4 text-sm text-harbor-800">
              <Clock className="mb-2 h-5 w-5 text-mly-600" />
              <p className="font-medium">No deadlines tracked.</p>
              <p className="mt-1 text-gray-600">
                MiJustice does not track or guarantee legal deadlines. Confirm any
                deadline with the Clerk or a licensed attorney &mdash; missing one can
                seriously hurt your case.
              </p>
            </div>
          )}

          {tab === 'share' && (
            <div className="rounded-xl border border-gray-100 bg-white p-5 text-sm text-gray-600 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <Share2 className="h-5 w-5 text-teal-600" />
                <p className="font-bold text-harbor-800">Share with a lawyer or advocate</p>
              </div>
              <p>
                You can grant a licensed attorney or trusted advocate access to
                this case. Access is revocable at any time. (Sharing UI coming
                with the attorney network rollout.)
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                <Lock className="h-3.5 w-3.5" /> Your case data is private and owner-scoped.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <span className="flex items-center gap-2 text-sm text-gray-600">
        <Icon className="h-4 w-4 text-teal-600" /> {label}
      </span>
      <span className="font-bold text-harbor-800">{value}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500">{text}</div>;
}

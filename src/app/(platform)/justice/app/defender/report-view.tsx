'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ShieldCheck, CheckCircle2, ExternalLink, RotateCcw, Save, Users, Scale,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';
import { justiceBrowserDb } from '@/lib/justice/db';
import { logAgentAction, requiresHumanReview } from '@/lib/justice/agents';
import type { DefenderIntake, DetectedViolation } from '@/lib/justice/defender';
import type { Confidence } from '@/lib/justice/types';

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: 'High confidence',
  needs_review: 'Needs attorney review',
  uncertain: 'Uncertain — verify with a lawyer',
};

const CONFIDENCE_VARIANT: Record<Confidence, 'success' | 'mly' | 'secondary'> = {
  high: 'success',
  needs_review: 'mly',
  uncertain: 'secondary',
};

export function DefenderReport({
  intake, violations, confidence, onRestart,
}: {
  intake: DefenderIntake;
  violations: DetectedViolation[];
  confidence: Confidence;
  onRestart: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const db = justiceBrowserDb();
      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { toast.error('Please sign in to save.'); setSaving(false); return; }

      const { data: caseRow, error: caseErr } = await db
        .from('justice_cases')
        .insert({
          user_id: uid,
          title: intake.charges.slice(0, 80) || 'Untitled case',
          status: 'analyzed',
          intake: intake as unknown as Record<string, unknown>,
        })
        .select('id')
        .single();

      if (caseErr || !caseRow) throw caseErr ?? new Error('save failed');

      if (violations.length > 0) {
        const rows = violations.map((v) => ({
          case_id: caseRow.id,
          user_id: uid,
          amendment: v.amendment,
          title: v.title,
          explanation: v.explanation,
          citations: v.citations,
          confidence: v.confidence,
        }));
        const { error: vErr } = await db.from('justice_violations').insert(rows);
        if (vErr) throw vErr;
      }

      // Audit log for the agent action (harm-vs-help metric).
      const citationsChecked = violations.reduce((n, v) => n + v.citations.length, 0);
      await logAgentAction(db as never, {
        case_id: caseRow.id,
        agent_role: 'constitutional_scanner',
        action: 'defender_scan',
        citations_checked: citationsChecked,
        citations_dropped: 0,
        flags: [],
        confidence,
        human_review_required: requiresHumanReview(confidence, []),
      });

      setSaved(true);
      toast.success('Saved to your cases.');
    } catch {
      toast.error('Could not save right now. Your report is still on screen.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-harbor-800">Constitutional Analysis</h1>
          <Badge variant="live">DRAFT — Not Legal Advice</Badge>
        </div>
        <p className="text-gray-500">{intake.charges || 'Your case'} &middot; {intake.jurisdiction}</p>
      </div>

      <LegalDisclaimer />

      {/* Summary */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Possible issues found</p>
            <p className="text-2xl font-bold tabular-nums text-teal-600">{violations.length}</p>
          </div>
          <Badge variant={CONFIDENCE_VARIANT[confidence]}>{CONFIDENCE_LABEL[confidence]}</Badge>
        </div>
      </div>

      {violations.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-teal-500" />
          <p className="font-medium text-harbor-800">No clear issues flagged from your answers.</p>
          <p className="mt-1 text-sm text-gray-500">
            That does not mean there are none. A lawyer can review details this tool can&rsquo;t see.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {violations.map((v, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-1.5 flex items-center gap-2">
                <Badge variant="harbor">{v.amendment} Amendment</Badge>
                <Badge variant={CONFIDENCE_VARIANT[v.confidence]} className="text-[10px]">
                  {CONFIDENCE_LABEL[v.confidence]}
                </Badge>
              </div>
              <p className="font-bold text-harbor-800">{v.title}</p>
              <p className="mt-1 text-sm text-gray-600">{v.explanation}</p>
              {v.citations.length > 0 && (
                <div className="mt-3 space-y-1 border-t border-gray-100 pt-3">
                  {v.citations.map((c, j) => (
                    <a key={j} href={c.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-teal-600 hover:underline">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      {c.cite}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Attorney match */}
      <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Users className="h-5 w-5 text-teal-600" />
          <h2 className="font-bold text-harbor-800">Free legal help near you</h2>
        </div>
        <p className="text-sm text-gray-600">
          In Duval County you can reach the Public Defender (4th Circuit) and
          Jacksonville Area Legal Aid for free or low-cost help.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="https://www.pd4th.org" target="_blank" rel="noopener noreferrer">
            <Button variant="default" size="sm">Public Defender</Button>
          </a>
          <a href="https://www.jaxlegalaid.org" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">Legal Aid</Button>
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="harbor" onClick={save} disabled={saving || saved}>
          <Save className="mr-2 h-4 w-4" />
          {saved ? 'Saved' : saving ? 'Saving...' : 'Save to My Cases'}
        </Button>
        <Button variant="ghost" onClick={onRestart}>
          <RotateCcw className="mr-2 h-4 w-4" /> Start over
        </Button>
        <Link href="/justice/app/class-actions">
          <Button variant="outline"><Scale className="mr-2 h-4 w-4" /> See matching lawsuits</Button>
        </Link>
      </div>

      <p className="text-xs text-gray-400">
        Filing documents requires attorney review and is not enabled yet in your
        area. This report helps you and a lawyer see the issues clearly.
      </p>
    </div>
  );
}

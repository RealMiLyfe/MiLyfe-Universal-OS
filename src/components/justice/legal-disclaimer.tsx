import { AlertTriangle } from 'lucide-react';
import { NOT_LEGAL_ADVICE } from '@/lib/justice/content';
import { cn } from '@/lib/utils/cn';

/**
 * Persistent "not legal advice" banner. Shown on every MiJustice surface that
 * gives legal information (UPL guardrail — docs/planning v2 1.1).
 */
export function LegalDisclaimer({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        'flex items-start gap-2 rounded-xl border border-mly-200 bg-mly-50 px-3 py-2.5 text-xs text-harbor-800',
        className
      )}
    >
      <AlertTriangle className="h-4 w-4 shrink-0 text-mly-600 mt-0.5" aria-hidden="true" />
      <p className="leading-relaxed">{NOT_LEGAL_ADVICE}</p>
    </div>
  );
}

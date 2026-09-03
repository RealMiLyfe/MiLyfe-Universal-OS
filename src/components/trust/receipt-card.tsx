import { ReceiptText, Eye, RotateCcw, Scale, Clock } from 'lucide-react';
import type { MiReceipt } from '@/lib/trust/types';

/**
 * MiReceipt card — human-readable proof of a consequential action.
 * Answers: what happened, what didn't, who can see it, is it reversible,
 * when it expires, how to appeal. Light MiLyfe styling.
 */
export function ReceiptCard({ receipt }: { receipt: MiReceipt }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50">
          <ReceiptText className="h-5 w-5 text-teal-600" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-harbor-800">{receipt.title}</p>
          <p className="text-sm text-gray-600">{receipt.what_happened}</p>
        </div>
      </div>

      {receipt.what_did_not && (
        <p className="mb-1 text-xs text-gray-500">What did not happen: {receipt.what_did_not}</p>
      )}

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-50 pt-2 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {receipt.who_can_see}</span>
        <span className="inline-flex items-center gap-1">
          <RotateCcw className="h-3.5 w-3.5" /> {receipt.reversible ? 'Reversible' : 'Not reversible'}
        </span>
        {receipt.expires_at && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Expires {new Date(receipt.expires_at).toLocaleDateString()}
          </span>
        )}
        {receipt.appeal_path && (
          <span className="inline-flex items-center gap-1"><Scale className="h-3.5 w-3.5" /> {receipt.appeal_path}</span>
        )}
      </div>
    </div>
  );
}

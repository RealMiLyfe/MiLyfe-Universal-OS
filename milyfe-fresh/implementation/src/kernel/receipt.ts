// Kernel: receipt — MiReceipt issue + verify (Ed25519-signed, portable, printable).
// Source: RECEIPT-CONTRACTS.md. Canonical JSON (sorted keys) is the signed payload.

import { importPublicKey, randomId, sign, verify } from './id';

export type ReceiptStatus =
  | 'proposed' | 'approved' | 'executed' | 'settled'
  | 'rejected' | 'reversed' | 'expired' | 'corrected';

export interface ReceiptInput {
  actor: string;
  branch: 'trunk' | 'governance' | 'lifestyle' | 'finance';
  os: string;
  purpose: string;
  capability: string;
  approval: { by: string; role: string; scope: string; reason: string; evidence?: string; expires?: string };
  impact: { data?: string; value?: string; other?: string };
  status: ReceiptStatus;
  correction: { path: string; route: string; window?: string };
  explains: string;
}

export interface MiReceipt extends ReceiptInput {
  id: string;
  at: string;
  policy: string;
  signature: string;
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`);
  return `{${entries.join(',')}}`;
}

export async function issueReceipt(
  input: ReceiptInput,
  privateKey: CryptoKey,
  policy = 'milyfe/1',
): Promise<MiReceipt> {
  const base = { ...input, id: randomId(), at: new Date().toISOString(), policy };
  const signature = await sign(privateKey, stableStringify(base));
  return { ...base, signature };
}

export async function verifyReceipt(receipt: MiReceipt): Promise<boolean> {
  const { signature, ...base } = receipt;
  try {
    const pub = await importPublicKey(receipt.actor);
    return await verify(pub, stableStringify(base), signature);
  } catch {
    return false;
  }
}

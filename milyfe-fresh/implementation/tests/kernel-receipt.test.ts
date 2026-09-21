import { describe, expect, it } from 'vitest';
import { generateKeyPair } from '@/kernel/id';
import { issueReceipt, verifyReceipt, type ReceiptInput } from '@/kernel/receipt';

async function sample(): Promise<{ input: ReceiptInput; key: CryptoKey }> {
  const kp = await generateKeyPair();
  return {
    key: kp.privateKey,
    input: {
      actor: kp.did, branch: 'finance', os: 'MiMoney', purpose: 'test transfer',
      capability: 'money.transfer',
      approval: { by: kp.did, role: 'member-signed', scope: 'spending', reason: 'thanks' },
      impact: { value: '5' }, status: 'settled',
      correction: { path: 'MiResolve dispute', route: '/api/sync' },
      explains: 'You sent 5 minor $MLY. Signed by you, receipted, reversible only through dispute.',
    },
  };
}

describe('kernel receipt (MiReceipt)', () => {
  it('issues verifiable receipts', async () => {
    const { input, key } = await sample();
    const r = await issueReceipt(input, key);
    expect(await verifyReceipt(r)).toBe(true);
  });
  it('detects tampering', async () => {
    const { input, key } = await sample();
    const r = await issueReceipt(input, key);
    expect(await verifyReceipt({ ...r, impact: { value: '5000000' } })).toBe(false);
  });
});

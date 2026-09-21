import { describe, expect, it } from 'vitest';
import { ApiEnvelope, CryptoDeposit, MoneyState, Posting, TransferParams, VALUE_STATES } from '@/contracts';
import { generateKeyPair } from '@/kernel/id';

const CTX = { cell: 'place', context: 'pocket', role: 'member' };

describe('contracts (Zod, frozen C1–C12)', () => {
  it('accepts a valid API envelope, rejects bad op/key', async () => {
    const kp = await generateKeyPair();
    const good = ApiEnvelope.safeParse({
      api: 'milyfe/1', op: 'money.transfer', idempotencyKey: '123e4567-e89b-12d3-a456-426614174000',
      actor: kp.did, context: CTX, params: {},
    });
    expect(good.success).toBe(true);
    expect(ApiEnvelope.safeParse({ api: 'milyfe/1', op: '', idempotencyKey: 'nope', actor: kp.did, context: CTX, params: {} }).success).toBe(false);
  });
  it('posting must balance (BigInt minor units sum to zero)', async () => {
    const kp = await generateKeyPair();
    const base = { id: '123e4567-e89b-12d3-a456-426614174000', at: new Date().toISOString(), state: 'settled', purpose: 't', approval: 'r', receipt: 'r' } as const;
    const balanced = Posting.safeParse({ ...base, entries: [
      { account: 'a', entity: kp.did, delta: '-5' },
      { account: 'b', entity: kp.did, delta: '5' },
    ] });
    expect(balanced.success).toBe(true);
    const unbalanced = Posting.safeParse({ ...base, entries: [
      { account: 'a', entity: kp.did, delta: '-5' },
      { account: 'b', entity: kp.did, delta: '6' },
    ] });
    expect(unbalanced.success).toBe(false);
  });
  it('transfer params require positive integer minor + human signature', async () => {
    const kp = await generateKeyPair();
    const good = TransferParams.safeParse({ sender: kp.did, recipient: kp.did, amountMinor: '10', pot: 'spending', signature: 'human-confirmed:1' });
    expect(good.success).toBe(true); // self-send rejected at route/RPC layer; schema checks shape
    expect(TransferParams.safeParse({ sender: kp.did, recipient: kp.did, amountMinor: '0', pot: 'spending', signature: 's' }).success).toBe(false);
    expect(TransferParams.safeParse({ sender: kp.did, recipient: kp.did, amountMinor: '10', pot: 'spending' }).success).toBe(false);
  });
  it('money states accept all nine labels (ten values)', () => {
    expect(VALUE_STATES).toHaveLength(10);
    for (const s of VALUE_STATES) expect(MoneyState.safeParse(s).success).toBe(true);
    expect(MoneyState.safeParse('moon').success).toBe(false);
  });
  it('crypto deposits accept only the six V2 assets', async () => {
    const kp = await generateKeyPair();
    const base = { id: '123e4567-e89b-12d3-a456-426614174000', entity: kp.did, amount: '100', tx: '0xabc', confirmations: 0, status: 'announced', receipt: 'r' } as const;
    expect(CryptoDeposit.safeParse({ ...base, asset: 'SOL' }).success).toBe(true);
    expect(CryptoDeposit.safeParse({ ...base, asset: 'DOGE' }).success).toBe(false);
  });
});

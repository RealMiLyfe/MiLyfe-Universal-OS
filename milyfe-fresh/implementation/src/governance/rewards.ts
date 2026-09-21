// MiResolve rewards + treasury vault. Honest labor/reward accounting in MLY:
// rewards are labeled Rewarded (spendable per the nine-label contract) and
// every payout leaves a receipt. The vault refuses to pay what it lacks.
export interface Treasury {
  balanceMinor: string; // MLY, integer string, never negative
  paidMinor: string; // lifetime payouts (audit trail)
}

export function openTreasury(): Treasury {
  return { balanceMinor: '0', paidMinor: '0' };
}

export function fundTreasury(t: Treasury, amountMinor: string): Treasury {
  const amt = BigInt(amountMinor);
  if (amt <= 0n) throw new Error('INVALID_AMOUNT');
  return { balanceMinor: (BigInt(t.balanceMinor) + amt).toString(), paidMinor: t.paidMinor };
}

export interface Reward {
  id: string;
  to: string; // MiID
  amountMinor: string;
  reason: string;
  state: 'rewarded';
  at: string; // ISO
}

export function payReward(t: Treasury, to: string, amountMinor: string, reason: string, nowIso: string): { treasury: Treasury; reward: Reward } {
  const amt = BigInt(amountMinor);
  if (amt <= 0n) throw new Error('INVALID_AMOUNT');
  if (BigInt(t.balanceMinor) < amt) throw new Error('TREASURY_SHORT');
  return {
    treasury: { balanceMinor: (BigInt(t.balanceMinor) - amt).toString(), paidMinor: (BigInt(t.paidMinor) + amt).toString() },
    reward: { id: `rwd-${nowIso.replace(/[^0-9]/g, '')}`, to, amountMinor, reason, state: 'rewarded', at: nowIso },
  };
}

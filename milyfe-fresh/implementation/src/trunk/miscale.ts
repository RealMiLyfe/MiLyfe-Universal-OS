// MiScale — scale and safety rails for trunk capabilities. Hosts the public
// lock board (monetary rails locked until their own named reviews), global
// kill-switches for trunk services, and per-OS rate budgets.
export type LockId = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7' | 'L8' | 'L9' | 'L10';

export interface LockedFlag {
  id: LockId;
  name: string;
  locked: boolean;
  // What outside homework re-opens it — never permission for MiLyfe to exist
  // or for internal voluntary MLY activity.
  unlockNeeds: string;
}

// All locked at foundation. Each opens only on its own named review.
export const LOCKED_FLAGS: LockedFlag[] = [
  { id: 'L1', name: 'XLM deposits', locked: true, unlockNeeds: 'Crypto-rail risk review + partner due-diligence' },
  { id: 'L2', name: 'USDC deposits', locked: true, unlockNeeds: 'Crypto-rail risk review + partner due-diligence' },
  { id: 'L3', name: 'BTC deposits', locked: true, unlockNeeds: 'Crypto-rail risk review + partner due-diligence' },
  { id: 'L4', name: 'ETH deposits', locked: true, unlockNeeds: 'Crypto-rail risk review + partner due-diligence' },
  { id: 'L5', name: 'SOL deposits', locked: true, unlockNeeds: 'Crypto-rail risk review + partner due-diligence' },
  { id: 'L6', name: 'USD deposits', locked: true, unlockNeeds: 'Money-handling risk review + licensed-partner contract' },
  { id: 'L7', name: 'MVP stable-value medium', locked: true, unlockNeeds: 'Stability-design review + reserve policy' },
  { id: 'L8', name: 'DEX listing', locked: true, unlockNeeds: 'Market-risk review + disclosure sign-off' },
  { id: 'L9', name: 'CEX listing', locked: true, unlockNeeds: 'Exchange due-diligence + terms review' },
  { id: 'L10', name: 'NFC card issuance', locked: true, unlockNeeds: 'Card-program risk review + issuer contract' },
];

export function lockStatus(id: LockId): LockedFlag {
  const flag = LOCKED_FLAGS.find((f) => f.id === id);
  if (!flag) throw new Error('UNKNOWN_LOCK');
  return flag;
}

/** Kill-switch board: trunk services anyone can see are on or off. */
export type TrunkService = 'identity' | 'ledger' | 'receipts' | 'messaging';
export const SERVICE_STATUS: Record<TrunkService, 'on' | 'paused'> = {
  identity: 'on',
  ledger: 'on',
  receipts: 'on',
  messaging: 'on',
};

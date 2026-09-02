/**
 * MiLyfe Phase 0 — Trust foundation types (MiAction, MiScope, MiReceipt,
 * verification ladder). Builder-facing; members never see these names.
 */

export type ActionState =
  | 'draft' | 'pending_approval' | 'walking' | 'arrived' | 'failed' | 'reversed' | 'expired';
export type Audience = 'public' | 'community' | 'friends' | 'private' | 'custom';
export type Sensitivity = 'low' | 'normal' | 'high' | 'critical';
export type OfflineRule = 'merge' | 'reject' | 'reserve' | 'review';
export type VerificationLevel = 'none' | 'auto' | 'peer_attested' | 'steward_reviewed';

export interface MiAction {
  id: string;
  actor_id: string;
  actor_role: string;
  kind: string;
  surface: string | null;
  audience: Audience;
  purpose: string | null;
  sensitivity: Sensitivity;
  state: ActionState;
  requires_approval: boolean;
  reversible: boolean;
  expires_at: string | null;
  offline_rule: OfflineRule;
  explanation: string | null;
  payload: Record<string, unknown>;
  policy_version: string;
  created_at: string;
}

export interface MiReceipt {
  id: string;
  action_id: string | null;
  user_id: string;
  title: string;
  what_happened: string;
  what_did_not: string | null;
  who_can_see: string;
  policy_applied: string | null;
  reversible: boolean;
  expires_at: string | null;
  appeal_path: string | null;
  verify_hash: string | null;
  created_at: string;
}

export interface MiScopeEdge {
  id: string;
  from_id: string;
  to_id: string | null;
  object_ref: string | null;
  relation: string;
  scope: string | null;
  requires_second_approval: boolean;
  youth_assent: boolean | null;
  expires_at: string | null;
  revoked: boolean;
  conflict_of_interest: boolean;
  created_at: string;
}

export interface MiVerification {
  id: string;
  user_id: string;
  level: VerificationLevel;
  method: string | null;
  status: 'active' | 'revoked' | 'pending';
  created_at: string;
}

/** Verification level rank: gates economy payouts (Sybil resistance). */
export const LEVEL_RANK: Record<VerificationLevel, number> = {
  none: 0, auto: 1, peer_attested: 2, steward_reviewed: 3,
};

/** Minimum rank required to receive UBI / rewards (auto = email/phone verified). */
export const MIN_PAYOUT_RANK = 1;

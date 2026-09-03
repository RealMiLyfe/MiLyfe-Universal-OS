/**
 * MiJustice table row types (mirrors supabase/migrations/015 + 016).
 * Kept alongside the feature so the core hand-maintained Database type stays
 * focused on the MVP schema.
 */

export type CoverageStatus = 'live' | 'general_info_only' | 'coming_soon';
export type CaseStatus = 'draft' | 'analyzed' | 'referred' | 'filed' | 'resolved' | 'closed';
export type Confidence = 'high' | 'needs_review' | 'uncertain';
export type FilingStatus = 'draft' | 'attorney_review' | 'reviewed' | 'filed' | 'outcome';
export type ShareRole = 'proxy' | 'attorney' | 'advocate' | 'translator';

export interface JusticeCase {
  id: string;
  user_id: string;
  jurisdiction_id: string | null;
  title: string | null;
  status: CaseStatus;
  intake: Record<string, unknown>;
  encrypted_narrative: string | null;
  created_at: string;
  updated_at: string;
}

export interface JusticeViolation {
  id: string;
  case_id: string;
  user_id: string;
  amendment: string;
  title: string;
  explanation: string;
  citations: { cite: string; verified: boolean; url?: string }[];
  confidence: Confidence;
  created_at: string;
}

export interface JusticeConsent {
  id: string;
  user_id: string;
  kind: 'not_legal_advice' | 'privacy' | 'proxy_authorization';
  acknowledged: boolean;
  acknowledged_at: string | null;
  version: string;
  created_at: string;
}

export interface JusticeClassAction {
  id: string;
  number: number;
  name: string;
  defendants: string;
  basis: string;
  description: string | null;
  status: 'building' | 'filed' | 'certified' | 'resolved';
  created_at: string;
}

export interface JusticePartner {
  id: string;
  name: string;
  type: string;
  coverage_area: string | null;
  services: string | null;
  website: string | null;
  contact: string | null;
  verified: boolean;
  created_at: string;
}

export interface JusticeRapidContact {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  relationship: string | null;
  is_attorney: boolean;
  sort_order: number;
  created_at: string;
}

export interface JusticePetition {
  id: string;
  slug: string;
  title: string;
  description: string;
  target: string | null;
  goal: number;
  created_at: string;
}

export interface JusticeImpactStats {
  total_cases: number;
  total_violations: number;
  total_filings: number;
  total_matches: number;
  total_released: number;
  total_dismissed: number;
  total_sealed: number;
}

/**
 * MiJustice — AI Legal Advisory Board (agents assist a human board).
 *
 * Agents do the volume (research, drafting, citation verification, error
 * catching). Licensed humans hold final sign-off on anything that reaches a
 * real person (see docs/planning/MiJustice_OS_Expansion_v4.md).
 *
 * This module defines the agent roles and a lightweight orchestration surface.
 * The heavy AI calls are intentionally NOT wired to a live model here — the
 * rules-grounded Defender scan is the deterministic core, and any future model
 * enrichment must pass through the CitationVerifier + ComplianceMonitor gates
 * below before it can reach a user.
 */
import type { Confidence } from './types';

export type AgentRole =
  | 'intake_classifier'
  | 'constitutional_scanner'
  | 'citation_verifier'
  | 'precedent_researcher'
  | 'template_drafter'
  | 'pattern_analyst'
  | 'content_translator'
  | 'compliance_monitor';

export interface AgentDef {
  role: AgentRole;
  name: string;
  focus: string;
  humanGate: string; // when a human must sign off
}

export const AGENTS: AgentDef[] = [
  { role: 'intake_classifier', name: 'Intake Classifier', focus: 'Route a case to the right module(s) and class action(s).', humanGate: 'None (routing only).' },
  { role: 'constitutional_scanner', name: 'Constitutional Scanner', focus: 'Draft a violation report from intake.', humanGate: 'Escalation review if confidence < high.' },
  { role: 'citation_verifier', name: 'Citation Verifier', focus: 'Verify every citation against an authoritative source; drop the unverifiable.', humanGate: 'None (blocks bad citations automatically).' },
  { role: 'precedent_researcher', name: 'Precedent Researcher', focus: 'Find and summarize relevant caselaw.', humanGate: 'Escalation review before public use.' },
  { role: 'template_drafter', name: 'Template Drafter', focus: 'Assemble a filing from a reviewed template.', humanGate: 'Template sign-off REQUIRED before enabling a filing type.' },
  { role: 'pattern_analyst', name: 'Pattern Analyst', focus: 'Surface disparities/anomalies across the knowledge graph.', humanGate: 'Human review before any named public claim.' },
  { role: 'content_translator', name: 'Content Translator', focus: 'Draft translations of legal content.', humanGate: 'Human bilingual review before "reviewed" flag.' },
  { role: 'compliance_monitor', name: 'Compliance Monitor', focus: 'Scan all output for UPL language, hallucinated citations, crisis signals, defamation risk.', humanGate: 'Flags escalate to human review.' },
];

export interface ComplianceResult {
  ok: boolean;
  flags: string[];
}

/** Words/phrases that would make output read as legal ADVICE (UPL guardrail). */
const UPL_PHRASES = [
  'you will win', 'guaranteed', 'i advise you', 'you should sue',
  'definitely illegal', 'you have no case',
];

const CRISIS_PHRASES = ['kill myself', 'end my life', 'suicide', 'hurt myself'];

/**
 * ComplianceMonitor: lightweight, deterministic scan of user-facing text.
 * Returns flags; callers must route flagged content to human review and never
 * show crisis-flagged content without surfacing 988/emergency help.
 */
export function complianceScan(text: string): ComplianceResult {
  const lower = text.toLowerCase();
  const flags: string[] = [];
  if (UPL_PHRASES.some((p) => lower.includes(p))) flags.push('upl_language');
  if (CRISIS_PHRASES.some((p) => lower.includes(p))) flags.push('crisis_signal');
  return { ok: flags.length === 0, flags };
}

/** Does this output require a human before it can reach the user? */
export function requiresHumanReview(confidence: Confidence, flags: string[]): boolean {
  return confidence !== 'high' || flags.length > 0;
}

export interface AgentLogEntry {
  case_id?: string | null;
  agent_role: AgentRole;
  action: string;
  citations_checked: number;
  citations_dropped: number;
  flags: string[];
  confidence?: Confidence;
  human_review_required: boolean;
}

/**
 * Persist an agent action for auditability (harm-vs-help metric).
 * Best-effort: never throws into the user flow.
 */
export async function logAgentAction(
  db: { from: (t: string) => { insert: (rows: unknown) => Promise<unknown> } },
  entry: AgentLogEntry
): Promise<void> {
  try {
    await db.from('justice_agent_logs').insert({
      case_id: entry.case_id ?? null,
      agent_role: entry.agent_role,
      action: entry.action,
      citations_checked: entry.citations_checked,
      citations_dropped: entry.citations_dropped,
      flags: entry.flags,
      confidence: entry.confidence ?? null,
      human_review_required: entry.human_review_required,
    });
  } catch {
    // swallow — logging must never break the user path
  }
}

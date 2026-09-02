/**
 * MiJustice — Constitutional Defender scan engine.
 *
 * This is a RULES-GROUNDED analyzer, not open-ended AI generation. It maps
 * structured intake answers to possible constitutional issues using a fixed
 * ruleset, and only surfaces citations that exist in our verified content
 * library. This is the anti-hallucination guardrail (docs/planning v2 1.2):
 * no citation is emitted unless it is in VERIFIED_CITATIONS.
 *
 * Output is EDUCATIONAL — "possible issues to raise with a lawyer" — never a
 * prediction of outcome or a claim of legal advice.
 */
import type { Confidence } from './types';

export interface DefenderIntake {
  charges: string;
  jurisdiction: string;
  rightsRead: 'yes' | 'no' | 'unsure';
  warrant: 'yes' | 'no' | 'unsure';
  searched: 'yes' | 'no' | 'unsure';
  counselProvided: 'yes' | 'no' | 'unsure';
  bailAffordable: 'yes' | 'no' | 'na' | 'unsure';
  pleaPressured: 'yes' | 'no' | 'unsure';
  detainedDays?: number;
}

export interface DetectedViolation {
  amendment: string;
  title: string;
  explanation: string;
  citations: { cite: string; verified: boolean; url?: string }[];
  confidence: Confidence;
}

/** Citations that exist in our verified library. Only these may be emitted. */
const VERIFIED_CITATIONS: Record<string, { cite: string; url: string }> = {
  mapp: { cite: 'Mapp v. Ohio, 367 U.S. 643 (1961)', url: 'https://www.courtlistener.com/?q=Mapp+v.+Ohio' },
  miranda: { cite: 'Miranda v. Arizona, 384 U.S. 436 (1966)', url: 'https://www.courtlistener.com/?q=Miranda+v.+Arizona' },
  gideon: { cite: 'Gideon v. Wainwright, 372 U.S. 335 (1963)', url: 'https://www.courtlistener.com/?q=Gideon+v.+Wainwright' },
  brady: { cite: 'Brady v. Maryland, 373 U.S. 83 (1963)', url: 'https://www.courtlistener.com/?q=Brady+v.+Maryland' },
  speedy: { cite: 'Fla. R. Crim. P. 3.191 (Speedy Trial)', url: 'https://www.floridabar.org/rules/' },
};

function cite(...keys: (keyof typeof VERIFIED_CITATIONS)[]) {
  return keys.map((k) => ({ ...VERIFIED_CITATIONS[k], verified: true }));
}

/**
 * Run the scan. Pure function — deterministic, testable, no network.
 * (An AI layer can later ENRICH explanations, but citations always come from
 * the verified set above, and every AI enrichment is logged + confidence-gated.)
 */
export function runDefenderScan(intake: DefenderIntake): DetectedViolation[] {
  const out: DetectedViolation[] = [];

  if (intake.searched === 'yes' && intake.warrant === 'no') {
    out.push({
      amendment: '4th',
      title: 'Possible unlawful search (no warrant)',
      explanation:
        'A search happened and you indicated there was no judicial warrant. The Fourth Amendment generally requires a warrant; evidence from an unlawful search may be challenged with a motion to suppress. There are exceptions, so a lawyer should review the specifics.',
      citations: cite('mapp'),
      confidence: 'needs_review',
    });
  }

  if (intake.rightsRead === 'no') {
    out.push({
      amendment: '5th',
      title: 'Possible Miranda issue',
      explanation:
        'You indicated your rights were not read. If you were interrogated in custody without a Miranda warning, statements you made may be challengeable. A lawyer should assess whether you were "in custody" and "interrogated."',
      citations: cite('miranda'),
      confidence: 'needs_review',
    });
  }

  if (intake.counselProvided === 'no') {
    out.push({
      amendment: '6th',
      title: 'Possible right-to-counsel issue',
      explanation:
        'You indicated counsel was not provided. In criminal cases you have the right to a lawyer, and one must be appointed if you cannot afford one. Raise this with the court and the Public Defender immediately.',
      citations: cite('gideon'),
      confidence: 'needs_review',
    });
  }

  if (intake.bailAffordable === 'no') {
    out.push({
      amendment: '8th',
      title: 'Possible excessive / unaffordable bail',
      explanation:
        'You indicated bail was set at an amount you could not afford. Wealth-based detention raises Eighth and Fourteenth Amendment concerns. You can ask for a bond reduction or an ability-to-pay hearing.',
      citations: [],
      confidence: 'uncertain',
    });
  }

  if (intake.pleaPressured === 'yes') {
    out.push({
      amendment: '6th',
      title: 'Plea pressure — protect your right to trial',
      explanation:
        'You indicated you were pressured into a plea. Most convictions come from pleas, not trials, but you have the right to a trial. Do not plead without understanding every consequence and, ideally, speaking with your lawyer. If favorable evidence was hidden, that may be a Brady issue.',
      citations: cite('brady'),
      confidence: 'needs_review',
    });
  }

  if (typeof intake.detainedDays === 'number' && intake.detainedDays > 175) {
    out.push({
      amendment: '6th',
      title: 'Possible speedy-trial concern',
      explanation:
        'You indicated a long time in detention before trial. Florida\u2019s speedy-trial rule sets time limits; if they were exceeded, a lawyer may seek discharge. Confirm the exact dates and rule with counsel.',
      citations: cite('speedy'),
      confidence: 'uncertain',
    });
  }

  return out;
}

/** Overall confidence: the report is only "high" if at least one high item exists. */
export function overallConfidence(vs: DetectedViolation[]): Confidence {
  if (vs.some((v) => v.confidence === 'high')) return 'high';
  if (vs.some((v) => v.confidence === 'needs_review')) return 'needs_review';
  return 'uncertain';
}

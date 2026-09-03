/**
 * MiJustice — static legal content (Phase 1)
 *
 * This is EDUCATIONAL legal information, NOT legal advice, and NOT prepared by
 * an attorney. It is intentionally kept as typed content so the public
 * Know-Your-Rights pages render instantly and cache offline (they must work
 * during a real encounter with no signal, without login).
 *
 * Every item carries provenance (`source`) and a coverage note. Legal
 * translations must be human-reviewed before being marked reviewed=true.
 *
 * Guardrails (see docs/planning/MiJustice_OS_Expansion_v2.md 1.1):
 *   - This module never phrases content as "advice" or a guaranteed outcome.
 *   - The NOT_LEGAL_ADVICE constant is shown on every surface that uses this.
 */

export const NOT_LEGAL_ADVICE =
  'This is legal information and a self-help tool, not legal advice. It was not ' +
  'prepared by an attorney. Laws change and every situation is different — talk ' +
  'to a licensed attorney before you act on anything here.';

export const LAUNCH_COVERAGE =
  'MiJustice is launching in Duval County, Florida. Constitutional rights apply ' +
  'nationwide, but court and agency details are specific to the Jacksonville / ' +
  'Fourth Judicial Circuit area right now.';

export interface RightsStep {
  say?: string;
  doThis?: string;
  dont?: string;
  note?: string;
}

export interface RightsGuide {
  slug: string;
  situation: string;
  icon: 'car' | 'home' | 'handcuffs' | 'search' | 'gavel' | 'scale';
  summary: string;
  steps: RightsStep[];
  source: string;
}

/**
 * Know-Your-Rights, by situation. General U.S. constitutional guidance plus
 * Florida-specific notes where relevant. Verify against ACLU / official sources
 * before each publish; refresh "source" dates on update.
 */
export const RIGHTS_GUIDES: RightsGuide[] = [
  {
    slug: 'traffic-stop',
    situation: 'Getting pulled over',
    icon: 'car',
    summary:
      'You have rights during a traffic stop. Stay calm, keep your hands visible, and remember you do not have to answer questions beyond identifying yourself.',
    steps: [
      { doThis: 'Pull over safely, turn on the interior light at night, and keep your hands on the wheel.' },
      { say: '"I am going to remain silent. Am I free to go?"' },
      { dont: 'Do not physically resist, even if you believe the stop is unlawful. Contest it later, in court.' },
      { note: 'You generally must show license, registration, and proof of insurance when driving.' },
      { note: 'You can say: "I do not consent to a search." Saying it does not make you guilty of anything.' },
    ],
    source: 'General U.S. Fourth/Fifth Amendment guidance; verify with ACLU know-your-rights.',
  },
  {
    slug: 'ice-at-your-door',
    situation: 'ICE at your door',
    icon: 'home',
    summary:
      'You do not have to open the door for ICE unless they have a warrant signed by a judge. An ICE administrative form (like a Form I-205) is NOT a judicial warrant.',
    steps: [
      { dont: 'Do not open the door. You can speak through the door or a window.' },
      { say: '"I do not consent to you entering. Please slide any warrant under the door."' },
      { note: 'A real judicial warrant is signed by a judge and names your specific address or person. An administrative warrant (ICE form) does not give them the right to enter your home.' },
      { say: '"I am exercising my right to remain silent. I want to speak to a lawyer."' },
      { dont: 'Do not sign anything without a lawyer. Do not run.' },
      { note: 'Everyone in the U.S., regardless of immigration status, has constitutional rights.' },
    ],
    source: 'General Fourth Amendment + ACLU immigrants\u2019-rights guidance; verify current Florida law.',
  },
  {
    slug: 'being-arrested',
    situation: 'Being arrested',
    icon: 'handcuffs',
    summary:
      'If you are being arrested, you have the right to remain silent and the right to a lawyer. Use them.',
    steps: [
      { say: '"I am going to remain silent. I want a lawyer."' },
      { dont: 'Do not explain, argue, or try to talk your way out of it. Anything you say can be used against you.' },
      { doThis: 'Ask if you are being detained or if you are free to go.' },
      { note: 'If you cannot afford a lawyer, one must be provided for criminal charges (6th Amendment). In the Fourth Circuit that is the Public Defender.' },
      { note: 'Try to remember badge numbers, patrol-car numbers, and what happened. Write it down as soon as you can.' },
    ],
    source: 'General Fifth/Sixth Amendment guidance.',
  },
  {
    slug: 'plea-pressure',
    situation: 'Being pressured into a plea deal',
    icon: 'gavel',
    summary:
      'Most convictions come from plea deals, not trials. You have the right to a trial. Do not take a plea without understanding it and, ideally, talking to a lawyer.',
    steps: [
      { doThis: 'Ask for time and ask to speak with your attorney before deciding.' },
      { dont: 'Do not plead guilty to something you did not do just to go home faster — a conviction can follow you for life.' },
      { note: 'A plea gives up your right to trial (6th Amendment). Make sure you understand every consequence, including immigration and housing effects.' },
      { note: 'You can ask the court about alternatives, diversion programs, or a bond reduction.' },
    ],
    source: 'General Sixth Amendment guidance.',
  },
  {
    slug: 'searched-without-warrant',
    situation: 'Being searched without a warrant',
    icon: 'search',
    summary:
      'The Fourth Amendment protects you from unreasonable searches. You can refuse consent to a search.',
    steps: [
      { say: '"I do not consent to a search."' },
      { dont: 'Do not physically interfere, but you do not have to help them search.' },
      { note: 'There are exceptions where police may search without a warrant. Refusing consent preserves your ability to challenge the search later.' },
      { doThis: 'Note what was searched, when, and who was present. Tell your lawyer.' },
    ],
    source: 'General Fourth Amendment guidance.',
  },
];

export function getRightsGuide(slug: string): RightsGuide | undefined {
  return RIGHTS_GUIDES.find((g) => g.slug === slug);
}

export interface ConstitutionItem {
  kind: 'amendment';
  number: string;
  title: string;
  plainEnglish: string;
}

/** The Bill of Rights, decoded in plain English (public educational content). */
export const BILL_OF_RIGHTS: ConstitutionItem[] = [
  { kind: 'amendment', number: '1st', title: 'Free speech, press, religion, assembly, petition', plainEnglish: 'You can speak, worship, gather peacefully, publish, and ask the government to fix things.' },
  { kind: 'amendment', number: '2nd', title: 'Right to bear arms', plainEnglish: 'The right to keep and bear arms.' },
  { kind: 'amendment', number: '3rd', title: 'No quartering of soldiers', plainEnglish: 'The government cannot force you to house soldiers.' },
  { kind: 'amendment', number: '4th', title: 'No illegal search and seizure', plainEnglish: 'Police generally need a warrant, signed by a judge, to search you or your home.' },
  { kind: 'amendment', number: '5th', title: 'Due process, no self-incrimination, no double jeopardy', plainEnglish: 'You do not have to testify against yourself, cannot be tried twice for the same crime, and get fair process.' },
  { kind: 'amendment', number: '6th', title: 'Speedy trial, jury, counsel', plainEnglish: 'You have the right to a fast, public trial, an impartial jury, and a lawyer.' },
  { kind: 'amendment', number: '7th', title: 'Jury trial in civil cases', plainEnglish: 'The right to a jury in many civil disputes.' },
  { kind: 'amendment', number: '8th', title: 'No excessive bail or cruel punishment', plainEnglish: 'Bail and fines cannot be excessive, and punishment cannot be cruel and unusual.' },
  { kind: 'amendment', number: '9th', title: 'Other rights retained', plainEnglish: 'Just because a right is not listed does not mean you do not have it.' },
  { kind: 'amendment', number: '10th', title: 'Powers reserved to states and people', plainEnglish: 'Powers not given to the federal government belong to the states and the people.' },
];

/** The 24 MiJustice modules (for the landing grid + launcher). */
export interface JusticeModule {
  slug: string;
  title: string;
  tagline: string;
  icon: string; // lucide icon name
  phase: 'available' | 'coming_soon';
  group: 'defense' | 'liberation' | 'pressure' | 'knowledge';
}

export const JUSTICE_MODULES: JusticeModule[] = [
  { slug: 'encounter', title: 'Encounter Mode', tagline: 'Your rights, right now — even offline.', icon: 'ShieldAlert', phase: 'available', group: 'defense' },
  { slug: 'rights', title: 'Know Your Rights', tagline: 'What to do in every situation.', icon: 'BookOpen', phase: 'available', group: 'knowledge' },
  { slug: 'defender', title: 'Constitutional Defender', tagline: 'Scan a charge against the Constitution.', icon: 'Scale', phase: 'coming_soon', group: 'defense' },
  { slug: 'liberation', title: 'Liberation Engine', tagline: 'Fight to free the wrongly held.', icon: 'Unlock', phase: 'coming_soon', group: 'liberation' },
  { slug: 'ice-shield', title: 'ICE Defense Shield', tagline: 'Warrant checker + rapid response.', icon: 'Home', phase: 'coming_soon', group: 'defense' },
  { slug: 'class-actions', title: 'Class Action War Room', tagline: 'Match your case to the fight.', icon: 'Users', phase: 'coming_soon', group: 'liberation' },
  { slug: 'expungement', title: 'Clear Your Record', tagline: 'Florida sealing & expungement help.', icon: 'Eraser', phase: 'coming_soon', group: 'liberation' },
  { slug: 'pressure', title: 'Political Pressure', tagline: 'Petitions, scorecards, demands.', icon: 'Megaphone', phase: 'coming_soon', group: 'pressure' },
];

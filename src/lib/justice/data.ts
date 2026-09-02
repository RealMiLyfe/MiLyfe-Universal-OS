/**
 * MiJustice — full reference data (modules, manipulations, weapons, lawsuits).
 *
 * Educational/reference content backing the module pages. Not legal advice.
 * Kept typed + static so pages render fast and cache offline.
 */

// ── The 24 modules (full catalog for launcher + module pages) ───────────────
export interface ModuleDef {
  slug: string;
  num: number;
  title: string;
  tagline: string;
  icon: string; // lucide name
  group: 'defense' | 'liberation' | 'pressure' | 'knowledge' | 'network';
  status: 'available' | 'preview' | 'coming_soon';
  purpose: string;
  does: string[];
}

export const MODULES: ModuleDef[] = [
  { slug: 'defender', num: 1, title: 'AI Constitutional Defender', tagline: 'Scan a charge against the Constitution.', icon: 'Scale', group: 'defense', status: 'preview',
    purpose: 'Scan any criminal charge against the Constitution and surface every possible violation.',
    does: ['Intake your charge and circumstances', 'Check against every relevant amendment', 'Draft a plain-English violation report', 'Match you to free legal help'] },
  { slug: 'liberation', num: 2, title: 'The Liberation Engine', tagline: 'Fight to free the wrongly held.', icon: 'Unlock', group: 'liberation', status: 'preview',
    purpose: 'Identify people held unconstitutionally and organize the fight to free them.',
    does: ['Audit cases for violations', 'Draft habeas / post-conviction motions (attorney-reviewed)', 'Track patterns publicly', 'Reentry support after release'] },
  { slug: 'ice-shield', num: 3, title: 'ICE Defense Shield', tagline: 'Warrant checker + rapid response.', icon: 'Home', group: 'defense', status: 'preview',
    purpose: 'Nobody gets disappeared. Know your rights, check warrants, alert your people.',
    does: ['Know-your-rights in every language', 'Warrant checker (judicial vs. administrative)', 'One-button rapid-response alert', 'Detention tracking + attorney connection'] },
  { slug: 'sovereignty', num: 4, title: 'Native Sovereignty', tagline: 'The only true birthright; the supreme treaties.', icon: 'Mountain', group: 'network', status: 'coming_soon',
    purpose: 'Document and litigate treaty violations; tribal sovereignty predates and is acknowledged by the Constitution.',
    does: ['Document broken treaties', 'Connect to tribal legal orgs (NARF)', 'Amplify tribal voices', 'Public education on true history'] },
  { slug: 'class-actions', num: 5, title: 'Class Action War Room', tagline: 'Match your case to the fight.', icon: 'Users', group: 'liberation', status: 'preview',
    purpose: 'Not one lawsuit — a machine that files them all. Match your story to the right class action.',
    does: ['Categorize your case', 'Check Rule 23 factors', 'Build evidence packages', 'Coordinate all 20 lawsuits'] },
  { slug: 'knowledge', num: 6, title: "The People's Knowledge Base", tagline: 'You are the power. Remember it.', icon: 'BookOpen', group: 'knowledge', status: 'available',
    purpose: 'Constitution decoded, know-your-rights, jury nullification, the violation database, and the people\u2019s history.',
    does: ['Constitution in plain English', 'Rights by situation', 'Jury nullification guide', 'Searchable violation patterns'] },
  { slug: 'coalition', num: 8, title: 'Coalition Engine', tagline: 'United we are unstoppable.', icon: 'Handshake', group: 'network', status: 'preview',
    purpose: 'One hub uniting the orgs that have been fighting in silos.',
    does: ['Partner directory', 'Best-fit intake routing', 'Referral tracking', 'Outreach pipeline'] },
  { slug: 'pressure', num: 9, title: 'Political Pressure Engine', tagline: 'Make them listen.', icon: 'Megaphone', group: 'pressure', status: 'preview',
    purpose: 'When the courts won\u2019t listen, the people make them listen.',
    does: ['Petitions', 'Congressional scorecards', 'The 18 legislative demands', 'Media amplification'] },
  { slug: 'asset-recovery', num: 10, title: 'Asset Recovery Engine', tagline: 'Get back what they took.', icon: 'Banknote', group: 'liberation', status: 'coming_soon',
    purpose: 'Recover property seized through civil asset forfeiture without a conviction.',
    does: ['Scan for forfeiture', 'Check due process', 'Draft recovery motions (reviewed)', 'Public dashboard by department'] },
  { slug: 'youth', num: 11, title: 'Youth Defense Shield', tagline: 'Protect kids before the trap closes.', icon: 'GraduationCap', group: 'defense', status: 'coming_soon',
    purpose: 'Protect children from the school-to-prison pipeline.',
    does: ['Monitor school discipline', 'Draft parent advocacy letters', 'Track district disparities', 'Kid-friendly know-your-rights'] },
  { slug: 'debt', num: 12, title: 'Debt Defense Engine', tagline: 'Fight modern debtors\u2019 prisons.', icon: 'Coins', group: 'liberation', status: 'coming_soon',
    purpose: 'Fight jailing people for being too poor to pay.',
    does: ['Identify debt-based warrants', 'Draft dismissal motions (reviewed)', 'Check Excessive-Fines violations', 'File indigency hearings'] },
  { slug: 'solitary', num: 13, title: 'Solitary Confinement Abolition', tagline: 'End torture on American soil.', icon: 'DoorClosed', group: 'liberation', status: 'coming_soon',
    purpose: 'End prolonged solitary confinement (torture past 15 days per the UN).',
    does: ['Track people in solitary', 'Flag court-barred placements', 'Draft habeas + Sec 1983 (reviewed)', 'File international complaints'] },
  { slug: 'surveillance', num: 14, title: 'Surveillance Defense Shield', tagline: 'Fight the algorithmic dragnet.', icon: 'Eye', group: 'defense', status: 'coming_soon',
    purpose: 'Fight facial recognition and predictive policing.',
    does: ['Identify AI-based arrests', 'Challenge that evidence', 'FOIA the algorithms', 'Track error rates and bias'] },
  { slug: 'juvenile', num: 15, title: 'Juvenile Defense Engine', tagline: 'Their brains aren\u2019t fully developed.', icon: 'Baby', group: 'defense', status: 'coming_soon',
    purpose: 'Challenge trying and holding children as adults.',
    does: ['Challenge adult charging', 'Challenge juvenile solitary', 'Monitor record sealing', 'Brain-science sentencing advocacy'] },
  { slug: 'mental-health', num: 16, title: 'Mental Health Diversion', tagline: 'Treatment, not incarceration.', icon: 'HeartPulse', group: 'defense', status: 'coming_soon',
    purpose: 'Divert people in mental-health crisis away from jail.',
    does: ['Advocate diversion', 'Challenge ADA violations', 'Track custody deaths', 'Crisis-intervention advocacy'] },
  { slug: 'veterans', num: 17, title: 'Veterans Defense', tagline: 'They served. The system betrayed them.', icon: 'Medal', group: 'defense', status: 'coming_soon',
    purpose: 'Defend veterans criminalized for service-related conditions.',
    does: ['Identify incarcerated veterans', 'Advocate veterans\u2019 courts', 'Service-based sentence reductions', 'Partner with NVLSP'] },
  { slug: 'women-family', num: 18, title: "Women's & Family Defense", tagline: 'The most invisible population.', icon: 'Users2', group: 'defense', status: 'coming_soon',
    purpose: 'Protect women, mothers, and families in the system.',
    does: ['Challenge shackling in childbirth', 'Fight family separation', 'Adequate medical care', 'Report guard abuse'] },
  { slug: 'lgbtq', num: 19, title: 'LGBTQ+ Prisoner Rights', tagline: 'Dignity behind bars.', icon: 'Rainbow', group: 'defense', status: 'coming_soon',
    purpose: 'Protect LGBTQ+ people in custody.',
    does: ['Challenge wrong-facility placement', 'Fight violence & assault', 'Challenge denial of care', 'Connect to Lambda Legal'] },
  { slug: 'medical-custody', num: 20, title: 'Medical Rights & Custody Deaths', tagline: 'Nobody dies of a treatable condition.', icon: 'Stethoscope', group: 'liberation', status: 'coming_soon',
    purpose: 'Track and fight medical neglect and deaths in custody.',
    does: ['Track deaths in custody', 'Flag medical neglect', 'Draft wrongful-death claims (reviewed)', 'Public dashboard'] },
  { slug: 'probation-parole', num: 21, title: 'Probation & Parole Defense', tagline: 'Fight for-profit supervision.', icon: 'ClipboardCheck', group: 'liberation', status: 'coming_soon',
    purpose: 'Fight for-profit probation and pay-to-be-supervised schemes.',
    does: ['Identify for-profit probation', 'Challenge supervision fees', 'Distinguish inability vs. refusal', 'Class actions'] },
  { slug: 'grand-jury', num: 22, title: 'Grand Jury Transparency', tagline: 'Expose the one-sided machine.', icon: 'Landmark', group: 'knowledge', status: 'coming_soon',
    purpose: 'Expose and reform the secretive grand-jury process.',
    does: ['Educate on how it works', 'Track indictment rates', 'Identify misconduct patterns', 'Reform advocacy'] },
  { slug: 'whistleblower', num: 23, title: 'Whistleblower Protection', tagline: 'Protect those who speak truth.', icon: 'Siren', group: 'network', status: 'coming_soon',
    purpose: 'Protect people who report abuse from inside the system.',
    does: ['Connect to attorneys fast', 'Document retaliation', 'Secure anonymous reporting', 'Track patterns'] },
  { slug: 'international', num: 24, title: 'International Human Rights', tagline: 'Take the fight beyond U.S. courts.', icon: 'Globe', group: 'pressure', status: 'coming_soon',
    purpose: 'A two-front war: file complaints with UN and international bodies.',
    does: ['File with UN Special Rapporteurs', 'Document treaty violations', 'Inter-American Commission complaints', 'Global pressure'] },
];

export function getModule(slug: string): ModuleDef | undefined {
  return MODULES.find((m) => m.slug === slug);
}

// ── The 18 legislative demands (Political Pressure Engine) ──────────────────
export const LEGISLATIVE_DEMANDS: string[] = [
  'Close the 13th Amendment slavery loophole \u2014 end prison slavery',
  'End qualified immunity \u2014 make officers personally liable',
  'End cash bail nationwide \u2014 stop punishing poverty',
  'Regulate plea bargaining \u2014 stop coerced guilty pleas',
  'Ban collateral consequences \u2014 when time is served, the debt is paid',
  'Mandate minimum wage for all prison labor',
  'Fund public defenders equally to prosecutors',
  'Ban civil asset forfeiture without a conviction',
  'Ban facial recognition in law enforcement',
  'Counselors, nurses, and social workers in schools instead of police',
  'Abolish solitary confinement',
  'Abolish for-profit probation',
  'Require judicial warrants for all ICE actions',
  'Honor existing Native American treaties',
  'Universal veterans\u2019 courts',
  'Abolish zero-tolerance school policies',
  'End the grand-jury secrecy system',
  'Mandate jury-nullification disclosure to all jurors',
];

// ── The 8 legal weapons ─────────────────────────────────────────────────────
export interface Weapon { name: string; what: string; }
export const WEAPONS: Weapon[] = [
  { name: 'Federal Tort Claims Act (FTCA)', what: 'Sue the federal government for wrongful acts; file an administrative claim first.' },
  { name: '42 U.S.C. \u00a7 1983', what: 'Hold state/local officials accountable for constitutional violations; fees under \u00a71988.' },
  { name: 'Bivens Actions', what: 'The federal equivalent of \u00a71983 \u2014 sue federal officials personally.' },
  { name: 'Habeas Corpus', what: 'Challenge unlawful detention: "show me the body."' },
  { name: 'Brady Violations', what: 'Prosecutors must disclose favorable evidence; hiding it can overturn a conviction.' },
  { name: 'Rule 23 Class Certification', what: 'Numerosity, commonality, typicality, adequacy.' },
  { name: 'International Human-Rights Complaints', what: 'UN Human Rights Council, IACHR, Special Rapporteurs.' },
  { name: 'Sovereign-Immunity Waivers', what: 'The statutory doors through which lawsuits must pass.' },
];

// ── The manipulations (systemic abuses) ─────────────────────────────────────
export interface Manipulation { title: string; summary: string; basis: string; }
export const MANIPULATIONS: Manipulation[] = [
  { title: '13th Amendment Slavery Loophole', summary: 'Slavery remains legal "as punishment for crime," powering prison labor.', basis: '13th' },
  { title: 'Qualified Immunity', summary: 'A court-invented shield (not in the Constitution) protecting officials from liability.', basis: '14th / court-made' },
  { title: 'Prosecutorial & Judicial Immunity', summary: 'Absolute immunity even for knowing misconduct.', basis: 'court-made' },
  { title: 'The Plea-Bargain Trap', summary: '90\u201397% of convictions come from pleas, not trials \u2014 bypassing the 6th Amendment.', basis: '5th, 6th' },
  { title: 'Cash Bail as a Wealth Trap', summary: 'The rich walk; the poor sit and are pressured into pleas.', basis: '8th, 14th' },
  { title: 'Collateral Consequences', summary: 'A life sentence of lost housing, jobs, and voting after time served.', basis: '8th, 14th' },
  { title: 'Civil Asset Forfeiture', summary: 'Government takes property without convicting anyone.', basis: '4th, 5th, 8th, 14th' },
  { title: 'Modern Debtors\u2019 Prisons', summary: 'Jailing people for being too poor to pay fines and fees.', basis: '8th, 14th' },
  { title: 'The Surveillance State', summary: 'Facial recognition and predictive policing with racial bias.', basis: '1st, 4th, 14th' },
  { title: 'School-to-Prison Pipeline', summary: 'Discipline disparities funnel children toward incarceration.', basis: '14th, Title VI' },
  { title: 'Solitary Confinement as Torture', summary: 'Isolation beyond 15 days is torture under the UN definition.', basis: '8th, Intl Law' },
  { title: 'The Prison-Industrial Complex', summary: 'Profit incentives to keep people locked up.', basis: '13th, 14th' },
  { title: 'ICE & Immigration Enforcement', summary: 'Warrantless entries and racial profiling on contested land.', basis: '4th, 14th, Art. VI' },
  { title: 'Grand Jury Manipulation', summary: 'One-sided proceedings controlled entirely by prosecutors.', basis: '5th' },
  { title: 'Hidden Jury Nullification', summary: 'Jurors\u2019 legal right to acquit unjust laws is hidden from them.', basis: '1st, 6th' },
  { title: 'The Veterans Betrayal', summary: 'Service trauma leads to incarceration instead of care.', basis: '8th' },
  { title: 'Women & Pregnant People in Prison', summary: 'Shackling in childbirth, family separation, abuse.', basis: '8th, 14th' },
  { title: 'LGBTQ+ Incarceration', summary: 'Wrong-facility placement, violence, denial of care.', basis: '8th, 14th' },
  { title: 'Medical Neglect & Custody Deaths', summary: 'People die of treatable conditions in custody.', basis: '8th' },
  { title: 'Whistleblower Retaliation', summary: 'The system silences those who report abuse.', basis: '1st' },
  { title: 'Juvenile Justice Failures', summary: 'Children tried as adults; records follow them for life.', basis: '8th, 14th' },
  { title: 'Mental Health Crisis', summary: 'Jails became the largest mental-health providers.', basis: '8th, ADA' },
  { title: 'International Law Violations', summary: 'The U.S. violates treaties it ratified (Mandela Rules, CAT, ICCPR).', basis: 'Intl Law' },
];

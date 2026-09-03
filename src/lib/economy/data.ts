/**
 * MiLyfe economy — contribution primitive, facets, and the "ways to contribute /
 * earn" catalog. $MLY only, no ads, no processors.
 */

export type Facet =
  | 'neighbor' | 'carer' | 'maker' | 'teacher' | 'keeper' | 'voice' | 'shop' | 'helper';

export interface FacetMeta {
  key: Facet;
  label: string;
  blurb: string;
  keepItUp: string; // actionable nudge when decaying
  icon: string;     // lucide name
  tint: string;     // tailwind gradient classes
  ic: string;       // icon color
}

export const FACETS: FacetMeta[] = [
  { key: 'neighbor', label: 'Neighbor', blurb: 'Showing up, endorsements, being present.', keepItUp: 'Endorse or help a neighbor', icon: 'Heart', tint: 'from-rose-50/80 to-rose-100/40 border-rose-200/50', ic: 'text-rose-600' },
  { key: 'carer', label: 'Carer', blurb: 'Health & safety support, check-ins.', keepItUp: 'Check in on someone', icon: 'HeartPulse', tint: 'from-green-50/80 to-green-100/40 border-green-200/50', ic: 'text-green-600' },
  { key: 'maker', label: 'Maker', blurb: 'Media, apps, building things.', keepItUp: 'Share something you made', icon: 'Hammer', tint: 'from-amber-50/80 to-amber-100/40 border-amber-200/50', ic: 'text-amber-600' },
  { key: 'teacher', label: 'Teacher', blurb: 'Courses, answers, mentoring.', keepItUp: 'Answer a question or teach', icon: 'GraduationCap', tint: 'from-indigo-50/80 to-indigo-100/40 border-indigo-200/50', ic: 'text-indigo-600' },
  { key: 'keeper', label: 'Keeper', blurb: 'Moderation, upkeep, stewardship.', keepItUp: 'Review or refresh something', icon: 'ShieldCheck', tint: 'from-teal-50/80 to-teal-100/40 border-teal-200/50', ic: 'text-teal-600' },
  { key: 'voice', label: 'Voice', blurb: 'Votes, proposals, petitions.', keepItUp: 'Vote on a proposal', icon: 'Landmark', tint: 'from-purple-50/80 to-purple-100/40 border-purple-200/50', ic: 'text-purple-600' },
  { key: 'shop', label: 'Shop', blurb: 'Marketplace activity, fulfilling orders.', keepItUp: 'List or fulfill on Street', icon: 'Store', tint: 'from-orange-50/80 to-orange-100/40 border-orange-200/50', ic: 'text-orange-600' },
  { key: 'helper', label: 'Helper', blurb: 'Quests, volunteer legal/translation.', keepItUp: 'Claim an open quest', icon: 'Zap', tint: 'from-harbor-50/80 to-harbor-100/40 border-harbor-200/50', ic: 'text-harbor-600' },
];

export interface WayToContribute {
  title: string;
  facet: Facet;
  mly: number;
  href: string;
  icon: string;
}

/** The Earn / Ways-to-contribute menu — the platform-wide quest board. */
export const WAYS_TO_CONTRIBUTE: WayToContribute[] = [
  { title: 'Complete a community quest', facet: 'helper', mly: 50, href: '/street', icon: 'Zap' },
  { title: 'Vote on an active proposal', facet: 'voice', mly: 10, href: '/governance', icon: 'Landmark' },
  { title: 'Teach a lesson / answer questions', facet: 'teacher', mly: 50, href: '/learn', icon: 'GraduationCap' },
  { title: 'Share media with the community', facet: 'maker', mly: 25, href: '/media', icon: 'Music' },
  { title: 'List or fulfill on Street', facet: 'shop', mly: 20, href: '/street', icon: 'Store' },
  { title: 'Help on a MiJustice case', facet: 'helper', mly: 50, href: '/justice/app/home', icon: 'Scale' },
  { title: 'Attest a real neighbor', facet: 'neighbor', mly: 10, href: '/connect', icon: 'Heart' },
  { title: 'Translate content (human-reviewed)', facet: 'keeper', mly: 30, href: '/wiki', icon: 'Languages' },
];

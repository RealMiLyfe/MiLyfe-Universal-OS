/**
 * Seed Jacksonville-specific content into the MiLyfe platform.
 * Run with: npx tsx scripts/seed-jacksonville.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SYSTEM_USER_ID = 'bca8844d-05ce-4204-b30b-59327d0fe469'; // milyfe account

// ═══════════════════════════════════════════════════════════════
// COMMUNITY RESOURCES — Real Jacksonville organizations
// ═══════════════════════════════════════════════════════════════
const resources = [
  {
    name: 'Clara White Mission',
    category: 'shelter',
    description: 'Emergency shelter, meals, job training, and life skills for men and women experiencing homelessness. Serves breakfast and lunch daily.',
    address: '613 W Ashley St, Jacksonville, FL 32202',
    phone: '(904) 354-4162',
    url: 'https://clarawhitemission.org',
    latitude: 30.3297,
    longitude: -81.6650,
    hours: { mon_fri: '7am-5pm', sat: '8am-12pm' },
    accepts_mly: false,
    accessibility: ['wheelchair_accessible', 'bus_route'],
  },
  {
    name: 'Sulzbacher Center',
    category: 'shelter',
    description: 'Comprehensive services for homeless individuals and families including shelter, healthcare, employment services, and permanent housing programs.',
    address: '611 E Adams St, Jacksonville, FL 32202',
    phone: '(904) 394-8557',
    url: 'https://sulzbacher.org',
    latitude: 30.3270,
    longitude: -81.6500,
    hours: { intake: '24/7', services: '8am-5pm' },
    accepts_mly: false,
    accessibility: ['wheelchair_accessible', 'bus_route', 'family_friendly'],
  },
  {
    name: 'Feeding Northeast Florida',
    category: 'food',
    description: 'Food bank distributing millions of meals annually. Partner agency network provides food at 400+ locations across Northeast Florida.',
    address: '1116 Edgewood Ave N, Jacksonville, FL 32254',
    phone: '(904) 513-1232',
    url: 'https://feedingnefl.org',
    latitude: 30.3389,
    longitude: -81.7064,
    hours: { mon_fri: '8am-4pm' },
    accepts_mly: false,
    accessibility: ['wheelchair_accessible', 'drive_through'],
  },
  {
    name: 'Jacksonville Area Legal Aid (JALA)',
    category: 'legal',
    description: 'Free civil legal services for low-income residents. Handles housing, family law, consumer protection, public benefits, and elder law cases.',
    address: '126 W Adams St, Jacksonville, FL 32202',
    phone: '(904) 356-8371',
    url: 'https://jaxlegalaid.org',
    latitude: 30.3283,
    longitude: -81.6609,
    hours: { mon_fri: '8:30am-5pm', intake_line: '9am-12pm' },
    accepts_mly: false,
    accessibility: ['wheelchair_accessible', 'bus_route', 'interpreter_available'],
  },
  {
    name: 'Agape Community Health Center',
    category: 'clinic',
    description: 'Federally qualified health center providing primary care, dental, behavioral health, and pharmacy services on a sliding fee scale.',
    address: '1620 Naldo Ave, Jacksonville, FL 32207',
    phone: '(904) 346-3655',
    url: 'https://agapechc.org',
    latitude: 30.3050,
    longitude: -81.6460,
    hours: { mon_fri: '8am-5pm', some_evenings: true },
    accepts_mly: false,
    accessibility: ['wheelchair_accessible', 'bus_route', 'sliding_scale'],
  },
  {
    name: 'Mental Health Resource Center',
    category: 'mental_health',
    description: 'Crisis services, outpatient counseling, case management, and peer support for adults with mental health and substance use challenges.',
    address: '3333 W 20th St, Jacksonville, FL 32254',
    phone: '(904) 695-9145',
    url: 'https://mhrcflorida.com',
    latitude: 30.3350,
    longitude: -81.7200,
    hours: { crisis: '24/7', outpatient: '8am-5pm' },
    accepts_mly: false,
    accessibility: ['wheelchair_accessible', 'crisis_line', 'bus_route'],
  },
  {
    name: 'Gateway Community Services',
    category: 'substance_recovery',
    description: 'Addiction treatment and recovery services including detox, residential, outpatient, and medication-assisted treatment (MAT).',
    address: '555 Stockton St, Jacksonville, FL 32204',
    phone: '(904) 387-4661',
    url: 'https://gatewaycommunity.com',
    latitude: 30.3186,
    longitude: -81.6850,
    hours: { intake: '24/7', outpatient: '7am-7pm' },
    accepts_mly: false,
    accessibility: ['wheelchair_accessible', 'mat_available'],
  },
  {
    name: 'JTA (Jacksonville Transportation Authority)',
    category: 'transit',
    description: 'Public bus system serving Duval County. First Coast Flyer (BRT), Skyway (downtown), and regular bus routes. Reduced fare for seniors/disabled.',
    address: '100 N Myrtle Ave, Jacksonville, FL 32204',
    phone: '(904) 630-3100',
    url: 'https://jtafla.com',
    latitude: 30.3271,
    longitude: -81.6680,
    hours: { buses: '5am-11pm daily', skyway: '6am-9pm M-F' },
    accepts_mly: false,
    accessibility: ['wheelchair_accessible', 'reduced_fare', 'app_available'],
  },
  {
    name: 'CareerSource Northeast Florida',
    category: 'jobs',
    description: 'Free employment services: job search assistance, resume writing, interview prep, skills training, and veteran services.',
    address: '1845 Town Center Blvd Suite 250, Jacksonville, FL 32246',
    phone: '(904) 213-3888',
    url: 'https://careersourcenefl.com',
    latitude: 30.2830,
    longitude: -81.5180,
    hours: { mon_fri: '8am-5pm' },
    accepts_mly: false,
    accessibility: ['wheelchair_accessible', 'free_wifi', 'veteran_priority'],
  },
  {
    name: 'Habitat for Humanity of Jacksonville',
    category: 'housing',
    description: 'Affordable homeownership programs, critical home repair, and neighborhood revitalization. Serves families at 30-80% AMI.',
    address: '2404 Hubbard St, Jacksonville, FL 32206',
    phone: '(904) 798-4529',
    url: 'https://habijax.com',
    latitude: 30.3530,
    longitude: -81.6480,
    hours: { mon_fri: '8am-5pm', restore: '9am-5pm' },
    accepts_mly: false,
    accessibility: ['wheelchair_accessible', 'application_required'],
  },
  {
    name: 'Episcopal Children\'s Services — Head Start',
    category: 'childcare',
    description: 'Free preschool and childcare for income-eligible families. Full-day programs for children ages 0-5 at multiple locations.',
    address: '8443 Baymeadows Rd, Jacksonville, FL 32256',
    phone: '(904) 726-1500',
    url: 'https://ecs4kids.org',
    latitude: 30.2420,
    longitude: -81.5810,
    hours: { mon_fri: '7:30am-5:30pm year-round' },
    accepts_mly: false,
    accessibility: ['wheelchair_accessible', 'bus_route', 'income_eligible'],
  },
  {
    name: 'Goodwill of North Florida',
    category: 'clothing',
    description: 'Affordable clothing and household goods. Job training and employment services. Voucher program for emergency clothing needs.',
    address: '4527 Lenox Ave, Jacksonville, FL 32205',
    phone: '(904) 384-1361',
    url: 'https://goodwilljax.org',
    latitude: 30.3080,
    longitude: -81.7120,
    hours: { mon_sat: '9am-8pm', sun: '10am-6pm' },
    accepts_mly: false,
    accessibility: ['wheelchair_accessible', 'donation_accepted'],
  },
  {
    name: 'United Way 211 Northeast Florida',
    category: 'financial',
    description: 'Dial 211 for referrals to local services: rent/utility assistance, food, healthcare, childcare, disaster relief, and more.',
    address: 'Phone-based service',
    phone: '211',
    url: 'https://211nefl.org',
    latitude: 30.3322,
    longitude: -81.6557,
    hours: { phone: '24/7', online: '24/7' },
    accepts_mly: false,
    accessibility: ['phone_accessible', 'multilingual', 'text_211'],
  },
];

// ═══════════════════════════════════════════════════════════════
// WIKI PAGES — Jacksonville knowledge base
// ═══════════════════════════════════════════════════════════════
const wikiPages = [
  {
    slug: 'jacksonville-neighborhoods',
    title: 'Jacksonville Neighborhoods',
    category: 'community',
    body: `# Jacksonville Neighborhoods

Jacksonville is the largest city by land area in the contiguous United States, spanning 875 square miles with distinct neighborhoods, each carrying its own identity.

## Historic Neighborhoods

### Durkeeville
One of Jacksonville's oldest African American communities, established in the early 1900s. Home to historic churches, the Raines High School legacy, and generations of working families who built this city.

### Springfield
Historic district north of downtown with Victorian architecture, community gardens, and growing small business presence. The Springfield Improvement Association is one of the oldest neighborhood groups in the city.

### Riverside/Avondale
Arts district along the St. Johns River. Local shops on King Street, Five Points entertainment district, Memorial Park, and Cummer Museum.

### LaVilla
Jacksonville's original African American cultural center. Birthplace of Florida's jazz and blues scene. The Ritz Theatre & Museum preserves this history.

## The Northside
Arlington, Talleyrand, Eastside, and Brentwood. Working-class neighborhoods with strong community bonds. Underserved by city investment — exactly where MiLyfe starts.

## The Westside
Argyle, Marietta, Cedar Hills, Ortega. Suburban growth meeting historic communities. JTA bus routes connect to downtown.

## The Beaches
Jacksonville Beach, Neptune Beach, Atlantic Beach, Ponte Vedra. Beach communities with their own municipal governments but share Duval County services.

## Key Facts
- **Population:** ~1 million (Duval County)
- **Area:** 875 sq mi (largest in contiguous US)
- **Consolidated government** since 1968 (city + county merged)
- **6 City Council districts** + 5 at-large seats
- **Mayor:** Strong mayor form of government`,
  },
  {
    slug: 'know-your-rights-florida',
    title: 'Know Your Rights — Florida',
    category: 'rights',
    body: `# Know Your Rights — Florida

## During a Police Stop

### Traffic Stop
1. Pull over safely and turn off engine
2. Keep hands visible (on steering wheel)
3. You must provide: license, registration, insurance
4. You do NOT have to consent to a search
5. You can say: "I do not consent to a search"
6. You can record the interaction (Florida is a two-party consent state for AUDIO, but video in public is legal)

### On Foot
1. You can ask: "Am I free to go?"
2. If yes — walk away calmly
3. If detained: "I wish to remain silent. I want a lawyer."
4. You must provide your name if asked (Florida Stop & Identify)
5. You do NOT have to show ID unless driving or under lawful arrest

### If Arrested
1. Say clearly: "I am invoking my right to remain silent"
2. Say clearly: "I want a lawyer"
3. Do not resist physically — even if the arrest feels wrong
4. Remember badge numbers and officer names
5. You have the right to a phone call

## Tenant Rights in Florida
- **Security deposit** must be returned within 15-60 days of move-out
- **3-day notice** required before eviction for non-payment
- **Landlord must maintain** habitable conditions (FL Statute 83.51)
- **No retaliation** — landlord cannot evict you for reporting code violations
- **Rent cannot be raised** during a lease term without written agreement

## Voting Rights (Florida)
- Amendment 4 (2018): Restored voting rights for most people with felony convictions after completing sentence
- **Exceptions:** Murder and felony sexual offenses
- **How to register:** Online at registertovoteflorida.gov or any tax collector office
- **Early voting:** Starts 10 days before election day

## Workers' Rights
- Florida minimum wage: $13.00/hr (2024), increasing $1/year until $15
- No state income tax
- Workers' comp required for employers with 4+ employees
- Right to a safe workplace (OSHA applies)
- Wage theft is a crime in Florida (can report to state attorney)`,
  },
  {
    slug: 'milyfe-constitution',
    title: 'The MiLyfe Constitution',
    category: 'governance',
    body: `# The MiLyfe Constitution

## Preamble

We, the members of MiLyfe, establish this constitution to govern ourselves as equals. No person holds permanent power. No algorithm operates in secret. No decision excludes the people it affects.

## Article I — Membership

1. Any person may join. No background check. No credit check. No government ID required.
2. Membership is free. Always. If it costs money, it isn't MiLyfe.
3. Members govern themselves through direct democracy.
4. One person, one vote. No exceptions.

## Article II — Economy ($MLY)

1. Every active member receives weekly Universal Basic Income in $MLY credits.
2. $MLY cannot be converted to USD. It circulates within the community.
3. Hoarded $MLY decays. Circulating $MLY is healthy.
4. The community sets UBI amounts, decay rates, and economic parameters through governance.

## Article III — Governance

1. Any member may propose anything.
2. Proposals require quorum to pass (minimum 10% of active members vote).
3. Simple majority wins. Constitutional amendments require 2/3 majority.
4. Every proposal has a sunset date. Nothing is permanent.
5. Delegation: you may delegate your vote to a trusted member. Revocable at any time.

## Article IV — Standing

1. Standing is earned through action, not money or popularity.
2. 8 facets: Neighbor, Carer, Maker, Teacher, Keeper, Voice, Shop, Helper.
3. Standing decays without continued action.
4. Higher standing unlocks responsibilities, not privileges.
5. Criminal history does not affect starting standing. Your past is not your level.

## Article V — Rights

1. Free speech within community guidelines (no hate, no harassment, no threats).
2. Privacy by default. You choose what to share.
3. Right to be forgotten. You can delete everything and leave.
4. Right to appeal any enforcement action.
5. Right to fork. The code is open source. Anyone can run their own instance.

## Article VI — No Permanent Power

1. No founder keys. No admin backdoors. No special access.
2. Moderators are elected and can be recalled.
3. No person holds any role for more than 12 months without re-election.
4. The constitution itself can be amended by the community.

## Article VII — Safety (Non-Negotiable)

1. Child safety protections cannot be voted off.
2. DV/trafficking safety features cannot be disabled by anyone other than the user.
3. Crisis resources are always available, regardless of standing or account status.
4. No surveillance. Safety through presence, not cameras.`,
  },
  {
    slug: 'how-mly-works',
    title: 'How $MLY Credits Work',
    category: 'economy',
    body: `# How $MLY Credits Work

## What Is $MLY?

$MLY (pronounced "molly") is the community credit that circulates within MiLyfe. It is NOT cryptocurrency. It is NOT convertible to dollars. It is a tool for community exchange.

## How You Earn $MLY

| Source | Amount | Frequency |
|--------|--------|-----------|
| Universal Basic Income | $100 MLY | Weekly (every Saturday) |
| Completing quests | $5-50 MLY | Per quest |
| Teaching a course | $25 MLY | Per completion by a student |
| Selling on the marketplace | Variable | Per sale |
| Guild participation | $10 MLY | Per shift |
| Receiving "thanks" from members | Variable | When someone thanks you |

## Three Pots

Your $MLY is split into three pots:
1. **Spending** (70%) — Use freely at shops, marketplace, send to people
2. **Savings** (20%) — Locked for goals. Earns 1% monthly community interest.
3. **Community** (10%) — Goes to the community pot. Funds proposals.

## Decay

$MLY that sits unused loses 2% per week. This prevents hoarding and encourages circulation. Savings pot is exempt from decay.

## Why This Works

- Credits circulate locally → local economy grows
- Everyone has purchasing power → businesses get customers
- Community pot fills → real improvements get funded
- No billionaires → no concentration of power
- Transparent → everyone sees the treasury`,
  },
  {
    slug: 'city-budget-explainer',
    title: 'Jacksonville City Budget — Plain Language',
    category: 'civic',
    body: `# Jacksonville's Budget — In Plain Language

## The Numbers (FY2025)

Jacksonville's total budget is approximately **$5.3 billion**.

### Where It Goes (approximate)

| Category | Amount | % |
|----------|--------|---|
| Public Safety (JSO, Fire, Corrections) | ~$1.1B | ~52% of general fund |
| Infrastructure (roads, water, sewer) | ~$800M | Capital improvement |
| Debt Service (paying back bonds) | ~$500M | Interest + principal |
| General Government | ~$400M | Admin, courts, elections |
| Parks & Recreation | ~$150M | Parks, libraries, community centers |
| Public Health & Human Services | ~$80M | ~3-4% of general fund |
| Everything Else | Remainder | JEA, JPA, independent authorities |

## The Problem

The city spends **52% of its general fund reacting to human failure** (police, fire, corrections, courts) and only **3-4% preventing it** (public health, human services, early intervention).

This is the most expensive possible approach to human development.

## What MiLyfe Demonstrates

MiLyfe built prevention infrastructure — the platform that makes being a good neighbor pay more than being a bad one — for **$0**:
- UBI keeps people stable (prevents crisis)
- Resources connect people to help BEFORE emergency
- Community safety through presence (not surveillance)
- Education that's free and accessible (builds capability)
- Voice system means people are heard (prevents frustration → violence)

## Key Questions for Candidates

1. What is the per-resident cost of JSO vs. the per-resident investment in prevention?
2. What is the city's unfunded pension liability? (Hint: it's large)
3. How much does the JEA contribute to the general fund annually?
4. What happened to the $100M Better Jacksonville Plan money for the Northside?
5. Why does the city spend more on jail beds than hospital beds?`,
  },
];

// ═══════════════════════════════════════════════════════════════
// GOVERNANCE PROPOSALS — Example proposals
// ═══════════════════════════════════════════════════════════════
const proposals = [
  {
    title: 'Community Garden at Hogan\'s Creek Park',
    body: `## Proposal

Establish a community garden on the unused 0.5-acre lot adjacent to Hogan's Creek Park in Springfield. Members would maintain raised beds, share harvests, and offer gardening workshops.

## Budget Request

- $500 MLY for initial raised bed materials
- $200 MLY for seeds and tools (from community pot)
- $0 ongoing (maintained by volunteers earning quest $MLY)

## Success Criteria

- 10+ active gardeners within 3 months
- First harvest shared at a community meal
- Monthly gardening workshop (earns Teaching standing)

## Sunset Date

12 months. If fewer than 5 active gardeners at review, resources return to community pot.`,
    category: 'treasury',
    status: 'active',
    quorum_required: 10,
    opens_at: new Date().toISOString(),
    closes_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Add Spanish Language Support to All MiLearn Courses',
    body: `## Proposal

Translate all 25 MiLearn courses (125 modules) into Spanish. Jacksonville has 100,000+ Spanish-speaking residents who deserve access to the same resources.

## Approach

- Community members fluent in Spanish volunteer as translators (earn Maker standing + $MLY)
- AI-assisted first draft, human-reviewed for accuracy and cultural context
- Audio narration for each module (recorded by community members)

## Budget Request

- $25 MLY per module translated and reviewed (125 modules × $25 = $3,125 MLY total)
- Funded from community pot over 6 months

## Success Criteria

- All 125 modules available in Spanish within 6 months
- At least 50 Spanish-speaking members actively using MiLearn

## Sunset Date

6 months for completion. Ongoing maintenance by community.`,
    category: 'policy',
    status: 'active',
    quorum_required: 10,
    opens_at: new Date().toISOString(),
    closes_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Shade Structures at Northside Bus Stops',
    body: `## Proposal

Fund shade structures at the 5 busiest Northside bus stops where residents wait in 95°F heat without cover. These stops serve essential workers commuting downtown.

## The Problem

Residents at these stops wait 15-30 minutes with no shade, no seating, and no shelter from rain. This is a basic dignity issue.

## Proposed Stops (by ridership)

1. Moncrief Rd & Myrtle Ave
2. 45th & Moncrief
3. Edgewood Ave & Lane Ave
4. Lem Turner & Soutel
5. Brentwood & 33rd

## Budget Request

This proposal requests $0 from the community pot. Instead, it requests that the MiLyfe community formally petition JTA to prioritize these 5 stops for their shelter program.

## Action

The community formally votes to send a petition (with member signatures) to JTA requesting shade structures at these locations. This demonstrates community governance in action.

## Sunset Date

3 months to deliver petition. 12 months to track JTA response.`,
    category: 'general',
    status: 'active',
    quorum_required: 10,
    opens_at: new Date().toISOString(),
    closes_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ═══════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════
async function seed() {
  console.log('🌱 Seeding Jacksonville content...\n');

  // 1. Community Resources
  console.log('📍 Seeding community resources...');
  const { data: resData, error: resErr } = await supabase
    .from('community_resources')
    .upsert(resources, { onConflict: 'name' })
    .select('id');
  if (resErr) console.error('  ❌ Resources error:', resErr.message);
  else console.log(`  ✅ ${resData?.length || 0} resources seeded`);

  // 2. Wiki Pages
  console.log('📖 Seeding wiki pages...');
  for (const page of wikiPages) {
    const { error } = await supabase
      .from('wiki_pages')
      .upsert({
        ...page,
        author_id: SYSTEM_USER_ID,
        last_editor_id: SYSTEM_USER_ID,
        published: true,
      }, { onConflict: 'slug' });
    if (error) console.error(`  ❌ Wiki "${page.slug}":`, error.message);
    else console.log(`  ✅ Wiki: ${page.title}`);
  }

  // 3. Governance Proposals
  console.log('🗳️  Seeding governance proposals...');
  for (const proposal of proposals) {
    const { error } = await supabase
      .from('proposals')
      .insert({
        ...proposal,
        author_id: SYSTEM_USER_ID,
      });
    if (error) {
      if (error.message.includes('duplicate')) {
        console.log(`  ⏭️  Proposal "${proposal.title}" already exists`);
      } else {
        console.error(`  ❌ Proposal "${proposal.title}":`, error.message);
      }
    } else {
      console.log(`  ✅ Proposal: ${proposal.title}`);
    }
  }

  console.log('\n🎉 Jacksonville seed complete!');
}

seed().catch(console.error);

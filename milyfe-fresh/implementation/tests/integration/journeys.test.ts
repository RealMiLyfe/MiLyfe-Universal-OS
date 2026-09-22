import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MiEvent } from '@/contracts';
import { __resetBusForTests, db, subscribe, type EventRecord } from '@/kernel';
import type { Grant } from '@/kernel/scope';
import { assertGovAuthorization } from '@/finance/bridges';
import { Ledger, fundTreasuryBook, openTreasuryBook, spendTreasuryBook } from '@/finance/mimoney';
import { approveMerchant, createCustomer, createMerchant, leaveReview, moveOrder, placeOrder, publishListing, settleOrder } from '@/finance/mimarket';
import { claimPayout, closeOpportunity, draftAgreement, logContribution, matchCredential, moveClaim, postOpportunity, signAgreement, verifyContribution } from '@/finance/miwork';
import { careSupportToMoney, eduCredentialToWork } from '@/finance/bridges';
import { castVote, openProposal, tally } from '@/governance/proposals';
import { grantDelegation, resolveDelegate } from '@/governance/delegations';
import { approvePlan, addHelper, bookRespite, checkIn, closeEscalation, draftPlan, markBooking, raiseEscalation } from '@/lifestyle/micare';
import { moveCase, openCase, orderRemedy } from '@/governance/miresolve';
import { emergencyAccess, grantSlice, openHealthConsent, readSlices, revokeSlice, setEmergencyCard } from '@/lifestyle/mihealth';
import { answerComplaint, claimSurplus, createPlace, fileComplaint, postSurplus } from '@/lifestyle/miplace';
import type { Caller as LCaller } from '@/lifestyle/shared';
import type { Caller as FCaller } from '@/finance/shared';
import { enroll, issueCredential, publishPath, draftPath, recordMilestone, startProgress, verifyCredential } from '@/lifestyle/mieducation';
import { draftOffering, moveVenture, onboardNode, publishOffering, startVenture, verifyNode } from '@/finance/miforge';
import { forgeVentureToOffer } from '@/finance/bridges';
import { offerFromVenture, retireListing } from '@/finance/mimarket';
import { checkEnable, placeHold, releaseHold } from '@/governance/milegal';
import { anchorEvidence, captureEvidence, checkReentryItem, consentPeace, openReentryPack, openRightsCase, proposePeace, settlePeace } from '@/governance/mijustice';
import { emptyRegistry, registerDevice } from '@/trunk/midevice';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const NOW = '2026-06-01T00:00:00Z';
const LATER = '2027-01-01T00:00:00Z';

let busEvents: EventRecord[] = [];
let unsubs: Array<() => void> = [];

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
  unsubs.push(subscribe('*', (e) => { busEvents.push(e); }));
});

afterEach(() => {
  unsubs.forEach((u) => u());
  unsubs = [];
});

function lg(n: string): LCaller { return { did: tdid(n), kind: 'human' }; }
function fg(n: string): FCaller { return { did: tdid(n), kind: 'human' }; }

describe('cross-branch journeys (all 12 OSes, bus + receipts)', () => {
  it('J1 learn → credential → work → verified pay → settled MLY', async () => {
    const learner = lg('learner');
    const path = publishPath(draftPath('path-1', learner, 'First aid', ['basics']), learner, { by: learner.did, at: NOW, reason: 'reviewed' });
    enroll('e1', learner, path, learner.did, false);
    let progress = startProgress(learner.did, path.id, NOW);
    progress = recordMilestone(progress, learner, 'basics', NOW);
    const authority = { issuer: 'street-school', authorizedBy: learner.did, scopes: ['first-aid'], at: NOW };
    const { credential } = issueCredential('cred-1', learner, learner.did, 'first-aid', 'ev-1', authority, 'sig-1');
    expect(verifyCredential(credential, [], ['street-school']).valid).toBe(true);

    const poster = fg('shop');
    const opp = postOpportunity('op-1', poster, 'gig', 'First-aid cover', '200', ['first-aid']);
    await eduCredentialToWork(poster, 'cred-1', 'street-school', 'op-1', 'cell-a', true);
    expect(matchCredential(opp, 'cred-1', 'street-school', ['first-aid']).match).toBe(true);

    const worker = fg('learner');
    const reg = registerDevice(emptyRegistry(), worker.did, 'phone-1', 'phone', NOW);
    let agreement = draftAgreement('a1', poster, opp, worker.did, 'contractor', 'saturday', 'kit provided', false, 'gig');
    agreement = signAgreement(signAgreement(agreement, poster), worker);
    const contrib = verifyContribution(
      logContribution('c1', worker, reg, agreement, 'delivery', 'covered the fair', '8', 'phone-1'), poster, { by: poster.did, at: NOW, reason: 'saw the work' },
    );
    const claim = claimPayout('pay-1', worker, contrib, '200', 'photo-set');
    const verified = moveClaim(claim, 'verified', poster);
    expect(moveClaim(verified, 'settled', poster).state).toBe('settled');

    const ledger = new Ledger();
    await ledger.mint(tdid('shoptreasury'), '1000', poster, { by: poster.did, at: NOW, reason: 'payroll' }, 'budget-pay', NOW);
    ledger.post(poster, { key: 'wage-1', from: tdid('shoptreasury'), to: worker.did, amountMinor: '200' }, NOW);
    await ledger.settle('wage-1', poster, { by: poster.did, at: NOW, reason: 'verified work' }, NOW);
    expect(ledger.balance(worker.did)).toBe('200');
    expect(ledger.reconcile().ok).toBe(true);
    expect(closeOpportunity(opp, poster, true).state).toBe('filled');
  });

  it('J2 care plan → respite → check-in → escalation → approved reward', async () => {
    const coord = lg('coord');
    const receiver = tdid('elder');
    const grants: Grant[] = [{
      id: crypto.randomUUID(), issuer: receiver, subject: coord.did, target: 'care:plan',
      purpose: 'care', scope: ['plan-draft', 'helper-add'], expires: LATER, approval: 'receiver-ok',
    }];
    let plan = approvePlan(draftPlan(grants, coord, 'plan-1', receiver, ['meals', 'rides'], 'mornings', NOW), coord, { by: coord.did, at: NOW, reason: 'family agreed' });
    plan = addHelper(plan, grants, coord, tdid('aide'), 'aide', NOW);
    const booking = markBooking(bookRespite('b1', coord, plan, tdid('aide'), 'saturday', 4), 'done');
    expect(booking.state).toBe('done');
    expect((await checkIn('ci-1', coord, plan, 'cell-a', NOW, true)).queued).toBe(false);
    const esc = raiseEscalation('e1', coord, plan, 'missed friday visit', 'urgent');
    expect(closeEscalation(esc, coord, { by: coord.did, at: NOW, reason: 'aide replaced, visits resumed' }).state).toBe('resolved');
    const bridge = await careSupportToMoney(fg('coord'), 'plan-1', tdid('aide'), { by: fg('coord').did, at: NOW, reason: 'month of good care' }, 'cell-a', true);
    expect(bridge.receipt.os).toBe('MiMoney');
  });

  it('J3 street → market → order → settlement → review', async () => {
    const keeper = lg('keeper');
    const place = createPlace('place-1', keeper, 'Riverside', 'be kind', 'standard', ['en']);
    expect(place.childPolicy).toBe('standard');
    const pin = postSurplus('s1', keeper, place.id, 'bread', '10 loaves', 'today 6pm');
    expect((await claimSurplus(pin, lg('neighbor'), 'cell-a', true)).pin.state).toBe('claimed');

    const seller = fg('baker');
    const merchant = approveMerchant(createMerchant('m1', seller, 'Corner Bakery', 'fresh daily'), seller, { by: seller.did, at: NOW, reason: 'docs checked' });
    const listing = publishListing('l1', seller, merchant, 'goods', 'Loaf', '5', 'fresh', NOW);
    const buyer = fg('buyer');
    const customer = createCustomer('c1', buyer, 'buyer-jo');
    let order = placeOrder('o1', buyer, customer, listing, NOW);
    for (const s of ['accepted', 'in-progress', 'delivered'] as const) order = moveOrder(order, s, 'ok', NOW);
    const settled = await settleOrder(order, buyer, 'cell-a', true);
    expect(settled.order.state).toBe('complete');

    const ledger = new Ledger();
    await ledger.mint(buyer.did, '100', buyer, { by: buyer.did, at: NOW, reason: 'drill funds' }, 'budget-drill', NOW);
    ledger.post(buyer, { key: 'order-o1', from: buyer.did, to: seller.did, amountMinor: '5', orderRef: 'o1' }, NOW);
    await ledger.settle('order-o1', buyer, { by: buyer.did, at: NOW, reason: 'got the bread' }, NOW);
    expect(leaveReview('r1', buyer, settled.order, 5, 'great bread').stars).toBe(5);
    expect(ledger.reconcile().ok).toBe(true);
  });

  it('J4 vote → delegation → governance authorization → scoped treasury spend', () => {
    const voters = Array.from({ length: 12 }, (_, i) => tdid(`voter${String(i).padStart(2, '0')}`));
    let proposal = openProposal('p1', 'Fix the park', 'standard', '2026-07-01T00:00:00Z');
    voters.forEach((v, i) => { proposal = castVote(proposal, v, i < 9 ? 'yes' : 'no', NOW).proposal; });
    expect(tally(proposal).state).toBe('passed');

    let book = grantDelegation([], voters[0], voters[1], 'treasury', LATER);
    expect(resolveDelegate(book, voters[0], 'treasury', NOW)).toBe(voters[1]);
    book = grantDelegation(book, voters[1], voters[2], 'treasury', LATER);
    expect(resolveDelegate(book, voters[0], 'treasury', NOW)).toBe(voters[2]);

    const auth = { receiptId: 'gov-vote-p1', scope: ['treasury.spend'], expires: LATER };
    expect(assertGovAuthorization('treasury.spend', auth, NOW)).toBe('gov-vote-p1');
    const spender = fg('treasurer');
    let treasury = fundTreasuryBook(openTreasuryBook('1000'), '1000');
    treasury = spendTreasuryBook(treasury, '100', spender, { by: spender.did, at: NOW, reason: 'park fix, vote p1' }, NOW).book;
    expect(treasury.paidMinor).toBe('100');
  });

  it('J5 complaint → dispute → fix-it room → remedy → ledger correction', async () => {
    const seller = fg('seller');
    const buyer = fg('buyer2');
    const merchant = approveMerchant(createMerchant('m1', seller, 'Shop', 'terms'), seller, { by: seller.did, at: NOW, reason: 'ok' });
    const listing = publishListing('l1', seller, merchant, 'goods', 'Pot', '50', 'no cracks', NOW);
    const customer = createCustomer('c1', buyer, 'buyer2');
    let order = placeOrder('o1', buyer, customer, listing, NOW);
    for (const s of ['accepted', 'in-progress', 'delivered'] as const) order = moveOrder(order, s, 'ok', NOW);

    const ledger = new Ledger();
    await ledger.mint(buyer.did, '100', buyer, { by: buyer.did, at: NOW, reason: 'drill' }, 'budget-d', NOW);
    ledger.post(buyer, { key: 'pay-o1', from: buyer.did, to: seller.did, amountMinor: '50', orderRef: 'o1' }, NOW);
    await ledger.settle('pay-o1', buyer, { by: buyer.did, at: NOW, reason: 'paid' }, NOW);

    let kase = openCase('case-1', 'marketplace', buyer.did, seller.did, 'arrived cracked', NOW);
    kase = moveCase(kase, 'notice-sent', 'seller told', NOW);
    kase = moveCase(kase, 'hearing', 'panel met', NOW);
    kase = moveCase(kase, 'decided', 'refund owed', NOW);
    kase = orderRemedy(kase, 'refund', '50 MLY to buyer', NOW);
    expect(kase.state).toBe('remedy');
    ledger.dispute('pay-o1', seller, 'case-1 remedy', NOW);
    const refund = await ledger.refund('refund-pay-o1', 'pay-o1', seller, { by: seller.did, at: NOW, reason: 'case-1 remedy' }, NOW);
    expect(refund.state).toBe('settled');
    expect(ledger.balance(buyer.did)).toBe('100');
    expect(ledger.reconcile().ok).toBe(true);
  });

  it('J6 health consent → read → revoke → emergency path', () => {
    const member = lg('member');
    let book = grantSlice(openHealthConsent(member.did), member.did, 'clinic-a', ['allergies'], LATER);
    const records = { allergies: 'peanuts', meds: 'inhaler' };
    expect(readSlices(book, 'clinic-a', records, 'g1', NOW).slices).toEqual({ allergies: 'peanuts' });
    book = revokeSlice(book, member.did, 'clinic-a');
    expect(readSlices(book, 'clinic-a', records, 'g1', NOW).slices).toEqual({});
    const card = setEmergencyCard(member, { allergies: 'peanuts' });
    expect(emergencyAccess(card, lg('responder'), 'found collapsed', NOW).needsReview).toBe(true);
  });

  it('J7 shop complaint answered late shows a standing note', () => {
    const r = answerComplaint(fileComplaint('c1', lg('buyer'), 'shop-1', 'overcharged', NOW), '2026-07-01T00:00:00Z');
    expect(r.standingNote).toBe('does not answer on time');
  });

  it('J8 forge venture → offering → market offer → listing → retire', async () => {
    const founder = fg('founder');
    const approval = { by: founder.did, at: NOW, reason: 'launching' };
    let venture = moveVenture(startVenture('v1', founder, 'Bread cart', NOW), founder, 'offer', 'menu ready', NOW);
    venture = onboardNode(venture, founder, { id: 'n1', kind: 'shop', owner: founder.did });
    venture = verifyNode(venture, founder, 'n1', approval);
    const offering = publishOffering(draftOffering('of-1', founder, venture, 'n1', 'product', 'Loaf', '5', 'fresh daily'), founder, venture);
    expect(offering.state).toBe('published');
    const bridge = await forgeVentureToOffer(founder, venture.id, offering.id, 'cell-a', true);
    expect(bridge.bus.mode).toBe('published');
    const merchant = approveMerchant(createMerchant('m1', founder, 'Bread cart', 'fresh daily'), founder, approval);
    const listing = offerFromVenture('l1', founder, merchant, venture.id, 'Bread subscription', '40', NOW);
    expect(retireListing(listing, founder, merchant).state).toBe('retired');
  });
  it('J9 legal check + hold lifecycle + rights case + peace term + reentry', () => {
    const profiles = [{ jurisdiction: 'US-FL', capability: 'mimarket-sell', allowed: true, ceiling: 2, freshAsOf: '2026-05-01T00:00:00Z' }];
    expect(checkEnable(profiles, 'mimarket-sell', 1, true, NOW).allowed).toBe(true);
    let holds = placeHold([], { id: 'h1', scope: 'doc-1', reason: 'review', placedBy: 'steward', placedAt: NOW, expiresAt: LATER });
    holds = releaseHold(holds, 'h1', NOW);
    expect(holds[0].releasedAt).toBe(NOW);
    const kase = openRightsCase('rc-1', tdid('member'), 'milyfe', 'ban appeal denied', true, NOW);
    expect(kase.sealed).toBe(true);
    const anchored = anchorEvidence(captureEvidence('ev-1', kase.id, 'sha256:abc', NOW), NOW);
    expect(anchored.anchoredAt).toBe(NOW);
    let term = consentPeace(consentPeace(proposePeace('pt-1', 'a', 'b', '500'), 'a', NOW), 'b', NOW);
    expect(term.state).toBe('holding');
    expect(settlePeace(term, true).state).toBe('kept');
    let pack = checkReentryItem(checkReentryItem(openReentryPack(tdid('returning')), 'id-help'), 'job-board');
    expect(pack.done).toHaveLength(2);
    term = proposePeace('pt-x', 'a', 'b', '10');
    void term;
  });
  it('J10 every journey event validates against the frozen MiEvent contract', () => {
    expect(busEvents.length).toBeGreaterThan(0);
    for (const e of busEvents) {
      expect(MiEvent.safeParse(e).success).toBe(true);
    }
    const fams = new Set(busEvents.map((e) => e.family));
    for (const fam of ['care', 'work', 'money', 'place', 'market']) {
      expect(fams.has(fam)).toBe(true);
    }
  });
});

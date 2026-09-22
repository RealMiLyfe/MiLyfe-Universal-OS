'use client';
import { useState } from 'react';
import { Btn, Card, NOW, Out, approval, human, tdid } from './kit';
import { Ledger } from '@/finance/mimoney';
import { draftOffering, earnedIncome, markDelivered, moveRevenue, moveVenture, onboardNode, publishOffering, recognizeRevenue, startVenture, trackRevenue, verifyNode } from '@/finance/miforge';
import { approveMerchant, createCustomer, createMerchant, moveOrder, placeOrder, publishListing, settledGmv } from '@/finance/mimarket';
import { claimPayout, draftAgreement, logContribution, moveClaim, postOpportunity, signAgreement, verifyContribution } from '@/finance/miwork';
import { emptyRegistry, registerDevice } from '@/trunk/midevice';

export function ForgeDemo() {
  const me = human('founder');
  const [n, setN] = useState(0);
  let v = startVenture('v1', me, 'Bread cart', NOW);
  v = moveVenture(v, me, 'offer', 'menu ready', NOW);
  v = onboardNode(v, me, { id: 'n1', kind: 'shop', owner: me.did });
  v = verifyNode(v, me, 'n1', approval(me.did, 'docs checked'));
  const o = publishOffering(draftOffering('of-1', me, v, 'n1', 'product', 'Loaf', '5', 'fresh daily'), me, v);
  let rev = trackRevenue('r1', me, 'v1', '500', NOW);
  rev = moveRevenue(moveRevenue(moveRevenue(rev, 'pending'), 'verified'), 'settled');
  rev = markDelivered(rev, true);
  const lines = [
    `venture: idea → ${v.stage}, node verified, offering ${o.state}`,
    `revenue 500 MLY: projected → settled + accepted → RECOGNIZED: ${recognizeRevenue(rev, me, approval(me.did, 'books checked')).state}`,
    `earned income counts settled only: ${earnedIncome([rev, trackRevenue('r2', me, 'v1', '999999', NOW)])} MLY (the 999999 projection counts zero)`,
  ];
  return (
    <Card os="MiForge" title="Launch a bread cart">
      <Btn onClick={() => setN((s) => Math.min(s + 1, 2))} disabled={n >= 2}>Next step</Btn>
      <Out>{lines.slice(0, n + 1).join('\n')}</Out>
    </Card>
  );
}

export function MarketDemo() {
  const seller = human('baker');
  const buyer = human('buyer');
  const [n, setN] = useState(0);
  const merchant = approveMerchant(createMerchant('m1', seller, 'Corner Bakery', 'fresh daily'), seller, approval(seller.did, 'docs checked'));
  const listing = publishListing('l1', seller, merchant, 'goods', 'Loaf', '5', 'fresh', NOW);
  const customer = createCustomer('c1', buyer, 'buyer-jo');
  let o = placeOrder('o1', buyer, customer, listing, NOW);
  o = moveOrder(moveOrder(moveOrder(moveOrder(o, 'accepted', 'baking', NOW), 'in-progress', 'in oven', NOW), 'delivered', 'picked up', NOW), 'complete', 'done', NOW);
  const lines = [
    `merchant verified, listing live: ${listing.title} at ${listing.priceMinor} MLY`,
    `order walked placed → accepted → in-progress → delivered → ${o.state}`,
    `settled volume counts completions only: ${settledGmv([o])} MLY`,
  ];
  return (
    <Card os="MiMarket" title="Sell a loaf of bread">
      <Btn onClick={() => setN((s) => Math.min(s + 1, 2))} disabled={n >= 2}>Next step</Btn>
      <Out>{lines.slice(0, n + 1).join('\n')}</Out>
    </Card>
  );
}

export function MoneyDemo() {
  const alice = human('alice');
  const [out, setOut] = useState('Press run: mint 1000, send 40, settle, audit.');
  const run = async () => {
    const bob = tdid('bob');
    const ledger = new Ledger();
    const ap = approval(alice.did, 'demo');
    await ledger.mint(alice.did, '1000', alice, ap, 'demo-budget', NOW);
    ledger.post(alice, { key: 'demo-1', from: alice.did, to: bob, amountMinor: '40' }, NOW);
    await ledger.settle('demo-1', alice, ap, NOW);
    const rec = ledger.reconcile();
    setOut(`alice: ${ledger.balance(alice.did)} MLY\nbob: ${ledger.balance(bob)} MLY\naudit: ${rec.ok ? 'PASS' : 'FAIL'} (total ${rec.total} = issued ${rec.issued})`);
  };
  return (
    <Card os="MiMoney" title="Move money on the ledger">
      <Btn onClick={run}>Run</Btn>
      <Out>{out}</Out>
    </Card>
  );
}

export function WorkDemo() {
  const poster = human('shop');
  const worker = human('worker');
  const [n, setN] = useState(0);
  const opp = postOpportunity('op-1', poster, 'gig', 'Fix fence', '200', ['carpentry']);
  let a = draftAgreement('a1', poster, opp, worker.did, 'contractor', 'weekends', 'gloves provided', false, 'gig');
  a = signAgreement(signAgreement(a, poster), worker);
  const reg = registerDevice(emptyRegistry(), worker.did, 'phone-1', 'phone', NOW);
  const c = verifyContribution(logContribution('c1', worker, reg, a, 'delivery', 'fence fixed', '8', 'phone-1'), poster, approval(poster.did, 'saw it'));
  const claim = claimPayout('pay-1', worker, c, '200', 'photo-set');
  const paid = moveClaim(moveClaim(claim, 'verified', poster), 'settled', poster);
  const lines = [
    `agreement signed by both sides (${a.relationship}, review note attached)`,
    `work logged from a verified device + verified by a human`,
    `payout claimed with evidence → ${paid.state} at ${paid.amountMinor} MLY`,
  ];
  return (
    <Card os="MiWork" title="Get paid for real work">
      <Btn onClick={() => setN((s) => Math.min(s + 1, 2))} disabled={n >= 2}>Next step</Btn>
      <Out>{lines.slice(0, n + 1).join('\n')}</Out>
    </Card>
  );
}

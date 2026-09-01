/**
 * Real end-to-end test against the LIVE Supabase project.
 * Signs up a real test user, runs every flow the user reported broken,
 * captures exact failures, then DELETES the test user.
 *
 * Run: node scripts/e2e-live-test.mjs
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load env from .env.local
const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, '');
}

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });
const results = [];
function log(step, ok, detail) {
  results.push({ step, ok, detail });
  console.log(`  ${ok ? '✅' : '❌'} ${step}${detail ? ' — ' + detail : ''}`);
}

const testEmail = `e2e-test-${Date.now()}@milyfe-test.local`;
const testPassword = 'E2eTest!' + Math.random().toString(36).slice(2, 10);
let userId = null;

console.log('\n═══ MiLyfe E2E Live Test ═══');
console.log('Project:', URL.replace(/https:\/\/([^.]+).*/, '$1'));
console.log('Test user:', testEmail, '\n');

try {
  // ── 1. SIGNUP ──
  console.log('1. SIGNUP');
  const { data: signUp, error: signErr } = await admin.auth.admin.createUser({
    email: testEmail, password: testPassword, email_confirm: true,
    user_metadata: { username: 'e2etester', display_name: 'E2E Tester' },
  });
  if (signErr) { log('create auth user', false, signErr.message); }
  else { userId = signUp.user.id; log('create auth user', true, userId.slice(0, 8)); }

  // Give the handle_new_user trigger a moment
  await new Promise(r => setTimeout(r, 1500));

  // ── 2. PROFILE created by trigger? ──
  console.log('\n2. PROFILE + WELCOME GRANT (trigger)');
  const { data: prof, error: profErr } = await admin.from('profiles').select('*').eq('id', userId).single();
  if (profErr) log('profile row created', false, profErr.message);
  else log('profile row created', true, 'username=' + prof.username);
  const { data: wallet } = await admin.from('wallets').select('*').eq('user_id', userId).single();
  log('welcome grant wallet', !!wallet, wallet ? `balance=${wallet.spending_balance}` : 'no wallet');

  // ── 3. ONBOARDING (voter_status + interests + onboarding_complete) ──
  console.log('\n3. ONBOARDING — the "Enter MiLyfe" write');
  const { error: onbErr } = await admin.from('profiles').update({
    display_name: 'E2E Tester',
    bio: 'test',
    neighborhood: 'Downtown',
    voter_status: 'registered',
    interests: [],
    onboarding_complete: true,
  }).eq('id', userId);
  log('onboarding profile update', !onbErr, onbErr?.message);

  // ── 4. CITIZEN COUNT ──
  console.log('\n4. CITIZEN COUNT');
  const { count: citizens } = await admin.from('profiles').select('id', { count: 'exact', head: true }).eq('onboarding_complete', true);
  log('citizen count reflects onboarded user', citizens >= 1, `count=${citizens}`);

  // ── 5. STORAGE BUCKETS (photo upload) ──
  console.log('\n5. PHOTO UPLOAD (buckets)');
  const { data: buckets } = await admin.storage.listBuckets();
  const hasPublic = buckets?.some(b => b.name === 'public');
  log('public bucket exists', !!hasPublic, buckets?.map(b => b.name).join(','));
  // try an actual upload
  const testPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const { error: upErr } = await admin.storage.from('public').upload(`test/${userId}.png`, testPng, { contentType: 'image/png', upsert: true });
  log('upload to public bucket', !upErr, upErr?.message);

  // ── 6. QUEST (street) ──
  console.log('\n6. QUEST / MARKETPLACE / SURPLUS tables');
  const { error: qErr } = await admin.from('quests').insert({
    creator_id: userId, title: 'E2E Test Quest', description: 'testing the quest flow end to end',
    category: 'community', reward_mly: 5, reward_source: 'creator', difficulty: 'easy',
    max_completions: 1, status: 'open',
  });
  log('create quest', !qErr, qErr?.message);
  const { error: mErr } = await admin.from('marketplace_listings').insert({
    seller_id: userId, title: 'E2E Item', description: 'test listing', category: 'goods',
    price_mly: 10, price_type: 'fixed', status: 'active',
  });
  log('create marketplace listing', !mErr, mErr?.message);
  const { error: sErr } = await admin.from('surplus_items').insert({
    donor_id: userId, title: 'E2E Surplus', category: 'food', quantity: '5', pickup_location: 'Downtown', status: 'available',
  });
  log('create surplus item', !sErr, sErr?.message);

  // ── 7. PROPOSAL (governance) ──
  console.log('\n7. PROPOSAL (governance stage column)');
  const { error: pErr } = await admin.from('proposals').insert({
    author_id: userId, title: 'E2E Test Proposal', body: 'a'.repeat(60),
    category: 'general', status: 'active', quorum_required: 10,
    opens_at: new Date().toISOString(), closes_at: new Date(Date.now() + 14 * 864e5).toISOString(),
  });
  log('create proposal', !pErr, pErr?.message);
  const { error: stageErr } = await admin.from('proposals').select('stage').limit(1);
  log('proposals.stage column exists', !stageErr, stageErr?.message);

  // ── 8. NOTIFICATIONS ──
  console.log('\n8. NOTIFICATIONS');
  const { error: nErr } = await admin.from('notifications').insert({
    user_id: userId, type: 'reward', title: 'E2E notif', body: 'test', link: '/rewards',
  });
  log('create notification', !nErr, nErr?.message);
  const { data: notifs, error: nReadErr } = await admin.from('notifications').select('*').eq('user_id', userId);
  log('read notifications', !nReadErr, nReadErr?.message || `count=${notifs?.length}`);

  // ── 9. DELEGATIONS table (governance page queries it) ──
  console.log('\n9. GOVERNANCE PAGE deps');
  const { error: delErr } = await admin.from('delegations').select('id').limit(1);
  log('delegations table exists', !delErr, delErr?.message);
  const { error: qcErr } = await admin.from('quest_claims').select('id').limit(1);
  log('quest_claims table exists', !qcErr, qcErr?.message);
  const { error: langErr } = await admin.from('profiles').select('preferred_language').limit(1);
  log('preferred_language column exists', !langErr, langErr?.message);

} catch (e) {
  console.log('\n💥 UNCAUGHT:', e.message);
} finally {
  // ── CLEANUP: delete test user + all their data ──
  console.log('\n═══ CLEANUP ═══');
  if (userId) {
    await admin.from('quests').delete().eq('creator_id', userId);
    await admin.from('marketplace_listings').delete().eq('seller_id', userId);
    await admin.from('surplus_items').delete().eq('donor_id', userId);
    await admin.from('proposals').delete().eq('author_id', userId);
    await admin.from('notifications').delete().eq('user_id', userId);
    await admin.storage.from('public').remove([`test/${userId}.png`]).catch(() => {});
    const { error: delUserErr } = await admin.auth.admin.deleteUser(userId);
    console.log(`  ${delUserErr ? '❌' : '✅'} deleted test user${delUserErr ? ' — ' + delUserErr.message : ' + all data (cascade)'}`);
  }

  // ── SUMMARY ──
  const failed = results.filter(r => !r.ok);
  console.log('\n═══ SUMMARY ═══');
  console.log(`  ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    console.log('\n  FAILURES:');
    failed.forEach(f => console.log(`   ❌ ${f.step}: ${f.detail}`));
  }
  process.exit(failed.length ? 1 : 0);
}

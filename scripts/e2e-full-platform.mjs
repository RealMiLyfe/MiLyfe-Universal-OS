/**
 * FULL PLATFORM end-to-end test — every table, every core flow.
 * Hits the LIVE Supabase with a real test user, exercises the whole platform,
 * reports every failure, then deletes the test user + data.
 *
 * Run: node scripts/e2e-full-platform.mjs
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, '');
}
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const results = [];
const log = (step, ok, detail) => { results.push({ step, ok, detail }); console.log(`  ${ok ? '✅' : '❌'} ${step}${detail ? ' — ' + detail : ''}`); };

// ── Every table the platform uses (from schema) ──
const ALL_TABLES = [
  'profiles','wallets','transactions','standing','attestations','rewards',
  'community_treasury','proposals','votes','proposal_comments','delegations',
  'forum_spaces','forum_posts','forum_replies','wiki_pages',
  'health_checkins','health_resources','news_articles','connections','messages',
  'apps','notifications','learn_paths','learn_modules','learn_enrollments',
  'quests','quest_claims','marketplace_listings','surplus_items',
  'safety_contacts','safety_actions','safety_journal',
];

const testEmail = `e2e-${Date.now()}@milyfe-test.local`;
let userId = null, user2Id = null;

console.log('\n═══ FULL PLATFORM E2E — project', env.NEXT_PUBLIC_SUPABASE_URL.replace(/https:\/\/([^.]+).*/,'$1'), '═══\n');

try {
  // ═══ SECTION A: TABLE EXISTENCE (every table readable) ═══
  console.log('A. TABLE EXISTENCE');
  for (const t of ALL_TABLES) {
    const { error } = await admin.from(t).select('*').limit(1);
    log(`table ${t}`, !error, error?.message);
  }

  // ═══ SECTION B: AUTH + PROFILE ═══
  console.log('\nB. AUTH + ONBOARDING');
  const { data: su, error: suErr } = await admin.auth.admin.createUser({ email: testEmail, password: 'E2e!'+Math.random().toString(36).slice(2,10), email_confirm: true, user_metadata: { username: 'e2euser', display_name: 'E2E' }});
  if (suErr) { log('signup', false, suErr.message); throw new Error('cannot continue without user'); }
  userId = su.user.id; log('signup', true, userId.slice(0,8));
  await new Promise(r => setTimeout(r, 1500));
  const { data: prof, error: pe } = await admin.from('profiles').select('*').eq('id', userId).single();
  log('profile auto-created (trigger)', !pe && !!prof, pe?.message);
  const { data: w } = await admin.from('wallets').select('spending_balance').eq('user_id', userId).single();
  log('welcome grant 50 MLY', w?.spending_balance == 50, `balance=${w?.spending_balance}`);
  const { error: onbErr } = await admin.from('profiles').update({ display_name:'E2E', bio:'x', neighborhood:'Downtown', voter_status:'registered', interests:[], onboarding_complete:true }).eq('id', userId);
  log('onboarding complete write', !onbErr, onbErr?.message);
  const { count: citizens } = await admin.from('profiles').select('id',{count:'exact',head:true}).eq('onboarding_complete',true);
  log('citizen count > 0 after onboard', citizens>=1, `count=${citizens}`);

  // ═══ SECTION C: STORAGE ═══
  console.log('\nC. STORAGE / PHOTOS');
  const { data: buckets } = await admin.storage.listBuckets();
  log('storage buckets exist', buckets?.length>0, buckets?.map(b=>b.name).join(','));
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==','base64');
  const { error: upErr } = await admin.storage.from('public').upload(`test/${userId}.png`, png, { contentType:'image/png', upsert:true });
  log('photo upload works', !upErr, upErr?.message);

  // ═══ SECTION D: WALLET / ECONOMY ═══
  console.log('\nD. WALLET / ECONOMY');
  const { error: txErr } = await admin.from('transactions').insert({ from_user_id:null, to_user_id:userId, amount:10, type:'reward', pot:'spending', description:'e2e test' });
  log('transaction insert', !txErr, txErr?.message);
  const { data: treas } = await admin.from('community_treasury').select('balance,citizen_count').order('snapshot_at',{ascending:false}).limit(1).single();
  log('treasury readable', !!treas, treas?`$${Number(treas.balance).toLocaleString()}`:'none');

  // ═══ SECTION E: STREET (quests/market/surplus) ═══
  console.log('\nE. STREET');
  const { error: qErr } = await admin.from('quests').insert({ creator_id:userId, title:'E2E Quest', description:'testing quest end to end here', category:'community', reward_mly:5, reward_source:'creator', difficulty:'easy', max_completions:1, status:'open' });
  log('create quest (full schema)', !qErr, qErr?.message);
  const { error: mErr } = await admin.from('marketplace_listings').insert({ seller_id:userId, title:'E2E Item', description:'test', category:'goods', price_mly:10, price_type:'fixed', status:'active' });
  log('create marketplace listing', !mErr, mErr?.message);
  const { error: sErr } = await admin.from('surplus_items').insert({ donor_id:userId, title:'E2E Surplus', category:'food', quantity:'5', pickup_location:'Downtown', status:'available' });
  log('create surplus item', !sErr, sErr?.message);

  // ═══ SECTION F: GOVERNANCE ═══
  console.log('\nF. GOVERNANCE');
  const { data: standingRow } = await admin.from('standing').select('overall').eq('user_id', userId).single();
  log('standing row exists', !!standingRow, standingRow?`overall=${standingRow.overall}`:'none');
  const { data: propRow, error: propErr } = await admin.from('proposals').insert({ author_id:userId, title:'E2E Proposal', body:'x'.repeat(60), category:'general', status:'active', quorum_required:10, opens_at:new Date().toISOString(), closes_at:new Date(Date.now()+14*864e5).toISOString() }).select('id').single();
  log('create proposal', !propErr, propErr?.message);
  const { error: stageErr } = await admin.from('proposals').select('stage').limit(1);
  log('proposals.stage column', !stageErr, stageErr?.message);
  if (propRow) {
    const { error: voteErr } = await admin.from('votes').insert({ proposal_id:propRow.id, user_id:userId, direction:'for', weight:1 });
    log('cast vote', !voteErr, voteErr?.message);
    const { error: cmtErr } = await admin.from('proposal_comments').insert({ proposal_id:propRow.id, author_id:userId, body:'e2e comment' });
    log('proposal comment', !cmtErr, cmtErr?.message);
  }

  // ═══ SECTION G: SOCIAL (forum/connect/messages) ═══
  console.log('\nG. SOCIAL');
  const { data: space } = await admin.from('forum_spaces').select('id').limit(1).single();
  log('forum spaces seeded', !!space, space?'ok':'no spaces');
  if (space) {
    const { data: postRow, error: postErr } = await admin.from('forum_posts').insert({ space_id:space.id, author_id:userId, title:'E2E Post', body:'test post body' }).select('id').single();
    log('create forum post', !postErr, postErr?.message);
    if (postRow) { const { error: rErr } = await admin.from('forum_replies').insert({ post_id:postRow.id, author_id:userId, body:'e2e reply' }); log('forum reply', !rErr, rErr?.message); }
  }
  // second user for connections/messages
  const { data: su2 } = await admin.auth.admin.createUser({ email:`e2e2-${Date.now()}@milyfe-test.local`, password:'E2e!x9k2mQ', email_confirm:true, user_metadata:{ username:'e2euser2', display_name:'E2E2' }});
  user2Id = su2?.user?.id;
  if (user2Id) {
    await new Promise(r=>setTimeout(r,800));
    const { error: connErr } = await admin.from('connections').insert({ requester_id:userId, addressee_id:user2Id, status:'pending' });
    log('connection request', !connErr, connErr?.message);
    const { error: msgErr } = await admin.from('messages').insert({ sender_id:userId, receiver_id:user2Id, body:'e2e message' });
    log('send message', !msgErr, msgErr?.message);
  }

  // ═══ SECTION H: LEARN ═══
  console.log('\nH. LEARN');
  const { data: path } = await admin.from('learn_paths').select('id').limit(1).single();
  log('learn paths seeded', !!path, path?'ok':'none');
  const { data: mod } = await admin.from('learn_modules').select('id').limit(1).single();
  log('learn modules seeded', !!mod, mod?'ok':'none');

  // ═══ SECTION I: HEALTH + SAFETY ═══
  console.log('\nI. HEALTH + SAFETY');
  const { error: hcErr } = await admin.from('health_checkins').insert({ user_id:userId, mood:4, energy:3, sleep_hours:7, notes:'e2e' });
  log('health check-in', !hcErr, hcErr?.message);
  const { error: scErr } = await admin.from('safety_contacts').insert({ user_id:userId, contact_name:'Trusted', relationship:'trusted_person' });
  log('safety contact', !scErr, scErr?.message);

  // ═══ SECTION J: NOTIFICATIONS + REWARDS ═══
  console.log('\nJ. NOTIFICATIONS + REWARDS');
  const { error: nErr } = await admin.from('notifications').insert({ user_id:userId, type:'reward', title:'E2E', body:'test', link:'/rewards' });
  log('notification create', !nErr, nErr?.message);
  const { error: rwErr } = await admin.from('rewards').insert({ user_id:userId, type:'contribution', amount:25, title:'E2E Reward', description:'test', claimed:false });
  log('reward create', !rwErr, rwErr?.message);

} catch (e) {
  console.log('\n💥 UNCAUGHT:', e.message);
} finally {
  console.log('\n═══ CLEANUP ═══');
  // Map each table to the actual owner column(s) it has — delete child rows before parents.
  const CLEANUP = [
    ['votes', ['user_id']],
    ['proposal_comments', ['author_id']],
    ['proposals', ['author_id']],
    ['forum_replies', ['author_id']],
    ['forum_posts', ['author_id']],
    ['quest_claims', ['claimer_id']],
    ['quests', ['creator_id']],
    ['marketplace_listings', ['seller_id']],
    ['surplus_items', ['donor_id']],
    ['messages', ['sender_id', 'receiver_id']],
    ['connections', ['requester_id', 'addressee_id']],
    ['health_checkins', ['user_id']],
    ['safety_contacts', ['user_id']],
    ['safety_actions', ['user_id']],
    ['safety_journal', ['user_id']],
    ['notifications', ['user_id']],
    ['rewards', ['user_id']],
    ['transactions', ['from_user_id', 'to_user_id']],
    ['learn_enrollments', ['user_id']],
    ['learn_badges', ['user_id']],
    ['standing', ['user_id']],
    ['wallets', ['user_id']],
  ];
  async function safeDelete(table, col, uid) {
    try {
      const { error } = await admin.from(table).delete().eq(col, uid);
      if (error && !/does not exist|no rows/i.test(error.message)) {
        console.log(`     · ${table}.${col}: ${error.message}`);
      }
    } catch (e) { console.log(`     · ${table}.${col} threw: ${e.message}`); }
  }
  for (const uid of [userId, user2Id].filter(Boolean)) {
    for (const [table, cols] of CLEANUP) {
      for (const col of cols) await safeDelete(table, col, uid);
    }
    try { await admin.storage.from('public').remove([`test/${uid}.png`]); } catch {}
    try { await admin.from('profiles').delete().eq('id', uid); } catch {}
    const { error } = await admin.auth.admin.deleteUser(uid);
    console.log(`  ${error?'⚠️':'✅'} delete user ${uid.slice(0,8)}${error?' — '+error.message:''}`);
  }
  const failed = results.filter(r=>!r.ok);
  console.log(`\n═══ RESULT: ${results.length-failed.length}/${results.length} passed ═══`);
  if (failed.length) { console.log('\nFAILURES:'); failed.forEach(f=>console.log(`  ❌ ${f.step}: ${f.detail}`)); }
  process.exit(failed.length?1:0);
}

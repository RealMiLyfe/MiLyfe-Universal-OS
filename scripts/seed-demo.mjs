#!/usr/bin/env node
/**
 * MiLyfe — demo seed. Populates shop / community / learn / media with a little
 * content so every surface looks alive. Uses the service-role key via the
 * PostgREST REST API (no DDL — run AFTER supabase/APPLY_ALL.sql).
 *
 * Usage:  node scripts/seed-demo.mjs
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * Idempotent-ish: skips inserts that conflict.
 */
import { readFileSync } from 'node:fs';

function loadEnv() {
  const txt = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  const env = {};
  for (const line of txt.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv();
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_BASE || !KEY) { console.error('Missing Supabase env'); process.exit(1); }

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation,resolution=merge-duplicates',
};

async function get(path) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { headers });
  if (!res.ok) return null;
  return res.json();
}
async function insert(table, rows) {
  const res = await fetch(`${URL_BASE}/rest/v1/${table}`, {
    method: 'POST', headers, body: JSON.stringify(rows),
  });
  const body = await res.text();
  if (!res.ok) { console.warn(`  ! ${table}: ${res.status} ${body.slice(0, 120)}`); return null; }
  try { return JSON.parse(body); } catch { return null; }
}

async function main() {
  console.log('MiLyfe demo seed → ' + URL_BASE);

  // Need at least one profile to own demo content.
  const profiles = await get('profiles?select=id&limit=1');
  if (!profiles || profiles.length === 0) {
    console.error('No profiles exist yet. Sign up one account first, then re-run.');
    process.exit(1);
  }
  const owner = profiles[0].id;
  console.log('Using owner profile:', owner);

  // --- Shop: a vendor + products ---
  console.log('Seeding shop…');
  const vendor = await insert('shop_vendors', {
    owner_id: owner, slug: 'milyfe-market-demo', name: 'MiLyfe Market', section: 'goods', verified: true,
  });
  const vId = vendor?.[0]?.id ?? (await get('shop_vendors?slug=eq.milyfe-market-demo&select=id'))?.[0]?.id;
  if (vId) {
    await insert('shop_products', [
      { vendor_id: vId, title: 'Community Tote Bag', category: 'goods', price_mly: 40, status: 'active' },
      { vendor_id: vId, title: 'MiLyfe Hoodie', category: 'goods', price_mly: 120, status: 'active' },
      { vendor_id: vId, title: 'Sticker Pack', category: 'goods', price_mly: 10, status: 'active' },
    ]);
  }

  // --- Community: a group + an event + a blog post ---
  console.log('Seeding community…');
  await insert('groups', { owner_id: owner, slug: 'neighborhood-mutual-aid-demo', name: 'Neighborhood Mutual Aid', description: 'Neighbors helping neighbors.', privacy: 'public', member_count: 1 });
  await insert('events', { host_id: owner, title: 'Community Potluck', description: 'Bring a dish, meet your neighbors.', location_name: 'Community Center', starts_at: new Date(Date.now() + 7 * 864e5).toISOString() });
  await insert('blog_posts', { author_id: owner, slug: 'welcome-to-milyfe-demo', title: 'Welcome to MiLyfe', body: 'We built this together. Owned by the people, for the people.', published: true, published_at: new Date().toISOString() });

  // --- Learn: a quiz + questions ---
  console.log('Seeding learn…');
  const quiz = await insert('learn_quizzes', { title: 'Know Your Rights — Basics', passing_score: 60, max_attempts: 5 });
  const qId = quiz?.[0]?.id;
  if (qId) {
    await insert('learn_questions', [
      { quiz_id: qId, kind: 'mcq_single', prompt: 'Do you have to open the door for ICE without a judicial warrant?', options: [{ id: 'a', text: 'Yes' }, { id: 'b', text: 'No' }], correct: ['b'], points: 1, position: 0 },
      { quiz_id: qId, kind: 'mcq_single', prompt: 'You have the right to remain silent.', options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }], correct: ['a'], points: 1, position: 1 },
    ]);
  }

  // --- Media: channel + items (in case migration 026 owner was null) ---
  console.log('Seeding media…');
  const ch = await insert('media_channels', { owner_id: owner, slug: 'milyfe-radio-demo', name: 'MiLyfe Radio', verified: true });
  const chId = ch?.[0]?.id ?? (await get('media_channels?slug=eq.milyfe-radio-demo&select=id'))?.[0]?.id;
  if (chId) {
    await insert('media_items', [
      { channel_id: chId, uploader_id: owner, kind: 'audio', title: 'Sample Vibe', source_type: 'mp4', source_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration_seconds: 372, genres: ['Demo'], visibility: 'public', status: 'ready' },
      { channel_id: chId, uploader_id: owner, kind: 'video', title: 'Welcome to MiLyfe', source_type: 'youtube', source_url: 'aqz-KE-bpKQ', duration_seconds: 60, genres: ['Demo'], visibility: 'public', status: 'ready' },
    ]);
  }

  console.log('✅ Demo seed complete. Refresh /shop, /community, /learn, /media.');
}

main().catch((e) => { console.error(e); process.exit(1); });

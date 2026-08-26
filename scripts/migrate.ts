/**
 * MiLyfe Database Migration Script
 * Validates connection to Supabase and reports migration status.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const client = createClient(url, serviceKey);

async function main() {
  console.log('Connecting to Supabase at:', url);
  
  const tables = [
    'profiles', 'wallets', 'transactions', 'standing', 'attestations',
    'rewards', 'community_treasury', 'proposals', 'votes', 'forum_spaces',
    'forum_posts', 'forum_replies', 'wiki_pages', 'health_checkins',
    'health_resources', 'news_articles', 'connections', 'messages',
    'apps', 'notifications', 'learn_paths', 'learn_modules', 'quests',
    'safety_contacts'
  ];

  console.log('\n--- Checking Schema ---');
  let missing = 0;
  for (const t of tables) {
    const { error } = await client.from(t).select('id').limit(1);
    if (error) {
      console.log(`❌ Table missing or inaccessible: ${t} (${error.message})`);
      missing++;
    } else {
      console.log(`✅ Table verified: ${t}`);
    }
  }

  console.log(`\nVerified ${tables.length - missing}/${tables.length} tables.`);
  if (missing > 0) {
    console.log('\nNOTE: Run `scripts/migrate-live.sql` in Supabase SQL Editor to apply all tables, triggers, and RPCs.');
  }
}

main().catch(console.error);

/**
 * MiLyfe Database Seed Runner
 * Verifies or seeds demo content and verified records.
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

  // Check Treasury
  const { data: treasury, error: tErr } = await client
    .from('community_treasury')
    .select('*')
    .limit(1);

  if (tErr) {
    console.log('Treasury table not found. Please apply scripts/migrate-live.sql first.');
    return;
  }

  if (!treasury || treasury.length === 0) {
    console.log('Seeding initial community treasury ($10,000,000.00 $MLY)...');
    await client.from('community_treasury').insert({
      balance: 10000000.00,
      total_burned: 0,
      total_distributed: 0,
      citizen_count: 0,
    });
  } else {
    console.log('✅ Community Treasury baseline verified:', treasury[0].balance, '$MLY');
  }

  console.log('Seed check complete. For full demo dataset, execute `scripts/seed-live.sql` in Supabase SQL Editor.');
}

main().catch(console.error);

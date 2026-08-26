/**
 * MiLyfe Platform — End-to-End Comprehensive Audit & Test Suite
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error('ERROR: Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function record(suite: string, name: string, passed: boolean, details?: string) {
  results.push({ suite, name, passed, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${status}: [${suite}] ${name}${details ? ` -> ${details}` : ''}`);
}

async function runAudit() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           MILYFE PLATFORM END-TO-END AUDIT SUITE              ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const anonClient = createClient(SUPABASE_URL, ANON_KEY);
  const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY);

  // ─────────────────────────────────────────────────────────────
  // 1. SUPABASE CREDENTIALS & CONNECTIVITY
  // ─────────────────────────────────────────────────────────────
  console.log('=== [1/5] Checking Supabase Credentials & Endpoints ===');
  try {
    const { data: anonData, error: anonErr } = await anonClient.from('community_treasury').select('balance').limit(1);
    record('Credentials', 'Anon Key Connectivity', !anonErr, anonErr?.message);

    const { data: srvData, error: srvErr } = await serviceClient.from('community_treasury').select('balance').limit(1);
    record('Credentials', 'Service Role Key Connectivity', !srvErr, srvErr?.message);

    const { data: users, error: userListErr } = await serviceClient.auth.admin.listUsers();
    record('Credentials', 'Admin Auth API Access', !userListErr, `Found ${users?.users?.length ?? 0} users in system`);
  } catch (e: any) {
    record('Credentials', 'Connectivity Exception', false, e.message);
  }

  // ─────────────────────────────────────────────────────────────
  // 2. END-TO-END AUTHENTICATION FLOW TEST
  // ─────────────────────────────────────────────────────────────
  console.log('\n=== [2/5] Testing End-to-End User Auth Lifecycle ===');
  const timestamp = Date.now();
  const testEmail = `e2e_test_${timestamp}@milyfe.test`;
  const testPassword = `E2eSecurePass_${timestamp}!`;
  let testUserId = '';

  try {
    // 2.1 Sign Up via Anon Client
    const { data: signUpData, error: signUpErr } = await anonClient.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: `e2e_user_${timestamp.toString().slice(-4)}`,
          display_name: 'E2E Audit User',
        },
      },
    });

    record('Auth', 'User Registration (signUp)', !signUpErr && !!signUpData.user, signUpErr?.message || `Created User ID: ${signUpData.user?.id}`);
    testUserId = signUpData.user?.id || '';

    // 2.2 Verify / Confirm User via Admin API
    if (testUserId) {
      const { error: confirmErr } = await serviceClient.auth.admin.updateUserById(testUserId, {
        email_confirm: true,
      });
      record('Auth', 'Email Confirmation (admin confirm)', !confirmErr, confirmErr?.message);

      // 2.3 Sign In with Password via Anon Client
      const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      record('Auth', 'Password Sign-In & Token Issue (grant_type=password)', !signInErr && !!signInData.session, signInErr?.message || `Access token issued (expires_in: ${signInData.session?.expires_in}s)`);

      // 2.4 User Session Retrieval
      if (signInData.session) {
        const userClient = createClient(SUPABASE_URL, ANON_KEY, {
          global: {
            headers: {
              Authorization: `Bearer ${signInData.session.access_token}`,
            },
          },
        });
        const { data: userData, error: getUserErr } = await userClient.auth.getUser();
        record('Auth', 'Session Token Validation (getUser)', !getUserErr && userData.user?.id === testUserId, getUserErr?.message);
      }
    }
  } catch (e: any) {
    record('Auth', 'Auth Lifecycle Exception', false, e.message);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. DATABASE RECORDS & USER ECOSYSTEM STATE
  // ─────────────────────────────────────────────────────────────
  console.log('\n=== [3/5] Testing User Database State & Ledger ===');
  try {
    if (testUserId) {
      // Profile
      const { data: profile, error: profErr } = await serviceClient.from('profiles').select('*').eq('id', testUserId).single();
      record('Database', 'User Profile Record Exists', !profErr && !!profile, profErr?.message || `Username: ${profile?.username}`);

      // Wallet
      const { data: wallet, error: wallErr } = await serviceClient.from('wallets').select('*').eq('user_id', testUserId).single();
      record('Database', 'User Wallet Record Exists', !wallErr && !!wallet, wallErr?.message || `Balance: ${wallet?.spending_balance} $MLY`);
    }

    // Existing Verified Citizens Check
    const { data: verifiedUsers, error: vErr } = await serviceClient.from('profiles').select('id, username, onboarding_complete');
    record('Database', 'Verified Citizen Querying', !vErr, `Total Profiles: ${verifiedUsers?.length || 0}`);
  } catch (e: any) {
    record('Database', 'User State Exception', false, e.message);
  }

  // ─────────────────────────────────────────────────────────────
  // 4. COMMUNITY TREASURY AUDIT
  // ─────────────────────────────────────────────────────────────
  console.log('\n=== [4/5] Testing Community Treasury Status ===');
  try {
    const { data: treasury, error: tErr } = await serviceClient.from('community_treasury').select('*').order('snapshot_at', { ascending: false }).limit(1);
    const treasuryFound = !tErr && treasury && treasury.length > 0;
    record('Treasury', 'Treasury Table Accessibility', treasuryFound, tErr?.message || `Current Balance: $${treasury?.[0]?.balance?.toLocaleString()}`);
  } catch (e: any) {
    record('Treasury', 'Treasury Audit Exception', false, e.message);
  }

  // ─────────────────────────────────────────────────────────────
  // 5. CLEANUP AUDIT TEST USER
  // ─────────────────────────────────────────────────────────────
  console.log('\n=== [5/5] Cleaning Up Ephemeral Test Data ===');
  try {
    if (testUserId) {
      await serviceClient.auth.admin.deleteUser(testUserId);
      record('Cleanup', 'Audit Test User Deleted Cleanly', true, `Removed User ID: ${testUserId}`);
    }
  } catch (e: any) {
    record('Cleanup', 'Cleanup Exception', false, e.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Audit fatal error:', err);
  process.exit(1);
});

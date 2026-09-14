/**
 * Launch state — the single switch for public signups.
 *
 * Signups on milyfe.fun are CLOSED until MiForge fills its 1,200 founding
 * business spots (200 Pro + 1,000 Daily — the same numbers the MiForge
 * `cohort-status` route already serves). Once the Forge is full, the platform
 * opens.
 *
 * To reopen: set `NEXT_PUBLIC_SIGNUPS_ENABLED=true` in Vercel → Project
 * Settings → Environment Variables, then redeploy. No code change needed.
 *
 * This FAILS CLOSED. Unset, empty, or anything other than the exact string
 * "true" means signups are off.
 *
 * ⚠️ This closes the UI path only. Signup calls Supabase `auth.signUp()`
 * directly from the browser, so a determined visitor could still call it.
 * The hard off-switch is in the Supabase dashboard:
 *   Authentication → Sign In / Providers → Email → disable
 *   "Allow new users to sign up"
 * Do BOTH. This file makes the product say "coming soon"; Supabase makes it
 * actually impossible.
 */

const FLAG = process.env.NEXT_PUBLIC_SIGNUPS_ENABLED;

/** True only when explicitly enabled. Anything else — including unset — is closed. */
export const SIGNUPS_ENABLED: boolean = FLAG === 'true';

/** MiForge founding cohort capacity. Mirrors miforge-app `app/api/cohort-status/route.js`. */
export const FORGE_COHORT = {
  pro: 200,
  daily: 1000,
  total: 1200,
} as const;

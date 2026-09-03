import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/auth/callback',
  '/api/auth/callback',
  '/offline',
  '/guidelines',
  '/transparency',
  '/bounties',
  '/privacy',
  '/terms',
  '/security',
  '/receipts',
  // MiJustice public (educational) tier — must work signed-out and offline.
  // The operational OS lives under /justice/app/** and is NOT listed, so the
  // gate below bounces signed-out users there to /login.
  '/justice',
  '/justice/rights',
  '/justice/about',
];

// Public MiJustice route prefixes (rights guides have dynamic sub-paths).
const PUBLIC_PREFIXES = ['/justice/rights/'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fail open (don't 500 the whole site) if Supabase env is missing/misconfigured.
  // Without auth env, we can't check sessions — let the request through so public
  // pages still render and misconfiguration is obvious in logs, not a hard crash.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '[middleware] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — ' +
      'set these in the deployment environment. Skipping auth checks.'
    );
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    // Transient auth/network error — don't crash the site; treat as logged-out.
    console.error('[middleware] auth.getUser failed:', err);
  }
  const pathname = request.nextUrl.pathname;

  // Allow public routes and auth endpoints
  if (
    PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith('/auth')) ||
    PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix)) ||
    pathname.startsWith('/api')
  ) {
    return supabaseResponse;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

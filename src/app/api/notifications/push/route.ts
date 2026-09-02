import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createServiceSupabase } from '@/lib/supabase/server';
import { isAuthorizedCronRequest } from '@/lib/security/cron';

/**
 * Web-push send endpoint. Protected like the crons (CRON_SECRET) so only the
 * platform can trigger sends — not arbitrary users. Looks up a user's
 * push_subscriptions and delivers a notification. Privacy-aware: pass a neutral
 * `body` for shared devices. No ads. $MLY-only platform.
 *
 * Body: { user_id, title, body, url?, tag? }
 */
export async function POST(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });

  webpush.setVapidDetails('mailto:hello@milyfe.fun', pub, priv);

  let payload: { user_id: string; title: string; body?: string; url?: string; tag?: string };
  try { payload = await request.json(); } catch { return NextResponse.json({ error: 'bad body' }, { status: 400 }); }
  if (!payload.user_id || !payload.title) return NextResponse.json({ error: 'user_id and title required' }, { status: 400 });

  const supabase = createServiceSupabase();
  const { data: subs } = await (supabase as unknown as { from: (t: string) => any })
    .from('push_subscriptions').select('*').eq('user_id', payload.user_id);

  if (!subs || subs.length === 0) return NextResponse.json({ sent: 0, reason: 'no_subscriptions' });

  const notif = JSON.stringify({ title: payload.title, body: payload.body ?? '', url: payload.url ?? '/home', tag: payload.tag });
  let sent = 0;
  for (const s of subs as { endpoint: string; p256dh: string; auth: string }[]) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        notif
      );
      sent++;
    } catch (err) {
      // Expired/invalid subscription — clean it up.
      const code = (err as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) {
        await (supabase as unknown as { from: (t: string) => any })
          .from('push_subscriptions').delete().eq('endpoint', s.endpoint);
      }
    }
  }
  return NextResponse.json({ sent });
}

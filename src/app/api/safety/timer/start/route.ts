import { createServerSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';

const timerStartSchema = z.object({
  destination: z.string().trim().max(200).optional().nullable(),
  minutes: z.number().int('Duration must be a whole number').min(1, 'Invalid duration').max(180, 'Invalid duration'),
});

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = await checkRateLimit(user.id, 'safety-timer-start', RATE_LIMITS.safety);
  if (!rl.success) return rl.error!;

  let input: z.infer<typeof timerStartSchema>;
  try {
    const body = await request.json();
    input = timerStartSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { destination, minutes } = input;

  // Cancel any existing active timer
  await supabase
    .from('walk_home_timers')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('status', 'active');

  // Get safety contacts to alert
  const { data: contacts } = await supabase
    .from('safety_contacts')
    .select('contact_name, contact_user_id')
    .eq('user_id', user.id)
    .eq('notify_on_timer_expire', true);

  const alertContacts = (contacts || []).map((c) => c.contact_name);

  // Create new timer
  const expectedArrival = new Date(Date.now() + minutes * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('walk_home_timers')
    .insert({
      user_id: user.id,
      status: 'active',
      destination: destination || null,
      expected_arrival: expectedArrival,
      alert_contacts: alertContacts,
      escalation_level: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, timer_id: data.id });
}

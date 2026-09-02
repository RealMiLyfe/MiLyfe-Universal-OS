import { createServerSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';

const contactSchema = z.object({
  contact_name: z.string().trim().min(1, 'Contact name required').max(120, 'Name too long'),
  contact_phone: z.string().trim().max(40).optional().nullable(),
  contact_user_id: z.string().uuid('Invalid contact user ID').optional().nullable(),
});

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = await checkRateLimit(user.id, 'safety-contacts', RATE_LIMITS.safety);
  if (!rl.success) return rl.error!;

  let input: z.infer<typeof contactSchema>;
  try {
    const body = await request.json();
    input = contactSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { error } = await supabase.from('safety_contacts').insert({
    user_id: user.id,
    contact_name: input.contact_name,
    contact_phone: input.contact_phone || null,
    contact_user_id: input.contact_user_id || null,
    notify_on_leave_now: true,
    notify_on_timer_expire: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get('id');

  if (!contactId || !z.string().uuid().safeParse(contactId).success) {
    return NextResponse.json({ error: 'Valid contact ID required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('safety_contacts')
    .delete()
    .eq('id', contactId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

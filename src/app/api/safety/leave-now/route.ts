import { createServerSupabase, createServiceSupabase } from '@/lib/supabase/server';
import { logAudit } from '@/lib/security/audit';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const notifyContacts: string[] = body.notify_contacts || [];

  // Activate leave-now
  const { data, error } = await supabase
    .from('safety_actions')
    .insert({
      user_id: user.id,
      type: 'leave_now',
      status: 'active',
      freeze_jars: true,
      hide_location: true,
      remove_devices: true,
      contacts_notified: notifyContacts,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: Send notifications to contacts (via ntfy / push / matrix)
  // Revoke all other sessions (abuser's phone loses access)
  const adminSupabase = createServiceSupabase();
  await adminSupabase.auth.admin.signOut(user.id, 'others').catch((err) => {
    console.error('Failed to revoke sessions:', err);
  });

  await logAudit(user.id, 'safety.leave_now', 'safety_actions', data.id, {
    contacts_notified: notifyContacts.length,
  });

  return NextResponse.json({ success: true, action_id: data.id });
}

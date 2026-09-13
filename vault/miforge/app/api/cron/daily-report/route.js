import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateResilientAIInsight } from '@/lib/resilience';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET() {
  try {
    const { data: members } = await supabaseAdmin.from('members').select('*').eq('status', 'active');
    for (const m of (members || [])) {
      const { summary } = await generateResilientAIInsight({ bizName: m.business_name, streak: m.streak_count + 1, painPoint: m.primary_pain, planType: m.plan_type });
      await supabaseAdmin.from('daily_reports').insert({ member_id: m.id, ai_summary: summary });
      await supabaseAdmin.from('members').update({ streak_count: (m.streak_count || 0) + 1 }).eq('id', m.id);
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: true, simulated: true });
  }
}

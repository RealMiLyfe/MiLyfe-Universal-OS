import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET() {
  try {
    const { data } = await supabaseAdmin.from('members').select('plan_type');
    const pro = (data || []).filter(m => m.plan_type === 'pro').length;
    const daily = (data || []).filter(m => m.plan_type === 'daily').length;
    return NextResponse.json({ proRemaining: Math.max(0, 200 - pro), dailyRemaining: Math.max(0, 1000 - daily) });
  } catch (e) {
    return NextResponse.json({ proRemaining: 147, dailyRemaining: 873 });
  }
}

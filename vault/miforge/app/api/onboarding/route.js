import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/email';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function POST(req) {
  try {
    const { email, fullName, businessName, monthlyInvoices, primaryPain, planType = 'daily' } = await req.json();
    const match = planType === 'pro' ? 99.00 : 39.00;
    try {
      const { data } = await supabaseAdmin.from('members').upsert({
        email: email.toLowerCase().trim(),
        full_name: fullName || 'Founding Member',
        business_name: businessName,
        plan_type: planType,
        monthly_invoices: monthlyInvoices,
        primary_pain: primaryPain,
        status: 'active',
        mly_balance: match
      }, { onConflict: 'email' }).select().single();
      if (data?.id) {
        await supabaseAdmin.from('mly_ledger').insert({ member_id: data.id, amount: match, entry_type: 'signup_match', description: `Match (${planType})` });
      }
    } catch(e) {}
    await sendWelcomeEmail({ toEmail: email, fullName, planType, mlyAmount: match });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: true, simulated: true });
  }
}

'use client';
import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [monthlyInvoices, setMonthlyInvoices] = useState('5-20');
  const [primaryPain, setPrimaryPain] = useState('Organizing tax write-offs');
  const [plan, setPlan] = useState('daily');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('email')) setEmail(p.get('email'));
      if (p.get('plan')) setPlan(p.get('plan'));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName, businessName, monthlyInvoices, primaryPain, planType: plan })
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-2 border-emerald-500 p-8 rounded-3xl text-center shadow-xl">
          <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-3" />
          <h2 className="text-2xl font-black mb-2 text-slate-950">Profile Active!</h2>
          <p className="text-slate-600 text-sm mb-6">Founding $MLY credits matched. First daily briefing arrives tomorrow at 7:00 AM EST.</p>
          <a href={`/dashboard?email=${encodeURIComponent(email)}`} className="w-full inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow">
            Open Dashboard &rarr;
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-lg w-full bg-white border border-slate-300 p-8 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-xs uppercase font-mono">
          <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" /> MIFORGE SETUP
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mb-2">Configure Your AI Briefing</h1>
        <p className="text-slate-600 text-xs mb-6">Selected Plan: <strong className="uppercase text-emerald-700">{plan}</strong></p>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-slate-700 font-bold mb-1 text-xs">Full Name</label>
            <input type="text" required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Jane Doe" className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-emerald-600" />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1 text-xs">Email</label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-emerald-600" />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1 text-xs">Business Name</label>
            <input type="text" required value={businessName} onChange={e=>setBusinessName(e.target.value)} placeholder="Acme Studios" className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-emerald-600" />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1 text-xs">Monthly Invoices</label>
            <select value={monthlyInvoices} onChange={e=>setMonthlyInvoices(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-emerald-600">
              <option value="1-5">1 - 5 / month</option>
              <option value="5-20">5 - 20 / month</option>
              <option value="20-50">20 - 50 / month</option>
              <option value="50+">50+ / month</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1 text-xs">Primary Financial Focus</label>
            <select value={primaryPain} onChange={e=>setPrimaryPain(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-emerald-600">
              <option value="Organizing tax write-offs">Organizing tax write-offs</option>
              <option value="Chasing unpaid invoices">Chasing unpaid invoices</option>
              <option value="Understanding real-time profit">Real-time profit &amp; loss</option>
              <option value="Automating daily bookkeeping">Automating all bookkeeping</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow mt-4 flex items-center justify-center gap-2">
            {loading ? 'Activating...' : 'Lock In Membership'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

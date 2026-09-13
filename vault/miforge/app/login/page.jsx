'use client';
import React, { useState } from 'react';
import { Zap, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-300 p-8 rounded-3xl shadow-xl text-center">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold">
          <Zap className="w-6 h-6 fill-emerald-600 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-black text-slate-950 mb-2">Member Portal</h1>
        <p className="text-slate-600 text-xs mb-6">Enter your registered email to view books &amp; $MLY balance.</p>
        <form onSubmit={(e)=>{ e.preventDefault(); if (email) window.location.href=`/dashboard?email=${encodeURIComponent(email)}`; }} className="space-y-4">
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 text-sm focus:outline-none focus:border-emerald-600" />
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow flex items-center justify-center gap-2">
            Access Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

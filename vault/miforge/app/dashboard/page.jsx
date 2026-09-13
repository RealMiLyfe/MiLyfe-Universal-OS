'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Coins, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const [email, setEmail] = useState('founding@milyfe.fun');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('email')) setEmail(p.get('email'));
    }
  }, []);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase font-mono">Founding Workspace</span>
            <h1 className="text-2xl font-black text-slate-950">{email}</h1>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Founding Tier</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-2"><Coins className="w-4 h-4 text-emerald-600" /> $MLY Balance</div>
            <div className="text-3xl font-black">99.00 $MLY</div>
            <div className="text-xs text-emerald-700 mt-1 font-semibold">100% Dollar Matched</div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-2"><Flame className="w-4 h-4 text-amber-600" /> Streak</div>
            <div className="text-3xl font-black">14 <span className="text-sm font-normal text-slate-500">/ 261 Days</span></div>
            <div className="text-xs text-amber-700 mt-1 font-semibold">Next reward: +$25 $MLY</div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-2"><ShieldCheck className="w-4 h-4 text-cyan-600" /> Health Score</div>
            <div className="text-3xl font-black">96 / 100</div>
            <div className="text-xs text-cyan-700 mt-1 font-semibold">Verified Clean Books</div>
          </div>
        </div>
      </div>
    </div>
  );
}

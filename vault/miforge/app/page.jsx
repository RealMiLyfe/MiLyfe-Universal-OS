'use client';
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  Building2, 
  Sparkles, 
  RotateCw, 
  ShieldCheck, 
  Gift, 
  Store, 
  Award, 
  Coins, 
  UserCheck
} from 'lucide-react';

export default function LandingPage() {
  const [proSpots, setProSpots] = useState(147);
  const [dailySpots, setDailySpots] = useState(873);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCohort() {
      try {
        const res = await fetch('/api/cohort-status');
        const data = await res.json();
        if (data.proRemaining !== undefined) setProSpots(data.proRemaining);
        if (data.dailyRemaining !== undefined) setDailySpots(data.dailyRemaining);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchCohort();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ⚡ TOP BAR */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <a href="/" className="text-xl font-black tracking-tight text-slate-950 flex items-center gap-1.5">
              <span className="p-1.5 bg-emerald-600 rounded-lg text-white">
                <Zap className="h-4 w-4 fill-white" />
              </span>
              MIFORGE
            </a>
            <span className="text-xs bg-slate-100 border border-slate-300 text-slate-700 px-2.5 py-0.5 rounded-full font-medium">
              A MiLyfe Product
            </span>
          </div>

          <div className="flex items-center space-x-4 text-sm font-medium">
            <a href="https://mijaxx.fun" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900 hidden sm:inline">
              MiJaxx Hub
            </a>
            <a href="/status" className="text-slate-600 hover:text-slate-900 hidden sm:inline">
              Status
            </a>
            <a href="/login" className="text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <UserCheck className="w-4 h-4" /> Login
            </a>
            <a 
              href="#pricing" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-all shadow-sm text-xs sm:text-sm"
            >
              Join Founding Cohort
            </a>
          </div>
        </div>
      </header>

      {/* 🔴 SECTION 1: HERO & SCARCITY */}
      <section className="px-4 pt-14 pb-16 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm px-4 py-1.5 rounded-full mb-6 font-semibold shadow-sm">
          <Flame className="w-4 h-4 text-amber-600 animate-bounce" />
          First 200 Pro &amp; First 1,000 Daily Members Pay $0 Net in the End
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 leading-[1.1] mb-6">
          Your Business Finances. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
            Automated by AI. Backed by Community.
          </span>
        </h1>

        <p className="text-slate-600 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          MiForge handles your daily books, invoices, and 7:00 AM financial report.
          For founding members, we match <strong className="text-slate-900">every single dollar you spend in $MLY community credits</strong>. Dollar for dollar.
        </p>

        {/* Live Scarcity Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-10 text-left">
          <div className="bg-white border-2 border-emerald-500/80 p-5 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Pro Founding Cohort</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">200 Spots Total</span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-2">
              {loading ? '...' : proSpots} <span className="text-sm font-normal text-slate-500">spots remaining</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-600 h-2.5 rounded-full transition-all duration-700" style={{ width: `${(proSpots/200)*100}%` }}></div>
            </div>
          </div>

          <div className="bg-white border-2 border-cyan-500/80 p-5 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-cyan-800 font-bold uppercase tracking-wider">Daily Founding Cohort</span>
              <span className="text-xs bg-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded-full font-bold">1,000 Spots Total</span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-2">
              {loading ? '...' : dailySpots} <span className="text-sm font-normal text-slate-500">spots remaining</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-cyan-600 h-2.5 rounded-full transition-all duration-700" style={{ width: `${(dailySpots/1000)*100}%` }}></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#pricing" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2">
            Claim Your Founding Spot <ArrowRight className="w-5 h-5" />
          </a>
          <a href="#circular-economy" className="w-full sm:w-auto bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold px-6 py-4 rounded-xl transition-all shadow-sm">
            See How $MLY Makes You Whole &rarr;
          </a>
        </div>
      </section>

      {/* 📦 SECTION 2: THE TWO PLANS */}
      <section id="pricing" className="py-20 px-4 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mb-3">Two Plans. 100% Dollar Matched.</h2>
            <p className="text-slate-600 max-w-lg mx-auto">Every dollar paid is credited right back to you in $MLY community currency.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            
            {/* DAILY */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-slate-900">MiForge Daily</h3>
                  <span className="text-xs bg-slate-200 text-slate-800 font-semibold px-3 py-1 rounded-full">First 1,000</span>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-black text-slate-950">$39</span>
                  <span className="text-slate-600 font-medium"> / year</span>
                  <div className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-lg inline-block">
                    +39 $MLY on signup &amp; renewal (Net Cost: $0)
                  </div>
                </div>

                <ul className="space-y-4 text-sm text-slate-700 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Daily 7:00 AM AI Report:</strong> Delivered every business morning (M–F)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Invoice &amp; Collections Pulse:</strong> Instant overdue account alerts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>3 AI Daily Action Items:</strong> Focus on what moves cash flow</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>$300 Daily Gift Challenge:</strong> Complete the 261-day streak</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Founding Match at Renewal:</strong> $39 $MLY every year renewed</span>
                  </li>
                </ul>
              </div>

              <a 
                href="/onboarding?plan=daily" 
                className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow"
              >
                Join Daily ($39/yr)
              </a>
            </div>

            {/* PRO */}
            <div className="bg-gradient-to-b from-white via-emerald-50/30 to-white border-2 border-emerald-600 rounded-3xl p-8 flex flex-col justify-between relative shadow-xl">
              <div className="absolute -top-3.5 right-8 bg-emerald-600 text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider shadow">
                200 Founding Spots
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-slate-900">MiForge Pro</h3>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">Price Locked</span>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-black text-slate-950">$99</span>
                  <span className="text-slate-600 font-medium"> / year</span>
                  <div className="mt-2 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg inline-block">
                    +99 $MLY on signup &amp; renewal (Net Cost: $0)
                  </div>
                </div>

                <ul className="space-y-4 text-sm text-slate-700 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Full AI Bookkeeping Department:</strong> Unlimited 24/7 access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Bank Sync &amp; Categorization:</strong> Real-time Profit &amp; Loss</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Smart Receipt OCR:</strong> Immediate tax deduction capture</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Price Locked at $99/yr Forever:</strong> (Next cohort is $199/yr)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Partner Starter Tier Included:</strong> ($299/month fee waived)</span>
                  </li>
                </ul>
              </div>

              <a 
                href="/onboarding?plan=pro" 
                className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/30"
              >
                Get Pro Spot ($99/yr)
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 🔄 SECTION 3: CIRCULAR ECONOMY */}
      <section id="circular-economy" className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-emerald-700 font-bold text-xs uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            The Circular Economy
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 mb-3">
            &ldquo;We Give You Your Money Back.&rdquo;
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Not as cash out of pocket &mdash; better. 1 $MLY = $1 USD value within the MiLyfe community network.
          </p>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 mb-12 shadow-sm">
          <h3 className="text-center font-bold text-slate-900 mb-8 text-lg">The 100% Circulating Flow</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center mx-auto mb-2">1</div>
              <div className="font-bold text-slate-900 text-sm">You Join</div>
              <div className="text-xs text-slate-500 mt-1">Pay $39 or $99</div>
            </div>

            <div className="hidden md:flex justify-center text-emerald-600 font-bold">&rarr;</div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
              <div className="w-8 h-8 bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center mx-auto mb-2">2</div>
              <div className="font-bold text-emerald-900 text-sm">Instant Match</div>
              <div className="text-xs text-emerald-700 mt-1">Get 39 or 99 $MLY</div>
            </div>

            <div className="hidden md:flex justify-center text-emerald-600 font-bold">&rarr;</div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <div className="w-8 h-8 bg-cyan-100 text-cyan-700 font-bold rounded-full flex items-center justify-center mx-auto mb-2">3</div>
              <div className="font-bold text-slate-900 text-sm">Spend Locally</div>
              <div className="text-xs text-slate-500 mt-1">Pay other businesses</div>
            </div>
          </div>

          <div className="mt-6 bg-slate-900 text-white p-4 rounded-2xl text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Local businesses earn 5%–15% bonus on received $MLY &rarr; circulate back to you. Capital stays in the community.</span>
          </div>
        </div>
      </section>

      {/* 📊 SECTION 4: PREVIEW */}
      <section className="py-20 px-4 bg-slate-100 border-y border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Delivered Every Morning at 7:00 AM</span>
            <h2 className="text-3xl font-extrabold text-slate-950 mt-1">Your Daily Financial Briefing</h2>
          </div>

          <div className="bg-white border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-xl font-mono text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-200 text-slate-500 gap-2">
              <span className="flex items-center gap-2 text-emerald-700 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-600" /> MIFORGE DAILY INTELLIGENCE #104
              </span>
              <span>Today 07:00 AM EST • Mon–Fri</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-xs">Unpaid Invoices</div>
                <div className="text-xl font-bold text-amber-600 mt-1">$4,850.00</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-xs">Tax Write-offs</div>
                <div className="text-xl font-bold text-emerald-600 mt-1">$1,240.50</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-xs">Health Score</div>
                <div className="text-xl font-bold text-cyan-600 mt-1">94 / 100</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-xs">$MLY Balance</div>
                <div className="text-xl font-bold text-slate-900 mt-1">138 $MLY</div>
              </div>
            </div>

            <div className="space-y-2.5 text-slate-800 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="text-slate-950 font-bold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" /> AI Priority Actions:
              </div>
              <div>• 1. Sent 1-click overdue reminder for Invoice #1084 ($1,200 &mdash; 4 days past due).</div>
              <div>• 2. Auto-categorized $340 hardware expense as Section 179 tax deduction.</div>
              <div>• 3. Streak Status: Day 42/261 active. Next milestone bonus in 8 days (+$25 $MLY).</div>
            </div>
          </div>
        </div>
      </section>

      {/* 🎁 SECTION 5: GIFT CHALLENGE */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="max-w-2xl">
            <span className="bg-white/20 text-white text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
              The 261-Day Habit Challenge
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-4 mb-4">
              Open Your Brief. Earn $300 Extra in $MLY.
            </h2>
            <p className="text-emerald-50 text-sm sm:text-base leading-relaxed mb-8">
              Open your 7:00 AM daily financial report every business day for one year. 
              A Daily member pays $39, gets $39 match on signup + $300 in challenge credits = <strong>$339 total back (8.7&times; return)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-slate-950 font-mono text-center">
            <div className="bg-white p-3.5 rounded-xl">
              <div className="text-xs text-slate-500 font-bold">10 Days</div>
              <div className="text-lg font-black text-emerald-700">+$10 $MLY</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl">
              <div className="text-xs text-slate-500 font-bold">50 Days</div>
              <div className="text-lg font-black text-emerald-700">+$25 $MLY</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl">
              <div className="text-xs text-slate-500 font-bold">100 Days</div>
              <div className="text-lg font-black text-emerald-700">+$50 $MLY</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl">
              <div className="text-xs text-slate-500 font-bold">200 Days</div>
              <div className="text-lg font-black text-emerald-700">+$75 $MLY</div>
            </div>
            <div className="bg-amber-300 p-3.5 rounded-xl col-span-2 sm:col-span-1 border-2 border-white">
              <div className="text-xs text-amber-900 font-black">261 Days</div>
              <div className="text-lg font-black text-amber-950">+$300 $MLY</div>
            </div>
          </div>
        </div>
      </section>

      {/* 🏢 SECTION 6: BUSINESS ACCEPTANCE */}
      <section className="py-20 px-4 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-emerald-700 font-bold text-xs uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Business Incentives
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 mb-3">
              Get Rewarded for Accepting $MLY
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              We eliminate the chicken-and-egg problem by paying businesses extra when they accept community credits.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <Store className="w-8 h-8 text-emerald-600 mb-3" />
                <h4 className="font-bold text-slate-950 mb-1">1. Pioneer Badge</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  First 100 accepting businesses get 10% bonus on all $MLY received (first 90 days) + featured directory spot.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 mt-4">+10% Bonus</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <Coins className="w-8 h-8 text-cyan-600 mb-3" />
                <h4 className="font-bold text-slate-950 mb-1">2. Transaction Bonus</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every $MLY transaction received earns an ongoing +5% bonus on top. More lucrative than accepting cash.
                </p>
              </div>
              <span className="text-xs font-bold text-cyan-700 mt-4">+5% Ongoing</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <Award className="w-8 h-8 text-amber-600 mb-3" />
                <h4 className="font-bold text-slate-950 mb-1">3. Champion Tier</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  10+ transactions/mo unlocks +15% bonus, free upgrade to MiForge Pro ($99 value), and physical shop sticker.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-700 mt-4">+15% + Free Pro</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <Building2 className="w-8 h-8 text-indigo-600 mb-3" />
                <h4 className="font-bold text-slate-950 mb-1">4. Jax Launch Bonus</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jacksonville pilot businesses receive double bonus + seat on the MiJaxx Business Advisory Council.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 mt-4">Jax Exclusive</span>
            </div>
          </div>
        </div>
      </section>

      {/* 🏛️ SECTION 7: MILYFE / MIJAXX */}
      <section className="py-20 px-4 max-w-4xl mx-auto text-center">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-950 mb-4">
          This Isn&apos;t Just Software. It&apos;s a Community Economy.
        </h2>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          MiForge is built inside <strong>MiLyfe</strong> &mdash; starting in Jacksonville, FL through the <strong>MiJaxx</strong> mayoral initiative.
          We believe communities should own and circulate their economic power before relying on outside promises.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href="https://milyfe.fun" target="_blank" rel="noreferrer" className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow">
            Learn About MiLyfe &rarr;
          </a>
          <a href="https://mijaxx.fun" target="_blank" rel="noreferrer" className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold px-6 py-3 rounded-xl transition-all">
            Explore MiJaxx Mayor Movement &rarr;
          </a>
        </div>
      </section>

      {/* 💳 SECTION 8: CHECKOUT METHODS */}
      <section className="py-16 px-4 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-3">Instant Activation. Flexible Payment.</h3>
          <p className="text-slate-400 text-xs sm:text-sm mb-6">
            Accepting direct Bank ACH (GoCardless), Credit Cards via Whop, and major Crypto currencies.
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 font-mono bg-slate-800/80 px-6 py-3 rounded-2xl border border-slate-700">
            <span>• Bank ACH</span>
            <span>• Visa / Mastercard</span>
            <span>• BTC</span>
            <span>• ETH</span>
            <span>• SOL</span>
            <span>• USDC</span>
            <span>• USDT</span>
            <span>• XRP</span>
          </div>
        </div>
      </section>

      {/* ⚡ FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-10 px-4 text-center text-xs text-slate-500 space-y-4">
        <div className="flex justify-center space-x-6 font-medium text-slate-700">
          <a href="https://milyfe.fun" className="hover:text-emerald-600">MiLyfe Platform</a>
          <a href="https://mijaxx.fun" className="hover:text-emerald-600">MiJaxx Jacksonville</a>
          <a href="/status" className="hover:text-emerald-600">System Status</a>
          <a href="/login" className="hover:text-emerald-600">Member Login</a>
          <a href="mailto:support@milyfe.fun" className="hover:text-emerald-600">support@milyfe.fun</a>
        </div>
        <p>&copy; {new Date().getFullYear()} MiForge &mdash; A MiLyfe Product. Jacksonville, FL &amp; Open Worldwide.</p>
      </footer>

    </div>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Users, Wallet, Shield, Vote, Heart, BookOpen, Sparkles, TrendingUp, Globe, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createServiceSupabase } from '@/lib/supabase/server';
import { FooterLanguageSelector } from '@/components/i18n/footer-language-selector';

const FEATURES = [
 { icon: Wallet, title: 'Earn $MLY', description: 'Universal basic income for every citizen. Spend, save, or give back.', accent: 'from-mly-400 to-mly-600', bg: 'bg-mly-50 ', iconColor: 'text-mly-600 ' },
 { icon: Users, title: 'Connect', description: 'Real relationships with real neighbors. Not followers — connections.', accent: 'from-teal-400 to-teal-600', bg: 'bg-teal-50 ', iconColor: 'text-teal-600 ' },
 { icon: Vote, title: 'Govern Together', description: 'Direct democracy. Every voice counts. Propose, vote, build.', accent: 'from-purple-400 to-purple-600', bg: 'bg-purple-50 ', iconColor: 'text-purple-600 ' },
 { icon: Shield, title: 'Standing', description: '8 facets of reputation. Earned through action, not popularity.', accent: 'from-harbor-400 to-harbor-600', bg: 'bg-harbor-50 ', iconColor: 'text-harbor-600 ' },
 { icon: Heart, title: 'Health & Wellness', description: 'Check in, track your journey, find resources when you need them.', accent: 'from-rose-400 to-rose-600', bg: 'bg-rose-50 ', iconColor: 'text-rose-600 ' },
 { icon: BookOpen, title: 'Community Wiki', description: 'Shared knowledge. Built by citizens, for citizens.', accent: 'from-indigo-400 to-indigo-600', bg: 'bg-indigo-50 ', iconColor: 'text-indigo-600 ' },
];

const STEPS = [
 { number: '01', title: 'Sign up free', description: 'Create your citizen profile in 30 seconds. No credit card, no catch.', icon: Sparkles },
 { number: '02', title: 'Earn $MLY from day one', description: 'Receive universal basic income weekly. Spend it, save it, or give it back.', icon: TrendingUp },
 { number: '03', title: 'Shape your city', description: 'Vote on proposals, fund projects, build the community you want to see.', icon: Globe },
];

async function getCitizenCount() {
 try {
 const supabase = createServiceSupabase();
 const [treasuryRes, citizensRes] = await Promise.all([
 supabase
 .from('community_treasury')
 .select('citizen_count, balance')
 .order('snapshot_at', { ascending: false })
 .limit(1)
 .single(),
 supabase
 .from('profiles')
 .select('id', { count: 'exact', head: true })
 .eq('onboarding_complete', true),
 ]);

 const citizens = citizensRes.count ?? treasuryRes.data?.citizen_count ?? 0;
 const treasury = treasuryRes.data?.balance ?? 10000000;

 return { citizens, treasury };
 } catch {
 return { citizens: 0, treasury: 10000000 };
 }
}

async function getModuleCount() {
 try {
 const supabase = createServiceSupabase();
 const { count } = await supabase
 .from('learn_modules')
 .select('id', { count: 'exact', head: true })
 .eq('is_active', true);
 return count || 0;
 } catch {
 return 0;
 }
}

export default async function LandingPage() {
 const { citizens: citizenCount, treasury: treasuryBalance } = await getCitizenCount();
 const moduleCount = await getModuleCount();
 const { getActiveLanguage } = await import('@/lib/i18n/set-language');
 const { getDictionary } = await import('@/lib/i18n/dictionary');
 const t = getDictionary(await getActiveLanguage());

 return (
 <div className="min-h-screen bg-surface-light overflow-hidden">
 {/* Hero */}
 <header className="relative">
 {/* Aurora / Gradient Mesh Background */}
 <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
 <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-teal-200/40 via-teal-100/20 to-transparent blur-3xl animate-float" />
 <div className="absolute -bottom-[30%] -left-[15%] w-[60%] h-[70%] rounded-full bg-gradient-to-tr from-mly-200/30 via-mly-100/15 to-transparent blur-3xl animate-float" style={{ animationDelay: '2s', animationDirection: 'reverse' }} />
 <div className="absolute top-[20%] left-[40%] w-[40%] h-[40%] rounded-full bg-gradient-to-b from-harbor-100/20 to-transparent blur-3xl" />
 {/* Mesh grid overlay */}
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] ,rgba(255,255,255,0.02)_1px,transparent_0)] bg-[size:32px_32px]" />
 </div>

 <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-16 md:pt-12 md:pb-28">
 {/* Nav */}
 <nav className="flex items-center justify-between mb-20" aria-label="Landing navigation">
 <Link href="/" className="flex items-center gap-2">
 <Image src="/logo.png" alt="MiLyfe" width={88} height={32} priority className="h-9 w-auto max-w-[120px] object-contain" />
 </Link>
 <div className="flex items-center gap-3">
 <Link href="/login">
 <Button variant="ghost" size="sm">{t.common.signIn}</Button>
 </Link>
 <Link href="/signup">
 <Button variant="harbor" size="sm" className="shadow-lg shadow-harbor-500/20">{t.common.signUp}</Button>
 </Link>
 </div>
 </nav>

 {/* Hero content */}
 <div className="text-center max-w-4xl mx-auto">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50/80 border border-teal-200/50 text-sm text-teal-700 mb-8 backdrop-blur-sm">
 <span className="relative flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
 <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
 </span>
 {citizenCount > 0
 ? `${citizenCount.toLocaleString()} citizens and growing`
 : 'Now open — be among the first citizens'}
 </div>

 <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-balance">
 <span className="text-harbor-800 ">Add Value.</span>
 <br />
 <span className="bg-gradient-to-r from-teal-500 to-teal-400 bg-clip-text text-transparent">Raise Quality of Life.</span>
 </h1>

 <p className="mt-6 text-sm font-semibold tracking-widest uppercase text-teal-600 ">
 We the People · Anyone · Anywhere · From Day One
 </p>

 <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto text-balance leading-relaxed">
 The Constitution as a living lifestyle. A system that still works after
 anyone leaves. People govern themselves — as the Constitution intended.
 </p>

 <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
 <Link href="/signup">
 <Button variant="harbor" size="lg" className="w-full sm:w-auto shadow-xl shadow-harbor-500/25 hover:shadow-harbor-500/40 transition-shadow">
 Become a citizen
 <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
 </Button>
 </Link>
 <Link href="/transparency">
 <Button variant="outline" size="lg" className="w-full sm:w-auto backdrop-blur-sm">
 How it works
 </Button>
 </Link>
 </div>
 </div>
 </div>
 </header>

 {/* Social Proof Strip */}
 <section className="relative border-y border-gray-100 bg-white/50 backdrop-blur-sm">
 <div className="max-w-5xl mx-auto px-4 py-6 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
 <div>
 <p className="text-2xl font-bold tabular-nums text-harbor-800 ">{citizenCount.toLocaleString()}</p>
 <p className="text-xs text-gray-500 uppercase tracking-wide">Citizens</p>
 </div>
 <div>
 <p className="text-2xl font-bold tabular-nums text-mly-600 ">
 {treasuryBalance >= 1_000_000
 ? `$${(treasuryBalance / 1_000_000).toFixed(1)}M`
 : treasuryBalance >= 1_000
 ? `$${(treasuryBalance / 1_000).toFixed(0)}K`
 : `$${treasuryBalance.toFixed(0)}`}
 </p>
 <p className="text-xs text-gray-500 uppercase tracking-wide">Treasury</p>
 </div>
 <div>
 <p className="text-2xl font-bold tabular-nums text-teal-600 ">{moduleCount}</p>
 <p className="text-xs text-gray-500 uppercase tracking-wide">Learning Modules</p>
 </div>
 <div>
 <p className="text-2xl font-bold tabular-nums text-purple-600 ">100%</p>
 <p className="text-xs text-gray-500 uppercase tracking-wide">Community Owned</p>
 </div>
 </div>
 </section>

 {/* Features grid */}
 <section className="max-w-6xl mx-auto px-4 py-20 md:py-32" aria-labelledby="features-heading">
 <div className="text-center mb-16">
 <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-harbor-800 ">
 The Constitution as something you live
 </h2>
 <p className="mt-4 text-gray-500 max-w-xl mx-auto">
 One platform. No fragmentation. Built by the people who use it. Free forever.
 </p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {FEATURES.map(({ icon: Icon, title, description, bg, iconColor }) => (
 <div
 key={title}
 className="group relative rounded-2xl border border-gray-100 bg-white p-6 hover:border-teal-200 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/5 hover:-translate-y-0.5"
 >
 <div className={`rounded-xl ${bg} p-3 w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
 <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
 </div>
 <h3 className="font-bold text-harbor-800 mb-2 text-lg">{title}</h3>
 <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
 </div>
 ))}
 </div>
 </section>

 {/* How it works */}
 <section className="relative bg-gray-50/50 py-20 md:py-28">
 <div className="max-w-5xl mx-auto px-4">
 <div className="text-center mb-16">
 <h2 className="text-3xl md:text-4xl font-bold text-harbor-800 ">
 Three steps. Zero barriers.
 </h2>
 <p className="mt-4 text-gray-500 ">
 From signup to shaping your city in under a minute.
 </p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {STEPS.map(({ number, title, description, icon: Icon }) => (
 <div key={number} className="relative text-center md:text-left">
 <div className="flex flex-col items-center md:items-start gap-4">
 <div className="flex items-center gap-3">
 <span className="text-4xl font-bold bg-gradient-to-br from-teal-400 to-teal-600 bg-clip-text text-transparent">{number}</span>
 <div className="h-px flex-1 bg-gradient-to-r from-teal-300 to-transparent hidden md:block" />
 </div>
 <div className="rounded-xl bg-white border border-gray-100 p-3 w-fit shadow-sm">
 <Icon className="h-5 w-5 text-teal-500" aria-hidden="true" />
 </div>
 <h3 className="text-lg font-bold text-harbor-800 ">{title}</h3>
 <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* CTA */}
 <section className="relative overflow-hidden bg-gradient-to-br from-harbor-800 via-harbor-900 to-harbor-950 py-20 md:py-28">
 {/* CTA background decoration */}
 <div className="absolute inset-0" aria-hidden="true">
 <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
 <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-mly-500/10 blur-3xl" />
 </div>
 <div className="relative max-w-3xl mx-auto px-4 text-center">
 <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
 A system that still works after anyone leaves
 </h2>
 <p className="text-harbor-200 mb-10 text-lg text-balance">
 Built with $0 over 11 years. Owned by the people who use it.
 No founder keys. No permanent hold on power. This is ours.
 </p>
 <Link href="/signup">
 <Button variant="mly" size="lg" className="shadow-xl shadow-mly-500/30 hover:shadow-mly-500/50 transition-shadow text-base">
 Join MiLyfe — It&apos;s free
 <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
 </Button>
 </Link>
 </div>
 </section>

 {/* Footer */}
 <footer className="border-t border-gray-100 bg-white ">
 <div className="max-w-6xl mx-auto px-4 py-12">
 <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
 {/* Brand */}
 <div className="md:col-span-2">
 <Image src="/logo.png" alt="MiLyfe" width={88} height={32} className="h-8 w-auto max-w-[110px] object-contain mb-4" />
 <p className="text-sm text-gray-500 max-w-xs">
 The Constitution as a living lifestyle. Add value. Raise quality of life. A system that still works after anyone leaves.
 </p>
 </div>
 {/* Links */}
 <div>
 <h3 className="text-sm font-semibold text-harbor-800 mb-3">Platform</h3>
 <ul className="space-y-2 text-sm text-gray-500 ">
 <li><Link href="/transparency" className="hover:text-teal-600 transition-colors">Transparency</Link></li>
 <li><Link href="/governance" className="hover:text-teal-600 transition-colors">Governance</Link></li>
 <li><Link href="/wiki" className="hover:text-teal-600 transition-colors">Wiki</Link></li>
 <li><Link href="/safety" className="hover:text-teal-600 transition-colors">Safety</Link></li>
 </ul>
 </div>
 <div>
 <h3 className="text-sm font-semibold text-harbor-800 mb-3">Community</h3>
 <ul className="space-y-2 text-sm text-gray-500 ">
 <li><Link href="/receipts" className="hover:text-teal-600 transition-colors">The Receipts</Link></li>
 <li><a href="https://github.com/RealMiLyfe/MiLyfe-Universal-OS" target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 transition-colors inline-flex items-center gap-1"><Github className="h-3.5 w-3.5" /> Source Code</a></li>
 <li><a href="https://discord.gg/b4hkHUqU6N" target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 transition-colors">Discord</a></li>
 <li><Link href="/forum" className="hover:text-teal-600 transition-colors">Forum</Link></li>
 <li><a href="mailto:contact@milyfe.fun" className="hover:text-teal-600 transition-colors">Contact</a></li>
 </ul>
 </div>
 <div>
 <h3 className="text-sm font-semibold text-harbor-800 mb-3">Legal</h3>
 <ul className="space-y-2 text-sm text-gray-500 ">
 <li><Link href="/privacy" className="hover:text-teal-600 transition-colors">Privacy</Link></li>
 <li><Link href="/terms" className="hover:text-teal-600 transition-colors">Terms of Use</Link></li>
 <li><Link href="/security" className="hover:text-teal-600 transition-colors">Security</Link></li>
 </ul>
 </div>
 </div>
 <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
 <p className="text-xs text-gray-400">
 &copy; {new Date().getFullYear()} MiLyfe. {t.landing.footerTagline}
 </p>
 <FooterLanguageSelector />
 </div>
 </div>
 </footer>
 </div>
 );
}

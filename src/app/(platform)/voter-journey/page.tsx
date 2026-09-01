'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ExternalLink, Shield, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
 {
 number: 1,
 title: 'Check Your Status',
 description: 'Find out if you\'re already registered to vote in Florida.',
 action: 'Check My Registration',
 url: 'https://registration.elections.myflorida.com/CheckVoterStatus',
 icon: '🔍',
 },
 {
 number: 2,
 title: 'Register to Vote',
 description: 'Not registered? It takes 5 minutes online. You need a Florida driver\'s license or ID, your Social Security number, and your Florida address.',
 action: 'Register Now',
 url: 'https://registertovoteflorida.gov',
 icon: '📋',
 },
 {
 number: 3,
 title: 'Know Your Dates',
 description: 'Jacksonville 2027 mayoral race — mark these on your calendar.',
 icon: '📅',
 dates: true,
 },
 {
 number: 4,
 title: 'Update Your Profile',
 description: 'Once you\'re registered, update your MiLyfe profile to earn the Civic Ready badge.',
 action: 'Update Profile',
 url: '/profile',
 icon: '✅',
 },
];

const KEY_DATES = [
 { date: 'Dec 14, 2026', event: 'Petition signature deadline' },
 { date: 'Jan 11-15, 2027', event: 'Qualifying window' },
 { date: 'Mar 9, 2027', event: 'Primary election' },
 { date: 'May 18, 2027', event: 'General election (if needed)' },
 { date: 'Jul 1, 2027', event: 'New mayor takes office' },
];

export default function VoterJourneyPage() {
 const [completedSteps, setCompletedSteps] = useState<number[]>([]);

 function markDone(step: number) {
 if (!completedSteps.includes(step)) {
 setCompletedSteps([...completedSteps, step]);
 }
 }

 return (
 <div className="max-w-2xl mx-auto py-8 px-4">
 {/* Hero */}
 <div className="text-center mb-10">
 <div className="inline-flex p-3 rounded-full bg-teal-50 mb-4">
 <Shield className="h-8 w-8 text-teal-600" aria-hidden="true" />
 </div>
 <h1 className="text-2xl font-bold text-harbor-800 mb-2">
 Your Voice Starts With Your Vote
 </h1>
 <p className="text-sm text-gray-600 max-w-md mx-auto">
 MiLyfe gives you a voice in your community every day. Voter registration gives you a voice in who leads it. Both matter.
 </p>
 </div>

 {/* Steps */}
 <div className="space-y-6">
 {STEPS.map((step) => (
 <div
 key={step.number}
 className={`rounded-xl border p-5 transition-colors ${
 completedSteps.includes(step.number)
 ? 'border-teal-300 bg-teal-50/50 '
 : 'border-gray-200 bg-white '
 }`}
 >
 <div className="flex items-start gap-4">
 <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
 completedSteps.includes(step.number)
 ? 'bg-teal-500 text-white'
 : 'bg-gray-100 '
 }`}>
 {completedSteps.includes(step.number) ? <CheckCircle className="h-5 w-5" /> : step.icon}
 </div>
 <div className="flex-1">
 <h3 className="font-bold text-harbor-800 mb-1">
 Step {step.number}: {step.title}
 </h3>
 <p className="text-sm text-gray-600 mb-3">
 {step.description}
 </p>

 {step.dates && (
 <div className="bg-gray-50 rounded-lg p-3 mb-3">
 <div className="flex items-center gap-2 mb-2">
 <Calendar className="h-4 w-4 text-mly-600" />
 <span className="text-xs font-bold text-harbor-800 uppercase">Key Dates</span>
 </div>
 <div className="space-y-1">
 {KEY_DATES.map((d) => (
 <div key={d.date} className="flex justify-between text-xs">
 <span className="text-gray-600 ">{d.event}</span>
 <span className="font-medium text-harbor-800 ">{d.date}</span>
 </div>
 ))}
 </div>
 </div>
 )}

 <div className="flex items-center gap-2">
 {step.url && (
 step.url.startsWith('http') ? (
 <a
 href={step.url}
 target="_blank"
 rel="noopener noreferrer"
 onClick={() => markDone(step.number)}
 className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline"
 >
 {step.action} <ExternalLink className="h-3 w-3" />
 </a>
 ) : (
 <Link
 href={step.url}
 onClick={() => markDone(step.number)}
 className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline"
 >
 {step.action} <ArrowRight className="h-3 w-3" />
 </Link>
 )
 )}
 {!completedSteps.includes(step.number) && !step.dates && (
 <button
 onClick={() => markDone(step.number)}
 className="text-xs text-gray-400 hover:text-gray-600 ml-auto"
 >
 Mark done
 </button>
 )}
 {step.dates && !completedSteps.includes(step.number) && (
 <button
 onClick={() => markDone(step.number)}
 className="text-xs text-gray-400 hover:text-gray-600"
 >
 Got it ✓
 </button>
 )}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Bottom CTA */}
 <div className="mt-8 text-center">
 <div className="bg-gray-50 rounded-xl p-5">
 <p className="text-sm text-gray-600 mb-3">
 <strong className="text-harbor-800 ">Why this matters:</strong> Jacksonville spends 52% of its budget reacting to problems. Your vote decides whether we keep doing that — or invest in prevention. MiLyfe built the proof. Your vote makes it real.
 </p>
 <Link href="/home">
 <Button variant="harbor" size="sm">
 Back to MiLyfe
 </Button>
 </Link>
 </div>
 </div>

 {/* Privacy note */}
 <p className="text-center text-xs text-gray-400 mt-4">
 🔒 Your voter status is private. Only you can see it. We never share civic data.
 </p>
 </div>
 );
}

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { completeOnboarding } from '@/lib/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, ArrowRight, MapPin, User, Sparkles } from 'lucide-react';

const STEPS = ['Profile', 'Neighborhood', 'Civic', 'Welcome'];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [voterStatus, setVoterStatus] = useState<'registered' | 'not_registered' | 'unsure' | 'prefer_not_to_say' | 'unknown'>('unknown');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    setError(null);

    // Validate display name on step 0
    if (step === 0 && !displayName.trim()) {
      setError('Please enter a display name so the community knows who you are.');
      return;
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    startTransition(async () => {
      const result = await completeOnboarding({
        display_name: displayName,
        bio,
        neighborhood: neighborhood || undefined,
        interests: [],
        voter_status: voterStatus,
      });

      if (result.success) {
        router.push('/home');
        router.refresh();
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    });
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step
                  ? 'bg-teal-500 text-white'
                  : i === step
                  ? 'bg-harbor-800 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
              aria-current={i === step ? 'step' : undefined}
            >
              {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 transition-colors ${i < step ? 'bg-teal-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

        {/* Step 0 — Profile */}
        {step === 0 && (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-teal-50">
                <User className="h-5 w-5 text-teal-600" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-harbor-800">Tell us about you</h1>
                <p className="text-sm text-gray-500">How should the community know you?</p>
              </div>
            </div>
            <div>
              <label htmlFor="display-name" className="block text-sm font-medium text-harbor-800 mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-harbor-800 mb-1">Short Bio</label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="What brings you to MiLyfe?"
                maxLength={200}
              />
              <p className="text-xs text-gray-400 mt-1">{bio.length}/200</p>
            </div>
          </>
        )}

        {/* Step 1 — Neighborhood */}
        {step === 1 && (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-teal-50">
                <MapPin className="h-5 w-5 text-teal-600" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-harbor-800">Your Neighborhood</h1>
                <p className="text-sm text-gray-500">Optional — helps connect you locally</p>
              </div>
            </div>
            <div>
              <label htmlFor="neighborhood" className="block text-sm font-medium text-harbor-800 mb-1">Neighborhood</label>
              <Input
                id="neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g., Downtown, Eastside, Oak Park..."
              />
              <p className="text-xs text-gray-400 mt-2">This helps match you with neighbors in the same area. You can always change it later.</p>
            </div>
          </>
        )}

        {/* Step 2 — Civic */}
        {step === 2 && (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-teal-50">
                <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-harbor-800">Your Civic Status</h1>
                <p className="text-sm text-gray-500">Optional — only you can see this</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Are you registered to vote where you live? This is private — it helps us point you to the right resources.
            </p>
            <div className="space-y-2">
              {[
                { value: 'registered', label: "Yes, I'm registered to vote", icon: '✅' },
                { value: 'not_registered', label: "No, I'm not registered yet", icon: '📋' },
                { value: 'unsure', label: "I'm not sure", icon: '❓' },
                { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: '🔒' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVoterStatus(opt.value as typeof voterStatus)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    voterStatus === opt.value
                      ? 'border-teal-500 bg-teal-50 text-harbor-800'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="mr-2">{opt.icon}</span>
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
            {(voterStatus === 'not_registered' || voterStatus === 'unsure') && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm font-medium text-harbor-800 mb-2">
                  Find voter registration for your area:
                </p>
                <a
                  href="https://vote.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-600 underline font-medium"
                >
                  vote.gov (US) →
                </a>
                <p className="text-xs text-gray-500 mt-2">
                  You can update your status anytime from your profile.
                </p>
              </div>
            )}
          </>
        )}

        {/* Step 3 — Welcome */}
        {step === 3 && (
          <div className="text-center py-4">
            <div className="inline-flex p-3 rounded-full bg-amber-100 mb-4">
              <Sparkles className="h-8 w-8 text-amber-600" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-harbor-800 mb-2">
              Welcome to MiLyfe!
            </h1>
            <p className="text-sm text-gray-600 mb-4">
              You&apos;ve received{' '}
              <span className="font-bold text-amber-600">50 $MLY</span>{' '}
              — your first week&apos;s basic income. It&apos;s already in your wallet.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
              <p className="text-sm font-semibold text-harbor-800">Start here:</p>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li>💰 Check your <strong>Wallet</strong> — your 50 $MLY is there</li>
                <li>🏘️ Visit <strong>Street</strong> — post a quest or grab one</li>
                <li>🗳️ Open <strong>Voice</strong> — see what the community is deciding</li>
                <li>📚 Try <strong>Learn</strong> — free courses, yours to keep</li>
                <li>💬 Say hello in the <strong>Forum</strong></li>
              </ul>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <Button
          onClick={handleNext}
          variant="harbor"
          size="lg"
          className="w-full"
          disabled={isPending}
        >
          {step < STEPS.length - 1 ? (
            <>Next <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></>
          ) : isPending ? 'Setting up your account…' : (
            <>Enter MiLyfe <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></>
          )}
        </Button>
      </div>
    </div>
  );
}

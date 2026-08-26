'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // If email confirmation is required by Supabase (no immediate session)
    if (authData?.user && !authData.session) {
      setSubmitted(true);
      setLoading(false);
      return;
    }

    router.push('/onboarding');
    router.refresh();
  }

  async function handleResendEmail() {
    if (!email) return;
    setResending(true);
    setResendStatus('');
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    setResending(false);
    if (resendError) {
      setResendStatus(`Failed to resend: ${resendError.message}`);
    } else {
      setResendStatus('Confirmation email resent! Please check your inbox and spam folder.');
    }
  }

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <img src="/logo.png" alt="MiLyfe" className="h-12 w-auto mx-auto mb-2" />
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 mx-auto">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-harbor-800 dark:text-white">
          Verify Your Email
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
          We sent a verification link to <span className="font-semibold text-harbor-900 dark:text-white">{email}</span>. Please click the link to activate your account.
        </p>

        {resendStatus && (
          <p className="text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 p-2 rounded-lg">
            {resendStatus}
          </p>
        )}

        <div className="pt-2 space-y-3">
          <Link href="/login">
            <Button variant="harbor" size="lg" className="w-full">
              Proceed to Sign In
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendEmail}
            disabled={resending}
            className="w-full text-xs"
          >
            {resending ? 'Resending...' : 'Resend Confirmation Email'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Image src="/logo.png" alt="MiLyfe" width={88} height={32} priority className="h-10 w-auto max-w-[120px] object-contain mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-harbor-800 dark:text-white">
          Join MiLyfe
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Your city. Your Lyfe. Your platform.
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-harbor-800 dark:text-gray-200 mb-1">
            Username
          </label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="your_username"
            required
            autoComplete="username"
            minLength={3}
            maxLength={24}
            pattern="[a-z0-9_]+"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-harbor-800 dark:text-gray-200 mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-harbor-800 dark:text-gray-200 mb-1">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            autoComplete="new-password"
            minLength={8}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
        )}

        <Button type="submit" variant="harbor" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-teal-600 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}

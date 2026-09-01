'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
 const router = useRouter();
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [unconfirmed, setUnconfirmed] = useState(false);
 const [resending, setResending] = useState(false);
 const [resendStatus, setResendStatus] = useState('');

 async function handleLogin(e: React.FormEvent) {
 e.preventDefault();
 setError('');
 setUnconfirmed(false);
 setResendStatus('');
 setLoading(true);

 const supabase = createClient();
 const { error: authError } = await supabase.auth.signInWithPassword({
 email,
 password,
 });

 if (authError) {
 if (
 authError.message.toLowerCase().includes('email not confirmed') ||
 (authError as any).code === 'email_not_confirmed'
 ) {
 setUnconfirmed(true);
 setError('Your email address has not been confirmed yet.');
 } else {
 setError(authError.message);
 }
 setLoading(false);
 return;
 }

 router.push('/home');
 router.refresh();
 }

 async function handleResend() {
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
 setResendStatus(`Could not resend: ${resendError.message}`);
 } else {
 setResendStatus('Confirmation link resent. Please check your inbox & spam folder.');
 }
 }

 return (
 <div className="space-y-6">
 <div className="text-center">
 <Image src="/logo.png" alt="MiLyfe" width={88} height={32} priority className="h-10 w-auto max-w-[120px] object-contain mx-auto mb-4" />
 <h1 className="text-2xl font-bold text-harbor-800 ">
 Welcome back
 </h1>
 <p className="text-sm text-gray-500 mt-1">
 Sign in to your MiLyfe account
 </p>
 </div>

 <form onSubmit={handleLogin} className="space-y-4">
 <div>
 <label htmlFor="email" className="block text-sm font-medium text-harbor-800 mb-1">
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
 <label htmlFor="password" className="block text-sm font-medium text-harbor-800 mb-1">
 Password
 </label>
 <Input
 id="password"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="Your password"
 required
 autoComplete="current-password"
 />
 </div>

 {error && (
 <div className="text-sm text-red-600 p-3 bg-red-50 rounded-lg space-y-2" role="alert">
 <p>{error}</p>
 {unconfirmed && (
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={handleResend}
 disabled={resending}
 className="w-full text-xs"
 >
 {resending ? 'Resending...' : 'Resend confirmation email'}
 </Button>
 )}
 </div>
 )}

 {resendStatus && (
 <p className="text-xs text-teal-600 bg-teal-50 p-2 rounded-lg text-center">
 {resendStatus}
 </p>
 )}

 <Button type="submit" variant="harbor" size="lg" className="w-full" disabled={loading}>
 {loading ? 'Signing in...' : 'Sign in'}
 </Button>
 </form>

 <p className="text-center text-sm text-gray-500">
 New to MiLyfe?{' '}
 <Link href="/signup" className="text-teal-600 hover:underline font-medium">
 Create an account
 </Link>
 </p>
 </div>
 );
}

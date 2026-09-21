import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Good morning.</h1>
      <p className="text-gray-600 dark:text-gray-300">
        One signup, one profile, your whole life together. Free forever for rights, learning, and emergencies.
      </p>
      <div className="grid gap-3">
        <Link href="/onboarding" className="rounded-2xl bg-emerald-700 p-4 font-semibold text-white">Join MiLyfe — start onboarding</Link>
        <Link href="/pocket" className="rounded-2xl border border-gray-200 bg-white p-4 font-semibold dark:border-gray-700 dark:bg-gray-900">Open your Pocket</Link>
        <Link href="/you" className="rounded-2xl border border-gray-200 bg-white p-4 font-semibold dark:border-gray-700 dark:bg-gray-900">Safety is one tap away</Link>
      </div>
      <p className="text-xs text-gray-500">Tree V1 slice: Kernel + MiOnboard + MiMoney + MiForge. Offline-first. Your keys never leave this device.</p>
    </div>
  );
}

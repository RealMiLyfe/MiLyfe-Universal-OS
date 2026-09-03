import Link from 'next/link';
import { ArrowLeft, Check, Clock } from 'lucide-react';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';
import type { ModuleDef } from '@/lib/justice/data';

/**
 * Shared scaffold for a MiJustice module page. Matches the MiLyfe dashboard
 * look: light surfaces, rounded-xl white cards, teal accents, animate-fade-in.
 */
export function ModuleScaffold({
  module,
  children,
}: {
  module: ModuleDef;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        href="/justice/app/home"
        className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> MiJustice
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-harbor-800">{module.title}</h1>
          <StatusBadge status={module.status} />
        </div>
        <p className="text-gray-500">{module.tagline}</p>
      </div>

      <LegalDisclaimer />

      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <h2 className="mb-3 font-semibold text-harbor-800">What this does</h2>
        <p className="text-gray-600">{module.purpose}</p>
        <ul className="mt-3 space-y-2">
          {module.does.map((d) => (
            <li key={d} className="flex items-start gap-2 text-sm text-harbor-800">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>

      {children}

      {module.status === 'coming_soon' && (
        <div className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-harbor-400" aria-hidden="true" />
          <p>
            This tool is being built. Tools that generate or file legal documents
            unlock only after a licensed attorney reviews them for your
            jurisdiction. In the meantime, start with{' '}
            <Link href="/justice/rights" className="text-teal-600 hover:underline">Know Your Rights</Link>{' '}
            or the{' '}
            <Link href="/justice/app/defender" className="text-teal-600 hover:underline">Constitutional Defender</Link>.
          </p>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: ModuleDef['status'] }) {
  const map: Record<ModuleDef['status'], { cls: string; label: string }> = {
    available: { cls: 'bg-green-100 text-green-700', label: 'Available' },
    preview: { cls: 'bg-mly-100 text-mly-800', label: 'Preview' },
    coming_soon: { cls: 'bg-gray-100 text-gray-500', label: 'Coming soon' },
  };
  const { cls, label } = map[status];
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{label}</span>;
}

import Link from 'next/link';
import { ArrowLeft, Check, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';
import type { ModuleDef } from '@/lib/justice/data';

/**
 * Shared scaffold for a MiJustice module page. Keeps all modules consistent
 * with the MiLyfe design system and DRY. Renders purpose, what-it-does, status,
 * and an optional custom body (children) for interactive modules.
 */
export function ModuleScaffold({
  module,
  children,
}: {
  module: ModuleDef;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <Link
        href="/justice/app/home"
        className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> MiJustice
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="page-title">{module.title}</h1>
          <StatusBadge status={module.status} />
        </div>
        <p className="page-subtitle">{module.tagline}</p>
      </div>

      <LegalDisclaimer />

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="section-header border-b-2 border-mly-500 pb-1">What this does</h2>
        <p className="mt-3 text-gray-600">{module.purpose}</p>
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
        <div className="flex items-start gap-2 rounded-xl border border-gray-100 bg-surface-light p-4 text-sm text-gray-600">
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
  if (status === 'available') return <Badge variant="success">Available</Badge>;
  if (status === 'preview') return <Badge variant="mly">Preview</Badge>;
  return <Badge variant="secondary">Coming soon</Badge>;
}

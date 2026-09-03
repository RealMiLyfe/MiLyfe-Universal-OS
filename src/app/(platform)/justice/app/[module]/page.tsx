import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ModuleScaffold } from '@/components/justice/module-scaffold';
import { MODULES, getModule } from '@/lib/justice/data';

// Modules that have their own dedicated interactive route (handled elsewhere).
const DEDICATED = new Set([
  'defender', 'ice-shield', 'class-actions', 'knowledge', 'liberation',
  'coalition', 'pressure', 'expungement',
]);

export function generateStaticParams() {
  return MODULES.filter((m) => !DEDICATED.has(m.slug)).map((m) => ({ module: m.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ module: string }> }
): Promise<Metadata> {
  const { module } = await params;
  const m = getModule(module);
  return { title: m ? `${m.title} — MiJustice` : 'MiJustice' };
}

export default async function GenericModulePage(
  { params }: { params: Promise<{ module: string }> }
) {
  const { module } = await params;
  const m = getModule(module);
  if (!m || DEDICATED.has(m.slug)) notFound();
  return <ModuleScaffold module={m} />;
}

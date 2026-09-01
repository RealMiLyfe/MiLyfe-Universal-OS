import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';
import { loadLegalDoc } from '@/lib/legal/load-doc';

export const metadata: Metadata = {
  title: 'Security Policy · MiLyfe',
  description: 'How to report vulnerabilities and how MiLyfe protects the platform.',
};

export default function SecurityPage() {
  return <LegalPage markdown={loadLegalDoc('SECURITY.md')} />;
}

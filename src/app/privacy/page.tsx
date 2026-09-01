import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';
import { loadLegalDoc } from '@/lib/legal/load-doc';

export const metadata: Metadata = {
  title: 'Privacy Policy · MiLyfe',
  description: 'How MiLyfe collects, protects, and never sells your data.',
};

export default function PrivacyPage() {
  return <LegalPage markdown={loadLegalDoc('PRIVACY.md')} />;
}

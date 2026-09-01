import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';
import { loadLegalDoc } from '@/lib/legal/load-doc';

export const metadata: Metadata = {
  title: 'Terms of Use · MiLyfe',
  description: 'The rules of the MiLyfe commons, in plain language.',
};

export default function TermsPage() {
  return <LegalPage markdown={loadLegalDoc('TERMS.md')} />;
}

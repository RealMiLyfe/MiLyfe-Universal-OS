import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';
import { loadLegalDoc } from '@/lib/legal/load-doc';

export const metadata: Metadata = {
  title: 'The Receipts · MiLyfe',
  description:
    'The paper trail. Blockchain-timestamped proof of the work, from 2017 to today. Verify it yourself.',
};

export default function ReceiptsPage() {
  return <LegalPage markdown={loadLegalDoc('RECEIPTS.md')} />;
}

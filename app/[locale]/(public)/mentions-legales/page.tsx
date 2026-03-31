import MentionsLegales from '@/app/pages/MentionsLegales';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales',
};

export default function MentionsLegalesPage() {
  return <MentionsLegales />;
}

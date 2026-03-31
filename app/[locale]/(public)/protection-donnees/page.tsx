import ProtectionDonnees from '@/app/pages/ProtectionDonnees';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Protection des données',
};

export default function ProtectionDonneesPage() {
  return <ProtectionDonnees />;
}

import SoumettreProjet from "@/app/pages/SoumettreProjet";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Soumettre un projet',
  description: 'Proposez votre projet de développement local au Cameroun.',
};

export default function SoumettreProjetPage() {
  return <SoumettreProjet />;
}
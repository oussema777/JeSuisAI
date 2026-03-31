import  APropos  from "@/app/pages/APropos";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Découvrez la mission et les valeurs de Je suis au Cameroun, plateforme de mise en relation pour la diaspora.',
};

export default function AProposPage() {
  return <APropos />;
}

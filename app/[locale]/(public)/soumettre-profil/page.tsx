import SoumettreProfil from "@/app/pages/SoumettreProfil";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Soumettre un profil',
  description: 'Soumettez votre profil pour rejoindre la communauté Je suis au Cameroun.',
};

export default function SoumettreProfilPage() {
  return <SoumettreProfil />;
}

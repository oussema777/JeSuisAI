import CommentCaMarche from "@/app/pages/CommentCaMarche";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comment ça marche',
  description: 'Découvrez comment fonctionne Je suis au Cameroun et comment participer au développement local.',
};

export default function CommentCaMarchePage() {
  return <CommentCaMarche />;
}

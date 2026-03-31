import type { Metadata } from 'next';
import { PremiereVisiteWrapper } from './PremiereVisiteWrapper';

export const metadata: Metadata = {
  title: 'Première visite',
  description: 'Découvrez comment contribuer au développement du Cameroun avec Je suis au Cameroun.',
};

export default function PremiereVisitePage() {
  return <PremiereVisiteWrapper />;
}

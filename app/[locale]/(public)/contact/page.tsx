import { Contact } from "@/app/pages/Contact";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez l\'équipe Je suis au Cameroun pour toute question ou suggestion.',
};

export default function ContactPage() {
  return <Contact />;
}

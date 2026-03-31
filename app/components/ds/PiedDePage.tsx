import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface ColonneFooter {
  titre: string;
  liens: { label: string; href: string }[];
}

interface PiedDePageProps {
  colonnes?: ColonneFooter[];
  copyright?: string;
}

export function PiedDePage({ colonnes = [], copyright }: PiedDePageProps) {
  const defaultColonnes: ColonneFooter[] = [
    {
      titre: 'À propos',
      liens: [
        { label: 'Notre mission', href: '/a-propos' },
        { label: 'Notre équipe', href: '/a-propos' },
        { label: 'Nos partenaires', href: '/a-propos' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      titre: 'Missions',
      liens: [
        { label: 'Toutes les missions', href: '/missions' },
        { label: 'Par secteur', href: '/missions' },
        { label: 'Par région', href: '/missions' },
        { label: 'Proposer une mission', href: '/soumettre-projet' },
      ],
    },
    {
      titre: 'Ressources',
      liens: [
        { label: 'Guide de participation', href: '/comment-ca-marche' },
        { label: 'FAQ', href: '/comment-ca-marche' },
        { label: 'Actualités', href: '/actualites' },
        { label: 'Documentation', href: '#' },
      ],
    },
    {
      titre: 'Légal',
      liens: [
        { label: 'Mentions légales', href: '/mentions-legales' },
        { label: 'Politique de confidentialité', href: '/protection-donnees' },
        { label: "Conditions d'utilisation", href: '/mentions-legales' },
        { label: 'Cookies', href: '/protection-donnees' },
      ],
    },
  ];
  
  const colonnesToDisplay = colonnes.length > 0 ? colonnes : defaultColonnes;
  
  return (
    <footer className="w-full bg-bg-base text-white">
      <div className="px-5 md:px-10 lg:px-20 py-16">
        {/* Logo Section */}
        <div className="mb-12">
          <Image
            src="/placeholder-logo.svg" 
            alt="Je suis au Cameroun"
            width={180}
            height={48}
            className="h-12 w-auto brightness-0 invert"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {colonnesToDisplay.map((colonne, index) => (
            <div key={index} className="flex flex-col gap-4">
              <h4
                className="text-white"
                style={{ fontSize: '15px', fontWeight: 600 }}
              >
                {colonne.titre}
              </h4>
              <nav className="flex flex-col gap-4">
                {colonne.liens.map((lien, lienIndex) => (
                  <Link
                    key={lienIndex}
                    href={lien.href}
                    className="text-white hover:text-white/80 transition-colors"
                    style={{ fontSize: '15px', fontWeight: 400, lineHeight: '1.8' }}
                  >
                    {lien.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
        
        {copyright && (
          <div className="mt-16 pt-8 border-t border-white/20">
            <p
              className="text-white/80 text-center"
              style={{ fontSize: '14px', fontWeight: 400 }}
            >
              {copyright}
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}
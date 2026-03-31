'use client';
import React from 'react';
import { Building2 } from 'lucide-react';
import { Bouton } from '../ds/Bouton';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface CarteMunicipaliteProps {
  nom: string;
  region: string;
  logo?: string;
  href?: string;
}

export function CarteMunicipalite({ nom, region, logo, href }: CarteMunicipaliteProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 flex flex-col items-center text-center">
      {/* Logo */}
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 overflow-hidden">
        {logo ? (
          <Image src={logo} alt={nom} width={80} height={80} className="w-full h-full object-cover" />
        ) : (
          <Building2 className="w-10 h-10 text-primary" strokeWidth={2} />
        )}
      </div>
      
      {/* Nom */}
      <h4 className="text-neutral-800 mb-1" style={{ fontSize: '18px', lineHeight: '1.4', fontWeight: 600 }}>
        {nom}
      </h4>
      
      {/* Région */}
      <p className="text-neutral-600 mb-6" style={{ fontSize: '14px', lineHeight: '1.5', fontWeight: 400 }}>
        {region}
      </p>
      
      {/* Bouton */}
      {href &&
        <Link href={href} passHref>
            <Bouton variant="secondaire" size="moyen" fullWidth>
                Voir le profil
            </Bouton>
        </Link>
      }
    </div>
  );
}
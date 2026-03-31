'use client';
import React from 'react';
import { Bouton } from './Bouton';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface CarteMairieProps {
  logo?: string;
  nom: string;
  region: string;
  buttonText?: string;
  href?: string;
}

export function CarteMairie({
  logo,
  nom,
  region,
  buttonText = 'Découvrir',
  href,
}: CarteMairieProps) {
  const buttonContent = (
    <Bouton variant="primaire" size="moyen" fullWidth>
      {buttonText}
    </Bouton>
  );
  return (
    <div className="flex flex-col items-center w-full max-w-[280px] bg-white border border-neutral-200 rounded-xl p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0px_4px_16px_rgba(0,0,0,0.12)] transition-shadow">
      <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-5 overflow-hidden">
        {logo ? (
          <Image src={logo} alt={nom} width={80} height={80} className="w-full h-full object-cover" />
        ) : (
          <span className="text-neutral-400" style={{ fontSize: '32px', fontWeight: 600 }}>
            {nom.charAt(0)}
          </span>
        )}
      </div>
      
      <h4
        className="text-center mb-2"
        style={{ fontSize: '20px', lineHeight: '1.4', fontWeight: 500 }}
      >
        {nom}
      </h4>
      
      <p
        className="text-neutral-600 text-center mb-6"
        style={{ fontSize: '14px', fontWeight: 400 }}
      >
        {region}
      </p>
      
      <div className="w-full">
        {href ? (
          <Link href={href} passHref>
            {buttonContent}
          </Link>
        ) : (
          buttonContent
        )}
      </div>
    </div>
  );
}

'use client';
import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface CarteActualiteProps {
  image?: string;
  date: string;
  categorie: {
    label: string;
    variant: 'evenement' | 'actualite' | 'annonce';
  };
  titre: string;
  extrait: string;
  lienTexte?: string;
  href?: string;
  onLienClick?: () => void;
}

export function CarteActualite({
  image,
  date,
  categorie,
  titre,
  extrait,
  lienTexte = 'Lire la suite',
  href,
  onLienClick,
}: CarteActualiteProps) {
  const categorieColors = {
    evenement: 'bg-accent/10 text-accent',
    actualite: 'bg-info/10 text-info',
    annonce: 'bg-success/10 text-success',
  };

  const linkContent = (
    <div
      className="inline-flex items-center gap-1 text-primary hover:gap-2 transition-all mt-auto"
      style={{ fontSize: '14px', fontWeight: 500 }}
    >
      {lienTexte}
      <ArrowRight className="w-4 h-4" strokeWidth={2} />
    </div>
  );
  
  return (
    <div className="flex flex-col w-full max-w-[340px] bg-white rounded-xl p-5 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0px_4px_16px_rgba(0,0,0,0.12)] transition-shadow">
      {image && (
        <div className="mb-4 w-full aspect-video bg-neutral-200 rounded-lg overflow-hidden relative">
          <Image src={image} alt={titre} fill className="object-cover" />
        </div>
      )}
      
      <div className="flex items-center gap-1.5 mb-2">
        <Calendar className="w-3.5 h-3.5 text-neutral-500" strokeWidth={2} />
        <span className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 400 }}>
          {date}
        </span>
      </div>
      
      <div className="mb-3">
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded ${categorieColors[categorie.variant]}`}
          style={{ fontSize: '12px', fontWeight: 600 }}
        >
          {categorie.label}
        </span>
      </div>
      
      <h4 className="mb-3" style={{ fontSize: '20px', lineHeight: '1.4', fontWeight: 500 }}>
        {titre}
      </h4>
      
      <p
        className="text-neutral-700 mb-4 line-clamp-2"
        style={{ fontSize: '14px', lineHeight: '1.6', fontWeight: 400 }}
      >
        {extrait}
      </p>
      
      {href ? (
          <Link href={href} passHref>
            {linkContent}
          </Link>
        ) : (
          <button onClick={onLienClick}>
            {linkContent}
          </button>
        )}
    </div>
  );
}

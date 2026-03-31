'use client';
import React from 'react';
import Image from 'next/image';

interface CartePartenaireProps {
  nom: string;
  logo?: string;
}

export function CartePartenaire({ nom, logo }: CartePartenaireProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-white border border-neutral-200 rounded-xl p-8 hover:border-primary/40 hover:shadow-md transition-all group">
      {/* Logo placeholder */}
      <div className="w-[120px] h-[120px] flex items-center justify-center mb-4 grayscale group-hover:grayscale-0 transition-all relative">
        {logo ? (
          <Image
            src={logo}
            alt={nom}
            fill
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full bg-neutral-100 rounded-lg flex items-center justify-center">
            <span className="text-neutral-400 text-center px-2" style={{ fontSize: '12px', fontWeight: 500 }}>
              {nom}
            </span>
          </div>
        )}
      </div>
      
      {/* Nom */}
      <p
        className="text-neutral-700 text-center"
        style={{ fontSize: '14px', fontWeight: 500 }}
      >
        {nom}
      </p>
    </div>
  );
}

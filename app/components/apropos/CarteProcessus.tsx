import React from 'react';

interface CarteProcessusProps {
  numero: string;
  titre: string;
  description: string;
}

export function CarteProcessus({ numero, titre, description }: CarteProcessusProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Numéro badge */}
      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
        <span
          className="text-white"
          style={{ fontSize: '31px', fontWeight: 600 }}
        >
          {numero}
        </span>
      </div>
      
      {/* Titre */}
      <h3
        className="text-neutral-900 mb-3"
        style={{ fontSize: '18px', fontWeight: 600 }}
      >
        {titre}
      </h3>
      
      {/* Description */}
      <p
        className="text-neutral-700"
        style={{ fontSize: '15px', fontWeight: 400, lineHeight: '1.6' }}
      >
        {description}
      </p>
    </div>
  );
}

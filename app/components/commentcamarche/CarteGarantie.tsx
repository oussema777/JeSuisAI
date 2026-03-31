import React from 'react';

interface CarteGarantieProps {
  icon: React.ReactNode;
  titre: string;
  description: string;
}

export function CarteGarantie({ icon, titre, description }: CarteGarantieProps) {
  return (
    <div className="flex flex-col items-start">
      {/* Icon */}
      <div className="w-8 h-8 text-primary mb-3">
        {icon}
      </div>
      
      {/* Titre */}
      <h3
        className="text-neutral-900 mb-2"
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

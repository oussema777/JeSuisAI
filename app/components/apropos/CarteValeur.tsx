import React from 'react';

interface CarteValeurProps {
  icon: React.ReactNode;
  titre: string;
  description: string;
}

export function CarteValeur({ icon, titre, description }: CarteValeurProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Icon */}
      <div className="w-12 h-12 text-primary mb-4">
        {icon}
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

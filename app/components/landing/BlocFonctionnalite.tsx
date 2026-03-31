import React from 'react';

interface BlocFonctionnaliteProps {
  icon: React.ReactNode;
  titre: string;
  description: string;
}

export function BlocFonctionnalite({ icon, titre, description }: BlocFonctionnaliteProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
        <div className="text-primary w-6 h-6">
          {icon}
        </div>
      </div>
      
      <h4 style={{ fontSize: '20px', lineHeight: '1.4', fontWeight: 500 }}>
        {titre}
      </h4>
      
      <p className="text-neutral-600" style={{ fontSize: '14px', lineHeight: '1.5', fontWeight: 400 }}>
        {description}
      </p>
    </div>
  );
}

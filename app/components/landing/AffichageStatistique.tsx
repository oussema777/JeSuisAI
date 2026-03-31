import React from 'react';

interface AffichageStatistiqueProps {
  nombre: string;
  label: string;
}

export function AffichageStatistique({ nombre, label }: AffichageStatistiqueProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-white" style={{ fontSize: '49px', lineHeight: '1.2', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
        {nombre}
      </span>
      <span className="text-white/90" style={{ fontSize: '16px', lineHeight: '1.6', fontWeight: 400 }}>
        {label}
      </span>
    </div>
  );
}

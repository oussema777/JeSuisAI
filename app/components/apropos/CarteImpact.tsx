import React from 'react';

interface CarteImpactProps {
  icon: React.ReactNode;
  nombre: string;
  label: string;
  description: string;
}

export function CarteImpact({ icon, nombre, label, description }: CarteImpactProps) {
  return (
    <div className="flex flex-col items-center bg-white rounded-xl p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.08)]">
      {/* Icon */}
      <div className="w-8 h-8 text-primary mb-4">
        {icon}
      </div>
      
      {/* Nombre */}
      <div
        className="text-primary mb-2"
        style={{ fontSize: '49px', fontWeight: 600, lineHeight: '1' }}
      >
        {nombre}
      </div>
      
      {/* Label */}
      <p
        className="text-neutral-900 text-center mb-2"
        style={{ fontSize: '16px', fontWeight: 500 }}
      >
        {label}
      </p>
      
      {/* Description */}
      <p
        className="text-neutral-600 text-center italic"
        style={{ fontSize: '14px', fontWeight: 400 }}
      >
        {description}
      </p>
    </div>
  );
}

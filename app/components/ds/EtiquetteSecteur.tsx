import React from 'react';

interface EtiquetteSecteurProps {
  icon: React.ReactNode;
  label: string;
}

export function EtiquetteSecteur({ icon, label }: EtiquetteSecteurProps) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
      <span className="w-4 h-4 flex-shrink-0 text-primary flex items-center justify-center">
        {icon}
      </span>
      <span className="text-primary" style={{ fontSize: '14px', fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
}

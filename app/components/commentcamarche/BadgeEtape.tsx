import React from 'react';

interface BadgeEtapeProps {
  numero: string;
}

export function BadgeEtape({ numero }: BadgeEtapeProps) {
  return (
    <div className="inline-flex items-center px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
      <span
        className="text-primary"
        style={{ fontSize: '14px', fontWeight: 600 }}
      >
        ÉTAPE {numero}
      </span>
    </div>
  );
}

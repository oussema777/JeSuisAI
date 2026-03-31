import React from 'react';

interface BlocInfosClesProps {
  description?: string; // New: paragraph text describing contributions
  infos?: any[]; // Legacy support
  items?: any[]; // Legacy support
}

export function BlocInfosCles({ description, infos, items }: BlocInfosClesProps) {
  return (
    <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-5">
      <h4 className="text-neutral-800 mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>
        Contributions diaspora recherchées
      </h4>
      
      {description ? (
        <p className="text-neutral-700" style={{ fontSize: '14px', lineHeight: '1.7', fontWeight: 400 }}>
          {description}
        </p>
      ) : (
        <p className="text-neutral-500 italic" style={{ fontSize: '14px', lineHeight: '1.7', fontWeight: 400 }}>
          Aucune contribution spécifiée
        </p>
      )}
    </div>
  );
}

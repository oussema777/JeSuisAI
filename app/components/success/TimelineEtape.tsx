import React from 'react';

interface Etape {
  numero: number;
  titre: string;
  description: string;
}

interface TimelineEtapeProps {
  etapes: Etape[];
}

export function TimelineEtape({ etapes }: TimelineEtapeProps) {
  return (
    <div className="flex flex-col gap-6">
      {etapes.map((etape, index) => (
        <div key={etape.numero} className="flex gap-4">
          {/* Numéro de l'étape */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white" style={{ fontSize: '15px', fontWeight: 600 }}>
                {etape.numero}
              </span>
            </div>
            
            {/* Ligne de connexion (sauf pour la dernière étape) */}
            {index < etapes.length - 1 && (
              <div className="w-0.5 h-full min-h-[40px] bg-neutral-200 mt-2"></div>
            )}
          </div>
          
          {/* Contenu de l'étape */}
          <div className="flex-1 pb-2">
            <h4 className="text-neutral-800 mb-2" style={{ fontSize: '16px', fontWeight: 600 }}>
              {etape.titre}
            </h4>
            <p className="text-neutral-600" style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 400 }}>
              {etape.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

import React from 'react';
import { Check } from 'lucide-react';

const facilites = [
  'Connexion directe avec les municipalités',
  'Projets vérifiés et transparents',
  'Suivi en temps réel',
  'Support dédié diaspora',
  'Rapports d\'impact réguliers',
  'Réseau de professionnels',
];

export function FacilitesPlateforme() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-[0px_2px_12px_rgba(0,0,0,0.08)]">
      <h3 className="text-neutral-900 mb-6" style={{ fontSize: '24px', fontWeight: 600 }}>
        Facilités offertes par la plateforme
      </h3>
      
      <div className="space-y-4">
        {facilites.map((facilite, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-4 h-4 text-primary" strokeWidth={2.5} />
            </div>
            <span className="text-neutral-700" style={{ fontSize: '15px', fontWeight: 400, lineHeight: '1.6' }}>
              {facilite}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

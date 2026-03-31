import React from 'react';
import { ArrowRight } from 'lucide-react';

interface DetailCandidature {
  label: string;
  valeur: string;
}

interface CarteRecapitulatifProps {
  details: DetailCandidature[];
  onVoirDetails?: () => void;
}

export function CarteRecapitulatif({ details, onVoirDetails }: CarteRecapitulatifProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <h3 className="text-neutral-800 mb-4" style={{ fontSize: '15px', fontWeight: 600 }}>
        Récapitulatif de votre candidature
      </h3>
      
      {/* Grille des détails */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {details.map((detail, index) => (
          <div key={index}>
            <dt className="text-neutral-600 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
              {detail.label}
            </dt>
            <dd className="text-neutral-800" style={{ fontSize: '15px', fontWeight: 400 }}>
              {detail.valeur}
            </dd>
          </div>
        ))}
      </div>
      
      {/* Lien vers détails */}
      {onVoirDetails && (
        <button
          onClick={onVoirDetails}
          className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
          style={{ fontSize: '14px', fontWeight: 500 }}
        >
          Voir les détails de ma candidature
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

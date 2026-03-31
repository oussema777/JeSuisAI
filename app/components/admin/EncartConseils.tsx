import React from 'react';
import { Lightbulb } from 'lucide-react';

export function EncartConseils() {
  const conseils = [
    'Soyez précis dans les compétences recherchées',
    'Indiquez des objectifs mesurables',
    'Proposez des facilités concrètes',
    'Ajoutez des documents techniques',
    'Répondez rapidement aux candidatures',
  ];

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 sticky top-24">
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="w-5 h-5 text-blue-600" strokeWidth={2} />
        <h4 className="text-neutral-900" style={{ fontSize: '15px', fontWeight: 600 }}>
          Conseils pour une action attractive
        </h4>
      </div>
      
      <ul className="space-y-3">
        {conseils.map((conseil, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-neutral-700"
            style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.5' }}
          >
            <span className="text-blue-600 mt-0.5 flex-shrink-0">•</span>
            <span>{conseil}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

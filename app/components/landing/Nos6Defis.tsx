import React from 'react';
import { CheckSquare, Network, Globe, MessageCircle, Award, Handshake } from 'lucide-react';

const defis = [
  {
    icon: CheckSquare,
    label: 'Sélection des acteurs et des missions',
    color: '#016B06', // Brand Green
  },
  {
    icon: Network,
    label: 'Diversité des actions proposées',
    color: '#016B06', // Brand Green
  },
  {
    icon: Globe,
    label: 'Filtres de recherche optimisés',
    color: '#016B06', // Brand Green
  },
  {
    icon: MessageCircle,
    label: 'Interlocuteur « diaspora » dédié et formé (chez chacun de nos membres)',
    color: '#016B06', // Brand Green
  },
  {
    icon: Award,
    label: 'Suivi qualité',
    color: '#016B06', // Brand Green
  },
  {
    icon: Handshake,
    label: 'Charte éthique',
    color: '#016B06', // Brand Green
  },
  {
    icon: Award,
    label: 'Transparence et redevabilité',
    color: '#016B06', // Brand Green
  },
];

export function Nos6Defis() {
  return (
    <div className="space-y-10">
      {/* Title */}
      <div>
        <h3 
          className="text-bg-base" 
          style={{ 
            fontSize: '36px', 
            lineHeight: '1.3', 
            fontWeight: 600, 
            fontFamily: 'Poppins, sans-serif' 
          }}
        >
          Nos 7 défis pour gagner la confiance de la diaspora
        </h3>
      </div>

      {/* Grid of 6 Défis - 2x3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {defis.map((defi, index) => {
          const Icon = defi.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-start p-5 bg-white rounded-xl shadow-[0px_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 border border-neutral-100"
            >
              {/* Icon Container */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${defi.color}15` }}
              >
                <Icon
                  className="w-7 h-7"
                  strokeWidth={2}
                  style={{ color: defi.color }}
                />
              </div>

              {/* Label */}
              <p
                className="text-neutral-800"
                style={{
                  fontSize: '19px',
                  lineHeight: '1.5',
                  fontWeight: 500,
                  fontFamily: 'Open Sans, sans-serif',
                }}
              >
                {defi.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
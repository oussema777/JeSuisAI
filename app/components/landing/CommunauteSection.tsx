import React from 'react';
import Image from 'next/image';
import { Building2, Plane, Heart, Building } from 'lucide-react';

const ecosystemActors = [
  {
    icon: Building2,
    label: 'Collectivités locales',
  },
  {
    icon: Plane,
    label: 'Aéroports internationaux',
  },
  {
    icon: Heart,
    label: 'ONG',
  },
  {
    icon: Building,
    label: 'Entreprises',
  },
];

export function CommunauteSection() {
  return (
    <div className="space-y-10">
      {/* Title */}
      <div>
        <Image 
          src="https://jesuisaupays.com/wp-content/uploads/2026/01/2-1.png" 
          alt="Jesuisaucameroun.com, avant tout une communauté !" 
          width={500} // TODO: Update with correct width
          height={100} // TODO: Update with correct height
          className="w-auto object-contain"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {/* Body Text */}
        <p 
          style={{
            fontSize: '16px',
            lineHeight: '1.7',
            fontWeight: 400,
            fontFamily: 'Open Sans, sans-serif',
            color: '#4B5563',
            marginTop: '16px'
          }}
        >
          Aux côtés de Douala et des villes membres d'<strong>l'Association des Maires de Villes du Cameroun (AMVC)</strong>, chefs de file, jesuisaucameroun.com rassemble un écosystème d'acteurs engagés, unis par la même éthique et cette ambition commune : libérer tout le potentiel de la diaspora camerounaise au service du développement inclusif de nos territoires. Pratiquement, ces acteurs s'engagent à sélectionner et publier des missions adaptées à la diaspora, dédier un dispositif qualité (interlocuteur « diaspora »…) et respecter la charte éthique.
        </p>
      </div>

      {/* Ecosystem Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-5">
        {ecosystemActors.map((actor, index) => {
          const Icon = actor.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-white rounded-xl transition-all duration-300 hover:shadow-[0px_8px_24px_rgba(0,0,0,0.08)] border border-neutral-200"
            >
              {/* Icon - Brand Green */}
              <div className="mb-4">
                <Icon
                  className="w-12 h-12"
                  strokeWidth={1.5}
                  style={{ color: '#016B06' }}
                />
              </div>

              {/* Label */}
              <h3
                style={{
                  fontSize: '16px',
                  lineHeight: '1.4',
                  fontWeight: 600,
                  fontFamily: 'Poppins, sans-serif',
                  color: '#003A54'
                }}
              >
                {actor.label}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}
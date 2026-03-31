import React from 'react';
import { CheckSquare, Network, Globe, MessageCircle, Award, Handshake, Building2, Plane, Heart, Building } from 'lucide-react';

const defis = [
  {
    icon: CheckSquare,
    label: 'Sélection des acteurs et des missions',
    color: '#016B06', // Brand Green
  },
  {
    icon: Network,
    label: 'Diversité des actions proposées',
    color: '#F8E007', // Brand Yellow
  },
  {
    icon: Globe,
    label: 'Filtres de recherche optimisés',
    color: '#003A54', // Brand Blue
  },
  {
    icon: MessageCircle,
    label: 'Interlocuteur « diaspora » dédié et formé (chez chacun de nos membres)',
    color: '#EE0003', // Brand Red
  },
  {
    icon: Award,
    label: 'Suivi qualité',
    color: '#016B06', // Brand Green
  },
  {
    icon: Handshake,
    label: 'Charte éthique',
    color: '#F8E007', // Brand Yellow
  },
  {
    icon: Award,
    label: 'Transparence et redevabilité',
    color: '#EE0003', // Brand Red
  },
];

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

export function DefisEtCommunaute() {
  return (
    <section className="w-full py-20 bg-gradient-to-b from-white to-neutral-50">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-20">
        
        {/* Two Column Layout - SWAPPED: Communauté LEFT, Défis RIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* LEFT COLUMN: Une Communauté */}
          <div className="space-y-10">
            {/* Title with Accent Line */}
            <div>
              <h2 
                className="mb-4" 
                style={{ 
                  fontSize: '36px', 
                  lineHeight: '1.2', 
                  fontWeight: 600, 
                  fontFamily: 'Poppins, sans-serif',
                  color: '#003A54'
                }}
              >
                Jesuisaucameroun.com, avant tout une communauté !
              </h2>
              {/* Accent Line */}
              <div 
                className="rounded-full" 
                style={{ 
                  width: '80px', 
                  height: '4px', 
                  backgroundColor: '#016B06' 
                }}
              />
            </div>

            {/* Body Text */}
            <div>
              <p 
                style={{
                  fontSize: '16px',
                  lineHeight: '1.7',
                  fontWeight: 400,
                  fontFamily: 'Open Sans, sans-serif',
                  color: '#4B5563'
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
                    {/* Icon - Brand Yellow */}
                    <div className="mb-4">
                      <Icon
                        className="w-12 h-12"
                        strokeWidth={1.5}
                        style={{ color: '#F8E007' }}
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

          {/* RIGHT COLUMN: Nos 7 Défis */}
          <div className="space-y-10">
            {/* Title */}
            <div>
              <h2 
                className="text-bg-base" 
                style={{ 
                  fontSize: '36px', 
                  lineHeight: '1.2', 
                  fontWeight: 600, 
                  fontFamily: 'Poppins, sans-serif' 
                }}
              >
                Nos 7 défis pour gagner la confiance de la diaspora et libérer son potentiel
              </h2>
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
                        fontSize: '15px',
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

        </div>
      </div>
    </section>
  );
}
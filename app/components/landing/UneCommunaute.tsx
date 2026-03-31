import React from 'react';
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

export function UneCommunaute() {
  return (
    <section className="w-full bg-white" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20">
        {/* Section Title with Accent Line */}
        <div className="text-center mb-8">
          <h2 
            className="mb-4" 
            style={{ 
              fontSize: '39px', 
              lineHeight: '1.2', 
              fontWeight: 600, 
              fontFamily: 'Poppins, sans-serif',
              color: '#003A54'
            }}
          >
            Jesuisaucameroun.com, avant tout une communauté !
          </h2>
          {/* Accent Line */}
          <div className="flex justify-center">
            <div 
              className="rounded-full" 
              style={{ 
                width: '80px', 
                height: '4px', 
                backgroundColor: '#016B06' 
              }}
            />
          </div>
        </div>

        {/* Body Text */}
        <div className="text-center mb-16">
          <p 
            className="max-w-[800px] mx-auto"
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

        {/* Ecosystem Grid - 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {ecosystemActors.map((actor, index) => {
            const Icon = actor.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-8 bg-white rounded-xl transition-all duration-300 hover:shadow-[0px_8px_24px_rgba(0,0,0,0.08)]"
                style={{
                  border: '1px solid #E5E7EB',
                  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                }}
              >
                {/* Icon - Thin Line, Brand Green */}
                <div className="mb-6">
                  <Icon
                    className="w-16 h-16"
                    strokeWidth={1.5}
                    style={{ color: '#016B06' }}
                  />
                </div>

                {/* Label */}
                <h3
                  style={{
                    fontSize: '18px',
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
    </section>
  );
}
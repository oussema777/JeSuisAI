import React from 'react';
import { Building2, Plane, Heart, Building } from 'lucide-react';
import { MapPin } from 'lucide-react';

interface MembresProps {
  content?: {
    title: string;
    categories: Array<{ titre: string; description: string }>;
    villes_title: string;
    villes: string[];
  };
}

const CATEGORY_ICONS = [Building2, Plane, Heart, Building];

export function CommunauteEtMembresSection({ content }: MembresProps) {
  const villesList = content?.villes || [
    'AMVC', 'Bafoussam', 'Bamenda', 'Bertoua', 'Douala', 'Ebolowa', 'Edéa', 'Garoua', 'Kribi', 'Kumba', 'Limbe', 'Maroua', 'Ngaoundéré', 'Nkongsamba', 'Yaoundé'
  ];

  const categoriesData = content?.categories || [
    {
      titre: 'Collectivités locales',
      description: 'Mobiliser les contributeurs des diasporas au développement local : investissements, compétences, dons, soft power',
    },
    {
      titre: 'Aéroports internationaux',
      description: 'Huile stratégiques pour connecter les diasporas de retour dans leur pays d\'origine',
    },
    {
      titre: 'ONG',
      description: 'Connecter les diasporas en tant que donateurs, catalyseurs du changement, compétences',
    },
    {
      titre: 'Entreprises',
      description: 'Dynamiser les programmes RSE en Afrique avec les compétences, réseaux et moyens des diasporas',
    }
  ];

  const categories = categoriesData.map((cat, idx) => ({
    ...cat,
    icon: CATEGORY_ICONS[idx] || Building2,
    color: idx === 1 ? '#f8e007' : idx === 2 ? '#EE0003' : '#187A58'
  }));

  return (
    <section className="w-full py-20" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* LEFT COLUMN: Description + Categories */}
          <div className="space-y-8">
            {/* Section Title */}
            <h2 
              style={{ 
                fontSize: '24px', 
                lineHeight: '1.3', 
                fontWeight: 600,
                color: '#187A58'
              }}
            >
              {content?.title || "Profil des membres"}
            </h2>
            
            {/* 4 Category Cards - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-5">
              {categories.map((categorie, index) => {
                const Icon = categorie.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center items-start gap-3 sm:gap-4 hover:shadow-lg transition-all duration-200"
                    style={{ minHeight: '100px' }}
                  >
                    <div 
                      className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: categorie.color }}
                    >
                      <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 
                        className="text-left mb-1 sm:mb-2"
                        style={{ 
                          fontSize: '14px', 
                          lineHeight: '1.3', 
                          fontWeight: 600,
                          color: '#003A54'
                        }}
                      >
                        {categorie.titre}
                      </h3>
                      <p 
                        className="text-left text-xs sm:text-[13px]"
                        style={{ 
                          lineHeight: '1.5', 
                          fontWeight: 400,
                          color: '#187A58'
                        }}
                      >
                        {categorie.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* RIGHT COLUMN: Villes et organisations membres */}
          <div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              {/* Header */}
              <h3 
                className="mb-6"
                style={{ 
                  fontSize: '24px', 
                  lineHeight: '1.3', 
                  fontWeight: 600,
                  color: '#187A58'
                }}
              >
                {content?.villes_title || "Villes et organisations membres"}
              </h3>
              
              {/* Grid of cities - 3 columns */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-6">
                {villesList.map((ville, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-2"
                  >
                    <MapPin 
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: '#EE0003' }}
                    />
                    <span 
                      className="text-left"
                      style={{ 
                        fontSize: '15px', 
                        lineHeight: '1.4', 
                        fontWeight: 500,
                        color: '#003A54'
                      }}
                    >
                      {ville}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Aéroport du Cameroun S.A - Yellow Banner */}
              <div 
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ backgroundColor: '#f8e007' }}
              >
                <Plane className="w-5 h-5" style={{ color: '#003A54' }} />
                <span 
                  style={{ 
                    fontSize: '16px', 
                    lineHeight: '1.4', 
                    fontWeight: 600, 
                    color: '#003A54'
                  }}
                >
                  Aéroport du Cameroun S.A
                </span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
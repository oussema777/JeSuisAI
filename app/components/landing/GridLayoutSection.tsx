import React from 'react';
import Image from 'next/image';
import { Plane } from 'lucide-react';
import { VillesOrganisationsMembres } from './VillesOrganisationsMembres';
import { DomainesAction } from './DomainesAction';
import { VillesLoop } from './VillesLoop';

interface GridLayoutSectionProps {
  onNavigate: (page: string, data?: any) => void;
}

export function GridLayoutSection({ onNavigate }: GridLayoutSectionProps) {
  return (
    <section className="w-full py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20">
        {/* Grid Layout - Matches Figma design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* Pourquoi je suis au pays - Green background */}
            <div className="bg-[#E8F5E9] rounded-2xl p-8">
              <h2 className="text-bg-base mb-6" style={{ fontSize: '28px', lineHeight: '1.2', fontWeight: 600 }}>
                Pourquoi je suis au pays
              </h2>
              
              {/* Photo */}
              <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg mb-6">
                <Image
                  src="https://jesuisaupays.com/wp-content/uploads/2025/12/Photo1.jpg"
                  alt="Communauté camerounaise collaborant ensemble"
                  width={600} // TODO: Update with correct width
                  height={256} // TODO: Update with correct height
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Text */}
              <div className="space-y-4">
                <p className="text-neutral-700" style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 400 }}>
                  Chaque année, plus d'un million de Camerounais du monde retournent en vacances au pays.
                </p>
                <p className="text-neutral-700" style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 400 }}>
                  Beaucoup en profitent pour soutenir leurs familles, leurs villes et leurs communautés par différentes actions : aides matérielles directes, conseils & formations, bénévolat associatif, consultations médicales gratuites...
                </p>
                <p className="text-neutral-700" style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 400 }}>
                  Ces actions solidaires sont souvent spontanées et mériteraient d'être mieux accompagnées et renforcées, avec le soutien des mairies, ONG et entreprises.
                </p>
              </div>
            </div>
            
            {/* Champs d'intervention - Embedded DomainesAction */}
            <div>
              <DomainesAction />
            </div>
            
          </div>
          
          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* Nos 7 défis - Peach background */}
            <div className="bg-[#FFE8D6] rounded-2xl p-8">
              <h2 className="text-bg-base mb-6" style={{ fontSize: '28px', lineHeight: '1.2', fontWeight: 600 }}>
                Nos 7 défis pour gagner la confiance de la diaspora
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>1</span>
                  </div>
                  <p className="text-neutral-700 flex-1" style={{ fontSize: '14px', lineHeight: '1.5', fontWeight: 400 }}>
                    Sélection des acteurs et des missions
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>2</span>
                  </div>
                  <p className="text-neutral-700 flex-1" style={{ fontSize: '14px', lineHeight: '1.5', fontWeight: 400 }}>
                    Diversité des actions proposées
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>3</span>
                  </div>
                  <p className="text-neutral-700 flex-1" style={{ fontSize: '14px', lineHeight: '1.5', fontWeight: 400 }}>
                    Filtres de recherche optimisés
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>4</span>
                  </div>
                  <p className="text-neutral-700 flex-1" style={{ fontSize: '14px', lineHeight: '1.5', fontWeight: 400 }}>
                    Interlocuteur « diaspora » dédié et formé
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>5</span>
                  </div>
                  <p className="text-neutral-700 flex-1" style={{ fontSize: '14px', lineHeight: '1.5', fontWeight: 400 }}>
                    Suivi qualité
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>6</span>
                  </div>
                  <p className="text-neutral-700 flex-1" style={{ fontSize: '14px', lineHeight: '1.5', fontWeight: 400 }}>
                    Charte éthique
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>7</span>
                  </div>
                  <p className="text-neutral-700 flex-1" style={{ fontSize: '14px', lineHeight: '1.5', fontWeight: 400 }}>
                    Transparence et redevabilité
                  </p>
                </div>
              </div>
            </div>
            
            {/* Jesuisaucameroun.com, avant tout une communauté ! - Blue background */}
            <div className="bg-[#E3F2FD] rounded-2xl p-8">
              <h2 className="text-bg-base mb-6" style={{ fontSize: '28px', lineHeight: '1.2', fontWeight: 600 }}>
                Jesuisaucameroun.com, avant tout une communauté !
              </h2>
              <div className="space-y-4">
                <p className="text-neutral-700" style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 400 }}>
                  Aux côtés de Douala et des villes membres d'<strong>l'Association des Maires de Villes du Cameroun (AMVC)</strong>, chefs de file, jesuisaucameroun.com rassemble un écosystème d'acteurs engagés, unis par la même éthique et cette ambition commune : libérer tout le potentiel de la diaspora camerounaise au service du développement inclusif de nos territoires.
                </p>
                <p className="text-neutral-700" style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 400 }}>
                  Pratiquement, ces acteurs s'engagent à sélectionner et publier des missions adaptées à la diaspora, dédier un dispositif qualité (interlocuteur « diaspora »…) et respecter la charte éthique.
                </p>
              </div>
            </div>
            
            {/* Villes et organisations membres - Orange background */}
            <div className="bg-[#FFE4CC] rounded-2xl p-8">
              <VillesOrganisationsMembres />
            </div>
            
          </div>
          
        </div>
        
        {/* VillesLoop - Full width below grid */}
        <div className="mt-12">
          <VillesLoop />
        </div>
      </div>
    </section>
  );
}
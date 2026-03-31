import React from 'react';
import Image from 'next/image';

interface PourquoiProps {
  content?: {
    badge: string;
    title: string;
    image: string;
    description: string;
  };
}

export function PourquoiJeSuisAuCameroun({ content }: PourquoiProps) {
  // Use provided content or fall back to defaults
  const data = content || {
    badge: "Pourquoi je suis au Cameroun ?",
    title: "Une diaspora engagée pour le développement",
    image: "https://jesuisaupays.com/home-ia/assets/diaspora-engaged-Dbfcbnc3.jpg",
    description: "Chaque année, plus d'un million de Camerounais du monde retournent en vacances au pays. Beaucoup en profitent pour soutenir leurs familles, leurs villes et leurs communautés par différentes actions : aides matérielles directes, conseils & formations, bénévolat associatif, consultations médicales gratuites… Ces actions solidaires sont souvent spontanées et mériteraient d'être mieux accompagnées et renforcées, avec le soutien des mairies, ONG et entreprises. Pour ces derniers, cette période est une action unique pour créer des liens durables et construire des projets d'avenir avec la diaspora, un partenaire clé du développement local."
  };

  return (
    <div className="space-y-6">
      {/* Image Card with overlay */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl" style={{ height: '400px' }}>
        {/* Background Image */}
        <Image
          src={data.image}
          alt={data.title}
          fill
          className="object-cover"
        />
        
        {/* Green Overlay */}
        <div 
          className="absolute inset-0" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(24, 122, 88, 0.2) 0%, rgba(24, 122, 88, 0.2) 100%)' 
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-8">
          {/* Yellow Badge and Title - grouped at bottom */}
          <div className="space-y-4">
            {/* Yellow Badge */}
            <div>
              <div 
                className="inline-flex items-center px-6 py-3 rounded-full shadow-md"
                style={{ backgroundColor: '#f8e007' }}
              >
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#003A54' }}>
                  {data.badge}
                </span>
              </div>
            </div>
            
            {/* Title */}
            <div>
              <h2 
                className="text-white max-w-sm"
                style={{ 
                  fontSize: '32px', 
                  lineHeight: '1.2', 
                  fontWeight: 600,
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}
              >
                {data.title}
              </h2>
            </div>
          </div>
        </div>
      </div>
      
      {/* Text Content */}
      <div className="space-y-4">
        <p className="text-neutral-700" style={{ fontSize: '15px', lineHeight: '1.7', fontWeight: 400 }}>
          {data.description} <span className="font-semibold" style={{ color: '#187A58' }}>♡ + d&apos;infos</span>
        </p>
      </div>
    </div>
  );
}
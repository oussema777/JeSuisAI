import React from 'react';
import Image from 'next/image';

export function MotDuPresidentColumn() {
  return (
    <div className="bg-gradient-to-br from-neutral-50 to-white rounded-2xl p-8 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] border border-neutral-100 h-full">
      {/* Content Container */}
      <div className="relative">
        
        {/* Large Quotation Mark - Background Accent */}
        <div 
          className="absolute -top-4 -left-2 pointer-events-none select-none"
          style={{ 
            fontSize: '120px', 
            lineHeight: '1',
            color: '#016B06',
            opacity: 0.08,
            fontFamily: 'Georgia, serif',
            fontWeight: 700
          }}
        >
          ❝
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          
          {/* Eyebrow Title */}
          <p 
            className="mb-4 tracking-wider"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: 'Poppins, sans-serif',
              color: '#003A54',
              textTransform: 'uppercase',
              letterSpacing: '1.5px'
            }}
          >
            Le mot du Président de l'AMVC
          </p>
          
          {/* Headline - The Hook */}
          <h3 
            className="mb-6"
            style={{
              fontSize: '24px',
              lineHeight: '1.4',
              fontWeight: 600,
              fontFamily: 'Poppins, sans-serif',
              color: '#003A54',
              fontStyle: 'italic'
            }}
          >
            « La diaspora, un partenaire clé du développement des villes camerounaises ! »
          </h3>
          
          {/* Body Text */}
          <p 
            className="mb-6"
            style={{
              fontSize: '15px',
              lineHeight: '1.7',
              fontWeight: 400,
              fontFamily: 'Open Sans, sans-serif',
              color: '#003A54'
            }}
          >
            Les Camerounais de l'étranger sont une force pour notre pays. En tant que élus locaux, nous devons agir pour libérer le potentiel de cette belle communauté qui fait la fierté de notre pays et de nos territoires. La plateforme « jesuisaucameroun » s'inscrit dans cette ambition que nous sommes ravis d'initier dans le cadre de l'Association des Maires de Villes du Cameroun (AMVC).
          </p>
          
          {/* Divider Line */}
          <div 
            className="mb-5"
            style={{
              width: '60px',
              height: '3px',
              backgroundColor: '#016B06',
              borderRadius: '2px'
            }}
          />
          
          {/* Signature with Small Photo */}
          <div className="flex items-center gap-3">
            {/* Small Portrait Photo */}
            <div 
              className="relative rounded-xl overflow-hidden flex-shrink-0"
              style={{
                width: '70px',
                height: '70px',
                border: '3px solid #F8E007',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=70&h=70&fit=crop&crop=faces"
                alt="Dr Mbassa Ndine Roger, Maire de Douala et Président de l'AMVC"
                width={70}
                height={70}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Name and Title */}
            <div className="flex-1">
              <p 
                style={{
                  fontSize: '16px',
                  lineHeight: '1.4',
                  fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                  color: '#003A54'
                }}
              >
                Dr Mbassa Ndine Roger
              </p>
              <p 
                style={{
                  fontSize: '14px',
                  lineHeight: '1.4',
                  fontWeight: 400,
                  fontFamily: 'Inter, sans-serif',
                  color: '#6B7280'
                }}
              >
                Maire de Douala
              </p>
              <p 
                className="mt-0.5"
                style={{
                  fontSize: '13px',
                  lineHeight: '1.4',
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                  color: '#016B06'
                }}
              >
                Président de l'AMVC
              </p>
            </div>
            
            {/* AMVC Badge */}
            <div 
              className="bg-white rounded-lg shadow-md flex items-center justify-center flex-shrink-0"
              style={{
                width: '70px',
                height: '70px',
                border: '2px solid #F8E007'
              }}
            >
              <div className="text-center">
                <p 
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: 'Poppins, sans-serif',
                    color: '#016B06',
                    lineHeight: '1.2'
                  }}
                >
                  AMVC
                </p>
                <p 
                  style={{
                    fontSize: '8px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif',
                    color: '#6B7280',
                    lineHeight: '1.3',
                    marginTop: '2px'
                  }}
                >
                  Association<br/>des Maires
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
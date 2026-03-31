import React from 'react';
import { CheckCircle2, Filter, Shield, Users, FileText, ListChecks } from 'lucide-react';

interface DefisProps {
  content?: {
    title: string;
    items: string[];
  };
}

const ICONS = [CheckCircle2, Filter, ListChecks, Users, Shield, FileText];

export function Nos6DefisCard({ content }: DefisProps) {
  const title = content?.title || "Nos 7 défis pour gagner la confiance de la diaspora";
  const items = content?.items || [
    "Sélection des acteurs et des missions",
    "Diversité des actions proposées",
    "Filtres de recherche optimisés",
    "Interlocuteur « diaspora » dédié et formé",
    "Suivi qualité",
    "Charte éthique",
    "Transparence et redevabilité"
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header with colorful border */}
      <div className="relative">
        {/* Colorful top border - Cameroon flag colors */}
        <div 
          className="h-1"
          style={{
            background: 'linear-gradient(90deg, #187A58 0%, #f8e007 50%, #EE0003 100%)'
          }}
        />
        
        <div className="p-6">
          <h3 
            className="text-center mb-6"
            style={{ 
              fontSize: '26px', 
              lineHeight: '1.3', 
              fontWeight: 600, 
              color: '#003A54'
            }}
          >
            {title.includes('7 défis') ? (
              <>
                Nos <span style={{ color: '#187A58' }}>7 défis</span> {title.split('7 défis')[1]}
              </>
            ) : title.includes('6 défis') ? (
              <>
                Nos <span style={{ color: '#187A58' }}>6 défis</span> {title.split('6 défis')[1]}
              </>
            ) : title}
          </h3>
        </div>
      </div>
      
      {/* Grid of items */}
      <div className="px-6 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, index) => {
            const Icon = ICONS[index] || CheckCircle2;
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl transition-all duration-200 hover:shadow-md"
                style={{ backgroundColor: '#f0fdfa' }}
              >
                {/* Icon Circle */}
                <div 
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#187A58' }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                {/* Text */}
                <p 
                  className="flex-1"
                  style={{ 
                    fontSize: '16px', 
                    lineHeight: '1.4', 
                    fontWeight: 500,
                    color: '#003A54'
                  }}
                >
                  {item}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
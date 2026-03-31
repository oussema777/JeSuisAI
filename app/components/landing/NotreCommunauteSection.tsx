import React from 'react';
import Image from 'next/image';
import { Users } from 'lucide-react';

interface NotreCommunauteProps {
  content?: {
    badge: string;
    title: string;
    description: string;
    images: string[];
  };
}

export function NotreCommunauteSection({ content }: NotreCommunauteProps) {
  const defaultImages = [
    "https://jesuisaupays.com/home-ia/assets/community-friends-B6aHglcZ.jpg",
    "https://jesuisaupays.com/home-ia/assets/community-training-Drrgs9ls.jpg"
  ];

  const data = content || {
    badge: "Notre communauté",
    title: "Jesuisaucameroun.com, avant tout une communauté !",
    description: "Aux côtés de Douala et des villes membres de l'Association des Maires de Villes du Cameroun (AMVC), chefs de file, jesuisaucameroun.com rassemble un écosystème d'acteurs engagés, unis par la même éthique et cette ambition commune : libérer tout le potentiel de la diaspora camerounaise au service du développement inclusif de nos territoires.",
    images: defaultImages
  };

  // Safe image access with fallbacks
  const img1 = data.images?.[0] || defaultImages[0];
  const img2 = data.images?.[1] || defaultImages[1];

  return (
    <section className="w-full py-16" style={{ backgroundColor: '#E8F5F0' }}>
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: '#187A58' }} />
            <span style={{ fontSize: '15px', fontWeight: 500, color: '#187A58' }}>
              {data.badge}
            </span>
          </div>
        </div>
        
        {/* Title */}
        <h2 
          className="text-center mb-10 px-4"
          style={{ 
            fontSize: 'clamp(24px, 4vw, 42px)', 
            lineHeight: '1.2', 
            fontWeight: 700,
            color: '#187A58'
          }}
        >
          {data.title}
        </h2>
        
        {/* Two images side by side - Responsive stacking */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-10">
          <div className="relative w-full max-w-[320px] sm:w-64 h-48 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={img1}
              alt="Communauté 1"
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 256px"
            />
          </div>
          <div className="relative w-full max-w-[320px] sm:w-64 h-48 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={img2}
              alt="Communauté 2"
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 256px"
            />
          </div>
        </div>
        
        {/* Description text - Larger and more appealing */}
        <div className="max-w-4xl mx-auto text-center">
          <p 
            style={{ fontSize: '17px', lineHeight: '1.8', fontWeight: 400, color: '#005F73' }}
          >
            {data.description}{' '}
            <span style={{ color: '#187A58' }}>☺ + d&apos;infos</span>
          </p>
        </div>
      </div>
    </section>
  );
}
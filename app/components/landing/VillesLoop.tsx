import React from 'react';
import { MapPin } from 'lucide-react';

// Official list of 16 member cities and entities
const entites = [
  { nom: 'AMVC', type: 'organisation' },
  { nom: 'Bafoussam', type: 'ville' },
  { nom: 'Bamenda', type: 'ville' },
  { nom: 'Bertoua', type: 'ville' },
  { nom: 'Douala', type: 'ville' },
  { nom: 'Ebolowa', type: 'ville' },
  { nom: 'Edéa', type: 'ville' },
  { nom: 'Garoua', type: 'ville' },
  { nom: 'Kribi', type: 'ville' },
  { nom: 'Kumba', type: 'ville' },
  { nom: 'Limbe', type: 'ville' },
  { nom: 'Maroua', type: 'ville' },
  { nom: 'Ngaoundéré', type: 'ville' },
  { nom: 'Nkongsamba', type: 'ville' },
  { nom: 'Yaoundé', type: 'ville' },
  { nom: 'Aéroport du Cameroun S.A', type: 'organisation' },
];

export function VillesLoop() {
  // Triple the list to create seamless infinite loop
  const entitesTripled = [...entites, ...entites, ...entites];

  return (
    <div 
      className="w-full relative overflow-hidden border-y border-neutral-200" 
      style={{ 
        backgroundColor: '#F8FAFC',
        height: '100px'
      }}
    >
      {/* Left Fade Overlay */}
      <div 
        className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          width: '120px',
          background: 'linear-gradient(to right, #F8FAFC 0%, transparent 100%)'
        }}
      />
      
      {/* Right Fade Overlay */}
      <div 
        className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          width: '120px',
          background: 'linear-gradient(to left, #F8FAFC 0%, transparent 100%)'
        }}
      />
      
      {/* Scrolling Content */}
      <div 
        className="flex h-full items-center"
        style={{
          animation: 'scroll-slow 45s linear infinite',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.animationPlayState = 'paused';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.animationPlayState = 'running';
        }}
      >
        {entitesTripled.map((entite, index) => (
          <div
            key={`${entite.nom}-${index}`}
            className="flex-shrink-0 flex items-center"
            style={{ marginRight: '64px' }}
          >
            {/* Optional Icon for Cities */}
            {entite.type === 'ville' && (
              <MapPin 
                className="mr-2.5" 
                strokeWidth={2}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  color: '#003A54',
                  opacity: 0.6
                }}
              />
            )}
            
            {/* Entity Name */}
            <span
              className="whitespace-nowrap"
              style={{
                fontSize: '16px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                color: '#003A54',
                letterSpacing: '-0.01em'
              }}
            >
              {entite.nom}
            </span>
          </div>
        ))}
      </div>

      {/* Inline Styles for Animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scroll-slow {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-33.33%);
            }
          }
        `
      }} />
    </div>
  );
}
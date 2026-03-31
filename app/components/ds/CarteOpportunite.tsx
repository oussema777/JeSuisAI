'use client';
import React from 'react';
import { MapPin } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export interface CarteOpportuniteProps {
  badges?: Array<{
    text: string;
    variant: 'urgent' | 'prioritaire' | 'ouvert' | 'nouveau' | 'distance';
  }>;
  titre: string;
  location: string;
  secteur: {
    icon: React.ReactNode;
    label: string;
  };
  extrait?: string;  // Add the ? to make it optional
  buttonText?: string;
  href?: string;
  image?: string;
}

export function CarteOpportunite({
  badges = [],
  titre,
  location,
  secteur,
  extrait,
  buttonText = "En savoir plus",
  href,
  image,
}: CarteOpportuniteProps) {
  const statusConfig = {
    ferme: { bg: '#CBD5E1', border: '#CBD5E1' },
    prioritaire: { bg: '#D4A800', border: '#D4A800' },
    ouvert: { bg: '#187A58', border: '#187A58' },
    urgent: { bg: '#EE0003', border: '#EE0003' },
    nouveau: { bg: '#0070F3', border: '#0070F3' },
    distance: { bg: '#3a88ed', border: '#3a88ed' }
  };
  
  const cardContent = (
    <div className="group flex flex-col w-full max-w-[360px] bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      {/* Image section */}
      {image && (
        <div className="relative w-full h-48 bg-neutral-100 overflow-hidden">
          <ImageWithFallback
            src={image}
            alt={titre}
            fill
            className="w-full h-full object-cover"
          />
          {badges.length > 0 && (
            <>
              {/* Left side badge */}
              {badges[0] && (
                <div className="absolute top-3 left-3 z-10">
                  {(() => {
                    const badgeColor = statusConfig[badges[0].variant];
                    return (
                      <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm bg-white/95"
                        style={{ 
                          border: `1.5px solid ${badgeColor.border}`,
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: 600, color: badgeColor.bg }}>
                          {badges[0].text}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              {/* Right side badge */}
              {badges[1] && (
                <div className="absolute top-3 right-3 z-10">
                  {(() => {
                    const badgeColor = statusConfig[badges[1].variant];
                    return (
                      <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm bg-white/95"
                        style={{ 
                          border: `1.5px solid ${badgeColor.border}`,
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: 600, color: badgeColor.bg }}>
                          {badges[1].text}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              {/* Additional badges below if more than 2 */}
              {badges.length > 2 && (
                <div className="absolute top-14 left-3 right-3 z-10 flex gap-2 justify-between">
                  {badges.slice(2).map((badge, index) => {
                    const badgeColor = statusConfig[badge.variant];
                    return (
                      <div
                        key={index + 2}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm bg-white/95"
                        style={{ 
                          border: `1.5px solid ${badgeColor.border}`,
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: 600, color: badgeColor.bg }}>
                          {badge.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      <div className="p-5 flex flex-col flex-grow">
        {!image && badges.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {badges.map((badge, index) => {
              const badgeColor = statusConfig[badge.variant];
              return (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ 
                    border: `1.5px solid ${badgeColor.border}`,
                    backgroundColor: `${badgeColor.bg}10`,
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: badgeColor.bg }}>
                    {badge.text}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Location */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0" strokeWidth={2} />
          <span className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 500 }}>
            {location}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="mb-2 text-bg-base" style={{ fontSize: '18px', lineHeight: '1.4', fontWeight: 600 }}>
          {titre}
        </h3>
        
        {/* Sector Badge */}
        <div className="mb-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10"
          >
            <span className="w-4 h-4 flex-shrink-0 text-primary">{secteur.icon}</span>
            <span className="text-primary" style={{ fontSize: '12px', fontWeight: 600 }}>
              {secteur.label}
            </span>
          </div>
        </div>
        
        {/* Description */}
        <p
          className="text-neutral-600 mb-5 line-clamp-2 flex-grow"
          style={{ fontSize: '14px', lineHeight: '1.5', fontWeight: 400 }}
        >
          {extrait}
        </p>
        
        {/* Action Button */}
        <div className="mt-auto">
          <div
            className="w-full py-3 px-4 rounded-lg transition-all duration-300 bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2 group/btn"
            style={{
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {buttonText}
            <span className="transform transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
          </div>
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{cardContent}</Link> : cardContent;
}
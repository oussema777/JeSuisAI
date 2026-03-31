'use client';
import React from 'react';
import { Quote } from 'lucide-react';
import Image from 'next/image';

interface CarteTemoignageProps {
  citation: string;
  nom: string;
  titre: string;
  avatar?: string;
  variant?: 'maire' | 'utilisateur';
  avatarColor?: 'teal' | 'yellow';
  emoji?: string;
}

// Get initials from name
const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
    }
    return name.substring(0, 2).toUpperCase();
};

export function CarteTemoignage({
  citation,
  nom,
  titre,
  avatar,
  variant = 'maire',
  avatarColor = 'teal',
  emoji = '🏥',
}: CarteTemoignageProps) {
  // Avatar color mapping
  const colorMap = {
    teal: {
      bg: '#187A58',
      text: '#FFFFFF',
    },
    yellow: {
      bg: '#f8e007',
      text: '#003A54',
    },
  };

  const colors = colorMap[avatarColor];
  
  return (
    <div className="flex flex-col bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all h-full relative">
      {/* Quote icon in top-left corner */}
      <div className="absolute top-6 left-6 opacity-20">
        <Quote size={48} style={{ color: colors.bg }} strokeWidth={2.5} />
      </div>
      
      {/* Citation with emoji */}
      <blockquote
        className="mb-8 flex-grow relative z-10"
        style={{ fontSize: '16px', lineHeight: '1.7', fontWeight: 400, color: '#003A54' }}
      >
        &ldquo;{citation}&rdquo;
      </blockquote>
      
      <div className="flex items-center gap-4 mt-auto relative z-10">
        {/* Avatar with initials */}
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden"
          style={{ backgroundColor: colors.bg }}
        >
          {avatar ? (
            <Image src={avatar} alt={nom} width={64} height={64} className="w-full h-full object-cover" />
          ) : (
            <span style={{ fontSize: '16px', fontWeight: 600, color: colors.text }}>
              {getInitials(nom)}
            </span>
          )}
        </div>
        
        <div className="flex flex-col">
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#003A54' }}>
            {nom}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 400, color: '#6b7280' }}>
            {titre}
          </span>
        </div>
      </div>
    </div>
  );
}
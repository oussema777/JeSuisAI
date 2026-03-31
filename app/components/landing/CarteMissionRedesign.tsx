'use client';
import React from 'react';
import Image from 'next/image';
import { MapPin, Briefcase, Users, DollarSign, GraduationCap } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface CarteMissionRedesignProps {
  titre: string;
  location: string;
  secteur: {
    icon: React.ReactNode;
    label: string;
  };
  extrait: string;
  image?: string;
  showImage?: boolean;
  href?: string;
  accentColor: 'green' | 'yellow' | 'red' | 'teal';
  urgente?: boolean;
}

export function CarteMissionRedesign({
  titre,
  location,
  secteur,
  extrait,
  image,
  showImage = true,
  href = '#',
  accentColor,
  urgente = false,
}: CarteMissionRedesignProps) {
  // Color mapping for cards based on design
  const colorMap = {
    green: {
      bg: '#3d7e68',
    },
    teal: {
      bg: '#2b6156',
    },
    yellow: {
      bg: '#f8e007',
    },
    red: {
      bg: '#d1534d',
    },
  };

  const colors = colorMap[accentColor];
  
  // Map icon based on secteur label
  const getIconComponent = () => {
    switch(secteur.label) {
      case 'Infrastructure':
        return <Briefcase className="w-16 h-16" strokeWidth={1.5} />;
      case 'Mentorat':
        return <Users className="w-16 h-16" strokeWidth={1.5} />;
      case 'Investissement':
        return <DollarSign className="w-16 h-16" strokeWidth={1.5} />;
      case 'Formation':
        return <GraduationCap className="w-16 h-16" strokeWidth={1.5} />;
      default:
        return <Briefcase className="w-16 h-16" strokeWidth={1.5} />;
    }
  };

  return (
    <div 
      className="group relative flex flex-col w-full rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {showImage && image && (
        <div className="relative w-full h-48">
          <Image src={image} alt={titre} fill unoptimized className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      )}
      {/* Colored Top Section with Icon */}
      <div 
        className="relative p-6 pb-8 rounded-t-2xl"
        style={{ backgroundColor: colors.bg }}
      >
        {/* Header: Badge and Location */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2">
            {/* Category Badge */}
            <div
              className="px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#FFFFFF' }}>
                {secteur.label}
              </span>
            </div>
            {/* Urgente Badge */}
            {urgente && (
              <div
                className="px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: '#EE0003',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF' }}>
                  URGENTE
                </span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#FFFFFF' }} strokeWidth={2} />
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#FFFFFF' }}>
              {location}
            </span>
          </div>
        </div>

        {/* Large Icon */}
        <div style={{ color: '#FFFFFF' }}>
          {getIconComponent()}
        </div>
      </div>

      {/* White Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title */}
        <h3 
          className="mb-3" 
          style={{ fontSize: '16px', lineHeight: '1.3', fontWeight: 600, color: '#003A54' }}
        >
          {titre}
        </h3>

        {/* Description */}
        <p
          className="mb-5 flex-grow"
          style={{ fontSize: '13px', lineHeight: '1.5', fontWeight: 400, color: '#6b7280' }}
        >
          {extrait}
        </p>

        {/* Action Link */}
        <Link
          href={href}
          className="flex items-center gap-2 group/btn self-start"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#003A54',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          Passer à l'action
          <span className="transform transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}
import React from 'react';
import { Building2, Plane, Heart, Building } from 'lucide-react';

interface EcosystemCardProps {
  icon: 'building2' | 'plane' | 'heart' | 'building';
  label: string;
  description?: string;
}

export function EcosystemCard({ icon, label, description }: EcosystemCardProps) {
  const getIcon = () => {
    switch (icon) {
      case 'building2':
        return Building2;
      case 'plane':
        return Plane;
      case 'heart':
        return Heart;
      case 'building':
        return Building;
    }
  };

  const Icon = getIcon();

  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl transition-all duration-300 hover:shadow-[0px_8px_24px_rgba(0,0,0,0.08)] border border-neutral-200">
      {/* Icon - Brand Green */}
      <div className="mb-4">
        <Icon
          className="w-12 h-12"
          strokeWidth={1.5}
          style={{ color: '#016B06' }}
        />
      </div>

      {/* Label */}
      <h3
        className="mb-3"
        style={{
          fontSize: '16px',
          lineHeight: '1.4',
          fontWeight: 600,
          fontFamily: 'Poppins, sans-serif',
          color: '#003A54'
        }}
      >
        {label}
      </h3>

      {/* Description */}
      {description && (
        <p
          style={{
            fontSize: '14px',
            lineHeight: '1.6',
            fontWeight: 400,
            fontFamily: 'Open Sans, sans-serif',
            color: '#52525B'
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
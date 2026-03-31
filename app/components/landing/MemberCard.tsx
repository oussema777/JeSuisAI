import React from 'react';
import { MapPin, Building2 } from 'lucide-react';

interface MemberCardProps {
  name: string;
  isOrganisation?: boolean;
}

export function MemberCard({ name, isOrganisation = false }: MemberCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-lg hover:bg-primary/5 transition-all duration-200 border border-neutral-200 hover:border-primary/30 shadow-sm hover:shadow-md">
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {isOrganisation ? (
          <Building2 
            className="text-accent-yellow" 
            strokeWidth={2}
            style={{ width: '20px', height: '20px' }}
          />
        ) : (
          <MapPin 
            className="text-primary" 
            strokeWidth={2}
            style={{ width: '20px', height: '20px' }}
          />
        )}
      </div>
      
      {/* Name */}
      <span
        style={{
          fontSize: '14px',
          fontWeight: isOrganisation ? 600 : 500,
          fontFamily: 'Inter, sans-serif',
          color: '#003A54',
          lineHeight: '1.5'
        }}
      >
        {name}
      </span>
    </div>
  );
}

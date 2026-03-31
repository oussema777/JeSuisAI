import React from 'react';
import { MapPin, Calendar, Clock, Users } from 'lucide-react';

interface BlocMetadonneesProps {
  items: Array<{
    icon: React.ReactNode;
    label: string;
  }>;
}

export function BlocMetadonnees({
  items,
}: BlocMetadonneesProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 md:gap-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.icon}
          <span className="text-neutral-700" style={{ fontSize: '15px', fontWeight: 400 }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
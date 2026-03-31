'use client';

import React, { useMemo } from 'react';
import { CarteMissionRedesign } from './CarteMissionRedesign';
import { Briefcase } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface Mission {
  id: string;
  titre: string;
  location: string;
  secteur_label: string;
  extrait: string;
  accentColor: 'green' | 'yellow' | 'red' | 'teal';
  timing: string;
  urgente?: boolean;
  image?: string;
}

interface MissionsVedetteProps {
  missions: Mission[];
  onNavigate?: (page: string, data?: any) => void;
  showImage?: boolean;
}

export function MissionsVedette({ missions, onNavigate, showImage = true }: MissionsVedetteProps) {
  const missionGrid = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
      {missions.map((mission) => (
        <CarteMissionRedesign
          key={mission.id}
          titre={mission.titre}
          location={mission.location}
          secteur={{
            label: mission.secteur_label,
            icon: <Briefcase className="w-4 h-4" />
          }}
          extrait={mission.extrait}
          accentColor={mission.accentColor}
          urgente={mission.urgente}
          image={mission.image}
          showImage={showImage}
          href={`/missions/${slugify(mission.titre)}-${mission.id}`}
        />
      ))}
    </div>
  ), [missions, showImage]);

  if (missions.length === 0) {
    return (
      <div className="py-12 text-center text-neutral-500 bg-white rounded-xl border border-dashed border-neutral-300">
        <p>Aucune mission disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {missionGrid}
    </div>
  );
}

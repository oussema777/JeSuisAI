import React from 'react';
import { 
  TrendingUp, 
  Heart, 
  HandHeart, 
  Users, 
  Building2, 
  Leaf, 
  GraduationCap, 
  Lightbulb, 
  Briefcase, 
  Plane, 
  Landmark, 
  Globe, 
  Scale, 
  AlertCircle 
} from 'lucide-react';

const champsIntervention = [
  { icon: TrendingUp, label: 'Investissement' },
  { icon: Heart, label: 'Santé' },
  { icon: HandHeart, label: 'Lutte contre la pauvreté' },
  { icon: Users, label: 'Soutien à la société civile (femmes, jeunes…)' },
  { icon: Building2, label: 'Infrastructures et urbanisme' },
  { icon: Leaf, label: 'Environnement et propreté' },
  { icon: GraduationCap, label: 'Education et enfance' },
  { icon: Lightbulb, label: 'Innovation' },
  { icon: Briefcase, label: 'Recrutement et formation professionnelle' },
  { icon: Plane, label: 'Tourisme' },
  { icon: Landmark, label: 'Culture et patrimoine' },
  { icon: Globe, label: 'Rayonnement international' },
  { icon: Scale, label: 'Droits et citoyenneté' },
  { icon: AlertCircle, label: 'Urgences humanitaires' },
];

export function DomainesAction() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-[0px_2px_12px_rgba(0,0,0,0.08)]">
      <h3 className="text-bg-base mb-6" style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
        Champs d&apos;intervention
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {champsIntervention.map((champ) => {
          const Icon = champ.icon;
          return (
            <div
              key={champ.label}
              className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 hover:bg-primary/5 transition-colors"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-bg-base/10"
              >
                <Icon
                  className="w-4 h-4 text-bg-base"
                  strokeWidth={2}
                />
              </div>
              <span className="text-bg-base" style={{ fontSize: '14px', fontWeight: 400, fontFamily: 'Open Sans, sans-serif' }}>
                {champ.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

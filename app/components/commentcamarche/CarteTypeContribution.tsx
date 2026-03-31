import React from 'react';

interface CarteTypeContributionProps {
  icon: React.ReactNode;
  titre: string;
  description: string;
  exemples: string[];
}

export function CarteTypeContribution({ icon, titre, description, exemples }: CarteTypeContributionProps) {
  return (
    <div className="flex flex-col bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
      {/* Icon */}
      <div className="w-12 h-12 text-primary mb-4">
        {icon}
      </div>
      
      {/* Titre */}
      <h3
        className="text-neutral-900 mb-3"
        style={{ fontSize: '18px', fontWeight: 600 }}
      >
        {titre}
      </h3>
      
      {/* Description */}
      <p
        className="text-neutral-700 mb-4"
        style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.6' }}
      >
        {description}
      </p>
      
      {/* Exemples */}
      <ul className="space-y-2">
        {exemples.map((exemple, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-neutral-600"
            style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.5' }}
          >
            <span className="text-primary mt-0.5">•</span>
            <span>{exemple}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import React from 'react';

interface CarteEtapeProps {
  numero: string;
  icon: React.ReactNode;
  titre: string;
  description: string;
  temps: string;
  showConnector?: boolean;
}

export function CarteEtape({ numero, icon, titre, description, temps, showConnector = true }: CarteEtapeProps) {
  return (
    <div className="flex flex-col items-center relative">
      {/* Connector line - only shown on desktop, not on last step */}
      {showConnector && (
        <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 border-t-2 border-dashed border-primary/30 z-0"></div>
      )}
      
      {/* Step number badge */}
      <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-6 relative z-10 shadow-lg">
        <span
          className="text-white"
          style={{ fontSize: '31px', fontWeight: 600 }}
        >
          {numero}
        </span>
      </div>
      
      {/* Icon */}
      <div className="w-16 h-16 text-primary mb-4">
        {icon}
      </div>
      
      {/* Titre */}
      <h3
        className="text-neutral-900 mb-3 text-center"
        style={{ fontSize: '20px', fontWeight: 600 }}
      >
        {titre}
      </h3>
      
      {/* Description */}
      <p
        className="text-neutral-700 text-center mb-4"
        style={{ fontSize: '15px', fontWeight: 400, lineHeight: '1.6' }}
      >
        {description}
      </p>
      
      {/* Time estimate badge */}
      <div className="inline-flex items-center px-3 py-1 bg-neutral-100 rounded-full">
        <span
          className="text-neutral-600"
          style={{ fontSize: '13px', fontWeight: 500 }}
        >
          {temps}
        </span>
      </div>
    </div>
  );
}

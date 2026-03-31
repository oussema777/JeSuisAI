import React from 'react';

interface SectionFormulaireProps {
  numero: string;
  titre: string;
  children: React.ReactNode;
}

export function SectionFormulaire({ numero, titre, children }: SectionFormulaireProps) {
  return (
    <div className="pb-10 mb-10 border-b border-neutral-200 last:border-b-0 last:pb-0 last:mb-0">
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
            {numero}
          </span>
        </div>
        <h3 className="text-neutral-900" style={{ fontSize: '20px', fontWeight: 600 }}>
          {titre}
        </h3>
      </div>
      
      {/* Section Content */}
      <div className="space-y-6 ml-12">
        {children}
      </div>
    </div>
  );
}

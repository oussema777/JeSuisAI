import React from 'react';

interface SectionFormulaireProps {
  titre: string;
  description?: string;
  children: React.ReactNode;
}

export function SectionFormulaire({
  titre,
  description,
  children,
}: SectionFormulaireProps) {
  return (
    <div className="w-full bg-white rounded-xl p-10 shadow-[0px_2px_8px_rgba(0,0,0,0.06)]">
      <h3 className="mb-2" style={{ fontSize: '25px', lineHeight: '1.3', fontWeight: 500 }}>
        {titre}
      </h3>
      
      {description && (
        <p
          className="text-neutral-600 mb-8"
          style={{ fontSize: '14px', lineHeight: '1.5', fontWeight: 400 }}
        >
          {description}
        </p>
      )}
      
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </div>
  );
}

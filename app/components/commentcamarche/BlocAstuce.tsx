import React from 'react';
import { Lightbulb } from 'lucide-react';

interface BlocAstuceProps {
  texte: string;
}

export function BlocAstuce({ texte }: BlocAstuceProps) {
  return (
    <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4">
      <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
      <div>
        <p className="text-blue-900" style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.6' }}>
          <span style={{ fontWeight: 600 }}>Astuce :</span> {texte}
        </p>
      </div>
    </div>
  );
}

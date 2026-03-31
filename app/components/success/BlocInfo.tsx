import React from 'react';
import { Info } from 'lucide-react';

interface BlocInfoProps {
  children: React.ReactNode;
}

export function BlocInfo({ children }: BlocInfoProps) {
  return (
    <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
      <div className="text-neutral-700" style={{ fontSize: '14px', lineHeight: '1.6', fontWeight: 400 }}>
        {children}
      </div>
    </div>
  );
}

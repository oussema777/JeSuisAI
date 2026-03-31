import React from 'react';
import { X } from 'lucide-react';

interface ChipFiltreProps {
  label: string;
  onRetirer: () => void;
}

export function ChipFiltre({ label, onRetirer }: ChipFiltreProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors">
      <span className="text-neutral-800" style={{ fontSize: '14px', fontWeight: 500 }}>
        {label}
      </span>
      <button
        onClick={onRetirer}
        className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-neutral-300 transition-colors"
        aria-label={`Retirer le filtre ${label}`}
      >
        <X className="w-3 h-3 text-neutral-600" strokeWidth={2.5} />
      </button>
    </div>
  );
}

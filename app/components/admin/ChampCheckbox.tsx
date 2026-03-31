'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface ChampCheckboxProps {
  label: React.ReactNode;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helperText?: string;
}

export function ChampCheckbox({ label, name, checked, onChange, helperText }: ChampCheckboxProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
          checked
            ? 'bg-primary border-primary'
            : 'bg-white border-neutral-300 hover:border-primary'
        }`}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </button>
      
      <div className="flex-1">
        <label
          htmlFor={name}
          className="text-neutral-900 cursor-pointer"
          onClick={() => onChange(!checked)}
          style={{ fontSize: '14px', fontWeight: 400 }}
        >
          {label}
        </label>
        {helperText && (
          <p className="text-neutral-600 mt-1" style={{ fontSize: '13px', fontWeight: 400 }}>
            {helperText}
          </p>
        )}
      </div>
    </div>
  );
}

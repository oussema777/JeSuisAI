'use client';

import React, { useId } from 'react'; // This hook fixes the Next.js hydration error

interface BoutonRadioProps {
  label: string;
  name: string;
  value?: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  id?: string;
}

export function BoutonRadio({
  label,
  name,
  value,
  checked = false,
  onChange,
  disabled = false,
  id,
}: BoutonRadioProps) {
  // usage of useId ensures the ID is the same on Server (Next.js) and Client (Browser)
  const uniqueId = useId();
  const inputId = id || `radio-${uniqueId}`;
  
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center">
        <input
          type="radio"
          id={inputId}
          name={name}
          value={value}
          checked={checked}
          onChange={() => onChange?.(value as string)}
          disabled={disabled}
          className="peer sr-only"
        />
        <label
          htmlFor={inputId}
          className={`flex items-center justify-center w-5 h-5 border-2 rounded-full cursor-pointer transition-all ${
            checked
              ? 'border-primary'
              : 'border-neutral-400 peer-focus:border-primary'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {checked && (
            <div className="w-2.5 h-2.5 bg-primary rounded-full" />
          )}
        </label>
      </div>
      <label
        htmlFor={inputId}
        className={`cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ fontSize: '15px', fontWeight: 400, lineHeight: '1.5' }}
      >
        {label}
      </label>
    </div>
  );
}
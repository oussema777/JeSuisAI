'use client';

import React, { useId } from 'react'; 
import { Check } from 'lucide-react';

interface CaseACocherProps {
  // 🔴 CHANGE THIS: was 'string', now 'React.ReactNode'
  label: React.ReactNode; 
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export function CaseACocher({
  label,
  checked = false,
  onChange,
  disabled = false,
  id,
}: CaseACocherProps) {
  const uniqueId = useId(); 
  const inputId = id || `checkbox-${uniqueId}`;
  
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={inputId}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className="peer sr-only"
        />
        <label
          htmlFor={inputId}
          className={`flex items-center justify-center w-5 h-5 border-2 rounded cursor-pointer transition-all ${
            checked
              ? 'bg-primary border-primary'
              : 'bg-white border-neutral-400 peer-focus:border-primary'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
        </label>
      </div>
      <label
        htmlFor={inputId}
        className={`cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ fontSize: '15px', fontWeight: 400, lineHeight: '1.5' }}
      >
        {/* React renders ReactNode correctly here automatically */}
        {label}
      </label>
    </div>
  );
}
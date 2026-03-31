'use client';

import React from 'react';

interface RadioOption {
  value: string;
  label: string;
}

interface ChampRadioProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  required?: boolean;
  helperText?: string;
  error?: string;
}

export function ChampRadio({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  helperText,
  error,
}: ChampRadioProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-neutral-900" style={{ fontSize: '14px', fontWeight: 500 }}>
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      
      <div className="space-y-3">
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange(option.value)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                value === option.value
                  ? 'border-primary'
                  : 'border-neutral-300 hover:border-primary'
              }`}
            >
              {value === option.value && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
              )}
            </button>
            
            <label
              className="text-neutral-900 cursor-pointer flex-1"
              onClick={() => onChange(option.value)}
              style={{ fontSize: '14px', fontWeight: 400 }}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      
      {helperText && !error && (
        <p className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 400 }}>
          {helperText}
        </p>
      )}
      {error && (
        <p className="text-accent" style={{ fontSize: '13px', fontWeight: 500 }}>
          {error}
        </p>
      )}
    </div>
  );
}

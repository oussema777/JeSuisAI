'use client';
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ChampSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
}

export function ChampSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Sélectionnez une option',
  required = false,
  helperText,
  error,
}: ChampSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-neutral-900" style={{ fontSize: '14px', fontWeight: 500 }}>
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-12 pl-4 pr-10 rounded-lg border transition-colors appearance-none ${
            error
              ? 'border-accent bg-accent/5'
              : 'border-neutral-300 bg-white hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/10'
          }`}
          style={{ fontSize: '15px', fontWeight: 400 }}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
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

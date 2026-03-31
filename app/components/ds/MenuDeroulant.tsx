'use client';
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface MenuDeroulantProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  id?: string;
}

export function MenuDeroulant({
  label,
  placeholder = 'Sélectionnez une option',
  required = false,
  error,
  disabled = false,
  value,
  onChange,
  options,
  id,
}: MenuDeroulantProps) {
  const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  const borderClasses = error
    ? 'border-2 border-error'
    : 'border border-neutral-300 focus:border-2 focus:border-primary';
  
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-neutral-800">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`h-12 w-full px-3 py-3 pr-10 bg-white rounded-lg text-neutral-800 ${borderClasses} focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all appearance-none cursor-pointer`}
          style={{ fontSize: '16px', fontWeight: 400, lineHeight: '1.6' }}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
      </div>
      {error && (
        <span className="text-error" style={{ fontSize: '14px', fontWeight: 400 }}>
          {error}
        </span>
      )}
    </div>
  );
}

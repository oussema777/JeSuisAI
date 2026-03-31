'use client';
import React, { useId } from 'react';

interface ChampTexteProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  success?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  id?: string;
}

export function ChampTexte({
  label,
  placeholder,
  required = false,
  error,
  success = false,
  disabled = false,
  value,
  onChange,
  type = 'text',
  id,
}: ChampTexteProps) {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  
  const borderClasses = error
    ? 'border-2 border-error'
    : success
    ? 'border-2 border-success'
    : 'border border-neutral-300 focus:border-2 focus:border-primary';
  
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-neutral-800">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`h-12 px-3 py-3 bg-white rounded-lg text-neutral-800 placeholder:text-neutral-400 ${borderClasses} focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
        style={{ fontSize: '16px', fontWeight: 400, lineHeight: '1.6' }}
      />
      {error && (
        <span className="text-error" style={{ fontSize: '14px', fontWeight: 400 }}>
          {error}
        </span>
      )}
    </div>
  );
}

'use client';
import React from 'react';

interface ZoneTexteProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  success?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  id?: string;
}

export function ZoneTexte({
  label,
  placeholder,
  required = false,
  error,
  success = false,
  disabled = false,
  value,
  onChange,
  rows = 5,
  id,
}: ZoneTexteProps) {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
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
      <textarea
        id={inputId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`min-h-[120px] px-3 py-3 bg-white rounded-lg text-neutral-800 placeholder:text-neutral-400 ${borderClasses} focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-y`}
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

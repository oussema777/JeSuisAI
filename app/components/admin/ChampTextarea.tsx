'use client';
import React from 'react';

interface ChampTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  maxLength?: number;
  rows?: number;
  error?: string;
}

export function ChampTextarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  helperText,
  maxLength,
  rows = 5,
  error,
}: ChampTextareaProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-neutral-900" style={{ fontSize: '14px', fontWeight: 500 }}>
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={`w-full px-4 py-3 rounded-lg border transition-colors resize-y ${
          error
            ? 'border-accent bg-accent/5'
            : 'border-neutral-300 bg-white hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/10'
        }`}
        style={{ fontSize: '15px', fontWeight: 400, minHeight: `${rows * 24}px` }}
      />
      
      <div className="flex items-center justify-between">
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
        {maxLength && (
          <span className="text-neutral-500 ml-auto" style={{ fontSize: '13px', fontWeight: 400 }}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

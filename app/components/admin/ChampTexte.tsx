'use client';
import React from 'react';

interface ChampTexteProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  maxLength?: number;
  disabled?: boolean;
  error?: string;
}

export function ChampTexte({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  helperText,
  maxLength,
  disabled = false,
  error,
}: ChampTexteProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-neutral-900" style={{ fontSize: '14px', fontWeight: 500 }}>
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={`w-full h-12 px-4 rounded-lg border transition-colors ${
          error
            ? 'border-accent bg-accent/5'
            : 'border-neutral-300 bg-white hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/10'
        } ${disabled ? 'bg-neutral-100 cursor-not-allowed' : ''}`}
        style={{ fontSize: '15px', fontWeight: 400 }}
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

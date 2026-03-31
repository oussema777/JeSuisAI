'use client';
import React from 'react';
import { Upload } from 'lucide-react';

interface TelechargementProps {
  label?: string;
  subtext?: string;
  onChange?: (file: File | null) => void;
  disabled?: boolean;
  accept?: string;
}

export function Telechargement({
  label = 'Télécharger un fichier',
  subtext = '(PDF, max 5MB)',
  onChange,
  disabled = false,
  accept = '.pdf',
}: TelechargementProps) {
  const inputId = `upload-${Math.random().toString(36).substr(2, 9)}`;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange?.(file);
  };
  
  return (
    <div className="w-full">
      <input
        type="file"
        id={inputId}
        onChange={handleFileChange}
        disabled={disabled}
        accept={accept}
        className="sr-only"
      />
      <label
        htmlFor={inputId}
        className={`flex flex-col items-center justify-center min-h-[140px] px-8 py-8 border-2 border-dashed border-neutral-300 bg-neutral-50 rounded-xl cursor-pointer transition-all hover:border-primary hover:bg-neutral-100 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Upload className="w-8 h-8 text-primary mb-4" strokeWidth={2} />
        <span
          className="text-neutral-800 text-center"
          style={{ fontSize: '15px', fontWeight: 500 }}
        >
          {label}
        </span>
        <span
          className="text-neutral-500 text-center mt-2"
          style={{ fontSize: '13px', fontWeight: 400 }}
        >
          {subtext}
        </span>
      </label>
    </div>
  );
}

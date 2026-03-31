'use client';
import React from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface ChampFichierProps {
  label: string;
  name: string;
  files: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  helperText?: string;
  required?: boolean;
}

export function ChampFichier({
  label,
  name,
  files,
  onChange,
  accept = '*/*',
  multiple = false,
  maxSize = 10,
  helperText,
  required = false,
}: ChampFichierProps) {
  const [error, setError] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setError(null);

    // Validate each file
    const maxBytes = maxSize * 1024 * 1024;
    const allowedTypes = accept !== '*/*' ? accept.split(',').map(t => t.trim()) : null;

    for (const file of selectedFiles) {
      if (file.size > maxBytes) {
        setError(`"${file.name}" dépasse la taille maximale de ${maxSize}MB.`);
        e.target.value = '';
        return;
      }

      if (allowedTypes) {
        const matches = allowedTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.replace('/*', '/'));
          }
          return file.type === type;
        });
        if (!matches) {
          setError(`"${file.name}" n'est pas un type de fichier autorisé.`);
          e.target.value = '';
          return;
        }
      }
    }

    if (multiple) {
      onChange([...files, ...selectedFiles]);
    } else {
      onChange(selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-neutral-900" style={{ fontSize: '14px', fontWeight: 500 }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Upload area */}
      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 hover:border-primary transition-colors">
        <input
          type="file"
          id={name}
          name={name}
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor={name}
          className="flex flex-col items-center gap-3 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" strokeWidth={2} />
          </div>
          <div className="text-center">
            <p className="text-neutral-900 mb-1" style={{ fontSize: '14px', fontWeight: 500 }}>
              Cliquez pour télécharger
            </p>
            <p className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 400 }}>
              {helperText || `Max ${maxSize}MB par fichier`}
            </p>
          </div>
        </label>
      </div>
      
      {/* Validation error */}
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200"
            >
              <FileText className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2} />
              <div className="flex-1 min-w-0">
                <p
                  className="text-neutral-900 truncate"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  {file.name}
                </p>
                <p className="text-neutral-600" style={{ fontSize: '12px', fontWeight: 400 }}>
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="w-8 h-8 rounded-lg bg-white hover:bg-accent/10 flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="Retirer le fichier"
              >
                <X className="w-4 h-4 text-accent" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React from 'react';

type BadgeVariant = 'succes' | 'avertissement' | 'info' | 'neutre' | 'erreur';
type BadgeSize = 'petit' | 'moyen';

interface BadgeProps {
  variant: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
}

export function Badge({ variant, size = 'moyen', children }: BadgeProps) {
  const variantClasses = {
    succes: 'bg-green-100 text-green-700 border-green-200',
    avertissement: 'bg-orange-100 text-orange-700 border-orange-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    neutre: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    erreur: 'bg-red-100 text-red-700 border-red-200',
  };

  const sizeClasses = {
    petit: 'px-2 py-1 text-xs',
    moyen: 'px-3 py-1.5 text-sm',
  };
  
  return (
    <span
      className={`inline-flex items-center justify-center rounded border ${variantClasses[variant]} ${sizeClasses[size]}`}
      style={{ fontWeight: 600 }}
    >
      {children}
    </span>
  );
}

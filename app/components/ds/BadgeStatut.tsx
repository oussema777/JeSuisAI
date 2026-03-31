import React from 'react';

type BadgeStatutVariant = 'ouvert' | 'ferme' | 'urgent' | 'prioritaire';

interface BadgeStatutProps {
  variant: BadgeStatutVariant;
  children: React.ReactNode;
}

export function BadgeStatut({ variant, children }: BadgeStatutProps) {
  const variantClasses = {
    ouvert: 'bg-success text-white',
    ferme: 'bg-neutral-500 text-white',
    urgent: 'bg-error text-white',
    prioritaire: 'bg-warning text-white',
  };
  
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded uppercase ${variantClasses[variant]}`}
      style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px' }}
    >
      {children}
    </span>
  );
}

'use client';
import React from 'react';

type BoutonVariant = 'primaire' | 'secondaire' | 'tertiaire' | 'danger';
type BoutonSize = 'petit' | 'moyen' | 'grand' | 'large';

interface BoutonProps {
  variant?: BoutonVariant;
  size?: BoutonSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  form?: string;
  iconPosition?: 'left' | 'right';
}

export function Bouton({
  variant = 'primaire',
  size = 'moyen',
  children,
  icon,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  form,
  iconPosition = 'left',
}: BoutonProps) {
  const baseClasses = 'inline-flex items-center justify-center transition-all duration-200 font-semibold whitespace-nowrap';
  
  const flexDirectionClass = iconPosition === 'right' ? 'flex-row-reverse' : 'flex-row';

  const variantClasses = {
    primaire: 'bg-primary text-white hover:bg-[#136145] active:bg-[#0f4f37] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary disabled:opacity-40 font-bold',
    secondaire: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/5 active:bg-primary/10 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary disabled:opacity-40 font-bold',
    tertiaire: 'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-neutral-400 disabled:opacity-40',
    danger: 'bg-accent text-white hover:bg-[#A30D1E] active:bg-[#8A0B1A] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent disabled:opacity-40 font-bold',
  };
  
  // Client requirement: min 16px vertical, 32px horizontal
  const sizeClasses = {
    petit: 'h-12 px-8 py-4 text-[16px] gap-2',
    moyen: 'h-14 px-10 py-4 text-[16px] gap-3',
    grand: 'h-[60px] px-12 py-5 text-[18px] gap-3',
    large: 'h-[60px] px-12 py-5 text-[18px] gap-3', // Alias for grand
  };
  
  const tertiaireSizeClasses = {
    petit: 'h-11 px-4 py-2.5 text-[16px] gap-2',
    moyen: 'h-12 px-5 py-3 text-[16px] gap-2',
    grand: 'h-[52px] px-6 py-3.5 text-[16px] gap-2',
    large: 'h-[52px] px-6 py-3.5 text-[16px] gap-2', // Alias for grand
  };
  
  const shadowClass = variant === 'primaire' || variant === 'danger' 
    ? 'shadow-[0px_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0px_4px_12px_rgba(0,122,94,0.2)]' 
    : '';
  
  const widthClass = fullWidth ? 'w-full' : 'min-w-[120px]';
  
  const actualSizeClasses = variant === 'tertiaire' ? tertiaireSizeClasses[size] : sizeClasses[size];
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      form={form}
      className={`${baseClasses} ${flexDirectionClass} ${variantClasses[variant]} ${actualSizeClasses} ${shadowClass} ${widthClass} rounded-lg ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
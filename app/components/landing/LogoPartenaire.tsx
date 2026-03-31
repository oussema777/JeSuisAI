import React from 'react';
import Image from 'next/image';
import { Building2 } from 'lucide-react';

interface LogoPartenaireProps {
  nom: string;
  logo?: string;
  variant?: 'light' | 'dark';
}

export function LogoPartenaire({ nom, logo, variant = 'dark' }: LogoPartenaireProps) {
  const isDark = variant === 'dark';
  
  return (
    <div className={`flex flex-col items-center gap-3 p-4 rounded-lg transition-all cursor-pointer ${
      isDark ? 'hover:bg-white/5' : 'hover:bg-primary/5'
    }`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden backdrop-blur-sm ${
        isDark ? 'bg-white/10' : 'bg-primary/10'
      }`}>
        {logo ? (
          <Image src={logo} alt={nom} width={64} height={64} className="w-full h-full object-cover" />
        ) : (
          <Building2 className={`w-8 h-8 ${isDark ? 'text-white/60' : 'text-primary'}`} strokeWidth={2} />
        )}
      </div>
      <span className={`text-center ${isDark ? 'text-white' : 'text-primary'}`} style={{ fontSize: '14px', fontWeight: 500 }}>
        {nom}
      </span>
    </div>
  );
}
'use client';

import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface CarteAlerteProps {
  categorie: string;
  titre: string;
  date: string;
  source: string;
  lienHref?: string;
  onLienClick?: () => void;
}

export function CarteAlerte({ categorie, titre, date, source, lienHref, onLienClick }: CarteAlerteProps) {
  const t = useTranslations('Public.NewsAlert');
  const tCat = useTranslations('Admin.NewsForm.categories');

  const getCategoryLabel = (catKey: string) => {
    try {
      return tCat(catKey) || catKey;
    } catch (e) {
      return catKey;
    }
  };
  
  const linkContent = (
    <div
      className="inline-flex items-center gap-1 text-accent hover:gap-2 transition-all font-medium"
      style={{ fontSize: '14px', fontWeight: 600 }}
    >
      {t('read_announcement')}
      <ArrowRight className="w-4 h-4" strokeWidth={2} />
    </div>
  )

  return (
    <div className="bg-accent/10 border-l-4 border-accent rounded-lg p-5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-accent" strokeWidth={2} />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center px-2.5 py-1 rounded bg-accent text-white"
              style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}
            >
              {t('urgent')}
            </span>
            <span className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 500 }}>
              {getCategoryLabel(categorie)}
            </span>
          </div>
          
          <h3 className="text-neutral-900 mb-2" style={{ fontSize: '18px', lineHeight: '1.4', fontWeight: 600 }}>
            {titre}
          </h3>
          
          <div className="flex items-center gap-3 mb-3 text-neutral-600" style={{ fontSize: '13px' }}>
            <span>{t('published', { date })}</span>
            <span>•</span>
            <span>{source}</span>
          </div>
          
          {lienHref ? (
          <Link href={lienHref} passHref>
            {linkContent}
          </Link>
        ) : (
          <button onClick={onLienClick}>
            {linkContent}
          </button>
        )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { Calendar, ArrowRight, MapPin, Tag } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface CarteActualiteEtendueProps {
  id: string;
  titre: string;
  resume: string;
  categorie: string;
  imageUrl: string | null;
  date: string;
  mairie: string;
  prioritaire?: boolean;
  mode?: 'grid' | 'list';
}

export function CarteActualiteEtendue({
  id,
  titre,
  resume,
  categorie,
  imageUrl,
  date,
  mairie,
  prioritaire,
  mode = 'grid',
}: CarteActualiteEtendueProps) {
  const t = useTranslations('Public.News');
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
      className="inline-flex items-center gap-1 text-primary hover:gap-2 transition-all font-bold"
      style={{ fontSize: '14px' }}
    >
      {t('read_more')}
      <ArrowRight className="w-4 h-4" strokeWidth={2} />
    </div>
  );

  if (mode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all group">
        <div className="flex flex-col md:flex-row h-full">
          {/* Image */}
          <div className="w-full md:w-72 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
            {imageUrl ? (
              <Image src={imageUrl} alt={titre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-300">
                <Tag size={40} />
              </div>
            )}
            {prioritaire && (
              <div className="absolute top-4 left-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg">
                Prioritaire
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-4 mb-3 text-xs font-bold text-primary uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Tag size={12} />
                {getCategoryLabel(categorie)}
              </span>
              <span className="text-neutral-300">•</span>
              <span className="flex items-center gap-1 text-neutral-500">
                <MapPin size={12} />
                {mairie}
              </span>
            </div>

            <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {titre}
            </h3>

            <p className="text-neutral-600 text-sm line-clamp-2 mb-4 leading-relaxed">
              {resume}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Calendar size={14} />
                <span>{date}</span>
              </div>
              <Link href={`/actualites/${id}`}>
                {linkContent}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col w-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-neutral-100">
      {/* Image */}
      <div className="w-full aspect-[16/10] bg-neutral-100 overflow-hidden relative">
        {imageUrl ? (
          <Image src={imageUrl} alt={titre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <Tag size={48} strokeWidth={1} />
          </div>
        )}
        
        {/* Badge catégorie */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-neutral-900 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
            <Tag size={12} className="text-primary" />
            {getCategoryLabel(categorie)}
          </span>
        </div>

        {prioritaire && (
          <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg">
            Prioritaire
          </div>
        )}
      </div>
      
      {/* Contenu */}
      <div className="p-6 flex flex-col flex-1">
        {/* Date et source */}
        <div className="flex items-center gap-3 mb-4 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{date}</span>
          </div>
          <span className="text-neutral-300">•</span>
          <div className="flex items-center gap-1.5 font-medium text-neutral-700">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span>{mairie}</span>
          </div>
        </div>
        
        {/* Titre */}
        <h3 className="text-neutral-900 mb-3 text-lg font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
          {titre}
        </h3>
        
        {/* Extrait */}
        <p className="text-neutral-600 mb-6 line-clamp-3 text-sm leading-relaxed flex-1">
          {resume}
        </p>
        
        {/* Lien */}
        <div className="pt-4 border-t border-neutral-100 mt-auto">
          <Link href={`/actualites/${id}`} className="block">
            {linkContent}
          </Link>
        </div>
      </div>
    </div>
  );
}

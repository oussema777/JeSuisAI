'use client';
import React from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CaseACocher } from '../ds/CaseACocher';
import { BoutonRadio } from '../ds/BoutonRadio';
import { Bouton } from '../ds/Bouton';

interface FiltresSidebarProps {
  onResetFilters: () => void;
  onApplyFilters: () => void;
  resultCount: number;
}

export function FiltresSidebar({ onResetFilters, onApplyFilters, resultCount }: FiltresSidebarProps) {
  const t = useTranslations('Public.NewsFilters');
  const tCat = useTranslations('Admin.NewsForm.categories');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showMoreSources, setShowMoreSources] = React.useState(false);
  const [showMoreCategories, setShowMoreCategories] = React.useState(false);
  
  const sources = [
    'Ville de Yaoundé',
    'Ville de Douala',
    'Ville de Bafoussam',
    'Ville de Garoua',
    'Aéroport de Yaoundé',
    'Ville de Bamenda',
    'Ville de Limbé',
    'Ville de Maroua',
  ];
  
  const categories = [
    'evenements',
    'projets-developpement',
    'ceremonies',
    'avis-circulation',
    'offres-recrutement',
    'appel-offres',
    'campagnes-sensibilisation',
    'services-citoyens',
    'activites-maire',
    'invitations',
  ];
  
  const visibleSources = showMoreSources ? sources : sources.slice(0, 5);
  const visibleCategories = showMoreCategories ? categories : categories.slice(0, 5);
  
  return (
    <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-neutral-800" style={{ fontSize: '20px', fontWeight: 600 }}>
          {t('title')}
        </h3>
        <button
          onClick={onResetFilters}
          className="text-neutral-600 hover:text-neutral-800 transition-colors"
          style={{ fontSize: '14px', fontWeight: 500 }}
        >
          {t('reset')}
        </button>
      </div>
      
      {/* Section Recherche */}
      <div className="mb-6">
        <label className="block text-neutral-700 mb-3" style={{ fontSize: '14px', fontWeight: 600 }}>
          {t('search_label')}
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" strokeWidth={2} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            style={{ fontSize: '14px' }}
          />
        </div>
      </div>
      
      {/* Section Source */}
      <div className="mb-6">
        <label className="block text-neutral-700 mb-3" style={{ fontSize: '14px', fontWeight: 600 }}>
          {t('source_label')}
        </label>
        <div className="flex flex-col gap-3">
          {visibleSources.map((source) => (
            <CaseACocher
              key={source}
              label={source}
              onChange={() => {}}
            />
          ))}
        </div>
        {!showMoreSources && sources.length > 5 && (
          <button
            onClick={() => setShowMoreSources(true)}
            className="text-primary hover:text-primary-dark mt-3 transition-colors"
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            {t('see_more')}
          </button>
        )}
      </div>
      
      {/* Section Catégorie */}
      <div className="mb-6">
        <label className="block text-neutral-700 mb-3" style={{ fontSize: '14px', fontWeight: 600 }}>
          {t('category_label')}
        </label>
        <div className="flex flex-col gap-3">
          {visibleCategories.map((catKey) => (
            <CaseACocher
              key={catKey}
              label={tCat(catKey) || catKey}
              onChange={() => {}}
            />
          ))}
        </div>
        {!showMoreCategories && categories.length > 5 && (
          <button
            onClick={() => setShowMoreCategories(true)}
            className="text-primary hover:text-primary-dark mt-3 transition-colors"
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            {t('see_more')}
          </button>
        )}
      </div>
      
      {/* Section Public Visé */}
      <div className="mb-6">
        <label className="block text-neutral-700 mb-3" style={{ fontSize: '14px', fontWeight: 600 }}>
          {t('audience_label')}
        </label>
        <div className="flex flex-col gap-3">
          <BoutonRadio
            name="public"
            label={t('audience_all')}
            checked={true}
            onChange={() => {}}
          />
          <BoutonRadio
            name="public"
            label={t('audience_everyone')}
            onChange={() => {}}
          />
          <BoutonRadio
            name="public"
            label={t('audience_diaspora')}
            onChange={() => {}}
          />
          <BoutonRadio
            name="public"
            label={t('audience_targeted')}
            onChange={() => {}}
          />
        </div>
      </div>
      
      {/* Section Période */}
      <div className="mb-6">
        <label className="block text-neutral-700 mb-3" style={{ fontSize: '14px', fontWeight: 600 }}>
          {t('period_label')}
        </label>
        <div className="flex flex-col gap-3">
          <BoutonRadio
            name="periode"
            label={t('period_all')}
            checked={true}
            onChange={() => {}}
          />
          <BoutonRadio
            name="periode"
            label={t('period_24h')}
            onChange={() => {}}
          />
          <BoutonRadio
            name="periode"
            label={t('period_week')}
            onChange={() => {}}
          />
          <BoutonRadio
            name="periode"
            label={t('period_month')}
            onChange={() => {}}
          />
          <BoutonRadio
            name="periode"
            label={t('period_year')}
            onChange={() => {}}
          />
        </div>
      </div>
      
      {/* Bouton Appliquer */}
      <Bouton
        variant="primaire"
        size="moyen"
        onClick={onApplyFilters}
        className="w-full"
      >
        {t('apply_button', { count: resultCount })}
      </Bouton>
    </div>
  );
}

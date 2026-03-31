'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Grid3x3, List, Mail, Newspaper } from 'lucide-react';
import { Bouton } from '../components/ds/Bouton';
import { MenuDeroulant } from '../components/ds/MenuDeroulant';
import { FiltresSidebar } from '../components/actualites/FiltresSidebar';
import { CarteActualiteEtendue } from '../components/actualites/CarteActualiteEtendue';
import { Pagination } from '../components/actualites/Pagination';
import { FilDAriane } from '../components/listing/FilDAriane';
import { useRouter } from '@/i18n/routing';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getPublicUrl } from '@/lib/supabase/storage';
import { useTranslations, useLocale } from 'next-intl';

interface Actualite {
  id: string;
  titre: string;
  resume: string;
  objet: string;
  image_principale_path: string | null;
  created_at: string;
  mairie_emettrice: string;
  prioritaire: boolean;
}

interface ListingActualitesProps {
  initialData: Actualite[];
  initialCount: number;
}

export default function ListingActualites({ initialData, initialCount }: ListingActualitesProps) {
  const t = useTranslations('Public.News');
  const locale = useLocale();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [emailNewsletter, setEmailNewsletter] = useState('');

  const [actualites, setActualites] = useState<Actualite[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(initialCount);
  const itemsPerPage = 9;

  // Only fetch client-side for pages beyond page 1
  useEffect(() => {
    if (currentPage === 1) {
      // Use server-provided data for page 1
      setActualites(initialData);
      setTotalCount(initialCount);
      return;
    }

    const fetchPage = async () => {
      try {
        setLoading(true);
        const supabase = getSupabaseBrowserClient();

        const { data, error } = await supabase
          .from('actualites')
          .select('*')
          .eq('statut_publication', 'publier')
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

        if (error) throw error;
        setActualites(data || []);
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [currentPage, initialData, initialCount]);

  const getImageUrl = (path: string | null) => {
    if (!path) return "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=600&h=400&fit=crop";
    return getPublicUrl('actualites', path);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Fil d'ariane */}
      <div className="w-full border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-4">
          <FilDAriane
            items={[
              { label: t('breadcrumb_home'), href: '/' },
              { label: t('breadcrumb_news') },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Sidebar avec filtres */}
          <aside className="lg:col-span-3">
            <FiltresSidebar
              onResetFilters={() => {}}
              onApplyFilters={() => {}}
              resultCount={totalCount}
            />
            
            {/* Newsletter Encart */}
            <div className="mt-10 bg-primary rounded-2xl p-6 text-white shadow-xl shadow-primary/20">
              <Mail className="w-10 h-10 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">{t('newsletter_title')}</h3>
              <p className="text-primary-foreground/80 text-sm mb-6 leading-relaxed">
                {t('newsletter_subtitle')}
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder={t('newsletter_placeholder')}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
                  value={emailNewsletter}
                  onChange={(e) => setEmailNewsletter(e.target.value)}
                />
                <button className="w-full py-3 bg-white text-primary font-bold rounded-xl hover:bg-neutral-100 transition-colors shadow-lg">
                  {t('newsletter_button')}
                </button>
              </div>
            </div>
          </aside>

          {/* Liste des actualités */}
          <main className="lg:col-span-9 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
                  {t('title')}
                </h1>
                <p className="text-neutral-600 max-w-2xl">
                  {t('subtitle')}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white border border-neutral-200 rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-neutral-400 hover:text-neutral-600'}`}
                    title={t('view_grid')}
                  >
                    <Grid3x3 size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-neutral-400 hover:text-neutral-600'}`}
                    title={t('view_list')}
                  >
                    <List size={20} />
                  </button>
                </div>

                <MenuDeroulant
                  label={t('sort_label')}
                  options={[
                    { label: t('sort_recent'), value: 'recent' },
                    { label: t('sort_old'), value: 'old' },
                  ]}
                  onChange={() => {}}
                />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-3xl h-96 animate-pulse border border-neutral-100" />
                ))}
              </div>
            ) : actualites.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-neutral-300 py-20 text-center">
                <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Newspaper className="text-neutral-300 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">{t('empty_state')}</h3>
                <p className="text-neutral-500 max-w-sm mx-auto">
                  {t('empty_state_subtitle')}
                </p>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "space-y-6"}>
                  {actualites.map((actu) => (
                    <CarteActualiteEtendue
                      key={actu.id}
                      id={actu.id}
                      titre={actu.titre}
                      resume={actu.resume}
                      categorie={actu.objet}
                      imageUrl={getImageUrl(actu.image_principale_path)}
                      date={formatDate(actu.created_at)}
                      mairie={actu.mairie_emettrice}
                      prioritaire={actu.prioritaire}
                      mode={viewMode}
                    />
                  ))}
                </div>

                {totalCount > itemsPerPage && (
                  <div className="pt-10 flex justify-center border-t border-neutral-200">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(totalCount / itemsPerPage)}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

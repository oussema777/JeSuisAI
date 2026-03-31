'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Grid, List, Eye, Calendar, Edit2,
  Trash2, AlertTriangle, Loader2, Tag, X as XIcon, Newspaper as NewspaperIcon,
  Clock, MapPin
} from 'lucide-react';
import { HeaderAdmin } from '../components/admin/HeaderAdmin';
import { Bouton } from '../components/ds/Bouton';
import { Pagination } from '../components/listing/Pagination';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';
import { Badge } from '../components/ds/Badge';
import { BadgeStatut } from '../components/ds/BadgeStatut';
import Image from 'next/image';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { useTranslations, useLocale } from 'next-intl';

interface Actualite {
  id: string;
  titre: string;
  objet: string;
  statut_publication: string;
  created_at: string;
  image_principale_path: string | null;
  resume: string;
  prioritaire: boolean;
  epingle: boolean;
  public_vise: string;
}

// Helper to construct image URL from path
const getStorageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/actualites/${path}`;
};

export default function GestionActualites() {
  const t = useTranslations('Admin.NewsManagement');
  const tCat = useTranslations('Admin.NewsForm.categories');
  const tForm = useTranslations('Admin.NewsForm');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');
  const isBrouillonView = viewParam === 'brouillons';
  const { profile, loading: authLoading, supabase } = useAuth();
  
  const ITEMS_PER_PAGE = 20;
  const [actualites, setActualites] = useState<Actualite[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, isBrouillonView]);

  const fetchActualites = useCallback(async () => {
    if (authLoading) return;
    if (!profile) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Build filters helper
      const applyFilters = (q: any) => {
        // Multi-tenancy: Filter by annonceur_id for Admins
        if (profile?.role === 'Admin') {
          if (profile.annonceur_id) {
            q = q.eq('annonceur_id', profile.annonceur_id);
          } else {
            q = q.eq('created_by', profile.id);
          }
        } else if (profile?.role === 'Annonceur') {
          q = q.eq('created_by', profile.id);
        }

        if (isBrouillonView) {
          q = q.eq('statut_publication', 'brouillon');
        }
        if (debouncedSearch) {
          q = q.or(`titre.ilike.%${debouncedSearch}%,objet.ilike.%${debouncedSearch}%`);
        }
        return q;
      };

      // Count query
      const { count } = await applyFilters(
        supabase.from('actualites').select('*', { count: 'exact', head: true })
      );
      setTotalCount(count || 0);

      // Paginated data query
      const { data, error } = await applyFilters(
        supabase.from('actualites')
          .select('id, titre, objet, statut_publication, created_at, image_principale_path, resume, prioritaire, epingle, public_vise')
      )
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      setActualites((data as Actualite[]) || []);
    } catch (err: any) {
      console.error("Actualites: Error fetching:", err?.message || err);
      toast.error(t('toast.load_error') || "Impossible de charger les actualités.");
    } finally {
      setLoading(false);
    }
  }, [isBrouillonView, debouncedSearch, currentPage, authLoading, profile, supabase, t]);

  useEffect(() => {
    if (!authLoading && profile) {
      fetchActualites();
    } else if (!authLoading && !profile) {
      setLoading(false);
    }
  }, [fetchActualites, authLoading, profile]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const { error } = await supabase.from('actualites').delete().eq('id', deleteTargetId);
      if (error) throw error;
      toast.success(t('toast.delete_success'));
      fetchActualites();
    } catch (err) { 
      toast.error(t('toast.delete_error'));
    } finally {
      setShowDeleteModal(false);
    }
  };

  const getCategoryLabel = (objet: string) => {
    try {
      return tCat(objet);
    } catch (e) {
      return objet;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'publier': return <Badge variant="succes" size="petit">{tForm('statut_publier')}</Badge>;
      case 'brouillon': return <Badge variant="neutre" size="petit">{tForm('statut_brouillon')}</Badge>;
      case 'programmer': return <Badge variant="info" size="petit">{tForm('statut_programmer')}</Badge>;
      default: return <Badge variant="neutre" size="petit">{status}</Badge>;
    }
  };

  return (
    <div className="w-full">
      <HeaderAdmin
        pageTitle={isBrouillonView ? t('title_drafts') : t('title_all')}
        breadcrumb={[
          { label: tForm('breadcrumb_dashboard'), href: '/admin/dashboard' },
          { label: tForm('breadcrumb_news') }
        ]} 
      />
      
      <div className="pt-20 lg:pt-24 space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center px-4 md:px-0">
          <h2 className="text-2xl font-bold">{isBrouillonView ? t('title_drafts') : t('title_all')}</h2>
          <Bouton variant="primaire" onClick={() => router.push('/admin/actualites/creer')}>
            <Plus size={20} /> {t('create_button')}
          </Bouton>
        </div>

        {/* Filters Bar */}
        <div className="mx-4 md:mx-0 bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center flex-1 min-w-[200px] h-11 border border-neutral-300 rounded-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all bg-white">
            <Search className="ml-3 mr-2 text-neutral-400 flex-shrink-0" size={18} strokeWidth={2} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="flex-1 h-full pr-4 border-none outline-none bg-transparent"
              style={{ fontSize: '15px' }}
            />
          </div>
          <div className="flex gap-2 border-l border-neutral-200 pl-4">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'hover:bg-neutral-100 text-neutral-500'}`}
              title={t('view_grid')}
              aria-label={t('view_grid')}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'hover:bg-neutral-100 text-neutral-500'}`}
              title={t('view_list')}
              aria-label={t('view_list')}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 md:px-0">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-neutral-200 overflow-hidden animate-pulse">
                  <div className="h-44 bg-neutral-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-24 bg-neutral-200 rounded" />
                    <div className="h-5 w-full bg-neutral-200 rounded" />
                    <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : actualites.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-neutral-200 py-20 text-center">
              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <NewspaperIcon className="text-neutral-300" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">{t('empty_state')}</h3>
              <p className="text-neutral-500 max-w-sm mx-auto">{t('empty_state_subtitle')}</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm"}>
              {viewMode === 'grid' ? (
                actualites.map(a => (
                  <div key={a.id} className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                    {/* Card Image */}
                    <div className="relative aspect-[16/9] bg-neutral-100 overflow-hidden">
                      {a.image_principale_path ? (
                        <Image 
                          src={getStorageUrl(a.image_principale_path)!} 
                          alt={a.titre} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <NewspaperIcon size={48} strokeWidth={1} />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {getStatusBadge(a.statut_publication)}
                        {a.prioritaire && <BadgeStatut variant="urgent">{tForm('prioritaire_label')}</BadgeStatut>}
                        {a.epingle && <Badge variant="avertissement" size="petit">{tForm('epingle_label')}</Badge>}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-neutral-500 text-xs font-semibold mb-2 uppercase tracking-wider">
                        <Tag size={12} className="text-primary" />
                        {getCategoryLabel(a.objet)}
                      </div>
                      
                      <h4 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
                        {a.titre}
                      </h4>

                      <p className="text-sm text-neutral-600 line-clamp-2 mb-4 flex-1">
                        {a.resume}
                      </p>

                      <div className="space-y-2 mb-6 text-sm text-neutral-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{tForm('preview.published_on', { date: new Date(a.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US') })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Edit2 size={14} />
                          <span>{tForm('public_label')} : {a.public_vise === 'tous' ? tForm('public_tous') : (a.public_vise === 'diaspora' ? tForm('public_diaspora') : tForm('public_cible'))}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-neutral-100">
                        <button 
                          onClick={() => router.push(`/actualites/${a.id}`)}
                          className="p-2 border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 hover:text-primary transition-colors"
                          title={t('actions.view')}
                          aria-label={t('actions.view')}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/actualites/creer?id=${a.id}`)}
                          className="flex-1 py-2.5 bg-neutral-50 text-neutral-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/10 hover:text-primary transition-all"
                        >
                          <Edit2 size={16} />
                          {t('actions.edit')}
                        </button>
                        <button
                          onClick={() => { setDeleteTargetId(a.id); setShowDeleteModal(true); }}
                          className="p-2 border border-neutral-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title={t('actions.delete')}
                          aria-label={t('actions.delete')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[1000px]">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="p-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('table.title')}</th>
                        <th className="p-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('table.category')}</th>
                        <th className="p-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('table.status')}</th>
                        <th className="p-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('table.date')}</th>
                        <th className="p-4 text-right text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('table.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {actualites.map(a => (
                        <tr key={a.id} className="hover:bg-neutral-50/50 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-neutral-100 overflow-hidden flex-shrink-0 relative">
                                {a.image_principale_path && <Image src={getStorageUrl(a.image_principale_path)!} alt={a.titre || 'Image actualité'} fill className="object-cover" />}
                              </div>
                              <span className="font-semibold text-neutral-900 group-hover:text-primary transition-colors">{a.titre}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-neutral-600">{getCategoryLabel(a.objet)}</td>
                          <td className="p-4">{getStatusBadge(a.statut_publication)}</td>
                          <td className="p-4 text-sm text-neutral-600">{new Date(a.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => router.push(`/actualites/${a.id}`)} className="p-2 text-neutral-400 hover:text-primary transition-colors" aria-label={t('actions.view')}><Eye size={18} /></button>
                              <button onClick={() => router.push(`/admin/actualites/creer?id=${a.id}`)} className="p-2 text-neutral-400 hover:text-primary transition-colors" aria-label={t('actions.edit')}><Edit2 size={18} /></button>
                              <button onClick={() => { setDeleteTargetId(a.id); setShowDeleteModal(true); }} className="p-2 text-neutral-400 hover:text-red-500 transition-colors" aria-label={t('actions.delete')}><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 px-4 md:px-0">
            <Pagination
              pageActuelle={currentPage}
              totalPages={totalPages}
              onChangementPage={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label={t('delete_modal.title')}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">{t('delete_modal.title')}</h3>
            <p className="text-neutral-600 mb-8 leading-relaxed">{t('delete_modal.body')}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 border border-neutral-200 rounded-xl font-bold text-neutral-700 hover:bg-neutral-50 transition-colors">{t('delete_modal.cancel')}</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all">{t('delete_modal.confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

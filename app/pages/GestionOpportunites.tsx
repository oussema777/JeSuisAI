'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
// xlsx is dynamically imported in export functions to reduce bundle size
import {
  Search, Upload, Plus, Grid, List, Tag, MapPin, Clock,
  Users, Calendar, Edit2, MoreVertical, Eye, Trash2, AlertTriangle, FileText, Loader2, X as XIcon
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

import { HeaderAdmin } from '../components/admin/HeaderAdmin';
import { Bouton } from '../components/ds/Bouton';
import { Pagination } from '../components/listing/Pagination';
import { ModifierOpportuniteModal } from './ModifierOpportunite';
import { Badge } from '../components/ds/Badge';
import { BadgeStatut } from '../components/ds/BadgeStatut';
import Image from 'next/image';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { toast } from 'sonner';

interface Opportunity {
  id: string; 
  title: string; 
  sector: string; 
  location: string; 
  timing: string;
  status: 'Actif' | 'Brouillon' | 'Fermé' | 'Programmé';
  imagePath?: string | null;
  description?: string;
  publishedDate: string; 
  applicationsCount: number;
}

// Helper to construct image URL from path
const getStorageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/opportunites/${path}`;
};

// Domain-based default image fallback
const getDomainImageFallback = (domaine: string | null): string => {
  if (!domaine) return '/images/domaines/innovation.jpg';
  const mapping: Record<string, string> = {
    'investissement': 'investissement',
    'Santé': 'sante',
    'sante': 'sante',
    'pauvrete': 'pauvrete',
    'societe-civile': 'societe-civile',
    'infrastructures': 'infrastructures',
    'environnement': 'environnement',
    'éducation': 'education',
    'education': 'education',
    'innovation': 'innovation',
    'recrutement': 'recrutement',
    'tourisme': 'tourisme',
    'culture': 'culture',
    'rayonnement': 'rayonnement',
    'droits': 'droits',
    'urgences': 'urgences',
  };
  const filename = mapping[domaine] || 'innovation';
  return `/images/domaines/${filename}.jpg`;
};

export function GestionOpportunites({ onNavigate }: { onNavigate?: any }) {
  const t = useTranslations('Admin.Missions');
  const tCommon = useTranslations('Common');
  const params = useParams();
  const currentLocale = params.locale as string || 'fr';
  const searchParams = useSearchParams();
  const router = useRouter();
  const isBrouillonView = searchParams.get('view') === 'brouillons';
  const { profile, loading: authLoading, supabase } = useAuth();
  const ITEMS_PER_PAGE = 20;
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, isBrouillonView]);

  const fetchOpportunities = useCallback(async () => {
    if (authLoading || !profile) return;

    setIsLoading(true);
    try {
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
          q = q.or(`intitule_action.ilike.%${debouncedSearch}%,domaine_action.ilike.%${debouncedSearch}%`);
        }
        return q;
      };

      // Count query
      const { count } = await applyFilters(
        supabase.from('opportunites').select('*', { count: 'exact', head: true })
      );
      setTotalCount(count || 0);

      // Paginated data query
      const { data, error } = await applyFilters(
        supabase.from('opportunites')
          .select('id, intitule_action, domaine_action, timing_action, statut_publication, created_at, photo_representation_path, description_generale')
      )
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      if (data) {
        setOpportunities(data.map((item: any) => ({
          id: item.id,
          title: item.intitule_action || 'Sans titre',
          sector: item.domaine_action || 'Non défini',
          location: item.ville || item.region || 'Cameroun',
          timing: item.timing_action || 'Ponctuelle',
          status: (item.statut_publication === 'publie' ? 'Publié' : item.statut_publication === 'brouillon' ? 'Brouillon' : item.statut_publication === 'programme' ? 'Programmé' : 'Clôturée') as any,
          publishedDate: item.created_at,
          imagePath: item.photo_representation_path,
          description: item.description_generale,
          applicationsCount: 0
        })));
      }
    } catch (e: any) {
      console.error("Missions: Error fetching:", e?.message || e);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, isBrouillonView, debouncedSearch, currentPage, authLoading, profile]);

  useEffect(() => {
    if (!authLoading && profile) {
      fetchOpportunities();
    } else if (!authLoading && !profile) {
      setIsLoading(false);
    }
  }, [fetchOpportunities, authLoading, profile]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const { error } = await supabase.from('opportunites').delete().eq('id', deleteTargetId);
      if (error) throw error;
      toast.success("Mission supprimée.");
      fetchOpportunities();
    } catch (e) {
      console.error("Delete error:", e);
      toast.error("Une erreur est survenue lors de la suppression.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Publié': return <Badge variant="succes" size="petit">{currentLocale === 'en' ? 'Published' : 'Publié'}</Badge>;
      case 'Brouillon': return <Badge variant="neutre" size="petit">{currentLocale === 'en' ? 'Draft' : 'Brouillon'}</Badge>;
      case 'Programmé': return <Badge variant="info" size="petit">{currentLocale === 'en' ? 'Scheduled' : 'Programmé'}</Badge>;
      case 'Clôturée': return <Badge variant="erreur" size="petit">{currentLocale === 'en' ? 'Closed' : 'Clôturée'}</Badge>;
      default: return <Badge variant="neutre" size="petit">{status}</Badge>;
    }
  };

  return (
    <div className="w-full">
      <HeaderAdmin 
        pageTitle={isBrouillonView ? t('title_drafts') : t('title_all')} 
        breadcrumb={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: t('table.mission') }]} 
      />
      <div className="pt-20 lg:pt-24 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{isBrouillonView ? t('title_drafts') : t('title_all')}</h2>
          <Bouton variant="primaire" onClick={() => router.push('/admin/opportunites/creer')}><Plus size={20} /> {t('create_button')}</Bouton>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex flex-wrap gap-4 items-center">
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
              title="Vue grille"
              aria-label="Vue grille"
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'hover:bg-neutral-100 text-neutral-500'}`}
              title="Vue liste"
              aria-label="Vue liste"
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 overflow-hidden animate-pulse">
                <div className="h-44 bg-neutral-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-24 bg-neutral-200 rounded" />
                  <div className="h-5 w-full bg-neutral-200 rounded" />
                  <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                  <div className="h-9 w-full bg-neutral-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-neutral-200 py-20 text-center">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-neutral-300" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">{t('empty_state')}</h3>
            <p className="text-neutral-500 max-w-sm mx-auto">{t('empty_state_subtitle')}</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm"}>
            {viewMode === 'grid' ? (
              opportunities.map(opp => (
                <div key={opp.id} className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                  {/* Card Header with Image */}
                  <div className="relative aspect-[16/9] bg-neutral-100 overflow-hidden">
                    <Image
                      src={opp.imagePath ? getStorageUrl(opp.imagePath)! : getDomainImageFallback(opp.sector)}
                      alt={opp.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {getStatusBadge(opp.status)}
                      {opp.timing === 'Urgente' && <BadgeStatut variant="urgent">Urgent</BadgeStatut>}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-neutral-500 text-xs font-semibold mb-2 uppercase tracking-wider">
                      <Tag size={12} className="text-primary" />
                      {opp.sector}
                    </div>
                    
                    <h4 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
                      {opp.title}
                    </h4>

                    <div className="space-y-2 mt-auto mb-6">
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <MapPin size={14} className="text-neutral-400" />
                        <span>{opp.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Clock size={14} className="text-neutral-400" />
                        <span>{opp.timing}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Calendar size={14} className="text-neutral-400" />
                        <span>{new Date(opp.publishedDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-4 border-t border-neutral-100">
                      <button 
                        onClick={() => router.push(`/missions/${opp.id}`)}
                        className="p-2 border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 hover:text-primary transition-colors"
                        title={t('actions.view')}
                        aria-label={t('actions.view')}
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => { setEditTargetId(opp.id); setShowEditModal(true); }} 
                        className="flex-1 py-2.5 bg-neutral-50 text-neutral-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Edit2 size={16} />
                        {tCommon('edit')}
                      </button>
                      <button 
                        onClick={() => { setDeleteTargetId(opp.id); setShowDeleteModal(true); }} 
                        className="p-2 border border-neutral-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title={tCommon('delete')}
                        aria-label={tCommon('delete')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <table className="w-full border-collapse">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="p-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('table.mission')}</th>
                    <th className="p-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('table.sector')}</th>
                    <th className="p-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('table.status')}</th>
                    <th className="p-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('table.timing')}</th>
                    <th className="p-4 text-right text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {opportunities.map(opp => (
                    <tr key={opp.id} className="hover:bg-neutral-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-neutral-100 overflow-hidden flex-shrink-0 relative">
                            <Image src={opp.imagePath ? getStorageUrl(opp.imagePath)! : getDomainImageFallback(opp.sector)} alt={opp.title || 'Image opportunité'} fill className="object-cover" />
                          </div>
                          <span className="font-semibold text-neutral-900 group-hover:text-primary transition-colors">{opp.title}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-neutral-600">{opp.sector}</td>
                      <td className="p-4">{getStatusBadge(opp.status)}</td>
                      <td className="p-4 text-sm text-neutral-600">{opp.timing}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => router.push(`/missions/${opp.id}`)} className="p-2 text-neutral-400 hover:text-primary transition-colors" aria-label={t('actions.view')}><Eye size={18} /></button>
                          <button onClick={() => { setEditTargetId(opp.id); setShowEditModal(true); }} className="p-2 text-neutral-400 hover:text-primary transition-colors" aria-label={tCommon('edit')}><Edit2 size={18} /></button>
                          <button onClick={() => { setDeleteTargetId(opp.id); setShowDeleteModal(true); }} className="p-2 text-neutral-400 hover:text-red-500 transition-colors" aria-label={tCommon('delete')}><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-8">
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
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label="Confirmer la suppression">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Supprimer la mission ?</h3>
            <p className="text-neutral-600 mb-8 leading-relaxed">Cette action est irréversible. Toutes les données associées à cette mission seront définitivement supprimées.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 border border-neutral-200 rounded-xl font-bold text-neutral-700 hover:bg-neutral-50 transition-colors">Annuler</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all">Supprimer</button>
            </div>
          </div>
        </div>
      )}
      <ModifierOpportuniteModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} opportunityId={editTargetId} onUpdateSuccess={fetchOpportunities} />
    </div>
  );
}

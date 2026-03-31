'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Shield,
  MapPin,
  FileText,
  Newspaper,
  Tag,
} from 'lucide-react';
import { StatsCard } from '../components/admin/StatsCard';
import { ExportModal } from '../components/admin/ExportModal';
import { SidebarSuperadmin } from '../components/superadmin/Sidebarsuperadmin';
import { HeaderSuperadmin } from '../components/superadmin/HeaderSuperadmin';
import { Pagination } from '../components/listing/Pagination';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/routing';

interface Actualite {
  id: string;
  created_at: string;
  titre: string;
  objet: string;
  resume: string;
  statut_publication: string;
  prioritaire: boolean;
  epingle: boolean;
  public_vise: string;
  image_principale_path: string | null;
  annonceur_profiles: {
    nom: string | null;
    ville: string | null;
  }[] | { nom: string | null; ville: string | null } | null;
}

const getAnnonceur = (item: Actualite) => {
  const p = item.annonceur_profiles;
  if (!p) return { nom: null, ville: null };
  if (Array.isArray(p)) return p[0] || { nom: null, ville: null };
  return p;
};

type FilterStatus = 'tous' | 'publie' | 'brouillon' | 'programmer';
type SortField = 'created_at' | 'titre' | 'objet' | 'statut_publication';
type SortDirection = 'asc' | 'desc';

export default function GestionActualitesSuperadmin() {
  const { profile, loading: authLoading, isSuperadmin, supabase } = useAuth();
  const router = useRouter();

  const ITEMS_PER_PAGE = 20;

  const [actualites, setActualites] = useState<Actualite[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('tous');
  const [filterCity, setFilterCity] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFilter, setExportFilter] = useState('all');
  const [cities, setCities] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [stats, setStats] = useState({ total: 0, publiees: 0, brouillons: 0, programmees: 0 });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterStatus, filterCity, sortField, sortDirection]);

  useEffect(() => {
    const handleClick = () => { setShowStatusFilter(false); setShowCityFilter(false); };
    if (showStatusFilter || showCityFilter) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showStatusFilter, showCityFilter]);

  const fetchCities = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('annonceur_profiles')
      .select('ville')
      .not('ville', 'is', null)
      .order('ville');
    if (data) {
      const unique = [...new Set(data.map((d: any) => d.ville).filter(Boolean))] as string[];
      setCities(unique);
    }
  }, [supabase]);

  useEffect(() => { fetchCities(); }, [fetchCities]);

  const applyFilters = (query: any) => {
    if (filterStatus !== 'tous') {
      query = query.eq('statut_publication', filterStatus);
    }
    if (debouncedSearch) {
      const s = `%${debouncedSearch}%`;
      query = query.or(`titre.ilike.${s},objet.ilike.${s}`);
    }
    return query;
  };

  const fetchActualites = useCallback(async () => {
    if (authLoading || !profile) return;
    setLoading(true);
    try {
      let countQuery = supabase.from('actualites').select('*, annonceur_profiles(nom, ville)', { count: 'exact', head: true });
      countQuery = applyFilters(countQuery);
      if (filterCity !== 'tous') countQuery = countQuery.eq('annonceur_profiles.ville', filterCity);
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      setTotalCount(count || 0);

      let dataQuery = supabase
        .from('actualites')
        .select('id, created_at, titre, objet, resume, statut_publication, prioritaire, epingle, public_vise, image_principale_path, annonceur_profiles(nom, ville)');
      dataQuery = applyFilters(dataQuery);
      if (filterCity !== 'tous') dataQuery = dataQuery.eq('annonceur_profiles.ville', filterCity);

      const { data, error } = await dataQuery
        .order(sortField, { ascending: sortDirection === 'asc' })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      setActualites((data as Actualite[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des actualités:', error);
      toast.error('Erreur lors du chargement des actualités');
    } finally {
      setLoading(false);
    }
  }, [supabase, authLoading, profile, currentPage, debouncedSearch, filterStatus, filterCity, sortField, sortDirection]);

  const fetchStats = useCallback(async () => {
    if (!supabase || !profile) return;
    const counts = await Promise.all([
      supabase.from('actualites').select('*', { count: 'exact', head: true }),
      supabase.from('actualites').select('*', { count: 'exact', head: true }).eq('statut_publication', 'publie'),
      supabase.from('actualites').select('*', { count: 'exact', head: true }).eq('statut_publication', 'brouillon'),
      supabase.from('actualites').select('*', { count: 'exact', head: true }).eq('statut_publication', 'programmer'),
    ]);
    setStats({
      total: counts[0].count || 0,
      publiees: counts[1].count || 0,
      brouillons: counts[2].count || 0,
      programmees: counts[3].count || 0,
    });
  }, [supabase, profile]);

  useEffect(() => {
    if (!authLoading && profile) {
      if (!isSuperadmin) { window.location.href = '/admin/dashboard'; return; }
      fetchActualites();
      fetchStats();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [fetchActualites, fetchStats, authLoading, profile, isSuperadmin]);

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const { error } = await supabase.from('actualites').delete().eq('id', deleteTargetId);
      if (error) throw error;
      toast.success('Actualité supprimée.');
      fetchActualites();
      fetchStats();
    } catch (e) {
      console.error('Delete error:', e);
      toast.error('Une erreur est survenue lors de la suppression.');
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      let query = supabase
        .from('actualites')
        .select('id, created_at, titre, objet, resume, statut_publication, prioritaire, epingle, public_vise, annonceur_profiles(nom, ville)');
      if (exportFilter !== 'all') query = query.eq('statut_publication', exportFilter);
      const { data: exportData, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      if (!exportData || exportData.length === 0) { toast.info('Aucune actualité trouvée pour ce filtre.'); return; }

      const formattedData = exportData.map((item: any) => {
        const ann = Array.isArray(item.annonceur_profiles) ? item.annonceur_profiles[0] : item.annonceur_profiles;
        return {
          'Date': new Date(item.created_at).toLocaleDateString('fr-FR'),
          'Titre': item.titre || '',
          'Catégorie': item.objet || '',
          'Ville': ann?.ville || '',
          'Annonceur': ann?.nom || '',
          'Statut': getStatusLabel(item.statut_publication),
          'Prioritaire': item.prioritaire ? 'Oui' : 'Non',
          'Épinglé': item.epingle ? 'Oui' : 'Non',
          'Public visé': item.public_vise || '',
          'Résumé': item.resume || '',
        };
      });

      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Actualites');
      XLSX.writeFile(workbook, `Export_Actualites_${exportFilter}_${new Date().toISOString().split('T')[0]}.xlsx`);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Erreur lors de l'exportation.");
    } finally {
      setExportLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSort = (field: SortField) => {
    if (sortField === field) { setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }
    else { setSortField(field); setSortDirection('asc'); }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'publie': return 'Publiée';
      case 'brouillon': return 'Brouillon';
      case 'programmer': return 'Programmée';
      default: return status || 'Inconnu';
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'publie':
        return (<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-700 rounded-md text-xs font-medium"><CheckCircle2 className="w-3 h-3" />Publiée</span>);
      case 'brouillon':
        return (<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 text-orange-700 rounded-md text-xs font-medium"><FileText className="w-3 h-3" />Brouillon</span>);
      case 'programmer':
        return (<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-700 rounded-md text-xs font-medium"><Clock className="w-3 h-3" />Programmée</span>);
      default:
        return (<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-500/10 text-neutral-700 rounded-md text-xs font-medium"><Clock className="w-3 h-3" />{status || 'Inconnu'}</span>);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const getStatusFilterLabel = () => {
    switch (filterStatus) {
      case 'tous': return 'Tous les statuts';
      case 'publie': return 'Publiée';
      case 'brouillon': return 'Brouillon';
      case 'programmer': return 'Programmée';
      default: return 'Tous les statuts';
    }
  };

  return (
    <div className="min-h-screen bg-page-bg flex">
      <SidebarSuperadmin activePage="actualites" />

      <main className="flex-1 ml-[260px] pb-8">
        <HeaderSuperadmin pageTitle="Gestion des Actualités" />

        <div className="p-8 mt-16 lg:mt-[72px] space-y-6">
          {/* Superadmin Banner */}
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-purple-900 font-semibold text-sm mb-1">Accès Superadmin - Vue complète</h4>
                <p className="text-purple-700 text-sm">Vous voyez <strong>toutes les actualités</strong> de toutes les villes.</p>
              </div>
            </div>
          </div>

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-neutral-900 mb-2" style={{ fontSize: '25px', fontWeight: 600 }}>Gestion des actualités</h2>
              <span className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 400 }}>
                <span className="text-primary" style={{ fontWeight: 600 }}>{totalCount}</span>{' '}
                actualité{totalCount > 1 ? 's' : ''}
                {searchQuery && ` trouvée${totalCount > 1 ? 's' : ''}`}
                <span className="text-purple-600"> • Vue complète (Superadmin)</span>
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => setShowExportModal(true)} className="flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors" style={{ fontSize: '14px', fontWeight: 500 }}>
                <FileSpreadsheet className="w-5 h-5" />Exporter
              </button>
              <button onClick={() => { fetchActualites(); fetchStats(); }} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors" style={{ fontSize: '14px', fontWeight: 500 }}>Actualiser</button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatsCard icon={Newspaper} label="Total actualités" value={stats.total} color="bg-accent-yellow/10 text-accent-yellow" />
            <StatsCard icon={CheckCircle2} label="Publiées" value={stats.publiees} color="bg-green-500/10 text-green-700" />
            <StatsCard icon={FileText} label="Brouillons" value={stats.brouillons} color="bg-orange-500/10 text-orange-700" />
            <StatsCard icon={Clock} label="Programmées" value={stats.programmees} color="bg-blue-500/10 text-blue-700" />
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center flex-1 min-w-[300px] h-11 border border-neutral-300 rounded-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all bg-white">
                <Search className="ml-3 mr-2 text-neutral-400 flex-shrink-0" size={18} strokeWidth={2} />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher par titre, catégorie..." className="flex-1 h-full pr-4 border-none outline-none bg-transparent" style={{ fontSize: '16px', fontWeight: 400 }} />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setShowStatusFilter(!showStatusFilter); setShowCityFilter(false); }} className="h-11 flex items-center gap-2 px-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors" style={{ fontSize: '14px', fontWeight: 500 }}>
                  <Filter className="w-5 h-5 text-neutral-600" />
                  <span className="text-neutral-700">{getStatusFilterLabel()}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>
                {showStatusFilter && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50">
                    {([
                      { value: 'tous', label: 'Tous les statuts' },
                      { value: 'publie', label: 'Publiée' },
                      { value: 'brouillon', label: 'Brouillon' },
                      { value: 'programmer', label: 'Programmée' },
                    ] as const).map(option => (
                      <button key={option.value} onClick={() => { setFilterStatus(option.value); setShowStatusFilter(false); }} className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors">
                        <span className={`text-sm ${filterStatus === option.value ? 'text-accent-yellow font-medium' : 'text-neutral-700'}`}>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* City Filter */}
              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setShowCityFilter(!showCityFilter); setShowStatusFilter(false); }} className="h-11 flex items-center gap-2 px-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors" style={{ fontSize: '14px', fontWeight: 500 }}>
                  <MapPin className="w-5 h-5 text-neutral-600" />
                  <span className="text-neutral-700">{filterCity === 'tous' ? 'Toutes les villes' : filterCity}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>
                {showCityFilter && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50 max-h-64 overflow-y-auto">
                    <button onClick={() => { setFilterCity('tous'); setShowCityFilter(false); }} className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors">
                      <span className={`text-sm ${filterCity === 'tous' ? 'text-accent-yellow font-medium' : 'text-neutral-700'}`}>Toutes les villes</span>
                    </button>
                    {cities.map(city => (
                      <button key={city} onClick={() => { setFilterCity(city); setShowCityFilter(false); }} className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors">
                        <span className={`text-sm ${filterCity === city ? 'text-accent-yellow font-medium' : 'text-neutral-700'}`}>{city}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="divide-y divide-neutral-200">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                    <div className="h-10 w-10 bg-neutral-200 rounded" />
                    <div className="flex-1 space-y-2"><div className="h-4 w-40 bg-neutral-200 rounded" /><div className="h-3 w-28 bg-neutral-200 rounded" /></div>
                    <div className="h-6 w-20 bg-neutral-200 rounded-full" />
                    <div className="h-4 w-24 bg-neutral-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : actualites.length === 0 ? (
            <div className="bg-white rounded-xl p-20 text-center shadow-sm">
              <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Newspaper className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Aucune actualité trouvée</h3>
              <p className="text-neutral-600">{searchQuery ? 'Essayez de modifier vos critères de recherche' : 'Les actualités apparaîtront ici'}</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <button onClick={() => handleSort('created_at')} className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900">Date<ArrowUpDown className="w-4 h-4" /></button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button onClick={() => handleSort('titre')} className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900">Titre<ArrowUpDown className="w-4 h-4" /></button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button onClick={() => handleSort('objet')} className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900">Catégorie<ArrowUpDown className="w-4 h-4" /></button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Ville</th>
                      <th className="px-6 py-4 text-left">
                        <button onClick={() => handleSort('statut_publication')} className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900">Statut<ArrowUpDown className="w-4 h-4" /></button>
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {actualites.map((actu) => (
                      <tr key={actu.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-neutral-600">{formatDate(actu.created_at)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {actu.prioritaire && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" title="Prioritaire" />}
                            {actu.epingle && <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" title="Épinglé" />}
                            <p className="text-sm font-medium text-neutral-900 line-clamp-1">{actu.titre}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{actu.objet || 'Non défini'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                            <span className="text-sm text-neutral-700">{getAnnonceur(actu).ville || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(actu.statut_publication)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => router.push(`/actualites/${actu.id}`)} className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors" title="Voir" aria-label="Voir l'actualité"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => router.push(`/admin/actualites/creer?id=${actu.id}`)} className="p-2 text-neutral-600 hover:bg-neutral-100 hover:text-primary rounded-lg transition-colors" title="Modifier" aria-label="Modifier l'actualité"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => { setDeleteTargetId(actu.id); setShowDeleteModal(true); }} className="p-2 text-neutral-600 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors" title="Supprimer" aria-label="Supprimer l'actualité"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination pageActuelle={currentPage} totalPages={totalPages} onChangementPage={setCurrentPage} />
          )}
        </div>
      </main>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label="Confirmer la suppression">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6"><AlertTriangle className="text-red-500" size={32} /></div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Supprimer l'actualité ?</h3>
            <p className="text-neutral-600 mb-8 leading-relaxed">Cette action est irréversible. L'actualité sera définitivement supprimée.</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteModal(false); setDeleteTargetId(null); }} className="flex-1 py-3 border border-neutral-200 rounded-xl font-bold text-neutral-700 hover:bg-neutral-50 transition-colors">Annuler</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          title="Exporter les actualités"
          variant="buttons"
          filterOptions={[
            { id: 'all', label: 'Toutes les actualités' },
            { id: 'publie', label: 'Publiées' },
            { id: 'brouillon', label: 'Brouillons' },
            { id: 'programmer', label: 'Programmées' },
          ]}
          exportFilter={exportFilter}
          setExportFilter={setExportFilter}
          onExport={handleExportData}
          onClose={() => setShowExportModal(false)}
          exportLoading={exportLoading}
        />
      )}
    </div>
  );
}

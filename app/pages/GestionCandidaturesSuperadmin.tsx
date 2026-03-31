'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import {
  Search,
  Eye,
  Inbox,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Shield,
  ArrowUpDown,
  FileSpreadsheet,
  Filter,
  ChevronDown,
  Trash2,
  AlertTriangle,
  X as XIcon,
} from 'lucide-react';
import { SidebarSuperadmin } from '../components/superadmin/Sidebarsuperadmin';
import { HeaderSuperadmin } from '../components/superadmin/HeaderSuperadmin';
import { ExportModal } from '../components/admin/ExportModal';
import { Pagination } from '../components/listing/Pagination';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { toast } from 'sonner';

interface Candidature {
  id: number;
  created_at: string;
  nom_prenom: string;
  email: string;
  pays_residence: string;
  statut: string;
  whatsapp: string | null;
  linkedin_url: string | null;
  lien_territoire: string | null;
  message: string | null;
  opportunites: {
    intitule_action: string | null;
    annonceur_id: string | null;
  } | null;
  annonceur_profiles?: {
    ville: string | null;
  } | null;
}

type FilterStatus = 'toutes' | 'nouvelle' | 'en_attente' | 'repondu' | 'archive';
type SortField = 'created_at' | 'nom_prenom' | 'statut';
type SortDirection = 'asc' | 'desc';

export default function GestionCandidaturesSuperadmin() {
  const { profile, loading: authLoading, isSuperadmin, supabase } = useAuth();
  const router = useRouter();

  const ITEMS_PER_PAGE = 20;

  // State
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('toutes');
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
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Stats
  const [stats, setStats] = useState({ total: 0, nouvelles: 0, enAttente: 0, repondues: 0 });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterStatus, filterCity, sortField, sortDirection]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = () => {
      setShowStatusFilter(false);
      setShowCityFilter(false);
    };
    if (showStatusFilter || showCityFilter) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showStatusFilter, showCityFilter]);

  // Fetch distinct cities
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

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // Fetch candidatures
  const fetchCandidatures = useCallback(async () => {
    if (authLoading || !profile) return;

    setLoading(true);
    try {
      const selectFields = `
        id, created_at, nom_prenom, email, pays_residence, statut, whatsapp, linkedin_url, lien_territoire, message,
        opportunites!inner(intitule_action, annonceur_id, annonceur_profiles(ville))
      `;

      const applyFilters = (q: any) => {
        if (filterStatus !== 'toutes') {
          q = q.eq('statut', filterStatus);
        }
        if (debouncedSearch) {
          q = q.or(`nom_prenom.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
        }
        if (filterCity !== 'tous') {
          q = q.eq('opportunites.annonceur_profiles.ville', filterCity);
        }
        return q;
      };

      // Count query
      const { count, error: countError } = await applyFilters(
        supabase.from('candidatures').select(selectFields, { count: 'exact', head: true })
      );
      if (countError) throw countError;
      setTotalCount(count || 0);

      // Data query
      const { data, error } = await applyFilters(
        supabase.from('candidatures').select(selectFields)
      )
        .order(sortField, { ascending: sortDirection === 'asc' })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      setCandidatures((data as any[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des candidatures:', error);
      toast.error('Erreur lors du chargement des candidatures');
    } finally {
      setLoading(false);
    }
  }, [supabase, authLoading, profile, currentPage, debouncedSearch, filterStatus, filterCity, sortField, sortDirection]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!supabase || !profile) return;
    const counts = await Promise.all([
      supabase.from('candidatures').select('*', { count: 'exact', head: true }),
      supabase.from('candidatures').select('*', { count: 'exact', head: true }).eq('statut', 'nouvelle'),
      supabase.from('candidatures').select('*', { count: 'exact', head: true }).eq('statut', 'en_attente'),
      supabase.from('candidatures').select('*', { count: 'exact', head: true }).eq('statut', 'repondu'),
    ]);
    setStats({
      total: counts[0].count || 0,
      nouvelles: counts[1].count || 0,
      enAttente: counts[2].count || 0,
      repondues: counts[3].count || 0,
    });
  }, [supabase, profile]);

  useEffect(() => {
    if (!authLoading && profile) {
      if (!isSuperadmin) {
        window.location.href = '/admin/dashboard';
        return;
      }
      fetchCandidatures();
      fetchStats();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [fetchCandidatures, fetchStats, authLoading, profile, isSuperadmin]);

  // Delete candidature
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const { error } = await supabase
        .from('candidatures')
        .delete()
        .eq('id', deleteTargetId);

      if (error) throw error;

      toast.success('Candidature supprimée.');
      fetchCandidatures();
      fetchStats();
    } catch (e: any) {
      console.error('Delete error:', e);
      toast.error(e.message || 'Une erreur est survenue lors de la suppression.');
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  // Export
  const handleExportData = async () => {
    try {
      setExportLoading(true);

      let query = supabase
        .from('candidatures')
        .select(`
          id, created_at, nom_prenom, email, whatsapp, pays_residence, statut,
          linkedin_url, lien_territoire, message,
          opportunites!inner(intitule_action, annonceur_profiles(ville, nom))
        `);

      if (exportFilter !== 'all') {
        query = query.eq('statut', exportFilter);
      }

      const { data: exportData, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      if (!exportData || exportData.length === 0) {
        toast.info('Aucune candidature trouvée pour ce filtre.');
        return;
      }

      const formattedData = exportData.map((item: any) => {
        const opp = item.opportunites;
        const annonceur = opp?.annonceur_profiles;
        const ville = Array.isArray(annonceur) ? annonceur[0]?.ville : annonceur?.ville;
        const nom = Array.isArray(annonceur) ? annonceur[0]?.nom : annonceur?.nom;
        return {
          'Date': new Date(item.created_at).toLocaleDateString('fr-FR'),
          'Statut': getStatusLabel(item.statut),
          'Nom & Prénom': item.nom_prenom,
          'Email': item.email,
          'WhatsApp': item.whatsapp || '',
          'Pays': item.pays_residence,
          'Mission': opp?.intitule_action || 'Candidature spontanée',
          'Ville (Annonceur)': ville || '',
          'Annonceur': nom || '',
          'LinkedIn': item.linkedin_url || '',
          'Lien territoire': item.lien_territoire || '',
          'Message': item.message || '',
        };
      });

      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidatures');
      XLSX.writeFile(workbook, `Export_Candidatures_${exportFilter}_${new Date().toISOString().split('T')[0]}.xlsx`);

      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Erreur lors de l'exportation.");
    } finally {
      setExportLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Utility
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'nouvelle': return 'Nouvelle';
      case 'en_attente': return 'En attente';
      case 'repondu': return 'Répondu';
      case 'archive': return 'Archivée';
      default: return status || 'Inconnu';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'nouvelle':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-700 rounded-md text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Nouvelle
          </span>
        );
      case 'en_attente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 text-orange-700 rounded-md text-xs font-medium">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
      case 'repondu':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-700 rounded-md text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Répondu
          </span>
        );
      case 'archive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-700 rounded-md text-xs font-medium">
            <XIcon className="w-3 h-3" />
            Archivée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-500/10 text-neutral-700 rounded-md text-xs font-medium">
            <Clock className="w-3 h-3" />
            {status || 'Inconnu'}
          </span>
        );
    }
  };

  const getInitials = (name: string) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??';

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const getStatusFilterLabel = () => {
    switch (filterStatus) {
      case 'toutes': return 'Tous les statuts';
      case 'nouvelle': return 'Nouvelle';
      case 'en_attente': return 'En attente';
      case 'repondu': return 'Répondu';
      case 'archive': return 'Archivée';
      default: return 'Tous les statuts';
    }
  };

  const getVille = (candidature: any) => {
    const opp = candidature.opportunites;
    if (!opp) return 'N/A';
    const ap = opp.annonceur_profiles;
    if (!ap) return 'N/A';
    if (Array.isArray(ap)) return ap[0]?.ville || 'N/A';
    return ap.ville || 'N/A';
  };

  return (
    <div className="min-h-screen bg-page-bg flex">
      <SidebarSuperadmin activePage="candidatures" />

      <main className="flex-1 ml-[260px] pb-8">
        <HeaderSuperadmin pageTitle="Gestion des Candidatures" />

        <div className="p-8 mt-16 lg:mt-[72px] space-y-6">
          {/* Superadmin Banner */}
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-purple-900 font-semibold text-sm mb-1">
                  Accès Superadmin - Vue complète
                </h4>
                <p className="text-purple-700 text-sm">
                  Vous voyez <strong>toutes les candidatures</strong> de toutes les villes.
                </p>
              </div>
            </div>
          </div>

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-neutral-900 mb-2" style={{ fontSize: '25px', fontWeight: 600 }}>
                Gestion des candidatures
              </h2>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 400 }}>
                  <span className="text-primary" style={{ fontWeight: 600 }}>
                    {totalCount}
                  </span>{' '}
                  candidature{totalCount > 1 ? 's' : ''}
                  {searchQuery && ` trouvée${totalCount > 1 ? 's' : ''}`}
                  <span className="text-purple-600"> • Vue complète (Superadmin)</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                <FileSpreadsheet className="w-5 h-5" />
                Exporter
              </button>
              <button
                onClick={() => { fetchCandidatures(); fetchStats(); }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                Actualiser
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setFilterStatus('toutes')}
              className={`bg-white rounded-xl p-5 shadow-sm transition-all border-2 flex flex-col items-center gap-1 ${filterStatus === 'toutes' ? 'border-primary' : 'border-transparent hover:border-neutral-200'}`}
            >
              <Inbox className="w-7 h-7 text-blue-500" />
              <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
              <div className="text-xs text-neutral-500 font-medium">Total</div>
            </button>
            <button
              onClick={() => setFilterStatus('nouvelle')}
              className={`bg-white rounded-xl p-5 shadow-sm transition-all border-2 flex flex-col items-center gap-1 ${filterStatus === 'nouvelle' ? 'border-primary' : 'border-transparent hover:border-neutral-200'}`}
            >
              <AlertCircle className="w-7 h-7 text-orange-500" />
              <div className="text-2xl font-bold text-neutral-900">{stats.nouvelles}</div>
              <div className="text-xs text-neutral-500 font-medium">Nouvelles</div>
            </button>
            <button
              onClick={() => setFilterStatus('en_attente')}
              className={`bg-white rounded-xl p-5 shadow-sm transition-all border-2 flex flex-col items-center gap-1 ${filterStatus === 'en_attente' ? 'border-primary' : 'border-transparent hover:border-neutral-200'}`}
            >
              <Clock className="w-7 h-7 text-red-500" />
              <div className="text-2xl font-bold text-neutral-900">{stats.enAttente}</div>
              <div className="text-xs text-neutral-500 font-medium">En attente</div>
            </button>
            <button
              onClick={() => setFilterStatus('repondu')}
              className={`bg-white rounded-xl p-5 shadow-sm transition-all border-2 flex flex-col items-center gap-1 ${filterStatus === 'repondu' ? 'border-primary' : 'border-transparent hover:border-neutral-200'}`}
            >
              <CheckCircle className="w-7 h-7 text-green-500" />
              <div className="text-2xl font-bold text-neutral-900">{stats.repondues}</div>
              <div className="text-xs text-neutral-500 font-medium">Répondues</div>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex items-center flex-1 min-w-[300px] h-11 border border-neutral-300 rounded-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all bg-white">
                <Search className="ml-3 mr-2 text-neutral-400 flex-shrink-0" size={18} strokeWidth={2} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, email..."
                  className="flex-1 h-full pr-4 border-none outline-none bg-transparent"
                  style={{ fontSize: '16px', fontWeight: 400 }}
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowStatusFilter(!showStatusFilter); setShowCityFilter(false); }}
                  className="h-11 flex items-center gap-2 px-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  <Filter className="w-5 h-5 text-neutral-600" />
                  <span className="text-neutral-700">{getStatusFilterLabel()}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {showStatusFilter && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50">
                    {([
                      { value: 'toutes', label: 'Tous les statuts' },
                      { value: 'nouvelle', label: 'Nouvelle' },
                      { value: 'en_attente', label: 'En attente' },
                      { value: 'repondu', label: 'Répondu' },
                      { value: 'archive', label: 'Archivée' },
                    ] as const).map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterStatus(option.value);
                          setShowStatusFilter(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors"
                      >
                        <span className={`text-sm ${
                          filterStatus === option.value
                            ? 'text-accent-yellow font-medium'
                            : 'text-neutral-700'
                        }`}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* City Filter */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowCityFilter(!showCityFilter); setShowStatusFilter(false); }}
                  className="h-11 flex items-center gap-2 px-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  <MapPin className="w-5 h-5 text-neutral-600" />
                  <span className="text-neutral-700">
                    {filterCity === 'tous' ? 'Toutes les villes' : filterCity}
                  </span>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {showCityFilter && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => { setFilterCity('tous'); setShowCityFilter(false); }}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors"
                    >
                      <span className={`text-sm ${filterCity === 'tous' ? 'text-accent-yellow font-medium' : 'text-neutral-700'}`}>
                        Toutes les villes
                      </span>
                    </button>
                    {cities.map(city => (
                      <button
                        key={city}
                        onClick={() => { setFilterCity(city); setShowCityFilter(false); }}
                        className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors"
                      >
                        <span className={`text-sm ${filterCity === city ? 'text-accent-yellow font-medium' : 'text-neutral-700'}`}>
                          {city}
                        </span>
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
                    <div className="h-10 w-10 bg-neutral-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 bg-neutral-200 rounded" />
                      <div className="h-3 w-28 bg-neutral-200 rounded" />
                    </div>
                    <div className="h-6 w-20 bg-neutral-200 rounded-full" />
                    <div className="h-4 w-24 bg-neutral-200 rounded" />
                    <div className="h-8 w-8 bg-neutral-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : candidatures.length === 0 ? (
            <div className="bg-white rounded-xl p-20 text-center shadow-sm">
              <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Aucune candidature trouvée
              </h3>
              <p className="text-neutral-600">
                {searchQuery
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Les candidatures apparaîtront ici'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('created_at')}
                          className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                        >
                          Date
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('nom_prenom')}
                          className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                        >
                          Candidat
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                        Mission
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                        Ville
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('statut')}
                          className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                        >
                          Statut
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {candidatures.map((candidature) => (
                      <tr key={candidature.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-neutral-600">
                          {formatDate(candidature.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary text-xs font-bold">
                                {getInitials(candidature.nom_prenom)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-900">
                                {candidature.nom_prenom}
                              </p>
                              <p className="text-xs text-neutral-500">{candidature.pays_residence}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-neutral-700 line-clamp-1 max-w-[200px]">
                            {candidature.opportunites?.intitule_action || 'Candidature spontanée'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                            <span className="text-sm text-neutral-700">
                              {getVille(candidature)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(candidature.statut)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => router.push(`/admin/candidatures/${candidature.id}`)}
                              className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                              title="Voir la candidature"
                              aria-label="Voir la candidature"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setDeleteTargetId(candidature.id); setShowDeleteModal(true); }}
                              className="p-2 text-neutral-600 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                              title="Supprimer la candidature"
                              aria-label="Supprimer la candidature"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
            <Pagination
              pageActuelle={currentPage}
              totalPages={totalPages}
              onChangementPage={setCurrentPage}
            />
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label="Confirmer la suppression">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Supprimer la candidature ?</h3>
            <p className="text-neutral-600 mb-8 leading-relaxed">Cette action est irréversible. Toutes les données de cette candidature seront définitivement supprimées.</p>
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
          title="Exporter les candidatures"
          variant="buttons"
          filterOptions={[
            { id: 'all', label: 'Toutes les candidatures' },
            { id: 'nouvelle', label: 'Nouvelles' },
            { id: 'en_attente', label: 'En attente' },
            { id: 'repondu', label: 'Répondues' },
            { id: 'archive', label: 'Archivées' },
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

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
  Calendar,
  ArrowUpDown,
  FileSpreadsheet,
  FolderOpen,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Shield,
  MapPin,
  Briefcase,
  FileText,
} from 'lucide-react';
import { StatsCard } from '../components/admin/StatsCard';
import { ExportModal } from '../components/admin/ExportModal';
import { ModifierOpportuniteModal } from './ModifierOpportunite';
import { SidebarSuperadmin } from '../components/superadmin/Sidebarsuperadmin';
import { HeaderSuperadmin } from '../components/superadmin/HeaderSuperadmin';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { Pagination } from '../components/listing/Pagination';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/routing';

// Types
interface Mission {
  id: string;
  created_at: string;
  intitule_action: string | null;
  domaine_action: string | null;
  timing_action: string | null;
  statut_publication: string | null;
  description_generale: string | null;
  annonceur_profiles: {
    nom: string | null;
    ville: string | null;
  }[] | { nom: string | null; ville: string | null; } | null;
}

const getAnnonceur = (mission: Mission) => {
  const p = mission.annonceur_profiles;
  if (!p) return { nom: null, ville: null };
  if (Array.isArray(p)) return p[0] || { nom: null, ville: null };
  return p;
};

type FilterStatus = 'tous' | 'publie' | 'brouillon' | 'programme' | 'cloture';
type SortField = 'created_at' | 'intitule_action' | 'domaine_action' | 'statut_publication';
type SortDirection = 'asc' | 'desc';

export default function GestionMissionsSuperadmin() {
  const { profile, loading: authLoading, isSuperadmin, supabase } = useAuth();
  const router = useRouter();

  const ITEMS_PER_PAGE = 20;

  // State
  const [missions, setMissions] = useState<Mission[]>([]);
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({ total: 0, publiees: 0, brouillons: 0, fermees: 0 });

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

  const applyFilters = (query: any) => {
    if (filterStatus !== 'tous') {
      query = query.eq('statut_publication', filterStatus === 'cloture' ? 'cloture' : filterStatus);
    }
    if (debouncedSearch) {
      const s = `%${debouncedSearch}%`;
      query = query.or(`intitule_action.ilike.${s},domaine_action.ilike.${s}`);
    }
    return query;
  };

  // Fetch missions
  const fetchMissions = useCallback(async () => {
    if (authLoading || !profile) return;

    setLoading(true);
    try {
      // Count query
      let countQuery = supabase.from('opportunites').select('*, annonceur_profiles(nom, ville)', { count: 'exact', head: true });
      countQuery = applyFilters(countQuery);
      if (filterCity !== 'tous') {
        countQuery = countQuery.eq('annonceur_profiles.ville', filterCity);
      }
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      setTotalCount(count || 0);

      // Data query
      let dataQuery = supabase
        .from('opportunites')
        .select('id, created_at, intitule_action, domaine_action, timing_action, statut_publication, description_generale, annonceur_profiles(nom, ville)');
      dataQuery = applyFilters(dataQuery);
      if (filterCity !== 'tous') {
        dataQuery = dataQuery.eq('annonceur_profiles.ville', filterCity);
      }

      const { data, error } = await dataQuery
        .order(sortField, { ascending: sortDirection === 'asc' })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      setMissions((data as Mission[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des missions:', error);
      toast.error('Erreur lors du chargement des missions');
    } finally {
      setLoading(false);
    }
  }, [supabase, authLoading, profile, currentPage, debouncedSearch, filterStatus, filterCity, sortField, sortDirection]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!supabase || !profile) return;
    const counts = await Promise.all([
      supabase.from('opportunites').select('*', { count: 'exact', head: true }),
      supabase.from('opportunites').select('*', { count: 'exact', head: true }).eq('statut_publication', 'publie'),
      supabase.from('opportunites').select('*', { count: 'exact', head: true }).eq('statut_publication', 'brouillon'),
      supabase.from('opportunites').select('*', { count: 'exact', head: true }).eq('statut_publication', 'cloture'),
    ]);
    setStats({
      total: counts[0].count || 0,
      publiees: counts[1].count || 0,
      brouillons: counts[2].count || 0,
      fermees: counts[3].count || 0,
    });
  }, [supabase, profile]);

  useEffect(() => {
    if (!authLoading && profile) {
      if (!isSuperadmin) {
        window.location.href = '/admin/dashboard';
        return;
      }
      fetchMissions();
      fetchStats();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [fetchMissions, fetchStats, authLoading, profile, isSuperadmin]);

  // Export
  const handleExportData = async () => {
    try {
      setExportLoading(true);

      let query = supabase
        .from('opportunites')
        .select('id, created_at, intitule_action, domaine_action, timing_action, statut_publication, description_generale, annonceur_profiles(nom, ville)');

      if (exportFilter !== 'all') {
        query = query.eq('statut_publication', exportFilter);
      }

      const { data: exportData, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      if (!exportData || exportData.length === 0) {
        toast.info('Aucune mission trouvée pour ce filtre.');
        return;
      }

      const formattedData = exportData.map((item: any) => ({
        'Date': new Date(item.created_at).toLocaleDateString('fr-FR'),
        'Titre': item.intitule_action || '',
        'Domaine': item.domaine_action || '',
        'Ville': (Array.isArray(item.annonceur_profiles) ? item.annonceur_profiles[0]?.ville : item.annonceur_profiles?.ville) || '',
        'Annonceur': (Array.isArray(item.annonceur_profiles) ? item.annonceur_profiles[0]?.nom : item.annonceur_profiles?.nom) || '',
        'Statut': getStatusLabel(item.statut_publication),
        'Description': item.description_generale || '',
        'Timing': item.timing_action || '',
      }));

      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Missions');
      XLSX.writeFile(workbook, `Export_Missions_${exportFilter}_${new Date().toISOString().split('T')[0]}.xlsx`);

      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Erreur lors de l'exportation.");
    } finally {
      setExportLoading(false);
    }
  };

  // Delete mission
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch('/api/superadmin/delete-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId: deleteTargetId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      toast.success('Mission supprimée.');
      fetchMissions();
      fetchStats();
    } catch (e: any) {
      console.error('Delete error:', e);
      toast.error(e.message || 'Une erreur est survenue lors de la suppression.');
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
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
  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'publie': return 'Publiée';
      case 'brouillon': return 'Brouillon';
      case 'programme': return 'Programmée';
      case 'cloture': return 'Fermée';
      default: return status || 'Inconnu';
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'publie':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-700 rounded-md text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Publiée
          </span>
        );
      case 'brouillon':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 text-orange-700 rounded-md text-xs font-medium">
            <FileText className="w-3 h-3" />
            Brouillon
          </span>
        );
      case 'programme':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-700 rounded-md text-xs font-medium">
            <Clock className="w-3 h-3" />
            Programmée
          </span>
        );
      case 'cloture':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-700 rounded-md text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Fermée
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const getStatusFilterLabel = () => {
    switch (filterStatus) {
      case 'tous': return 'Tous les statuts';
      case 'publie': return 'Publiée';
      case 'brouillon': return 'Brouillon';
      case 'programme': return 'Programmée';
      case 'cloture': return 'Fermée';
      default: return 'Tous les statuts';
    }
  };

  return (
    <div className="min-h-screen bg-page-bg flex">
      <SidebarSuperadmin activePage="missions" />

      <main className="flex-1 ml-[260px] pb-8">
        <HeaderSuperadmin pageTitle="Gestion des Missions" />

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
                Vous voyez <strong>toutes les missions</strong> de toutes les villes.
              </p>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-neutral-900 mb-2" style={{ fontSize: '25px', fontWeight: 600 }}>
              Gestion des missions
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 400 }}>
                <span className="text-primary" style={{ fontWeight: 600 }}>
                  {totalCount}
                </span>{' '}
                mission{totalCount > 1 ? 's' : ''}
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
              onClick={() => { fetchMissions(); fetchStats(); }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            icon={ClipboardList}
            label="Total missions"
            value={stats.total}
            color="bg-accent-yellow/10 text-accent-yellow"
          />
          <StatsCard
            icon={CheckCircle2}
            label="Publiées"
            value={stats.publiees}
            color="bg-green-500/10 text-green-700"
          />
          <StatsCard
            icon={FileText}
            label="Brouillons"
            value={stats.brouillons}
            color="bg-orange-500/10 text-orange-700"
          />
          <StatsCard
            icon={XCircle}
            label="Fermées"
            value={stats.fermees}
            color="bg-red-500/10 text-red-700"
          />
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
                placeholder="Rechercher par titre, domaine..."
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
                    { value: 'tous', label: 'Tous les statuts' },
                    { value: 'publie', label: 'Publiée' },
                    { value: 'brouillon', label: 'Brouillon' },
                    { value: 'programme', label: 'Programmée' },
                    { value: 'cloture', label: 'Fermée' },
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
                    onClick={() => {
                      setFilterCity('tous');
                      setShowCityFilter(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors"
                  >
                    <span className={`text-sm ${
                      filterCity === 'tous'
                        ? 'text-accent-yellow font-medium'
                        : 'text-neutral-700'
                    }`}>
                      Toutes les villes
                    </span>
                  </button>
                  {cities.map(city => (
                    <button
                      key={city}
                      onClick={() => {
                        setFilterCity(city);
                        setShowCityFilter(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors"
                    >
                      <span className={`text-sm ${
                        filterCity === city
                          ? 'text-accent-yellow font-medium'
                          : 'text-neutral-700'
                      }`}>
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
        ) : missions.length === 0 ? (
          <div className="bg-white rounded-xl p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Aucune mission trouvée
            </h3>
            <p className="text-neutral-600">
              {searchQuery
                ? 'Essayez de modifier vos critères de recherche'
                : 'Les missions apparaîtront ici'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
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
                        onClick={() => handleSort('intitule_action')}
                        className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                      >
                        Titre
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('domaine_action')}
                        className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                      >
                        Domaine
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Ville
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('statut_publication')}
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
                  {missions.map((mission) => (
                    <tr key={mission.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {formatDate(mission.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                          {mission.intitule_action || 'Sans titre'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {mission.domaine_action || 'Non défini'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                          <span className="text-sm text-neutral-700">
                            {getAnnonceur(mission).ville || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(mission.statut_publication)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/missions/${mission.id}`)}
                            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Voir la mission"
                            aria-label="Voir la mission"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setEditTargetId(mission.id); setShowEditModal(true); }}
                            className="p-2 text-neutral-600 hover:bg-neutral-100 hover:text-primary rounded-lg transition-colors"
                            title="Modifier la mission"
                            aria-label="Modifier la mission"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setDeleteTargetId(mission.id); setShowDeleteModal(true); }}
                            className="p-2 text-neutral-600 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                            title="Supprimer la mission"
                            aria-label="Supprimer la mission"
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

      {/* Edit Modal */}
      <ModifierOpportuniteModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        opportunityId={editTargetId}
        onUpdateSuccess={() => { fetchMissions(); fetchStats(); }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label="Confirmer la suppression">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Supprimer la mission ?</h3>
            <p className="text-neutral-600 mb-8 leading-relaxed">Cette action est irréversible. Toutes les données associées à cette mission seront définitivement supprimées.</p>
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
          title="Exporter les missions"
          variant="buttons"
          filterOptions={[
            { id: 'all', label: 'Toutes les missions' },
            { id: 'publie', label: 'Publiées' },
            { id: 'brouillon', label: 'Brouillons' },
            { id: 'programme', label: 'Programmées' },
            { id: 'cloture', label: 'Fermées' },
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

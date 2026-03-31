'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  ArrowUpDown,
  FileSpreadsheet,
  Building2,
  Shield,
  MapPin,
  Globe,
  Mail,
  User,
  Paperclip,
  Landmark,
  Heart,
  Briefcase,
} from 'lucide-react';
import { StatsCard } from '../components/admin/StatsCard';
import { ExportModal } from '../components/admin/ExportModal';
import { SidebarSuperadmin } from '../components/superadmin/Sidebarsuperadmin';
import { HeaderSuperadmin } from '../components/superadmin/HeaderSuperadmin';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { Pagination } from '../components/listing/Pagination';
import { toast } from 'sonner';

// Types
interface Annonceur {
  id: string;
  created_at: string;
  nom: string | null;
  logo_url: string | null;
  ville: string | null;
  statut: string | null;
  domaines_action: string[] | null;
  contributions_recherchees: string[] | null;
  contact_legal_email: string | null;
  contact_legal_nom: string | null;
  contact_legal_prenom: string | null;
  nom_dirigeant: string | null;
  poste_dirigeant: string | null;
  site_web: string | null;
  adresse: string | null;
  pieces_jointes: any[] | null;
  facebook: string | null;
  linkedin: string | null;
  tiktok: string | null;
  instagram: string | null;
  facilites_offertes: string[] | null;
}

type FilterStatut = 'tous' | string;
type SortField = 'created_at' | 'nom' | 'ville' | 'statut';
type SortDirection = 'asc' | 'desc';

const STATUT_OPTIONS = [
  { value: 'tous', label: 'Tous les types' },
  { value: 'Collectivité locale', label: 'Collectivité locale' },
  { value: 'Administration centrale', label: 'Administration centrale' },
  { value: 'Aéroport', label: 'Aéroport' },
  { value: 'Bailleur de fonds', label: 'Bailleur de fonds' },
  { value: 'ONG', label: 'ONG' },
  { value: 'Entreprise', label: 'Entreprise' },
];

const DOMAINE_COLORS = [
  'bg-blue-50 text-blue-700',
  'bg-green-50 text-green-700',
  'bg-purple-50 text-purple-700',
  'bg-orange-50 text-orange-700',
  'bg-pink-50 text-pink-700',
  'bg-teal-50 text-teal-700',
];

export default function GestionAnnonceursSuperadmin() {
  const { profile, loading: authLoading, isSuperadmin, supabase } = useAuth();

  const ITEMS_PER_PAGE = 20;

  // State
  const [annonceurs, setAnnonceurs] = useState<Annonceur[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState<FilterStatut>('tous');
  const [filterCity, setFilterCity] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showStatutFilter, setShowStatutFilter] = useState(false);
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFilter, setExportFilter] = useState('all');
  const [cities, setCities] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({ total: 0, collectivites: 0, ong: 0, entreprises: 0 });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterStatut, filterCity, sortField, sortDirection]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = () => {
      setShowStatutFilter(false);
      setShowCityFilter(false);
    };
    if (showStatutFilter || showCityFilter) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showStatutFilter, showCityFilter]);

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
    if (filterStatut !== 'tous') {
      query = query.eq('statut', filterStatut);
    }
    if (filterCity !== 'tous') {
      query = query.eq('ville', filterCity);
    }
    if (debouncedSearch) {
      const s = `%${debouncedSearch}%`;
      query = query.or(`nom.ilike.${s},adresse.ilike.${s}`);
    }
    return query;
  };

  // Fetch annonceurs
  const fetchAnnonceurs = useCallback(async () => {
    if (authLoading || !profile) return;

    setLoading(true);
    try {
      // Count query
      let countQuery = supabase.from('annonceur_profiles').select('*', { count: 'exact', head: true });
      countQuery = applyFilters(countQuery);
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      setTotalCount(count || 0);

      // Data query
      let dataQuery = supabase
        .from('annonceur_profiles')
        .select('id, created_at, nom, logo_url, ville, statut, domaines_action, contributions_recherchees, contact_legal_email, contact_legal_nom, contact_legal_prenom, nom_dirigeant, poste_dirigeant, site_web, adresse, pieces_jointes, facebook, linkedin, tiktok, instagram, facilites_offertes');
      dataQuery = applyFilters(dataQuery);

      const { data, error } = await dataQuery
        .order(sortField, { ascending: sortDirection === 'asc' })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      setAnnonceurs((data as Annonceur[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des annonceurs:', error);
      toast.error('Erreur lors du chargement des annonceurs');
    } finally {
      setLoading(false);
    }
  }, [supabase, authLoading, profile, currentPage, debouncedSearch, filterStatut, filterCity, sortField, sortDirection]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!supabase || !profile) return;
    const counts = await Promise.all([
      supabase.from('annonceur_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('annonceur_profiles').select('*', { count: 'exact', head: true }).eq('statut', 'Collectivité locale'),
      supabase.from('annonceur_profiles').select('*', { count: 'exact', head: true }).eq('statut', 'ONG'),
      supabase.from('annonceur_profiles').select('*', { count: 'exact', head: true }).eq('statut', 'Entreprise'),
    ]);
    setStats({
      total: counts[0].count || 0,
      collectivites: counts[1].count || 0,
      ong: counts[2].count || 0,
      entreprises: counts[3].count || 0,
    });
  }, [supabase, profile]);

  useEffect(() => {
    if (!authLoading && profile) {
      if (!isSuperadmin) {
        window.location.href = '/admin/dashboard';
        return;
      }
      fetchAnnonceurs();
      fetchStats();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [fetchAnnonceurs, fetchStats, authLoading, profile, isSuperadmin]);

  // Export
  const handleExportData = async () => {
    try {
      setExportLoading(true);

      let query = supabase
        .from('annonceur_profiles')
        .select('id, created_at, nom, ville, statut, adresse, domaines_action, contributions_recherchees, contact_legal_email, contact_legal_nom, contact_legal_prenom, site_web');

      if (exportFilter !== 'all') {
        query = query.eq('statut', exportFilter);
      }

      const { data: exportData, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      if (!exportData || exportData.length === 0) {
        toast.info('Aucun annonceur trouvé pour ce filtre.');
        return;
      }

      const formattedData = exportData.map((item: any) => ({
        'Date création': new Date(item.created_at).toLocaleDateString('fr-FR'),
        'Nom': item.nom || '',
        'Ville': item.ville || '',
        'Statut': item.statut || '',
        'Adresse': item.adresse || '',
        'Domaines': Array.isArray(item.domaines_action) ? item.domaines_action.join(', ') : '',
        'Contributions': Array.isArray(item.contributions_recherchees) ? item.contributions_recherchees.join(', ') : '',
        'Contact Légal': [item.contact_legal_prenom, item.contact_legal_nom].filter(Boolean).join(' '),
        'Email Contact': item.contact_legal_email || '',
        'Site web': item.site_web || '',
      }));

      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Annonceurs');
      XLSX.writeFile(workbook, `Export_Annonceurs_${exportFilter}_${new Date().toISOString().split('T')[0]}.xlsx`);

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

  const toggleExpandRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Utility
  const getStatutBadge = (statut: string | null) => {
    const colors: Record<string, string> = {
      'Collectivité locale': 'bg-blue-500/10 text-blue-700',
      'Administration centrale': 'bg-indigo-500/10 text-indigo-700',
      'Aéroport': 'bg-sky-500/10 text-sky-700',
      'Bailleur de fonds': 'bg-amber-500/10 text-amber-700',
      'ONG': 'bg-green-500/10 text-green-700',
      'Entreprise': 'bg-purple-500/10 text-purple-700',
    };
    const color = colors[statut || ''] || 'bg-neutral-500/10 text-neutral-700';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${color} rounded-md text-xs font-medium`}>
        {statut || 'Non défini'}
      </span>
    );
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const getStatutFilterLabel = () => {
    if (filterStatut === 'tous') return 'Tous les types';
    return filterStatut;
  };

  return (
    <div className="min-h-screen bg-page-bg flex">
      <SidebarSuperadmin activePage="annonceurs" />

      <main className="flex-1 ml-[260px] pb-8">
        <HeaderSuperadmin pageTitle="Gestion des Annonceurs" />

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
                Vous voyez <strong>toutes les fiches annonceur</strong> de toutes les villes.
              </p>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-neutral-900 mb-2" style={{ fontSize: '25px', fontWeight: 600 }}>
              Gestion des annonceurs
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 400 }}>
                <span className="text-primary" style={{ fontWeight: 600 }}>
                  {totalCount}
                </span>{' '}
                annonceur{totalCount > 1 ? 's' : ''}
                {searchQuery && ` trouvé${totalCount > 1 ? 's' : ''}`}
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
              onClick={() => { fetchAnnonceurs(); fetchStats(); }}
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
            icon={Building2}
            label="Total annonceurs"
            value={stats.total}
            color="bg-accent-yellow/10 text-accent-yellow"
          />
          <StatsCard
            icon={Landmark}
            label="Collectivités locales"
            value={stats.collectivites}
            color="bg-blue-500/10 text-blue-700"
          />
          <StatsCard
            icon={Heart}
            label="ONG"
            value={stats.ong}
            color="bg-green-500/10 text-green-700"
          />
          <StatsCard
            icon={Briefcase}
            label="Entreprises"
            value={stats.entreprises}
            color="bg-purple-500/10 text-purple-700"
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
                placeholder="Rechercher par nom, adresse..."
                className="flex-1 h-full pr-4 border-none outline-none bg-transparent"
                style={{ fontSize: '16px', fontWeight: 400 }}
              />
            </div>

            {/* Statut Filter */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowStatutFilter(!showStatutFilter); setShowCityFilter(false); }}
                className="h-11 flex items-center gap-2 px-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                <Filter className="w-5 h-5 text-neutral-600" />
                <span className="text-neutral-700">{getStatutFilterLabel()}</span>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </button>

              {showStatutFilter && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50">
                  {STATUT_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterStatut(option.value);
                        setShowStatutFilter(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors"
                    >
                      <span className={`text-sm ${
                        filterStatut === option.value
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
                onClick={(e) => { e.stopPropagation(); setShowCityFilter(!showCityFilter); setShowStatutFilter(false); }}
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
        ) : annonceurs.length === 0 ? (
          <div className="bg-white rounded-xl p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Aucun annonceur trouvé
            </h3>
            <p className="text-neutral-600">
              {searchQuery
                ? 'Essayez de modifier vos critères de recherche'
                : 'Les fiches annonceur apparaîtront ici'}
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
                        onClick={() => handleSort('nom')}
                        className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                      >
                        Nom
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('ville')}
                        className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                      >
                        Ville
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('statut')}
                        className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                      >
                        Type
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Domaines d&apos;action
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Contact légal
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {annonceurs.map((annonceur) => (
                    <React.Fragment key={annonceur.id}>
                      <tr className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-neutral-600">
                          {formatDate(annonceur.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {annonceur.logo_url ? (
                              <img
                                src={annonceur.logo_url}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-neutral-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-4 h-4 text-neutral-400" />
                              </div>
                            )}
                            <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                              {annonceur.nom || 'Sans nom'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                            <span className="text-sm text-neutral-700">
                              {annonceur.ville || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatutBadge(annonceur.statut)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {annonceur.domaines_action && annonceur.domaines_action.length > 0 ? (
                              <>
                                {annonceur.domaines_action.slice(0, 2).map((domaine, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${DOMAINE_COLORS[idx % DOMAINE_COLORS.length]}`}
                                  >
                                    {domaine}
                                  </span>
                                ))}
                                {annonceur.domaines_action.length > 2 && (
                                  <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-xs font-medium">
                                    +{annonceur.domaines_action.length - 2}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-neutral-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {annonceur.contact_legal_email ? (
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                                <span className="text-neutral-700 truncate max-w-[180px]">
                                  {annonceur.contact_legal_email}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-neutral-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`/fiche-ville/${annonceur.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                              title="Voir la fiche"
                              aria-label="Voir la fiche"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => toggleExpandRow(annonceur.id)}
                              className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                              title="Détails"
                              aria-label="Afficher les détails"
                            >
                              {expandedRow === annonceur.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Detail Row */}
                      {expandedRow === annonceur.id && (
                        <tr className="bg-neutral-50/50">
                          <td colSpan={7} className="px-6 py-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Représentant légal */}
                              <div>
                                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                                  Représentant légal
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-neutral-400" />
                                    <span className="text-sm text-neutral-700">
                                      {annonceur.nom_dirigeant || 'Non renseigné'}
                                      {annonceur.poste_dirigeant && (
                                        <span className="text-neutral-500"> — {annonceur.poste_dirigeant}</span>
                                      )}
                                    </span>
                                  </div>
                                  {annonceur.contact_legal_nom && (
                                    <div className="flex items-center gap-2">
                                      <Mail className="w-4 h-4 text-neutral-400" />
                                      <span className="text-sm text-neutral-700">
                                        {[annonceur.contact_legal_prenom, annonceur.contact_legal_nom].filter(Boolean).join(' ')}
                                        {annonceur.contact_legal_email && (
                                          <span className="text-neutral-500"> — {annonceur.contact_legal_email}</span>
                                        )}
                                      </span>
                                    </div>
                                  )}
                                  {annonceur.site_web && (
                                    <div className="flex items-center gap-2">
                                      <Globe className="w-4 h-4 text-neutral-400" />
                                      <a
                                        href={annonceur.site_web.startsWith('http') ? annonceur.site_web : `https://${annonceur.site_web}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline"
                                      >
                                        {annonceur.site_web}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Contributions & Facilités */}
                              <div>
                                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                                  Contributions recherchées
                                </h4>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                  {annonceur.contributions_recherchees && annonceur.contributions_recherchees.length > 0 ? (
                                    annonceur.contributions_recherchees.map((c, idx) => (
                                      <span key={idx} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium">
                                        {c}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-neutral-400">Aucune</span>
                                  )}
                                </div>

                                {annonceur.facilites_offertes && annonceur.facilites_offertes.length > 0 && (
                                  <>
                                    <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                                      Facilités
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                      {annonceur.facilites_offertes.map((f, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs font-medium">
                                          {f}
                                        </span>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Domaines complets & Pièces jointes */}
                              <div>
                                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                                  Tous les domaines d&apos;action
                                </h4>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                  {annonceur.domaines_action && annonceur.domaines_action.length > 0 ? (
                                    annonceur.domaines_action.map((d, idx) => (
                                      <span key={idx} className={`px-2 py-0.5 rounded text-xs font-medium ${DOMAINE_COLORS[idx % DOMAINE_COLORS.length]}`}>
                                        {d}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-neutral-400">Aucun</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <Paperclip className="w-4 h-4 text-neutral-400" />
                                  <span className="text-sm text-neutral-700">
                                    {Array.isArray(annonceur.pieces_jointes) ? annonceur.pieces_jointes.length : 0} pièce(s) jointe(s)
                                  </span>
                                </div>

                                {(annonceur.facebook || annonceur.linkedin || annonceur.instagram || annonceur.tiktok) && (
                                  <div className="mt-3">
                                    <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                                      Réseaux sociaux
                                    </h4>
                                    <div className="space-y-1">
                                      {[
                                        { label: 'Facebook', value: annonceur.facebook },
                                        { label: 'LinkedIn', value: annonceur.linkedin },
                                        { label: 'Instagram', value: annonceur.instagram },
                                        { label: 'TikTok', value: annonceur.tiktok },
                                      ].filter(s => s.value).map(s => (
                                        <a
                                          key={s.label}
                                          href={s.value!.startsWith('http') ? s.value! : `https://${s.value}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block text-xs text-primary hover:underline truncate"
                                        >
                                          {s.label}: {s.value}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          title="Exporter les annonceurs"
          variant="buttons"
          filterOptions={[
            { id: 'all', label: 'Tous les annonceurs' },
            { id: 'Collectivité locale', label: 'Collectivités locales' },
            { id: 'Administration centrale', label: 'Administrations centrales' },
            { id: 'ONG', label: 'ONG' },
            { id: 'Entreprise', label: 'Entreprises' },
            { id: 'Bailleur de fonds', label: 'Bailleurs de fonds' },
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

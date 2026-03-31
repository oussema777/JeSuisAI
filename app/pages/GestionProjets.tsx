'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lightbulb, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Linkedin, 
  FileText, 
  Download,
  Filter,
  Search,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Calendar,
  Briefcase,
  Building2,
  MoreVertical,
  Check,
  X,
  FileSpreadsheet,
  FolderOpen,
  ChevronUp,
  ArrowUpDown,
  Info,
  AlertCircle,
  Shield
} from 'lucide-react';
import { StatsCard } from '../components/admin/StatsCard';
import { ExportModal } from '../components/admin/ExportModal';
import { ProjetDetailModal } from '../components/admin/ProjetDetailModal';
import { HeaderAdmin } from '../components/admin/HeaderAdmin';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { Pagination } from '../components/listing/Pagination';
import { toast } from 'sonner';

// Types
interface ProjetSoumis {
  id: string;
  created_at: string;
  nom: string;
  prenom: string;
  pays: string;
  email: string;
  whatsapp: string | null;
  profil_linkedin: string | null;
  domaines_action: string[];
  autres_domaine: string | null;
  niveau_ciblage: string;
  ville_specifique: string | null;
  villes_multiples: string[] | null;
  nature_projet: string[];
  autres_nature: string | null;
  message: string | null;
  fichiers_joints_urls: string[] | null;
  fichiers_joints_noms: string[] | null;
  fichiers_joints_tailles: number[] | null;
  autorisation_publication: string | null;
  statut?: string;
}

type FilterStatus = 'tous' | 'nouveau' | 'en-cours' | 'approuve' | 'rejete' | 'archive';
type SortField = 'created_at' | 'nom' | 'pays' | 'statut';
type SortDirection = 'asc' | 'desc';

export default function ProjetsAdminTable() {
  const { profile, loading: authLoading, isSuperadmin, getAnnonceurVille, supabase } = useAuth();
  
  const ITEMS_PER_PAGE = 20;

  // State management
  const [projets, setProjets] = useState<ProjetSoumis[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedProjet, setSelectedProjet] = useState<ProjetSoumis | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showFilters, setShowFilters] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFilter, setExportFilter] = useState('all');

  // Auth and permissions
  const userVille = getAnnonceurVille();
  const hasVilleFilter = !isSuperadmin && !!userVille;
  const needsVilleConfig = !isSuperadmin && !userVille;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterStatus, sortField, sortDirection]);

  const applyFilters = (query: any) => {
    // Multi-tenancy: Filter by ville for Admins
    if (hasVilleFilter) {
      query = query.or(`niveau_ciblage.eq.toutes,ville_specifique.eq."${userVille}",villes_multiples.cs.{"${userVille}"}`);
    }

    if (filterStatus !== 'tous') {
      if (filterStatus === 'nouveau') {
        query = query.or('statut.eq.nouveau,statut.is.null');
      } else {
        query = query.eq('statut', filterStatus);
      }
    }
    if (debouncedSearch) {
      const s = `%${debouncedSearch}%`;
      query = query.or(`nom.ilike.${s},prenom.ilike.${s},email.ilike.${s},pays.ilike.${s}`);
    }
    return query;
  };

  // Fetch projets
  const fetchProjets = useCallback(async () => {
    if (authLoading || !profile) return;

    setLoading(true);
    try {
      // Count query
      const { count, error: countError } = await applyFilters(
        supabase.from('projets_soumis').select('*', { count: 'exact', head: true })
      );
      if (countError) throw countError;
      setTotalCount(count || 0);

      // Paginated data query
      const { data, error } = await applyFilters(
        supabase.from('projets_soumis').select('*')
      )
        .order(sortField, { ascending: sortDirection === 'asc' })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      setProjets((data as ProjetSoumis[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, authLoading, profile, currentPage, debouncedSearch, filterStatus, sortField, sortDirection]);

  useEffect(() => {
    if (!authLoading) {
      if (profile?.role === 'Annonceur') {
        window.location.href = '/admin/dashboard';
        return;
      }
      if (profile) {
        fetchProjets();
      } else {
        setLoading(false);
      }
    }
  }, [fetchProjets, authLoading, profile]);

  // Update projet status
  const updateProjetStatus = async (projetId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('projets_soumis')
        .update({ statut: newStatus })
        .eq('id', projetId);
      
      if (error) throw error;
      
      await fetchProjets();
      await fetchStats();

      if (selectedProjet?.id === projetId) {
        setSelectedProjet(prev => prev ? { ...prev, statut: newStatus } : null);
      }
      
      setShowActionMenu(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // Export to Excel
  const handleExportData = async () => {
    try {
      setExportLoading(true);

      let query = supabase.from('projets_soumis').select('*');

      // Multi-tenancy: Filter by ville for non-superadmin (same as display)
      if (hasVilleFilter) {
        query = query.or(`niveau_ciblage.eq.toutes,ville_specifique.eq."${userVille}",villes_multiples.cs.{"${userVille}"}`);
      }

      if (exportFilter !== 'all') {
        if (exportFilter === 'nouveau') {
          query = query.or('statut.eq.nouveau,statut.is.null');
        } else {
          query = query.eq('statut', exportFilter);
        }
      }

      const { data: exportData, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (!exportData || exportData.length === 0) {
        toast.info("Aucun projet trouvé pour ce filtre.");
        return;
      }
      
      const formattedData = exportData.map((item: any) => ({
        'Date': new Date(item.created_at).toLocaleDateString('fr-FR'),
        'Statut': item.statut || 'nouveau',
        'Nom': item.nom,
        'Prénom': item.prenom,
        'Pays': item.pays,
        'Email': item.email,
        'Whatsapp': item.whatsapp || '',
        'Lien profil Linkedin': item.profil_linkedin || '',
        'Ville(s) ciblée(s)': item.niveau_ciblage === 'toutes' 
          ? 'Toutes' 
          : (item.villes_multiples?.join('; ') || item.ville_specifique || ''),
        'Nature de votre projet': (item.nature_projet || []).join('; '),
        'Domaine d\'action': (item.domaines_action || []).join('; '),
        'Message': item.message || ''
      }));
      
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Projets Soumis");
      XLSX.writeFile(workbook, `Export_Projets_${exportFilter}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setShowExportModal(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erreur lors de l'exportation.");
    } finally {
      setExportLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Statistics - server-side counts
  const [stats, setStats] = useState({ total: 0, nouveau: 0, enCours: 0, approuves: 0, rejetes: 0 });

  const fetchStats = useCallback(async () => {
    if (!supabase || !profile) return;
    const counts = await Promise.all([
      applyFilters(supabase.from('projets_soumis').select('*', { count: 'exact', head: true })),
      applyFilters(supabase.from('projets_soumis').select('*', { count: 'exact', head: true }).or('statut.eq.nouveau,statut.is.null')),
      applyFilters(supabase.from('projets_soumis').select('*', { count: 'exact', head: true }).eq('statut', 'en-cours')),
      applyFilters(supabase.from('projets_soumis').select('*', { count: 'exact', head: true }).eq('statut', 'approuve')),
      applyFilters(supabase.from('projets_soumis').select('*', { count: 'exact', head: true }).eq('statut', 'rejete')),
    ]);
    setStats({
      total: counts[0].count || 0,
      nouveau: counts[1].count || 0,
      enCours: counts[2].count || 0,
      approuves: counts[3].count || 0,
      rejetes: counts[4].count || 0,
    });
  }, [supabase, profile]);

  useEffect(() => {
    if (!authLoading && profile) {
      fetchStats();
    }
  }, [authLoading, profile, fetchStats]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Utility functions
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approuve':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-700 rounded-md text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Approuvé
          </span>
        );
      case 'rejete':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-700 rounded-md text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Rejeté
          </span>
        );
      case 'en-cours':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-700 rounded-md text-xs font-medium">
            <Clock className="w-3 h-3" />
            En cours
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 text-orange-700 rounded-md text-xs font-medium">
            <Clock className="w-3 h-3" />
            Nouveau
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });

  const formatDateTime = (dateString: string) => 
    new Date(dateString).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });




  return (
    <div className="w-full">
      <HeaderAdmin
        pageTitle="Projets"
        breadcrumb={[
          { label: 'Tableau de bord', href: '/admin/dashboard' },
          { label: 'Projets' },
          { label: 'Toutes' },
        ]}
      />

      <div className="pt-24 space-y-6">
        {/* Permission Banners */}
        {isSuperadmin && (
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-purple-900 font-semibold text-sm mb-1">
                  Accès Superadmin - Vue complète
                </h4>
                <p className="text-purple-700 text-sm">
                  Vous voyez <strong>tous les projets</strong> de toutes les villes. 
                  Vous pouvez modifier, approuver et rejeter tous les projets.
                </p>
              </div>
            </div>
          </div>
        )}

        {hasVilleFilter && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-blue-900 font-semibold text-sm mb-1">
                  Projets filtrés pour votre ville
                </h4>
                <p className="text-blue-700 text-sm">
                  Vous voyez uniquement les projets ciblant la ville de <strong>{userVille}</strong>.
                  Les projets ciblant "toutes les villes" sont également inclus.
                  Vous pouvez gérer et modifier le statut de ces projets.
                </p>
              </div>
            </div>
          </div>
        )}

        {needsVilleConfig && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-orange-900 font-semibold text-sm mb-1">
                  Ville non configurée
                </h4>
                <p className="text-orange-700 text-sm">
                  Votre profil n'a pas de ville configurée. Vous voyez uniquement les projets 
                  ciblant "toutes les villes". Veuillez configurer votre ville dans les paramètres 
                  pour voir tous les projets qui vous concernent.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-neutral-900 mb-2" style={{ fontSize: '25px', fontWeight: 600 }}>
              Gestion des projets
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 400 }}>
                <span className="text-primary" style={{ fontWeight: 600 }}>
                  {totalCount}
                </span>{' '}
                projet{totalCount > 1 ? 's' : ''}
                {searchQuery && ` trouvé${totalCount > 1 ? 's' : ''}`}
                {hasVilleFilter && (
                  <span className="text-neutral-500"> • Filtrés pour {userVille}</span>
                )}
                {isSuperadmin && (
                  <span className="text-purple-600"> • Vue complète (Superadmin)</span>
                )}
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
              onClick={fetchProjets}
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
            icon={FolderOpen} 
            label={hasVilleFilter ? `Projets (${userVille})` : "Total projets"}
            value={stats.total} 
            color="bg-accent-yellow/10 text-accent-yellow"
          />
          <StatsCard 
            icon={Clock} 
            label="Nouveaux" 
            value={stats.nouveau} 
            color="bg-orange-500/10 text-orange-700"
          />
          <StatsCard 
            icon={CheckCircle2} 
            label="Approuvés" 
            value={stats.approuves} 
            color="bg-green-500/10 text-green-700"
          />
          <StatsCard 
            icon={XCircle} 
            label="Rejetés" 
            value={stats.rejetes} 
            color="bg-red-500/10 text-red-700"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center flex-1 min-w-[300px] h-11 border border-neutral-300 rounded-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all bg-white">
              <Search className="ml-3 mr-2 text-neutral-400 flex-shrink-0" size={18} strokeWidth={2} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, email, pays, nature du projet..."
                className="flex-1 h-full pr-4 border-none outline-none bg-transparent"
                style={{ fontSize: '16px', fontWeight: 400 }}
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 flex items-center gap-2 px-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                <Filter className="w-5 h-5 text-neutral-600" />
                <span className="text-neutral-700">
                  {filterStatus === 'tous' ? 'Tous les statuts' : 
                   filterStatus === 'nouveau' ? 'Nouveau' :
                   filterStatus === 'en-cours' ? 'En cours' :
                   filterStatus === 'approuve' ? 'Approuvé' : 
                   filterStatus === 'rejete' ? 'Rejeté' : 'Archivé'}
                </span>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </button>

              {showFilters && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50">
                  {[
                    { value: 'tous', label: 'Tous les statuts' },
                    { value: 'nouveau', label: 'Nouveau' },
                    { value: 'en-cours', label: 'En cours' },
                    { value: 'approuve', label: 'Approuvé' },
                    { value: 'rejete', label: 'Rejeté' },
                    { value: 'archive', label: 'Archivé' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterStatus(option.value as FilterStatus);
                        setShowFilters(false);
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
        ) : projets.length === 0 ? (
          <div className="bg-white rounded-xl p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Aucun projet trouvé
            </h3>
            <p className="text-neutral-600">
              {searchQuery 
                ? 'Essayez de modifier vos critères de recherche'
                : hasVilleFilter 
                  ? `Aucun projet ciblant ${userVille} pour le moment`
                  : 'Les projets soumis apparaîtront ici'}
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
                        onClick={() => handleSort('nom')}
                        className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                      >
                        Porteur
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('pays')}
                        className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                      >
                        Pays
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Ville(s) ciblée(s)
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Nature
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
                  {projets.map((projet) => (
                    <tr key={projet.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {formatDate(projet.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-900">
                            {projet.prenom} {projet.nom}
                          </p>
                          <p className="text-xs text-neutral-500">{projet.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        {projet.pays}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                          <span className="text-sm text-neutral-700">
                            {projet.niveau_ciblage === 'toutes' && 'Toutes'}
                            {projet.niveau_ciblage === 'une-ville' && projet.ville_specifique}
                            {projet.niveau_ciblage === 'plusieurs-villes' && 
                              (projet.villes_multiples && projet.villes_multiples.length > 0 
                                ? `${projet.villes_multiples[0]}${projet.villes_multiples.length > 1 ? ` +${projet.villes_multiples.length - 1}` : ''}`
                                : 'N/A')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {projet.nature_projet && projet.nature_projet.slice(0, 2).map((nature, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              {nature}
                            </span>
                          ))}
                          {projet.nature_projet && projet.nature_projet.length > 2 && (
                            <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-xs">
                              +{projet.nature_projet.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(projet.statut)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedProjet(projet)}
                            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Voir les détails"
                            aria-label="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setShowActionMenu(showActionMenu === projet.id ? null : projet.id)}
                              className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                              aria-label="Plus d'actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            {showActionMenu === projet.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50">
                                <button
                                  onClick={() => updateProjetStatus(projet.id, 'en-cours')}
                                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                                >
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  Marquer en cours
                                </button>
                                <button
                                  onClick={() => updateProjetStatus(projet.id, 'approuve')}
                                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  Approuver
                                </button>
                                <button
                                  onClick={() => updateProjetStatus(projet.id, 'rejete')}
                                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                                >
                                  <XCircle className="w-4 h-4 text-red-600" />
                                  Rejeter
                                </button>
                              </div>
                            )}
                          </div>
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

      {/* Modals */}
      {selectedProjet && (
        <ProjetDetailModal
          projet={selectedProjet}
          onClose={() => setSelectedProjet(null)}
          onUpdateStatus={updateProjetStatus}
          getStatusBadge={getStatusBadge}
          formatDateTime={formatDateTime}
        />
      )}
      {showExportModal && (
        <ExportModal
          title="Exporter les projets"
          variant="buttons"
          filterOptions={[
            { id: 'all', label: 'Tous les projets' },
            { id: 'nouveau', label: 'Nouveaux' },
            { id: 'en-cours', label: 'En cours' },
            { id: 'approuve', label: 'Approuvés' },
            { id: 'rejete', label: 'Rejetés' },
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
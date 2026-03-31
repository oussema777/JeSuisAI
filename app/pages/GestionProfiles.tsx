'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
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
  Target,
  Check,
  X,
  FileSpreadsheet,
  FolderOpen,
  ChevronUp,
  ArrowUpDown,
  MoreVertical,
  Info,
  AlertCircle,
  Shield
} from 'lucide-react';
import { StatsCard } from '../components/admin/StatsCard';
import { ExportModal } from '../components/admin/ExportModal';
import { ProfilDetailModal } from '../components/admin/ProfilDetailModal';

// Please ensure these imports match your project structure
import { HeaderAdmin } from '../components/admin/HeaderAdmin';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { Pagination } from '../components/listing/Pagination';
import { toast } from 'sonner';

// --- Types ---
interface ProfilSoumis {
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
  contributions_proposees: string[];
  niveau_ciblage: string;
  ville_specifique: string | null;
  villes_multiples: string[] | null;
  message: string | null;
  fichiers_joints_urls: string[] | null;
  fichiers_joints_noms: string[] | null;
  fichiers_joints_tailles: number[] | null;
  autorisation_publication: string;
  statut?: string;
}

type FilterStatus = 'tous' | 'nouveau' | 'en-cours' | 'approuve' | 'rejete' | 'archive';
type SortField = 'created_at' | 'nom' | 'pays' | 'statut';
type SortDirection = 'asc' | 'desc';

export default function ProfilsAdmin() {
  // ✅ Use the useAuth hook
  const { profile, loading: authLoading, isSuperadmin, getAnnonceurVille, supabase } = useAuth();

  const ITEMS_PER_PAGE = 20;
  const [profils, setProfils] = useState<ProfilSoumis[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedProfil, setSelectedProfil] = useState<ProfilSoumis | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showFilters, setShowFilters] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // ✅ NEW: Export modal states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFilter, setExportFilter] = useState('tous');

  const userVille = getAnnonceurVille();
  
  const hasVilleFilter = !isSuperadmin && !!userVille;
  const needsVilleConfig = !isSuperadmin && !userVille;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterStatus, sortField, sortDirection]);

  useEffect(() => {
    if (!authLoading) {
      if (profile?.role === 'Annonceur') {
        window.location.href = '/admin/dashboard';
        return;
      }
      if (profile) {
        fetchProfils();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, profile, currentPage, debouncedSearch, filterStatus, sortField, sortDirection]);

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

  const fetchProfils = async () => {
    if (authLoading || !profile) return;

    setLoading(true);
    try {
      // Count query
      const { count, error: countError } = await applyFilters(
        supabase.from('profils_soumis').select('*', { count: 'exact', head: true })
      );

      if (countError) throw countError;
      setTotalCount(count || 0);

      // Paginated data query with server-side sort
      const { data, error } = await applyFilters(
        supabase.from('profils_soumis').select('*')
      )
        .order(sortField, { ascending: sortDirection === 'asc' })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      setProfils((data as ProfilSoumis[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des profils:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfilStatus = async (profilId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('profils_soumis')
        .update({ statut: newStatus })
        .eq('id', profilId);

      if (error) throw error;
      
      // Refetch to get accurate server-side data
      await fetchProfils();
      await fetchStats();

      if (selectedProfil?.id === profilId) {
        setSelectedProfil(prev => prev ? { ...prev, statut: newStatus } : null);
      }
      
      setShowActionMenu(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // ✅ NEW: XLSX Export with filter modal
  const handleExportData = async () => {
    try {
      setExportLoading(true);

      // Build query with tenant filtering (same as display)
      let query = supabase.from('profils_soumis').select('*');

      // Multi-tenancy: Filter by ville for non-superadmin
      if (hasVilleFilter) {
        query = query.or(`niveau_ciblage.eq.toutes,ville_specifique.eq."${userVille}",villes_multiples.cs.{"${userVille}"}`);
      }

      if (exportFilter !== 'tous') {
        if (exportFilter === 'nouveau') {
          query = query.or('statut.eq.nouveau,statut.is.null');
        } else {
          query = query.eq('statut', exportFilter);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error || !data) {
        throw error || new Error('No data');
      }
      
      // Format data for Excel
      const formatted = data.map((item: any) => ({
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
        'Contribution proposée': item.contributions_proposees?.join('; ') || '',
        'Domaine d\'action': item.domaines_action?.join('; ') || '',
        'Message': item.message || ''
      }));
      
      // Create worksheet
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Profils");
      
      // Generate filename
      const filterLabel = exportFilter === 'tous' ? 'tous' : exportFilter;
      const villeLabel = userVille ? `_${userVille}` : '';
      const filename = `Profils_Soumis${villeLabel}_${filterLabel}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Download
      XLSX.writeFile(wb, filename);
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Erreur exportation:', error);
      toast.error("Erreur lors de l'exportation.");
    } finally {
      setExportLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      // Fetch all data for current filters (no pagination)
      const { data, error } = await applyFilters(
        supabase.from('profils_soumis').select('*')
      ).order(sortField, { ascending: sortDirection === 'asc' });

      if (error || !data) throw error || new Error('No data');

      const headers = [
        'Date soumission',
        'Nom',
        'Prénom',
        'Email',
        'Pays',
        'WhatsApp',
        'LinkedIn',
        'Domaines d\'action',
        'Contributions',
        'Villes ciblées',
        'Statut'
      ];

      const rows = data.map((p: any) => [
        new Date(p.created_at).toLocaleDateString('fr-FR'),
        p.nom,
        p.prenom,
        p.email,
        p.pays,
        p.whatsapp || '',
        p.profil_linkedin || '',
        (p.domaines_action || []).join('; '),
        (p.contributions_proposees || []).join('; '),
        p.niveau_ciblage === 'toutes' ? 'Toutes' : (p.villes_multiples?.join('; ') || p.ville_specifique || ''),
        p.statut || 'nouveau'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row: string[]) => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `profils_soumis_${userVille || 'tous'}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Erreur exportation CSV:', error);
      toast.error("Erreur lors de l'exportation CSV.");
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Statistics - fetch counts from server
  const [stats, setStats] = useState({ total: 0, nouveau: 0, enCours: 0, approuves: 0, rejetes: 0 });

  const fetchStats = useCallback(async () => {
    if (!supabase || !profile) return;
    const counts = await Promise.all([
      applyFilters(supabase.from('profils_soumis').select('*', { count: 'exact', head: true })),
      applyFilters(supabase.from('profils_soumis').select('*', { count: 'exact', head: true }).or('statut.eq.nouveau,statut.is.null')),
      applyFilters(supabase.from('profils_soumis').select('*', { count: 'exact', head: true }).eq('statut', 'en-cours')),
      applyFilters(supabase.from('profils_soumis').select('*', { count: 'exact', head: true }).eq('statut', 'approuve')),
      applyFilters(supabase.from('profils_soumis').select('*', { count: 'exact', head: true }).eq('statut', 'rejete')),
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };




  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <HeaderAdmin 
        pageTitle="Profils soumis" 
        breadcrumb={[{ label: 'Tableau de bord', href: '/admin/dashboard' }, { label: 'Profils soumis' }]} 
      />

      <div className="pt-24 pb-10 space-y-6">
        {/* ✅ Banners for ville filtering */}
            {isSuperadmin && (
              <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-purple-900 font-semibold text-sm mb-1">
                      Accès Superadmin - Vue complète
                    </h4>
                    <p className="text-purple-700 text-sm">
                      Vous voyez <strong>tous les profils</strong> de toutes les villes. 
                      Vous pouvez modifier, approuver et rejeter tous les profils.
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
                      Profils filtrés pour votre ville
                    </h4>
                    <p className="text-blue-700 text-sm">
                      Vous voyez uniquement les profils ciblant la ville de <strong>{userVille}</strong>.
                      Les profils ciblant "toutes les villes" sont également inclus.
                      Vous pouvez gérer et modifier le statut de ces profils.
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
                      Votre profil n'a pas de ville configurée. Vous voyez uniquement les profils 
                      ciblant "toutes les villes". Veuillez configurer votre ville dans les paramètres 
                      pour voir tous les profils qui vous concernent.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-neutral-900 mb-2" style={{ fontSize: '25px', fontWeight: 600 }}>
                  Gestion des profils
                </h2>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 400 }}>
                    <span className="text-primary" style={{ fontWeight: 600 }}>
                      {totalCount}
                    </span>{' '}
                    profil{totalCount > 1 ? 's' : ''}
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
                  Télécharger les profils
                </button>
                <button
                  onClick={fetchProfils}
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
                label={hasVilleFilter ? `Profils (${userVille})` : "Total profils"}
                value={stats.total} 
                color="bg-primary/10 text-primary"
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
                {/* Search Input */}
                <div className="flex items-center flex-1 min-w-[200px] h-11 border border-neutral-300 rounded-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all bg-white">
                  <Search className="ml-3 mr-2 text-neutral-400 flex-shrink-0" size={18} strokeWidth={2} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par nom, email, pays, domaines..."
                    className="flex-1 h-full pr-4 border-none outline-none bg-transparent"
                    style={{ fontSize: '16px', fontWeight: 400 }}
                  />
                </div>

                {/* Filter by Status */}
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
                              ? 'text-primary font-medium' 
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
            ) : profils.length === 0 ? (
              <div className="bg-white rounded-xl p-20 text-center shadow-sm">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Aucun profil trouvé
                </h3>
                <p className="text-neutral-600">
                  {searchQuery 
                    ? 'Essayez de modifier vos critères de recherche'
                    : hasVilleFilter 
                      ? `Aucun profil ciblant ${userVille} pour le moment`
                      : 'Les profils soumis apparaîtront ici'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="text-left px-6 py-4">
                          <button
                            onClick={() => handleSort('created_at')}
                            className="flex items-center gap-2 text-xs font-semibold text-neutral-700 uppercase tracking-wide hover:text-neutral-900 transition-colors"
                          >
                            Date
                            {sortField === 'created_at' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                            {sortField !== 'created_at' && <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />}
                          </button>
                        </th>
                        <th className="text-left px-6 py-4">
                          <button
                            onClick={() => handleSort('nom')}
                            className="flex items-center gap-2 text-xs font-semibold text-neutral-700 uppercase tracking-wide hover:text-neutral-900 transition-colors"
                          >
                            Nom & Prénom
                            {sortField === 'nom' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                            {sortField !== 'nom' && <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />}
                          </button>
                        </th>
                        <th className="text-left px-6 py-4">
                          <button
                            onClick={() => handleSort('pays')}
                            className="flex items-center gap-2 text-xs font-semibold text-neutral-700 uppercase tracking-wide hover:text-neutral-900 transition-colors"
                          >
                            Pays
                            {sortField === 'pays' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                            {sortField !== 'pays' && <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />}
                          </button>
                        </th>
                        <th className="text-left px-6 py-4">
                          <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                            Domaines d'action
                          </span>
                        </th>
                        <th className="text-left px-6 py-4">
                          <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                            Villes
                          </span>
                        </th>
                        <th className="text-left px-6 py-4">
                          <button
                            onClick={() => handleSort('statut')}
                            className="flex items-center gap-2 text-xs font-semibold text-neutral-700 uppercase tracking-wide hover:text-neutral-900 transition-colors"
                          >
                            Statut
                            {sortField === 'statut' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                            {sortField !== 'statut' && <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />}
                          </button>
                        </th>
                        <th className="text-right px-6 py-4">
                          <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                            Actions
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {profils.map((profil) => (
                        <tr 
                          key={profil.id} 
                          className="hover:bg-neutral-50 transition-colors group relative"
                        >
                          {/* Date */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                              <Calendar className="w-4 h-4 text-neutral-400" />
                              {formatDate(profil.created_at)}
                            </div>
                          </td>

                          {/* Name */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-white" strokeWidth={2} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-neutral-900 truncate">
                                  {profil.prenom} {profil.nom}
                                </p>
                                <p className="text-xs text-neutral-500 truncate">
                                  {profil.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Pays */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-neutral-400" />
                              <span className="text-sm text-neutral-700">{profil.pays}</span>
                            </div>
                          </td>

                          {/* Domaines */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {profil.domaines_action.slice(0, 2).map((domaine, idx) => (
                                <span 
                                  key={idx}
                                  className="px-2 py-1 bg-primary/5 text-primary text-xs font-medium rounded border border-primary/10"
                                >
                                  {domaine.length > 20 ? domaine.substring(0, 20) + '...' : domaine}
                                </span>
                              ))}
                              {profil.domaines_action.length > 2 && (
                                <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded">
                                  +{profil.domaines_action.length - 2}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Villes */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-neutral-700">
                              <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                              <span className="truncate max-w-[120px]">
                                {profil.niveau_ciblage === 'toutes' 
                                  ? 'Toutes' 
                                  : profil.niveau_ciblage === 'une-ville'
                                    ? profil.ville_specifique
                                    : `${profil.villes_multiples?.length || 0} ville${(profil.villes_multiples?.length || 0) > 1 ? 's' : ''}`}
                              </span>
                            </div>
                          </td>

                          {/* Statut */}
                          <td className="px-6 py-4">
                            {getStatusBadge(profil.statut)}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedProfil(profil)}
                                className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                title="Voir détails"
                                aria-label="Voir détails"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowActionMenu(showActionMenu === profil.id ? null : profil.id);
                                  }}
                                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                  title="Plus d'actions"
                                  aria-label="Plus d'actions"
                                  id={`menu-button-${profil.id}`}
                                >
                                  <MoreVertical className="w-4 h-4 text-neutral-600" />
                                </button>
                                
                                {showActionMenu === profil.id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-[9998]" 
                                      onClick={() => setShowActionMenu(null)}
                                    />
                                    <div className="fixed w-44 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-[9999]"
                                     style={{
                                        top: (() => {
                                          const el = typeof document !== 'undefined' ? document.getElementById(`menu-button-${profil.id}`) : null;
                                          return `${(el?.getBoundingClientRect().bottom ?? 0) + 8}px`;
                                        })(),
                                        right: (() => {
                                          const el = typeof document !== 'undefined' ? document.getElementById(`menu-button-${profil.id}`) : null;
                                          const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
                                          return `${windowWidth - (el?.getBoundingClientRect().right ?? 0)}px`;
                                        })()
                                      }}
                                    >
                                      <button
                                        onClick={() => {
                                          updateProfilStatus(profil.id, 'en-cours');
                                          setShowActionMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors flex items-center gap-2 text-sm text-blue-700"
                                      >
                                        <Clock className="w-4 h-4" />
                                        En cours
                                      </button>
                                      <button
                                        onClick={() => {
                                          updateProfilStatus(profil.id, 'approuve');
                                          setShowActionMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors flex items-center gap-2 text-sm text-green-700"
                                      >
                                        <Check className="w-4 h-4" />
                                        Approuver
                                      </button>
                                      <button
                                        onClick={() => {
                                          updateProfilStatus(profil.id, 'rejete');
                                          setShowActionMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors flex items-center gap-2 text-sm text-red-700"
                                      >
                                        <X className="w-4 h-4" />
                                        Rejeter
                                      </button>
                                    </div>
                                  </>
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

      {/* Detail Modal */}
      {selectedProfil && (
        <ProfilDetailModal
          profil={selectedProfil}
          onClose={() => setSelectedProfil(null)}
          onUpdateStatus={updateProfilStatus}
          getStatusBadge={getStatusBadge}
          formatDateTime={formatDateTime}
        />
      )}

      {/* ✅ NEW: Export Modal */}
      {showExportModal && (
        <ExportModal
          title="Télécharger les profils"
          filterOptions={[
            { id: 'tous', label: 'Tous les profils' },
            { id: 'nouveau', label: 'Nouveaux uniquement' },
            { id: 'en-cours', label: 'En cours uniquement' },
            { id: 'approuve', label: 'Approuvés uniquement' },
            { id: 'rejete', label: 'Rejetés uniquement' },
          ]}
          exportFilter={exportFilter}
          setExportFilter={setExportFilter}
          onExport={handleExportData}
          onClose={() => setShowExportModal(false)}
          exportLoading={exportLoading}
          description="Le fichier sera téléchargé au format Excel (.xlsx) et inclura les coordonnées complètes."
        />
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
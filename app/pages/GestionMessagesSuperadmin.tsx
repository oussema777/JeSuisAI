'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  FileSpreadsheet,
  MessageSquare,
  Shield,
  Mail,
  Eye,
  CheckCircle2,
  Clock,
  Archive,
  Inbox,
  Save,
  Phone,
  Building2,
} from 'lucide-react';
import { StatsCard } from '../components/admin/StatsCard';
import { ExportModal } from '../components/admin/ExportModal';
import { SidebarSuperadmin } from '../components/superadmin/Sidebarsuperadmin';
import { HeaderSuperadmin } from '../components/superadmin/HeaderSuperadmin';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { Pagination } from '../components/listing/Pagination';
import { toast } from 'sonner';

interface ContactMessage {
  id: string;
  created_at: string;
  type_organisation: string;
  nom_organisation: string | null;
  nom_prenom: string;
  email: string;
  whatsapp_telephone: string | null;
  objet: string;
  message: string;
  statut: string;
  notes_admin: string | null;
}

type FilterStatus = 'tous' | 'nouveau' | 'lu' | 'traite' | 'archive';
type SortField = 'created_at' | 'nom_prenom' | 'objet' | 'statut';
type SortDirection = 'asc' | 'desc';

export default function GestionMessagesSuperadmin() {
  const { profile, loading: authLoading, isSuperadmin, supabase } = useAuth();

  const ITEMS_PER_PAGE = 20;

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('tous');
  const [filterObjet, setFilterObjet] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showObjetFilter, setShowObjetFilter] = useState(false);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFilter, setExportFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({});

  const [stats, setStats] = useState({ total: 0, nouveaux: 0, lus: 0, traites: 0 });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterStatus, filterObjet, sortField, sortDirection]);

  useEffect(() => {
    const handleClick = () => {
      setShowStatusFilter(false);
      setShowObjetFilter(false);
    };
    if (showStatusFilter || showObjetFilter) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showStatusFilter, showObjetFilter]);

  const applyFilters = (query: any) => {
    if (filterStatus !== 'tous') {
      query = query.eq('statut', filterStatus);
    }
    if (filterObjet !== 'tous') {
      query = query.eq('objet', filterObjet);
    }
    if (debouncedSearch) {
      const s = `%${debouncedSearch}%`;
      query = query.or(`nom_prenom.ilike.${s},email.ilike.${s},message.ilike.${s}`);
    }
    return query;
  };

  const fetchMessages = useCallback(async () => {
    if (authLoading || !profile) return;

    setLoading(true);
    try {
      let countQuery = supabase.from('contact_messages').select('*', { count: 'exact', head: true });
      countQuery = applyFilters(countQuery);
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      setTotalCount(count || 0);

      let dataQuery = supabase
        .from('contact_messages')
        .select('*');
      dataQuery = applyFilters(dataQuery);

      const { data, error } = await dataQuery
        .order(sortField, { ascending: sortDirection === 'asc' })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      setMessages((data as ContactMessage[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  }, [supabase, authLoading, profile, currentPage, debouncedSearch, filterStatus, filterObjet, sortField, sortDirection]);

  const fetchStats = useCallback(async () => {
    if (!supabase || !profile) return;
    const counts = await Promise.all([
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('statut', 'nouveau'),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('statut', 'lu'),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('statut', 'traite'),
    ]);
    setStats({
      total: counts[0].count || 0,
      nouveaux: counts[1].count || 0,
      lus: counts[2].count || 0,
      traites: counts[3].count || 0,
    });
  }, [supabase, profile]);

  useEffect(() => {
    if (!authLoading && profile) {
      if (!isSuperadmin) {
        window.location.href = '/admin/dashboard';
        return;
      }
      fetchMessages();
      fetchStats();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [fetchMessages, fetchStats, authLoading, profile, isSuperadmin]);

  const handleUpdateStatut = async (id: string, newStatut: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ statut: newStatut })
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.map(m => m.id === id ? { ...m, statut: newStatut } : m));
      fetchStats();
      toast.success(`Statut mis à jour : ${getStatusLabel(newStatut)}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleSaveNotes = async (id: string) => {
    const notes = editingNotes[id];
    if (notes === undefined) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ notes_admin: notes })
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.map(m => m.id === id ? { ...m, notes_admin: notes } : m));
      toast.success('Notes sauvegardées');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Erreur lors de la sauvegarde des notes');
    }
  };

  const handleExportData = async () => {
    try {
      setExportLoading(true);

      let query = supabase
        .from('contact_messages')
        .select('*');

      if (exportFilter !== 'all') {
        query = query.eq('statut', exportFilter);
      }

      const { data: exportData, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      if (!exportData || exportData.length === 0) {
        toast.info('Aucun message trouvé pour ce filtre.');
        return;
      }

      const formattedData = exportData.map((item: ContactMessage) => ({
        'Date': new Date(item.created_at).toLocaleDateString('fr-FR'),
        'Type Organisation': item.type_organisation,
        'Organisation': item.nom_organisation || '',
        'Nom Prénom': item.nom_prenom,
        'Email': item.email,
        'WhatsApp': item.whatsapp_telephone || '',
        'Objet': item.objet,
        'Message': item.message,
        'Statut': getStatusLabel(item.statut),
      }));

      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Messages');
      XLSX.writeFile(workbook, `Export_Messages_${exportFilter}_${new Date().toISOString().split('T')[0]}.xlsx`);

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
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'nouveau': return 'Nouveau';
      case 'lu': return 'Lu';
      case 'traite': return 'Traité';
      case 'archive': return 'Archivé';
      default: return status || 'Inconnu';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'nouveau':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-700 rounded-md text-xs font-medium">
            <Inbox className="w-3 h-3" />
            Nouveau
          </span>
        );
      case 'lu':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 text-orange-700 rounded-md text-xs font-medium">
            <Eye className="w-3 h-3" />
            Lu
          </span>
        );
      case 'traite':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-700 rounded-md text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Traité
          </span>
        );
      case 'archive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-500/10 text-neutral-700 rounded-md text-xs font-medium">
            <Archive className="w-3 h-3" />
            Archivé
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

  const getObjetBadge = (objet: string) => {
    const colorMap: { [key: string]: string } = {
      'Question générale': 'bg-blue-50 text-blue-700',
      'Partenariat': 'bg-purple-50 text-purple-700',
      'Support technique': 'bg-red-50 text-red-700',
      'Suggestion d\'amélioration': 'bg-green-50 text-green-700',
      'Signalement d\'un problème': 'bg-orange-50 text-orange-700',
      'Demande d\'information': 'bg-cyan-50 text-cyan-700',
      'Autre': 'bg-neutral-50 text-neutral-700',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorMap[objet] || 'bg-neutral-50 text-neutral-700'}`}>
        {objet}
      </span>
    );
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getStatusFilterLabel = () => {
    switch (filterStatus) {
      case 'tous': return 'Tous les statuts';
      case 'nouveau': return 'Nouveau';
      case 'lu': return 'Lu';
      case 'traite': return 'Traité';
      case 'archive': return 'Archivé';
      default: return 'Tous les statuts';
    }
  };

  const OBJETS_MESSAGE = [
    'Question générale',
    'Partenariat',
    'Support technique',
    'Suggestion d\'amélioration',
    'Signalement d\'un problème',
    'Demande d\'information',
    'Autre',
  ];

  return (
    <div className="min-h-screen bg-page-bg flex">
      <SidebarSuperadmin activePage="messages" />

      <main className="flex-1 ml-[260px] pb-8">
        <HeaderSuperadmin pageTitle="Gestion des Messages" />

        <div className="p-8 mt-16 lg:mt-[72px] space-y-6">
          {/* Superadmin Banner */}
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-purple-900 font-semibold text-sm mb-1">
                  Accès Superadmin - Messages de contact
                </h4>
                <p className="text-purple-700 text-sm">
                  Vous voyez <strong>tous les messages</strong> reçus via le formulaire de contact.
                </p>
              </div>
            </div>
          </div>

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-neutral-900 mb-2" style={{ fontSize: '25px', fontWeight: 600 }}>
                Gestion des messages
              </h2>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 400 }}>
                  <span className="text-primary" style={{ fontWeight: 600 }}>
                    {totalCount}
                  </span>{' '}
                  message{totalCount > 1 ? 's' : ''}
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
                onClick={() => { fetchMessages(); fetchStats(); }}
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
              icon={MessageSquare}
              label="Total messages"
              value={stats.total}
              color="bg-accent-yellow/10 text-accent-yellow"
            />
            <StatsCard
              icon={Inbox}
              label="Nouveaux"
              value={stats.nouveaux}
              color="bg-blue-500/10 text-blue-700"
            />
            <StatsCard
              icon={Eye}
              label="Lus"
              value={stats.lus}
              color="bg-orange-500/10 text-orange-700"
            />
            <StatsCard
              icon={CheckCircle2}
              label="Traités"
              value={stats.traites}
              color="bg-green-500/10 text-green-700"
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
                  placeholder="Rechercher par nom, email, contenu..."
                  className="flex-1 h-full pr-4 border-none outline-none bg-transparent"
                  style={{ fontSize: '16px', fontWeight: 400 }}
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowStatusFilter(!showStatusFilter); setShowObjetFilter(false); }}
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
                      { value: 'nouveau', label: 'Nouveau' },
                      { value: 'lu', label: 'Lu' },
                      { value: 'traite', label: 'Traité' },
                      { value: 'archive', label: 'Archivé' },
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

              {/* Objet Filter */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowObjetFilter(!showObjetFilter); setShowStatusFilter(false); }}
                  className="h-11 flex items-center gap-2 px-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  <Mail className="w-5 h-5 text-neutral-600" />
                  <span className="text-neutral-700">
                    {filterObjet === 'tous' ? 'Tous les objets' : filterObjet}
                  </span>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {showObjetFilter && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => {
                        setFilterObjet('tous');
                        setShowObjetFilter(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors"
                    >
                      <span className={`text-sm ${
                        filterObjet === 'tous'
                          ? 'text-accent-yellow font-medium'
                          : 'text-neutral-700'
                      }`}>
                        Tous les objets
                      </span>
                    </button>
                    {OBJETS_MESSAGE.map(objet => (
                      <button
                        key={objet}
                        onClick={() => {
                          setFilterObjet(objet);
                          setShowObjetFilter(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors"
                      >
                        <span className={`text-sm ${
                          filterObjet === objet
                            ? 'text-accent-yellow font-medium'
                            : 'text-neutral-700'
                        }`}>
                          {objet}
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
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-xl p-20 text-center shadow-sm">
              <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Aucun message trouvé
              </h3>
              <p className="text-neutral-600">
                {searchQuery
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Les messages de contact apparaîtront ici'}
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
                          onClick={() => handleSort('nom_prenom')}
                          className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                        >
                          Nom & Prénom
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('objet')}
                          className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                        >
                          Objet
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                        Type org.
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
                      <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">
                        Détails
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {messages.map((msg) => (
                      <React.Fragment key={msg.id}>
                        <tr className={`hover:bg-neutral-50 transition-colors ${expandedRow === msg.id ? 'bg-neutral-50' : ''}`}>
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {formatDate(msg.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                              {msg.nom_prenom}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <a href={`mailto:${msg.email}`} className="text-sm text-primary hover:underline">
                              {msg.email}
                            </a>
                          </td>
                          <td className="px-6 py-4">
                            {getObjetBadge(msg.objet)}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {msg.type_organisation}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(msg.statut)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => setExpandedRow(expandedRow === msg.id ? null : msg.id)}
                                className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                                title="Voir les détails"
                                aria-label="Voir les détails"
                              >
                                {expandedRow === msg.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {expandedRow === msg.id && (
                          <tr>
                            <td colSpan={7} className="px-6 py-6 bg-neutral-50/50">
                              <div className="space-y-5 max-w-4xl">
                                {/* Contact Details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {msg.whatsapp_telephone && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Phone className="w-4 h-4 text-neutral-400" />
                                      <span className="text-neutral-600">WhatsApp:</span>
                                      <span className="text-neutral-900 font-medium">{msg.whatsapp_telephone}</span>
                                    </div>
                                  )}
                                  {msg.nom_organisation && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Building2 className="w-4 h-4 text-neutral-400" />
                                      <span className="text-neutral-600">Organisation:</span>
                                      <span className="text-neutral-900 font-medium">{msg.nom_organisation}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-neutral-400" />
                                    <span className="text-neutral-600">Reçu le:</span>
                                    <span className="text-neutral-900 font-medium">{formatDateTime(msg.created_at)}</span>
                                  </div>
                                </div>

                                {/* Full Message */}
                                <div>
                                  <h4 className="text-sm font-semibold text-neutral-700 mb-2">Message complet</h4>
                                  <div className="bg-white border border-neutral-200 rounded-lg p-4 text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
                                    {msg.message}
                                  </div>
                                </div>

                                {/* Admin Notes */}
                                <div>
                                  <h4 className="text-sm font-semibold text-neutral-700 mb-2">Notes administrateur</h4>
                                  <div className="flex gap-3">
                                    <textarea
                                      value={editingNotes[msg.id] ?? msg.notes_admin ?? ''}
                                      onChange={(e) => setEditingNotes(prev => ({ ...prev, [msg.id]: e.target.value }))}
                                      placeholder="Ajouter des notes internes..."
                                      rows={3}
                                      className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none text-sm"
                                    />
                                    <button
                                      onClick={() => handleSaveNotes(msg.id)}
                                      className="self-end px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                                      style={{ fontSize: '13px', fontWeight: 500 }}
                                    >
                                      <Save className="w-4 h-4" />
                                      Sauvegarder
                                    </button>
                                  </div>
                                </div>

                                {/* Status Actions */}
                                <div>
                                  <h4 className="text-sm font-semibold text-neutral-700 mb-2">Changer le statut</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {msg.statut !== 'lu' && (
                                      <button
                                        onClick={() => handleUpdateStatut(msg.id, 'lu')}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors flex items-center gap-1.5"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        Marquer comme lu
                                      </button>
                                    )}
                                    {msg.statut !== 'traite' && (
                                      <button
                                        onClick={() => handleUpdateStatut(msg.id, 'traite')}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors flex items-center gap-1.5"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Marquer comme traité
                                      </button>
                                    )}
                                    {msg.statut !== 'archive' && (
                                      <button
                                        onClick={() => handleUpdateStatut(msg.id, 'archive')}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 text-neutral-700 bg-neutral-50 hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
                                      >
                                        <Archive className="w-3.5 h-3.5" />
                                        Archiver
                                      </button>
                                    )}
                                    {msg.statut !== 'nouveau' && (
                                      <button
                                        onClick={() => handleUpdateStatut(msg.id, 'nouveau')}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                                      >
                                        <Inbox className="w-3.5 h-3.5" />
                                        Remettre en nouveau
                                      </button>
                                    )}
                                  </div>
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
          title="Exporter les messages"
          variant="buttons"
          filterOptions={[
            { id: 'all', label: 'Tous les messages' },
            { id: 'nouveau', label: 'Nouveaux' },
            { id: 'lu', label: 'Lus' },
            { id: 'traite', label: 'Traités' },
            { id: 'archive', label: 'Archivés' },
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

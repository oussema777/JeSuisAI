'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SidebarSuperadmin } from '../components/superadmin/Sidebarsuperadmin';
import { HeaderSuperadmin } from '../components/superadmin/HeaderSuperadmin';
import { 
  Users, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Mail,
  Phone,
  Globe,
  Building2,
  MoreVertical,
  Filter,
  Download,
  Loader2,
  AlertCircle,
  Shield,
  ArrowUpDown,
  X,
  Check
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { Pagination } from '../components/listing/Pagination';

interface PreInscription {
  id: string;
  created_at: string;
  organisation_type: string;
  organisation_name: string | null;
  nom: string;
  prenom: string;
  fonction: string;
  pays: string;
  whatsapp: string | null;
  email: string;
  message: string | null;
  statut: 'en_attente' | 'approuve' | 'rejete' | 'archive';
}

export default function GestionInscriptions() {
  const ITEMS_PER_PAGE = 20;
  const { supabase, loading: authLoading } = useAuth();
  const [data, setData] = useState<PreInscription[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<PreInscription | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterStatus]);

  const fetchInscriptions = useCallback(async () => {
    try {
      setLoading(true);

      const applyFilters = (q: any) => {
        if (filterStatus !== 'all') {
          q = q.eq('statut', filterStatus);
        }
        if (debouncedSearch) {
          q = q.or(`nom.ilike.%${debouncedSearch}%,prenom.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,organisation_name.ilike.%${debouncedSearch}%`);
        }
        return q;
      };

      // Count query
      const { count } = await applyFilters(
        supabase.from('pre_inscriptions').select('*', { count: 'exact', head: true })
      );
      setTotalCount(count || 0);

      // Paginated data query
      const { data: inscriptions, error } = await applyFilters(
        supabase.from('pre_inscriptions').select('*')
      )
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) {
        console.error('Supabase error fetching inscriptions:', error);
        throw new Error(error.message || 'Erreur Supabase inconnue');
      }
      setData((inscriptions as PreInscription[]) || []);
    } catch (error: any) {
      console.error('Error fetching inscriptions:', error?.message || error);
    } finally {
      setLoading(false);
    }
  }, [supabase, debouncedSearch, filterStatus, currentPage]);

  useEffect(() => {
    if (!authLoading) {
      fetchInscriptions();
    }
  }, [authLoading, fetchInscriptions]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setActionLoading(id);
      const { error } = await supabase
        .from('pre_inscriptions')
        .update({ statut: newStatus })
        .eq('id', id);

      if (error) throw error;

      setSelectedItem(null);
      fetchInscriptions();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const exportData = async () => {
    // Export fetches ALL data (no pagination) for the current filters
    const applyFilters = (q: any) => {
      if (filterStatus !== 'all') q = q.eq('statut', filterStatus);
      if (debouncedSearch) q = q.or(`nom.ilike.%${debouncedSearch}%,prenom.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,organisation_name.ilike.%${debouncedSearch}%`);
      return q;
    };
    const { data: allData } = await applyFilters(
      supabase.from('pre_inscriptions').select('*')
    ).order('created_at', { ascending: false });

    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(allData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inscriptions");
    XLSX.writeFile(workbook, `Inscriptions_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'approuve':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Approuvé</span>;
      case 'rejete':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">Rejeté</span>;
      case 'archive':
        return <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-bold uppercase tracking-wider">Archivé</span>;
      default:
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">En attente</span>;
    }
  };

  return (
    <div className="min-h-screen bg-page-bg flex">
      <SidebarSuperadmin activePage="inscriptions" />
      
      <main className="flex-1 ml-[260px] pb-8">
        <HeaderSuperadmin pageTitle="Gestion des Inscriptions" />
        
        <div className="p-8 mt-16 lg:mt-[72px]">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="mb-2 bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center gap-3 text-primary inline-flex">
                <Search className="w-4 h-4" />
                <p className="text-xs font-medium">Recherche rapide : CTRL + K</p>
              </div>
              <p className="text-neutral-600">
                Gérez et validez les demandes de pré-inscription des municipalités et organisations
              </p>
            </div>
            <button
              onClick={exportData}
              className="px-6 py-3 bg-white border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2 font-semibold shadow-sm"
            >
              <Download className="w-5 h-5" />
              <span>Exporter Excel</span>
            </button>
          </div>

          {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou organisation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-neutral-200 focus:border-primary outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-lg border-2 border-neutral-200 focus:border-primary outline-none bg-white font-medium"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="approuve">Approuvées</option>
              <option value="rejete">Rejetées</option>
              <option value="archive">Archivées</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase">Organisation</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase">Pays</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase">Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-neutral-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-neutral-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-40 bg-neutral-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-neutral-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-neutral-200 rounded-full" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-neutral-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-8 w-16 bg-neutral-200 rounded" /></td>
                    </tr>
                  ))}
                </>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 font-medium">
                    Aucune demande trouvée
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-neutral-900 font-bold text-sm">
                            {item.organisation_name || 'Personne physique'}
                          </p>
                          <p className="text-neutral-500 text-xs">{item.organisation_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-neutral-900 font-semibold text-sm">{item.prenom} {item.nom}</p>
                        <p className="text-neutral-500 text-xs">{item.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">{item.pays}</td>
                    <td className="px-6 py-4">{getStatusBadge(item.statut)}</td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {new Date(item.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-2 text-neutral-400 hover:text-primary transition-colors"
                        aria-label="Voir les détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-6">
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
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Détails de l'inscription">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-900">Détails de l'inscription</h3>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-neutral-100 rounded-full" aria-label="Fermer">
                <X className="w-6 h-6 text-neutral-400" />
              </button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Organisation</h4>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-neutral-900">{selectedItem.organisation_name || 'Personne physique'}</p>
                    <p className="text-sm text-primary font-semibold">{selectedItem.organisation_type}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Contact Principal</h4>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-neutral-900">{selectedItem.prenom} {selectedItem.nom}</p>
                    <p className="text-sm text-neutral-600">{selectedItem.fonction}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-neutral-400" />
                    <span className="text-sm font-medium">{selectedItem.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-neutral-400" />
                    <span className="text-sm font-medium">{selectedItem.whatsapp || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-neutral-400" />
                    <span className="text-sm font-medium">{selectedItem.pays}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-neutral-400" />
                    <span className="text-sm font-medium italic">Soumis le {new Date(selectedItem.created_at).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Message / Besoin</h4>
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 italic text-neutral-700 text-sm leading-relaxed">
                  {selectedItem.message || "Aucun message fourni."}
                </div>
              </div>
            </div>

            <div className="p-6 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedItem.id, 'archive')}
                  disabled={!!actionLoading}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900 font-bold text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  {actionLoading === selectedItem.id ? '...' : 'Archiver'}
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdateStatus(selectedItem.id, 'rejete')}
                  disabled={!!actionLoading}
                  className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {actionLoading === selectedItem.id ? 'Chargement...' : 'Rejeter'}
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedItem.id, 'approuve')}
                  disabled={!!actionLoading}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === selectedItem.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    'Approuver la demande'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
